import { initSumsubSession } from '@lib/api/backend';
import { routePath } from '@lib/routes/route-paths';
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { BigCard } from '@shared/BigCard';
import SumsubWebSdk from '@sumsub/websdk-react';
import { useEffect, useState } from 'react';
import { RiArrowLeftLine } from 'react-icons/ri';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function KYC() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const token = searchParams.get('token');

    const [accessToken, setAccessToken] = useState<string>();

    useEffect(() => {
        if (!token || !type) {
            navigate(routePath.notFound);
        } else {
            setAccessToken(token);
        }
    }, [type, token]);

    return (
        <div className="center-all w-full flex-col gap-6">
            <Button color="primary" variant="solid" as={Link} to={routePath.profile}>
                <div className="row gap-1.5">
                    <RiArrowLeftLine className="text-[18px]" />
                    <div className="text-sm font-medium lg:text-base">Profile</div>
                </div>
            </Button>

            {!accessToken || !type ? (
                <Spinner />
            ) : (
                <div className="w-full min-[614px]:w-auto">
                    <BigCard fullWidth>
                        <div className="min-w-full rounded-2xl border border-[#e3e4e8] bg-white p-4 min-[614px]:min-w-[540px] lg:p-6">
                            <SumsubWebSdk
                                className="w-full"
                                accessToken={accessToken}
                                expirationHandler={() => initSumsubSession(type as 'individual' | 'company')}
                                options={{ addViewportTag: false, adaptIframeHeight: true }}
                                onError={(data) => console.log('onError', data)}
                            />
                        </div>
                    </BigCard>
                </div>
            )}
        </div>
    );
}

export default KYC;
