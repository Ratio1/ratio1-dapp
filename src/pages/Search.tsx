import Empty from '@assets/empty.png';
import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { config, getCurrentEpoch } from '@lib/config';
import { getLicenseRewardsAndNodeInfo, getLicenseSectionHeader } from '@lib/utils';
import { Input } from '@nextui-org/input';
import { Spinner } from '@nextui-org/spinner';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { useEffect, useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { GNDLicense, MNDLicense, NDLicense } from 'typedefs/blockchain';
import { usePublicClient } from 'wagmi';

function Search() {
    const [value, setValue] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    const [resultNDContract, setResultNDContract] = useState<NDLicense | null>();
    const [resultMNDContract, setResultMNDContract] = useState<MNDLicense | GNDLicense | null>();

    const [searchParams, setSearchParams] = useSearchParams();
    const publicClient = usePublicClient();

    const licenseId = searchParams.get('licenseId');

    useEffect(() => {
        if (licenseId) {
            setValue(licenseId);
            onSearch();
        }
    }, [licenseId]);

    const onSearch = async () => {
        if (!publicClient) {
            return;
        }

        const sanitizedNumber = value.replace('License', '').replace('Licence', '').replace('#', '').trim();

        if (!sanitizedNumber) {
            return;
        }

        setSearchParams({ licenseId: sanitizedNumber });

        setLoading(true);

        await onSearchND(BigInt(sanitizedNumber));
        await onSearchMND(BigInt(sanitizedNumber));

        setLoading(false);
    };

    const onSearchND = async (licenseId: bigint) => {
        if (!publicClient) {
            return;
        }

        const [nodeAddress, totalClaimedAmount, lastClaimEpoch, assignTimestamp, lastClaimOracle, isBanned] =
            await publicClient.readContract({
                address: config.ndContractAddress,
                abi: NDContractAbi,
                functionName: 'licenses',
                args: [licenseId],
            });

        console.log('ND', { nodeAddress, totalClaimedAmount, lastClaimEpoch, assignTimestamp, lastClaimOracle, isBanned });

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

        if (!isLinked) {
            setResultNDContract({
                ...baseLicense,
                claimableEpochs: 0n,
                isLinked,
            });
        } else {
            const licenseDataPromise = getLicenseRewardsAndNodeInfo({
                ...baseLicense,
                claimableEpochs: 0n,
                isLinked: false, // Enforcing base license type here as to not pass redunant data
            });

            setResultNDContract({
                ...baseLicense,
                claimableEpochs: BigInt(getCurrentEpoch()) - lastClaimEpoch,
                rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                isOnline: licenseDataPromise.then(({ node_is_online }) => node_is_online),
            });
        }
    };

    const onSearchMND = async (licenseId: bigint) => {
        if (!publicClient) {
            return;
        }

        const [nodeAddress, totalAssignedAmount, totalClaimedAmount, lastClaimEpoch, assignTimestamp, lastClaimOracle] =
            await publicClient.readContract({
                address: config.mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'licenses',
                args: [licenseId],
            });

        console.log('MND', {
            nodeAddress,
            totalAssignedAmount,
            totalClaimedAmount,
            lastClaimEpoch,
            assignTimestamp,
            lastClaimOracle,
        });

        const isLinked = nodeAddress !== '0x0000000000000000000000000000000000000000';

        const baseLicense: Omit<MNDLicense, 'rewards' | 'alias' | 'isOnline' | 'claimableEpochs'> = {
            type: 'MND' as const,
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

        if (!isLinked) {
            setResultMNDContract({
                ...baseLicense,
                claimableEpochs: 0n,
                isLinked,
            });
        } else {
            const licenseDataPromise = getLicenseRewardsAndNodeInfo({
                ...baseLicense,
                claimableEpochs: 0n,
                isLinked: false, // Enforcing base license type here as to not pass redunant data
            });

            // MNDs have a 120 epoch cliff period
            const claimableEpochs: number = Math.max(0, getCurrentEpoch() - 120 - Number(lastClaimEpoch));

            setResultMNDContract({
                ...baseLicense,
                claimableEpochs: BigInt(claimableEpochs),
                rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                isOnline: licenseDataPromise.then(({ node_is_online }) => node_is_online),
            });
        }
    };

    return (
        <div className="col h-full items-center gap-4 lg:gap-6">
            <div className="w-full larger:w-[50%]">
                <Input
                    value={value}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearch();
                        }
                    }}
                    onValueChange={(value) => {
                        setValue(value);
                    }}
                    isDisabled={isLoading}
                    size="lg"
                    classNames={{
                        inputWrapper: 'h-[52px] bg-lightBlue hover:!bg-[#eceef6] group-data-[focus=true]:bg-lightBlue px-6',
                    }}
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
                                        onSearch();
                                    }}
                                >
                                    <RiSearchLine />
                                </div>
                            )}
                        </div>
                    }
                />
            </div>

            {!resultNDContract && !resultMNDContract ? (
                <div className="center-all col gap-1.5 p-8">
                    <img src={Empty} alt="Empty" className="h-28" />
                    <div className="text-sm text-slate-400">Search for a license</div>
                </div>
            ) : (
                <div className="col w-full gap-3">
                    {!!resultMNDContract && (
                        <div className="col gap-3">
                            {getLicenseSectionHeader(resultMNDContract.type)}

                            <div className="w-full">
                                <LicenseCard license={resultMNDContract} disableActions />
                            </div>
                        </div>
                    )}

                    {!!resultNDContract && (
                        <div className="col gap-3">
                            {getLicenseSectionHeader(resultNDContract.type)}

                            <div className="w-full">
                                <LicenseCard license={resultNDContract} disableActions />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Search;
