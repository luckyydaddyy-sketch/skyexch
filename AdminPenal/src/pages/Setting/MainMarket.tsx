
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import SearchInput from '../../components/SearchInput'
import SkyPopup from '../../components/SkyPopup'
import { notifyError, notifyMessage, postApi } from '../../service'
import { Input } from '../Home'

interface ActiveStatus {
  bookmaker: boolean;
  fancy: boolean;
  premium: boolean;
  status: boolean;
}
interface ProfitLimits {
  odds: number;
  bookmaker: number;
  fancy: number;
  premium: number;
}
interface Limit {
  min: number;
  max: number;
}
interface Result {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  activeStatus: ActiveStatus;
  oddsLimit: Limit;
  bet_odds_limit: Limit;
  bet_bookmaker_limit: Limit;
  bet_fancy_limit: Limit;
  bet_premium_limit: Limit;
  winner: string;
  winnerSelection: any
  max_profit_limit: ProfitLimits;
}

interface updateData {
  id: string;
  status: boolean;
  activeStatus: ActiveStatus;
  oddsLimit: Limit;
  bet_odds_limit: Limit;
  bet_bookmaker_limit: Limit;
  bet_fancy_limit: Limit;
  bet_premium_limit: Limit;
}

interface Data {
  results?: Result[];
  page?: string;
  limit?: string;
  totalPages?: number;
  totalResults?: number;
}


