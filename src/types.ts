interface License {
    readonly id: number;
    used: number;
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
