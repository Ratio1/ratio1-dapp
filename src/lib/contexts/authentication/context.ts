import { AppKitSIWEClient } from '@reown/appkit-siwe';
import { ApiAccount } from '@typedefs/blockchain';
import { DebouncedFuncLeading } from 'lodash';
import { createContext } from 'react';

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

export const AuthenticationContext = createContext<AuthenticationContextType | null>(null);
