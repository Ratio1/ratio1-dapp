import { EXTRA_TAX_TYPES } from '@data/extraTaxTypes';
import { INVOICING_CURRENCIES } from '@data/invoicingCurrencies';
import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoicingPreferencesSchema } from '@schemas/invoicing';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/form/InputWithLabel';
import NumberInputWithLabel from '@shared/form/NumberInputWithLabel';
import SelectWithLabel from '@shared/form/SelectWithLabel';
import SubmitButton from '@shared/SubmitButton';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiEdit2Line, RiInfoCardLine } from 'react-icons/ri';
import { z } from 'zod';
import ExtraTaxesSection from './ExtraTaxesSection';

const preferences = {
    userAddress: 'Portobello Road 29, London, W11 3DH',
    invoiceSeries: 'AC',
    nextNumber: 0,
    countryVat: 21,
    ueVat: 21,
    extraUeVat: 0,
    localCurrency: INVOICING_CURRENCIES[0],
    extraText: '',
    extraTaxes: [
        {
            description: 'Extra Tax',
            taxType: EXTRA_TAX_TYPES[0],
            value: 19,
        },
    ],
};

export default function PreferencesSection() {
    const [isLoading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const form = useForm<z.infer<typeof invoicingPreferencesSchema>>({
        resolver: zodResolver(invoicingPreferencesSchema),
        mode: 'onTouched',
        defaultValues: preferences,
    });

    // Reset form when modal opens
    const handleOpen = () => {
        form.reset(preferences);
        onOpen();
    };

    const onSubmit = async (data: z.infer<typeof invoicingPreferencesSchema>) => {
        try {
            setLoading(true);
            console.log('onSubmit', data);
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to update invoicing preferences.');
        } finally {
            setLoading(false);
        }
    };

    const onError = (errors: any) => {
        console.log('[InvoicingPreferencesForm] Validation errors:', errors);
    };

    return (
        <FormProvider {...form}>
            <div className="w-full">
                <CardWithHeader
                    icon={<RiInfoCardLine />}
                    title="Billing Preferences"
                    label={
                        <Button
                            className="border-2 border-slate-200 bg-white data-[hover=true]:!opacity-65"
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={handleOpen}
                        >
                            <div className="row gap-1.5">
                                <RiEdit2Line className="text-lg" />
                                <div className="compact">Edit</div>
                            </div>
                        </Button>
                    }
                >
                    <div className="col gap-3 sm:gap-4">
                        <div className="grid h-full w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                            <BillingInfoRow label="Invoice Series" value={preferences.invoiceSeries} />
                            <BillingInfoRow label="Invoice Offset" value={preferences.nextNumber} />
                            <BillingInfoRow label="Country VAT" value={`${preferences.countryVat}%`} />
                            <BillingInfoRow label="UE VAT" value={`${preferences.ueVat}%`} />
                            <BillingInfoRow label="Extra UE VAT" value={preferences.extraUeVat} />
                            <BillingInfoRow label="Local Currency" value={preferences.localCurrency} />
                            <BillingInfoRow label="Extra Text" value={preferences.extraText || '—'} />
                            <BillingInfoRow label="Address" value={preferences.userAddress} />
                        </div>

                        <div className="w-full">
                            <BillingInfoRow
                                label="Extra Taxes"
                                value={!preferences.extraTaxes?.length ? '—' : JSON.stringify(preferences.extraTaxes)}
                            />
                        </div>
                    </div>
                </CardWithHeader>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="2xl"
                scrollBehavior="outside"
                classNames={{
                    closeButton: 'cursor-pointer',
                }}
            >
                <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                    <ModalContent>
                        <ModalHeader>Edit Preferences</ModalHeader>

                        <ModalBody>
                            <SlateCard tightGap>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWithLabel
                                        name="invoiceSeries"
                                        label="Invoice Series"
                                        placeholder="e.g. ABC"
                                        autoFocus
                                    />
                                    <NumberInputWithLabel name="nextNumber" label="Invoice Offset" placeholder="0" />
                                    <NumberInputWithLabel
                                        name="countryVat"
                                        label="Country VAT"
                                        placeholder="0"
                                        endContent={<div className="text-sm text-slate-500">%</div>}
                                    />
                                    <NumberInputWithLabel
                                        name="ueVat"
                                        label="UE VAT"
                                        placeholder="0"
                                        endContent={<div className="text-sm text-slate-500">%</div>}
                                    />
                                    <NumberInputWithLabel
                                        name="extraUeVat"
                                        label="Extra UE VAT"
                                        placeholder="0"
                                        endContent={<div className="text-sm text-slate-500">%</div>}
                                    />

                                    <SelectWithLabel
                                        name="localCurrency"
                                        label="Local Currency"
                                        options={INVOICING_CURRENCIES}
                                    />

                                    <InputWithLabel name="extraText" label="Extra Text" placeholder="—" />
                                    <InputWithLabel name="userAddress" label="Address" placeholder="—" />
                                </div>

                                <ExtraTaxesSection />
                            </SlateCard>
                        </ModalBody>

                        <ModalFooter>
                            <SubmitButton label="Update" isLoading={isLoading} />
                        </ModalFooter>
                    </ModalContent>
                </form>
            </Modal>
        </FormProvider>
    );
}

function BillingInfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="col gap-0.5">
            <div className="text-sm font-medium text-slate-500">{label}</div>
            <div className="compact">{value}</div>
        </div>
    );
}
