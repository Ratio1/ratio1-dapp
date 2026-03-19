import Tiers from '@components/Tiers';
import { routePath } from '@lib/routes/route-paths';
import { PriceTier } from '@typedefs/blockchain';
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
            <section id="playwright-preview"></section>
        </main>
    );
}
