import { useState } from 'react';
import { License } from 'typedefs/blockchain';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';

export const LicenseCard = ({
    license,
    action,
    onLicenseClick,
    disableActions,
}: {
    license: License;
    action?: (type: 'link' | 'unlink' | 'claim' | 'changeNode', license: License) => void;
    onLicenseClick?: (license: License) => void;
    disableActions?: boolean;
}) => {
    const [isExpanded, setExpanded] = useState<boolean>(false);

    return (
        <div
            className="mx-auto flex max-w-2xl cursor-pointer flex-col overflow-hidden rounded-3xl border-3 border-lightBlue bg-lightBlue transition-all hover:border-[#e9ebf1] xl:max-w-none"
            onClick={() => {
                if (onLicenseClick) {
                    setExpanded(!isExpanded);
                    onLicenseClick(license);
                }
            }}
        >
            <LicenseCardHeader license={license} action={action} isExpanded={isExpanded} disableActions={disableActions} />

            {isExpanded && <LicenseCardDetails license={license} />}
        </div>
    );
};
