import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { useEffect, useState } from "react";
import { notifyError, notifyMessage, postApi } from "../../service";
import { Logout } from "../../common/Funcation";


interface ActiveStatus {
    bookmaker: boolean;
    fancy: boolean;
    premium: boolean;
    status: boolean;
  }
  interface Limit {
    min: number;
    max: number;
  }
  interface Result {
    _id: string;
    name: string;
    openDate: string;
    gameId: number;
    marketId: string;
    type: string;
    startDate: Date;
    activeStatus: ActiveStatus;
    oddsLimit: Limit;
    bet_odds_limit: Limit;
    bet_bookmaker_limit: Limit;
    bet_fancy_limit: Limit;
    bet_premium_limit: Limit;
    winner: string;
    winnerSelection: Array<string>;
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

function Prematchpl() {
  const isEsoccer = process.env.REACT_APP_E_SOCCER;
  const isBasketBall = process.env.REACT_APP_BASKET_BALL;
    const nevigate = useNavigate()
    const DD = useSelector((e: any) => e.domainDetails);

    const [tab, setTab] = useState('cricket')
  const [OpenModal, setOpenModal] = useState<boolean>(false);
  const [statusUpdate, setStatusUpdate] = useState<any>({})
  const [selectedWinner, setSelectedWinner] = useState<string>()


  const switchTab = (tab: string) => {
    console.log("click button",tab);
    
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
  }, [])



  const getPageData = async (TYPE: string, PAGE: string, SEARCH: string = '') => {
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.GET_LIST,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '100'
      },
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

  const submitStatusPopup = async (e: any, id:string) => {
    const { value } = e.target
    e.preventDefault()
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.DECLARE_WINNER,
      value: {
        id: id,
        winner: selectedWinner
      },
    }


    await postApi(data).then(function (response) {
      console.log(response);

      notifyMessage(response.data.message)
      setOpenModal(false)
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
  const onStatusChange = (e: any, winner: string) => {
    const { value } = e.target

    console.log("winner :: ", value, winner);
    
    // setSelectedWinner(winner)
  }

    return (
        <>
            <div className='container '>
                <div className="top_header">
                    <div className="top_header_title mt-3">
                        <h5>Prematch P/L</h5>
                    </div>
                    <div className="flex-align">
                        <div className="search-btn">
                            <button style={{...styleObjectBlackButton(DD?.colorSchema, true), marginLeft: 0}} onClick={() => switchTab('cricket')}>Cricket</button>
                        </div>
                        <div className="search-btn">
                            <button style={{...styleObjectBlackButton(DD?.colorSchema, true)}} onClick={() => switchTab('soccer')} >Soccer</button>
                        </div>
                        <div className="search-btn">
                            <button style={{...styleObjectBlackButton(DD?.colorSchema, true)}} onClick={() => switchTab('tennis')} >Tennis</button>
                        </div>
                        {isEsoccer === "true" && <div className="search-btn">
                            <button style={{...styleObjectBlackButton(DD?.colorSchema, true), width:"80px"}} onClick={() => switchTab('esoccer')} >E-soccer</button>
                        </div> }
                        {isBasketBall === "true" && <div className="search-btn">
                            <button style={{...styleObjectBlackButton(DD?.colorSchema, true), width:"80px"}} onClick={() => switchTab('basketball')} >Basket Ball</button>
                        </div> }
                    </div>
                </div>
                <div className='my-account-section-content'>
                    <div className='my-account-section-content-table'>
                        <table id="resultTable" className="table01 margin-table">
                            <thead>
                                <tr>
                                    <th>Sport</th>
                                    <th>Event Id</th>
                                    <th>Market Id	</th>
                                    <th>Match</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>

                            {
                pageData.results && pageData.results.length > 0 && pageData.results.map((item: Result, i: any) => {
                  return (
                    <tr>
                    <td>{item?.type}</td>
                    <td>{item?.gameId}</td>
                    <td>{item?.marketId}</td>
                    <td>{item?.name} </td>
                    <td>{item?.openDate} </td>
                    <td>{item?.activeStatus?.status} </td>
                    
                    <td style={{ width: "90%", display: "flex", alignItems: "center" }}>
                        <select name="report_type" id="report_type" className="form-control" onChange={(e)=> submitStatusPopup(e, item?._id)}>
                            <option value=""> Select Team</option>
                            {
                                item?.winnerSelection.length > 0 ? item?.winnerSelection.map((value:string)=>{
                                    return(
                                        <option value={value}>{value}</option>
                                    )
                                })
                                 : item.name.split(' v ').map((value:string)=>{
                                    return(
                                        <option value={value}>{value}</option>
                                    )
                                })
                            }
                            {/* <option value="deposit"> New Zealand</option>
                            <option value="game"> South Africa</option> */}
                        </select>
                        <div className="search-btn">
                            <button onClick={() => nevigate(`/Prematchuserbet/${item?._id}`)} style={{...styleObjectBlackButton(DD?.colorSchema, true), width: "125px"}}>View P/L</button>
                        </div>
                        <div className="search-btn">
                            <button onClick={() => nevigate("/AMasterCheat")} style={{...styleObjectBlackButton(DD?.colorSchema, true), width: "125px"}}>Master</button>
                        </div>
                        <div className="search-btn">
                            <button onClick={() => nevigate("/ACheatIps")} style={{...styleObjectBlackButton(DD?.colorSchema, true), width: "125px"}}>Cheat Ips</button>
                        </div>
                        <div className="search-btn">
                            <button onClick={() => nevigate("/")} style={{...styleObjectBlackButton(DD?.colorSchema, true), width: "125px"}}>Anti Cheat</button>
                        </div>
                    </td>
                </tr>
                    
                  )
                })
              }
                               

                            </tbody>
                        </table>

                    </div>
                </div>
            </div >
        </>
    )
}

export default Prematchpl