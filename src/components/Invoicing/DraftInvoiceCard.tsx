import { Button } from '@heroui/button';
import { downloadInvoiceDraft } from '@lib/api/backend';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithLabel from '@shared/ItemWithLabel';
import { InvoiceDraft } from '@typedefs/invoicing';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiArrowDownLine } from 'react-icons/ri';

export default function DraftInvoiceCard({
    draft,
    isExpanded,
    toggle,
}: {
    draft: InvoiceDraft;
    isExpanded: boolean;
    toggle: () => void;
}) {
    const [isLoading, setLoading] = useState<boolean>(false);

    const downloadDraft = async (draftId: string) => {
        try {
            setLoading(true);
            const draft = await downloadInvoiceDraft(draftId);
            console.log('Draft', draft);
        } catch (error) {
            console.error(error);
            toast.error('Failed to download invoice draft.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BorderedCard isHoverable onClick={toggle} useFixedwidth>
            <div className="col gap-4">
                {/* Content */}
                <div className="row justify-between gap-3 text-sm lg:gap-6">
                    <div className="min-w-[62px] font-medium">{draft.invoiceNumber}</div>

                    <div className="min-w-[122px]">
                        {new Date(draft.creationTimestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>

                    <div className="min-w-[170px] max-w-[170px] truncate">{draft.cspOwnerName}</div>

                    <div className="min-w-[118px] font-medium">${draft.totalUsdcAmount.toFixed(2)}</div>

                    {/* Desktop */}
                    <div className="hidden min-w-[124px] justify-end larger:flex">
                        <Button
                            className="border-2 border-slate-200 bg-white data-[hover=true]:!opacity-65"
                            isLoading={isLoading}
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => {
                                if (!isLoading) {
                                    downloadDraft(draft.draftId);
                                }
                            }}
                        >
                            <div className="text-sm">Download</div>
                        </Button>
                    </div>

                    {/* Mobile */}
                    <div
                        className="block min-w-[30px] larger:hidden"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            downloadDraft(draft.draftId);
                        }}
                    >
                        <div className="center-all w-[30px] rounded-full bg-primary-50 p-1.5 hover:opacity-50">
                            <RiArrowDownLine className="text-lg text-primary" />
                        </div>
                    </div>
                </div>

                {/* Details */}
                {isExpanded && (
                    <div className="col gap-2.5 rounded-lg bg-slate-75 px-5 py-4">
                        <div className="text-base font-semibold">Details</div>

                        <div className="row justify-between gap-2">
                            <ItemWithLabel
                                label="CSP Owner Addr."
                                value={<CopyableValue value={draft.cspOwnerAddress} isLight />}
                            />

                            <ItemWithLabel
                                label="Invoice Series"
                                value={<div className="font-medium capitalize">{draft.invoiceSeries}</div>}
                            />

                            <ItemWithLabel
                                label="Invoice ID"
                                value={<CopyableValue value={draft.draftId} size={8} isLight />}
                            />
                        </div>
                    </div>
                )}
            </div>
        </BorderedCard>
    );
}
