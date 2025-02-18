import { useState } from 'react';
import { License } from 'typedefs/blockchain';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';

export const LicenseCard = ({
    license,
    isClaimingAll,
    action,
    onLicenseClick,
    disableActions,
}: {
    license: License;
    isClaimingAll?: boolean;
    action?: (type: 'link' | 'unlink' | 'claim' | 'changeNode' | 'burn', license: License) => void;
    onLicenseClick?: (license: License) => void;
    disableActions?: boolean;
}) => {
    const [isExpanded, setExpanded] = useState<boolean>(disableActions ? true : false);

    return (
        <div
            className="mx-auto flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl border-3 border-slate-100 bg-slate-100 transition-all hover:border-[#e9ebf1]"
            onClick={() => {
                if (onLicenseClick) {
                    setExpanded(!isExpanded);
                    onLicenseClick(license);
                }
            }}
        >
            <LicenseCardHeader
                license={license}
                isClaimingAll={isClaimingAll}
                action={action}
                isExpanded={isExpanded}
                disableActions={disableActions}
            />

            {isExpanded && <LicenseCardDetails license={license} />}
        </div>
    );
};
