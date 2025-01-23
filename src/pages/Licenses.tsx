import LicenseLinkModal from '@components/Licenses/LicenseLinkModal';
import LicensesPageHeader from '@components/Licenses/LicensesPageHeader';
import LicenseUnlinkModal from '@components/Licenses/LicenseUnlinkModal';
import { isLicenseLinked } from '@lib/utils';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { subHours } from 'date-fns';
import { useRef, useState } from 'react';
import { License, LinkedLicense } from 'types';

const LICENSES: Array<License | LinkedLicense> = [
    {
        id: 385,
        alias: 'stefan-edge-node',
        node_address: '0xbF57FEB86044aE9f7B6ED74874A6b1d60D64601b',
        rewards: 256.1,
        used: 2500,
        assignTimestamp: subHours(new Date(), 24),
    },
    {
        id: 5564,
        alias: 'naeural_396c2f29',
        node_address: '0x71c4255E9ACa4E1Eb41167056F2f9dCC6DbBB58a',
        rewards: 0,
        used: 5800,
        assignTimestamp: subHours(new Date(), 24),
    },
    {
        id: 6713,
        alias: 'naeural_b859867c',
        node_address: '0x13FF7fDe859f980988Ce687C8797dBB82F031e42',
        rewards: 205,
        used: 575,
        assignTimestamp: subHours(new Date(), 24),
    },
    {
        id: 1251,
        used: 4670,
        assignTimestamp: new Date(),
    },
    {
        id: 287,
        used: 20850,
        assignTimestamp: subHours(new Date(), 48),
    },
];

function Licenses() {
    const [licenses, setLicenses] = useState<Array<License | LinkedLicense>>([]);
    const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const linkModalRef = useRef<{ trigger: (_license) => void }>(null);
    const unlinkModalRef = useRef<{ trigger: (_license) => void }>(null);

    const onAction = (type: 'link' | 'unlink' | 'claim', license: License | LinkedLicense) => {
        switch (type) {
            case 'link':
                onLink(license);
                break;

            case 'unlink':
                onUnlink(license);
                break;

            default:
                console.error('Invalid action type');
        }
    };

    const onLink = (license: License | LinkedLicense) => {
        if (linkModalRef.current) {
            linkModalRef.current.trigger(license);
        }
    };

    const onUnlink = (license: License | LinkedLicense) => {
        if (unlinkModalRef.current) {
            unlinkModalRef.current.trigger(license);
        }
    };

    const onLicenseExpand = (id: number) => {
        setLicenses((prevLicenses) =>
            prevLicenses.map((license) =>
                license.id === id
                    ? {
                          ...license,
                          isExpanded: !license.isExpanded,
                      }
                    : license,
            ),
        );

        setTimeout(() => {
            const cardRef = cardRefs.current.get(id);
            if (cardRef) {
                cardRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 0);
    };

    const onFilterChange = (key: 'all' | 'linked' | 'unlinked') => {
        switch (key) {
            case 'linked':
                setLicenses(LICENSES.filter(isLicenseLinked));
                break;

            case 'unlinked':
                setLicenses(LICENSES.filter((license) => !isLicenseLinked(license)));
                break;

            default:
                setLicenses(LICENSES);
        }
    };

    return (
        <div className="col gap-3">
            <div className="mb-3">
                <LicensesPageHeader onFilterChange={onFilterChange} />
            </div>

            {licenses.map((license) => (
                <div
                    key={license.id}
                    ref={(element) => {
                        if (element) {
                            cardRefs.current.set(license.id, element);
                        }
                    }}
                >
                    <LicenseCard
                        license={license}
                        isExpanded={isLicenseLinked(license) ? !!license.isExpanded : false}
                        toggle={onLicenseExpand}
                        action={onAction}
                    />
                </div>
            ))}

            <LicenseLinkModal
                ref={linkModalRef}
                nodeAddresses={LICENSES.filter(isLicenseLinked).map((license) => license.node_address)}
            />

            <LicenseUnlinkModal ref={unlinkModalRef} />
        </div>
    );
}

export default Licenses;
