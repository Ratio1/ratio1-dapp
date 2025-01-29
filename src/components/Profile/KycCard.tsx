import { initSumsubSession } from '@lib/api/backend';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/modal';
import { Card } from '@shared/Card';
import { Label } from '@shared/Label';
import snsWebSdk from '@sumsub/websdk';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiUserFollowLine } from 'react-icons/ri';

function KycCard({
    account,
    getRegistrationStatus,
}: {
    account?: ApiAccount;
    getRegistrationStatus: () => RegistrationStatus;
}) {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string>();

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

        const snsWebSdkInstance = snsWebSdk
            .init(accessToken, () => initSumsubSession('individual'))
            .withConf({
                lang: 'en',
                email: account.email,
                theme: 'light',
            })
            .withOptions({ addViewportTag: false, adaptIframeHeight: true })
            .on('idCheck.onStepCompleted', (payload) => {
                console.log('onStepCompleted', payload);
            })
            .on('idCheck.onError', (error) => {
                console.log('onError', error);
            })
            .build();

        onOpen();

        snsWebSdkInstance.launch('#sumsub-websdk-container');
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
                            <div className="flex">
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

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
                <ModalContent>
                    {() => (
                        <>
                            <ModalBody>
                                <div id="sumsub-websdk-container"></div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default KycCard;
