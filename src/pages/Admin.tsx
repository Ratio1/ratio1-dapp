import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { explorerUrl, mndContractAddress, ndContractAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/table';
import { BigCard } from '@shared/BigCard';
import { LargeValueWithLabel } from '@shared/LargeValueWithLabel';
import { round } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EthAddress, MNDLicense } from 'typedefs/blockchain';
import { usePublicClient, useWalletClient } from 'wagmi';

const columns = [
    { key: 1, label: 'ID' },
    { key: 2, label: 'Owner' },
    { key: 3, label: 'Node Address' },
    { key: 4, label: 'Claimed/Assigned' },
    { key: 5, label: 'Last Claim Epoch' },
    { key: 6, label: 'Assigned' },
    { key: 7, label: 'Last Claim Oracle' },
];

function Admin() {
    return (
        <div className="col gap-4">
            <CreateMnd />
            <MndsTable />
            <AddSigner />
            <RemoveSigner />
        </div>
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

            <div className="flex flex-col gap-4 larger:flex-row">
                <Input
                    value={address}
                    onValueChange={setAddress}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
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
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Amount of tokens"
                    labelPlacement="outside"
                    placeholder="0"
                />
            </div>

            <div className="flex-start flex">
                <div className="flex">
                    <Button
                        fullWidth
                        color="primary"
                        onPress={onCreate}
                        isLoading={isLoading}
                        isDisabled={isLoading || !address || !tokens || Number.parseInt(tokens) <= 0}
                    >
                        Create MND
                    </Button>
                </div>
            </div>
        </BigCard>
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

            <div className="col flex w-full justify-between gap-8 lg:flex-row">
                <LargeValueWithLabel label="Total MND supply" value={mnds.length.toString()} isCompact />

                <LargeValueWithLabel
                    label="$R1 associated supply"
                    value={fBI(
                        mnds.reduce((acc, mnd) => acc + mnd.totalAssignedAmount, 0n),
                        18,
                    )}
                    isCompact
                />

                <LargeValueWithLabel
                    label="$R1 minted"
                    value={fBI(
                        mnds.reduce((acc, mnd) => acc + mnd.totalClaimedAmount, 0n),
                        18,
                    )}
                    isCompact
                />
            </div>

            <div className="rounded-xl border border-[#e3e4e</div>8] bg-light p-3">
                <Table
                    aria-label="MNDs Table"
                    classNames={{
                        th: 'bg-lightBlue text-body text-[13px]',
                    }}
                    removeWrapper
                >
                    <TableHeader columns={columns}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={mnds}>
                        {(license) => (
                            <TableRow key={license.licenseId}>
                                <TableCell>{license.licenseId.toString()}</TableCell>
                                <TableCell>
                                    <a href={`${explorerUrl}/address/${license.owner}`} target="_blank" className="underline">
                                        {getShortAddress(license.owner)}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    {license.nodeAddress !== '0x0000000000000000000000000000000000000000'
                                        ? getShortAddress(license.nodeAddress)
                                        : '-'}
                                </TableCell>
                                <TableCell>{getLicenseUsageStats(license)}</TableCell>
                                <TableCell>{license.lastClaimEpoch.toString()}</TableCell>
                                <TableCell>
                                    {license.assignTimestamp !== 0n
                                        ? new Date(Number(license.assignTimestamp) * 1000).toLocaleString()
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    {license.lastClaimOracle !== '0x0000000000000000000000000000000000000000'
                                        ? getShortAddress(license.lastClaimOracle)
                                        : '-'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* <div className="col gap-3">
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
            </div> */}
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

            <div className="flex flex-col gap-6 larger:flex-row larger:items-end larger:gap-4">
                <Input
                    value={address}
                    onValueChange={setAddress}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Signer"
                    labelPlacement="outside"
                    placeholder="0x..."
                />

                <div className="row justify-start gap-4">
                    <div className="flex">
                        <Button
                            fullWidth
                            color="secondary"
                            onPress={onAddNd}
                            isLoading={isLoading}
                            isDisabled={isLoading || !address}
                        >
                            Add to ND
                        </Button>
                    </div>

                    <div className="flex">
                        <Button
                            fullWidth
                            color="primary"
                            onPress={onAddMnd}
                            isLoading={isLoading}
                            isDisabled={isLoading || !address}
                        >
                            Add to MND
                        </Button>
                    </div>
                </div>
            </div>
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

            <div className="flex flex-col gap-6 larger:flex-row larger:items-end larger:gap-4">
                <Input
                    value={address}
                    onValueChange={setAddress}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Signer"
                    labelPlacement="outside"
                    placeholder="0x..."
                />

                <div className="row justify-start gap-4">
                    <div className="flex">
                        <Button
                            fullWidth
                            color="secondary"
                            onPress={onRemoveNd}
                            isLoading={isLoading}
                            isDisabled={isLoading || !address}
                        >
                            Remove from ND
                        </Button>
                    </div>

                    <div className="flex">
                        <Button
                            fullWidth
                            color="primary"
                            onPress={onRemoveMnd}
                            isLoading={isLoading}
                            isDisabled={isLoading || !address}
                        >
                            Remove from MND
                        </Button>
                    </div>
                </div>
            </div>
        </BigCard>
    );
}

export default Admin;
