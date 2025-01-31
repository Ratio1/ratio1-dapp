import { KycStatus } from './profile';

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
    isClaimingRewards?: boolean;
} & (
    | {
          isLinked: true;
          alias: Promise<string>;
          rewards: Promise<bigint>;
          isOnline: Promise<boolean>;
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

type ComputeParam = {
    licenseId: bigint;
    nodeAddress: `0x${string}`;
    epochs: bigint[];
    availabilies: number[];
};

type OraclesAvailabilityResult = {
    node: string;
    node_alias: string;
    node_eth_address: EthAddress;
    epochs: number[];
    epochs_vals: number[];
    eth_signed_data: EthSignedData;
    eth_signatures: EthAddress[];
    eth_addresses: EthAddress[];
    node_is_online: boolean;
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
    kycStatus: KycStatus;
    isActive: boolean;
    isBlacklisted: boolean;
    blacklistedReason: string;
    receiveUpdates: boolean;
};

type Stage = {
    index: number;
    usdPrice: number;
    totalUnits: number;
    soldUnits: number;
};

export type {
    ApiAccount,
    BuyLicenseRequest,
    ComputeParam,
    EthAddress,
    GNDLicense,
    License,
    MNDLicense,
    NDLicense,
    OraclesAvailabilityResult,
    OraclesDefaultResult,
    R1Address,
    Stage,
};
