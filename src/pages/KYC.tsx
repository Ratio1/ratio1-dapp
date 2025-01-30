import { initSumsubSession } from '@lib/api/backend';
import { routePath } from '@lib/routes';
import { Spinner } from '@nextui-org/spinner';
import { BigCard } from '@shared/BigCard';
import SumsubWebSdk from '@sumsub/websdk-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function KYC() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [accessToken, setAccessToken] = useState<string>();

    useEffect(() => {
        if (!token) {
            navigate(routePath.notFound);
        } else {
            setAccessToken(token);
        }
    }, [token]);

    return (
        <div className="center-all w-full gap-6">
            {!accessToken ? (
                <Spinner />
            ) : (
                <div className="w-full min-[614px]:w-auto">
                    <BigCard fullWidth>
                        <div className="min-w-full rounded-2xl border border-[#e3e4e8] bg-white p-4 min-[614px]:min-w-[540px] lg:p-6">
                            <SumsubWebSdk
                                className="w-full"
                                accessToken={accessToken}
                                expirationHandler={() => initSumsubSession('individual')}
                                config={{
                                    lang: 'en',
                                    // email: account.email, // TODO: Check if required
                                }}
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
