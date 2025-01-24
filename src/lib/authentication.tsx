import { createContext, useContext, useEffect, useState } from 'react';

export interface AuthenticationContextType {
    authenticated: boolean;
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(null);

export const useAuthenticationContext = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    console.log({ authenticated });
    //    localStorage.setItem('accessToken', response.data.accessToken);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            setAuthenticated(true);
        }
    }, []);

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
