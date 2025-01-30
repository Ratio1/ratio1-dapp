import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import LicenseLinkModal from '@components/Licenses/LicenseLinkModal';
import LicensesPageHeader from '@components/Licenses/LicensesPageHeader';
import LicenseUnlinkModal from '@components/Licenses/LicenseUnlinkModal';
import { getNodeEpochsRange } from '@lib/api/oracles';
import { mndContractAddress, ndContractAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { getCurrentEpoch } from '@lib/utils';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { License } from 'typedefs/blockchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

function Licenses() {
    const { watchTx, fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

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

    useEffect(() => {
        if (authenticated) {
            getLicenses();
        }
    }, [authenticated]);

    const getLicenses = () => fetchLicenses().then(setLicenses);

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

            setClaimingRewards(license.licenseId, license.type, false);
            getLicenses();
        } catch (err: any) {
            toast.error('An error occurred, pease try again.');
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

    const onLicenseExpand = (id: bigint, type: License['type']) => {
        setLicenses((prevLicenses) =>
            prevLicenses.map((license) =>
                license.licenseId === id && license.type === type
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
        <div>
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
                            isExpanded={license.isExpanded as boolean}
                            toggle={onLicenseExpand}
                            action={onAction}
                        />
                    </div>
                ))}
            </div>

            <LicenseLinkModal
                ref={linkModalRef}
                nodeAddresses={licenses.filter((license) => license.isLinked).map((license) => license.nodeAddress)}
                getLicenses={getLicenses}
            />

            <LicenseUnlinkModal ref={unlinkModalRef} getLicenses={getLicenses} />
        </div>
    );
}

export default Licenses;
