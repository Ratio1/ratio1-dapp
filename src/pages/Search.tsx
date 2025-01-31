import Empty from '@assets/empty.png';
import { NDContractAbi } from '@blockchain/NDContract';
import { ND_LICENSE_CAP, ndContractAddress } from '@lib/config';
import { getLicenseRewardsAndNodeInfo } from '@lib/utils';
import { Input } from '@nextui-org/input';
import { Spinner } from '@nextui-org/spinner';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { useEffect, useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { NDLicense } from 'typedefs/blockchain';
import { usePublicClient } from 'wagmi';

function Search() {
    const [value, setValue] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    const [result, setResult] = useState<NDLicense | null>();

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
            console.error('No publicClient available');
            return;
        }
        const sanitizedNumber = value.replace('License', '').replace('Licence', '').replace('#', '').trim();

        if (!sanitizedNumber) {
            return;
        }

        setLoading(true);

        setSearchParams({ licenseId: sanitizedNumber });

        //TODO we should have an endpoint to get the license data?
        const [nodeAddress, totalClaimedAmount, lastClaimEpoch, assignTimestamp, lastClaimOracle, isBanned] =
            await publicClient.readContract({
                address: ndContractAddress,
                abi: NDContractAbi,
                functionName: 'licenses',
                args: [BigInt(sanitizedNumber)],
            });

        const isLinked = nodeAddress !== '0x0000000000000000000000000000000000000000';
        const license = {
            type: 'ND' as const,
            licenseId: BigInt(sanitizedNumber),
            nodeAddress,
            totalClaimedAmount,
            remainingAmount: ND_LICENSE_CAP - totalClaimedAmount,
            lastClaimEpoch,
            claimableEpochs: BigInt(0),
            assignTimestamp,
            lastClaimOracle,
            totalAssignedAmount: ND_LICENSE_CAP,
            isBanned,
            isLinked,
        };
        if (!isLinked) {
            setResult({
                ...license,
                isLinked: false,
            });
        } else {
            const licenseDataPromise = getLicenseRewardsAndNodeInfo({
                ...license,
                isLinked: false, // Enforcing base license type here
            });
            return {
                ...license,
                rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                isOnline: licenseDataPromise.then(({ node_is_online }) => node_is_online),
            };
        }

        setLoading(false);
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
                        inputWrapper: 'h-[52px] bg-lightAccent hover:!bg-[#eceef6] group-data-[focus=true]:bg-lightAccent px-6',
                    }}
                    variant="flat"
                    radius="full"
                    labelPlacement="outside"
                    placeholder="Search by license number"
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

            {!result ? (
                <div className="center-all col gap-1.5 p-8">
                    <img src={Empty} alt="Empty" className="h-28" />
                    <div className="text-sm text-slate-400">Search for a license</div>
                </div>
            ) : (
                <LicenseCard license={result} isExpanded disableActions />
            )}
        </div>
    );
}

export default Search;
