import { createContext, useContext, useState } from 'react';

export interface AuthenticationContextType {
    authenticated: boolean;
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(null);

export const useAuthenticationContext = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState<boolean>(false);

    return (
        <AuthenticationContext.Provider
            value={{
                authenticated,
                setAuthenticated,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
};
