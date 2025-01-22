import { AssignedLicense, UnassignedLicense } from 'types';

export const getShortAddress = (address: string, size = 4) => `${address.slice(0, size)}...${address.slice(-size)}`;

export function fN(num: number): string {
    if (num >= 1000) {
        const formattedNum = num / 1000;
        return formattedNum % 1 === 0 ? `${formattedNum}K` : `${formattedNum.toFixed(1)}K`;
    }
    return num.toString();
}

export const isLicenseAssigned = (obj: UnassignedLicense | AssignedLicense): obj is AssignedLicense => {
    return 'alias' in obj && 'node_address' in obj;
};

// export const watchTx = async (txHash: string, publicClient) => {
//     const waitForTx = async (): Promise<TransactionReceipt> => {
//         try {
//             const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

//             if (receipt.status === 'success') {
//                 console.log('Transaction confirmed successfully!', receipt);
//                 return receipt;
//             } else {
//                 throw new Error('Transaction failed, please try again.');
//             }
//         } catch (error: any) {
//             console.error(error.message || error);
//             throw error;
//         }
//     };
// };
