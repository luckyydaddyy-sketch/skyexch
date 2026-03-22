
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import SearchInput from '../../components/SearchInput'
import { postApi } from '../../service'
import { Data, dataInterface } from './interface'




function WinnerHistory() {

  const [tab, setTab] = useState('cricket')

  const switchTab = (tab: string) => {
    setTab(tab)
    getPageData(tab, '1')
    // "cricket", "soccer", "tennis",
  }

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  useEffect(() => {
    getPageData('cricket', '1')
    return () => {
    }
  }, [])

  const showAlert = async (item: any) => {
    if (window.confirm("Are you sure you want to rollback result?") === true) {
      let data: any = {
        api: ADMIN_API.SETTING.MATCH_HISTORY.ROLL_BACK_WINNER,
        value: {
          id: item._id,
        },
      }
      await postApi(data).then(function (response) {
        console.log(response);
        getPageData(tab, '1', '')


      }).catch(err => {
        if (err.response.data.statusCode === 401) {
          Logout()
          navigate('/login')
        }
      })
    }
  }


  const getPageData = async (TYPE: string, PAGE: string, SEARCH: string = '') => {
    let data: dataInterface = {
      api: ADMIN_API.SETTING.MATCH_HISTORY.GET_LIST,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '50'
      },
    }
    if (SEARCH !== '') {
      data.value.search = SEARCH
    }

    await postApi(data).then(function (response) {
      console.log(response);
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
    getPageData(tab, (e.selected + 1).toString())
  }
  const handleSearchSubmit = (search: any) => {
    getPageData(tab, '1', search)
  }

  return (
    <div className="container sportleague settings  main_wrap">
      <div className='top_header'>
        <div className='top_header_title  mt-3'>
          <h6 className="font-weight-bold"> Manage Cricket Winner History </h6>
        </div>
      </div>
      <div className="tabs">
        <div className='tabs_list'>
          <ul className="btn-group">
            <li className={`${tab === 'cricket' ? "active" : ""} tabs_list_item btn btn-outline-dark `} onClick={() => switchTab('cricket')}><a> Cricket </a></li>
            <li className={`${tab === 'soccer' ? "active" : ""} tabs_list_item btn  btn-outline-dark`} onClick={() => switchTab('soccer')}><a> Soccer </a></li>
            <li className={`${tab === 'tennis' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('tennis')} ><a> Tennis </a></li>
          </ul>
          <SearchInput searchSubmit={handleSearchSubmit} />
        </div>
        <div className='tabs_content mt-10'>
          <table className="table01 margin-table">
            <thead>
              <tr className="light-grey-bg">
                <th>Match Name</th>
                <th>Match Date</th>
                <th>Winner</th>
                <th>Status</th>
                <th>By Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="matches-table">
              {pageData && pageData?.results?.length > 0 ? pageData?.results?.map((item: any, i: any) => {
                return (

                  <tr>
                    <td> <span className="text-primary">{item.name}</span> </td>
                    <td> {item.openDate} </td>
                    <td> {item.winner} </td>
                    <td>
                      <span className={`badge ${item.settlementType === 'auto' ? 'badge-success text-white' : 'badge-primary text-white'}`}>
                        {item.settlementType || 'manual'}
                      </span>
                    </td>
                    <td> {item.settledBy || 'Admin'} </td>
                    <td>
                      <button type="button" className="btn btn-outline-danger btn-sm rollback-result shadow-none" onClick={() => showAlert(item)}>Rollback Result</button>
                    </td>
                  </tr>
                )
              }) : <><h2>no data</h2></>}
            </tbody>
          </table>
          {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}
        </div>
      </div>
    </div>
  )
}

export default WinnerHistory