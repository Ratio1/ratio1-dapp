import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI, getShortAddress } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/table';
import { BigCard } from '@shared/BigCard';
import { LargeValueWithLabel } from '@shared/LargeValueWithLabel';
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

type AdminMndView = Omit<MNDLicense, 'claimableEpochs' | 'isLinked'> & { owner: EthAddress };

function Admin() {
    const publicClient = usePublicClient();

    const [ndSigners, setNdSigners] = useState<EthAddress[]>([]);
    const [mndSigners, setMndSigners] = useState<EthAddress[]>([]);
    const [mnds, setMnds] = useState<(AdminMndView | null)[]>([]);

    const fetchData = () => {
        if (!publicClient) return;

        publicClient
            .readContract({
                address: config.ndContractAddress,
                abi: NDContractAbi,
                functionName: 'getSigners',
            })
            .then((result) => {
                setNdSigners([...result]);
            });

        publicClient
            .readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'getSigners',
            })
            .then((result) => {
                setMndSigners([...result]);
            });

        publicClient
            .readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'totalSupply',
            })
            .then(async (totalSupply) => {
                const mnds = await Promise.all(
                    Array.from({ length: Number(totalSupply) }).map((_, i) =>
                        Promise.all([
                            publicClient.readContract({
                                address: config.mndContractAddress,
                                abi: MNDContractAbi,
                                functionName: 'ownerOf',
                                args: [BigInt(i + 1)],
                            }),
                            publicClient
                                .readContract({
                                    address: config.mndContractAddress,
                                    abi: MNDContractAbi,
                                    functionName: 'licenses',
                                    args: [BigInt(i + 1)],
                                })
                                .then((result) => ({
                                    type: 'MND' as const,
                                    licenseId: BigInt(i + 1),
                                    nodeAddress: result[0],
                                    totalAssignedAmount: result[1],
                                    totalClaimedAmount: result[2],
                                    lastClaimEpoch: result[3],
                                    assignTimestamp: result[4],
                                    lastClaimOracle: result[5],
                                    remainingAmount: result[1] - result[2],
                                    isBanned: false as const,
                                })),
                        ])
                            .then(([owner, license]) => ({
                                ...license,
                                owner,
                            }))
                            .catch(() => {
                                return null;
                            }),
                    ),
                );
                console.log(mnds);
                setMnds(mnds);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="col gap-4">
            <CreateMnd mnds={mnds} fetchData={fetchData} />
            <MndsTable mnds={mnds} />
            <AddSigner ndSigners={ndSigners} mndSigners={mndSigners} fetchData={fetchData} />
            <RemoveSigner ndSigners={ndSigners} mndSigners={mndSigners} fetchData={fetchData} />
            <AllowMndTransfer />
            <AllowMndBurn />
        </div>
    );
}

function CreateMnd({ mnds, fetchData }: { mnds: (AdminMndView | null)[]; fetchData: () => void }) {
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
            address: config.mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'addLicense',
            args: [address as EthAddress, BigInt(tokens) * 10n ** 18n],
        });

        await watchTx(txHash, publicClient);
        fetchData();

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
                        if (mnds.some((mnd) => mnd?.owner === value)) {
                            return 'Address already has a MND';
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
                        isDisabled={
                            isLoading ||
                            !address ||
                            !tokens ||
                            Number.parseInt(tokens) <= 0 ||
                            mnds.some((mnd) => mnd?.owner === address)
                        }
                    >
                        Create MND
                    </Button>
                </div>
            </div>
        </BigCard>
    );
}

