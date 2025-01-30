import { initSumsubSession } from '@lib/api/backend';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/modal';
import { Card } from '@shared/Card';
import { Label } from '@shared/Label';
import SumsubWebSdk from '@sumsub/websdk-react';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiUserFollowLine } from 'react-icons/ri';

const TOKEN = 'sbx_X0hvjB2NDl6xcFmT';

function KycCard({
    account,
    getRegistrationStatus,
}: {
    account?: ApiAccount;
    getRegistrationStatus: () => RegistrationStatus;
}) {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string>(TOKEN);

    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Sumsub

    if (!account) {
        return null;
    }

    // Obtain the Sumsub access token
    const init = async () => {
        setLoading(true);

        try {
            const response = await initSumsubSession('individual');
            console.log('Response', response);
            setAccessToken(response);
        } catch (error) {
            console.error('Error', error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
    };

    const start = async () => {
        if (!accessToken) {
            toast.error('Unexpected error, please try again.');
            return;
        }

        onOpen();

        // const snsWebSdkInstance = snsWebSdk
        //     .init(accessToken, () => initSumsubSession('individual'))
        //     .withConf({
        //         lang: 'en',
        //         email: account.email,
        //         theme: 'light',
        //     })
        //     .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        //     .on('idCheck.onStepCompleted', (payload) => {
        //         console.log('onStepCompleted', payload);
        //     })
        //     .on('idCheck.onError', (error) => {
        //         console.log('onError', error);
        //     })
        //     .build();

        // snsWebSdkInstance.launch('#sumsub-websdk-container');
    };

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
                                <Button color="secondary" variant="solid" isLoading={isLoading} onPress={start}>
                                    Start KYC
                                </Button>

                                {/* <Button variant="solid" onPress={start}>
                                    Debug
                                </Button> */}
                            </div>

                            <div className="text-sm text-slate-500">
                                * You will continue the KYC process using <span className="font-medium">Sumsub</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* <div id="sumsub-websdk-container"></div> */}

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {() => (
                        <ModalBody className="center-all min-h-[400px]">
                            {!!accessToken && (
                                <SumsubWebSdk
                                    accessToken={accessToken}
                                    expirationHandler={() => Promise.resolve(accessToken)}
                                    config={{
                                        lang: 'en',
                                        email: account.email,
                                    }}
                                    options={{ addViewportTag: false, adaptIframeHeight: true }}
                                    onError={(data) => console.log('onError', data)}
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
