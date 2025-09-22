import BillingMonthSelect from '@components/Invoicing/BillingMonthSelect';
import DraftInvoiceCard from '@components/Invoicing/DraftInvoiceCard';
import { Skeleton } from '@heroui/skeleton';
import { getInvoiceDrafts } from '@lib/api/invoicing';
import { BorderedCard } from '@shared/cards/BorderedCard';
import EmptyData from '@shared/EmptyData';
import ListHeader from '@shared/ListHeader';
import { InvoiceDraft } from '@typedefs/general';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { RiFileInfoLine } from 'react-icons/ri';

export default function Invoicing() {
    const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
    const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[] | undefined>();

    const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Init
    useEffect(() => {
        (async () => {
            const drafts = await getInvoiceDrafts();

            const months: string[] = _(drafts)
                .orderBy('date', 'desc')
                .map((draft) => draft.creationTimestamp.slice(0, 7))
                .uniq()
                .value();

            const obj = {};

            drafts.forEach((draft) => {
                obj[draft.invoiceId] = false;
            });

            setExpanded(obj);

            setInvoiceDrafts(drafts);
            setUniqueMonths(months);
        })();
    }, []);

    return (
        <div className="col w-full flex-1 gap-5">
            <BorderedCard>
                <div className="flex gap-2">
                    <div className="flex">
                        <RiFileInfoLine className="text-xl text-primary" />
                    </div>

                    <div className="compact">
                        As a Node Operator, you are required to download the draft invoice, make the necessary edits, and send
                        it via email to the CSP within 48 hours.
                    </div>
                </div>
            </BorderedCard>

            <div className="col gap-3">
                <div className="row w-full min-w-10 justify-between">
                    <div className="text-xl font-semibold leading-6 text-body">Invoice Drafts</div>

                    <BillingMonthSelect
                        uniqueMonths={uniqueMonths}
                        onMonthChange={(month) => {
                            setSelectedMonth(month);
                        }}
                    />
                </div>

                <div className="list">
                    <ListHeader useFixedwidth>
                        <div className="min-w-[62px]">Number</div>
                        <div className="min-w-[122px]">Date</div>
                        <div className="min-w-[170px]">CSP Owner</div>
                        <div className="min-w-[118px]">Amount ($USDC)</div>

                        <div className="hidden min-w-[92px] larger:block"></div>
                        <div className="block min-w-[30px] larger:hidden"></div>
                    </ListHeader>

                    {invoiceDrafts === undefined || selectedMonth === undefined ? (
                        <>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-[56px] w-full rounded-lg" />
                            ))}
                        </>
                    ) : !invoiceDrafts?.length ? (
                        <div className="center-all w-full py-14">
                            <EmptyData
                                title="No invoice drafts found"
                                description="Your drafts will be displayed here"
                                icon={<RiFileInfoLine />}
                            />
                        </div>
                    ) : (
                        <>
                            {invoiceDrafts
                                .filter((draft) => draft.creationTimestamp.startsWith(selectedMonth))
                                .sort(
                                    (a, b) => new Date(b.creationTimestamp).getTime() - new Date(a.creationTimestamp).getTime(),
                                )
                                .map((draft) => (
                                    <div key={draft.invoiceId}>
                                        <DraftInvoiceCard
                                            draft={draft}
                                            isExpanded={expanded[draft.invoiceId]}
                                            toggle={() =>
                                                setExpanded({ ...expanded, [draft.invoiceId]: !expanded[draft.invoiceId] })
                                            }
                                        />
                                    </div>
                                ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
