import { useState } from 'react';
import { License } from 'typedefs/blockchain';
import { LicenseCardDetails } from './LicenseCardDetails';
import { LicenseCardHeader } from './LicenseCardHeader';

export const LicenseCard = ({
    license,
    isClaimingAllRewardsPoA,
    isClaimingAllRewardsPoAI,
    action,
    onLicenseClick,
    disableActions,
}: {
    license: License;
    isClaimingAllRewardsPoA?: boolean;
    isClaimingAllRewardsPoAI?: boolean;
    action?: (
        type: 'link' | 'unlink' | 'claimRewardsPoA' | 'claimRewardsPoAI' | 'changeNode' | 'burn',
        license: License,
    ) => void;
    onLicenseClick?: (license: License) => void;
    disableActions?: boolean;
}) => {
    const [isExpanded, setExpanded] = useState<boolean>(disableActions ? true : false);

    return (
        <div
            className="mx-auto flex w-full cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 hover:border-slate-200"
            onClick={() => {
                if (onLicenseClick) {
                    setExpanded(!isExpanded);
                    onLicenseClick(license);
                }
            }}
        >
            <LicenseCardHeader license={license} action={action} isExpanded={isExpanded} disableActions={disableActions} />

            {isExpanded && (
                <LicenseCardDetails
                    license={license}
                    action={action}
                    isClaimingAllRewardsPoA={isClaimingAllRewardsPoA}
                    isClaimingAllRewardsPoAI={isClaimingAllRewardsPoAI}
                />
            )}
        </div>
    );
};
