
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import SearchInput from '../../components/SearchInput'
import { postApi } from '../../service'
import ReactDatePicker from 'react-datepicker'
import NewPagination from '../../components/new-pagination'
import { styleObjectBlackButton } from '../../common/StyleSeter'
import { useSelector } from 'react-redux'

interface betListInterface {
  profit: number,
  betId: number,
  betSide: string,
  betType: string,
  createdAt: string,
  exposer: number
  matchId: string,
  name: string,
  oddsUp: number
  oddsDown: number
  selection: string,
  stake: number
  type: string,
  userId: any,
  tType: string,
  _id: string,
}

interface dataInterface {
  api: string,
  value: {
    type: string,
    page: string,
    limit: string,
    search?: string
    from?: string,
    to?: string,
    filter?: string,
    betType?: string,
    id?: string,
  }
}

function BetList() {

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [tab, setTab] = useState('All')
  const [list, setList] = useState(false)
  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  const [matchData, setMatchData] = useState<any>({})
  const DD = useSelector((e: any) => e.domainDetails);
  const switchTab = (tab: string) => {
    setTab(tab)
    // getPageData(tab, '1')
    getMatchNameData(tab, '1')
  }

  useEffect(() => {
    // getPageData(tab, '1')
    getMatchNameData(tab, '1')
    return () => {
    }
  }, [])



  const getPageData = async (TYPE: string, PAGE: string, ID: string, BETTYPE: string) => {
    let data: dataInterface = {
      api: ADMIN_API.BET_LIST.LIST,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '50',
        id: ID,
        betType: BETTYPE
      },
    }


    await postApi(data).then(function (response) {
      console.log(response);
      setPageData(response.data.data)
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }
  const getMatchNameData = async (TYPE: string, PAGE: string, FILTER: string = '') => {
    let data: dataInterface = {
      api: ADMIN_API.BET_LIST.MATCH_LIST,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '50',
        from: startDate.toString(),
        to: endDate.toString()
      },
    }
    if (FILTER !== '') {
      data.value.filter = FILTER
    }


    await postApi(data).then(function (response) {
      console.log(response);
      setMatchData(response.data.data)
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }
  const handlePageClick = (e: any) => {
    console.log('page clicked', e);
    // getPageData(tab, (e.selected + 1).toString())
  }

  const getBetDetail = (id: string, type: string) =>{
    getPageData(tab, '1', id, type)
  }

  const handleSubmit = () => {
    getMatchNameData(tab, '1', "")
  }

  const handleDateSubmit = (filter: any) => {
    getMatchNameData(tab, '1', filter)
  }

  return (
    <div className="container full-wrap">
      <div className="top_header">
        <div className="top_header_title mt-3">
          <h5>Bet List</h5>
        </div>
      </div>
      <section className='my-account-section'>
        <div className='my-account-section_header' >
          <div className="account_tabs_filter flex-align s_mb-10">
            <label> Sports: </label>
            <div className="input_group">
              <select name="match_type" id="match_type" value={tab} className="form-control" onChange={(e) => { switchTab(e.target.value) }}>
                <option value="All">All</option>
                <option value="cricket">Cricket</option>
                <option value="soccer">Soccer</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>
            <label> Period: </label>
            <div className="">
              <div className="no-wrap flex-align">
                <input id="startDate" className="cal-input" type="date" value={`${moment(startDate).format('YYYY-MM-DD')}`} placeholder="YYYY-MM-DD" onChange={(e:any)=> setStartDate(e?.target?.value)} />
                <input id="startTime" className="time-input ml_5" type="text" placeholder="09:00" maxLength={5} readOnly style={{ width: "50px" }} />
                <label> To: </label>
                <input id="endDate" className="cal-input" type="date" value={`${moment(endDate).format('YYYY-MM-DD')}`} placeholder="YYYY-MM-DD" onChange={(e:any)=> setEndDate(e?.target?.value)}></input>
                <input id="endTime" className="time-input ml_5 " type="text" placeholder="08:59" maxLength={5} readOnly style={{ width: "50px" }} ></input>
                {/* <div className="w_80">
                  <ReactDatePicker
                    selected={startDate}
                    className="form-control hasDatepicker"
                    onChange={(date: Date) => setStartDate(date)}
                  />
                </div> */}
                {/* <input type="date" name="from_date" className="form-control hasDatepicker" placeholder="08-09-2022" value="" /> */}
                {/* <span className="input-group-text p-0 ps-3 pe-3"> 09:00 </span> */}
              </div>
            </div>
            {/* <div className="input_group from-to">
              <div className="no-wrap flex-align">
                <div className="w_80">
                  <ReactDatePicker
                    selected={endDate}
                    className="form-control hasDatepicker"
                    onChange={(date: Date) => setEndDate(date)}
                  />
                </div>
                <span className="input-group-text p-0 ps-3 pe-3"> 09:00 </span>
              </div>
            </div> */}
          </div>
          <div className="account_tabs_filter d_flex">
            <div onClick={()=>handleDateSubmit('today')}>
              <input type="button" style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "100px" }} value="Just For Today" name="today" id="today" className="btn btn-default-customize" />
            </div>
            <div style={{ marginLeft: "10px" }} onClick={()=>handleDateSubmit('yesterday')}>
              <input type="button" style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "110px" }} value="From Yesterday" name="yesterday" id="yesterday" className="btn btn-default-customize" />
            </div>
            <div style={{ marginLeft: "10px" }} onClick={()=> handleSubmit()}>
              <input style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "97px" }} type="button" value="Get Matches" name="getMatches" id="getMatches" className="btn btn-default-customize" />
            </div>
          </div>
          <div className="account_tabs_filter flex-align s_mt-10 s_mx-0 s_mb-10">
            <label> Bet Status: </label>
            <div className="input_group">
              <select name="agent_level" id="agent_level" className="form-control">
                <option value="">Settled</option>
                <option value="soccer">Cancelled</option>
                <option value="tennis">Voided</option>
              </select>
            </div>

            <div style={{ marginLeft: "10px", width: "97px" }}>
              <input style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "97px" }} type="button" value="Filter Bets" name="filterBets" id="filterBets" className="btn btn-default-customize" />
            </div>
          </div>
        </div>
        <p style={{ marginTop: "10px" }}>Bet List enables you to review the bets you have placed.</p>
        <p style={{ margin: "5px 0" }}>Specify the time period during which your bets were placed, the type of markets on which the bets were placed, and the sport.</p>
        <p>Bet List is available online for the past 30 days.</p>
      </section>
      <div className="tabs b-0">
        {/* {list && <div className='tabs_list'>
          <ul className="btn-group">
            <li className={`${tab === 'All' ? "active" : ""} tabs_list_item btn  btn-outline-dark `} onClick={() => switchTab('All')}><a> All </a></li>
            <li className={`${tab === 'cricket' ? "active" : ""} tabs_list_item btn btn-outline-dark `} onClick={() => switchTab('cricket')}><a> Cricket </a></li>
            <li className={`${tab === 'soccer' ? "active" : ""} tabs_list_item btn  btn-outline-dark`} onClick={() => switchTab('soccer')}><a> Soccer </a></li>
            <li className={`${tab === 'tennis' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('tennis')} ><a> Tennis </a></li>
            <li className={`${tab === 'cricket/fancy' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('cricket/fancy')} ><a> Cricket/Fancy </a></li>
            <li className={`${tab === 'casino' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('casino')} ><a> Casino </a></li>
          </ul>
          <SearchInput searchSubmit={handleSubmit} />
        </div>} */}
        {!list && <><div className='tabs_content mt-10'>
          <table className="table01 margin-table" style={{ tableLayout: "fixed" }}>
            <thead>
              {/* PL	Bet ID	Bet taken	Market	Selection	Type	Odds req.	Stake	Profit/Loss */}
              <tr>
                <th>S.no</th>
                <th>Match Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="matches-table">
              {matchData && matchData?.results?.length > 0 ? matchData?.results?.map((item: any, i: any) => {
                return (
                  <>
                    <tr>
                      <td>{i}</td>
                      <td>{item?.name}</td>
                      <td style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        <div className="search-btn">
                          <button style={{ marginBottom: "5px", width: "101px", height: "25px", fontSize: "11px" }} onClick={() => {getBetDetail(item?._id, 'odds'); setList(true)}}>Odds Bets</button>
                        </div>
                        <div className="search-btn">
                          <button style={{ marginBottom: "5px", width: "101px", height: "25px", fontSize: "11px", background: "brown", color: "#FFF" }} onClick={() => {getBetDetail(item?._id, 'bookMark'); setList(true)}}>BookMaker Bets</button>
                        </div>
                        <div className="search-btn">
                          <button style={{ marginBottom: "5px", width: "101px", height: "25px", fontSize: "11px", background: "tomato", color: "#FFF" }} onClick={() => {getBetDetail(item?._id, 'session'); setList(true)}}>Fancy Bets</button>
                        </div>
                        <div className="search-btn">
                          <button style={{ marginBottom: "5px", width: "101px", height: "25px", fontSize: "11px", background: "teal", color: "#FFF" }} onClick={() => {getBetDetail(item?._id, 'session1'); setList(true)}}>Fancy1 Bets</button>
                        </div>
                        <div className="search-btn">
                          <button style={{ marginBottom: "5px", width: "101px", height: "25px", fontSize: "11px", background: "steelblue", color: "#FFF" }} onClick={() => {getBetDetail(item?._id, 'premium'); setList(true)}}>Premium Bets</button>
                        </div>
                        <div className="search-btn">
                          <button style={{ marginBottom: "5px", width: "101px", height: "25px", fontSize: "11px", background: "sienna", color: "#FFF" }} onClick={() => {getBetDetail(item?._id, 'Others'); setList(true)}}>Other Bets</button>
                        </div>
                      </td>
                    </tr>
                  </>
                )
              }) : <><h2>No Record Found</h2></>}

            </tbody>
          </table>
        </div>
        </>}
        {list && <div className='tabs_content mt-10'>
          <div className="search-btn" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <button style={{ marginBottom: "5px", width: "101px", height: "25px", fontSize: "11px" }} onClick={() => setList(false)}>Back</button>
          </div>
          <table className="table01 margin-table ">
            <thead>
              {/* PL	Bet ID	Bet taken	Market	Selection	Type	Odds req.	Stake	Profit/Loss */}
              <tr>
                <th>PL ID</th>
                <th>Bet ID</th>
                <th>Bet placed</th>
                <th>Market</th>
                <th>Selection</th>
                <th>Type</th>
                <th>Odds req.</th>
                <th>Stake</th>
                <th>Profit/Loss</th>
              </tr>
            </thead>
            <tbody id="matches-table">
              {pageData && pageData?.results?.length > 0 ? pageData?.results?.map((item: betListInterface, i: any) => {
                return (
                  <tr>
                    <td>{item.userId?.user_name}</td>
                    <td>{item._id}</td>
                    <td>{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                    <td className='market'>
                      {item.type}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" /></svg>
                      <strong>{item.name}</strong> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
                        <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" /></svg>
                      {item.betType}
                    </td>
                    <td>{item.selection}</td>
                    <td> {item.betSide} </td>
                    <td>{item.oddsUp}({item.oddsDown})</td>
                    <td>{item.stake}</td>
                    <td className={item?.tType === 'lost' ? "text-danger" : "text-green"}>{item.profit}</td>
                  </tr>
                )
              }) : <><h2>You have no bets in this time period.</h2></>}
            </tbody>
          </table>
          {/* {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />} */}
          <NewPagination />

        </div>}
      </div>
    </div>
  )
}

export default BetList