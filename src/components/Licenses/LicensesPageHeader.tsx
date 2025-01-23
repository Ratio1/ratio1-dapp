import Logo from '@assets/token_white.svg';
import abi from '@blockchain/abi.json';
import { contractAddress, genesisDate } from '@lib/config';
import { GeneralContextType, useGeneralContext } from '@lib/general';
import { Button } from '@nextui-org/button';
import { Tab, Tabs } from '@nextui-org/tabs';
import { Timer } from '@shared/Timer';
import { addDays, differenceInDays } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { usePublicClient, useWalletClient } from 'wagmi';

function LicensesPageHeader({ onFilterChange }) {
    const { watchTx } = useGeneralContext() as GeneralContextType;

    const [timestamp] = useState<Date>(addDays(genesisDate, 1 + differenceInDays(new Date(), genesisDate)));
    const [isLoading, setLoading] = useState<boolean>(false);

    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();

    const claimAll = async () => {
        if (!walletClient || !publicClient) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        try {
            setLoading(true);

            const txHash = await walletClient.writeContract({
                address: contractAddress,
                abi,
                functionName: 'store',
                args: [27],
            });

            console.log(`Transaction sent! Hash: ${txHash}`);

            await watchTx(txHash, publicClient);

            console.log('Finished watching transaction.');
        } catch (err: any) {
            console.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const debug = () => {
        toast.loading('Successfully toasted!');
    };

    return (
        <div className="flex gap-6">
            <div className="relative w-full rounded-3xl">
                <div className="col relative z-10 h-full gap-6 rounded-3xl bg-[#3f67bf] px-8 py-7">
                    <div className="flex justify-between gap-20 border-b-2 border-white/10 pb-6">
                        <div className="row gap-2.5">
                            <img src={Logo} alt="Logo" className="h-7 filter" />
                            <div className="text-lg font-medium text-white">Rewards</div>
                        </div>

                        {/* <Button className="h-9" color="primary" size="sm" variant="faded" onPress={debug}>
                            <div className="text-sm">Debug</div>
                        </Button> */}

                        <Button
                            className="h-9"
                            color="primary"
                            size="sm"
                            variant="faded"
                            isLoading={isLoading}
                            onPress={claimAll}
                        >
                            <div className="text-sm">Claim all</div>
                        </Button>
                    </div>

                    <div className="col gap-10">
                        <div className="row justify-between">
                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Claimable ($R1)</div>
                                <div className="text-xl font-medium text-white">46.2</div>
                            </div>

                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Earned ($R1)</div>
                                <div className="text-xl font-medium text-white">1012.895</div>
                            </div>

                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Future Claimable ($R1)</div>
                                <div className="text-xl font-medium text-white">199.2k</div>
                            </div>

                            <div className="col gap-1">
                                <div className="text-sm font-medium text-white/85">Future Claimable ($)</div>
                                <div className="text-xl font-medium text-white">$862.825k</div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="col gap-1.5">
                                <div className="text-lg font-medium text-white">Licenses</div>

                                <Tabs
                                    aria-label="Tabs"
                                    color="default"
                                    radius="lg"
                                    size="lg"
                                    classNames={{
                                        tabList: 'p-1.5 bg-[#345aad]',
                                        tabContent: 'text-[15px] text-white',
                                    }}
                                    onSelectionChange={(key) => {
                                        onFilterChange(key);
                                    }}
                                >
                                    <Tab key="all" title="All" />
                                    <Tab
                                        key="linked"
                                        title={
                                            <div className="row gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                Linked
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="unlinked"
                                        title={
                                            <div className="row gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                Unlinked
                                            </div>
                                        }
                                    />
                                </Tabs>
                            </div>

                            <div className="row gap-3">
                                <div className="font-medium text-white">Next rewards in</div>
                                <Timer
                                    timestamp={timestamp}
                                    callback={() => {
                                        console.log('Timer');
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-1 left-0 right-0 h-20 rounded-3xl bg-[#658bdc]"></div>
            </div>
        </div>
    );
}

export default LicensesPageHeader;
