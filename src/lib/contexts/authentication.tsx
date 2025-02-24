import { getAccount } from '@lib/api/backend';
import { useQuery } from '@tanstack/react-query';
import { ApiAccount } from '@typedefs/blockchain';
import { useModal, useSIWE } from 'connectkit';
import { DebouncedFuncLeading, throttle } from 'lodash';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

export interface AuthenticationContextType {
    // SIWE
    authenticated: boolean;
    // Account
    account: ApiAccount | undefined;
    setAccount: React.Dispatch<React.SetStateAction<ApiAccount | undefined>>;
    fetchAccount: DebouncedFuncLeading<() => Promise<void>>;
    isFetchingAccount: boolean;
    accountFetchError: Error | null;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthenticationContext = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
    const { isConnected } = useAccount();
    const { isSignedIn: authenticated } = useSIWE();
    const { open: modalOpen, openSIWE } = useModal();
    const [account, setAccount] = useState<ApiAccount>();

    // SIWE
    useEffect(() => {
        if (isConnected && !authenticated && !modalOpen) {
            openSIWE();
        }
    }, [isConnected, authenticated, modalOpen]);

    useEffect(() => {
        if (authenticated) {
            fetchAccount();
        }
    }, [authenticated]);

    const {
        refetch,
        error: accountFetchError,
        isLoading: isFetchingAccount,
    } = useQuery({
        queryKey: ['fetchAccount'],
        queryFn: async () => {
            const data = await getAccount();

            console.log('fetchAccount', data);

            if (!data) {
                throw new Error('Internal server error');
            }

            setAccount(data);

            return data;
        },
        enabled: false,
        retry: false,
    });

    const fetchAccount = useRef(
        throttle(
            () => {
                if (isFetchingAccount) return;
                refetch();
            },
            3000,
            { trailing: false },
        ),
    ).current;

    return (
        <AuthenticationContext.Provider
            value={{
                // SIWE
                authenticated,
                // Account
                account,
                setAccount,
                fetchAccount,
                isFetchingAccount,
                accountFetchError,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};
