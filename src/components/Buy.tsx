import Logo from '@assets/token.svg';
import { ERC20Abi } from '@blockchain/ERC20';
import { NDContractAbi } from '@blockchain/NDContract';
import { buyLicense } from '@lib/api/backend';
import { config, environment } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { routePath } from '@lib/routes/route-paths';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Input } from '@nextui-org/input';
import { useDisclosure } from '@nextui-org/modal';
import { Spinner } from '@nextui-org/spinner';
import { AddTokenToWallet } from '@shared/AddTokenToWallet';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { R1ValueWithLabel } from '@shared/R1ValueWithLabel';
import { Timer } from '@shared/Timer';
import { KycStatus } from '@typedefs/profile';
import { isAfter } from 'date-fns';
import { isFinite, isNaN } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BiMinus } from 'react-icons/bi';
import { RiAddFill, RiArrowRightDoubleLine, RiCpuLine, RiErrorWarningLine, RiSettings2Line } from 'react-icons/ri';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PriceTier } from 'typedefs/blockchain';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { SlippageModal } from '../shared/SlippageModal';

const MAX_ALLOWANCE: bigint = 2n ** 256n - 1n;
const SALE_START_TIMESTAMP = new Date('2025-06-24T14:00:00Z');

function Buy({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { watchTx, r1Balance, fetchR1Balance, currentPriceTier, priceTiers, fetchLicenses } =
        useBlockchainContext() as BlockchainContextType;
    const { authenticated, account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;

    const priceTier: PriceTier = useMemo(() => priceTiers[currentPriceTier - 1], [priceTiers]);

    // Loading component state
    const [isLoading, setLoading] = useState<boolean>(true);

    const [tokenAllowance, setTokenAllowance] = useState<bigint | undefined>();
    const [licenseTokenPrice, setLicenseTokenPrice] = useState<bigint>(0n);

    const [accountUsdSpendingLimit, setAccountUsdSpendingLimit] = useState<number | undefined>();
    const [userUsdMintedAmount, setUserUsdMintedAmount] = useState<bigint | undefined>();

    const [slippageValue, setSlippageValue] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(10);
    const { isOpen, onOpen, onClose: onCloseSlippageModal, onOpenChange } = useDisclosure();

    const [quantity, setQuantity] = useState<string>('1');

    const [isLoadingTx, setLoadingTx] = useState<boolean>(false);

    const [hasSaleStarted, setSaleStarted] = useState<boolean>(isAfter(new Date(), SALE_START_TIMESTAMP));

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

    const getTokenAmount = (withSlippage: boolean = true, withVat: boolean = true): bigint => {
        const vatPercentage: number = account?.vatPercentage || 0;
        const vatMultiplier = 10000n + BigInt(withVat ? vatPercentage : 0);
        const amount: bigint = (BigInt(quantity) * licenseTokenPrice * vatMultiplier) / 10000n;

        if (!withSlippage) {
            return amount;
        }

        const slippageValue = Math.floor(slippage * 100) / 100; // Rounds down to 2 decimal places
        return (amount * BigInt(Math.floor(100 + slippageValue))) / 100n;
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
        if (!hasSaleStarted) {
            toast.error('Sale has not started yet.');
            return;
        }

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

        const { signature, uuid, usdLimitAmount, vatPercentage } = await buyLicense();

        const txHash = await walletClient.writeContract({
            address: config.ndContractAddress,
            abi: NDContractAbi,
            functionName: 'buyLicense',
            args: [
                BigInt(quantity),
                currentPriceTier,
                getTokenAmount(true, false),
                `0x${Buffer.from(uuid).toString('hex')}`,
                BigInt(usdLimitAmount),
                BigInt(vatPercentage),
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

        // If the user is already on the Licenses page, refresh the licenses, otherwise they'll be refreshed when navigating
        if (location.pathname === routePath.licenses) {
            fetchLicenses();
        } else {
            navigate(routePath.licenses);
        }

        onClose();
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

    const isOverAccountUsdSpendingLimit = (): boolean => {
        if (!accountUsdSpendingLimit) return false;

        return parseInt(quantity) * priceTier.usdPrice > accountUsdSpendingLimit;
    };

    const isBuyButtonDisabled = (): boolean =>
        !quantity ||
        !account ||
        !licenseTokenPrice ||
        tokenAllowance === undefined ||
        accountUsdSpendingLimit === undefined ||
        isOverAccountUsdSpendingLimit() ||
        r1Balance < getTokenAmount() ||
        !hasSaleStarted ||
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
                                <RiSettings2Line className="pr-0.5 text-xl text-gray-500" />

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
                                    ~{priceTier.totalUnits - priceTier.soldUnits} left
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
                                                n <= priceTier.totalUnits - priceTier.soldUnits
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

                                            if (isFinite(n) && !isNaN(n) && n < priceTier.totalUnits - priceTier.soldUnits) {
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

                    {/* Total amount due, summary, breakdown */}
                    <div className="flex w-full flex-col rounded-md bg-slate-100 px-6 py-6">
                        <R1ValueWithLabel
                            label="Total amount required"
                            value={parseFloat(Number(formatUnits(getTokenAmount(), 18)).toFixed(2)).toLocaleString('en-US')}
                            isAproximate
                        />

                        <div className="col mt-6 gap-6">
                            {!!quantity && Number.parseInt(quantity) > 0 && (
                                <>
                                    {/* <Divider className="mt-6 bg-slate-200" /> */}

                                    <div className="col gap-2 text-sm font-medium">
                                        <div className="text-base text-slate-400">Summary ($)</div>

                                        <div className="col gap-2">
                                            <div className="row justify-between">
                                                <div>
                                                    {quantity} x License{Number.parseInt(quantity) > 1 ? 's' : ''} (Tier{' '}
                                                    {currentPriceTier})
                                                </div>
                                                <div>
                                                    ${(Number.parseInt(quantity) * priceTier.usdPrice).toLocaleString('en-US')}
                                                </div>
                                            </div>

                                            {!!account && (
                                                <div className="row justify-between">
                                                    <div>VAT {account.vatPercentage / 100}%</div>
                                                    <div>
                                                        $
                                                        {(account.vatPercentage / 10000) *
                                                            Number.parseInt(quantity) *
                                                            priceTier.usdPrice}
                                                    </div>
                                                </div>
                                            )}

                                            <Divider className="mt-1 bg-slate-200" />

                                            <div className="row justify-between pt-1">
                                                <div>Total</div>
                                                <div className="text-primary">
                                                    $
                                                    {(
                                                        ((account?.vatPercentage || 0) / 10000 + 1) *
                                                        Number.parseInt(quantity) *
                                                        priceTier.usdPrice
                                                    ).toLocaleString('en-US')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col gap-2 text-sm font-medium">
                                        <div className="text-base text-slate-400">Breakdown ($R1)</div>

                                        <div className="col gap-2">
                                            <div className="row justify-between">
                                                <div>$R1 amount</div>
                                                <div>
                                                    {parseFloat(
                                                        Number(formatUnits(getTokenAmount(false), 18)).toFixed(2),
                                                    ).toLocaleString('en-US')}
                                                </div>
                                            </div>

                                            <div className="row justify-between">
                                                <div>Slippage</div>

                                                <div className="row gap-1">
                                                    <div>{slippage}%</div>
                                                    <RiSettings2Line
                                                        className="cursor-pointer text-lg text-slate-400 transition-all hover:opacity-50"
                                                        onClick={onOpen}
                                                    />
                                                </div>
                                            </div>

                                            <Divider className="mt-1 bg-slate-200" />

                                            <div className="row justify-between pt-1">
                                                <div>Max. $R1 spent</div>
                                                <div className="text-primary">
                                                    {parseFloat(
                                                        Number(formatUnits(getTokenAmount(), 18)).toFixed(2),
                                                    ).toLocaleString('en-US')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {authenticated && !hasEnoughAllowance() && (
                                <div className="col gap-2 pt-2 text-center text-sm font-medium text-slate-500">
                                    You must first allow the app to spend your $R1 tokens
                                </div>
                            )}

                            <div className={!quantity ? 'mt-6' : ''}>
                                <ConnectWalletWrapper isFullWidth>
                                    <Button
                                        className="min-h-[42px]"
                                        fullWidth
                                        color="primary"
                                        onPress={onPress}
                                        isLoading={isLoadingTx}
                                        isDisabled={isBuyButtonDisabled()}
                                    >
                                        {environment === 'mainnet' && !hasSaleStarted ? (
                                            <div className="row gap-1">
                                                <div>Sale starts in</div>

                                                <Timer
                                                    variant="compact"
                                                    timestamp={SALE_START_TIMESTAMP}
                                                    callback={() => {
                                                        console.log('Sale started');
                                                        setSaleStarted(true);
                                                    }}
                                                />
                                            </div>
                                        ) : r1Balance === 0n ? (
                                            'Insufficient $R1 balance'
                                        ) : isApprovalRequired() ? (
                                            'Approve $R1'
                                        ) : (
                                            'Buy'
                                        )}
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

                    {/* $R1 Balance, buy, add token to wallet */}
                    <div className="flex w-full flex-col gap-4 rounded-md bg-slate-100 px-6 py-6">
                        <R1ValueWithLabel
                            label="Balance"
                            value={parseFloat(Number(formatUnits(r1Balance, 18)).toFixed(2)).toLocaleString('en-US')}
                        />

                        <div className="col center-all gap-2">
                            <Button className="px-3" variant="bordered" as={Link} to={routePath.buy} onPress={onClose}>
                                <div className="row gap-1.5">
                                    <div>
                                        <img src={Logo} alt="Logo" className="h-6 w-6 rounded-full" />
                                    </div>

                                    <div>Get $R1</div>
                                </div>
                            </Button>

                            <AddTokenToWallet contractAddress={config.r1ContractAddress} symbol="R1" decimals={18} />
                        </div>
                    </div>
                </div>
            </div>

            <SlippageModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={onCloseSlippageModal}
                slippageValue={slippageValue}
                setSlippageValue={setSlippageValue}
                slippage={slippage}
                setSlippage={setSlippage}
            />
        </>
    );
}

export default Buy;
