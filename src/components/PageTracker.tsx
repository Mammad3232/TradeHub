import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';

/**
 * Safely inspects stored JWT token claims and local storage user sessions
 * to determine if the currently logged-in user has Admin privileges.
 */
function isCurrentUserAdmin(): boolean {
    try {
        // 1. Check claims inside the JWT token (avoids race conditions with user state)
        const token = localStorage.getItem('tradehub_token');
        if (token) {
            const parts = token.split('.');
            if (parts.length === 3) {
                const base64Url = parts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const payload = JSON.parse(jsonPayload);

                const role =
                    payload.role ||
                    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                    payload['Role'] ||
                    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];

                const email =
                    payload.email ||
                    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

                if (
                    (typeof role === 'string' && role.toLowerCase() === 'admin') ||
                    (Array.isArray(role) && role.some((r) => String(r).toLowerCase() === 'admin')) ||
                    email === 'admin@vendora.store' ||
                    email === 'admin@vendora.com'
                ) {
                    return true;
                }
            }
        }

        // 2. Check all possible localStorage user objects
        const sessionKeys = ['vendora_user', 'mockUser', 'vendora_active_user'];
        for (const key of sessionKeys) {
            const raw = localStorage.getItem(key);
            if (raw) {
                const user = JSON.parse(raw);
                const role = String(user?.role || '').toLowerCase();
                const email = String(user?.email || '').toLowerCase();

                if (
                    role === 'admin' ||
                    email === 'admin@vendora.store' ||
                    email === 'admin@vendora.com'
                ) {
                    return true;
                }
            }
        }
    } catch (e) {
        console.error('Error checking admin role in PageTracker:', e);
    }

    return false;
}

export const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('tradehub_token');
        if (!token) return;

        // Do not invoke page tracking if the user is an Admin
        if (isCurrentUserAdmin()) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`http://localhost:5229/hubs/orders?access_token=${encodeURIComponent(token)}`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.None)
            .build();

        connection
            .start()
            .then(() => {
                connection.invoke('TrackPageChange', location.pathname).catch((err) => console.error(err));
            })
            .catch(() => { });

        return () => {
            if (connection.state !== signalR.HubConnectionState.Disconnected) {
                connection.stop();
            }
        };
    }, [location.pathname]);

    return null;
};