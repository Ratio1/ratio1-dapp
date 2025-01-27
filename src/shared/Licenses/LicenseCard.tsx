import { isLicenseLinked } from '@lib/utils';
import clsx from 'clsx';
import { License, LinkedLicense } from 'types';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';

export const LicenseCard = ({
    license,
    isExpanded,
    action,
    toggle,
    disableActions,
    isBanned,
}: {
    license: License | LinkedLicense;
    isExpanded: boolean;
    action?: (type: 'link' | 'unlink' | 'claim', license: License | LinkedLicense) => void;
    toggle?: (id: number) => void;
    disableActions?: boolean;
    isBanned?: boolean;
}) => {
    return (
        <div
            className={clsx(
                'mx-auto flex max-w-2xl flex-col overflow-hidden rounded-3xl border-3 border-lightAccent bg-lightAccent transition-all xl:max-w-none',
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
            <LicenseCardHeader
                license={license}
                action={action}
                isExpanded={isExpanded}
                disableActions={disableActions}
                isBanned={isBanned}
            />

            {isExpanded && <LicenseCardDetails />}
        </div>
    );
};
