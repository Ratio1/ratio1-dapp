import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { explorerUrl, mndContractAddress, ndContractAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { BigCard } from '@shared/BigCard';
import { round } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EthAddress, MNDLicense } from 'typedefs/blockchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

function Admin() {
    const { address } = useAccount();

    return (
        <div className="h-full">
            <div className="col h-full justify-between gap-3">
                <div className="col gap-3">
                    <CreateMnd />
                    <MndsTable />
                    <AddSigner />
                    <RemoveSigner />
                </div>
            </div>
        </div>
    );
}

function MndsTable() {
    type AdminMndView = Omit<MNDLicense, 'claimableEpochs' | 'isLinked'> & { owner: EthAddress };
    const [mnds, setMnds] = useState<AdminMndView[]>([]);

    const publicClient = usePublicClient();

    useEffect(() => {
        if (!publicClient) return;

        publicClient
            .readContract({
                address: mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'totalSupply',
            })
            .then(async (totalSupply) => {
                console.log(totalSupply);
                const mnds = await Promise.all(
                    Array.from({ length: Number(totalSupply) }).map((_, i) =>
                        Promise.all([
                            publicClient.readContract({
                                address: mndContractAddress,
                                abi: MNDContractAbi,
                                functionName: 'ownerOf',
                                args: [BigInt(i)],
                            }),
                            publicClient
                                .readContract({
                                    address: mndContractAddress,
                                    abi: MNDContractAbi,
                                    functionName: 'licenses',
                                    args: [BigInt(i)],
                                })
                                .then((result) => ({
                                    type: 'MND' as const,
                                    licenseId: BigInt(i),
                                    nodeAddress: result[0],
                                    totalAssignedAmount: result[1],
                                    totalClaimedAmount: result[2],
                                    lastClaimEpoch: result[3],
                                    assignTimestamp: result[4],
                                    lastClaimOracle: result[5],
                                    remainingAmount: result[1] - result[2],
                                    isBanned: false as const,
                                })),
                        ]).then(([owner, license]) => ({
                            ...license,
                            owner,
                        })),
                    ),
                );
                console.log(mnds);
                setMnds(mnds);
            });
    }, []);

    const getLicenseUsageStats = (license: AdminMndView) => (
        <div className="col gap-2">
            <div className="row justify-between text-sm font-medium leading-none">
                <div>
                    {fBI(license.totalClaimedAmount, 18)}/{fBI(license.totalAssignedAmount, 18)}
                </div>

                <div>{round(Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount), 1)}%</div>
            </div>

            <div className="flex h-1 overflow-hidden rounded-full bg-gray-300">
                <div
                    className="rounded-full bg-primary transition-all"
                    style={{ width: `${Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount)}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Minted MND</div>

            <div className="col gap-3">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">ID</th>
                            <th className="text-left">Owner</th>
                            <th className="text-left">Node Address</th>
                            <th className="text-left">Claimed/Assigned</th>
                            <th className="text-left">Last Claim Epoch</th>
                            <th className="text-left">Assigned</th>
                            <th className="text-left">Last Claim Oracle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mnds.map((license) => (
                            <tr
                                key={license.licenseId.toString()}
                                className="h-[50px] border-t transition-colors hover:bg-gray-200"
                            >
                                <td>{license.licenseId.toString()}</td>
                                <td>
                                    <a href={`${explorerUrl}/address/${license.owner}`} target="_blank" className="underline">
                                        {getShortAddress(license.owner)}
                                    </a>
                                </td>
                                <td>
                                    {license.nodeAddress !== '0x0000000000000000000000000000000000000000'
                                        ? getShortAddress(license.nodeAddress)
                                        : '-'}
                                </td>
                                <td>{getLicenseUsageStats(license)}</td>
                                <td>{license.lastClaimEpoch.toString()}</td>
                                <td>
                                    {license.assignTimestamp !== 0n
                                        ? new Date(Number(license.assignTimestamp) * 1000).toLocaleString()
                                        : '-'}
                                </td>
                                <td>
                                    {license.lastClaimOracle !== '0x0000000000000000000000000000000000000000'
                                        ? getShortAddress(license.lastClaimOracle)
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            {/*MND supply, R1 associated supply, R1 minted*/}
                            <td colSpan={2} className="font-bold">
                                Total MND supply: {mnds.length}
                            </td>
                            <td></td>
                            <td colSpan={3} className="font-bold">
                                $R1 associated supply:{' '}
                                {fBI(
                                    mnds.reduce((acc, mnd) => acc + mnd.totalAssignedAmount, 0n),
                                    18,
                                )}
                            </td>
                            <td colSpan={3} className="font-bold">
                                $R1 minted:{' '}
                                {fBI(
                                    mnds.reduce((acc, mnd) => acc + mnd.totalClaimedAmount, 0n),
                                    18,
                                )}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </BigCard>
    );
}

function CreateMnd() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [address, setAddress] = useState<string>('');
    const [tokens, setTokens] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onCreate = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'addLicense',
            args: [address as EthAddress, BigInt(tokens) * 10n ** 18n],
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Create new MND</div>

            <Input
                value={address}
                onValueChange={setAddress}
                size="md"
                classNames={{
                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                    input: 'font-medium',
                }}
                variant="bordered"
                color="primary"
                label="Receiver"
                labelPlacement="outside"
                placeholder="0x..."
                validate={(value) => {
                    if (!(value.startsWith('0x') && value.length === 42)) {
                        return 'Value must be a valid Ethereum address';
                    }

                    return null;
                }}
            />
            <Input
                value={tokens}
                onValueChange={(value) => {
                    const n = Number.parseInt(value);

                    if (value === '') {
                        setTokens('');
                    } else if (isFinite(n) && !isNaN(n) && n > 0) {
                        setTokens(n.toString());
                    }
                }}
                size="md"
                classNames={{
                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                    input: 'font-medium',
                }}
                variant="bordered"
                color="primary"
                label="Amount of tokens"
                labelPlacement="outside"
                placeholder="0"
            />

            <Button
                fullWidth
                color="primary"
                onPress={onCreate}
                isLoading={isLoading}
                isDisabled={isLoading || !address || !tokens || Number.parseInt(tokens) <= 0}
            >
                Create MND
            </Button>
        </BigCard>
    );
}

function AddSigner() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [address, setAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onAddNd = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'addSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    const onAddMnd = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: ndContractAddress,
            abi: NDContractAbi,
            functionName: 'addSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Add new signer</div>

            <Input
                value={address}
                onValueChange={setAddress}
                size="md"
                classNames={{
                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                    input: 'font-medium',
                }}
                variant="bordered"
                color="primary"
                label="Signer"
                labelPlacement="outside"
                placeholder="0x..."
            />

            <Button fullWidth color="primary" onPress={onAddNd} isLoading={isLoading} isDisabled={isLoading || !address}>
                Add Signer on ND
            </Button>
            <Button fullWidth color="primary" onPress={onAddMnd} isLoading={isLoading} isDisabled={isLoading || !address}>
                Add Signer on MND
            </Button>
        </BigCard>
    );
}

function RemoveSigner() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [address, setAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onRemoveNd = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'removeSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    const onRemoveMnd = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: ndContractAddress,
            abi: NDContractAbi,
            functionName: 'removeSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Remove existing signer</div>

            <Input
                value={address}
                onValueChange={setAddress}
                size="md"
                classNames={{
                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                    input: 'font-medium',
                }}
                variant="bordered"
                color="primary"
                label="Signer"
                labelPlacement="outside"
                placeholder="0x..."
            />

            <Button fullWidth color="primary" onPress={onRemoveNd} isLoading={isLoading} isDisabled={isLoading || !address}>
                Remove Signer on ND
            </Button>
            <Button fullWidth color="primary" onPress={onRemoveMnd} isLoading={isLoading} isDisabled={isLoading || !address}>
                Remove Signer on MND
            </Button>
        </BigCard>
    );
}

export default Admin;
