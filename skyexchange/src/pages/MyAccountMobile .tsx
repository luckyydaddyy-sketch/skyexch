import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Logout } from '../common/Funcation';
import NewsLine from '../components/NewsLine';

const MyAccountMobile = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const HeaderData = useSelector((e: any) => e.Header);

    const [headerOptions, setHeaderOptions] = useState(HeaderData);

    useEffect(() => {
        setHeaderOptions(HeaderData)
        return () => { }
    }, [HeaderData])

    const HandleLogOut = (e: any) => {
        e.preventDefault()
        Logout(e)
        dispatch({ type: 'AUTHENTICATION', payload: { isLogin: false, token: '' } })
        navigate('/login')
    }

    return (
        <>
            <div className="container accountMobile">
            <NewsLine /> 

                <div className='path-wrap'>
                    <p className='account-id'>
                        <span> {headerOptions?.user_name} </span>
                        <span className="gmt" title="Time Zone">GMT+6.00</span>
                    </p>

                </div>

                <ul id="account_pop">
                    <li>
                        <Link to="/user/profile" replace={true} >My Profile
                        </Link>
                    </li>

                    <li>
                        <Link to="/user/account-statement/" replace={true}>Balance Overview
                        </Link>
                    </li>

                    <li>
                        <Link to="/user/mybet/" replace={true}>My Bets
                        </Link>
                    </li>

                    <li>
                        <Link to="/user/bethistory/" replace={true}>Bets History
                        </Link>
                    </li>

                    <li>
                        <Link to="/user/profitloss" replace={true}>Profit &amp; Loss
                        </Link>
                    </li>

                    <li>
                        <Link to="/user/activity-log/" replace={true}>Activity Log
                        </Link>
                    </li>
                    <li>
                        <Link to={'d-w'} replace={true}>
                            <b>Deposit/Withdraw wallet</b>
                        </Link>
                    </li>

                </ul>

                <a id="logout" className="logout" onClick={(e) => HandleLogOut(e)}>LOGOUT
                    <span />
                </a>
            </div >

        </>

    )
}

export default MyAccountMobile