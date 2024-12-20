import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../navbar/AdminNavbar';
import MobileHeader from 'components/Header/MobileHeader';
import Header from 'components/Header/Header';
import ErrorPage from 'components/ErrorPage/ErrorPage';
import { unauthorized, internalServerError, serverUnavailable } from 'components/ErrorPage/errors';
import LoadingPage from 'components/LoadingPage/LoadingPage';

import styles from './AdminLayout.module.css';
import './AdminHeader.css';

import { useAuth, AuthState } from 'contexts/AuthContext';

const AdminHeader = () => {
    return (
        <>
            <div className="adminHeader">
                <MobileHeader />
                <Header />
            </div>
        </>
    )
}

const ProtectedAdminRoute = ({ children }) => {
    const { user, authStatus, verifyAuth } = useAuth();

    useEffect(() => {
        // Verify token on mount
        verifyAuth();
    }, []);

    if (authStatus === AuthState.ELEVATED) {
        return children;
    }

    if (authStatus === AuthState.LOADING) {
        return <LoadingPage />;
    } else if (authStatus === AuthState.SERVER_UNAVAILABLE) {
        return <ErrorPage error={serverUnavailable} />;
    } else if (authStatus === AuthState.UNAUTHORIZED) {
        return <ErrorPage error={unauthorized} />;
    } else if (authStatus === AuthState.SERVER_ERROR) {
        return <ErrorPage error={internalServerError} />;
    }

    if (!user || user.role !== 'admin') {
        return <ErrorPage error={unauthorized} />;
    }

    return children;
};

export default function AdminLayout() {
    return (
        <ProtectedAdminRoute>
            <div id="adminLayout" className={styles.adminLayout}>
                <AdminHeader />
                <div className={styles.adminBody}>
                    <div className={styles.adminNavbar}>
                        <AdminNavbar />
                    </div>
                    <div className={styles.adminContent}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </ProtectedAdminRoute>
    )
}
