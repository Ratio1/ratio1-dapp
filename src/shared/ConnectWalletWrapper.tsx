import { Button } from '@nextui-org/button';
import { useModal } from 'connectkit';
import { FunctionComponent, PropsWithChildren } from 'react';
import { useAccount } from 'wagmi';

interface Props {
    isFullWidth?: boolean;
}

export const ConnectWalletWrapper: FunctionComponent<PropsWithChildren<Props>> = ({ children, isFullWidth }) => {
    const { setOpen } = useModal();
    const { isConnected } = useAccount();

    return isConnected ? (
        <>{children}</>
    ) : (
        <Button
            fullWidth={!!isFullWidth}
            color="primary"
            onPress={() => {
                setOpen(true);
            }}
        >
            Connect Wallet
        </Button>
    );
};
