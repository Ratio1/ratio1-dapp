import { NextUIProvider } from '@nextui-org/system';

export function Wrappers({ children }: { children: React.ReactNode }) {
    return <NextUIProvider>{children}</NextUIProvider>;
}
