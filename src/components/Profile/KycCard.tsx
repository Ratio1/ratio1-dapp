import { initSumsubSession } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { routePath } from '@lib/routes';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/modal';
import { Card } from '@shared/Card';
import { Label } from '@shared/Label';
import SumsubWebSdk from '@sumsub/websdk-react';
import { RegistrationStatus } from '@typedefs/profile';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RiUserFollowLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function KycCard({ getRegistrationStatus }: { getRegistrationStatus: () => RegistrationStatus }) {
    const { account, fetchAccount } = useAuthenticationContext() as AuthenticationContextType;
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<string>();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Function to adjust iframe height
    const adjustIframeHeight = () => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            if (iframe.contentWindow) {
                try {
                    const newHeight = iframe.contentWindow.document.body.scrollHeight;
                    console.log(`${newHeight}px`);
                } catch (error) {
                    console.warn('Cross-origin restriction prevents auto-sizing.');
                }
            }
        }
    };

    useEffect(() => {
        // Try adjusting height whenever the iframe loads
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', adjustIframeHeight);
        }

        return () => {
            if (iframe) {
                iframe.removeEventListener('load', adjustIframeHeight);
            }
        };
    }, []);

    useEffect(() => {
        if (token) {
            onOpen();
        }
    }, [token]);

    const init = async () => {
        setLoading(true);

        try {
            const tokenResponse: string = await initSumsubSession('individual');

            if (!tokenResponse) {
                throw new Error('Unexpected error, please try again.');
            }

            console.log(tokenResponse);

            navigate(`${routePath.kyc}?token=${tokenResponse}`);

            // setToken(tokenResponse);
        } catch (error) {
            console.error('Error', error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return null;
    }

    return (
        <>
            <Card icon={<RiUserFollowLine />} title="KYC" label={!account.kycStatus ? <Label text="Not Started" /> : <></>}>
                <div className="row h-full">
                    {getRegistrationStatus() !== RegistrationStatus.REGISTERED ? (
                        <Alert
                            color="primary"
                            title="You need to register and confirm your email first."
                            classNames={{
                                base: 'items-center',
                            }}
                        />
                    ) : (
                        <div className="col gap-2.5">
                            <div className="flex gap-2.5">
                                <Button color="secondary" variant="solid" isLoading={isLoading} onPress={init}>
                                    Start KYC
                                </Button>
                            </div>

                            <div className="text-sm text-slate-500">
                                * You will continue the KYC process using <span className="font-medium">Sumsub</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isOpen}
                onOpenChange={(value) => {
                    if (value) {
                        onOpen();
                    } else {
                        fetchAccount();
                        onClose();
                    }
                }}
                size="lg"
            >
                <ModalContent>
                    {() => (
                        <ModalBody className="center-all min-h-[400px]">
                            {!token ? (
                                <div>Please close this window and try again</div>
                            ) : (
                                <SumsubWebSdk
                                    accessToken={token}
                                    expirationHandler={() => initSumsubSession('individual')}
                                    config={{
                                        lang: 'en',
                                        email: account.email,
                                    }}
                                    options={{ addViewportTag: false, adaptIframeHeight: true }}
                                    onError={(data) => console.log('onError', data)}
                                    className="max-h-[calc(100vh-200px)] w-full"
                                />
                            )}
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default KycCard;
