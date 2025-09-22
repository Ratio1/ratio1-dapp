import BillingMonthSelect from '@components/Invoicing/BillingMonthSelect';
import DraftInvoiceCard from '@components/Invoicing/DraftInvoiceCard';
import PreferencesSection from '@components/Invoicing/PreferencesSection';
import { Skeleton } from '@heroui/skeleton';
import { getInvoiceDrafts } from '@lib/api/backend';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/contexts/authentication';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { DetailedAlert } from '@shared/DetailedAlert';
import ListHeader from '@shared/ListHeader';
import { InvoiceDraft } from '@typedefs/invoicing';
import { ConnectKitButton } from 'connectkit';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiErrorWarningLine, RiFileInfoLine, RiWalletLine } from 'react-icons/ri';

export default function Invoicing() {
    const { authenticated } = useAuthenticationContext() as AuthenticationContextType;

    const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
    const [invoiceDrafts, setInvoiceDrafts] = useState<InvoiceDraft[] | undefined>();

    const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Init
    useEffect(() => {
        if (authenticated) {
            init();
        }
    }, [authenticated]);

    const init = async () => {
        try {
            const drafts = await getInvoiceDrafts();
            console.log('Drafts', drafts);

            if (drafts === undefined) {
                throw new Error('No invoice drafts available.');
            }

            const months: string[] = _(drafts)
                .orderBy('date', 'desc')
                .map((draft) => draft.creationTimestamp.slice(0, 7))
                .uniq()
                .value();

            const obj = {};

            drafts.forEach((draft) => {
                obj[draft.draftId] = false;
            });

            setExpanded(obj);
            setInvoiceDrafts(drafts);
            setUniqueMonths(months);
        } catch (error: any) {
            console.error(error);
            setError(error.message);
            toast.error('Failed to fetch invoice drafts.');
        } finally {
            setLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <div className="col w-full p-6">
                <DetailedAlert
                    icon={<RiWalletLine />}
                    title="Connect Wallet"
                    description={
                        <div>
                            To proceed, please connect & sign in using your wallet so we can identify and display your invoicing
                            details.
                        </div>
                    }
                >
                    <ConnectKitButton />
                </DetailedAlert>
            </div>
        );
    }

    return (
        <div className="col w-full flex-1 gap-5">
            <PreferencesSection />

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

                        <div className="hidden min-w-[124px] larger:block"></div>
                        <div className="block min-w-[30px] larger:hidden"></div>
                    </ListHeader>

                    {isLoading || invoiceDrafts === undefined || selectedMonth === undefined ? (
                        <>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-[56px] w-full rounded-lg" />
                            ))}
                        </>
                    ) : error !== null ? (
                        <div className="row gap-1.5 rounded-lg bg-red-100 p-4 text-red-700">
                            <RiErrorWarningLine className="text-xl" />
                            <div className="text-sm font-medium">{error}</div>
                        </div>
                    ) : (
                        <>
                            {invoiceDrafts
                                .filter((draft) => draft.creationTimestamp.startsWith(selectedMonth))
                                .sort(
                                    (a, b) => new Date(b.creationTimestamp).getTime() - new Date(a.creationTimestamp).getTime(),
                                )
                                .map((draft) => (
                                    <div key={draft.draftId}>
                                        <DraftInvoiceCard
                                            draft={draft}
                                            isExpanded={expanded[draft.draftId]}
                                            toggle={() =>
                                                setExpanded({ ...expanded, [draft.draftId]: !expanded[draft.draftId] })
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
