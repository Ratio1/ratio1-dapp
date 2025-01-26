type R1Address = `0xai${string}`;
type EthAddress = `0x${string}`;

type BaseLicense = {
    readonly licenseId: bigint;
    nodeAddress: EthAddress;
    totalClaimedAmount: bigint;
    remainingAmount: bigint;
    lastClaimEpoch: bigint;
    claimableEpochs: bigint;
    assignTimestamp: bigint;
    lastClaimOracle: EthAddress;
    totalAssignedAmount: bigint;
    isExpanded?: boolean;
} & (
    | {
          isLinked: true;
          alias: Promise<string>;
          rewards: Promise<bigint>;
      }
    | {
          isLinked: false;
      }
);

type NDLicense = BaseLicense & {
    type: 'ND';
    isBanned: boolean;
};

type MNDLicense = BaseLicense & {
    type: 'MND';
    isBanned: false;
};

type GNDLicense = BaseLicense & {
    type: 'GND';
    isBanned: false;
};

type License = NDLicense | MNDLicense | GNDLicense;

type NodeAvailabilityResult = {
    node: string;
    node_alias: string;
    node_eth_address: EthAddress;
    epochs: number[];
    epochs_vals: number[];
    eth_signed_data: EthSignedData;
    eth_signatures: EthAddress[];
    eth_addresses: EthAddress[];
};

type EthSignedData = {
    input: string[];
    signature_field: string;
};

type BuyLicenseRequest = {
    name: string;
    surname: string;
    isCompany: boolean;
    identificationCode: string;
    address: string;
    state: string;
    city: string;
    country: string;
};

type OraclesDefaultResult = {
    server_alias: string;
    server_version: string;
    server_time: string;
    server_current_epoch: number;
    server_uptime: string;
    EE_SIGN: string;
    EE_SENDER: R1Address;
    EE_ETH_SENDER: EthAddress;
    EE_ETH_SIGN: string;
    EE_HASH: string;
};

type ApiAccount = {
    email: string;
    emailConfirmed: boolean;
    pendingEmail: string;
    address: string;
    uuid: string;
    kycStatus: string; //TODO check real types
    isActive: boolean;
    isBlacklisted: boolean;
    blacklistedReason: string;
    receiveUpdates: boolean;
};

export type {
    R1Address,
    EthAddress,
    License,
    NDLicense,
    MNDLicense,
    GNDLicense,
    NodeAvailabilityResult as OraclesAvailabilityResult,
    BuyLicenseRequest,
    OraclesDefaultResult,
    ApiAccount,
};
