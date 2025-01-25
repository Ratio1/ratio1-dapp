import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import LicenseLinkModal from '@components/Licenses/LicenseLinkModal';
import LicensesPageHeader from '@components/Licenses/LicensesPageHeader';
import LicenseUnlinkModal from '@components/Licenses/LicenseUnlinkModal';
import { getCurrentEpoch, mndContractAddress, ndContractAddress, oraclesUrl } from '@lib/config';
import { isLicenseLinked } from '@lib/utils';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { subHours } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { License, LinkedLicense } from 'types';
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
    const [licenses, setLicenses] = useState<Array<License | LinkedLicense>>([]);
    const cardRefs = useRef<Map<bigint, HTMLDivElement>>(new Map());

    const linkModalRef = useRef<{ trigger: (_license) => void }>(null);
    const unlinkModalRef = useRef<{ trigger: (_license) => void }>(null);

    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    /*
    function _calculateEpoch(uint256 timestamp) private pure returns (uint256) {
        require(
            timestamp >= startEpochTimestamp,
            "Timestamp is before the start epoch."
        );

        return (timestamp - startEpochTimestamp) / epochDuration;
    }
    */

    useEffect(() => {
        if (!publicClient || !address) {
            return;
        }

        publicClient
            .readContract({
                address: mndContractAddress,
                abi: MNDContractAbi,
                functionName: 'getUserLicense',
                args: [address],
            })
            .then(async (userLicense) => {
                const oraclesResponse = (await fetch(
                    oraclesUrl +
                        `/node_epochs_range?eth_node_addr=${
                            userLicense.nodeAddress
                        }&start_epoch=${userLicense.lastClaimEpoch}&end_epoch=${getCurrentEpoch() - 1}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    },
                ).then((res) => res.json())) as {
                    result: {
                        node: string;
                        node_eth_address: `0x${string}`;
                        epochs: number[];
                        epochs_vals: number[];
                        eth_signed_data: {
                            input: string[];
                            signature_field: string;
                        };
                        eth_signatures: `0x${string}`[];
                        eth_addresses: `0x${string}`[];
                        certainty: { [key: string]: boolean };
                        server_alias: string;
                        server_version: string;
                        server_time: Date;
                        server_current_epoch: number;
                        server_uptime: string;
                        EE_SIGN: string;
                        EE_SENDER: string;
                        EE_ETH_SENDER: string;
                        EE_ETH_SIGN: string;
                        EE_HASH: string;
                    };
                    node_addr: string;
                };

                const { rewardsAmount: rewards } = await publicClient.readContract({
                    address: mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'calculateRewards',
                    args: [
                        {
                            licenseId: 0n,
                            nodeAddress: oraclesResponse.result.node_eth_address,
                            epochs: oraclesResponse.result.epochs.map((epoch) => BigInt(epoch)),
                            availabilies: oraclesResponse.result.epochs_vals,
                        },
                    ],
                });

                return { ...userLicense, rewards };
            })
            .then((userLicense) => {
                setLicenses([
                    {
                        ...userLicense,
                        used: 0,
                        isExpanded: false,
                        isBanned: false,
                        alias: 'Your Edge Node',
                        node_address: userLicense.nodeAddress,
                    },
                ]);
                console.log({ userLicense });
            });
    }, [address]);

    const claim = async (license: License | LinkedLicense) => {
        if (!publicClient || !address || !walletClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        const userLicense = await publicClient.readContract({
            address: mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'getUserLicense',
            args: [address],
        });

        console.log({ userLicense });

        const currentEpoch = getCurrentEpoch();

        const oraclesResponse = (await fetch(
            oraclesUrl +
                `/node_epochs_range?eth_node_addr=${userLicense.nodeAddress}&start_epoch=${userLicense.lastClaimEpoch}&end_epoch=${
                    currentEpoch - 1
                }`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        ).then((res) => res.json())) as {
            result: {
                node: string;
                node_eth_address: `0x${string}`;
                epochs: number[];
                epochs_vals: number[];
                eth_signed_data: {
                    input: string[];
                    signature_field: string;
                };
                eth_signatures: `0x${string}`[];
                eth_addresses: `0x${string}`[];
                certainty: { [key: string]: boolean };
                server_alias: string;
                server_version: string;
                server_time: Date;
                server_current_epoch: number;
                server_uptime: string;
                EE_SIGN: string;
                EE_SENDER: string;
                EE_ETH_SENDER: string;
                EE_ETH_SIGN: string;
                EE_HASH: string;
            };
            node_addr: string;
        };

        const licenseTokenPrice = await publicClient.readContract({
            address: ndContractAddress,
            abi: NDContractAbi,
            functionName: 'getLicenseTokenPrice',
        });

        console.log({ licenseTokenPrice });

        const txHash = await walletClient.writeContract({
            address: mndContractAddress,
            abi: MNDContractAbi,
            functionName: 'claimRewards',
            args: [
                {
                    licenseId: 0n,
                    nodeAddress: userLicense.nodeAddress,
                    epochs: oraclesResponse.result.epochs.map((epoch) => BigInt(epoch)),
                    availabilies: oraclesResponse.result.epochs_vals,
                },
                oraclesResponse.result.eth_signatures,
            ],
        });
    };

    const onAction = (type: 'link' | 'unlink' | 'claim', license: License | LinkedLicense) => {
        switch (type) {
            case 'link':
                onLink(license);
                break;

            case 'unlink':
                onUnlink(license);
                break;

            case 'claim':
                claim(license);

                /*
    
                const response = (await fetch(backendUrl + '/license/buy', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        name: 'a',
                        surname: 'a',
                        isCompany: false,
                        identificationCode: 'a',
                        address: 'a',
                        state: 'a',
                        city: 'a',
                        country: 'a',
                    }),
                }).then((res) => res.json())) as {
                    data: {
                        signature: string;
                        uuid: string;
                    };
                    error: string;
                };
                console.log(response);
    
                const txHash = await walletClient.writeContract({
                    address: ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'buyLicense',
                    args: [
                        BigInt(quantity), // nLicesesToBuy
                        1, // tier TODO get correct tier
                        Buffer.from(response.data.uuid).toString() as `0x${string}`, // invoice uuid
                        `0x${response.data.signature}`, // signature
                    ],
                });
                */
                console.log('claim');
                break;

            default:
                console.error('Invalid action type');
        }
    };

    const onLink = (license: License | LinkedLicense) => {
        if (linkModalRef.current) {
            linkModalRef.current.trigger(license);
        }
    };

    const onUnlink = (license: License | LinkedLicense) => {
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

    const onFilterChange = (key: 'all' | 'linked' | 'unlinked') => {
        /*
        switch (key) {
            case 'linked':
                setLicenses(LICENSES.filter(isLicenseLinked));
                break;

            case 'unlinked':
                setLicenses(LICENSES.filter((license) => !isLicenseLinked(license)));
                break;

            default:
                setLicenses(LICENSES);
        }
        */
    };

    return (
        <div className="col gap-3">
            <div className="mb-3">
                <LicensesPageHeader onFilterChange={onFilterChange} />
            </div>

            {licenses.map((license) => (
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
                        isExpanded={isLicenseLinked(license) ? !!license.isExpanded : false}
                        toggle={onLicenseExpand}
                        action={onAction}
                        isBanned={license.isBanned}
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
