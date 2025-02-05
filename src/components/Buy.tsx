import { ERC20Abi } from '@blockchain/ERC20';
import { NDContractAbi } from '@blockchain/NDContract';
import { buyLicense } from '@lib/api/backend';
import { ndContractAddress, r1ContractAddress } from '@lib/config';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Form } from '@nextui-org/form';
import { Input } from '@nextui-org/input';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/modal';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import clsx from 'clsx';
import { isFinite, isNaN } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiMinus } from 'react-icons/bi';
import { RiAddFill, RiArrowRightDoubleLine, RiCheckLine, RiCpuLine, RiEqualizer2Line, RiPriceTag3Line } from 'react-icons/ri';
import { Stage } from 'typedefs/blockchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

const DANGEROUS_SLIPPAGE = 0.5;
const MAX_ALLOWANCE: bigint = 2n ** 256n - 1n;

function Buy({ onClose, currentStage, stage }: { onClose: () => void; currentStage: number; stage: Stage }) {
    const { watchTx, r1Balance, fetchR1Balance } = useBlockchainContext() as BlockchainContextType;
    const { authenticated, account } = useAuthenticationContext() as AuthenticationContextType;

    const [licenseTokenPrice, setLicenseTokenPrice] = useState<bigint>(0n);
    const [userUsdMintedAmount, setUserUsdMintedAmount] = useState<bigint | undefined>();

    const [allowance, setAllowance] = useState<bigint | undefined>();

    const [slippageValue, setSlippageValue] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(10);
    const { isOpen, onOpen, onClose: onCloseSlippageModal, onOpenChange } = useDisclosure(); // Slippage modal

    const [quantity, setQuantity] = useState<string>('1');

    const [isLoading, setLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = useAccount();

    useEffect(() => {
        if (!publicClient) {
            return;
        }

        publicClient
            .readContract({
                address: ndContractAddress,
                abi: NDContractAbi,
                functionName: 'getLicenseTokenPrice',
            })
            .then(setLicenseTokenPrice);
    }, []);

    useEffect(() => {
        if (publicClient && address) {
            fetchAllowance(publicClient, address);

            publicClient
                .readContract({
                    address: ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'userUsdMintedAmount',
                    args: [address],
                })
                .then(setUserUsdMintedAmount);
        }
    }, [address, publicClient]);

    const getTokenAmount = (): bigint => {
        const slippageValue = Math.floor(slippage * 100) / 100; // Rounds down to 2 decimal places
        return (BigInt(quantity) * licenseTokenPrice * BigInt(Math.floor(100 + slippageValue))) / 100n;
    };

    const isApprovalRequired = (): boolean => allowance !== undefined && allowance < MAX_ALLOWANCE;

    const fetchAllowance = (publicClient, address: string) =>
        publicClient
            .readContract({
                address: r1ContractAddress,
                abi: ERC20Abi,
                functionName: 'allowance',
                args: [address, ndContractAddress],
            })
            .then(setAllowance);

    const approve = async () => {
        try {
            setLoading(true);

            if (!walletClient || !publicClient || !address) {
                toast.error('Unexpected error, please try again.');
                return;
            }

            const txHash = await walletClient.writeContract({
                address: r1ContractAddress,
                abi: ERC20Abi,
                functionName: 'approve',
                args: [ndContractAddress, MAX_ALLOWANCE],
            });

            await watchTx(txHash, publicClient);

            fetchAllowance(publicClient, address);

            setLoading(false);
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
            toast.error('An error occurred, please try again.');
            setLoading(false);
        }
    };

    const buy = async () => {
        try {
            if (getTokenAmount() > r1Balance) {
                toast.error('Not enough $R1 in your wallet.');
                console.error(`Required $R1 ${getTokenAmount()} > your balance ${r1Balance}`);
                return;
            }

            setLoading(true);

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
                address: ndContractAddress,
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

            fetchAllowance(publicClient, address);
            fetchR1Balance();

            setLoading(false);
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
            toast.error('An error occurred, please try again.');
            setLoading(false);
        }
    };

    const onPress = async () => {
        if (isApprovalRequired()) {
            await approve();
        } else {
            await buy();
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

    // TODO: Production: || account.kycStatus !== KycStatus.Completed
    const isBuyingDisabled = (): boolean => !account || !licenseTokenPrice || allowance === undefined;

    return (
        <>
            <div className="my-4 flex flex-col gap-6">
                <div className="row justify-between gap-4">
                    <Button isIconOnly variant="flat" className="bg-lightBlue" onPress={onClose}>
                        <div className="text-[22px]">
                            <RiArrowRightDoubleLine />
                        </div>
                    </Button>

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
                </div>

                <div className="col gap-4">
                    <div className="col bg-lightBlue overflow-hidden rounded-md border border-slate-200">
                        <div className="row justify-between p-4">
                            <div className="row gap-2.5">
                                <div className="rounded-md bg-primary p-1.5 text-white">
                                    <RiCpuLine className="text-xl" />
                                </div>

                                <div className="text-base font-medium">Node Licenses</div>
                            </div>

                            <div className="flex">
                                <div className="rounded-md bg-orange-100 px-2 py-1 text-sm font-medium tracking-wider text-orange-600">
                                    ~{stage.totalUnits - stage.soldUnits} left
                                </div>
                            </div>
                        </div>

                        <div className="flex border-t border-slate-200 bg-white p-4">
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

                    <div className="bg-lightBlue flex w-full flex-col rounded-md px-8 py-8">
                        <div className="col gap-1.5 text-center">
                            <div className="text-sm font-medium text-slate-500">Total amount required</div>

                            <div className="center-all gap-1">
                                <div className="text-2xl font-semibold text-slate-400">~$R1</div>
                                <div className="text-2xl font-semibold text-primary">
                                    {parseFloat((Number(getTokenAmount()) / Math.pow(10, 18)).toFixed(2))}
                                </div>
                            </div>
                        </div>

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

                            {authenticated && (
                                <div className="col gap-2 pt-2 text-sm text-slate-500">
                                    <div className="">You may be asked to sign 2 transactions:</div>

                                    <div className="col gap-1">
                                        <div
                                            className={clsx('row gap-2', {
                                                'text-green-600': !isApprovalRequired(),
                                            })}
                                        >
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

                            <div>
                                <ConnectWalletWrapper isFullWidth>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onPress={onPress}
                                        isLoading={isLoading}
                                        isDisabled={isBuyingDisabled()}
                                    >
                                        {isApprovalRequired() ? 'Approve $R1' : 'Buy'}
                                    </Button>
                                </ConnectWalletWrapper>
                            </div>
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
