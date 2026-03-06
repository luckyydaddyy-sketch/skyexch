import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { getImageUrl, Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import { postApi, notifyMessage } from '../../service'

const Deposit = () => {

    const [showType, setShowType] = useState('pending') // approve, pending, rejected
    const navigate = useNavigate()
    const [pageData, setPageData] = useState<any>({})
    const [activePage, setActivePage] = useState('1')
    const [isLoader, setIsLoader] = useState(false)

    useEffect(() => {
        getPageData(showType, activePage)
        return () => {
        }
    }, [])


    const getPageData = async (TYPE: string, PAGE: string, SEARCH: string = '') => {
        let data: any = {
            api: ADMIN_API.ONLINE_PAYMENT.DEPOSIT.GET_LIST,
            value: {
                page: PAGE ? PAGE : activePage,
                limit: '50',
                status: TYPE
            },
        }
        if (SEARCH !== '') {
            data.value.search = SEARCH
        }

        setIsLoader(true)
        await postApi(data).then(function (response) {
            console.log(response);
            setPageData(response.data.data)
            setIsLoader(false)
        }).catch(err => {
            setIsLoader(false)
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    const handlePageClick = (e: any) => {
        console.log('page clicked', e);
        setActivePage((e.selected + 1).toString())
        getPageData(showType, (e.selected + 1).toString())
    }

    const handleSubmit = (search: any) => {
        getPageData(showType, activePage, search)
    }

    const handleStatusChange = async (item: any, isApprove: boolean) => {
        let data: any = {
            api: ADMIN_API.ONLINE_PAYMENT.DEPOSIT.APPROVE_DEPOSIT,
            value: {
                id: item._id,
                isApprove: isApprove
            },
        }


        await postApi(data).then(function (response) {
            console.log(response);
            notifyMessage('Update')
            getPageData(showType, activePage)
        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }

    return (
        <div className="container betlive sportleague">
            <div className='top_header'>
                <div className='top_header_title  mt-3'>
                    <h6 className="font-weight-bold">Manage Deposit</h6>
                </div>
            </div>
            <div className="tabs">
                <div className='tabs_list'>
                    <div className='search_form'>
                        <select name="status" id="" className="form-control" value={showType}
                            onChange={(e) => {
                                setShowType(e.target.value)
                                getPageData(e.target.value, activePage)
                            }}>
                            <option value="approve">Approve</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        {/* <SearchInput searchSubmit={handleSubmit} /> */}
                    </div>
                    {/* <ul className="btn-group">
              <li className={`${tab === 'cricket' ? "active" : ""} tabs_list_item btn btn-outline-secondary `} onClick={() => switchTab('cricket')}><a> Cricket </a></li>
              <li className={`${tab === 'soccer' ? "active" : ""} tabs_list_item btn  btn-outline-secondary`} onClick={() => switchTab('soccer')}><a> Soccer </a></li>
              <li className={`${tab === 'tennis' ? "active" : ""} tabs_list_item  btn btn-outline-secondary`} onClick={() => switchTab('tennis')} ><a> Tennis </a></li>
            </ul> */}
                    {/* <button className='btn btn-warning' onClick={() => setShowType(!showType)}> Show {showType ? 'Rejected' : 'Approve'} </button> */}
                </div>
                <div className='tabs_content mt-10'>
                    <table className="table01 margin-table">
                        <thead>
                            {/* PL	Bet ID	Bet taken	Market	Selection	Type	Odds req.	Stake	Profit/Loss */}
                            <tr>
                                <th> Image </th>
                                <th> User Name </th>
                                <th>Amount </th>
                                <th> Mobile No </th>
                                <th> transaction ID </th>
                                <th>Create Date </th>
                                <th> Status </th>
                                <th style={{ textAlign: 'center' }}> Action </th>
                            </tr>
                        </thead>
                        {isLoader ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="./images/miniloadder.svg" alt="" /></div> : <tbody id="matches-table">
                            {/* {pageData && pageData?.results?.length > 0 ? pageData?.results?.map((item: any, i: any) => {
                  return (
                    <tr>
                      <td>{item.userId?.user_name}</td>
                      <td>{item.selection}</td>
                      <td> {item.type} </td>
                      <td>{item.odds}</td>
                      <td>{item.stake}</td>
                    </tr>
                  )
                }) : <><h2>No Record Found</h2></>} */}
                            {pageData && pageData?.results?.length > 0 ? pageData?.results?.map((item: any, i: any) => {
                                return (
                                    <tr key={i}>
                                        <td style={{ width: "20%" }}>
                                            <a href={getImageUrl(item.image)} target="_blank">
                                                <img src={getImageUrl(item.image)} alt="" />
                                            </a>
                                        </td>
                                        <td> {item.userName || '-'} </td>
                                        <td> {item.amount || '-'} </td>
                                        <td> {item.mobileNo || '-'}  </td>
                                        <td> {item.transactionId || '-'} </td>
                                        <td> {moment(item.createdAt).format(
                                            "DD/MM/YYYY hh:mm A"
                                        )} </td>
                                        <td> 	{item.approvalBy === null && item.isApprove === false ? 'Panging' : item.approvalBy !== null && item.isApprove === false ? 'Reject' : 'Approve'} </td>
                                        {item.approvalBy === null && item.isApprove === false ? <td>
                                            <div style={{ textAlign: 'center', display: 'flex', gap: 10, justifyContent: 'center' }}>
                                                <button className="btn btn-success" onClick={() => handleStatusChange(item, true)}>Approve</button>
                                                <button className="btn btn-error" onClick={() => handleStatusChange(item, false)}>Reject</button>
                                            </div>
                                        </td> : <td> - </td>}
                                    </tr>
                                )
                            }) : <><h2>No Record Found</h2></>}
                        </tbody>}
                    </table>
                    {pageData?.totalPages === 1 || pageData?.totalPages === 0 || !pageData?.totalPage ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}
                    
                </div>
            </div>
        </div>
    )
}

export default Deposit