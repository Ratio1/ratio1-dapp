import Empty from '@assets/empty.png';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config, getCurrentEpoch } from '@lib/config';
import { getNodeAndLicenseRewards } from '@lib/utils';
import { Input } from '@nextui-org/input';
import { Spinner } from '@nextui-org/spinner';
import { Tab, Tabs } from '@nextui-org/tabs';
import { DetailedAlert } from '@shared/DetailedAlert';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { isFinite } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiSearchLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { GNDLicense, License, MNDLicense, NDLicense } from 'typedefs/blockchain';
import { usePublicClient } from 'wagmi';

function Search() {
    const [value, setValue] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);
    const [emptyResult, setEmptyResult] = useState<boolean>(false);

    const [resultNDContract, setResultNDContract] = useState<NDLicense | undefined>();
    const [resultMNDContract, setResultMNDContract] = useState<MNDLicense | GNDLicense | undefined>();
    const [activeTab, setActiveTab] = useState<'ND' | 'MND'>();

    const [licenseToShow, setLicenseToShow] = useState<License | undefined>();

    const [searchParams, setSearchParams] = useSearchParams();
    const publicClient = usePublicClient();

    const licenseId = searchParams.get('licenseId');

    useEffect(() => {
        if (activeTab === 'ND' && resultNDContract) {
            setLicenseToShow(resultNDContract);
        } else if (activeTab === 'MND' && resultMNDContract) {
            setLicenseToShow(resultMNDContract);
        }
    }, [activeTab]);

    useEffect(() => {
        if (licenseId && publicClient) {
            setValue(licenseId);
            onSearch(licenseId);
        }
    }, [licenseId, publicClient]);

    const onSearchBarSubmit = () => {
        const sanitizedNumber = value.replace('License', '').replace('Licence', '').replace('#', '').trim();

        if (!sanitizedNumber) {
            return;
        }

        const num = Number(sanitizedNumber);

        if (isNaN(num) || !Number.isInteger(num) || !isFinite(num) || num <= 0) {
            toast.error('Invalid search value.');
            setResultNDContract(undefined);
            setResultMNDContract(undefined);
            setLicenseToShow(undefined);

            return;
        }

        setSearchParams({ licenseId: sanitizedNumber });
    };

    const onSearch = async (licenseId: string) => {
        if (!publicClient) {
            return;
        }

        setLoading(true);
        const [licenseND, licenseMND] = await Promise.all([onSearchND(BigInt(licenseId)), onSearchMND(BigInt(licenseId))]);

        console.log({ licenseND, licenseMND });

        if (!licenseND && !licenseMND) {
            setLicenseToShow(undefined);
            setEmptyResult(true);
        } else {
            if (!licenseND || !licenseMND) {
                // Only one type of License was found
                setLicenseToShow(licenseND || licenseMND);
            } else {
                // Both types were found
                setLicenseToShow(activeTab === 'ND' ? licenseND : licenseMND);
            }

            setEmptyResult(false);
        }

        setLoading(false);
    };

    const onSearchND = async (licenseId: bigint): Promise<NDLicense | undefined> => {
        if (!publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            await publicClient.readContract({
                address: config.ndContractAddress,
                abi: NDContractAbi,
                functionName: 'ownerOf',
                args: [licenseId],
            });

            const [nodeAddress, totalClaimedAmount, lastClaimEpoch, assignTimestamp, lastClaimOracle, isBanned] =
                await publicClient.readContract({
                    address: config.ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'licenses',
                    args: [licenseId],
                });

            const isLinked = nodeAddress !== '0x0000000000000000000000000000000000000000';

            const baseLicense: Omit<NDLicense, 'rewards' | 'alias' | 'isOnline' | 'claimableEpochs'> = {
                type: 'ND' as const,
                licenseId,
                nodeAddress,
                totalClaimedAmount,
                remainingAmount: config.ND_LICENSE_CAP - totalClaimedAmount,
                lastClaimEpoch,
                assignTimestamp,
                lastClaimOracle,
                totalAssignedAmount: config.ND_LICENSE_CAP,
                isBanned,
                isLinked,
            };

            let result: NDLicense;

            if (!isLinked) {
                result = {
                    ...baseLicense,
                    claimableEpochs: 0n,
                    isLinked,
                };
            } else {
                const licenseDataPromise = getNodeAndLicenseRewards({
                    ...baseLicense,
                    claimableEpochs: 0n,
                    isLinked: false, // Enforcing base license type here as to not pass redunant data
                });

                result = {
                    ...baseLicense,
                    claimableEpochs: BigInt(getCurrentEpoch()) - lastClaimEpoch,
                    rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                    alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                    isOnline: licenseDataPromise.then(({ node_is_online }) => node_is_online),
                    epochs: licenseDataPromise.then(({ epochs }) => epochs),
                    epochsAvailabilities: licenseDataPromise.then(({ epochs_vals }) => epochs_vals),
                    ethSignatures: licenseDataPromise.then(({ eth_signatures }) => eth_signatures),
                };
            }

            setResultNDContract(result);
            return result;
        } catch (error: any) {
            console.error(error.message);
            setResultNDContract(undefined);
            return;
        }
    };

    const onSearchMND = async (licenseId: bigint): Promise<MNDLicense | GNDLicense | undefined> => {
        if (!publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            await publicClient.readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'ownerOf',
                args: [licenseId],
            });

            const [
                nodeAddress,
                totalAssignedAmount,
                totalClaimedAmount,
                firstMiningEpoch,
                lastClaimEpoch,
                assignTimestamp,
                lastClaimOracle,
            ] = await publicClient.readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'licenses',
                args: [licenseId],
            });

            if (!totalAssignedAmount) {
                return;
            }

            const isLinked = nodeAddress !== '0x0000000000000000000000000000000000000000';

            const baseLicense: Omit<MNDLicense | GNDLicense, 'rewards' | 'alias' | 'isOnline' | 'claimableEpochs'> = {
                type: licenseId === 1n ? 'GND' : ('MND' as const),
                licenseId,
                nodeAddress,
                totalClaimedAmount,
                remainingAmount: totalAssignedAmount - totalClaimedAmount,
                lastClaimEpoch,
                assignTimestamp,
                lastClaimOracle,
                totalAssignedAmount,
                isBanned: false as const,
                isLinked,
            };

            let result: MNDLicense | GNDLicense;

            if (!isLinked) {
                result = {
                    ...baseLicense,
                    claimableEpochs: 0n,
                    isLinked,
                };
            } else {
                const licenseDataPromise = getNodeAndLicenseRewards({
                    ...baseLicense,
                    claimableEpochs: 0n,
                    isLinked: false, // Enforcing base license type here as to not pass redunant data
                });

                // MNDs have a cliff period
                const claimableEpochs: number = Math.max(0, getCurrentEpoch() - config.mndCliffEpochs - Number(lastClaimEpoch));

                result = {
                    ...baseLicense,
                    claimableEpochs: BigInt(claimableEpochs),
                    rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                    alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                    isOnline: licenseDataPromise.then(({ node_is_online }) => node_is_online),
                    epochs: licenseDataPromise.then(({ epochs }) => epochs),
                    epochsAvailabilities: licenseDataPromise.then(({ epochs_vals }) => epochs_vals),
                    ethSignatures: licenseDataPromise.then(({ eth_signatures }) => eth_signatures),
                };
            }

            setResultMNDContract(result);

            return result;
        } catch (error: any) {
            console.error(error.message);
            setResultMNDContract(undefined);
            return;
        }
    };

    return (
        <div className="col h-full items-center gap-4 lg:gap-6">
            <div className="w-full larger:w-[50%]">
                <Input
                    value={value}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearchBarSubmit();
                        }
                    }}
                    onValueChange={(value) => {
                        setValue(value);
                    }}
                    isDisabled={isLoading}
                    size="lg"
                    classNames={{
                        inputWrapper: 'h-[52px] bg-slate-100 hover:!bg-[#eceef6] group-data-[focus=true]:bg-slate-100 px-6',
                    }}
                    maxLength={25}
                    variant="flat"
                    radius="full"
                    labelPlacement="outside"
                    placeholder="Search by license id/number"
                    endContent={
                        <div className="center-all -mr-2.5 cursor-pointer p-2 text-[22px]">
                            {isLoading ? (
                                <Spinner size="sm" color="primary" />
                            ) : (
                                <div
                                    onClick={() => {
                                        onSearchBarSubmit();
                                    }}
                                >
                                    <RiSearchLine />
                                </div>
                            )}
                        </div>
                    }
                />
            </div>

            {emptyResult ? (
                <div className="center-all p-8">
                    <DetailedAlert
                        variant="red"
                        icon={<RiSearchLine />}
                        title="Not found"
                        description={<div>Your search did not match any license.</div>}
                    />
                </div>
            ) : !licenseToShow && !(resultNDContract && resultMNDContract) ? (
                <div className="center-all col gap-1.5 p-8">
                    <img src={Empty} alt="Empty" className="h-28" />
                    <div className="text-sm text-slate-400">Search for a license</div>
                </div>
            ) : (
                <div className="col w-full gap-3">
                    {!!resultNDContract && !!resultMNDContract && (
                        <Tabs
                            className="mx-auto -mt-2"
                            aria-label="Tabs"
                            color="default"
                            radius="full"
                            size="lg"
                            classNames={{
                                tabList: 'p-1.5 bg-slate-100',
                                tabContent: 'text-[15px]',
                                tab: 'min-w-[64px]',
                            }}
                            onSelectionChange={(key) => {
                                setActiveTab(key === resultNDContract.type ? 'ND' : 'MND');
                            }}
                        >
                            {[resultNDContract.type, resultMNDContract.type].map((type) => (
                                <Tab key={type} title={type} />
                            ))}
                        </Tabs>
                    )}

                    {!!licenseToShow && (
                        <div className="w-full">
                            <LicenseCard license={licenseToShow} disableActions />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Search;
