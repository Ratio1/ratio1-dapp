export const MNDContractAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'tokenAddress',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'approved',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'bool',
                name: 'approved',
                type: 'bool',
            },
        ],
        name: 'ApprovalForAll',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'totalAssignedAmount',
                type: 'uint256',
            },
        ],
        name: 'LicenseCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'licenseId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'nodeAddress',
                type: 'address',
            },
        ],
        name: 'LinkNode',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Paused',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'newSigner',
                type: 'address',
            },
        ],
        name: 'SignerAdded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'removedSigner',
                type: 'address',
            },
        ],
        name: 'SignerRemoved',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'licenseId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'oldNodeAddress',
                type: 'address',
            },
        ],
        name: 'UnlinkNode',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'Unpaused',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'newTotalAssignedAmount',
                type: 'uint256',
            },
        ],
        name: 'addLicense',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newSigner',
                type: 'address',
            },
        ],
        name: 'addSigner',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256[]',
                        name: 'epochs',
                        type: 'uint256[]',
                    },
                    {
                        internalType: 'uint8[]',
                        name: 'availabilies',
                        type: 'uint8[]',
                    },
                ],
                internalType: 'struct ComputeRewardsParams',
                name: 'paramsArray',
                type: 'tuple',
            },
        ],
        name: 'calculateRewards',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'rewardsAmount',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct ComputeRewardsResult',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256[]',
                        name: 'epochs',
                        type: 'uint256[]',
                    },
                    {
                        internalType: 'uint8[]',
                        name: 'availabilies',
                        type: 'uint8[]',
                    },
                ],
                internalType: 'struct ComputeRewardsParams',
                name: 'computeParam',
                type: 'tuple',
            },
            {
                internalType: 'bytes[]',
                name: 'signatures',
                type: 'bytes[]',
            },
        ],
        name: 'claimRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'getApproved',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getCurrentEpoch',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'addr',
                type: 'address',
            },
        ],
        name: 'getUserLicense',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalAssignedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalClaimedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'remainingAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastClaimEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'claimableEpochs',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assignTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'lastClaimOracle',
                        type: 'address',
                    },
                ],
                internalType: 'struct LicenseInfo',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'operator',
                type: 'address',
            },
        ],
        name: 'isApprovedForAll',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'licenses',
        outputs: [
            {
                internalType: 'address',
                name: 'nodeAddress',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'totalAssignedAmount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'totalClaimedAmount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'lastClaimEpoch',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'assignTimestamp',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'lastClaimOracle',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'licenseId',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'newNodeAddress',
                type: 'address',
            },
        ],
        name: 'linkNode',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'minimumRequiredSignatures',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'ownerOf',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'registeredNodeAddresses',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'signerToRemove',
                type: 'address',
            },
        ],
        name: 'removeSigner',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
            {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
            },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'operator',
                type: 'address',
            },
            {
                internalType: 'bool',
                name: 'approved',
                type: 'bool',
            },
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newLpWallet',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'newExpensesWallet',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'newMarketingWallet',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'newGrantsWallet',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'newCsrWallet',
                type: 'address',
            },
        ],
        name: 'setCompanyWallets',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint8',
                name: 'minimumRequiredSignatures_',
                type: 'uint8',
            },
        ],
        name: 'setMinimumRequiredSignatures',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'ndContract_',
                type: 'address',
            },
        ],
        name: 'setNDContract',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'signerAdditionTimestamp',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'signerSignaturesCount',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'signers',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes4',
                name: 'interfaceId',
                type: 'bytes4',
            },
        ],
        name: 'supportsInterface',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256',
            },
        ],
        name: 'tokenByIndex',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256',
            },
        ],
        name: 'tokenOfOwnerByIndex',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'tokenURI',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalLicensesAssignedTokensAmount',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'licenseId',
                type: 'uint256',
            },
        ],
        name: 'unlinkNode',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'unpause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256[]',
                        name: 'epochs',
                        type: 'uint256[]',
                    },
                    {
                        internalType: 'uint8[]',
                        name: 'availabilies',
                        type: 'uint8[]',
                    },
                ],
                internalType: 'struct ComputeRewardsParams',
                name: 'computeParam',
                type: 'tuple',
            },
            {
                internalType: 'bytes[]',
                name: 'signatures',
                type: 'bytes[]',
            },
        ],
        name: 'verifyRewardsSignatures',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;
