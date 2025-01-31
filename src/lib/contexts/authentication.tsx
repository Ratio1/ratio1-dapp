import { accessAuth, getAccount } from '@lib/api/backend';
import { safeAddress } from '@lib/config';
import {
    AppKitSIWEClient,
    createSIWEConfig,
    formatMessage,
    getAddressFromMessage,
    getChainIdFromMessage,
    SIWECreateMessageArgs,
    SIWEVerifyMessageArgs,
} from '@reown/appkit-siwe';
import { useQuery } from '@tanstack/react-query';
import { ApiAccount } from '@typedefs/blockchain';
import { DebouncedFuncLeading, throttle } from 'lodash';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { baseSepolia } from 'viem/chains';

export interface AuthenticationContextType {
    // SIWE
    authenticated: boolean;
    siweConfig: AppKitSIWEClient | undefined;
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
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [siweConfig, setSiweConfig] = useState<AppKitSIWEClient>();
    const [account, setAccount] = useState<ApiAccount>();

    // SIWE
    useEffect(() => {
        (async () => {
            const session = await getSession();
            console.log('Session', session);

            if (session) {
                setAuthenticated(true);
            }
        })();

        setSiweConfig(
            createSIWEConfig({
                signOutOnAccountChange: true,
                signOutOnNetworkChange: true,
                signOutOnDisconnect: true,
                getMessageParams: async () => ({
                    domain: window.location.host,
                    uri: window.location.origin,
                    chains: [baseSepolia.id],
                    statement: 'Please sign with your account.',
                    iat: new Date().toISOString(),
                }),
                createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
                getNonce: async () => {
                    const nonce = 'ZHa67TjiuP3NwIJ9Y'; //TODO nonce generation
                    return nonce;
                },
                getSession,
                verifyMessage,
                signOut: async () => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('chainId');
                    localStorage.removeItem('address');

                    return true;
                },
                onSignOut() {
                    // Called after sign-out
                    setAuthenticated(false);
                },
                onSignIn() {
                    // Called afer sign-in
                    setAuthenticated(true);
                },
            }),
        );
    }, []);

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

    async function getSession() {
        const accessToken = localStorage.getItem('accessToken');
        const expiration = localStorage.getItem('expiration');
        const chainId = localStorage.getItem('chainId');
        const address = localStorage.getItem('address');

        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (chainId && address && accessToken && expiration && parseInt(expiration) > currentTimestamp) {
            return { chainId: parseInt(chainId), address };
        }

        return null;
    }

    //TODO handle properly
    const verifyMessage = async ({ message, signature }: SIWEVerifyMessageArgs) => {
        try {
            const chainId = getChainIdFromMessage(message).replace('eip155:', '');
            const address = getAddressFromMessage(message);
            if (address === safeAddress) {
                localStorage.setItem('chainId', chainId);
                localStorage.setItem('address', address);
                localStorage.setItem('accessToken', 'safe');
                return true;
            }
            const response = await accessAuth({ message, signature });
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('expiration', response.expiration.toString());
            localStorage.setItem('chainId', chainId);
            localStorage.setItem('address', address);
            return true;
        } catch (error) {
            return false;
        }
    };

    return (
        <AuthenticationContext.Provider
            value={{
                // SIWE
                authenticated,
                siweConfig,
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
