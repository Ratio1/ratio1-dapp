import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { Card } from '@shared/Card';
import { RiBillLine } from 'react-icons/ri';

function TaxInfoCard() {
    const { account } = useAuthenticationContext() as AuthenticationContextType;

    return (
        <Card icon={<RiBillLine />} title="Tax Information">
            <div className="flex h-full w-full items-center justify-between">
                {/* <div className="col gap-1">
                    <div className="text-sm font-medium text-slate-500">Tax Country</div>
                    <div className="font-medium">Romania</div>
                </div> */}

                <div className="col gap-1">
                    <div className="text-sm font-medium text-slate-500">VAT</div>
                    <div className="font-medium">{account?.vatPercentage}%</div>
                </div>
            </div>
        </Card>
    );
}

export default TaxInfoCard;
