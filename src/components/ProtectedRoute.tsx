import { Spinner } from '@nextui-org/spinner';
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
    hasAccess: () => Promise<boolean>;
}

export const ProtectedRoute: FunctionComponent<PropsWithChildren<Props>> = ({ children, hasAccess }) => {
    const [isAuthorized, setAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const accessResult = await hasAccess();
                setAuthorized(accessResult);
            } catch (error) {
                console.error('Error checking access:', error);
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, [hasAccess]);

    if (loading)
        return (
            <div className="center-all flex-1">
                <Spinner />
            </div>
        );

    if (!isAuthorized) return <Navigate to="/unauthorized" />;

    return children as JSX.Element;
};