const MainMarket = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [IsDate, setIsDateUse] = useState(0);
  const [tab, setTab] = useState('cricket')
  const [OpenModal, setOpenModal] = useState<boolean>(false);
  const [OpenModalProfileLimit, setOpenModalProfileLimit] = useState<boolean>(false);
  const [statusUpdate, setStatusUpdate] = useState<any>({})
  const [selectedWinner, setSelectedWinner] = useState<string>()
  const [profitLimit, setProfitLimit] = useState<any>()

  const switchTab = (tab: string) => {
    setTab(tab)
    getPageData(tab, '1')
    // "cricket", "soccer", "tennis"
  }

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<Data>({})
  useEffect(() => {
    getPageData(tab, '1')
    return () => {
    }
  }, [startDate, IsDate])

  // useEffect(()=>{
  //   // if(IsDate){
  //     getPageData(tab, '1')
  //   // }
  // },[startDate, IsDate])


  const getPageData = async (TYPE: string, PAGE: string, SEARCH: string = '') => {
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.GET_LIST,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '50',
      },
    }
    if(IsDate){
      data.value.date = startDate
    }
    if (SEARCH !== '') {
      data.value.search = SEARCH
    }

    await postApi(data).then(function (response) {
      console.log(response, "response");
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

  const updateTableData = async (ITEM: Result) => {
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.UPDATE,
      value: {
        id: ITEM._id,
        status: false,
        activeStatus: ITEM.activeStatus,
        oddsLimit: ITEM.oddsLimit,
        bet_odds_limit: ITEM.bet_odds_limit,
        bet_bookmaker_limit: ITEM.bet_bookmaker_limit,
        bet_fancy_limit: ITEM.bet_fancy_limit,
        bet_premium_limit: ITEM.bet_premium_limit
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);
      // setPageData(response.data.data)

    }).catch(err => {

      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }

  const handleDataChange = (e: any, item: Result, key: string = '') => {
    const { name, value, checked, type } = e.target
    let copyPageData = JSON.parse(JSON.stringify(pageData))
    copyPageData.results!.forEach((element: any) => {
      if (element._id === item._id) {
        if (type === 'checkbox') {
          element.activeStatus = {
            ...element.activeStatus,
            [name]: checked
          }
        } else {
          element[key] = {
            ...element[key],
            [name]: value
          }
        }
        updateTableData(element)
      }
    });
    setPageData(copyPageData)
  }

  const submitStatusPopup = async (e: any) => {
    e.preventDefault()
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.DECLARE_WINNER,
      value: {
        id: statusUpdate.id,
        winner: selectedWinner
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);

      notifyMessage(response.data.message)
      setOpenModal(false)
      getPageData(tab, '1');
    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }
  const OpenWinnerModal = (item: Result) => {
    let options = item?.winnerSelection.length > 0 ? item?.winnerSelection : item.name.split(' v ')
    let Data = {
      id: item._id,
      options: options,
      item: item
    }
    setStatusUpdate(Data)
    setOpenModal(true)
  }

  const submitProfitPopup = async (e: any) => {
    e.preventDefault()
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.UPDATE_PROFIT_LIMIT,
      value: {
        id: statusUpdate.id,
        max_profit_limit: profitLimit
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);

      notifyMessage(response.data.message)
      setOpenModalProfileLimit(false)
      getPageData(tab, '1');
    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }
  const OpenProfitLimitModal = (item: Result) => {
    let options = item?.winnerSelection.length > 0 ? item?.winnerSelection : item.name.split(' v ')
    let Data = {
      id: item._id,
      options: options,
      item: item
    }
    setProfitLimit(item?.max_profit_limit ? item?.max_profit_limit : {
      odds:0,
      bookmaker:0,
      fancy:0,
      premium:0
    } )
    setStatusUpdate(Data)
    setOpenModalProfileLimit(true)
  }

  const onStatusChange = (e: any, winner: string) => {
    setSelectedWinner(winner)
  }

  return (
    <>
      <div className="container sportleague settings full-wrap" >
        <div className='top_header'>
          <div className='top_header_title mt-3'>
            <h6 className="font-weight-bold">Manage Cricket Sport Main Market</h6>
          </div>
        </div>
        <div className="tabs">
          <div className='tabs_list'>
            <ul className="btn-group">
              <li className={`${tab === 'cricket' ? "active" : ""} tabs_list_item btn btn-outline-dark `} onClick={() => switchTab('cricket')}><a> Cricket </a></li>
              <li className={`${tab === 'soccer' ? "active" : ""} tabs_list_item btn  btn-outline-dark`} onClick={() => switchTab('soccer')}><a> Soccer </a></li>
              <li className={`${tab === 'tennis' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('tennis')} ><a> Tennis </a></li>
              <li>
              <input style={{ margin: "0px 5px 5px 0px" }} id="startDate" className="cal-input" type="date" value={`${moment(startDate).format('YYYY-MM-DD')}`}  placeholder="YYYY-MM-DD" onChange={(e:any)=> setStartDate(e?.target?.value)} />
              </li>
              <li>
              <input type="checkbox" name="cricket" value={IsDate}
                onChange={(e) => setIsDateUse(1)} />
              <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
              >
                is Date On
              </label>
              </li>
            </ul>
            <div>
              <SearchInput searchSubmit={handleSearchSubmit} placeholder="Find Match..." />
            </div>
          </div>
          <div className='tabs_content mt-10'>
            <table className="table01 margin-table">
              <thead>
                <tr className="light-grey-bg">
                  <th>Match Name</th>
                  { ((tab === 'cricket' && process.env.REACT_APP_B2C === 'true') || process.env.REACT_APP_B2C === 'false') &&
                  <th>Bookmaker</th>
                  }
                  <th>Fancy</th>
                  <th>Premium</th>
                  <th>Status</th>
                  <th style={{ width: "12%" }}>Odds Limit</th>
                  <th style={{ width: "12%" }}>Bet Odds Limit</th>
                  <th style={{ width: "12%" }}>Bet Bookmaker Limit</th>
                  <th style={{ width: "12%" }}>Bet Fancy Limit</th>
                  <th style={{ width: "12%" }}>Premium Limit</th>
                  <th>Max Profit</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody id="matches-table">
                {
                  pageData.results && pageData.results?.length > 0 ? pageData.results.map((item: Result, i: any) => {

                    return (

                      <tr>
                        <td>
                          <span className="text-primary">{item.name}</span><br />
                          <small>{item.openDate}</small>
                        </td>
                        { ((tab === 'cricket' && process.env.REACT_APP_B2C === 'true') || process.env.REACT_APP_B2C === 'false') && 
                        
                        <td>
                          <div className="form-check form-switch large-switch status-update">
                            <input className="form-check-input" type="checkbox" id="0" onChange={(e) => handleDataChange(e, item)} checked={item.activeStatus.bookmaker} name="bookmaker" />
                            <label className="form-check-label" htmlFor="0"></label>
                          </div>
                        </td>
                        }
                        <td>
                          <div className="form-check form-switch large-switch status-update">
                            <input className="form-check-input" type="checkbox" id="1" onChange={(e) => handleDataChange(e, item)} checked={item.activeStatus.fancy} name="fancy" />
                            <label className="form-check-label" htmlFor="1"></label>
                          </div>
                        </td>
                        <td>
                          <div className="form-check form-switch large-switch status-update">
                            <input className="form-check-input" type="checkbox" id="2" onChange={(e) => handleDataChange(e, item)} checked={item.activeStatus.premium} name="premium" />
                            <label className="form-check-label" htmlFor="2"></label>
                          </div>
                        </td>
                        <td>
                          <div className="form-check form-switch large-switch status-update">
                            <input className="form-check-input" type="checkbox" id="3" onChange={(e) => handleDataChange(e, item)} checked={item.activeStatus.status} name="status" />
                            <label className="form-check-label" htmlFor="3"></label>
                          </div>
                        </td>
                        <td>
                          <div className="row d_flex">
                            <div>
                              <span className="input-group-text0" id="basic-addon1">Min</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'oddsLimit')} value={item.oddsLimit.min} name='min' data-field="min_odds_limit" />
                            </div>
                            <div>
                              <span className="input-group-text0" id="basic-addon1">Max</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'oddsLimit')} value={item.oddsLimit.max} name='max' data-field="odds_limit" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="row d_flex">
                            <div>
                              <span className="input-group-text0" id="basic-addon1">Min</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_odds_limit')} value={item.bet_odds_limit.min} name='min' data-field="min_bet_odds_limit" />
                            </div>
                            <div>
                              <span className="input-group-text0" id="basic-addon1">Max</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_odds_limit')} value={item.bet_odds_limit.max} name='max' data-field="max_bet_odds_limit" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="row d_flex">
                            <div>
                              <span className="input-group-text0" id="basic-addon1">Min</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_bookmaker_limit')} value={item.bet_bookmaker_limit.min} name='min' data-field="min_bet_bookmaker_limit" />
                            </div>
                            <div className="col-sm-6 ps-0">
                              <span className="input-group-text0" id="basic-addon1">Max</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_bookmaker_limit')} value={item.bet_bookmaker_limit.max} name='max' data-field="max_bet_bookmaker_limit" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="row d_flex">
                            <div>
                              <span className="input-group-text0" id="basic-addon1">Min</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_fancy_limit')} value={item?.bet_fancy_limit?.min || ""} name='min' data-field="min_bet_fancy_limit" />
                            </div>
                            <div className="col-sm-6 ps-0">
                              <span className="input-group-text0" id="basic-addon1">Max</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_fancy_limit')} value={item.bet_fancy_limit?.max || ""} name='max' data-field="max_bet_fancy_limit" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="row d_flex">
                            <div>
                              <span className="input-group-text0" id="basic-addon1">Min</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_premium_limit')} value={item.bet_premium_limit.min} name='min' data-field="min_bet_premium_limit" />
                            </div>
                            <div className="col-sm-6 p-0">
                              <span className="input-group-text0" id="basic-addon1">Max</span>
                              <input type="number" className="form-control input-change" step="0.1" onChange={(e) => handleDataChange(e, item, 'bet_premium_limit')} value={item.bet_premium_limit.max} name='max' data-field="max_bet_premium_limit" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <button type="button" className="btn btn-secondary btn-sm match_view shadow-none" onClick={(e) => OpenProfitLimitModal(item)}>View</button>
                        </td>
                        <td>
                          <button type="button" className="btn btn-secondary btn-sm match_view shadow-none" onClick={(e) => OpenWinnerModal(item)}>View</button>
                        </td>
                      </tr>
                    )
                  }) : <><h2>No data</h2></>
                }

              </tbody>
            </table>
            {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}
          </div>
        </div>
      </div>


      <UpdateModal
        title={statusUpdate?.item?.name}
        OpenModal={OpenModal}
        closeModel={() => setOpenModal(false)}
        type='status'
        submitForm={submitStatusPopup}
        onStatusChange={onStatusChange}
        selectedWinner={selectedWinner}
        // onPasswordChange={onPasswordChang}
        addDataFrom={statusUpdate}
      // Validator={Validator}
      />
      <UpdateModalForProfitLimit
        title={'update Profit Limit'}
        OpenModal={OpenModalProfileLimit}
        closeModel={() => setOpenModalProfileLimit(false)}
        type='status'
        submitForm={submitProfitPopup}
        onProfitLimitChange={setProfitLimit}
        selectedProfitLimit={profitLimit}
        // onPasswordChange={onPasswordChang}
        addDataFrom={statusUpdate}
      // Validator={Validator}
      />
    </>


  )
}

export default MainMarket


export const UpdateModal = (props: any) => {
  const { title, OpenModal, closeModel, submitForm, type, onStatusChange, selectedWinner, addDataFrom, Validator } = props

  return (
    <>
      <SkyPopup
        title={title}
        OpenModal={OpenModal}
        closeModel={closeModel}
        closebtn={true}
        submit={submitForm} >
        <div className='view_winner'>
          <div className="modal-body pl_15 pr_15 pb_0 pt_0">
            {addDataFrom?.options?.map((item: string, i: any) => (
              <div className="form-check d_flex d_flex_align_center mb_10" >
                <input className="form-check-input mr_10" type="radio" id={'id' + i} onChange={(e) => onStatusChange(e, item)} name="team_winner" checked={selectedWinner === item} />
                <label htmlFor={'id' + i} className="form-check-label">{item}</label>
              </div>
            ))}

            <div className="form-check d_flex d_flex_align_center " >
              <input className="form-check-input mr_10" type="radio" id="cancel" name="team_winner" onChange={(e) => onStatusChange(e, 'cancel')} checked={selectedWinner === 'cancel'} />
              <label htmlFor="cancel" className="form-check-label">Cancel</label>
            </div>

          </div>
        </div>
      </SkyPopup>
    </>
  )
}

export const UpdateModalForProfitLimit = (props: any) => {
  const { title, OpenModal, closeModel, submitForm, type, onProfitLimitChange, selectedProfitLimit, addDataFrom, Validator } = props
  console.log("addDataFrom:: ", addDataFrom);
  return (
    <>
      <SkyPopup
        title={title}
        OpenModal={OpenModal}
        closeModel={closeModel}
        closebtn={true}
        submit={submitForm} >
        <div className='view_winner'>
          <div className="modal-body pl_15 pr_15 pb_0 pt_0">
            <div className="row d_flex">
              <div style={{paddingRight:"10px"}}>
                <span className="input-group-text0" id="basic-addon1">Odds</span>
                <input type="number" className="form-control input-change" step="0.1" onChange={(e) => onProfitLimitChange({ odds:e.target.value, bookmaker:selectedProfitLimit?.bookmaker || 0, fancy:selectedProfitLimit?.fancy || 0, premium:selectedProfitLimit?.premium || 0 })} value={selectedProfitLimit?.odds || 0}  name='min' data-field="min_odds_limit" />
              </div>
              <div>
                <span className="input-group-text0" id="basic-addon1">Bookmaker</span>
                <input type="number" className="form-control input-change" step="0.1" onChange={(e) => onProfitLimitChange({ odds:selectedProfitLimit?.odds || 0, bookmaker:e.target.value, fancy:selectedProfitLimit?.fancy || 0, premium:selectedProfitLimit?.premium || 0 })} value={selectedProfitLimit?.bookmaker || 0} name='max' data-field="odds_limit" />
              </div>
              <div style={{paddingRight:"10px"}}>
                <span className="input-group-text0" id="basic-addon1">fancy</span>
                <input type="number" className="form-control input-change" step="0.1" onChange={(e) => onProfitLimitChange({ odds:selectedProfitLimit?.odds || 0, bookmaker:selectedProfitLimit?.bookmaker || 0, fancy:e.target.value, premium:selectedProfitLimit?.premium || 0 })} value={selectedProfitLimit?.fancy || 0}  name='max' data-field="odds_limit" />
              </div>
              <div>
                <span className="input-group-text0" id="basic-addon1">premium</span>
                <input type="number" className="form-control input-change" step="0.1" onChange={(e) => onProfitLimitChange({ odds:selectedProfitLimit?.odds || 0, bookmaker:selectedProfitLimit?.bookmaker || 0, fancy:selectedProfitLimit?.fancy || 0, premium:e.target.value })} value={selectedProfitLimit?.premium || 0} name='max' data-field="odds_limit" />
              </div>
            </div>

            {/* <div className="form-check d_flex d_flex_align_center " >
              <input className="form-check-input mr_10" type="radio" id="cancel" name="team_winner" onChange={(e) => onStatusChange(e, 'cancel')} checked={selectedWinner === 'cancel'} />
              <label htmlFor="cancel" className="form-check-label">Cancel</label>
            </div> */}

          </div>
        </div>
      </SkyPopup>
    </>
  )
}