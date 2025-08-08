import * as types from 'typedefs/blockchain';

import { getMultiNodeEpochsRange, getNodeInfo } from './api/oracles';

type BaseNDLicense = types.BaseLicense & {
    type: 'ND';
    isBanned: boolean;
};

type BaseMNDLicense = types.BaseLicense & {
    type: 'MND';
    isBanned: false;
    firstMiningEpoch: bigint;
};

type BaseGNDLicense = types.BaseLicense & {
    type: 'GND';
    isBanned: false;
    firstMiningEpoch: bigint;
};

export type { BaseGNDLicense, BaseMNDLicense, BaseNDLicense };

export const getLicensesWithNodesWithRewards = async (licenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[]) => {
    const nodesWithRanges = licenses.reduce(
        (acc, license) => {
            acc[license.nodeAddress] = [74, 75];
            return acc;
        },
        {} as Record<types.EthAddress, [number, number]>,
    );

    const result = await getMultiNodeEpochsRange(nodesWithRanges);

    console.log(`getMultiNodeEpochsRange (${result.query_time}s)`);

    // licenses.forEach((license) => {
    //     const availability: types.OraclesAvailabilityResult = result[license.nodeAddress];
    //     console.log(availability.node_alias, availability.epochs_vals);
    // });

    return result;
};

export const getLicensesWithNodesWithoutRewards = async (licenses: (BaseGNDLicense | BaseMNDLicense | BaseNDLicense)[]) => {
    const licensesWithNodesInfo = licenses.map((license) => {
        return {
            ...license,
            rewards: Promise.resolve(0n),
            alias: getNodeInfo(license.nodeAddress).then(({ node_alias }) => node_alias),
            isOnline: getNodeInfo(license.nodeAddress).then(({ node_is_online }) => node_is_online),
            epochs: Promise.resolve([]),
            epochsAvailabilities: Promise.resolve([]),
            ethSignatures: Promise.resolve([]),
        };
    });

    return licensesWithNodesInfo;
};
