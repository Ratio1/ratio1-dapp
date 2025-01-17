import LicensesHeader from '@components/LicensesHeader';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { addHours } from 'date-fns';
import { useState } from 'react';
import { AssignedLicense, UnassignedLicense } from 'types';

const licenses: Array<UnassignedLicense | AssignedLicense> = [
    {
        id: 385,
        alias: 'stefan-edge-node',
        node_address: '0xbF57FEB86044aE9f7B6ED74874A6b1d60D64601b',
        rewards: 256.1,
        used: 2500,
    },
    {
        id: 5564,
        alias: 'naeural_396c2f29',
        node_address: '0x71c4255E9ACa4E1Eb41167056F2f9dCC6DbBB58a',
        rewards: 112,
        used: 5800,
    },
    {
        id: 6713,
        alias: 'naeural_b859867c',
        node_address: '0x13FF7fDe859f980988Ce687C8797dBB82F031e42',
        rewards: 205,
        used: 575,
    },
    // {
    //     id: 682,
    //     alias: 'aidmob-wsl',
    //     node_address: '0x795Fdb7cF8bFD17625998e7Ec7b3276ED79aEE25',
    //     rewards: 46.38,
    //     used: 17802,
    // },
    // {
    //     id: 5839,
    //     alias: 'bleo_core',
    //     node_address: '0x4D599d9584794E27A16e34bEA28750f5eA804Ad6',
    //     rewards: 8.52,
    //     used: 8102,
    // },
    {
        id: 1251,
        used: 4670,
        cooldownTimestamp: addHours(new Date(), 12),
    },
];

function Licenses() {
    const [isExpanded, setExpanded] = useState<boolean>(true);

    return (
        <div className="flex flex-col gap-6">
            <LicensesHeader />

            {licenses.map((license) => (
                <div key={license.id}>
                    <LicenseCard license={license} isExpanded={isExpanded} setExpanded={setExpanded} />
                </div>
            ))}
        </div>
    );
}

export default Licenses;
