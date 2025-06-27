import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { isFinite, isNaN } from 'lodash';

const DANGEROUS_SLIPPAGE = 0.5;

export const SlippageModal = ({
    isOpen,
    onOpenChange,
    onClose,
    slippageValue,
    setSlippageValue,
    slippage,
    setSlippage,
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onClose: () => void;
    slippageValue: string;
    setSlippageValue: (value: string) => void;
    slippage: number;
    setSlippage: (value: number) => void;
}) => {
    const isSlippageTooSmall = (): boolean => {
        const n = Number.parseFloat(slippageValue);
        const isInputValueTooSmall: boolean = isFinite(n) && !isNaN(n) && n < DANGEROUS_SLIPPAGE;

        return slippage < DANGEROUS_SLIPPAGE || isInputValueTooSmall;
    };

    const onSubmitSlippage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const n = Number.parseFloat(slippageValue);

        setSlippage(n);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" shouldBlockScroll={false}>
            <ModalContent>
                <ModalHeader>Set slippage tolerance (%)</ModalHeader>

                <ModalBody>
                    <div className="col gap-2 pb-2">
                        <div className="text-sm text-slate-500">
                            This is the maximum amount of slippage you are willing to accept when transactioning.
                        </div>

                        <Form className="w-full" validationBehavior="native" onSubmit={onSubmitSlippage}>
                            <Input
                                autoFocus
                                value={slippageValue}
                                onValueChange={(value) => {
                                    const n = Number.parseFloat(value.replace(',', '.'));

                                    if (value === '' || (isFinite(n) && !isNaN(n) && n >= 0 && n < 100)) {
                                        setSlippageValue(value);
                                    }
                                }}
                                size="md"
                                classNames={{
                                    inputWrapper: 'rounded-lg bg-[#fcfcfd] border',
                                    input: 'font-medium',
                                }}
                                variant="bordered"
                                color="primary"
                                labelPlacement="outside"
                                placeholder="0"
                                type="number"
                                validate={(value) => {
                                    const n = Number.parseFloat(value);

                                    if (!(isFinite(n) && !isNaN(n) && n > 0 && n < 100)) {
                                        return 'Value must be a number between 0 and 100.';
                                    }

                                    return null;
                                }}
                                endContent={
                                    <div className="row pointer-events-none">
                                        <span className="text-small text-slate-500">%</span>
                                    </div>
                                }
                            />

                            <div className="col w-full gap-2">
                                {isSlippageTooSmall() && (
                                    <Alert
                                        color="danger"
                                        title="Your transaction may fail"
                                        classNames={{
                                            base: 'items-center py-2 mt-1',
                                        }}
                                    />
                                )}

                                <div className="mt-1 flex justify-end">
                                    <Button type="submit" color="primary">
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
