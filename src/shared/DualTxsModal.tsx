import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import clsx from 'clsx';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { RiArrowUpDownLine, RiCheckDoubleLine, RiCheckLine } from 'react-icons/ri';
import { DetailedAlert } from './DetailedAlert';

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    text: string;
    displayTxsProgress?: boolean;
}

export const DualTxsModal = forwardRef(({ isOpen, onOpenChange, text, displayTxsProgress = false }: Props, ref) => {
    const [isFirstTxConfirmed, setFirstTxConfirmed] = useState<boolean>(false);

    const progress = () => {
        setFirstTxConfirmed(true);
    };

    const init = () => {
        setFirstTxConfirmed(false);
    };

    useImperativeHandle(ref, () => ({
        progress,
        init,
    }));

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            backdrop="blur"
            shouldBlockScroll={true}
            classNames={{
                closeButton: 'cursor-pointer',
            }}
        >
            <ModalContent>
                <ModalHeader></ModalHeader>

                <ModalBody>
                    <div className={clsx('col -mt-4 gap-2 pb-2', displayTxsProgress && 'pb-4!')}>
                        <DetailedAlert
                            icon={<RiCheckDoubleLine />}
                            title="Confirmation"
                            description={
                                <div>
                                    You'll need to confirm <span className="text-primary font-medium">two transactions</span> to{' '}
                                    {text}.
                                </div>
                            }
                        ></DetailedAlert>

                        {displayTxsProgress && (
                            <div className="col relative mx-auto my-4 gap-6 text-[15px]">
                                <div className="row gap-1.5">
                                    {isFirstTxConfirmed ? (
                                        <div className="z-10 -ml-1.5 bg-white p-1.5">
                                            <div className="center-all rounded-full bg-green-100 p-1">
                                                <RiCheckLine className="text-base text-green-600" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="z-10 -ml-1.5 bg-white p-1.5">
                                            <div className="center-all h-6 w-6">
                                                <Spinner size="sm" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="">Approve token spending</div>
                                </div>

                                <div className="row gap-1.5">
                                    {!isFirstTxConfirmed ? (
                                        <div className="z-10 -ml-1.5 bg-white p-1.5">
                                            <div className="center-all bg-primary-100 rounded-full p-1">
                                                <RiArrowUpDownLine className="text-primary text-base" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="z-10 -ml-1.5 bg-white p-1.5">
                                            <div className="center-all h-6 w-6">
                                                <Spinner size="sm" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="">Swap selected token for $R1</div>
                                </div>

                                {/* Vertical bar */}
                                <div className="bg-primary-100 absolute top-3 bottom-3 left-[11px] w-[2px]" />
                            </div>
                        )}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});
