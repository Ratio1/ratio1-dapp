import { isLicenseLinked } from '@lib/utils';
import clsx from 'clsx';
import { License, LinkedLicense } from 'types';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';
import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { getCurrentEpoch, mndContractAddress, oraclesUrl } from '@lib/config';
import { MNDContractAbi } from '@blockchain/MNDContract';

export const LicenseCard = ({
    license,
    isExpanded,
    action,
    toggle,
    disableActions,
    isBanned,
}: {
    license: License | LinkedLicense;
    isExpanded: boolean;
    action?: (type: 'link' | 'unlink' | 'claim', license: License | LinkedLicense) => void;
    toggle?: (id: number) => void;
    disableActions?: boolean;
    isBanned?: boolean;
}) => {
    const publicClient = usePublicClient();

    const [rewardsAmount, setRewardsAmount] = useState<bigint | null>(null);

    const calculateRewards = async () => {
        if (!publicClient) {
            return;
        }

        const nodeAddress = '0x129a21A78EBBA79aE78B8f11d5B57102950c1Fc0';
        const lastClaimEpoch = 19;
        const currentEpoch = getCurrentEpoch();

        const oraclesResponse = (await fetch(
            oraclesUrl +
                `/node_epochs_range?eth_node_addr=${nodeAddress}&start_epoch=${lastClaimEpoch}&end_epoch=${currentEpoch - 1}`,
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

        const { rewardsAmount } = await publicClient.readContract({
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

        console.log({ rewardsAmount, oraclesResponse });

        setRewardsAmount(rewardsAmount);
    };

    useEffect(() => {
        calculateRewards();
    }, []);

    return (
        <div
            className={clsx(
                'flex flex-col overflow-hidden rounded-3xl border-3 border-lightAccent bg-lightAccent transition-all',
                {
                    'cursor-pointer hover:border-[#e9ebf1]': isLicenseLinked(license),
                },
            )}
            onClick={() => {
                if (isLicenseLinked(license) && toggle) {
                    toggle(license.id);
                }
            }}
        >
            <LicenseCardHeader
                license={license}
                action={action}
                isExpanded={isExpanded}
                disableActions={disableActions}
                isBanned={isBanned}
                rewardsAmount={rewardsAmount}
            />

            {isExpanded && <LicenseCardDetails />}
        </div>
    );
};
