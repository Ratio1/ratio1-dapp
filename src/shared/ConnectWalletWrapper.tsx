import { Button } from '@nextui-org/button';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { FunctionComponent, PropsWithChildren } from 'react';

interface Props {
    isFullWidth?: boolean;
}

export const ConnectWalletWrapper: FunctionComponent<PropsWithChildren<Props>> = ({ children, isFullWidth }) => {
    const { open } = useAppKit();
    const { isConnected } = useAppKitAccount();

    return isConnected ? (
        <>{children}</>
    ) : (
        <Button
            fullWidth={!!isFullWidth}
            color="primary"
            onPress={() => {
                open({ view: 'Connect' });
            }}
        >
            Connect Wallet
        </Button>
    );
};
