interface License {
    readonly id: number;
    used: number;
    assignTimestamp: Date;
    isExpanded?: boolean;
    isBanned?: boolean;
}

interface LinkedLicense extends License {
    alias: string;
    node_address: string;
    rewards: number;
}

export type { License, LinkedLicense };
