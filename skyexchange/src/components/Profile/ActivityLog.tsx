import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import { postApi, postApiAdmin } from '../../service'
import Pagination from '../Pagination'
import Loader from '../Loader'
import Cookies from 'universal-cookie'
interface UserStatementInterFace {
    action: string,
    browser_detail: string,
    createdAt: string,
    data: string,
    ip_address: string,
    systemDetail: string,
    updatedAt: string,
    userId: string,
    __v: number,
    _id: string
}
const cookies = new Cookies()
const ActivityLog = (props: any) => {
    const { userId } = props

    const navigate = useNavigate()
    const [pageData, setPageData] = useState<any>({})
    const userData = useSelector((e: any) => e.userData);

    useEffect(() => {
        console.log("activityLogs : userData: " , userData);
        console.log("activityLogs : userId: " , userId);
        
        if (userData || cookies.get('skyTokenFront')) {
            getPageData('1')
        }

        return () => {

        }
    }, [userData])


    const getPageData = async (PAGE: string) => {
        console.log("activityLogs : init");
        let data = {
            api: ADMIN_API.MY_ACCOUNT.GET_ACTIVITIES,
            value: {
                id: userId ? userId : userData._id,
                page: PAGE ? PAGE : '1',
                limit: '50'
            },
        }

        await postApiAdmin(data).then(function (response) {
            console.log("activityLogs :",response);
            setPageData(response.data.data)

        }).catch(err => {
            debugger
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })

    }
    const handlePageClick = (e: any) => {
        console.log('page clicked', e);
        getPageData((e.selected + 1).toString())
    }
    return (
        <>

            {
                !pageData.userActivitie &&
                <Loader />
            }
            <div className='account_tabs_r'>
                <div className='account_tabs_r_title mb-15'>
                    <strong>Account Summary</strong>
                </div>
                <div className='table-responsive'>
                    <table id="resultTable" className="table01 margin-table">
                        <thead>
                            <tr>
                                <th>Sr no</th>
                                <th>Date/Time</th>
                                <th>Action</th>
                                <th>IP Address</th>
                                <th>Browser</th>
                                <th>OS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.userActivitie && pageData.userActivitie.results.length > 0 ? pageData.userActivitie.results.map((item: UserStatementInterFace, i: any) => {
                                return (
                                    <>

                                        <tr key={item._id}>
                                            <td>{i + 1}</td>
                                            <td>{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                                            <td>{item.action}</td>
                                            <td>{item.ip_address}</td>
                                            <td>{item.browser_detail}</td>
                                            <td>{item.systemDetail}</td>
                                        </tr>
                                    </>
                                )
                            }) : <h2>No Record</h2>}
                        </tbody>
                    </table>
                </div>
                {pageData.userActivitie?.totalPages === 1 || pageData.userActivitie?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData.userActivitie?.totalPages} />}
            </div>

        </>
    )
}

export default ActivityLog