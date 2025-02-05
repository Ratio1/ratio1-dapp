import { License } from 'typedefs/blockchain';
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
    action?: (type: 'link' | 'unlink' | 'claim' | 'changeNode', license: License) => void;
    toggle?: (id: bigint, type: License['type']) => void;
    disableActions?: boolean;
}) => {
    return (
        <div
            className="border-lightBlue bg-lightBlue mx-auto flex max-w-2xl cursor-pointer flex-col overflow-hidden rounded-3xl border-3 transition-all hover:border-[#e9ebf1] xl:max-w-none"
            onClick={() => {
                if (toggle) {
                    toggle(license.licenseId, license.type);
                }
            }}
        >
            <LicenseCardHeader license={license} action={action} isExpanded={isExpanded} disableActions={disableActions} />

            {isExpanded && <LicenseCardDetails license={license} />}
        </div>
    );
};
