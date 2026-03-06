import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom'
import Cookies from 'universal-cookie';
const cookies = new Cookies()

const PrivateRoute = ({ children, hasAccess }: any) => {
    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const authToken = cookies.get('skyToken')
    if (hasAccess === 0) {
        return <Navigate to="/notFound/404" />
    }
    return  authToken ? children : <Navigate to="/login" />;
}

export default PrivateRoute