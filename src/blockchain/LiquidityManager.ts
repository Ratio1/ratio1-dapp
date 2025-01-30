export const LiquidityManagerAbi = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'r1Amount',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'liquidityReceiver',
                type: 'address',
            },
        ],
        name: 'addLiquidity',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getTokenPrice',
        outputs: [
            {
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;
