import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicClient } from 'viem';
import type { EthAddress, OraclesAvailabilityResult, OraclesDefaultResult } from 'typedefs/blockchain';
import { getMultiNodeEpochsRange } from './api/oracles';
import { getLicensesWithNodesAndRewards, type BaseGNDLicense, type BaseMNDLicense, type BaseNDLicense } from './licenses';

vi.mock('./api/oracles', () => ({ getMultiNodeEpochsRange: vi.fn() }));
const clock = vi.hoisted(() => ({ epoch: 100 }));
vi.mock('./config', () => ({ getCurrentEpoch: () => clock.epoch, config: { ndVestingEpochs: 10, mndCliffEpochs: 223 } }));

const batch = vi.mocked(getMultiNodeEpochsRange);
const address = (n: number): EthAddress => `0x${n.toString(16).padStart(40, '0')}`;
const license = (id: number, last = 100n): BaseNDLicense => ({
    type: 'ND', licenseId: BigInt(id), nodeAddress: address(id), totalClaimedAmount: 1n, remainingAmount: 999n,
    lastClaimEpoch: last, claimableEpochs: 1n, assignTimestamp: 1n, lastClaimOracle: address(99),
    totalAssignedAmount: 1000n, isBanned: false, usdcPoaiRewards: 0n, r1PoaiRewards: 0n,
});
const miningLicense = (type: 'GND' | 'MND', id: number, last: bigint, first: bigint): BaseMNDLicense | BaseGNDLicense => ({
    ...license(id, last), type, isBanned: false, firstMiningEpoch: first, awbBalance: 0n,
});
const signed = (node: EthAddress): OraclesAvailabilityResult => ({
    node, node_alias: 'local fixture', node_eth_address: node, node_is_online: true,
    epochs: [99], epochs_vals: [255], from_epoch: 99, to_epoch: 99, packed_availabilities: '0xff',
    eth_signed_data: { input: [], signature_field: 'eth_signature' }, eth_signatures: [`0x${'01'.repeat(65)}`],
    eth_addresses: [address(99)],
});
const result = (rows: Record<EthAddress, OraclesAvailabilityResult>) => rows as Record<EthAddress, OraclesAvailabilityResult> & OraclesDefaultResult;
const readContract = vi.fn();
const client = { readContract } as unknown as PublicClient;
const linked = (inputs: (BaseNDLicense | BaseMNDLicense | BaseGNDLicense)[]) =>
    getLicensesWithNodesAndRewards(inputs, client).map((row) => {
        if (!row.isLinked) throw new Error('Expected a linked fixture');
        return row;
    });

beforeEach(() => { vi.resetAllMocks(); clock.epoch = 100; });

describe('licence rewards and signed claim inputs', () => {
    it('returns proven ND, MND and GND zero while all 16 licences share one pending batch', async () => {
        batch.mockReturnValue(new Promise(() => {}));
        const cases = [miningLicense('MND', 1, 100n, 10n), miningLicense('GND', 2, 90n, 101n),
            { ...license(3, 95n), totalClaimedAmount: 1000n }, ...Array.from({ length: 13 }, (_, i) => license(i + 4))];
        const rows = linked(cases);
        expect(await Promise.all(rows.map((row) => row.rewards))).toEqual(Array(16).fill(0n));
        expect(await rows[0].rewardsBreakdown).toEqual({ rewardsAmount: 0n, carryoverAmount: 0n, withheldAmount: 0n });
        expect(batch).toHaveBeenCalledTimes(1);
        expect(Object.keys(batch.mock.calls[0][0])).toHaveLength(16);
        expect(readContract).not.toHaveBeenCalled();
    });

    it('requests the exact genesis mining range before the MND cliff', async () => {
        clock.epoch = 6;
        const node = address(1);
        const genesis = miningLicense('GND', 1, 0n, 1n);
        batch.mockResolvedValue(result({ [node]: { ...signed(node), from_epoch: 1, to_epoch: 5,
            epochs: [1, 2, 3, 4, 5], epochs_vals: Array(5).fill(255), packed_availabilities: '0xffffffffff' } }));
        readContract.mockResolvedValue([{ rewardsAmount: 5n, carryoverAmount: 0n, withheldAmount: 0n }]);
        const [row] = linked([genesis]);
        expect(batch).toHaveBeenCalledWith({ [node]: [1, 5] });
        await expect(row.rewards).resolves.toBe(5n);
    });

    it('settles remaining AWB separately from the fully mined allocation', async () => {
        const waiting = { ...miningLicense('MND', 2, 99n, 20n), totalClaimedAmount: 1000n, awbBalance: 8n };
        const exhausted = { ...miningLicense('GND', 3, 99n, 1n), totalClaimedAmount: 1000n, awbBalance: 0n };
        batch.mockResolvedValue(result({ [address(2)]: signed(address(2)) }));
        readContract.mockResolvedValue([{ rewardsAmount: 0n, carryoverAmount: 8n, withheldAmount: 0n }]);
        const [carryover, zero] = linked([waiting, exhausted]);
        await expect(carryover.rewards).resolves.toBe(8n);
        await expect(zero.rewards).resolves.toBe(0n);
        await expect(zero.ethSignatures).rejects.toThrow();  // Displaying a zero never supplies claim credentials.
        expect(readContract).toHaveBeenCalledTimes(1);
    });

    it('retains claim errors and mixed-wallet behavior during an outage', async () => {
        batch.mockRejectedValue(new Error('oracle unavailable'));
        const [claimed, pending] = linked([license(1), license(2, 99n)]);
        await expect(claimed.rewards).resolves.toBe(0n);
        await expect(claimed.ethSignatures).rejects.toThrow('oracle unavailable');
        await expect(pending.rewards).rejects.toThrow('oracle unavailable');
        expect(batch).toHaveBeenCalledTimes(1);
    });

    it('preserves signed inputs and contract amounts on a healthy mixed wallet', async () => {
        const details = { rewardsAmount: 7n, carryoverAmount: 2n, withheldAmount: 5n };
        readContract.mockResolvedValue([details]);
        batch.mockResolvedValue(result(Object.fromEntries([1, 2, 3].map((i) => [address(i), signed(address(i))]))));
        const rows = linked([license(1, 99n), miningLicense('MND', 2, 99n, 2n), miningLicense('GND', 3, 99n, 2n)]);
        expect(await Promise.all(rows.map((row) => row.rewards))).toEqual([100n, 9n, 9n]);
        expect(await rows[1].rewardsBreakdown).toEqual(details);
        expect(await rows[0].ethSignatures).toEqual(signed(address(1)).eth_signatures);
        expect(await rows[0].packedAvailabilities).toBe('0xff');
        expect(readContract).toHaveBeenCalledTimes(2);
    });

    it.each([
        { error: 'unknown node' }, { eth_signatures: [] }, { epochs: [] }, { epochs_vals: [] },
        { to_epoch: 101 }, { node_eth_address: address(9) }, { packed_availabilities: '0x00' },
    ])('rejects a partial row and preserves the valid sibling', async (partial) => {
        batch.mockResolvedValue(result({
            [address(1)]: { ...signed(address(1)), ...partial } as OraclesAvailabilityResult,
            [address(2)]: signed(address(2)),
        }));
        const [unavailable, healthy] = linked([license(1, 99n), license(2, 99n)]);
        await expect(unavailable.rewards).rejects.toThrow();
        await expect(unavailable.ethSignatures).rejects.toThrow();
        await expect(unavailable.alias).resolves.toBe('local fixture');
        await expect(healthy.rewards).resolves.toBe(100n);
    });
});
