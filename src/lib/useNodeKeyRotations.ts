import { getNodeKeyRotations } from '@lib/api/oracles';
import { useEffect, useMemo, useState } from 'react';
import { EthAddress, License } from 'typedefs/blockchain';

// Node keys linked before this time can have an announced replacement key.
const REVOKED_KEYS_LINKED_BEFORE = 1793721420n;

// A linked license whose node announced a new key after its old key was revoked.
export type RelinkItem = {
    license: License;
    newNodeAddress: EthAddress;
};

/**
 * Licenses to relink: those linked before the revocation whose node announced a new key.
 * Asks the oracle API once per set of old node addresses.
 */
export default function useNodeKeyRotations(licenses: License[]): RelinkItem[] {
    // New node address announced for each old node address (lowercase).
    const [rotations, setRotations] = useState<Map<string, EthAddress>>(new Map());

    const revokedKeyAddresses = useMemo(
        () =>
            licenses
                .filter((license) => license.isLinked && license.assignTimestamp < REVOKED_KEYS_LINKED_BEFORE)
                .map((license) => license.nodeAddress),
        [licenses],
    );
    const revokedKeyAddressesKey = revokedKeyAddresses.join(',');

    useEffect(() => {
        if (revokedKeyAddresses.length === 0) {
            setRotations(new Map());
            return;
        }

        getNodeKeyRotations(revokedKeyAddresses)
            .then((result) =>
                setRotations(
                    new Map(
                        Object.entries(result.rotations).map(([oldAddress, rotation]) => [
                            oldAddress.toLowerCase(),
                            rotation.node_eth_address,
                        ]),
                    ),
                ),
            )
            .catch((error) => console.error('[Node key rotations] unavailable', error));
    }, [revokedKeyAddressesKey]);

    return useMemo(
        () =>
            licenses
                .filter((license) => license.isLinked && rotations.has(license.nodeAddress.toLowerCase()))
                .map((license) => ({
                    license,
                    newNodeAddress: rotations.get(license.nodeAddress.toLowerCase()) as EthAddress,
                })),
        [licenses, rotations],
    );
}
