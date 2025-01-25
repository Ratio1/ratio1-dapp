import clsx from 'clsx';
import { License } from 'types';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';

export const LicenseCard = ({
    license,
    isExpanded,
    action,
    toggle,
    disableActions,
}: {
    license: License;
    isExpanded: boolean;
    action?: (type: 'link' | 'unlink' | 'claim', license: License) => void;
    toggle?: (id: bigint) => void;
    disableActions?: boolean;
}) => {
    return (
        <div
            className={clsx(
                'flex flex-col overflow-hidden rounded-3xl border-3 border-lightAccent bg-lightAccent transition-all',
                {
                    'cursor-pointer hover:border-[#e9ebf1]': license.isLinked,
                },
            )}
            onClick={() => {
                if (license.isLinked && toggle) {
                    toggle(license.licenseId);
                }
            }}
        >
            <LicenseCardHeader license={license} action={action} isExpanded={isExpanded} disableActions={disableActions} />

            {isExpanded && <LicenseCardDetails license={license} />}
        </div>
    );
};
