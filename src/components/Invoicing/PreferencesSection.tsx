import { INVOICING_CURRENCIES } from '@data/invoicingCurrencies';
import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal';
import { Skeleton } from '@heroui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeInvoicingPreferences, getInvoicingPreferences } from '@lib/api/backend';
import { invoicingPreferencesSchema } from '@schemas/invoicing';
import { CardWithHeader } from '@shared/cards/CardWithHeader';
import { SlateCard } from '@shared/cards/SlateCard';
import InputWithLabel from '@shared/form/InputWithLabel';
import NumberInputWithLabel from '@shared/form/NumberInputWithLabel';
import SelectWithLabel from '@shared/form/SelectWithLabel';
import SubmitButton from '@shared/SubmitButton';
import { InvoicingPreferences } from '@typedefs/invoicing';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiCircleFill, RiEdit2Line, RiErrorWarningLine, RiInfoCardLine } from 'react-icons/ri';
import { useAccount } from 'wagmi';
import { z } from 'zod';
import ExtraTaxesSection from './ExtraTaxesSection';

export default function PreferencesSection() {
    const [isLoading, setLoading] = useState(false);
    const [isFetching, setFetching] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [invoicingPreferences, setInvoicingPreferences] = useState<InvoicingPreferences | undefined>();

    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const { address } = useAccount();

    useEffect(() => {
        fetchInvoicingPreferences();
    }, []);

    const fetchInvoicingPreferences = async () => {
        try {
            setFetching(true);
            const preferences: any = await getInvoicingPreferences();
            console.log('Preferences', preferences);

            if (preferences) {
                setInvoicingPreferences({
                    ...preferences,
                    extraTaxes: JSON.parse(preferences.extraTaxes),
                } as InvoicingPreferences);
            }
        } catch (error) {
            console.error('Error', error);
            setError('Unable to fetch invoicing preferences at this time.');
            toast.error('Failed to fetch invoicing preferences.');
        } finally {
            setFetching(false);
        }
    };

    const form = useForm<z.infer<typeof invoicingPreferencesSchema>>({
        resolver: zodResolver(invoicingPreferencesSchema),
        mode: 'onTouched',
        defaultValues: invoicingPreferences,
    });

    // Reset form when modal opens
    const handleOpen = () => {
        form.reset(invoicingPreferences);
        onOpen();
    };

    const onSubmit = async (data: z.infer<typeof invoicingPreferencesSchema>) => {
        if (!address) {
            toast.error('Please connect your wallet and refresh this page.');
            return;
        }

        try {
            setLoading(true);
            console.log('onSubmit', data);
            await changeInvoicingPreferences({
                ...data,
                userAddress: address,
            });
            fetchInvoicingPreferences();
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

    if (!invoicingPreferences) {
        if (isFetching) {
            return (
                <CardWithHeader icon={<RiInfoCardLine />} title="Billing Preferences">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <BillingInfoRowSkeleton key={index} />
                        ))}
                    </div>
                </CardWithHeader>
            );
        } else if (error) {
            return (
                <div className="row gap-1.5 rounded-lg bg-red-100 p-4 text-red-700">
                    <RiErrorWarningLine className="text-xl" />
                    <div className="text-sm font-medium">{error}</div>
                </div>
            );
        }
    }

    return (
        <FormProvider {...form}>
            <div className="w-full">
                <CardWithHeader
                    icon={<RiInfoCardLine />}
                    title="Billing Preferences"
                    label={
                        <Button
                            className="border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
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
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                            <BillingInfoRow label="Invoice Series" value={invoicingPreferences?.invoiceSeries ?? '—'} />
                            <BillingInfoRow label="Invoice Offset" value={invoicingPreferences?.nextNumber ?? '—'} />
                            <BillingInfoRow
                                label="Country VAT"
                                value={invoicingPreferences?.countryVat ? `${invoicingPreferences?.countryVat}%` : '—'}
                            />
                            <BillingInfoRow
                                label="UE VAT"
                                value={invoicingPreferences?.ueVat ? `${invoicingPreferences?.ueVat}%` : '—'}
                            />
                            <BillingInfoRow
                                label="Extra UE VAT"
                                value={invoicingPreferences?.extraUeVat ? `${invoicingPreferences?.extraUeVat}%` : '—'}
                            />
                            <BillingInfoRow label="Local Currency" value={invoicingPreferences?.localCurrency ?? '—'} />
                            <BillingInfoRow label="Extra Text" value={invoicingPreferences?.extraText ?? '—'} />

                            <BillingInfoRow
                                label="Extra Taxes"
                                value={
                                    !invoicingPreferences?.extraTaxes?.length ? (
                                        '—'
                                    ) : (
                                        <ul>
                                            {invoicingPreferences.extraTaxes.map((tax) => (
                                                <div key={tax.taxType} className="row gap-1.5">
                                                    <RiCircleFill className="mt-px text-[8px] text-slate-700" />

                                                    <div>
                                                        {tax.value}
                                                        {tax.taxType === 'Percentage' ? '%' : ''} ({tax.description})
                                                    </div>
                                                </div>
                                            ))}
                                        </ul>
                                    )
                                }
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
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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

function BillingInfoRowSkeleton() {
    return (
        <div className="col gap-0.5">
            <Skeleton className="h-5 w-[100px] rounded-lg" />
            <Skeleton className="h-5 w-[60px] rounded-lg" />
        </div>
    );
}
