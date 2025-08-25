import { FunctionComponent, PropsWithChildren } from 'react';
import { LicenseSmallCard } from './LicenseSmallCard';

export const LicenseAndNodeRewardsCard: FunctionComponent<PropsWithChildren> = ({ children }) => (
    <LicenseSmallCard>{children}</LicenseSmallCard>
);
