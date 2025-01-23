import { Button } from '@nextui-org/button';
import { Divider } from '@nextui-org/divider';
import { Input } from '@nextui-org/input';
import { isFinite, isNaN, sumBy } from 'lodash';
import { useState } from 'react';
import { BiMinus } from 'react-icons/bi';
import { RiAddFill, RiArrowRightDoubleLine, RiCpuLine } from 'react-icons/ri';

function Buy({ onClose }) {
    const [tier, setTier] = useState<number>(4);

    const [supplies, setSupplies] = useState([
        // Starting from Tier 4
        5, 5, 5, 5, 5,
    ]);

    const [prices, setPrices] = useState([
        // Starting from Tier 4
        1500, 2000, 2500, 3000, 3500,
    ]);

    const [quantity, setQuantity] = useState<string>('1');

    const getRundown = (
        q: number,
    ): Array<{
        tier: number;
        quantity: number;
        amount: number;
    }> => {
        if (!q) {
            return [];
        }

        let index = 0;
        const array: Array<{
            tier: number;
            quantity: number;
            amount: number;
        }> = [];

        while (q > 0 && index < supplies.length) {
            const supply = supplies[index];

            if (q > supply) {
                array.push({
                    tier: tier + index,
                    quantity: supply,
                    amount: supply * prices[index],
                });

                q -= supply;
            } else {
                array.push({
                    tier: tier + index,
                    quantity: q,
                    amount: q * prices[index],
                });

                q = 0;
            }

            index++;
        }

        return array;
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
                    <div className="row gap-2.5 p-4">
                        <div className="rounded-md bg-primary p-1.5 text-white">
                            <RiCpuLine className="text-xl" />
                        </div>

                        <div className="text-base font-medium">Node Licenses</div>
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

                                        if (isFinite(n) && !isNaN(n) && n >= 1) {
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
                                        } else if (isFinite(n) && !isNaN(n) && n > 0) {
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

                                        if (isFinite(n) && !isNaN(n)) {
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
                        <div className="text-sm font-medium text-slate-500">Total amount</div>
                        <div className="text-2xl font-semibold text-primary">
                            ${sumBy(getRundown(Number.parseInt(quantity)), 'amount').toLocaleString('en-US')}
                        </div>
                    </div>

                    {!!quantity && Number.parseInt(quantity) > 0 && (
                        <>
                            <Divider className="my-6 bg-slate-200" />

                            <div className="col gap-4">
                                <div className="text-sm font-medium text-slate-500">Summary</div>

                                <div className="col gap-2">
                                    {getRundown(Number.parseInt(quantity)).map((item) => (
                                        <div key={item.tier} className="row justify-between">
                                            <div className="text-sm font-medium">
                                                {item.quantity} x License{item.quantity > 1 ? 's' : ''} (Tier {item.tier})
                                            </div>
                                            <div className="text-sm font-medium">${item.amount.toLocaleString('en-US')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Divider className="my-6 bg-slate-200" />

                    <div className="row justify-between">
                        <div className="font-medium">Total</div>
                        <div className="font-medium text-primary">
                            ${sumBy(getRundown(Number.parseInt(quantity)), 'amount').toLocaleString('en-US')}
                        </div>
                    </div>

                    <div className="mt-6 w-full">
                        <Button className="w-full" color="primary">
                            Buy
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Buy;
