import { initSumsubSession } from '@lib/api/backend';
import { Alert } from '@nextui-org/alert';
import { Button } from '@nextui-org/button';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/modal';
import { Card } from '@shared/Card';
import { Label } from '@shared/Label';
import { ApiAccount } from '@typedefs/blockchain';
import { RegistrationStatus } from '@typedefs/profile';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiUserFollowLine } from 'react-icons/ri';

function KycCard({
    account,
    getRegistrationStatus,
}: {
    account?: ApiAccount;
    getRegistrationStatus: () => RegistrationStatus;
}) {
    if (!account) {
        return null;
    }

    const [isLoading, setLoading] = useState<boolean>(false);
    const [url, setUrl] = useState<string>();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(() => {
        if (url) {
            onOpen();
        }
    }, [url]);

    const init = async () => {
        setLoading(true);

        try {
            const response: string = await initSumsubSession('individual');

            if (!response) {
                throw new Error('Unexpected error, please try again.');
            }

            setUrl(response);
        } catch (error) {
            console.error('Error', error);
            toast.error('Unexpected error, please try again.');
        } finally {
            setLoading(false);
        }
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

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {() => (
                        <ModalBody className="center-all min-h-[500px]">
                            {!url ? (
                                <div>Please close this window and try again</div>
                            ) : (
                                <div className="flex-grow">
                                    <iframe
                                        src={url}
                                        className="h-[638px] w-full"
                                        allow="camera; microphone; autoplay"
                                        title="Sumsub KYC"
                                    ></iframe>
                                </div>
                            )}
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default KycCard;
