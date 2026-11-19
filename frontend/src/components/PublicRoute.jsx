import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../auth/jwt';

const PublicRoute = () => {
    if (isAuthenticated()) {
        return <Navigate to="/home" replace />;
    }
    return <Outlet />;
};

export default PublicRoute;