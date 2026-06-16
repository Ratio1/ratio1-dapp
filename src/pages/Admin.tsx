import { ControllerAbi } from '@blockchain/Controller';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { PoAIContractAbi } from '@blockchain/PoAIContract';
import { ReaderAbi } from '@blockchain/Reader';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { getPublicProfiles, newSellerCode, sendBatchNews } from '@lib/api/backend';
import { getContractErrorMessage, simulateAndWriteContract } from '@lib/blockchain/contract-write';
import { getMultiNodeEpochsRange, getNodeInfo } from '@lib/api/oracles';
import { config, getCurrentEpoch, getR1ExplorerUrl } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI, getShortAddressOrHash, isZeroAddress } from '@lib/utils';
import { BigCard } from '@shared/BigCard';
import { CopyableValue } from '@shared/CopyableValue';
import { LargeValueWithLabel } from '@shared/LargeValueWithLabel';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiUser } from 'react-icons/hi';
import { EthAddress, MNDLicense } from 'typedefs/blockchain';
import { isAddress } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

const columnsMndsTable = [
    { key: 1, label: 'ID' },
    { key: 2, label: 'Owner' },
    { key: 3, label: 'Node Address' },
    { key: 4, label: 'Claimed/Assigned' },
    { key: 5, label: 'Last Claim Epoch' },
    { key: 6, label: 'Assigned' },
    { key: 7, label: 'Last Claim Oracle' },
];

const columnsOraclesTable = [
    { key: 1, label: 'Node Alias' },
    { key: 2, label: 'Node Address' },
    { key: 3, label: 'Signatures' },
    { key: 4, label: 'Days Added' },
    { key: 5, label: 'Signatures per Day' },
];

const columnsCspsTable = [
    { key: 1, label: 'Identity' },
    { key: 2, label: 'Owner Address' },
    { key: 3, label: 'Escrow Address' },
    { key: 4, label: 'USDC TVL' },
    { key: 5, label: 'Active Jobs' },
    { key: 6, label: 'CSP Tier' },
];

const cspEscrowOwnerTransferErrorMessages = [
    {
        pattern: /InvalidCspOwner/i,
        message: 'Both CSP owner addresses must be valid non-zero addresses.',
    },
    {
        pattern: /SameCspOwner/i,
        message: 'The current and new CSP owners must be different addresses.',
    },
    {
        pattern: /CspEscrowDoesNotExist/i,
        message: 'The current owner does not have a CSP escrow.',
    },
    {
        pattern: /AddressAlreadyOwnsEscrow/i,
        message: 'The new owner already owns a CSP escrow.',
    },
    {
        pattern: /AddressDelegatedToAnotherEscrow/i,
        message: 'The new owner is already delegated to another CSP escrow.',
    },
    {
        pattern: /EscrowOwnerMismatch/i,
        message: 'The escrow owner on-chain does not match the selected current owner.',
    },
];

type AdminMndView = Omit<MNDLicense, 'claimableEpochs' | 'isLinked'> & { owner: EthAddress };
type OracleDetails = {
    oracleAddress: EthAddress;
    signaturesCount: bigint;
    additionTimestamp: bigint;
    node_alias: string;
    node_is_online: boolean;
};
type AdminCspView = {
    escrowAddress: EthAddress;
    owner: EthAddress;
    tvl: bigint;
    activeJobsCount: bigint;
    tier: number;
    name?: string;
};

