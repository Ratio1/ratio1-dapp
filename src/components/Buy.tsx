import { ndContractAddress, r1ContractAddress, r1Price } from '@lib/config';
import { NDContractAbi } from '@blockchain/NDContract';
import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Input } from '@nextui-org/input';
import { isFinite, isNaN } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiMinus } from 'react-icons/bi';
import { RiAddFill, RiArrowRightDoubleLine, RiCpuLine } from 'react-icons/ri';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useGeneralContext, GeneralContextType } from '@lib/general';
import { buyLicense } from '@lib/api/backend';
import { ERC20Abi } from '@blockchain/ERC20';

function Buy({ onClose }) {
    const { watchTx } = useGeneralContext() as GeneralContextType;

    const [tier, setTier] = useState<number>(4);
    const [supply, setSupply] = useState<number>(115);
    const [price, setPrice] = useState<number>(1500);
    const [licenseTokenPrice, setLicenseTokenPrice] = useState<bigint>(0n);

    const [quantity, setQuantity] = useState<string>('1');

    const [isLoadingApprove, setLoadingApprove] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);

    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

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

    const allowR1Spending = async () => {
        try {
            setLoadingApprove(true);

            if (!walletClient || !publicClient) {
                toast.error('Unexpected error, please try again.');
                return;
            }

            const txHash = await walletClient.writeContract({
                address: r1ContractAddress,
                abi: ERC20Abi,
                functionName: 'approve',
                args: [ndContractAddress, (BigInt(quantity) * licenseTokenPrice * 110n) / 100n], // 10% slippage
            });

            await watchTx(txHash, publicClient);

            setLoadingApprove(false);
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
            toast.error(`An error occurred: ${err.message}\nPlease try again.`);
            setLoading(false);
        }
    };

    const buy = async () => {
        try {
            setLoading(true);

            if (!walletClient || !publicClient) {
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
                args: [
                    BigInt(quantity),
                    1, // tier TODO get correct tier
                    `0x${Buffer.from(uuid).toString('hex')}`,
                    `0x${signature}`,
                ],
            });

            await watchTx(txHash, publicClient);

            setLoading(false);

            /*
            setTimeout(() => {
                toast.error('Not enough $R1 in your wallet.', {
                    position: 'top-center',
                });
                setLoading(false);
            }, 300);
            */
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
            toast.error(`An error occurred: ${err.message}\nPlease try again.`);
            setLoading(false);
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
                                ~{supply} left
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
                                        } else if (isFinite(n) && !isNaN(n) && n > 0 && n <= supply) {
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

                                        if (isFinite(n) && !isNaN(n) && n < supply) {
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
                                            {quantity} x License{Number.parseInt(quantity) > 1 ? 's' : ''} (Tier {tier})
                                        </div>
                                        <div className="text-sm font-medium">
                                            ${(Number.parseInt(quantity) * price).toLocaleString('en-US')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mt-6 w-full">
                        <Button className="w-full" color="primary" onPress={allowR1Spending} isLoading={isLoadingApprove}>
                            Allow R1 spending
                        </Button>
                    </div>

                    <div className="mt-2 w-full">
                        <Button className="w-full" color="primary" onPress={buy} isLoading={isLoading}>
                            Buy
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Buy;
