// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import type { License } from 'typedefs/blockchain';
import { LicenseCardNode } from './LicenseCardNode';

vi.mock('@lib/config', () => ({ getR1ExplorerUrl: () => 'https://explorer.invalid' }));
vi.mock('@lib/utils', () => ({ getShortAddressOrHash: (value: string) => value }));
vi.mock('@lib/api/oracles', () => ({ getNodeInfo: vi.fn(() => { throw new Error('unexpected per-card request'); }) }));
import { getNodeInfo } from '@lib/api/oracles';

afterEach(cleanup);

it('observes each new wallet batch, shows unavailable on failure, and retries only with the next batch', async () => {
    const license = (alias: Promise<string>, online: Promise<boolean>): License => ({
        type: 'ND', isLinked: true, alias, isOnline: online, nodeAddress: '0x123', licenseId: 1n, isBanned: false,
        totalAssignedAmount: 10n, totalClaimedAmount: 10n, remainingAmount: 0n, lastClaimEpoch: 10n,
        claimableEpochs: 0n, assignTimestamp: 1n, lastClaimOracle: '0x456', usdcPoaiRewards: 0n, r1PoaiRewards: 0n,
        rewards: Promise.resolve(0n), epochs: Promise.resolve([9]), epochsAvailabilities: Promise.resolve([255]),
        fromEpoch: Promise.resolve(9), toEpoch: Promise.resolve(9), packedAvailabilities: Promise.resolve('0xff'),
        ethSignatures: Promise.resolve([]),
    });
    const view = (row: License) => <MemoryRouter><LicenseCardNode license={row} /></MemoryRouter>;
    const el = render(view(license(Promise.resolve('first node'), Promise.resolve(false))));
    await screen.findByText('first node');
    el.rerender(view(license(Promise.reject(new Error('offline')), Promise.reject(new Error('offline')))));
    await screen.findByText('Node name unavailable');
    el.rerender(view(license(Promise.resolve('recovered'), Promise.resolve(true))));
    await screen.findByText('recovered');
    expect(getNodeInfo).not.toHaveBeenCalled();
});
