import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { getShortAddressOrHash } from '@lib/utils';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { RiCoinLine } from 'react-icons/ri';
import { formatUnits } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onClose: () => void;
    onSelect: (key: string) => void;
    ethPriceInUsd: number;
}

export const TokenSelectorModal = forwardRef(({ isOpen, onOpenChange, onClose, onSelect, ethPriceInUsd }: Props, ref) => {
    const { fetchErc20Balance } = useBlockchainContext() as BlockchainContextType;
    const [tokenBalances, setTokenBalances] = useState<{ [key: string]: bigint }>({});

    useEffect(() => {}, [tokenBalances]);

    const publicClient = usePublicClient();
    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const onTokenSelect = (key: string) => {
        onSelect(key);
        onClose();
    };

    const getBalances = async () => {
        if (!publicClient || !address) return;

        const balances: { [key: string]: bigint } = {};

        for (const [key, token] of Object.entries(config.swapTokensDetails)) {
            if (token.address) {
                const balance = await fetchErc20Balance(token.address);
                balances[key] = balance;
            } else {
                const balance = await publicClient.getBalance({ address });
                balances[key] = balance;
            }
        }

        setTokenBalances(balances);
    };

    useImperativeHandle(ref, () => ({
        getBalances,
    }));

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            shouldBlockScroll={false}
            classNames={{
                closeButton: 'cursor-pointer',
            }}
        >
            <ModalContent>
                <ModalHeader>Select a token</ModalHeader>

                <ModalBody>
                    <div className="col gap-2">
                        <div className="row gap-1.5 text-slate-500">
                            <RiCoinLine />
                            <div className="text-sm">Your tokens</div>
                        </div>

                        <div className="col">
                            {Object.keys(config.swapTokensDetails).map((key) => (
                                <div
                                    key={key}
                                    className="row -mx-6 cursor-pointer justify-between px-6 py-3 hover:bg-slate-100"
                                    onClick={() => onTokenSelect(key)}
                                >
                                    <div className="row gap-3">
                                        <img
                                            src={config.swapTokensDetails[key].logo}
                                            alt={key}
                                            className="h-[42px] w-[42px] overflow-hidden rounded-full"
                                        />

                                        <div className="col">
                                            <div>{config.swapTokensDetails[key].name}</div>

                                            <div className="row gap-2 text-sm">
                                                <div className="text-slate-500">{key}</div>
                                                {config.swapTokensDetails[key].address && (
                                                    <div className="text-slate-400">
                                                        {getShortAddressOrHash(config.swapTokensDetails[key].address)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col items-end">
                                        <div>
                                            $
                                            {parseFloat(
                                                (!config.swapTokensDetails[key].address
                                                    ? ethPriceInUsd *
                                                      Number(
                                                          formatUnits(
                                                              tokenBalances[key] || 0n,
                                                              config.swapTokensDetails[key].decimals,
                                                          ),
                                                      )
                                                    : Number(
                                                          formatUnits(
                                                              tokenBalances[key] || 0n,
                                                              config.swapTokensDetails[key].decimals,
                                                          ),
                                                      )
                                                ).toFixed(2),
                                            )}
                                        </div>

                                        <div className="text-sm text-slate-500">
                                            {!tokenBalances[key] ? (
                                                <>...</>
                                            ) : (
                                                <>
                                                    {parseFloat(
                                                        formatUnits(tokenBalances[key], config.swapTokensDetails[key].decimals),
                                                    ).toLocaleString('en-US', {
                                                        maximumFractionDigits: config.swapTokensDetails[key].displayDecimals,
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});
