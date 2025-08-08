import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import LicensesPageHeader from '@components/Licenses/LicensesPageHeader';
import LicenseBurnModal from '@components/Licenses/modals/LicenseBurnModal';
import LicenseLinkModal from '@components/Licenses/modals/LicenseLinkModal';
import LicenseUnlinkModal from '@components/Licenses/modals/LicenseUnlinkModal';
import { Pagination } from '@heroui/pagination';
import { Skeleton } from '@heroui/skeleton';
import { config, getCurrentEpoch, getDevAddress, isDebugging } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { getLicenseSectionHeader } from '@lib/utils';
import EmptyData from '@shared/EmptyData';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { LicenseSkeleton } from '@shared/Licenses/LicenseSkeleton';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiCpuLine } from 'react-icons/ri';
import { License } from 'typedefs/blockchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

const PAGE_SIZE = 10;

function Licenses() {
    const { watchTx, licenses, isLoadingLicenses, fetchLicensesV2, fetchLicenses } =
        useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const [licensesToShow, setLicensesToShow] = useState<Array<License>>([]);

    const [filter, setFilter] = useState<'all' | 'linked' | 'unlinked'>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredLicenses = useMemo(() => {
        switch (filter) {
            case 'linked':
                return licenses.filter((license) => license.isLinked);

            case 'unlinked':
                return licenses.filter((license) => !license.isLinked);

            default:
                return licenses;
        }
    }, [licenses, filter]);

    const [isClaimingAll, setClaimingAll] = useState<boolean>(false);

    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const linkModalRef = useRef<{ trigger: (_license) => void }>(null);
    const unlinkModalRef = useRef<{ trigger: (_license) => void }>(null);
    const burnModalRef = useRef<{ trigger: (_license) => void }>(null);

    const { address } = isDebugging ? getDevAddress() : useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    useEffect(() => {
        if (!publicClient) {
            return;
        } else {
            if (authenticated && !!address && publicClient) {
                fetchLicensesV2();
                // fetchLicenses(); TODO: uncomment
            }
        }
    }, [authenticated, address, publicClient]);

    useEffect(() => {
        onPageChange(1);
    }, [filteredLicenses]);

    useEffect(() => {
        onPageChange();
    }, [currentPage]);

    const onPageChange = (page?: number) => {
        if (page && page !== currentPage) {
            setCurrentPage(page);
        }

        const index = page || currentPage;
        setLicensesToShow(filteredLicenses.slice((index - 1) * PAGE_SIZE, index * PAGE_SIZE));
    };

    const getPagesCount = (): number => Math.ceil(filteredLicenses.length / PAGE_SIZE);

    const onAction = (type: 'link' | 'unlink' | 'claim' | 'changeNode' | 'burn', license: License) => {
        switch (type) {
            case 'link':
                onLink(license);
                break;

            case 'unlink':
                onUnlink(license);
                break;

            case 'claim':
                onClaim(license);
                break;

            case 'changeNode':
                onLink(license);
                break;

            case 'burn':
                onBurn(license);
                break;

            default:
                console.error('Invalid action type');
        }
    };

    const onClaim = async (license: License, skipFetchingRewards: boolean = false) => {
        try {
            if (!publicClient || !address || !walletClient) {
                toast.error('Unexpected error, please try again.');
                return;
            }
            if (!license.isLinked) {
                toast.error('License is not linked to a node.');
                return;
            }

            setClaimingRewards(license.licenseId, license.type, true);

            const [epochs, availabilies, ethSignatures] = await Promise.all([
                license.epochs,
                license.epochsAvailabilities,
                license.ethSignatures,
            ]);

            const computeParam = {
                licenseId: license.licenseId,
                nodeAddress: license.nodeAddress,
                epochs: epochs.map((epoch) => BigInt(epoch)),
                availabilies,
            };

            const txHash =
                license.type === 'ND'
                    ? await walletClient.writeContract({
                          address: config.ndContractAddress,
                          abi: NDContractAbi,
                          functionName: 'claimRewards',
                          args: [[computeParam], [ethSignatures]],
                      })
                    : await walletClient.writeContract({
                          address: config.mndContractAddress,
                          abi: MNDContractAbi,
                          functionName: 'claimRewards',
                          args: [[computeParam], [ethSignatures]],
                      });

            const receipt = await watchTx(txHash, publicClient);

            if (!skipFetchingRewards) {
                fetchLicenses();
            }

            return receipt;
        } catch (err: any) {
            toast.error('An error occurred, please try again.');
        } finally {
            setClaimingRewards(license.licenseId, license.type, false);
        }
    };

    const onLink = (license: License) => {
        if (linkModalRef.current) {
            linkModalRef.current.trigger(license);
        }
    };

    const onUnlink = (license: License) => {
        if (unlinkModalRef.current) {
            unlinkModalRef.current.trigger(license);
        }
    };

    const onBurn = async (license: License) => {
        if (burnModalRef.current) {
            burnModalRef.current.trigger(license);
        }
    };

    const setClaimingRewards = (id: bigint, type: License['type'], value: boolean) => {
        setLicensesToShow((prevLicenses) =>
            prevLicenses.map((license) =>
                license.licenseId === id && license.type === type
                    ? {
                          ...license,
                          isClaimingRewards: value,
                      }
                    : license,
            ),
        );
    };

    const shouldTriggerGhostClaimRewards = (license: License) =>
        license.isLinked && Number(license.lastClaimEpoch) < getCurrentEpoch();

    const onLicenseClick = (license: License) => {
        setTimeout(() => {
            const cardRef = cardRefs.current.get(`${license.type}${license.licenseId}`);
            if (cardRef) {
                cardRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 0);
    };

    const getLicenseElement = (license: License): JSX.Element => (
        <div
            key={license.licenseId}
            ref={(element) => {
                if (element) {
                    cardRefs.current.set(`${license.type}${license.licenseId}`, element);
                }
            }}
        >
            <LicenseCard license={license} isClaimingAll={isClaimingAll} onLicenseClick={onLicenseClick} action={onAction} />
        </div>
    );

    // Used in order to split 'licensesToShow' into sections
    const filterLicensesOfType = (type: License['type']) => licensesToShow.filter((license) => license.type === type);

    return (
        <div className="h-full">
            <div className="col h-full justify-between gap-3">
                <div className="col gap-3">
                    <div>
                        <LicensesPageHeader
                            onFilterChange={setFilter}
                            licenses={licenses}
                            isLoading={isClaimingAll}
                            setLoading={setClaimingAll}
                        />
                    </div>

                    {!isLoadingLicenses && !licensesToShow?.length && (
                        <div className="center-all w-full py-14">
                            <EmptyData
                                title="No licenses found"
                                description="Your licenses will be displayed here"
                                icon={<RiCpuLine />}
                            />
                        </div>
                    )}

                    {isLoadingLicenses ? (
                        <>
                            <div className="mx-auto pt-4">
                                <Skeleton className="h-9 min-w-20 rounded-xl" />
                            </div>

                            {Array(3)
                                .fill(null)
                                .map((_, index) => (
                                    <div key={index}>
                                        <LicenseSkeleton />
                                    </div>
                                ))}
                        </>
                    ) : (
                        <div className="col mt-2 gap-3">
                            {['GND', 'MND', 'ND']
                                .filter((type) => filterLicensesOfType(type as License['type']).length > 0)
                                .map((type) => (
                                    <div key={type} className="col gap-3">
                                        {getLicenseSectionHeader(type as License['type'])}

                                        {filterLicensesOfType(type as License['type']).map((license) =>
                                            getLicenseElement(license),
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {getPagesCount() > 1 && licensesToShow.length && (
                    <div className="mx-auto pt-12">
                        <Pagination
                            page={currentPage}
                            onChange={setCurrentPage}
                            classNames={{
                                wrapper: 'gap-0 overflow-visible h-8 rounded border border-divider',
                                item: 'w-8 h-8 text-small rounded-none bg-transparent',
                                cursor: 'bg-gradient-to-b from-primary-500 to-primary-600 rounded-md text-white font-bold',
                            }}
                            total={getPagesCount()}
                        />
                    </div>
                )}
            </div>

            <LicenseLinkModal
                ref={linkModalRef}
                nodeAddresses={licenses.filter((license) => license.isLinked).map((license) => license.nodeAddress)}
                onClaim={onClaim}
                shouldTriggerGhostClaimRewards={shouldTriggerGhostClaimRewards}
            />

            <LicenseUnlinkModal
                ref={unlinkModalRef}
                onClaim={onClaim}
                shouldTriggerGhostClaimRewards={shouldTriggerGhostClaimRewards}
            />

            <LicenseBurnModal ref={burnModalRef} />
        </div>
    );
}

export default Licenses;
