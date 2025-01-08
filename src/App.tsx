import Layout from '@components/Layout';
import { AuthenticationContextType, useAuthenticationContext } from '@lib/authentication';
import { isParentRoute, isSimpleRoute, routePath, routes } from '@lib/routes';
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
    const { authenticated, setAuthenticated } = useAuthenticationContext() as AuthenticationContextType;

    return (
        <Routes>
            <Route path={routePath.root} element={<Layout />}>
                <Route path="/" element={<Navigate to={routePath.dashboard} replace />} />

                {routes.map((route, index) => {
                    if (isSimpleRoute(route)) {
                        return <Route key={'route-key-' + index} path={route.path} element={<route.page />} />;
                    } else if (isParentRoute(route) && route.children && route.children.length > 0) {
                        return (
                            <Route key={'route-key-' + index} path={route.path}>
                                <Route index element={<Navigate to={route.children[0].path} replace />} />

                                {route.children.map((child, childIndex) => (
                                    <Route key={'child-route-key-' + childIndex} path={child.path} element={<child.page />} />
                                ))}
                            </Route>
                        );
                    }

                    // Fallback (not necessary if routes are validated)
                    return null;
                })}
            </Route>

            <Route path="*" element={<Navigate to={routePath.dashboard} replace />} />
        </Routes>
    );
}

export default App;
