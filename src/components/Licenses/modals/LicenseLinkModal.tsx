import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { linkLicense } from '@lib/api/backend';
import { config, environment } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import useAwait from '@lib/useAwait';
import { DetailedAlert } from '@shared/DetailedAlert';
import { R1ValueWithLabel } from '@shared/R1ValueWithLabel';
import { TokenSvg } from '@shared/TokenSvg';
import { ApplicationStatus } from '@typedefs/profile';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RiShieldUserLine, RiWalletLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { EthAddress, License } from 'typedefs/blockchain';
import { TransactionReceipt, formatUnits } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

interface Props {
    nodeAddresses: string[];
    onClaim: (license: License, skipFetchingRewards?: boolean) => Promise<TransactionReceipt | undefined>;
    shouldTriggerGhostClaimRewards: (license: License) => boolean;
}

const LicenseLinkModal = forwardRef(({ nodeAddresses, onClaim, shouldTriggerGhostClaimRewards }: Props, ref) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [license, setLicense] = useState<License>();

    const rewardsPromise = useMemo(() => {
        if (!license) {
            return 0n;
        } else {
            return license.isLinked ? license.rewards : 0n;
        }
    }, [license]);
    const [rewards, isLoadingRewards] = useAwait(rewardsPromise);

    const { watchTx, fetchLicenses } = useBlockchainContext() as BlockchainContextType;
    const { account } = useAuthenticationContext() as AuthenticationContextType;

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const [address, setAddress] = useState('');
    const [isNodeAlreadyLinked, setNodeAlreadyLinked] = useState<boolean>(false);

    // Init
    useEffect(() => {
        setLoading(false);
        setAddress('');
    }, []);

    const trigger = (license: License) => {
        setAddress('');
        setLoading(false);
        setLicense(license);
        onOpen();
    };

    useImperativeHandle(ref, () => ({
        trigger,
    }));

    const onConfirmLinking = async (e) => {
        e.preventDefault();

        if (!walletClient || !license || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setLoading(true);

        const isAlreadyLinked: boolean = await publicClient.readContract({
            address: config.ndContractAddress,
            abi: NDContractAbi,
            functionName: 'isNodeAlreadyLinked',
            args: [address as EthAddress],
        });

        if (isAlreadyLinked) {
            console.log('Node already linked');
            setNodeAlreadyLinked(true);
            setLoading(false);
            return;
        }

        const link = async () => {
            console.log('Linking node');
            const addressToLink = address as EthAddress;
            const { signature } = await linkLicense(addressToLink);

            const linkTxHash = await walletClient.writeContract({
                address: license.type === 'ND' ? config.ndContractAddress : config.mndContractAddress,
                abi: license.type === 'ND' ? NDContractAbi : MNDContractAbi,
                functionName: 'linkNode',
                args: [license.licenseId, addressToLink, `0x${signature}`],
            });

            await watchTx(linkTxHash, publicClient);
        };

        try {
            if (shouldTriggerGhostClaimRewards(license)) {
                const receipt = await onClaim(license, true);

                if (receipt?.status !== 'success') {
                    toast.error('Claiming failed, please try again.');
                    throw new Error('Claiming rewards failed');
                }
            }

            await link();
            setAddress('');
            onClose();
        } catch (error) {
            console.error('Error linking license:', error);
            toast.error('An error occurred, please try again.');
        } finally {
            console.log('Node linked, fetching licenses');

            // Using a timeout here to make sure fetchLicenses returns the updated smart contract data
            setTimeout(() => {
                fetchLicenses(true);
                setLoading(false);
            }, 0);
        }
    };

    const onConfirmClaiming = async () => {
        if (!license) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        setLoading(true);

        try {
            await onClaim(license);
        } catch (error) {
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
            onClose();
        }
    };

    const isLinkingDisabled = (): boolean =>
        !account || (account.kycStatus !== ApplicationStatus.Approved && environment === 'mainnet');

    const getLinkingContent = () => (
        <Form className="w-full" validationBehavior="native" onSubmit={onConfirmLinking}>
            <div className="col w-full gap-3">
                <Input
                    autoFocus
                    value={address}
                    onValueChange={(value: string) => {
                        if (isNodeAlreadyLinked) {
                            setNodeAlreadyLinked(false);
                        }

                        setAddress(value);
                    }}
                    label="Node Address"
                    labelPlacement="outside"
                    placeholder="0x"
                    startContent={<RiWalletLine className="pointer-events-none text-xl text-slate-500" />}
                    size="md"
                    classNames={{
                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                        input: 'font-medium',
                        label: 'font-medium',
                    }}
                    type="text"
                    variant="bordered"
                    validate={(value) => {
                        if (!(value.startsWith('0x') && value.length === 42)) {
                            return 'Value must be a valid Ethereum address';
                        }

                        if (nodeAddresses.includes(value)) {
                            return 'This address is already linked to another license';
                        }

                        return null;
                    }}
                />

                {isNodeAlreadyLinked ? (
                    <Alert
                        color="danger"
                        title="This address is already linked to another license."
                        classNames={{
                            base: 'items-center',
                        }}
                    />
                ) : (
                    <Alert
                        color="primary"
                        title="A license can only be linked once every 24 hours."
                        classNames={{
                            base: 'items-center',
                        }}
                    />
                )}

                {!!license && shouldTriggerGhostClaimRewards(license) && (
                    <Alert
                        color="warning"
                        title="Additional confirmation required"
                        classNames={{
                            base: 'items-center',
                        }}
                    >
                        <div className="text-sm">
                            You'll need to approve <span className="font-medium">two transactions</span> because rewards were
                            last claimed in a previous epoch.
                        </div>
                    </Alert>
                )}
            </div>

            <div className="flex w-full justify-end py-2">
                <Button type="submit" color="primary" isLoading={isLoading}>
                    Confirm
                </Button>
            </div>
        </Form>
    );

    const getClaimRewardsContent = () => (
        <>
            <div className="col w-full gap-6">
                <DetailedAlert
                    icon={<TokenSvg classNames="h-8 w-8" />}
                    title="Unavailable"
                    description={<div>Rewards must be claimed before linking license.</div>}
                >
                    <R1ValueWithLabel
                        label="Unclaimed Rewards"
                        value={parseFloat(Number(formatUnits(rewards ?? 0n, 18)).toFixed(2))}
                        isAproximate
                    />
                </DetailedAlert>
            </div>

            <div className="center-all w-full gap-2 py-2">
                <Button color="primary" onPress={onConfirmClaiming} isLoading={isLoading}>
                    Claim
                </Button>
            </div>
        </>
    );

    const getLinkingDisabledContent = () => (
        <>
            <div className="col w-full">
                <DetailedAlert
                    variant="red"
                    icon={<RiShieldUserLine />}
                    title="Unavailable"
                    description={<div>KYC (Know Your Customer) must be completed before linking license.</div>}
                />
            </div>

            <div className="center-all w-full pb-4">
                <Button color="primary" as={Link} to={routePath.profile}>
                    Go to KYC
                </Button>
            </div>
        </>
    );

    return (
        <div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" shouldBlockScroll={false}>
                <ModalContent>
                    {!license || !account || isLoadingRewards || rewards === undefined ? (
                        <Spinner />
                    ) : (
                        <>
                            <ModalHeader>Link License #{Number(license.licenseId)}</ModalHeader>
                            <ModalBody>
                                {isLinkingDisabled()
                                    ? getLinkingDisabledContent()
                                    : rewards > 0n
                                      ? getClaimRewardsContent()
                                      : getLinkingContent()}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
});

export default LicenseLinkModal;
