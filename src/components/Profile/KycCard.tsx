import { initSumsubSession } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { routePath } from '@lib/routes/route-paths';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Switch } from '@nextui-org/switch';
import { Card } from '@shared/Card';
import { Label } from '@shared/Label';
import { KycStatus, RegistrationStatus } from '@typedefs/profile';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiUserFollowLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function KycCard({ getRegistrationStatus }: { getRegistrationStatus: () => RegistrationStatus }) {
    const { account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState<boolean>(false);
    const [isCompany, setCompany] = useState<boolean>(false);

    useEffect(() => {
        fetchAccount(); // Always refresh to get the KYC state
    }, []);

    const init = async () => {
        setLoading(true);

        const type: 'individual' | 'company' = (account?.applicantType ?? isCompany) ? 'company' : 'individual';

        try {
            const tokenResponse: string = await initSumsubSession(type);

            if (!tokenResponse) {
                throw new Error('Unexpected error, please try again.');
            }

            navigate(`${routePath.kyc}?type=${type}&token=${tokenResponse}`);
        } catch (error) {
            console.error('Error', error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    function getKycStatusInfo(status: KycStatus): { text: string; color: 'yellow' | 'green' | 'red' } | undefined {
        switch (status) {
            case KycStatus.Init:
                return { text: 'Started', color: 'yellow' };
            case KycStatus.Pending:
                return { text: 'Pending', color: 'yellow' };
            case KycStatus.Prechecked:
                return { text: 'Pre-checked', color: 'yellow' };
            case KycStatus.Queued:
                return { text: 'In Queue', color: 'yellow' };
            case KycStatus.Completed:
                return { text: 'Completed', color: 'yellow' };
            case KycStatus.Approved:
                return { text: 'Approved', color: 'green' };
            case KycStatus.OnHold:
                return { text: 'On Hold', color: 'yellow' };
            case KycStatus.Rejected:
                return { text: 'Rejected', color: 'red' };
            case KycStatus.FinalRejected:
                return { text: 'Rejected', color: 'red' };
            case KycStatus.Created:
                return { text: 'Not Started', color: 'yellow' };
            default:
        }
    }

    const getKycAlertCard = (kycStatus: KycStatus, statusInfo: { text: string; color: 'yellow' | 'green' | 'red' }) => {
        if (kycStatus === KycStatus.Init || kycStatus === KycStatus.Rejected) {
            return (
                <div className="row gap-2.5">
                    <div className="flex">
                        <Button color="primary" variant="solid" isLoading={isLoading} onPress={init}>
                            Continue KYC
                        </Button>
                    </div>

                    <div className="text-sm text-slate-500">
                        * You'll continue the KYC process using <span className="font-medium text-primary">Sumsub</span>
                    </div>
                </div>
            );
        }

        let alertColor: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'warning';
        let alertTitle = 'Your KYC submission has been received and is under review.';

        switch (statusInfo.color) {
            case 'green':
                alertColor = 'success';
                alertTitle = 'Your KYC submission has been approved.';
                break;

            case 'red':
                alertColor = 'danger';
                alertTitle = 'Your KYC submission has been rejected.';
                break;

            default:
        }

        return (
            <Alert
                color={alertColor}
                title={alertTitle}
                classNames={{
                    base: 'items-center',
                }}
            />
        );
    };

    if (!account) {
        return null;
    }

    const isKycInitiated: boolean =
        getKycStatusInfo(account.kycStatus) !== undefined && account.kycStatus !== KycStatus.Created;

    return (
        <Card
            icon={<RiUserFollowLine />}
            title="KYC"
            label={
                !isKycInitiated ? (
                    <></>
                ) : (
                    <Label
                        variant={
                            (
                                getKycStatusInfo(account.kycStatus) as {
                                    text: string;
                                    color: 'yellow' | 'green' | 'red';
                                }
                            ).color
                        }
                        text={
                            (
                                getKycStatusInfo(account.kycStatus) as {
                                    text: string;
                                    color: 'yellow' | 'green' | 'red';
                                }
                            ).text
                        }
                    />
                )
            }
        >
            <div className="row h-full">
                {getRegistrationStatus() !== RegistrationStatus.REGISTERED ? (
                    <Alert
                        color="primary"
                        title="You need to register and confirm your email address first."
                        classNames={{
                            base: 'items-center',
                        }}
                    />
                ) : isKycInitiated ? (
                    <>
                        {getKycAlertCard(
                            account.kycStatus,
                            getKycStatusInfo(account.kycStatus) as {
                                text: string;
                                color: 'yellow' | 'green' | 'red';
                            },
                        )}
                    </>
                ) : (
                    <div className="col gap-4">
                        <div className="row gap-2.5">
                            <div>Individual</div>
                            <Switch isSelected={isCompany} onValueChange={setCompany} size="sm" />
                            <div>Company</div>
                        </div>

                        <div className="row gap-2.5">
                            <div className="flex">
                                <Button color="primary" variant="solid" isLoading={isLoading} onPress={init}>
                                    Start KYC
                                </Button>
                            </div>

                            <div className="text-sm text-slate-500">
                                * You'll continue the KYC process using <span className="font-medium text-primary">Sumsub</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

export default KycCard;
