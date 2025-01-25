interface License {
    /*
    address nodeAddress;
    uint256 totalAssignedAmount;
    uint256 totalClaimedAmount;
    uint256 remainingAmount;
    uint256 lastClaimEpoch;
    uint256 claimableEpochs;
    uint256 assignTimestamp;
    address lastClaimOracle;
    */
    readonly licenseId: bigint;
    nodeAddress: `0x${string}` | '0x0000000000000000000000000000000000000000';
    totalAssignedAmount: bigint;
    totalClaimedAmount: bigint;
    remainingAmount: bigint;
    lastClaimEpoch: bigint;
    claimableEpochs: bigint;
    assignTimestamp: bigint;
    lastClaimOracle: `0x${string}`;

    used: number;
    isExpanded?: boolean;
    isBanned: boolean;
}

interface LinkedLicense extends License {
    alias: string;
    node_address: string;
    rewards: bigint;
}

export type { License, LinkedLicense };
