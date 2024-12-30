import { NextUIProvider } from '@nextui-org/system';
import { BrowserRouter } from 'react-router-dom';

export function Wrappers({ children }: { children: React.ReactNode }) {
    return (
        <BrowserRouter>
            <NextUIProvider>{children}</NextUIProvider>
        </BrowserRouter>
    );
}
