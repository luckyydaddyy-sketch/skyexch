
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import { styleObjectBlackButton } from '../../common/StyleSeter'
import Pagination from '../../components/Pagination'
import SearchInput from '../../components/SearchInput'
import { postApi } from '../../service'
import { dataInterface, historyInterface } from './interface'

interface ManageInterface {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  betCount: number;
}

function PremiumHistory() {
  const isEsoccer = process.env.REACT_APP_E_SOCCER;
  const isBasketBall = process.env.REACT_APP_BASKET_BALL;
  const [tab, setTab] = useState('cricket')
  const DD = useSelector((e: any) => e.domainDetails);
  const [hoverId, setHoverId] = useState({ isHover: '' })

  const handleMouseEnter = (id: string = '') => {
    if (id) { setHoverId({ isHover: id }) }
  };
  const handleMouseLeave = (id: string = '') => {
    if (id) { setHoverId({ isHover: '' }) }
  };
  const switchTab = (tab: string) => {
    setTab(tab)
    getPageData(tab, '1')
    // "cricket", "soccer", "tennis", "All"
  }

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  useEffect(() => {
    getPageData('cricket', '1')
    return () => {
    }
  }, [])



  const getPageData = async (TYPE: string, PAGE: string, SEARCH: string = '') => {
    let data: dataInterface = {
      api: ADMIN_API.SETTING.PREMIUM_HISTORY.GET_LIST,
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
    <div className="container sportleague settings  main_wrap" >
      <div className='top_header'>
        <div className='top_header_title  mt-3'>
          <h6 className="font-weight-bold">Manage Cricket Premium <strong>History</strong></h6>
        </div>
      </div>
      <div className="tabs">
        <div className='tabs_list'>
          <ul className="btn-group">
            <li className={`${tab === 'cricket' ? "active" : ""} tabs_list_item btn btn-outline-dark `} onClick={() => switchTab('cricket')}><a> Cricket </a></li>
            <li className={`${tab === 'soccer' ? "active" : ""} tabs_list_item btn  btn-outline-dark`} onClick={() => switchTab('soccer')}><a> Soccer </a></li>
            <li className={`${tab === 'tennis' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('tennis')} ><a> Tennis </a></li>
            {isEsoccer === "true" && <li className={`${tab === 'esoccer' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('esoccer')} ><a> E-soccer </a></li>}
            {isBasketBall === "true" && <li className={`${tab === 'basketball' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('basketball')} ><a> Basket Ball </a></li>}
          </ul>
          <SearchInput searchSubmit={handleSearchSubmit} />
        </div>
        <div className='tabs_content mt-10'>
          <table className="table01 margin-table">
            <thead>
              <tr className="light-grey-bg">
                <th>Match Name</th>
                <th>Match Date</th>
                <th>Total Fancy</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="matches-table">
              {pageData && pageData.results?.length > 0 ? pageData.results.map((item: historyInterface) => {
                return (<>
                  <tr key={item._id}>
                    <td> <span className="text-primary">{item.name}</span> </td>
                    <td> {item.openDate} </td>
                    <td> {item.betCount} </td>
                    <td>
                      <a onMouseEnter={() => handleMouseEnter(item.name)}
                        onMouseLeave={() => handleMouseLeave(item.name)}
                        style={styleObjectBlackButton(DD?.colorSchema, hoverId.isHover === item.name)}
                        href={'/cricket/bets/declare/' + item._id + '/rollback'}

                        className="btn btn-outline-secondary btn-sm btn_black rollback-result shadow-none">Manage Premium</a>
                    </td>
                  </tr>
                </>)
              }) : <><h2>No Data Found</h2></>}
            </tbody>
          </table>
          {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}
        </div>
      </div>
    </div>
  )
}

export default PremiumHistory