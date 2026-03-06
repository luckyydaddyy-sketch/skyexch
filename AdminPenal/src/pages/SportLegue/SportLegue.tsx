
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import SearchInput from '../../components/SearchInput'
import { notifyMessage, postApi } from '../../service'
import { styleObjectBlackButton } from '../../common/StyleSeter'
import { useSelector } from 'react-redux'

interface sportsInterface {
  gameId: number
  name: string
  openDate: string
  startDate: string
  status: boolean
  _id: string,
  activeStatus: {
    bookmaker: boolean
    fancy: boolean
    premium: boolean
    status: boolean
  }
}


interface dataInterface {
  api: string,
  value: {
    type?: string,
    page?: string,
    limit?: string,
    search?: string,
    id?: string
  }
}

function SportLegue() {
  const DD = useSelector((e: any) => e.domainDetails);
  const [tab, setTab] = useState('cricket')
  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  const [activePage, setActivePage] = useState('1')
  const [isLoader, setIsLoader] = useState(false)

  const switchTab = (tab: string) => {
    setTab(tab)
    getPageData(tab, activePage)
  }

  useEffect(() => {
    getPageData(tab, activePage)
    return () => {
    }
  }, [])



  const getPageData = async (TYPE: string, PAGE: string, SEARCH: string = '') => {
    let data: dataInterface = {
      api: ADMIN_API.SPORTS.LIST,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : activePage,
        limit: '50',
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
    getPageData(tab, (e.selected + 1).toString())
  }

  const handleSubmit = (search: any) => {
    getPageData(tab, activePage, search)
  }

  const handleStatusChange = async (item: any) => {
    let data: dataInterface = {
      api: ADMIN_API.SPORTS.ACTIVE_SPORT,
      value: {
        id: item === 'All' ? item : item._id,
        type: tab
      },
    }


    await postApi(data).then(function (response) {
      console.log(response);
      notifyMessage('Update')
      getPageData(tab, activePage)
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }

  return (
      <div className='container '>
        <div className="top_header">
          <div className="top_header_title mt-3">
            <h5>Manage Current Bets</h5>
          </div>
        </div>
      <div className="tabs">
        <div className='tabs_list'>
          <ul className="btn-group">
            <li className={`${tab === 'cricket' ? "active" : ""} tabs_list_item btn btn-outline-secondary `} onClick={() => switchTab('cricket')}><a> Cricket </a></li>
            <li className={`${tab === 'soccer' ? "active" : ""} tabs_list_item btn  btn-outline-secondary`} onClick={() => switchTab('soccer')}><a> Soccer </a></li>
            <li className={`${tab === 'tennis' ? "active" : ""} tabs_list_item  btn btn-outline-secondary`} onClick={() => switchTab('tennis')} ><a> Tennis </a></li>
          </ul>
          
          {/* <div className="account_tabs_filter d_flex">
              <div style={{ margin: "0 10px" }}>
                <input type="button" style={styleObjectBlackButton(DD?.colorSchema, true)}  value="Just For Today" name="today" id="today" className="submit-btn btn_black" />
              </div>
              <div style={{ marginRight: "10px" }}>
                <input type="button" style={styleObjectBlackButton(DD?.colorSchema, true)}  value="From Yesterday" name="yesterday" id="yesterday" className="submit-btn btn_black" />
              </div>
              <div style={{ marginRight: "10px" }}>
                <input style={styleObjectBlackButton(DD?.colorSchema, true)} type="button" value="Get P & L" name="getPL" id="getPL" className="submit-btn btn_black"  />
              </div>
            </div> */}
          <button className='btn btn-warning' style={{...styleObjectBlackButton(DD?.colorSchema, true), fontSize: "12px", padding: "0 6px", height: "28px", width: "90px"}} onClick={()=>handleStatusChange("All")}> Check All </button>
        </div>
        <div className='tabs_content mt-10'>
          <table className="table01 margin-table">
            <thead>
              {/* PL	Bet ID	Bet taken	Market	Selection	Type	Odds req.	Stake	Profit/Loss */}
              <tr>
                <th> Market ID </th>
                <th> Game ID </th>
                <th> Match Name	</th>
                <th> Match Date </th>
                <th> Action </th>
              </tr>
            </thead>
            {isLoader ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="./images/miniloadder.svg" alt="" /></div> : <tbody id="matches-table">
              {/* {pageData && pageData?.results?.length > 0 ? pageData?.results?.map((item: sportsInterface, i: any) => {
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
              { pageData && pageData?.results?.length > 0 ? pageData?.results?.map((item: sportsInterface, i: any) => {
                return (
                  <tr key={i}>
                    <td> {item._id} </td>
                    <td> {item.gameId}  </td>
                    <td> {item.name} </td>
                    <td> 	{item.openDate} </td>
                    <td>
                      <div className="form-check form-switch large-switch">
                        <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked0" onChange={() => handleStatusChange(item)} checked={item.status} disabled={item.status} name="sport-league" />
                        <label className="form-check-label" htmlFor="flexSwitchCheckChecked0"></label>
                      </div>
                    </td>
                  </tr>
                )
              }) : <><h2>No Record Found</h2></>}
            </tbody>}
          </table>
          {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}
        </div>
      </div>
    </div>
  )
}

export default SportLegue