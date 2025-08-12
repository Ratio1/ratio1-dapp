import { config } from '@lib/config';
import axios from 'axios';
import * as types from 'typedefs/blockchain';

const oraclesUrl = config.oraclesUrl;
const isLoggingEnabled = false;

// *****
// GET
// *****

export const getNodeEpochs = (nodeAddress: types.EthAddress) => {
    if (isLoggingEnabled) console.log(`[Oracles API] getNodeEpochs called for node: ${nodeAddress}`);
    return _doGet<types.OraclesAvailabilityResult>(`/node_epochs?eth_node_addr=${nodeAddress}`)
        .then((result) => {
            if (isLoggingEnabled) console.log(`[Oracles API] getNodeEpochs response for ${nodeAddress}:`, result);
            return result;
        })
        .catch((error) => {
            if (isLoggingEnabled) console.error(`[Oracles API] getNodeEpochs error for ${nodeAddress}:`, error);
            throw error;
        });
};

export const getNodeEpochsRange = (nodeAddress: types.EthAddress, startEpoch: number, endEpoch: number) => {
    if (isLoggingEnabled)
        console.log(`[Oracles API] getNodeEpochsRange called for node: ${nodeAddress}, epochs ${startEpoch}-${endEpoch}`);
    return _doGet<types.OraclesAvailabilityResult>(
        `/node_epochs_range?eth_node_addr=${nodeAddress}&start_epoch=${startEpoch}&end_epoch=${endEpoch}`,
    )
        .then((result) => {
            if (isLoggingEnabled) console.log(`[Oracles API] getNodeEpochsRange response for ${nodeAddress}:`, result);
            return result;
        })
        .catch((error) => {
            if (isLoggingEnabled) console.error(`[Oracles API] getNodeEpochsRange error for ${nodeAddress}:`, error);
            throw error;
        });
};

export const getMultiNodeEpochsRange = (nodesWithRanges: Record<types.EthAddress, [number, number]>) => {
    return _doPost<types.OraclesDefaultResult & Record<types.EthAddress, types.OraclesAvailabilityResult>>(
        '/multi_node_epochs_range',
        {
            dct_eth_nodes_request: nodesWithRanges,
        },
    );
};

export const getNodeLastEpoch = (nodeAddress: types.EthAddress) => {
    if (isLoggingEnabled) console.log(`[Oracles API] getNodeLastEpoch called for node: ${nodeAddress}`);
    return _doGet<types.OraclesAvailabilityResult>(`/node_last_epoch?eth_node_addr=${nodeAddress}`)
        .then((result) => {
            if (isLoggingEnabled) console.log(`[Oracles API] getNodeLastEpoch response for ${nodeAddress}:`, result);
            return result;
        })
        .catch((error) => {
            if (isLoggingEnabled) console.error(`[Oracles API] getNodeLastEpoch error for ${nodeAddress}:`, error);
            throw error;
        });
};

export const getNodeInfo = async (
    nodeAddress: types.EthAddress,
): Promise<{
    node_alias: string;
    node_is_online: boolean;
}> => {
    const { data } = await axiosInstance.get<{
        result: types.OraclesAvailabilityResult & types.OraclesDefaultResult;
    }>(`/node_last_epoch?eth_node_addr=${nodeAddress}`);

    if (!data.result.node_alias || !data.result.node_is_online) {
        throw new Error('Node info missing from response');
    }

    return {
        node_alias: data.result.node_alias,
        node_is_online: data.result.node_is_online,
    };
};

// *****
// INTERNAL HELPERS
// *****

async function _doGet<T>(endpoint: string) {
    const { data } = await axiosInstance.get<{
        result: (
            | {
                  error: string;
              }
            | T
        ) &
            types.OraclesDefaultResult;
        node_addr: `0xai${string}`;
    }>(endpoint);
    if ('error' in data.result) {
        if (data.result.error.includes('[No internal node address found]')) {
            console.warn(data.result.error);
            return data.result as T;
        }
        throw new Error(data.result.error);
    }
    return data.result;
}

async function _doPost<T>(endpoint: string, body: any) {
    const { data } = await axiosInstance.post<{
        result: types.OraclesDefaultResult &
            (
                | {
                      error: string;
                  }
                | T
            );
        node_addr: `0xai${string}`;
    }>(endpoint, body);
    if ('error' in data.result) {
        throw new Error(data.result.error);
    }
    return data.result;
}

const axiosInstance = axios.create({
    baseURL: oraclesUrl,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        return error.response;
    },
);
