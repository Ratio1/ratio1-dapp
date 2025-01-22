interface License {
    readonly id: number;
    used: number;
    isExpanded?: boolean;
}

interface UnassignedLicense extends License {
    cooldownTimestamp?: Date;
}

interface AssignedLicense extends License {
    alias: string;
    node_address: string;
    rewards: number;
}

export type { AssignedLicense, License, UnassignedLicense };
