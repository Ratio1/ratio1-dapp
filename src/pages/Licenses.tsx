import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import LicenseLinkModal from '@components/Licenses/LicenseLinkModal';
import LicensesPageHeader from '@components/Licenses/LicensesPageHeader';
import LicenseUnlinkModal from '@components/Licenses/LicenseUnlinkModal';
import { getNodeEpochsRange } from '@lib/api/oracles';
import { config, getCurrentEpoch } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { getLicenseSectionHeader } from '@lib/utils';
import { Pagination } from '@nextui-org/pagination';
import { Skeleton } from '@nextui-org/skeleton';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { LicenseSkeleton } from '@shared/Licenses/LicenseSkeleton';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { License } from 'typedefs/blockchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

const PAGE_SIZE = 5;

function Licenses() {
    const { watchTx, fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const [licenses, setLicenses] = useState<Array<License>>([]);
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

    const [isLoading, setLoading] = useState<boolean>(false);

    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const linkModalRef = useRef<{ trigger: (_license) => void }>(null);
    const unlinkModalRef = useRef<{ trigger: (_license) => void }>(null);

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    useEffect(() => {
        if (!publicClient) {
            return;
        } else {
            if (authenticated && !!address && publicClient) {
                getLicenses();
            } else {
                setLicenses([]);
                setLicensesToShow([]);
            }
        }
    }, [authenticated, address, publicClient]);

    useEffect(() => {
        onPageChange(1);
    }, [filteredLicenses]);

    useEffect(() => {
        onPageChange();
    }, [currentPage]);

    const getLicenses = () => {
        setLoading(true);

        fetchLicenses()
            .then(setLicenses)
            .finally(() => setLoading(false));
    };

    const onPageChange = (page?: number) => {
        if (page && page !== currentPage) {
            setCurrentPage(page);
        }

        const index = page || currentPage;
        setLicensesToShow(filteredLicenses.slice((index - 1) * PAGE_SIZE, index * PAGE_SIZE));
    };

    const getPagesCount = (): number => Math.ceil(filteredLicenses.length / PAGE_SIZE);

    const onAction = (type: 'link' | 'unlink' | 'claim' | 'changeNode', license: License) => {
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

            default:
                console.error('Invalid action type');
        }
    };

    const onClaim = async (license: License) => {
        try {
            if (!publicClient || !address || !walletClient) {
                toast.error('Unexpected error, please try again.');
                return;
            }

            setClaimingRewards(license.licenseId, license.type, true);

            //TODO decide if we want to store this data in the license object
            const { epochs, epochs_vals, eth_signatures } = await getNodeEpochsRange(
                license.nodeAddress,
                Number(license.lastClaimEpoch),
                getCurrentEpoch() - 1,
            );

            const computeParam = {
                licenseId: license.licenseId,
                nodeAddress: license.nodeAddress,
                epochs: epochs.map((epoch) => BigInt(epoch)),
                availabilies: epochs_vals,
            };
            const txHash =
                license.type === 'ND'
                    ? await walletClient.writeContract({
                          address: config.ndContractAddress,
                          abi: NDContractAbi,
                          functionName: 'claimRewards',
                          args: [[computeParam], [eth_signatures]],
                      })
                    : await walletClient.writeContract({
                          address: config.mndContractAddress,
                          abi: MNDContractAbi,
                          functionName: 'claimRewards',
                          args: [computeParam, eth_signatures],
                      });

            await watchTx(txHash, publicClient);

            getLicenses();
        } catch (err: any) {
            toast.error('An error occurred, pease try again.');
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

    const setClaimingRewards = (id: bigint, type: License['type'], value: boolean) => {
        setLicenses((prevLicenses) =>
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
            <LicenseCard license={license} onLicenseClick={onLicenseClick} action={onAction} />
        </div>
    );

    // Used in order to split 'licensesToShow' into sections
    const filterLicensesOfType = (type: License['type']) => licensesToShow.filter((license) => license.type === type);

    return (
        <div className="h-full">
            <div className="col h-full justify-between gap-3">
                <div className="col gap-3">
                    <div>
                        <LicensesPageHeader onFilterChange={setFilter} licenses={licenses} getLicenses={getLicenses} />
                    </div>

                    {isLoading ? (
                        <>
                            <div className="mx-auto pt-4 xl:mx-0 xl:flex">
                                <Skeleton className="h-8 min-w-20 rounded-xl" />
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
                        <>
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
                        </>
                    )}
                </div>

                {getPagesCount() > 1 && (
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
                getLicenses={getLicenses}
            />

            <LicenseUnlinkModal ref={unlinkModalRef} getLicenses={getLicenses} onClaim={onClaim} />
        </div>
    );
}

export default Licenses;
