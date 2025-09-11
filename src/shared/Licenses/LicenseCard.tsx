import { BorderedCard } from '@shared/cards/BorderedCard';
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
        <BorderedCard isHoverable isRoundedDouble disableWrapper>
            <div
                className="col gap-3 px-3 py-3 sm:px-4"
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
        </BorderedCard>
    );
};