function Admin() {
    const publicClient = usePublicClient();

    const [oracles, setOracles] = useState<OracleDetails[]>([]);
    const [mnds, setMnds] = useState<(AdminMndView | null)[]>([]);
    const [csps, setCsps] = useState<AdminCspView[]>([]);

    const fetchData = () => {
        if (!publicClient) return;

        publicClient
            .readContract({
                address: config.readerContractAddress,
                abi: ReaderAbi,
                functionName: 'getOraclesDetails',
            })
            .then(async (result) => {
                const currentEpoch = getCurrentEpoch();
                const nodesWithRanges = result.reduce(
                    (acc, oracle) => {
                        acc[oracle.oracleAddress] = [currentEpoch - 1, currentEpoch - 1];
                        return acc;
                    },
                    {} as Record<EthAddress, [number, number]>,
                );
                const allNodesInfo = await getMultiNodeEpochsRange(nodesWithRanges);
                setOracles(
                    result.map((oracle) => ({
                        ...oracle,
                        ...allNodesInfo[oracle.oracleAddress],
                    })),
                );
            });

        publicClient
            .readContract({
                address: config.readerContractAddress,
                abi: ReaderAbi,
                functionName: 'getAllMndsDetails',
            })
            .then((result) => {
                setMnds(
                    result.map((mnd) => ({
                        ...mnd,
                        type: 'MND' as const,
                        isBanned: false as const,
                        awbBalance: 0n, // Not correct, but not needed in admin view, at least for now
                    })),
                );
            });

        publicClient
            .readContract({
                address: config.readerContractAddress,
                abi: ReaderAbi,
                functionName: 'getAllEscrowsDetails',
            })
            .then(async (result) => {
                const publicProfiles = await getPublicProfiles(result.map((csp) => csp.owner)).catch(() => ({ brands: [] }));

                setCsps(
                    result.map((csp) => ({
                        ...csp,
                        tier: Number(csp.cspTier),
                        name: publicProfiles.brands.find(
                            (profile) => profile.brandAddress.toLowerCase() === csp.owner.toLowerCase(),
                        )?.name,
                    })),
                );
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="col gap-4">
            <CreateMnd mnds={mnds} fetchData={fetchData} />
            <MndsTable mnds={mnds} />
            <AddOracle oracles={oracles} fetchData={fetchData} />
            <RemoveOracle oracles={oracles} fetchData={fetchData} />
            <OraclesTable oracles={oracles} />
            <CspsTable csps={csps} fetchData={fetchData} />
            <InitiateCspEscrowOwnerTransfer />
            <AllowMndTransfer />
            <AllowMndBurn />
            <AddSellerCode />
            <SendBatchNews />
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
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const txHash = await simulateAndWriteContract({
                publicClient,
                walletClient,
                parameters: {
                    address: config.mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'addLicense',
                    args: [address as EthAddress, BigInt(tokens) * 10n ** 18n],
                },
            });

            await watchTx(txHash, publicClient);
            fetchData();
        } catch (error) {
            toast.error(getContractErrorMessage(error, 'Could not create the MND license. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Create new MND</div>

            <div className="larger:flex-row flex flex-col gap-4">
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
                        if (!(value.startsWith('0x') && value.length === 42 && isAddress(value))) {
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
            <div className="row justify-between text-sm leading-none font-medium">
                <div>
                    {fBI(license.totalClaimedAmount, 18)}/{fBI(license.totalAssignedAmount, 18)}
                </div>

                <div>
                    {parseFloat(((Number(license.totalClaimedAmount) / Number(license.totalAssignedAmount)) * 100).toFixed(2))}%
                </div>
            </div>

            <div className="flex h-1 overflow-hidden rounded-full bg-gray-300">
                <div
                    className="bg-primary rounded-full transition-all"
                    style={{ width: `${Number((license.totalClaimedAmount * 100n) / license.totalAssignedAmount)}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Minted MND</div>

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
                        mnds
                            .filter((mnd) => mnd?.licenseId !== 1n)
                            .reduce((acc, mnd) => acc + (mnd?.totalClaimedAmount ?? 0n), 0n),
                        18,
                    )}
                    isCompact
                />
            </div>

            <div className="bg-light rounded-xl border border-[#e3e4e</div>8] p-3">
                <Table
                    aria-label="MNDs Table"
                    classNames={{
                        th: 'bg-slate-100 text-body text-[13px]',
                    }}
                    removeWrapper
                >
                    <TableHeader columns={columnsMndsTable}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={mnds}>
                        {(license) =>
                            license ? (
                                <TableRow key={license.licenseId}>
                                    <TableCell>{license.licenseId.toString()}</TableCell>
                                    <TableCell>
                                        <a
                                            href={`${getR1ExplorerUrl()}/account/${license.owner}`}
                                            target="_blank"
                                            className="underline"
                                        >
                                            {getShortAddressOrHash(license.owner)}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {!isZeroAddress(license.nodeAddress) ? getShortAddressOrHash(license.nodeAddress) : '-'}
                                    </TableCell>
                                    <TableCell>{getLicenseUsageStats(license)}</TableCell>
                                    <TableCell>{license.lastClaimEpoch.toString()}</TableCell>
                                    <TableCell>
                                        {license.assignTimestamp !== 0n
                                            ? new Date(Number(license.assignTimestamp) * 1000).toLocaleString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {!isZeroAddress(license.lastClaimOracle)
                                            ? getShortAddressOrHash(license.lastClaimOracle)
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

function AddOracle({ oracles, fetchData }: { oracles: OracleDetails[]; fetchData: () => void }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [address, setAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onAdd = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const txHash = await simulateAndWriteContract({
                publicClient,
                walletClient,
                parameters: {
                    address: config.controllerContractAddress,
                    abi: ControllerAbi,
                    functionName: 'addOracle',
                    args: [address as EthAddress],
                },
            });

            await watchTx(txHash, publicClient);
            fetchData();
        } catch (error) {
            toast.error(getContractErrorMessage(error, 'Could not add this oracle. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Add new oracle</div>

            <div className="larger:flex-row larger:items-end larger:gap-4 flex flex-col gap-6">
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
                    label="Oracle"
                    labelPlacement="outside"
                    placeholder="0x..."
                />

                <div className="row justify-start gap-4">
                    <div className="flex">
                        <Button
                            fullWidth
                            color="secondary"
                            onPress={onAdd}
                            isLoading={isLoading}
                            isDisabled={
                                isLoading ||
                                !address ||
                                oracles.map((oracle) => oracle.oracleAddress).includes(address as EthAddress)
                            }
                        >
                            {!oracles.map((oracle) => oracle.oracleAddress).includes(address as EthAddress) ? 'Add' : 'Added'}
                        </Button>
                    </div>
                </div>
            </div>
        </BigCard>
    );
}

function RemoveOracle({ oracles, fetchData }: { oracles: OracleDetails[]; fetchData: () => void }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [address, setAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onRemove = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const txHash = await simulateAndWriteContract({
                publicClient,
                walletClient,
                parameters: {
                    address: config.controllerContractAddress,
                    abi: ControllerAbi,
                    functionName: 'removeOracle',
                    args: [address as EthAddress],
                },
            });

            await watchTx(txHash, publicClient);
            fetchData();
        } catch (error) {
            toast.error(getContractErrorMessage(error, 'Could not remove this oracle. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Remove existing oracle</div>

            <div className="larger:flex-row larger:items-end larger:gap-4 flex flex-col gap-6">
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
                    label="Oracle"
                    labelPlacement="outside"
                    placeholder="0x..."
                />

                <div className="row justify-start gap-4">
                    <div className="flex">
                        <Button
                            fullWidth
                            color="secondary"
                            onPress={onRemove}
                            isLoading={isLoading}
                            isDisabled={
                                isLoading ||
                                !address ||
                                !oracles.map((oracle) => oracle.oracleAddress).includes(address as EthAddress)
                            }
                        >
                            {oracles.map((oracle) => oracle.oracleAddress).includes(address as EthAddress)
                                ? 'Remove'
                                : 'Not an oracle'}
                        </Button>
                    </div>
                </div>
            </div>
        </BigCard>
    );
}

function OraclesTable({ oracles }: { oracles: OracleDetails[] }) {
    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Oracles</div>

            <div className="bg-light rounded-xl border border-[#e3e4e</div>8] p-3">
                <Table
                    aria-label="MNDs Table"
                    classNames={{
                        th: 'bg-slate-100 text-body text-[13px]',
                    }}
                    removeWrapper
                >
                    <TableHeader columns={columnsOraclesTable}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={oracles}>
                        {(oracle) => {
                            const timeAdded = Date.now() - Number(oracle.additionTimestamp) * 1000;
                            const daysAdded = Number((timeAdded / (1000 * 60 * 60 * 24)).toFixed(2));
                            const signaturesPerDay = Number((Number(oracle.signaturesCount) / daysAdded).toFixed(2));

                            return (
                                <TableRow key={oracle.oracleAddress}>
                                    <TableCell>{oracle.node_alias}</TableCell>
                                    <TableCell>
                                        <a
                                            href={`${getR1ExplorerUrl()}/node/${oracle.oracleAddress}`}
                                            target="_blank"
                                            className="underline"
                                        >
                                            {oracle.oracleAddress}
                                        </a>
                                    </TableCell>
                                    <TableCell>{oracle.signaturesCount.toString()}</TableCell>
                                    <TableCell>{daysAdded} days</TableCell>
                                    <TableCell>{signaturesPerDay} sig/day</TableCell>
                                </TableRow>
                            );
                        }}
                    </TableBody>
                </Table>
            </div>
        </BigCard>
    );
}

export function CspsTable({ csps, fetchData }: { csps: AdminCspView[]; fetchData: () => void }) {
    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">CSP Escrows</div>

            <div className="bg-light overflow-x-auto rounded-xl border border-[#e3e4e8] p-3">
                <Table
                    aria-label="CSP Escrows Table"
                    classNames={{
                        table: 'min-w-[980px]',
                        th: 'bg-slate-100 text-body text-[13px]',
                    }}
                    removeWrapper
                >
                    <TableHeader columns={columnsCspsTable}>
                        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                    </TableHeader>
                    <TableBody items={csps}>
                        {(csp) => (
                            <TableRow key={csp.escrowAddress}>
                                <TableCell>
                                    <CspIdentity csp={csp} />
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={`${getR1ExplorerUrl()}/account/${csp.owner}`}
                                        target="_blank"
                                        className="underline"
                                    >
                                        <CopyableValue value={csp.owner} />
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <CopyableValue value={csp.escrowAddress} />
                                </TableCell>
                                <TableCell>{fBI(csp.tvl, 6)} USDC</TableCell>
                                <TableCell>{csp.activeJobsCount.toString()}</TableCell>
                                <TableCell>
                                    <CspTierEditor csp={csp} fetchData={fetchData} />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </BigCard>
    );
}

function CspIdentity({ csp }: { csp: AdminCspView }) {
    const [imageError, setImageError] = useState<boolean>(false);
    const label = csp.name || getShortAddressOrHash(csp.owner, 4, true);

    return (
        <a href={`${getR1ExplorerUrl()}/account/${csp.owner}`} target="_blank" className="row w-max gap-2 hover:opacity-75">
            <div className="center-all relative h-8 w-8 min-w-8 overflow-hidden rounded-[37.5%] bg-slate-200 text-xl text-white">
                {!imageError ? (
                    <img
                        src={`${config.backendUrl}/branding/get-brand-logo?address=${csp.owner}`}
                        alt=""
                        className="h-full w-full object-cover object-center"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <HiUser />
                )}
            </div>

            <div className="max-w-[180px] overflow-hidden font-medium text-ellipsis whitespace-nowrap">{label}</div>
        </a>
    );
}

function CspTierEditor({ csp, fetchData }: { csp: AdminCspView; fetchData: () => void }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [tier, setTier] = useState<string>(csp.tier.toString());
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const parsedTier = Number.parseInt(tier);
    const isValidTier = tier !== '' && isFinite(parsedTier) && !isNaN(parsedTier) && parsedTier >= 0 && parsedTier <= 255;

    useEffect(() => {
        setTier(csp.tier.toString());
    }, [csp.tier]);

    const onSave = async () => {
        if (!walletClient || !publicClient || !isValidTier) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const txHash = await simulateAndWriteContract({
                publicClient,
                walletClient,
                parameters: {
                    address: config.poaiManagerContractAddress,
                    abi: PoAIContractAbi,
                    functionName: 'setCspTier',
                    args: [csp.owner, parsedTier],
                },
            });

            await watchTx(txHash, publicClient);
            fetchData();
        } catch (error) {
            toast.error(getContractErrorMessage(error, 'Could not update this CSP tier. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="row min-w-[172px] gap-2">
            <Input
                value={tier}
                onValueChange={(value) => {
                    const n = Number.parseInt(value);

                    if (value === '') {
                        setTier('');
                    } else if (isFinite(n) && !isNaN(n) && n >= 0 && n <= 255) {
                        setTier(n.toString());
                    }
                }}
                size="sm"
                classNames={{
                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                    input: 'font-medium',
                }}
                variant="bordered"
                color="primary"
                placeholder="0"
            />

            <Button
                size="sm"
                color="secondary"
                onPress={onSave}
                isLoading={isLoading}
                isDisabled={isLoading || !isValidTier || parsedTier === csp.tier}
            >
                Save
            </Button>
        </div>
    );
}

export function InitiateCspEscrowOwnerTransfer() {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [oldOwner, setOldOwner] = useState<string>('');
    const [newOwner, setNewOwner] = useState<string>('');
    const [oldOwnerEscrow, setOldOwnerEscrow] = useState<EthAddress | null>(null);
    const [newOwnerEscrow, setNewOwnerEscrow] = useState<EthAddress | null>(null);
    const [pendingReceiver, setPendingReceiver] = useState<EthAddress | null>(null);
    const [isLoadingOldOwnerDetails, setIsLoadingOldOwnerDetails] = useState<boolean>(false);
    const [isLoadingNewOwnerEscrow, setIsLoadingNewOwnerEscrow] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const isValidOldOwner = isAddress(oldOwner);
    const isValidNewOwner = isAddress(newOwner);
    const oldOwnerHasEscrow = !!oldOwnerEscrow && !isZeroAddress(oldOwnerEscrow);
    const newOwnerAlreadyOwnsEscrow = !!newOwnerEscrow && !isZeroAddress(newOwnerEscrow);
    const isSameOwner = isValidOldOwner && isValidNewOwner && oldOwner.toLowerCase() === newOwner.toLowerCase();
    const hasPendingReceiver = !!pendingReceiver && !isZeroAddress(pendingReceiver);
    const canInitiate =
        isValidOldOwner &&
        isValidNewOwner &&
        oldOwnerHasEscrow &&
        !newOwnerAlreadyOwnsEscrow &&
        !isSameOwner &&
        !isLoadingOldOwnerDetails &&
        !isLoadingNewOwnerEscrow &&
        !isLoading;

    useEffect(() => {
        if (!publicClient || !isAddress(oldOwner)) {
            setOldOwnerEscrow(null);
            setPendingReceiver(null);
            return;
        }

        let ignore = false;

        setIsLoadingOldOwnerDetails(true);
        Promise.all([
            publicClient.readContract({
                address: config.poaiManagerContractAddress,
                abi: PoAIContractAbi,
                functionName: 'ownerToEscrow',
                args: [oldOwner as EthAddress],
            }),
            publicClient.readContract({
                address: config.poaiManagerContractAddress,
                abi: PoAIContractAbi,
                functionName: 'initiatedCspOwnerTransferReceiver',
                args: [oldOwner as EthAddress],
            }),
        ])
            .then(([escrow, receiver]) => {
                if (!ignore) {
                    setOldOwnerEscrow(escrow);
                    setPendingReceiver(receiver);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setOldOwnerEscrow(null);
                    setPendingReceiver(null);
                }
            })
            .finally(() => {
                if (!ignore) {
                    setIsLoadingOldOwnerDetails(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [oldOwner, publicClient]);

    useEffect(() => {
        if (!publicClient || !isAddress(newOwner)) {
            setNewOwnerEscrow(null);
            return;
        }

        let ignore = false;

        setIsLoadingNewOwnerEscrow(true);
        publicClient
            .readContract({
                address: config.poaiManagerContractAddress,
                abi: PoAIContractAbi,
                functionName: 'ownerToEscrow',
                args: [newOwner as EthAddress],
            })
            .then((escrow) => {
                if (!ignore) {
                    setNewOwnerEscrow(escrow);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setNewOwnerEscrow(null);
                }
            })
            .finally(() => {
                if (!ignore) {
                    setIsLoadingNewOwnerEscrow(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [newOwner, publicClient]);

    const onInitiate = async () => {
        if (!walletClient || !publicClient || !canInitiate) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const txHash = await simulateAndWriteContract({
                publicClient,
                walletClient,
                parameters: {
                    address: config.poaiManagerContractAddress,
                    abi: PoAIContractAbi,
                    functionName: 'initiateCspEscrowOwnerTransfer',
                    args: [oldOwner as EthAddress, newOwner as EthAddress],
                },
            });

            await watchTx(txHash, publicClient);
            setPendingReceiver(newOwner as EthAddress);
        } catch (error) {
            toast.error(
                getContractErrorMessage(
                    error,
                    'Could not initiate this CSP escrow owner transfer. Please try again.',
                    cspEscrowOwnerTransferErrorMessages,
                ),
            );
        } finally {
            setIsLoading(false);
        }
    };

    const validateOldOwner = (value: string) => {
        if (!value) return null;
        if (!isAddress(value)) return 'Value must be a valid Ethereum address';
        if (!isLoadingOldOwnerDetails && oldOwnerEscrow && isZeroAddress(oldOwnerEscrow)) {
            return 'This address does not own a CSP escrow';
        }

        return null;
    };

    const validateNewOwner = (value: string) => {
        if (!value) return null;
        if (!isAddress(value)) return 'Value must be a valid Ethereum address';
        if (isValidOldOwner && value.toLowerCase() === oldOwner.toLowerCase()) {
            return 'Value must be different from the current owner';
        }
        if (!isLoadingNewOwnerEscrow && newOwnerAlreadyOwnsEscrow) {
            return 'This address already owns a CSP escrow';
        }

        return null;
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Initiate CSP Escrow Owner Transfer</div>

            <div className="larger:flex-row larger:items-end larger:gap-4 flex flex-col gap-6">
                <Input
                    value={oldOwner}
                    onValueChange={setOldOwner}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Current owner"
                    labelPlacement="outside"
                    placeholder="0x..."
                    validate={validateOldOwner}
                />
                <Input
                    value={newOwner}
                    onValueChange={setNewOwner}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="New owner"
                    labelPlacement="outside"
                    placeholder="0x..."
                    validate={validateNewOwner}
                />

                <div className="flex">
                    <Button fullWidth color="secondary" onPress={onInitiate} isLoading={isLoading} isDisabled={!canInitiate}>
                        {hasPendingReceiver ? 'Update Transfer' : 'Initiate Transfer'}
                    </Button>
                </div>
            </div>

            {(oldOwnerHasEscrow || isLoadingOldOwnerDetails || hasPendingReceiver) && (
                <div className="col gap-2 text-sm">
                    {isLoadingOldOwnerDetails ? (
                        <div className="text-slate-500">Checking current owner...</div>
                    ) : (
                        oldOwnerHasEscrow && (
                            <div className="row justify-start gap-2">
                                <span className="text-slate-500">Escrow</span>
                                <CopyableValue value={oldOwnerEscrow} />
                            </div>
                        )
                    )}
                    {hasPendingReceiver && (
                        <div className="row justify-start gap-2">
                            <span className="text-slate-500">Pending receiver</span>
                            <CopyableValue value={pendingReceiver} />
                        </div>
                    )}
                </div>
            )}
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
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const txHash = await simulateAndWriteContract({
                publicClient,
                walletClient,
                parameters: {
                    address: config.mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'initiateTransfer',
                    args: [sender as EthAddress, receiver as EthAddress],
                },
            });

            await watchTx(txHash, publicClient);
        } catch (error) {
            toast.error(getContractErrorMessage(error, 'Could not allow this MND transfer. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Allow MND Transfer</div>

            <div className="larger:flex-row larger:items-end larger:gap-4 flex flex-col gap-6">
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
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const txHash = await simulateAndWriteContract({
                publicClient,
                walletClient,
                parameters: {
                    address: config.mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'initiateBurn',
                    args: [sender as EthAddress],
                },
            });

            await watchTx(txHash, publicClient);
        } catch (error) {
            toast.error(getContractErrorMessage(error, 'Could not allow this MND burn. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Allow MND Burn</div>

            <div className="larger:flex-row larger:items-end larger:gap-4 flex flex-col gap-6">
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

function AddSellerCode() {
    const [address, setAddress] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onAdd = async () => {
        setIsLoading(true);

        await newSellerCode({ address, forcedCode: code || undefined });

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Create new referral code</div>

            <div className="larger:flex-row larger:items-end larger:gap-4 flex flex-col gap-6">
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
                    label="Address"
                    labelPlacement="outside"
                    placeholder="0x..."
                />
                <Input
                    value={code}
                    onValueChange={setCode}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Code (optional)"
                    labelPlacement="outside"
                    placeholder="ABC123"
                />

                <div className="flex">
                    <Button
                        fullWidth
                        color="secondary"
                        onPress={onAdd}
                        isLoading={isLoading}
                        isDisabled={isLoading || !address}
                    >
                        Create
                    </Button>
                </div>
            </div>
        </BigCard>
    );
}

function SendBatchNews() {
    const [subject, setSubject] = useState<string>('');
    const [newsFile, setNewsFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onSend = async () => {
        if (!newsFile) {
            toast.error('Please select an HTML file');
            return;
        }

        if (!subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        setIsLoading(true);

        try {
            await sendBatchNews({
                news: newsFile,
                subject: subject.trim(),
            });

            toast.success('Batch news sent successfully');
            setSubject('');
            setNewsFile(null);
        } catch (error) {
            toast.error('Failed to send batch news');
            console.error('Error sending batch news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/html') {
            setNewsFile(file);
        } else if (file) {
            toast.error('Please select an HTML file');
            event.target.value = '';
        }
    };

    return (
        <BigCard>
            <div className="text-base leading-6 font-semibold lg:text-xl">Send Batch News</div>

            <div className="larger:flex-row larger:items-end larger:gap-4 flex flex-col gap-6">
                <Input
                    value={subject}
                    onValueChange={setSubject}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    variant="bordered"
                    color="primary"
                    label="Subject"
                    labelPlacement="outside"
                    placeholder="Email subject"
                />

                <div className="flex flex-col gap-2">
                    <label className="text-foreground text-sm font-medium">HTML File</label>
                    <input
                        type="file"
                        accept=".html,.htm"
                        onChange={handleFileChange}
                        className="file:bg-primary hover:file:bg-primary/90 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                    />
                    {newsFile && <p className="text-xs text-gray-600">Selected: {newsFile.name}</p>}
                </div>

                <div className="flex">
                    <Button
                        fullWidth
                        color="secondary"
                        onPress={onSend}
                        isLoading={isLoading}
                        isDisabled={isLoading || !subject.trim() || !newsFile}
                    >
                        Send Batch News
                    </Button>
                </div>
            </div>
        </BigCard>
    );
}

export default Admin;
