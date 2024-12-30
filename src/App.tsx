import Layout from '@components/Layout';
import { routePaths, routes } from '@lib/routes';
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
    return (
        <Routes>
            <Route path={routePaths.root} element={<Layout />}>
                <Route path="/" element={<Navigate to={routePaths.dashboard} replace />} />

                {routes.map((route, index) => (
                    <Route path={route.path} key={'route-key-' + index} element={<route.page />}></Route>
                ))}
            </Route>

            <Route path="*" element={<Navigate to={routePaths.dashboard} replace />} />
        </Routes>
    );
}

export default App;
