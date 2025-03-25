import { useAuthRole } from '../hooks/useAuthRole';
import { Navigate } from 'react-router-dom';

export default function withRoleGuard(Component, requiredRole) {
    return function RoleGuarded(props) {
        const { role, loading } = useAuthRole();

        if (loading) return <p>Načítání oprávnění...</p>;
        if (!role || (requiredRole && role !== requiredRole)) {
            return <Navigate to="/" />;
        }

        return <Component {...props} />;
    };
}