function MndsTable({ mnds }: { mnds: (AdminMndView | null)[] }) {
    const [totalAssignedAmount, setTotalAssignedAmount] = useState<bigint>(0n);

    const publicClient = usePublicClient();

    useEffect(() => {
        if (!publicClient) return;

        publicClient
            .readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'totalLicensesAssignedTokensAmount',
            })
            .then(setTotalAssignedAmount);
    }, []);

    const getLicenseUsageStats = (license: AdminMndView) => (
        <div className="col gap-2">
            <div className="row justify-between text-sm font-medium leading-none">
                <div>
                    {fBI(license.totalClaimedAmount, 18)}/{fBI(license.totalAssignedAmount, 18)}
                </div>

                <div>
                    {parseFloat(((Number(license.totalClaimedAmount) / Number(license.totalAssignedAmount)) * 100).toFixed(2))}%
                </div>
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
                <LargeValueWithLabel
                    label="Total MND supply"
                    value={mnds.filter((mnd) => mnd !== null).length.toString()}
                    isCompact
                />

                <LargeValueWithLabel label="$R1 assigned supply" value={fBI(totalAssignedAmount, 18)} isCompact />

                <LargeValueWithLabel
                    label="$R1 minted"
                    value={fBI(
                        mnds.reduce((acc, mnd) => acc + (mnd?.totalClaimedAmount ?? 0n), 0n),
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
                        {(license) =>
                            license ? (
                                <TableRow key={license.licenseId}>
                                    <TableCell>{license.licenseId.toString()}</TableCell>
                                    <TableCell>
                                        <a
                                            href={`${config.explorerUrl}/address/${license.owner}`}
                                            target="_blank"
                                            className="underline"
                                        >
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
                            ) : (
                                <TableRow key={Math.random().toString()}>
                                    <TableCell colSpan={7}>Burned NFT</TableCell>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
            </div>
        </BigCard>
    );
}

function AddSigner({
    ndSigners,
    mndSigners,
    fetchData,
}: {
    ndSigners: EthAddress[];
    mndSigners: EthAddress[];
    fetchData: () => void;
}) {
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
            address: config.mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'addSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);
        fetchData();

        setIsLoading(false);
    };

    const onAddMnd = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.ndContractAddress,
            abi: NDContractAbi,
            functionName: 'addSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);
        fetchData();

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
                            isDisabled={isLoading || !address || ndSigners.includes(address as EthAddress)}
                        >
                            {!ndSigners.includes(address as EthAddress) ? 'Add to ND' : 'Added to ND'}
                        </Button>
                    </div>

                    <div className="flex">
                        <Button
                            fullWidth
                            color="primary"
                            onPress={onAddMnd}
                            isLoading={isLoading}
                            isDisabled={isLoading || !address || mndSigners.includes(address as EthAddress)}
                        >
                            {!mndSigners.includes(address as EthAddress) ? 'Add to MND' : 'Added to MND'}
                        </Button>
                    </div>
                </div>
            </div>
        </BigCard>
    );
}

function RemoveSigner({
    ndSigners,
    mndSigners,
    fetchData,
}: {
    ndSigners: EthAddress[];
    mndSigners: EthAddress[];
    fetchData: () => void;
}) {
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
            address: config.mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'removeSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);
        fetchData();

        setIsLoading(false);
    };

    const onRemoveMnd = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.ndContractAddress,
            abi: NDContractAbi,
            functionName: 'removeSigner',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);
        fetchData();

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
                            isDisabled={isLoading || !address || !ndSigners.includes(address as EthAddress)}
                        >
                            {ndSigners.includes(address as EthAddress) ? 'Remove from ND' : 'Not ND signer'}
                        </Button>
                    </div>

                    <div className="flex">
                        <Button
                            fullWidth
                            color="primary"
                            onPress={onRemoveMnd}
                            isLoading={isLoading}
                            isDisabled={isLoading || !address || !mndSigners.includes(address as EthAddress)}
                        >
                            {mndSigners.includes(address as EthAddress) ? 'Remove from MND' : 'Not MND signer'}
                        </Button>
                    </div>
                </div>
            </div>
        </BigCard>
    );
}

function AllowMndTransfer() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [sender, setSender] = useState<string>('');
    const [receiver, setReceiver] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onAllow = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'initiateTransfer',
            args: [sender as EthAddress, receiver as EthAddress],
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Allow MND Transfer</div>

            <div className="flex flex-col gap-6 larger:flex-row larger:items-end larger:gap-4">
                <Input
                    value={sender}
                    onValueChange={setSender}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Sender"
                    labelPlacement="outside"
                    placeholder="0x..."
                />
                <Input
                    value={receiver}
                    onValueChange={setReceiver}
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
                />

                <div className="flex">
                    <Button
                        fullWidth
                        color="secondary"
                        onPress={onAllow}
                        isLoading={isLoading}
                        isDisabled={isLoading || !sender || !receiver}
                    >
                        Allow Transfer
                    </Button>
                </div>
            </div>
        </BigCard>
    );
}

function AllowMndBurn() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [sender, setSender] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onAllow = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'initiateBurn',
            args: [sender as EthAddress],
        });

        await watchTx(txHash, publicClient);

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Allow MND Burn</div>

            <div className="flex flex-col gap-6 larger:flex-row larger:items-end larger:gap-4">
                <Input
                    value={sender}
                    onValueChange={setSender}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Sender"
                    labelPlacement="outside"
                    placeholder="0x..."
                />

                <div className="flex">
                    <Button
                        fullWidth
                        color="secondary"
                        onPress={onAllow}
                        isLoading={isLoading}
                        isDisabled={isLoading || !sender}
                    >
                        Allow Burn
                    </Button>
                </div>
            </div>
        </BigCard>
    );
}

export default Admin;
