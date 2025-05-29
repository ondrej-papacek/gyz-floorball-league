import { useAuthRole } from '../hooks/useAuthRole';
import { Navigate } from 'react-router-dom';

/**
 * to protect a component based on user role(s)
 */
export default function withRoleGuard(Component, requiredRoles) {
    return function RoleGuarded(props) {
        const { role, loading } = useAuthRole();

        if (loading) return <p>Načítání oprávnění...</p>;

        const allowedRoles = Array.isArray(requiredRoles)
            ? requiredRoles
            : [requiredRoles];

        if (!role || !allowedRoles.includes(role)) {
            return <Navigate to="/unauthorized" replace />;
        }

        return <Component {...props} />;
    };
}
