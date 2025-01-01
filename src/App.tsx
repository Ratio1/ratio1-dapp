import Layout from '@components/Layout';
import { AppRoute, ParentRoute, routePath, routes, SimpleRoute } from '@lib/routes';
import { Navigate, Route, Routes } from 'react-router-dom';

// Type guard to check if a route is a SimpleRoute
function isSimpleRoute(route: AppRoute): route is SimpleRoute {
    return (route as SimpleRoute).page !== undefined;
}

// Type guard to check if a route is a ParentRoute
function isParentRoute(route: AppRoute): route is ParentRoute {
    return (route as ParentRoute).children !== undefined;
}

function App() {
    return (
        <Routes>
            <Route path={routePath.root} element={<Layout />}>
                <Route path="/" element={<Navigate to={routePath.dashboard} replace />} />

                {routes.map((route, index) => {
                    if (isSimpleRoute(route)) {
                        // Render a route for SimpleRoute
                        return <Route key={'route-key-' + index} path={route.path} element={<route.page />} />;
                    } else if (isParentRoute(route) && route.children && route.children.length > 0) {
                        // Render the parent route to redirect to the first child
                        return (
                            <Route key={'route-key-' + index} path={route.path}>
                                {/* Redirect parent to its first child */}
                                <Route index element={<Navigate to={route.children[0].path} replace />} />
                                {/* Render child routes */}
                                {route.children.map((child, childIndex) => (
                                    <Route key={'child-route-key-' + childIndex} path={child.path} element={<child.page />} />
                                ))}
                            </Route>
                        );
                    }

                    // Fallback (not strictly necessary if routes are validated)
                    return null;
                })}

                {/* {routes.map((route, index) => (
                    <Route path={route.path} key={'route-key-' + index} element={<route.page />}></Route>
                ))} */}
            </Route>

            <Route path="*" element={<Navigate to={routePath.dashboard} replace />} />
        </Routes>
    );
}

export default App;
