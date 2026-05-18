import { routePath } from '@lib/routes/route-paths';
import { CspsTable } from '@pages/Admin';
import { Navigate } from 'react-router-dom';

/*
Use this route to render real UI components for Playwright screenshots without requiring
login/wallet flows. Keep data deterministic and avoid live API/blockchain dependencies.
*/
export default function PlaywrightPreview() {
    if (!import.meta.env.DEV) {
        return <Navigate to={routePath.notFound} replace />;
    }

    return (
        <main className="mx-auto min-h-dvh w-full max-w-6xl p-6 md:p-10">
            <section id="playwright-preview">
                <CspsTable
                    fetchData={() => undefined}
                    csps={[
                        {
                            escrowAddress: '0x1111111111111111111111111111111111111111',
                            owner: '0x2222222222222222222222222222222222222222',
                            tvl: 1250000000n,
                            activeJobsCount: 8n,
                            tier: 2,
                            name: 'Ratio1 Labs',
                        },
                        {
                            escrowAddress: '0x3333333333333333333333333333333333333333',
                            owner: '0x4444444444444444444444444444444444444444',
                            tvl: 0n,
                            activeJobsCount: 0n,
                            tier: 0,
                        },
                    ]}
                />
            </section>
        </main>
    );
}
