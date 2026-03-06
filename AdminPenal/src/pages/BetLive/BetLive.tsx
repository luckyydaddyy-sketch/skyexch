
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import { postApi } from '../../service'
import { styleObjectBlackButton } from '../../common/StyleSeter'
import { useSelector } from 'react-redux'

interface betListInterface {
  betId: number
  betSide: string,
  betType: string,
  createdAt: string,
  exposure: number
  matchId: string,
  name: string,
  oddsUp: number
  oddsDown: number
  selection: string,
  stake: number
  type: string,
  userId: any,
  _id: string,
}


function BetLive() {

  // const [tab, setTab] = useState('All')
  const [tab, setTab] = useState('cricket')
  const DD = useSelector((e: any) => e.domainDetails);
  const switchTab = (tab: string) => {
    setTab(tab)
    getPageData(tab, '1')
    // "cricket", "soccer", "tennis", "All"
  }

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  useEffect(() => {
    getPageData(tab, '1')
    return () => {
    }
  }, [])



  const getPageData = async (TYPE: string, PAGE: string) => {
    let data = {
      api: ADMIN_API.BET_LIST.LIST_LIVE,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '50'
      },
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

  return (
    <div className="container full-wrap">
      <div className="top_header">
        <div className="top_header_title  mt-3">
          <h5>Best List Live</h5>
        </div>
      </div>

      <div className="tabs">
        <section className='my-account-section'>
          <div className='my-account-section_header'>
            <div className="account_tabs_filter">
              {false && <div className='tabs_list' style={{ marginBottom: "20px" }}>
                <ul className="btn-group">
                  <li className={`${tab === 'All' ? "active" : ""} tabs_list_item btn  btn-outline-dark `} onClick={() => switchTab('All')}><a> All </a></li>
                  <li className={`${tab === 'cricket' ? "active" : ""} tabs_list_item btn btn-outline-dark `} onClick={() => switchTab('cricket')}><a> Cricket </a></li>
                  <li className={`${tab === 'soccer' ? "active" : ""} tabs_list_item btn  btn-outline-dark`} onClick={() => switchTab('soccer')}><a> Soccer </a></li>
                  <li className={`${tab === 'tennis' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('tennis')} ><a> Tennis </a></li>
                  <li className={`${tab === 'cricket/fancy' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('cricket/fancy')} ><a> Cricket/Fancy </a></li>
                  <li className={`${tab === 'casino' ? "active" : ""} tabs_list_item  btn btn-outline-dark`} onClick={() => switchTab('casino')} ><a> cricket/fancy </a></li>
                </ul>
              </div>}
              <div className="flex-align s_mb-10">
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="soccer1" name="soccer1" value="soccer" onClick={() => switchTab('soccer')} checked={tab === "soccer"} />
                <label> Soccer</label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="tennis1" name="tennis1" value="tennis" onClick={() => switchTab('tennis')} checked={tab === "tennis"} />
                <label> Tennis </label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="cricket1" name="cricket1" value="cricket" onClick={() => switchTab('cricket')} checked={tab === "cricket"} />
                <label> Cricket </label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="fancy1" name="fancy1" value="cricket/fancy" onClick={() => switchTab('cricket/fancy')} checked={tab === "cricket/fancy"} />
                <label> Cricket/Fancy Bet </label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> Cricket/Fancy1 Bet</label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> BOOK Cricket</label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> Toss </label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> Int. Casino</label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="casino1" name="casino1" value="casino" onClick={() => switchTab('casino')} checked={tab === "casino"} />
                <label> AWC Casino</label>
                <input style={{ margin: "0 5px", boxShadow: "unset" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> Virtual Sports</label>
                {/* <input style={{ margin: "0 5px" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> Premium Fancy</label> */}
                {/* <input style={{ margin: "0 5px" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> Other Cricket</label> */}
                {/* <input style={{ margin: "0 5px" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> Other Soccer</label> */}
                {/* <input style={{ margin: "0 5px" }} type="radio" id="vehicle1" name="vehicle1" value="Bike" />
                <label> SABA SPORTS</label> */}
              </div>
              <div className="ml_5 account_tabs_filter flex-align s_mb-10">
                <label> Order of display: </label>
                <div className="input_group">
                  <select name="match_type" id="match_type" value={tab} className="form-control" onChange={(e) => { setTab(e.target.value) }}>
                    <option value="volvo">Stake</option>
                    <option value="saab">Player ID</option>
                    <option value="mercedes">Time</option>
                  </select>
                </div>
                <label> Of </label>
                <div className="input_group">
                  <select name="match_type" id="match_type" value={tab} className="form-control" onChange={(e) => { setTab(e.target.value) }}>
                    <option value="volvo">Ascending</option>
                    <option value="saab">Descending</option>
                  </select>
                </div>
                <label> Last </label>
                <div className="input_group">
                  <select name="match_type" id="match_type" value={tab} className="form-control" onChange={(e) => { setTab(e.target.value) }}>
                    <option value="volvo">25 Txn</option>
                    <option value="saab">50 Txn</option>
                    <option value="mercedes">100 Txn</option>
                  </select>
                </div>
                <label> Auto Refresh (Seconds) </label>
                <div className="input_group">
                  <select name="match_type" id="match_type" value={tab} className="form-control" onChange={(e) => { setTab(e.target.value) }}>
                    <option value="volvo">Stop</option>
                    <option value="saab">60</option>
                    <option value="mercedes">30</option>
                    <option value="audi">15</option>
                    <option value="audi">5</option>
                    <option value="audi">2</option>
                  </select>
                </div>
                <label> Bet Status: </label>
                <div className="input_group">
                  <select name="match_type" id="match_type" value={tab} className="form-control" onChange={(e) => { setTab(e.target.value) }}>
                    <option value="volvo">All</option>
                  </select>
                </div>
                <div className="account_tabs_filter d_flex s_mx-10">
                  <input style={styleObjectBlackButton(DD?.colorSchema, true)} type="button" value="Refresh" name="today" id="today" className="btn btn-default-customize" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className='tabs_content'>
          <table className="table01 margin-table mb_5">
            <thead>
              <tr><th style={{ background: "#3b5160", color: "white", padding: "5px 10px" }} colSpan={15}>UnMatched</th></tr>
            </thead>
            <tbody id="matches-table">
              <><p style={{ padding: "4px" }}>You have no bets in this time period.</p></>
            </tbody>
          </table>
        </div>

        <div className='tabs_content'>
          <table className="table01 margin-table">
            <thead>
              <tr><th style={{ background: "#3b5160", color: "white", padding: "5px 10px" }} colSpan={15}>Matched</th></tr>
              <tr>
                {/* <th>COM</th>
                <th>AD</th>
                <th>SP</th>
                <th>SMDL</th>
                <th>MDL</th>
                <th>DL</th> */}
                <th>PL ID</th>
                <th>Bet ID</th>
                <th>Bet placed</th>
                <th>Market</th>
                <th>Selection</th>
                <th>Type</th>
                <th>Odds req.</th>
                <th>Stake</th>
                <th>Liability</th>
              </tr>
            </thead>
            <tbody id="matches-table">

              {pageData && pageData?.results?.length > 0 ? pageData?.results?.map((item: betListInterface, i: any) => {
                return (
                  <tr>
                    {/* <td>{item.userId?.whoAdd?.find((_: any) => _.agent_level === "COM")?.user_name || '--'}</td>
                    <td>{item.userId?.whoAdd?.find((_: any) => _.agent_level === "AD")?.user_name || '--'}</td>
                    <td>{item.userId?.whoAdd?.find((_: any) => _.agent_level === "SP")?.user_name || '--'}</td>
                    <td>{item.userId?.whoAdd?.find((_: any) => _.agent_level === "SMDL")?.user_name || '--'}</td>
                    <td>{item.userId?.whoAdd?.find((_: any) => _.agent_level === "MDL")?.user_name || '--'}</td>
                    <td>{item.userId?.whoAdd?.find((_: any) => _.agent_level === "DL")?.user_name || '--'}</td> */}
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
                    <td className={item.betSide === 'back' ? "text-green" : "text-danger"}>{item.exposure}</td>
                  </tr>
                )
              }) : <><h2>No Record Found</h2></>}
            </tbody>
          </table>
          {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}
        </div>
      </div>
    </div>
  )
}

export default BetLive