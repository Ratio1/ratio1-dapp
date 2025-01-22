import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';
import { RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { TransactionReceipt } from 'viem';
import { explorerUrl } from './config';

export interface GeneralContextType {
    watchTx: (txHash: string, publicClient: any) => Promise<void>;
}

const GeneralContext = createContext<GeneralContextType | null>(null);

export const useGeneralContext = () => useContext(GeneralContext);

export const GeneralProvider = ({ children }) => {
    const watchTx = async (txHash: string, publicClient) => {
        const waitForTx = async (): Promise<TransactionReceipt> => {
            try {
                const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

                if (receipt.status === 'success') {
                    console.log('Transaction confirmed successfully!', receipt);
                    return receipt;
                } else {
                    throw new Error('Transaction failed, please try again.');
                }
            } catch (error: any) {
                console.error(error.message || error);
                throw error;
            }
        };

        toast.promise(
            waitForTx(),
            {
                loading: 'Transaction loading...',
                success: (receipt) => (
                    <div className="col gap-0.5">
                        <div className="font-medium">Transaction confirmed</div>
                        <div className="row text-sm">
                            <div className="text-slate-500">View transaction details</div>
                            <Link to={`${explorerUrl}/tx/${receipt.transactionHash}`} target="_blank" className="text-primary">
                                <RiExternalLinkLine className="text-lg" />
                            </Link>
                        </div>
                    </div>
                ),
                error: <div>Transaction failed, please try again.</div>,
            },
            {
                success: {
                    duration: 6000,
                },
            },
        );

        await publicClient.waitForTransactionReceipt({ hash: txHash });
    };

    return (
        <GeneralContext.Provider
            value={{
                watchTx,
            }}
        >
            {children}
        </GeneralContext.Provider>
    );
};
