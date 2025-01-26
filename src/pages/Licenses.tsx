import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import LicenseLinkModal from '@components/Licenses/LicenseLinkModal';
import LicensesPageHeader from '@components/Licenses/LicensesPageHeader';
import LicenseUnlinkModal from '@components/Licenses/LicenseUnlinkModal';
import { getNodeEpochsRange } from '@lib/api/oracles';
import { mndContractAddress, ND_LICENSE_CAP, ndContractAddress } from '@lib/config';
import { GeneralContextType, useGeneralContext } from '@lib/general';
import { getLicenseRewardsAndName, getCurrentEpoch } from '@lib/utils';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { License } from 'types';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

/*
const LICENSES: Array<License | LinkedLicense> = [
    {
        licenseId: 385,
        alias: 'stefan-edge-node',
        node_address: '0xbF57FEB86044aE9f7B6ED74874A6b1d60D64601b',
        rewards: 256.1,
        used: 2500,
        assignTimestamp: subHours(new Date(), 24),
    },
    {
        licenseId: 5564,
        alias: 'naeural_396c2f29',
        node_address: '0x71c4255E9ACa4E1Eb41167056F2f9dCC6DbBB58a',
        rewards: 0,
        used: 5800,
        assignTimestamp: subHours(new Date(), 24),
        isBanned: true,
    },
    {
        licenseId: 6713,
        alias: 'naeural_b859867c',
        node_address: '0x13FF7fDe859f980988Ce687C8797dBB82F031e42',
        rewards: 205,
        used: 575,
        assignTimestamp: subHours(new Date(), 24),
    },
    {
        licenseId: 1251,
        used: 4670,
        assignTimestamp: new Date(),
    },
    {
        licenseId: 287,
        used: 20850,
        assignTimestamp: subHours(new Date(), 48),
    },
];
*/

function Licenses() {
    const [licenses, setLicenses] = useState<Array<License>>([]);
    const [filter, setFilter] = useState<'all' | 'linked' | 'unlinked'>('all');
    const licensesToShow = useMemo(() => {
        switch (filter) {
            case 'linked':
                return licenses.filter((license) => license.isLinked);

            case 'unlinked':
                return licenses.filter((license) => !license.isLinked);

            default:
                return licenses;
        }
    }, [licenses, filter]);
    const cardRefs = useRef<Map<bigint, HTMLDivElement>>(new Map());

    const linkModalRef = useRef<{ trigger: (_license) => void }>(null);
    const unlinkModalRef = useRef<{ trigger: (_license) => void }>(null);

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { watchTx } = useGeneralContext() as GeneralContextType;

    useEffect(() => {
        fetchLicenses().then(setLicenses);
    }, [address]);

    const fetchLicenses = async (): Promise<Array<License>> => {
        if (!publicClient || !address) {
            return [];
        }

        const [mndLicense, ndLicenses] = await Promise.all([
            publicClient
                .readContract({
                    address: mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'getUserLicense',
                    args: [address],
                })
                .then((userLicense) => {
                    const isLinked = userLicense.nodeAddress !== '0x0000000000000000000000000000000000000000';
                    const type = userLicense.licenseId === 0n ? ('GND' as const) : ('MND' as const);
                    if (!isLinked) {
                        return { ...userLicense, type, isLinked, isBanned: false as const };
                    }
                    const licenseDataPromise = getLicenseRewardsAndName({
                        ...userLicense,
                        type,
                    });
                    return {
                        ...userLicense,
                        type,
                        isLinked,
                        rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                        alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                        isBanned: false as const,
                    };
                }),
            publicClient
                .readContract({
                    address: ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'getLicenses',
                    args: [address],
                })
                .then((userLicenses) => {
                    return userLicenses.map((license) => {
                        const type = 'ND' as const;
                        const isLinked = license.nodeAddress !== '0x0000000000000000000000000000000000000000';
                        const totalAssignedAmount = ND_LICENSE_CAP;
                        if (!isLinked) {
                            return { ...license, type, totalAssignedAmount, isLinked };
                        }
                        const licenseDataPromise = getLicenseRewardsAndName({ ...license, type, totalAssignedAmount });
                        return {
                            ...license,
                            type,
                            totalAssignedAmount,
                            isLinked,
                            rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                            alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                        };
                    });
                }),
        ]);
        if (mndLicense.totalAssignedAmount) {
            return [mndLicense, ...ndLicenses];
        }
        return ndLicenses;
    };

    const onClaim = async (license: License) => {
        try {
            if (!publicClient || !address || !walletClient) {
                toast.error('Unexpected error, please try again.');
                return;
            }

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
                          address: ndContractAddress,
                          abi: NDContractAbi,
                          functionName: 'claimRewards',
                          args: [[computeParam], [eth_signatures]],
                      })
                    : await walletClient.writeContract({
                          address: mndContractAddress,
                          abi: MNDContractAbi,
                          functionName: 'claimRewards',
                          args: [computeParam, eth_signatures],
                      });

            await watchTx(txHash, publicClient);

            const updatedLicenses = await fetchLicenses();
            setLicenses(updatedLicenses);
        } catch (err: any) {
            toast.error(`An error occurred: ${err.message}\nPlease try again.`);
        }
    };

    const onAction = (type: 'link' | 'unlink' | 'claim', license: License) => {
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

            default:
                console.error('Invalid action type');
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

    const onLicenseExpand = (id: bigint) => {
        setLicenses((prevLicenses) =>
            prevLicenses.map((license) =>
                license.licenseId === id
                    ? {
                          ...license,
                          isExpanded: !license.isExpanded,
                      }
                    : license,
            ),
        );

        setTimeout(() => {
            const cardRef = cardRefs.current.get(id);
            if (cardRef) {
                cardRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 0);
    };

    return (
        <div className="col gap-3">
            <div className="mb-3">
                <LicensesPageHeader onFilterChange={setFilter} licenses={licenses} />
            </div>

            {licensesToShow.map((license) => (
                <div
                    key={license.licenseId}
                    ref={(element) => {
                        if (element) {
                            cardRefs.current.set(license.licenseId, element);
                        }
                    }}
                >
                    <LicenseCard
                        license={license}
                        isExpanded={license.isLinked ? !!license.isExpanded : false}
                        toggle={onLicenseExpand}
                        action={onAction}
                    />
                </div>
            ))}

            <LicenseLinkModal
                ref={linkModalRef}
                nodeAddresses={licenses.filter((license) => license.isLinked).map((license) => license.nodeAddress)}
            />

            <LicenseUnlinkModal ref={unlinkModalRef} />
        </div>
    );
}

export default Licenses;
