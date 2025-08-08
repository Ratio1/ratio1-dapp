import { ControllerAbi } from '@blockchain/Controller';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { ReaderAbi } from '@blockchain/Reader';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { newSellerCode, sendBatchNews } from '@lib/api/backend';
import { getNodeInfo } from '@lib/api/oracles';
import { config, getR1ExplorerUrl } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI, getShortAddress, isZeroAddress } from '@lib/utils';
import { BigCard } from '@shared/BigCard';
import { LargeValueWithLabel } from '@shared/LargeValueWithLabel';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EthAddress, MNDLicense } from 'typedefs/blockchain';
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

type AdminMndView = Omit<MNDLicense, 'claimableEpochs' | 'isLinked'> & { owner: EthAddress };
type OracleDetails = {
    oracleAddress: EthAddress;
    signaturesCount: bigint;
    additionTimestamp: bigint;
    node_alias: string;
    node_is_online: boolean;
};

function Admin() {
    const publicClient = usePublicClient();

    const [oracles, setOracles] = useState<OracleDetails[]>([]);
    const [mnds, setMnds] = useState<(AdminMndView | null)[]>([]);

    const fetchData = () => {
        if (!publicClient) return;

        publicClient
            .readContract({
                address: config.readerContractAddress,
                abi: ReaderAbi,
                functionName: 'getOraclesDetails',
            })
            .then((result) => {
                Promise.all(
                    result.map(async (oracle) => {
                        return {
                            ...oracle,
                            ...(await getNodeInfo(oracle.oracleAddress)),
                        };
                    }),
                ).then((oraclesInfo) => {
                    setOracles(oraclesInfo);
                });
            });

        publicClient
            .readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'totalSupply',
            })
            .then(async (totalSupply) => {
                const mnds: (AdminMndView | null)[] = [];

                let i = 1;
                while (mnds.filter((mnd) => mnd !== null).length < Number(totalSupply)) {
                    const fetchedLicense = await Promise.all([
                        publicClient.readContract({
                            address: config.mndContractAddress,
                            abi: MNDContractAbi,
                            functionName: 'ownerOf',
                            args: [BigInt(i)],
                        }),
                        publicClient
                            .readContract({
                                address: config.mndContractAddress,
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
                                firstMiningEpoch: result[3],
                                lastClaimEpoch: result[4],
                                assignTimestamp: result[5],
                                lastClaimOracle: result[6],
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
                        });

                    mnds.push(fetchedLicense);
                    i++;
                }
                console.log({ mnds });
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
            <AddOracle oracles={oracles} fetchData={fetchData} />
            <RemoveOracle oracles={oracles} fetchData={fetchData} />
            <OraclesTable oracles={oracles} />
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
                        mnds
                            .filter((mnd) => mnd?.licenseId !== 1n)
                            .reduce((acc, mnd) => acc + (mnd?.totalClaimedAmount ?? 0n), 0n),
                        18,
                    )}
                    isCompact
                />
            </div>

            <div className="rounded-xl border border-[#e3e4e</div>8] bg-light p-3">
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
                                            {getShortAddress(license.owner)}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {!isZeroAddress(license.nodeAddress) ? getShortAddress(license.nodeAddress) : '-'}
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

function AddOracle({ oracles, fetchData }: { oracles: OracleDetails[]; fetchData: () => void }) {
    const { watchTx } = useBlockchainContext() as BlockchainContextType;

    const [address, setAddress] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const onAdd = async () => {
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.controllerContractAddress,
            abi: ControllerAbi,
            functionName: 'addOracle',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);
        fetchData();

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Add new oracle</div>

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
        if (!walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setIsLoading(true);

        const txHash = await walletClient.writeContract({
            address: config.controllerContractAddress,
            abi: ControllerAbi,
            functionName: 'removeOracle',
            args: [address as EthAddress],
        });

        await watchTx(txHash, publicClient);
        fetchData();

        setIsLoading(false);
    };

    return (
        <BigCard>
            <div className="text-base font-semibold leading-6 lg:text-xl">Remove existing oracle</div>

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
            <div className="text-base font-semibold leading-6 lg:text-xl">Oracles</div>

            <div className="rounded-xl border border-[#e3e4e</div>8] bg-light p-3">
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
            <div className="text-base font-semibold leading-6 lg:text-xl">Create new referral code</div>

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
            <div className="text-base font-semibold leading-6 lg:text-xl">Send Batch News</div>

            <div className="flex flex-col gap-6 larger:flex-row larger:items-end larger:gap-4">
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
                    <label className="text-sm font-medium text-foreground">HTML File</label>
                    <input
                        type="file"
                        accept=".html,.htm"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
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
