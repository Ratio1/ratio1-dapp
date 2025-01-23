import { isLicenseLinked } from '@lib/utils';
import clsx from 'clsx';
import { License, LinkedLicense } from 'types';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';

export const LicenseCard = ({
    license,
    isExpanded,
    toggle,
    disableActions,
}: {
    license: License | LinkedLicense;
    isExpanded: boolean;
    toggle?: (id: number) => void;
    disableActions?: boolean;
}) => {
    return (
        <div
            className={clsx(
                'flex flex-col overflow-hidden rounded-3xl border-3 border-lightAccent bg-lightAccent transition-all',
                {
                    'cursor-pointer hover:border-[#e9ebf1]': isLicenseLinked(license),
                },
            )}
            onClick={() => {
                if (isLicenseLinked(license) && toggle) {
                    toggle(license.id);
                }
            }}
        >
            <LicenseCardHeader license={license} isExpanded={isExpanded} disableActions={disableActions} />

            {isExpanded && <LicenseCardDetails />}
        </div>
    );
};
