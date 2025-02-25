import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/modal';
import { RiCheckDoubleLine } from 'react-icons/ri';
import { DetailedAlert } from './DetailedAlert';

export const DualTxsModal = ({
    isOpen,
    onOpenChange,
    text,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    text: string;
}) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" backdrop="blur" shouldBlockScroll={true}>
            <ModalContent>
                <ModalHeader></ModalHeader>

                <ModalBody>
                    <div className="col -mt-4 gap-2 pb-2">
                        <DetailedAlert
                            icon={<RiCheckDoubleLine />}
                            title="Confirmation"
                            description={
                                <div>
                                    You'll need to confirm <span className="font-medium text-primary">two transactions</span> to{' '}
                                    {text}.
                                </div>
                            }
                        ></DetailedAlert>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
