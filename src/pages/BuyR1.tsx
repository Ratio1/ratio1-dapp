import R1Logo from '@assets/token.svg';
import { ERC20Abi } from '@blockchain/ERC20';
import { UniswapV2RouterAbi } from '@blockchain/UniswapV2Router';
import { TokenSelectorModal } from '@components/TokenSelectorModal';
import { config } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { fBI } from '@lib/utils';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/modal';
import { AddTokenToWallet } from '@shared/AddTokenToWallet';
import { BigCard } from '@shared/BigCard';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { DualTxsModal } from '@shared/DualTxsModal';
import { SlippageModal } from '@shared/SlippageModal';
import { EthAddress } from '@typedefs/blockchain';
import { FunctionComponent, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowDownLine, RiArrowDownSLine, RiSettings2Line } from 'react-icons/ri';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

function BuyR1() {
    const { watchTx, r1Balance, fetchR1Balance, fetchErc20Balance } = useBlockchainContext() as BlockchainContextType;
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const [selectedTokenKey, setSelectedTokenKey] = useState<string>(Object.keys(config.swapTokensDetails)[0]);
    const selectedToken = useMemo(() => config.swapTokensDetails[selectedTokenKey], [selectedTokenKey]);
    const [fromAmount, setFromAmount] = useState<string>(selectedToken.fromAmount);
    const [r1Estimate, setR1Estimate] = useState<string>('0');
    const [expectedPrice, setExpectedPrice] = useState<number>(0);
    const [userTokenBalance, setUserTokenBalance] = useState<bigint>(0n);
    const [ethPriceInUsd, setEthPriceInUsd] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const hasSufficientBalance = useMemo(() => {
        return userTokenBalance >= parseUnits(fromAmount, selectedToken.decimals);
    }, [userTokenBalance, fromAmount]);

    const [slippageValue, setSlippageValue] = useState<string>('5');
    const [slippage, setSlippage] = useState<number>(5);

    const {
        isOpen: isSlippageModalOpen,
        onOpen: onSlippageModalOpen,
        onClose: onCloseSlippageModal,
        onOpenChange: onSlippageModalOpenChange,
    } = useDisclosure();

    const {
        isOpen: isTokenSelectorOpen,
        onOpen: onTokenSelectorOpen,
        onClose: onCloseTokenSelector,
        onOpenChange: onTokenSelectorOpenChange,
    } = useDisclosure();

    const {
        isOpen: isDualTxsModalOpen,
        onOpen: onDualTxsModalOpen,
        onClose: onDualTxsModalClose,
        onOpenChange: onDualTxsModalOpenChange,
    } = useDisclosure();

    const tokenSelectorModalRef = useRef<{ getBalances: () => void }>(null);

    const minAmountOut = useMemo(() => {
        const slippageValue = Math.floor(slippage * 100) / 100; // Rounds down to 2 decimal places
        return (parseUnits(r1Estimate, 18) * BigInt(Math.floor(100 - slippageValue))) / 100n;
    }, [r1Estimate, slippage]);

    const dualTxsModalRef = useRef<{ progress: () => void; init: () => void }>(null);

    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const publicClient = usePublicClient();

    const fetchEstimatedR1 = async () => {
        if (Number(fromAmount) === 0) {
            setR1Estimate('0');
            setExpectedPrice(0);
            return;
        }
        if (!publicClient) return;

        try {
            const amountsOut = await publicClient.readContract({
                address: config.uniswapV2RouterAddress,
                abi: UniswapV2RouterAbi,
                functionName: 'getAmountsOut',
                args: [parseUnits(fromAmount, selectedToken.decimals), selectedToken.swapPath],
            });

            const estimatedR1 = formatUnits(amountsOut[amountsOut.length - 1], 18);
            setR1Estimate(estimatedR1);
            setExpectedPrice(parseFloat(fromAmount) / parseFloat(estimatedR1));
        } catch (error) {
            toast.error('Unexpected error, please try again.');
            console.error(error);
            setR1Estimate('0');
            setExpectedPrice(0);
        }
    };

    const fetchUserBalance = () => {
        setUserTokenBalance(0n);

        if (selectedToken.address) {
            fetchErc20Balance(selectedToken.address).then(setUserTokenBalance);
        } else {
            if (!publicClient || !address) return;
            publicClient.getBalance({ address }).then(setUserTokenBalance);
        }
    };

    const fetchEthPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            setEthPriceInUsd(data.ethereum.usd);
        } catch (error) {
            console.error('Error fetching ETH price:', error);
        }
    };

    useEffect(() => {
        fetchEstimatedR1();
    }, [fromAmount, selectedToken]);

    useEffect(() => {
        fetchUserBalance();
        fetchEthPrice();
    }, [address, selectedToken]);

    const swapForR1 = async () => {
        if (!walletClient || !address) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
        const amountIn = parseUnits(fromAmount, selectedToken.decimals);

        if (!amountIn) {
            toast.error('Please enter a valid amount.');
            return;
        }

        if (amountIn > userTokenBalance) {
            toast.error('Insufficient balance.');
            return;
        }

        try {
            setIsLoading(true);

            if (selectedToken.address) {
                if (dualTxsModalRef.current) {
                    dualTxsModalRef.current.init();
                }

                onDualTxsModalOpen();

                const approve = async () => {
                    console.log('Approving token spending...', selectedToken.address);

                    const approveTxHash = await walletClient.writeContract({
                        address: selectedToken.address as EthAddress,
                        abi: ERC20Abi,
                        functionName: 'approve',
                        args: [config.uniswapV2RouterAddress, amountIn],
                    });

                    await watchTx(approveTxHash, publicClient);
                };

                const swap = async () => {
                    const swapTxHash = await walletClient.writeContract({
                        address: config.uniswapV2RouterAddress,
                        abi: UniswapV2RouterAbi,
                        functionName: 'swapExactTokensForTokens',
                        args: [amountIn, minAmountOut, selectedToken.swapPath, address, BigInt(deadline)],
                    });

                    await watchTx(swapTxHash, publicClient);
                };

                await approve();

                if (dualTxsModalRef.current) {
                    dualTxsModalRef.current.progress();
                }

                await swap();
            } else {
                const txHash = await walletClient.writeContract({
                    address: config.uniswapV2RouterAddress,
                    abi: UniswapV2RouterAbi,
                    functionName: 'swapExactETHForTokens',
                    args: [minAmountOut, selectedToken.swapPath, address, BigInt(deadline)],
                    value: amountIn,
                });
                await watchTx(txHash, publicClient);
            }

            fetchR1Balance();
            fetchUserBalance();
            fetchEstimatedR1();
        } catch (error) {
            toast.error('Unexpected error, please try again.');
            console.error(error);
        } finally {
            setIsLoading(false);
            onDualTxsModalClose();
        }
    };

    return (
        <div className="center-all w-full flex-col">
            <div className="w-full sm:w-auto">
                <BigCard variant="white" fullWidth>
                    <div className="text-xl font-bold lg:text-2xl">Swap</div>

                    <div className="col w-full gap-4 sm:min-w-[320px] md:w-[400px]">
                        <div className="col">
                            <SwapInput label="You pay">
                                <div className="row justify-between">
                                    <input
                                        type="number"
                                        value={fromAmount}
                                        onChange={(e) => {
                                            const value: string = e.target.value;
                                            const n = Number.parseFloat(value);

                                            if (value === '') {
                                                setFromAmount('');
                                            } else if (n === 0) {
                                                setFromAmount(value);
                                            } else if (isFinite(n) && !isNaN(n) && n >= 0) {
                                                setFromAmount(n.toString());
                                            }
                                        }}
                                        className="w-full border-none bg-transparent text-2xl font-semibold focus:outline-none"
                                    />

                                    <div
                                        className="row cursor-pointer gap-1.5 rounded-full border border-slate-100 bg-white px-1.5 py-1 shadow-round transition-all hover:border-primary"
                                        onClick={() => {
                                            if (tokenSelectorModalRef.current) {
                                                tokenSelectorModalRef.current.getBalances();
                                                onTokenSelectorOpen();
                                            }
                                        }}
                                    >
                                        <img
                                            src={selectedToken.logo}
                                            alt={selectedTokenKey}
                                            className="h-7 w-7 min-w-7 overflow-hidden rounded-full"
                                        />
                                        <div className="select-none text-sm font-medium">{selectedTokenKey}</div>
                                        <RiArrowDownSLine className="-ml-1 text-xl" />
                                    </div>
                                </div>

                                <div className="row justify-between text-sm text-slate-500">
                                    {fromAmount.length && (
                                        <div>
                                            ≈ $
                                            {parseFloat(
                                                (!selectedToken.address
                                                    ? ethPriceInUsd * Number.parseFloat(fromAmount)
                                                    : Number.parseFloat(fromAmount)
                                                ).toFixed(2),
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        Balance:{' '}
                                        {parseFloat(formatUnits(userTokenBalance, selectedToken.decimals)).toLocaleString(
                                            'en-US',
                                            {
                                                maximumFractionDigits: selectedToken.displayDecimals,
                                            },
                                        )}{' '}
                                        {selectedTokenKey}
                                    </div>
                                </div>
                            </SwapInput>

                            <div className="center-all z-10 -my-4">
                                <div className="center-all rounded-full border-4 border-white bg-slate-50 p-2.5">
                                    <RiArrowDownLine className="text-2xl text-slate-600" />
                                </div>
                            </div>

                            <SwapInput label="You receive">
                                <div className="row justify-between">
                                    <span className="text-2xl font-semibold">
                                        {parseFloat(Number(r1Estimate).toFixed(2)).toLocaleString('en-US')}
                                    </span>

                                    <div className="row gap-1.5 rounded-full border border-slate-100 bg-white px-1.5 py-1 shadow-round">
                                        <img src={R1Logo} alt="R1" className="h-7 w-7 rounded-full" />

                                        <div className="mr-1 select-none text-sm font-medium">$R1</div>
                                    </div>
                                </div>

                                <div className="row justify-end text-sm text-slate-500">
                                    <div>
                                        Balance:{' '}
                                        {r1Balance < 1000000000000000000000n
                                            ? parseFloat(Number(formatUnits(r1Balance ?? 0n, 18)).toFixed(2))
                                            : fBI(r1Balance, 18)}{' '}
                                        $R1
                                    </div>
                                </div>
                            </SwapInput>
                        </div>

                        <ConnectWalletWrapper classNames="min-h-[52px] rounded-2xl text-base">
                            <Button
                                className="min-h-[52px] rounded-2xl text-base"
                                color="primary"
                                fullWidth
                                onPress={swapForR1}
                                isLoading={isLoading}
                                isDisabled={isLoading || !authenticated || !fromAmount || !hasSufficientBalance}
                            >
                                {hasSufficientBalance ? 'Buy' : 'Insufficient balance'}
                            </Button>
                        </ConnectWalletWrapper>

                        <div className="col gap-2 text-sm">
                            <Row label="Rate">
                                <div>
                                    1 $R1 ={' '}
                                    {expectedPrice.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: selectedToken.displayDecimals,
                                    })}{' '}
                                    {selectedTokenKey}
                                </div>
                            </Row>

                            <Row label="Slippage">
                                <div className="row gap-1">
                                    <div>{slippage}%</div>
                                    <RiSettings2Line
                                        className="cursor-pointer text-lg text-slate-400 transition-all hover:opacity-50"
                                        onClick={onSlippageModalOpen}
                                    />
                                </div>
                            </Row>

                            <Row label="Minimum Received">
                                {parseFloat(Number(formatUnits(minAmountOut, 18)).toFixed(2)).toLocaleString('en-US')}
                            </Row>
                        </div>

                        <AddTokenToWallet contractAddress={config.r1ContractAddress} symbol="R1" decimals={18} />
                    </div>
                </BigCard>
            </div>

            <SlippageModal
                isOpen={isSlippageModalOpen}
                onOpenChange={onSlippageModalOpenChange}
                onClose={onCloseSlippageModal}
                slippageValue={slippageValue}
                setSlippageValue={setSlippageValue}
                slippage={slippage}
                setSlippage={setSlippage}
            />

            <TokenSelectorModal
                ref={tokenSelectorModalRef}
                isOpen={isTokenSelectorOpen}
                onOpenChange={onTokenSelectorOpenChange}
                onClose={onCloseTokenSelector}
                onSelect={setSelectedTokenKey}
                ethPriceInUsd={ethPriceInUsd}
            />

            <DualTxsModal
                ref={dualTxsModalRef}
                isOpen={isDualTxsModalOpen}
                onOpenChange={onDualTxsModalOpenChange}
                text="approve token spending and then swap"
            />
        </div>
    );
}

export default BuyR1;

const SwapInput: FunctionComponent<PropsWithChildren<{ label: string }>> = ({ children, label }) => (
    <div className="col w-full gap-2 rounded-2xl border-2 border-slate-50 bg-slate-50 p-4">
        <label className="text-sm text-slate-500">{label}</label>

        {children}
    </div>
);

const Row: FunctionComponent<PropsWithChildren<{ label: string }>> = ({ children, label }) => (
    <div className="row justify-between">
        <div className="text-slate-400">{label}</div>
        <div>{children}</div>
    </div>
);
