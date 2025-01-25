import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import LicenseLinkModal from '@components/Licenses/LicenseLinkModal';
import LicensesPageHeader from '@components/Licenses/LicensesPageHeader';
import LicenseUnlinkModal from '@components/Licenses/LicenseUnlinkModal';
import { getNodeEpochsRange } from '@lib/api/oracles';
import { getCurrentEpoch, mndContractAddress, ND_LICENSE_CAP, ndContractAddress, oraclesUrl } from '@lib/config';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { subHours } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { EthAddress, License } from 'types';
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

    const calculateMndRewards = async ({
        licenseId,
        nodeAddress,
        lastClaimEpoch,
    }: {
        licenseId: bigint;
        nodeAddress: EthAddress;
        lastClaimEpoch: bigint;
    }) => {
        if (!publicClient) {
            return { rewardsAmount: 0n, node_alias: '' };
        }
        const currentEpoch = getCurrentEpoch();
        if (currentEpoch === Number(lastClaimEpoch)) {
            return { rewardsAmount: 0n, node_alias: '' }; //TODO check how to get the node_alias in this case
        }

        const { node_alias, epochs, epochs_vals } = await getNodeEpochsRange(
            nodeAddress,
            Number(lastClaimEpoch),
            getCurrentEpoch() - 1,
        );
        const { rewardsAmount } = await publicClient.readContract({
            address: mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'calculateRewards',
            args: [
                {
                    licenseId,
                    nodeAddress,
                    epochs: epochs.map(BigInt),
                    availabilies: epochs_vals,
                },
            ],
        });
        return { rewardsAmount, node_alias };
    };
    const calculateNdRewards = async ({
        licenseId,
        nodeAddress,
        lastClaimEpoch,
    }: {
        licenseId: bigint;
        nodeAddress: EthAddress;
        lastClaimEpoch: bigint;
    }) => {
        if (!publicClient) {
            return { rewardsAmount: 0n, node_alias: '' };
        }
        const currentEpoch = getCurrentEpoch();
        if (currentEpoch === Number(lastClaimEpoch)) {
            return { rewardsAmount: 0n, node_alias: '' }; //TODO check how to get the node_alias in this case
        }

        const { node_alias, epochs, epochs_vals } = await getNodeEpochsRange(
            nodeAddress,
            Number(lastClaimEpoch),
            getCurrentEpoch() - 1,
        );
        const { rewardsAmount } = await publicClient.readContract({
            address: ndContractAddress,
            abi: NDContractAbi,
            functionName: 'calculateRewards',
            args: [
                [
                    {
                        licenseId,
                        nodeAddress,
                        epochs: epochs.map(BigInt),
                        availabilies: epochs_vals,
                    },
                ],
            ],
        })[0];
        return { rewardsAmount, node_alias };
    };

    useEffect(() => {
        if (!publicClient || !address) {
            return;
        }

        Promise.all([
            publicClient
                .readContract({
                    address: mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'getUserLicense',
                    args: [address],
                })
                .then((userLicense) => {
                    const isLinked = userLicense.nodeAddress !== '0x0000000000000000000000000000000000000000';
                    if (!isLinked) {
                        return { ...userLicense, type: 'MND' as const, isLinked, isBanned: false as const };
                    }
                    const promise = calculateMndRewards(userLicense);
                    return {
                        ...userLicense,
                        type: 'MND' as const,
                        isLinked,
                        rewards: promise.then(({ rewardsAmount }) => rewardsAmount),
                        alias: promise.then(({ node_alias }) => node_alias),
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
                        const isLinked = license.nodeAddress !== '0x0000000000000000000000000000000000000000';
                        if (!isLinked) {
                            return { ...license, type: 'ND' as const, totalAssignedAmount: ND_LICENSE_CAP, isLinked };
                        }
                        const promise = calculateNdRewards(license);
                        return {
                            ...license,
                            type: 'ND' as const,
                            totalAssignedAmount: ND_LICENSE_CAP,
                            isLinked,
                            rewards: promise.then(({ rewardsAmount }) => rewardsAmount),
                            alias: promise.then(({ node_alias }) => node_alias),
                        };
                    });
                }),
        ]).then(([mndLicense, ndLicenses]) => {
            if (mndLicense.totalAssignedAmount) {
                setLicenses([mndLicense, ...ndLicenses]);
            } else {
                setLicenses(ndLicenses);
            }
        });
    }, [address]);

    const onClaim = async (license: License) => {
        try {
            if (!publicClient || !address || !walletClient) {
                toast.error('Unexpected error, please try again.');
                return;
            }

            const { epochs, epochs_vals, eth_signatures } = await getNodeEpochsRange(
                license.nodeAddress,
                Number(license.lastClaimEpoch),
                getCurrentEpoch() - 1,
            );

            const txHash = await walletClient.writeContract({
                address: mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'claimRewards',
                args: [
                    {
                        licenseId: 0n,
                        nodeAddress: license.nodeAddress,
                        epochs: epochs.map((epoch) => BigInt(epoch)),
                        availabilies: epochs_vals,
                    },
                    eth_signatures,
                ],
            });
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
                <LicensesPageHeader onFilterChange={setFilter} />
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

            {/*TODO <LicenseLinkModal
                ref={linkModalRef}
                nodeAddresses={LICENSES.filter(isLicenseLinked).map((license) => license.node_address)}
            />*/}

            <LicenseUnlinkModal ref={unlinkModalRef} />
        </div>
    );
}

export default Licenses;
