import { ReaderAbi } from '@blockchain/Reader';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { config, environment } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { fBI } from '@lib/utils';
import { DetailedAlert } from '@shared/DetailedAlert';
import { ApplicationStatus } from '@typedefs/profile';
import { addDays } from 'date-fns';
import { ChangeEvent, DragEvent, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiFileUploadLine, RiShieldUserLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { EthAddress, License } from 'typedefs/blockchain';
import { getAddress, isAddress } from 'viem';
import { usePublicClient } from 'wagmi';

export type BulkLinkAssignment = {
    license: License;
    nodeAddress: EthAddress;
    nodeName?: string;
};

type BulkLinkValidationResult = {
    assignments: BulkLinkAssignment[];
    errors: string[];
    warnings: string[];
    parsedAddresses: EthAddress[];
    remainingAddresses: EthAddress[];
};

type BulkLinkModalRef = {
    trigger: () => void;
};

interface Props {
    licenses: License[];
    linkedNodeAddresses: EthAddress[];
    onBulkLink: (assignments: BulkLinkAssignment[]) => Promise<void>;
}

type Step = 'upload' | 'review';

const MAX_ISSUES_TO_SHOW = 6;

type CsvNodeRow = {
    address: string;
    nodeName?: string;
};

type NormalizedNodeRow = {
    address: EthAddress;
    nodeName?: string;
};

const LicenseBulkLinkModal = forwardRef<BulkLinkModalRef, Props>(({ licenses, linkedNodeAddresses, onBulkLink }, ref) => {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const publicClient = usePublicClient();

    const { fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { account } = useAuthenticationContext() as AuthenticationContextType;

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [step, setStep] = useState<Step>('upload');
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const [fileName, setFileName] = useState<string>('');
    const [assignments, setAssignments] = useState<BulkLinkAssignment[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [parsedAddresses, setParsedAddresses] = useState<EthAddress[]>([]);
    const [remainingAddresses, setRemainingAddresses] = useState<EthAddress[]>([]);

    const eligibleLicenses = useMemo(
        () =>
            licenses
                .filter(
                    (license) =>
                        license.type === 'ND' &&
                        !license.isLinked &&
                        addDays(new Date(Number(license.assignTimestamp) * 1000), 1) <= new Date(),
                )
                .sort((a, b) => {
                    if (a.licenseId === b.licenseId) {
                        return 0;
                    }

                    return a.totalClaimedAmount < b.totalClaimedAmount ? -1 : 1;
                }),
        [licenses],
    );

    const linkedNodeAddressSet = useMemo(
        () => new Set(linkedNodeAddresses.map((address) => address.toLowerCase())),
        [linkedNodeAddresses],
    );

    const canLink =
        !!account &&
        (account.kycStatus === ApplicationStatus.Approved || environment !== 'mainnet') &&
        eligibleLicenses.length > 0;

    const resetState = () => {
        setStep('upload');
        setIsParsing(false);
        setIsSubmitting(false);
        setIsDragging(false);
        setFileName('');
        setAssignments([]);
        setErrors([]);
        setWarnings([]);
        setParsedAddresses([]);
        setRemainingAddresses([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const trigger = () => {
        resetState();
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    const onModalClose = () => {
        onClose();
        resetState();
    };

    const parseCsvRow = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];

            if (char === '"') {
                const nextChar = line[i + 1];

                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if ((char === ',' || char === ';') && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result.map((value) => value.replace(/\r/g, '').trim());
    };

    const extractAddressesFromCsv = (text: string): { rows: CsvNodeRow[]; errors: string[] } => {
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length < 2) {
            return {
                rows: [],
                errors: ['CSV appears to be empty or missing data rows.'],
            };
        }

        const header = parseCsvRow(lines[0]).map((column) => column.toLowerCase());

        let ethAddressIndex = header.findIndex((column) => column === 'eth_address');
        if (ethAddressIndex === -1) {
            ethAddressIndex = header.findIndex((column) => column.includes('eth') && column.includes('address'));
        }

        if (ethAddressIndex === -1) {
            return {
                rows: [],
                errors: ['Could not find an ETH address column (expected something like ETH_Address).'],
            };
        }

        let nodeNameIndex = header.findIndex((column) => column === 'node_name');
        if (nodeNameIndex === -1) {
            nodeNameIndex = header.findIndex((column) => column.includes('name'));
        }

        const rows = lines.slice(1).map((line) => {
            const row = parseCsvRow(line);
            const address = row[ethAddressIndex]?.trim() ?? '';
            const nodeName = nodeNameIndex >= 0 ? row[nodeNameIndex]?.trim() : undefined;

            return {
                address,
                nodeName: nodeName && nodeName.length > 0 ? nodeName : undefined,
            };
        });

        return {
            rows: rows.filter((row) => row.address.length > 0),
            errors: [],
        };
    };

    const validateAndAssign = async (rows: CsvNodeRow[]): Promise<BulkLinkValidationResult> => {
        const validationErrors: string[] = [];
        const validationWarnings: string[] = [];

        if (!publicClient) {
            validationErrors.push('Wallet not ready. Please try again.');
            return {
                assignments: [],
                errors: validationErrors,
                warnings: validationWarnings,
                parsedAddresses: [],
                remainingAddresses: [],
            };
        }

        const normalizedRows: NormalizedNodeRow[] = [];
        const invalidAddresses: string[] = [];

        rows.forEach(({ address, nodeName }) => {
            if (!isAddress(address)) {
                invalidAddresses.push(address);
                return;
            }

            try {
                normalizedRows.push({
                    address: getAddress(address),
                    nodeName,
                });
            } catch (error) {
                invalidAddresses.push(address);
            }
        });

        const normalizedAddresses: EthAddress[] = normalizedRows.map((row) => row.address);

        if (invalidAddresses.length > 0) {
            validationErrors.push(
                `Found ${invalidAddresses.length} invalid address${invalidAddresses.length > 1 ? 'es' : ''} in the CSV.`,
            );
        }

        const duplicates = normalizedAddresses.filter((address, index, list) => list.indexOf(address) !== index);
        const uniqueDuplicates = Array.from(new Set(duplicates));

        if (uniqueDuplicates.length > 0) {
            validationErrors.push(
                `Found ${uniqueDuplicates.length} duplicate address${uniqueDuplicates.length > 1 ? 'es' : ''} in the CSV.`,
            );
        }

        const alreadyLinkedLocally = normalizedAddresses.filter((address) => linkedNodeAddressSet.has(address.toLowerCase()));
        const uniqueAlreadyLinkedLocally = Array.from(new Set(alreadyLinkedLocally));
        const locallyLinkedSet = new Set(uniqueAlreadyLinkedLocally.map((address) => address.toLowerCase()));

        if (uniqueAlreadyLinkedLocally.length > 0) {
            validationWarnings.push(
                `${uniqueAlreadyLinkedLocally.length} address${uniqueAlreadyLinkedLocally.length > 1 ? 'es are' : ' is'} already linked to one of your licenses and the link will not be changed.`,
            );
        }

        const addressesToCheckOnChain = normalizedAddresses.filter((address) => !locallyLinkedSet.has(address.toLowerCase()));

        const isLinkedResults = await publicClient.readContract({
            address: config.readerContractAddress,
            abi: ReaderAbi,
            functionName: 'isMultiNodeAlreadyLinked',
            args: [addressesToCheckOnChain],
        });
        const alreadyLinkedOnChain = addressesToCheckOnChain.filter((address, index) => isLinkedResults[index]);

        const uniqueAlreadyLinkedOnChain = Array.from(new Set(alreadyLinkedOnChain));

        if (uniqueAlreadyLinkedOnChain.length > 0) {
            validationWarnings.push(
                `${uniqueAlreadyLinkedOnChain.length} address${uniqueAlreadyLinkedOnChain.length > 1 ? 'es are' : ' is'} already linked on-chain.`,
            );
        }

        if (eligibleLicenses.length === 0) {
            validationErrors.push('You do not have any unlinked ND licenses available.');
        }

        const usableRows = normalizedRows.filter(
            ({ address }) =>
                !uniqueDuplicates.includes(address) &&
                !uniqueAlreadyLinkedLocally.includes(address) &&
                !uniqueAlreadyLinkedOnChain.includes(address),
        );

        if (usableRows.length === 0) {
            validationErrors.push('No usable addresses were found after validation.');
        }

        const countToAssign = Math.min(usableRows.length, eligibleLicenses.length);

        const computedAssignments: BulkLinkAssignment[] = Array.from({ length: countToAssign }).map((_, index) => ({
            license: eligibleLicenses[index],
            nodeAddress: usableRows[index].address,
            nodeName: usableRows[index].nodeName,
        }));

        const unassignedAddresses = usableRows.slice(countToAssign).map((row) => row.address);

        if (usableRows.length > eligibleLicenses.length) {
            validationWarnings.push(
                `There are more valid node addresses (${usableRows.length}) than unlinked licenses (${eligibleLicenses.length}). Extra addresses will not be linked.`,
            );
        }

        return {
            assignments: computedAssignments,
            errors: validationErrors,
            warnings: validationWarnings,
            parsedAddresses: normalizedAddresses,
            remainingAddresses: unassignedAddresses,
        };
    };

    const handleFile = async (file?: File) => {
        if (!file) {
            return;
        }

        const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
        if (!isCsv) {
            toast.error('Please upload a CSV file.');
            return;
        }

        setIsParsing(true);
        setFileName(file.name);
        setErrors([]);
        setWarnings([]);
        setAssignments([]);
        setParsedAddresses([]);
        setRemainingAddresses([]);

        try {
            const text = await file.text();
            const { rows, errors: extractionErrors } = extractAddressesFromCsv(text);

            if (extractionErrors.length > 0) {
                setErrors(extractionErrors);
                return;
            }

            const result = await validateAndAssign(rows);

            setAssignments(result.assignments);
            setErrors(result.errors);
            setWarnings(result.warnings);
            setParsedAddresses(result.parsedAddresses);
            setRemainingAddresses(result.remainingAddresses);

            if (result.assignments.length > 0 && result.errors.length === 0) {
                setStep('review');
            }
        } catch (error) {
            toast.error('An error occurred while processing the file. Please try again.');
        } finally {
            setIsParsing(false);
        }
    };

    const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        await handleFile(file);

        // Allow selecting the same file twice in a row.
        event.target.value = '';
    };

    const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!canLink || isParsing) {
            return;
        }
        setIsDragging(true);
    };

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!canLink || isParsing) {
            return;
        }
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const onDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (!canLink || isParsing) {
            return;
        }

        const file = event.dataTransfer.files?.[0];
        await handleFile(file);
    };

    const onConfirm = async () => {
        if (assignments.length === 0) {
            toast.error('No assignments available.');
            return;
        }

        setIsSubmitting(true);
        await onBulkLink(assignments);
        setIsSubmitting(false);
    };

    const renderIssues = (issues: string[], color: 'danger' | 'warning') => {
        if (issues.length === 0) {
            return null;
        }

        const issuesToShow = issues.slice(0, MAX_ISSUES_TO_SHOW);
        const hiddenCount = issues.length - issuesToShow.length;

        return (
            <Alert
                color={color}
                classNames={{
                    base: 'items-start',
                }}
                title={<div className="font-medium">{color === 'danger' ? 'Validation issues found' : 'Please review'}</div>}
            >
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    {issuesToShow.map((issue) => (
                        <li key={issue}>{issue}</li>
                    ))}
                </ul>
                {hiddenCount > 0 && (
                    <div className="pt-1 text-xs text-slate-500">
                        +{hiddenCount} more issue{hiddenCount > 1 ? 's' : ''}
                    </div>
                )}
            </Alert>
        );
    };

    const renderUploadStep = () => {
        const dropzoneClassName = [
            'rounded-xl border border-dashed p-6 transition-colors',
            canLink && !isParsing ? 'cursor-pointer' : 'cursor-not-allowed opacity-70',
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50',
        ].join(' ');

        return (
            <div className="col gap-4">
                <DetailedAlert
                    icon={<RiFileUploadLine />}
                    title="Upload node addresses CSV"
                    description={
                        <div>
                            Upload a CSV that contains an ETH address column (for example:{' '}
                            <span className="font-medium">ETH_Address</span>). You can use the exported CSV from r1setup.
                        </div>
                    }
                />

                <div
                    className={dropzoneClassName}
                    onClick={() => {
                        if (canLink && !isParsing) {
                            fileInputRef.current?.click();
                        }
                    }}
                    onDragEnter={onDragEnter}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (!canLink || isParsing) {
                            return;
                        }
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            fileInputRef.current?.click();
                        }
                    }}
                >
                    <div className="col items-center gap-3 text-center">
                        <RiFileUploadLine className="text-3xl text-slate-500" />
                        <div className="text-base font-medium text-slate-700">Drag and drop your CSV here</div>
                        <div className="text-sm text-slate-600">or click to choose a file</div>
                        <div className="text-xs text-slate-500">Accepted format: .csv</div>

                        {fileName && <div className="pt-1 text-sm font-medium text-slate-700">{fileName}</div>}
                    </div>

                    <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} />
                </div>

                {isParsing && (
                    <div className="center-all py-2">
                        <Spinner size="sm" />
                    </div>
                )}

                {renderIssues(errors, 'danger')}
                {renderIssues(warnings, 'warning')}

                {!isParsing && parsedAddresses.length > 0 && errors.length === 0 && (
                    <Alert
                        color="primary"
                        classNames={{
                            base: 'items-start',
                        }}
                        title={<div className="font-medium">CSV ready</div>}
                    >
                        <div className="text-sm">
                            Parsed {parsedAddresses.length} address{parsedAddresses.length > 1 ? 'es' : ''}.{' '}
                            {assignments.length} will be linked.
                        </div>
                    </Alert>
                )}
            </div>
        );
    };

    const getLicenseUsageStats = (license: License) => (
        <div className="text-sm leading-none font-medium">
            {fBI(license.totalClaimedAmount, 18)}/{fBI(license.totalAssignedAmount, 18)}
            &nbsp; ({parseFloat(((Number(license.totalClaimedAmount) / Number(license.totalAssignedAmount)) * 100).toFixed(2))}
            %)
        </div>
    );

    const renderAssignmentsTable = () => (
        <div className="col gap-2">
            <div className="text-sm font-medium text-slate-700">Planned links ({assignments.length})</div>
            <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[520px] divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-3 py-2.5 text-left font-medium">License</th>
                            <th className="px-3 py-2.5 text-left font-medium">Usage</th>
                            <th className="px-3 py-2.5 text-left font-medium">Node</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {assignments.map(({ license, nodeAddress, nodeName }) => (
                            <tr key={`${license.type}-${license.licenseId.toString()}-${nodeAddress}`}>
                                <td className="px-3 py-2.5 font-medium">#{Number(license.licenseId)}</td>
                                <td className="px-3 py-2.5">{getLicenseUsageStats(license)}</td>
                                <td className="px-3 py-2.5">
                                    {nodeName && <span className="font-medium">{nodeName}</span>}
                                    <span className="font-mono text-xs text-slate-700">
                                        {nodeName ? ' - ' : ''}
                                        {nodeAddress}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReviewStep = () => (
        <div className="col gap-4">
            {renderIssues(warnings, 'warning')}

            <Alert
                color="primary"
                classNames={{
                    base: 'items-start',
                }}
                title={<div className="font-medium">Review assignments before signing</div>}
            >
                <div className="text-sm">
                    We will link node addresses to unlinked <span className="font-medium">ND</span> licenses by lower license
                    usage order.
                </div>
            </Alert>

            {renderAssignmentsTable()}

            {remainingAddresses.length > 0 && (
                <Alert
                    color="warning"
                    classNames={{
                        base: 'items-start',
                    }}
                    title={<div className="font-medium">Unused addresses</div>}
                >
                    <div className="text-sm">
                        {remainingAddresses.length} valid address{remainingAddresses.length > 1 ? 'es were' : ' was'} not used
                        because you don't have enough unlinked licenses.
                    </div>
                </Alert>
            )}
        </div>
    );

    const renderLinkingDisabledContent = () => (
        <div className="col w-full gap-4">
            <DetailedAlert
                variant="red"
                icon={<RiShieldUserLine />}
                title="Unavailable"
                description={<div>KYC (Know Your Customer) must be completed before linking licenses.</div>}
            />

            <div className="center-all w-full">
                <Button color="primary" as={Link} to={routePath.profile}>
                    Go to KYC
                </Button>
            </div>
        </div>
    );

    const renderNoUnlinkedLicenses = () => (
        <DetailedAlert
            variant="red"
            icon={<RiShieldUserLine />}
            title="No unlinked ND licenses"
            description={<div>You currently do not have any ND licenses available for bulk linking.</div>}
        />
    );

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={onModalClose}
            size="4xl"
            shouldBlockScroll={false}
            classNames={{
                closeButton: 'cursor-pointer',
            }}
        >
            <ModalContent>
                <ModalHeader>Bulk Link Nodes</ModalHeader>
                <ModalBody>
                    {!account ? (
                        <Spinner />
                    ) : account.kycStatus !== ApplicationStatus.Approved && environment === 'mainnet' ? (
                        renderLinkingDisabledContent()
                    ) : eligibleLicenses.length === 0 ? (
                        renderNoUnlinkedLicenses()
                    ) : step === 'upload' ? (
                        renderUploadStep()
                    ) : (
                        renderReviewStep()
                    )}
                </ModalBody>
                {canLink && (
                    <ModalFooter>
                        {step === 'review' && (
                            <Button variant="light" onPress={() => setStep('upload')} isDisabled={isSubmitting}>
                                Back
                            </Button>
                        )}

                        <Button variant="light" onPress={onModalClose} isDisabled={isSubmitting}>
                            Cancel
                        </Button>

                        {step === 'upload' ? (
                            <Button
                                color="primary"
                                onPress={() => fileInputRef.current?.click()}
                                isDisabled={isParsing || isSubmitting}
                            >
                                {isParsing ? 'Parsing...' : 'Upload CSV'}
                            </Button>
                        ) : (
                            <Button color="primary" onPress={onConfirm} isLoading={isSubmitting}>
                                Confirm & Sign
                            </Button>
                        )}
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
});

LicenseBulkLinkModal.displayName = 'LicenseBulkLinkModal';

export default LicenseBulkLinkModal;
