import { ERC20Abi } from '@blockchain/ERC20';
import { NDContractAbi } from '@blockchain/NDContract';
import { buyLicense } from '@lib/api/backend';
import { ndContractAddress, r1ContractAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Input } from '@nextui-org/input';
import { ConnectWalletWrapper } from '@shared/ConnectWalletWrapper';
import { isFinite, isNaN } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiMinus } from 'react-icons/bi';
import { RiAddFill, RiArrowRightDoubleLine, RiCpuLine } from 'react-icons/ri';
import { Stage } from 'typedefs/blockchain';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

function Buy({ onClose, currentStage, stage }: { onClose: () => void; currentStage: number; stage: Stage }) {
    const { watchTx, r1Balance, fetchR1Balance } = useBlockchainContext() as BlockchainContextType;

    const [licenseTokenPrice, setLicenseTokenPrice] = useState<bigint>(0n);
    const [allowance, setAllowance] = useState<bigint | undefined>();

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
        }
    }, [address, publicClient]);

    useEffect(() => {
        if (allowance !== undefined) {
            const divisor = 10n ** BigInt(18);
            console.log('Allowance', Number(allowance / divisor));
        }
    }, [allowance]);

    const getTokenAmount = (): bigint => (BigInt(quantity) * licenseTokenPrice * 110n) / 100n; // 10% slippage

    const isApprovalRequired = (): boolean => allowance !== undefined && allowance < getTokenAmount();

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
                args: [ndContractAddress, getTokenAmount()],
            });

            await watchTx(txHash, publicClient);

            fetchAllowance(publicClient, address);

            setLoading(false);
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
            toast.error(`An error occurred: ${err.message}\nPlease try again.`);
            setLoading(false);
        }
    };

    const buy = async () => {
        try {
            if (getTokenAmount() > r1Balance) {
                toast.error('Not enough $R1 in your wallet.');
                return;
            }

            setLoading(true);

            if (!walletClient || !publicClient || !address) {
                toast.error('Unexpected error, please try again.');
                return;
            }

            const { signature, uuid } = await buyLicense({
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
                args: [BigInt(quantity), currentStage, `0x${Buffer.from(uuid).toString('hex')}`, `0x${signature}`],
            });

            await watchTx(txHash, publicClient);

            fetchAllowance(publicClient, address);
            fetchR1Balance();

            setLoading(false);
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
            toast.error(`An error occurred: ${err.message}\nPlease try again.`);
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

    return (
        <div className="my-4 flex flex-col gap-6">
            <div className="row gap-2">
                <Button isIconOnly variant="flat" className="bg-lightAccent" onPress={onClose}>
                    <div className="text-[22px]">
                        <RiArrowRightDoubleLine />
                    </div>
                </Button>
            </div>

            <div className="col gap-4">
                <div className="col overflow-hidden rounded-md border border-slate-200 bg-lightAccent">
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

                <div className="flex w-full flex-col rounded-md bg-lightAccent px-10 py-8">
                    <div className="col gap-1.5 text-center">
                        <div className="text-sm font-medium text-slate-500">Total amount due</div>

                        <div className="center-all gap-1">
                            <div className="text-2xl font-semibold text-slate-400">~$R1</div>
                            <div className="text-2xl font-semibold text-primary">
                                {((BigInt(quantity) * licenseTokenPrice) / 10n ** 18n).toLocaleString('en-US')}
                            </div>
                        </div>
                    </div>

                    {!!quantity && Number.parseInt(quantity) > 0 && (
                        <>
                            <Divider className="my-6 bg-slate-200" />

                            <div className="col gap-4">
                                <div className="text-sm font-medium text-slate-500">Summary</div>

                                <div className="col gap-2">
                                    <div className="row justify-between">
                                        <div className="text-sm font-medium">
                                            {quantity} x License{Number.parseInt(quantity) > 1 ? 's' : ''} (Tier {currentStage})
                                        </div>
                                        <div className="text-sm font-medium">
                                            ${(Number.parseInt(quantity) * stage.usdPrice).toLocaleString('en-US')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mt-6">
                        <ConnectWalletWrapper isFullWidth>
                            <Button
                                fullWidth
                                color="primary"
                                onPress={onPress}
                                isLoading={isLoading}
                                isDisabled={allowance === undefined}
                            >
                                {isApprovalRequired() ? 'Approve $R1' : 'Buy'}
                            </Button>
                        </ConnectWalletWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Buy;
