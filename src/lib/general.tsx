import { MNDContractAbi } from '@blockchain/MNDContract';
import { NDContractAbi } from '@blockchain/NDContract';
import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';
import { RiExternalLinkLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { License } from 'types';
import { TransactionReceipt } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { explorerUrl, mndContractAddress, ND_LICENSE_CAP, ndContractAddress } from './config';
import { getLicenseRewardsAndName } from './utils';

export interface GeneralContextType {
    watchTx: (txHash: string, publicClient: any) => Promise<void>;
    fetchLicenses: () => Promise<Array<License>>;
}

const GeneralContext = createContext<GeneralContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useGeneralContext = () => useContext(GeneralContext);

export const GeneralProvider = ({ children }) => {
    const { address } = useAccount();
    const publicClient = usePublicClient();

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
                    <div className="col">
                        <div className="font-medium">Transaction confirmed</div>
                        <div className="row gap-1 text-sm">
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

    const fetchLicenses = async (): Promise<Array<License>> => {
        if (!publicClient || !address) {
            return [];
        }

        const [mndLicense, ndLicenses] = await Promise.all([
            publicClient
                .readContract({
                    address: mndContractAddress,
                    abi: MNDContractAbi,
                    functionName: 'getUserLicense',
                    args: [address],
                })
                .then((userLicense) => {
                    const isLinked = userLicense.nodeAddress !== '0x0000000000000000000000000000000000000000';
                    const type = userLicense.licenseId === 0n ? ('GND' as const) : ('MND' as const);
                    if (!isLinked) {
                        return { ...userLicense, type, isLinked, isBanned: false as const };
                    }
                    const licenseDataPromise = getLicenseRewardsAndName({
                        ...userLicense,
                        type,
                    });
                    return {
                        ...userLicense,
                        type,
                        isLinked,
                        rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                        alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                        isBanned: false as const,
                    };
                }),
            publicClient
                .readContract({
                    address: ndContractAddress,
                    abi: NDContractAbi,
                    functionName: 'getLicenses',
                    args: [address],
                })
                .then((userLicenses) => {
                    return userLicenses.map((license) => {
                        const type = 'ND' as const;
                        const isLinked = license.nodeAddress !== '0x0000000000000000000000000000000000000000';
                        const totalAssignedAmount = ND_LICENSE_CAP;
                        if (!isLinked) {
                            return { ...license, type, totalAssignedAmount, isLinked };
                        }
                        const licenseDataPromise = getLicenseRewardsAndName({ ...license, type, totalAssignedAmount });
                        return {
                            ...license,
                            type,
                            totalAssignedAmount,
                            isLinked,
                            rewards: licenseDataPromise.then(({ rewards_amount }) => rewards_amount),
                            alias: licenseDataPromise.then(({ node_alias }) => node_alias),
                        };
                    });
                }),
        ]);

        console.log({ mndLicense, ndLicenses });

        if (mndLicense.totalAssignedAmount) {
            return [mndLicense, ...ndLicenses];
        }

        return ndLicenses;
    };

    return (
        <GeneralContext.Provider
            value={{
                watchTx,
                fetchLicenses,
            }}
        >
            {children}
        </GeneralContext.Provider>
    );
};
