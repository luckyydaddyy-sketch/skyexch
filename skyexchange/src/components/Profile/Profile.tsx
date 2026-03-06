import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import { postApi, postApiAdmin } from '../../service'

const Profile = (props: any) => {

    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const [didLoad, setDidLoad] = useState<boolean>(false);
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { ShowPopUp, userId, TYPE } = props
    
    const [pageData, setPageData] = useState<any>({})
    // useEffect(() => {
    //     getPageData()
    //     return () => {
    //     }
    // }, [])

    const DD = useSelector((e: any) => e.domainDetails);
    const [domainDetails, setDomainDetails] = useState(DD)
    
    useEffect(() => {
        setDomainDetails(DD)
        return () => { }
    }, [DD])
    useEffect(() => {
        //'/admin/downLineList'
        if (!didLoad) {
            if (isAuthenticated?.isLogin) {
                getPageData(isAuthenticated.token)
            }
            setDidLoad(true);
        }
        return () => {

        }
    }, [didLoad, isAuthenticated])
    const getPageData = async (token: any = undefined) => {
        let data: any = {
            api: userId && ADMIN_API.PLAYER_GET_PROFILE,
            value: {id: userId},
            token: token ? token : undefined
        }


        await postApiAdmin(data).then(function (response) {
            console.log(response);
            setPageData(response.data.data)
            dispatch({ type: 'USER_DATA', payload: response.data.data })
        }).catch(err => {
            debugger
            if (err.response.data.statusCode === 401) {
                dispatch({ type: 'AUTHENTICATION', payload: { isLogin: false, token: '', changePassword:false } })
                Logout()
                navigate('/login')
            }
        })

    }
    return (
        <>
            <div className='account_tabs_r'>
            {/* <div className='account_tabs_r'> */}
                <div className='account_tabs_r_title'>
                    <strong>Account Summary</strong>
                </div>
                <div className='table-responsive'>
                    <table className="table01 margin-table">
                        <tbody>
                            <tr>
                                <th className="light-grey-bg">Wallet</th>
                                <th className="light-grey-bg">Funds available to withdraw</th>
                                <th className="light-grey-bg">available to Bet</th>
                                <th className="light-grey-bg">Current exposure</th>
                            </tr>
                            <tr>
                                <td> Main wallet</td>
                                <td className="text-success"> {pageData.balance} </td>
                                <td className="text-success"> {pageData.remaining_balance} </td>
                                <td className="text-success"> {pageData.exposure} </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='d_flex account_tabs_r_d'>
                    <div className='account_tabs_r_d_l'>
                        <div className='d_flex account_tabs_r_d_l_item_wrp'>
                            <div className='account_tabs_r_d_l_item'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>About You</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody><tr>
                                            <td width="50%">First Name</td>
                                            <td>{pageData.firstName}</td>
                                        </tr>
                                            <tr>
                                                <td width="50%">Last Name</td>
                                                <td>{pageData.lastName}</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Username</td>
                                                <td>{pageData.user_name}</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Password</td>
                                                <td>******
                                                    <a onClick={(e) => ShowPopUp(pageData)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z" /></svg></a>
                                                </td>
                                            </tr>
                                        </tbody></table>
                                </div>
                            </div>
                            <div className='account_tabs_r_d_l_item d-none'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Address</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody>
                                            <tr>
                                                <td width="50%">Address</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Town/City</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Country</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Country/State</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Postcode</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Timezone</td>
                                                <td>IST</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='account_tabs_r_d_l right'>
                        <div className='d_flex account_tabs_r_d_l_item_wrp'>
                            <div className='account_tabs_r_d_l_item'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Contact Details</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody><tr>
                                            <td width="50%">Primary number</td>
                                            <td>{pageData.mobileNumber}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='account_tabs_r_d_l_item d-none'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Address</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody>
                                            <tr>
                                                <td width="50%">Currency</td>
                                                <td>{domainDetails?.currency ? domainDetails?.currency : 'PTH'}</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Odds Format	</td>
                                                <td>-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='account_tabs_r_d_l_item d-none'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Commission</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody>
                                            <tr>
                                                <td width="50%">Commission</td>
                                                <td>0%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile

