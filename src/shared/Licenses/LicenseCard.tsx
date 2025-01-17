import { isLicenseAssigned } from '@lib/utils';
import clsx from 'clsx';
import { AssignedLicense, UnassignedLicense } from 'types';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';

export const LicenseCard = ({
    license,
    isExpanded,
    setExpanded,
    disableActions,
}: {
    license: UnassignedLicense | AssignedLicense;
    isExpanded: boolean;
    setExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
    disableActions?: boolean;
}) => {
    return (
        <div
            className={clsx(
                'flex flex-col overflow-hidden rounded-3xl border-3 border-lightAccent bg-lightAccent transition-all',
                {
                    'cursor-pointer hover:border-[#e9ebf1]': isLicenseAssigned(license),
                },
            )}
            onClick={() => {
                if (isLicenseAssigned(license) && setExpanded) {
                    setExpanded(!isExpanded);
                }
            }}
        >
            <LicenseCardHeader license={license} isExpanded={isExpanded} disableActions={disableActions} />

            {isExpanded && <LicenseCardDetails />}
        </div>
    );
};
