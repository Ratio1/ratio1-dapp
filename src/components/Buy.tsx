import { ERC20Abi } from '@blockchain/ERC20';
import { NDContractAbi } from '@blockchain/NDContract';
import { buyLicense } from '@lib/api/backend';
import { config, environment } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { Spinner } from '@nextui-org/spinner';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { R1ValueWithLabel } from '@shared/R1ValueWithLabel';
import { KycStatus } from '@typedefs/profile';
import { isFinite, isNaN } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiMinus } from 'react-icons/bi';
import {
    RiAddFill,
    RiArrowRightDoubleLine,
    RiCheckLine,
    RiCpuLine,
    RiEqualizer2Line,
    RiErrorWarningLine,
    RiPriceTag3Line,
} from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { Stage } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

const DANGEROUS_SLIPPAGE = 0.5;
const MAX_ALLOWANCE: bigint = 2n ** 256n - 1n;

function Buy({ onClose, currentStage, stage }: { onClose: () => void; currentStage: number; stage: Stage }) {
    const navigate = useNavigate();

    const { watchTx, r1Balance, fetchR1Balance } = useBlockchainContext() as BlockchainContextType;
    const { authenticated, account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;

    // Loading component state
    const [isLoading, setLoading] = useState<boolean>(true);

    const [tokenAllowance, setTokenAllowance] = useState<bigint | undefined>();
    const [licenseTokenPrice, setLicenseTokenPrice] = useState<bigint>(0n);

    const [accountUsdSpendingLimit, setAccountUsdSpendingLimit] = useState<number | undefined>();
    const [userUsdMintedAmount, setUserUsdMintedAmount] = useState<bigint | undefined>();

    const [slippageValue, setSlippageValue] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(10);
    const { isOpen, onOpen, onClose: onCloseSlippageModal, onOpenChange } = useDisclosure(); // Slippage modal

    const [quantity, setQuantity] = useState<string>('1');

    const [isLoadingTx, setLoadingTx] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = useAccount();

    useEffect(() => {
        if (!publicClient) {
            return;
        }

        publicClient
            .readContract({
                address: config.ndContractAddress,
                abi: NDContractAbi,
                functionName: 'getLicenseTokenPrice',
            })
            .then(setLicenseTokenPrice);
    }, []);

    useEffect(() => {
        if (publicClient && address) {
            fetchAllowance(publicClient, address);
            fetchUserUsdMintedAmount(publicClient, address);
        }
    }, [address, publicClient]);

    useEffect(() => {
        if (account && userUsdMintedAmount !== undefined) {
            setAccountUsdSpendingLimit(account.usdBuyLimit - Number(userUsdMintedAmount));
            setLoading(false);
        }
    }, [account, userUsdMintedAmount]);

    const getTokenAmount = (): bigint => {
        const slippageValue = Math.floor(slippage * 100) / 100; // Rounds down to 2 decimal places
        return (BigInt(quantity) * (licenseTokenPrice / 10n) * BigInt(Math.floor(100 + slippageValue))) / 100n;
    };

    const hasEnoughAllowance = (): boolean => tokenAllowance !== undefined && tokenAllowance > MAX_ALLOWANCE / 2n;

    /**
     * Approval is required only if the allowance is less than half of the maximum allowance,
     * otherwise approving would be triggered after every buy
     */
    const isApprovalRequired = (): boolean => !hasEnoughAllowance();

    const fetchAllowance = (publicClient, address: string) =>
        publicClient
            .readContract({
                address: config.r1ContractAddress,
                abi: ERC20Abi,
                functionName: 'allowance',
                args: [address, config.ndContractAddress],
            })
            .then(setTokenAllowance);

    const fetchUserUsdMintedAmount = (publicClient, address: string) =>
        publicClient
            .readContract({
                address: config.ndContractAddress,
                abi: NDContractAbi,
                functionName: 'userUsdMintedAmount',
                args: [address],
            })
            .then(setUserUsdMintedAmount);

    const approve = async () => {
        setLoadingTx(true);

        if (!walletClient || !publicClient || !address) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        const txHash = await walletClient.writeContract({
            address: config.r1ContractAddress,
            abi: ERC20Abi,
            functionName: 'approve',
            args: [config.ndContractAddress, MAX_ALLOWANCE],
        });

        await watchTx(txHash, publicClient);

        fetchAllowance(publicClient, address);
    };

    const buy = async () => {
        if (getTokenAmount() > r1Balance) {
            toast.error('Not enough $R1 in your wallet.');
            console.error(`Required $R1 ${getTokenAmount()} > your balance ${r1Balance}`);
            return;
        }

        setLoadingTx(true);

        if (!walletClient || !publicClient || !address) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        const { signature, uuid, usdLimitAmount } = await buyLicense({
            name: 'a',
            surname: 'a',
            isCompany: false,
            identificationCode: 'a',
            address: 'a',
            state: 'a',
            city: 'a',
            country: 'a',
        });

        const txHash = await walletClient.writeContract({
            address: config.ndContractAddress,
            abi: NDContractAbi,
            functionName: 'buyLicense',
            args: [
                BigInt(quantity),
                currentStage,
                getTokenAmount(),
                `0x${Buffer.from(uuid).toString('hex')}`,
                BigInt(usdLimitAmount),
                `0x${signature}`,
            ],
        });

        await watchTx(txHash, publicClient);

        // Refresh buying/tx state
        fetchAllowance(publicClient, address);
        fetchR1Balance();

        // Refresh data about the user's account spending limit
        setLoading(true);
        fetchAccount();
        fetchUserUsdMintedAmount(publicClient, address);
        setLoading(false);

        onClose();
        navigate(routePath.licenses);
    };

    const onPress = async () => {
        try {
            if (isApprovalRequired()) {
                await approve();
            } else {
                await buy();
            }
        } catch (err: any) {
            console.error(err.message);
            toast.error('Transaction failed, please try again.');
        } finally {
            setLoadingTx(false);
        }
    };

    const onSubmitSlippage = async (e) => {
        e.preventDefault();

        const n = Number.parseFloat(slippageValue);

        setSlippage(n);
        onCloseSlippageModal();
    };

    const isSlippageTooSmall = (): boolean => {
        const n = Number.parseFloat(slippageValue);
        const isInputValueTooSmall: boolean = isFinite(n) && !isNaN(n) && n < DANGEROUS_SLIPPAGE;

        return slippage < DANGEROUS_SLIPPAGE || isInputValueTooSmall;
    };

    const isOverAccountUsdSpendingLimit = (): boolean => {
        if (!accountUsdSpendingLimit) return false;

        return parseInt(quantity) * stage.usdPrice > accountUsdSpendingLimit;
    };

    const isBuyingDisabled = (): boolean =>
        !quantity ||
        !account ||
        !licenseTokenPrice ||
        tokenAllowance === undefined ||
        accountUsdSpendingLimit === undefined ||
        isOverAccountUsdSpendingLimit() ||
        (account.kycStatus !== KycStatus.Approved && environment === 'mainnet');

    return (
        <>
            <div className="my-4 flex flex-col gap-6">
                <div className="row justify-between gap-4">
                    <Button isIconOnly variant="flat" className="bg-slate-100" onPress={onClose}>
                        <div className="text-[22px]">
                            <RiArrowRightDoubleLine />
                        </div>
                    </Button>

                    {!isLoading && (
                        <Button
                            className="rounded-lg border border-default-200 bg-[#fcfcfd]"
                            color="default"
                            variant="bordered"
                            onPress={() => {
                                setSlippageValue(slippage.toString());
                                onOpen();
                            }}
                        >
                            <div className="row gap-1">
                                <RiEqualizer2Line className="pr-0.5 text-xl text-gray-500" />

                                <span className="text-gray-500">Slippage:</span>
                                <span className="font-medium">{slippage}%</span>
                            </div>
                        </Button>
                    )}
                </div>

                <div className="col relative gap-4">
                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="center-all absolute z-50 h-full w-full overflow-hidden rounded-md bg-white/70">
                            <Spinner />
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="col overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        <div className="row justify-between p-4">
                            <div className="row gap-2.5">
                                <div className="rounded-md bg-primary p-1.5 text-white">
                                    <RiCpuLine className="text-xl" />
                                </div>

                                <div className="text-base font-medium">Licenses</div>
                            </div>

                            <div className="flex">
                                <div className="rounded-md bg-orange-100 px-2 py-1 text-sm font-medium tracking-wider text-orange-600">
                                    ~{stage.totalUnits - stage.soldUnits} left
                                </div>
                            </div>
                        </div>

                        <div className="flex border-t border-slate-200 bg-white px-6 py-4">
                            <div className="row justify-between gap-12">
                                <div className="font-medium">Quantity</div>

                                <div className="flex gap-1">
                                    <Button
                                        className="min-w-10 rounded-lg border border-default-200 bg-[#fcfcfd] p-0"
                                        color="default"
                                        variant="bordered"
                                        size="md"
                                        onPress={() => {
                                            const n = Number.parseInt(quantity);

                                            if (isFinite(n) && !isNaN(n) && n >= 2) {
                                                setQuantity((n - 1).toString());
                                            }
                                        }}
                                    >
                                        <BiMinus className="text-[18px] text-[#71717a]" />
                                    </Button>

                                    <Input
                                        value={quantity}
                                        onValueChange={(value) => {
                                            const n = Number.parseInt(value);

                                            if (value === '') {
                                                setQuantity('');
                                            } else if (
                                                isFinite(n) &&
                                                !isNaN(n) &&
                                                n > 0 &&
                                                n <= stage.totalUnits - stage.soldUnits
                                            ) {
                                                setQuantity(n.toString());
                                            }
                                        }}
                                        size="md"
                                        classNames={{
                                            inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                                            input: 'font-medium',
                                        }}
                                        variant="bordered"
                                        color="primary"
                                        labelPlacement="outside"
                                        placeholder="0"
                                    />

                                    <Button
                                        className="min-w-10 rounded-lg border border-default-200 bg-[#fcfcfd] p-0"
                                        color="default"
                                        variant="bordered"
                                        size="md"
                                        onPress={() => {
                                            if (quantity === '') {
                                                setQuantity('1');
                                            }

                                            const n = Number.parseInt(quantity);

                                            if (isFinite(n) && !isNaN(n) && n < stage.totalUnits - stage.soldUnits) {
                                                setQuantity((n + 1).toString());
                                            }
                                        }}
                                    >
                                        <RiAddFill className="text-[18px] text-[#71717a]" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account spending limit error */}
                    {isOverAccountUsdSpendingLimit() && (
                        <div className="center-all w-full flex-col gap-2 rounded-md bg-slate-100 px-6 py-5 text-red-600">
                            <RiErrorWarningLine className="text-2xl" />

                            <div className="text-center text-[13px] font-medium">
                                The amount you're trying to spend exceeds your USD spending limit. You cannot complete this
                                purchase because your account has reached its allowed spending amount.
                            </div>
                        </div>
                    )}

                    {/* Total amount due & Summary */}
                    <div className="flex w-full flex-col rounded-md bg-slate-100 px-6 py-6">
                        <R1ValueWithLabel
                            label="Total amount required"
                            value={parseFloat(Number(formatUnits(getTokenAmount(), 18)).toFixed(2))}
                            isAproximate
                        />

                        <div className="col gap-6">
                            {!!quantity && Number.parseInt(quantity) > 0 && (
                                <>
                                    <Divider className="mt-6 bg-slate-200" />

                                    <div className="col gap-2">
                                        <div className="text-sm font-medium text-slate-500">Summary</div>

                                        <div className="col gap-2">
                                            <div className="row justify-between">
                                                <div className="text-sm font-medium">
                                                    {quantity} x License{Number.parseInt(quantity) > 1 ? 's' : ''} (Tier{' '}
                                                    {currentStage})
                                                </div>
                                                <div className="text-sm font-medium">
                                                    ${(Number.parseInt(quantity) * stage.usdPrice).toLocaleString('en-US')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {authenticated && !hasEnoughAllowance() && (
                                <div className="col gap-2 pt-2 text-sm text-slate-500">
                                    <div className="">You may be asked to sign 2 transactions:</div>

                                    <div className="col gap-0.5">
                                        <div className="row gap-2">
                                            <RiCheckLine className="text-lg" />
                                            <div>Approval of token spending</div>
                                        </div>

                                        <div className="row gap-2">
                                            <RiPriceTag3Line className="text-lg" />
                                            <div>License purchasing transaction</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={!quantity ? 'mt-6' : ''}>
                                <ConnectWalletWrapper isFullWidth>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onPress={onPress}
                                        isLoading={isLoadingTx}
                                        isDisabled={isBuyingDisabled()}
                                    >
                                        {isApprovalRequired() ? 'Approve $R1' : 'Buy'}
                                    </Button>
                                </ConnectWalletWrapper>
                            </div>

                            {accountUsdSpendingLimit !== undefined && (
                                <div className="col gap-3 text-center text-sm">
                                    <div className="col gap-1">
                                        <div className="font-medium text-slate-500">Account Spending Limit (USD)</div>
                                        <div className="text-base font-medium">${accountUsdSpendingLimit}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" shouldBlockScroll={false}>
                <ModalContent>
                    <ModalHeader>Set slippage tolerance (%)</ModalHeader>

                    <ModalBody>
                        <div className="col gap-2 pb-2">
                            <div className="text-sm text-slate-500">
                                This is the maximum amount of slippage you are willing to accept when transactioning.
                            </div>

                            <Form className="w-full" validationBehavior="native" onSubmit={onSubmitSlippage}>
                                <Input
                                    value={slippageValue}
                                    onValueChange={(value) => {
                                        const n = Number.parseFloat(value);

                                        if (value === '' || (isFinite(n) && !isNaN(n) && n >= 0 && n < 100)) {
                                            setSlippageValue(value);
                                        }
                                    }}
                                    size="md"
                                    classNames={{
                                        inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                                        input: 'font-medium',
                                    }}
                                    variant="bordered"
                                    color="primary"
                                    labelPlacement="outside"
                                    placeholder="0"
                                    type="number"
                                    validate={(value) => {
                                        const n = Number.parseFloat(value);

                                        if (!(isFinite(n) && !isNaN(n) && n > 0 && n < 100)) {
                                            return 'Value must be a number between 0 and 100.';
                                        }

                                        return null;
                                    }}
                                />

                                <div className="col w-full gap-2">
                                    {isSlippageTooSmall() && (
                                        <Alert
                                            color="danger"
                                            title="Your transaction may fail"
                                            classNames={{
                                                base: 'items-center py-2 mt-1',
                                            }}
                                        />
                                    )}

                                    <div className="mt-1 flex justify-end">
                                        <Button type="submit" color="primary">
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default Buy;
