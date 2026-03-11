import Tiers from '@components/Tiers';
import { routePath } from '@lib/routes/route-paths';
import { PriceTier } from '@typedefs/blockchain';
import { Navigate } from 'react-router-dom';

const previewPriceTiers: PriceTier[] = [
    {
        index: 1,
        usdPrice: 0.9,
        totalUnits: 500000,
        soldUnits: 420000,
    },
    {
        index: 2,
        usdPrice: 1.25,
        totalUnits: 700000,
        soldUnits: 215000,
    },
    {
        index: 3,
        usdPrice: 1.8,
        totalUnits: 900000,
        soldUnits: 50000,
    },
];

const currentPreviewTier = 2;

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
            <section id="playwright-preview" className="mx-auto w-full max-w-3xl">
                <Tiers currentStage={currentPreviewTier} stages={previewPriceTiers} />
            </section>
        </main>
    );
}
