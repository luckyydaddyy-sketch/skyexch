import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom'
import Cookies from 'universal-cookie';
const cookies = new Cookies()

const PublicRoute = ({ children }: any) => {
    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const authToken = cookies.get('skyToken')

    return !isAuthenticated?.isLogin || !authToken ? children : <Navigate to="/" />;
}

export default PublicRoute