import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithLabel from '@shared/ItemWithLabel';
import { InvoiceDraft } from '@typedefs/general';
import { RiArrowDownLine, RiArrowRightLine } from 'react-icons/ri';

export default function DraftInvoiceCard({
    draft,
    isExpanded,
    toggle,
}: {
    draft: InvoiceDraft;
    isExpanded: boolean;
    toggle: () => void;
}) {
    const onInvoiceDownload = () => {
        console.log('Download', draft.invoiceId);
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

                    <div
                        className="hidden min-w-[92px] larger:block"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onInvoiceDownload();
                        }}
                    >
                        <div className="row cursor-pointer gap-1 hover:opacity-50">
                            <div className="compact">Download</div>
                            <RiArrowRightLine className="mt-px text-lg" />
                        </div>
                    </div>

                    <div
                        className="block min-w-[30px] larger:hidden"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onInvoiceDownload();
                        }}
                    >
                        <div className="center-all w-[30px] rounded-full bg-primary-50 p-1.5 hover:opacity-50">
                            <RiArrowDownLine className="text-lg text-primary" />
                        </div>
                    </div>
                </div>

                {/* Details */}
                {isExpanded && (
                    <div className="col bg-slate-75 gap-2.5 rounded-lg px-5 py-4">
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
                                value={<CopyableValue value={draft.invoiceId} size={8} isLight />}
                            />
                        </div>
                    </div>
                )}
            </div>
        </BorderedCard>
    );
}
