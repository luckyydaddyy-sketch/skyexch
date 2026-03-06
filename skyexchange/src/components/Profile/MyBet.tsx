import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import { styleObjectBlackButton } from '../../common/StyleSeter'
import { postApiAdmin } from '../../service';

interface historyInterface {
    _id: string;
    matchId: string;
    type: string;
    betType: string;
    betSide: string;
    selection: string;
    subSelection: string;
    betId: number;
    stake: number;
    oddsUp: number;
    oddsDown: number;
    createdAt: Date;
    name: string;
    tType: string;
    profit: number
    exposure: number
    isMatched: boolean
}

function MyBet(props: any) {
    const { activeTab, userId } = props
    const userData = useSelector((e: any) => e.userData);
    const [tab, setTab] = useState('All')
    const navigate = useNavigate()
    const [pageData, setPageData] = useState<any>({})
    const DD = useSelector((e: any) => e.domainDetails);
    const [isHover, setIsHover] = useState(false);
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };
    useEffect(() => {
        getPageData()
        return () => {
        }
    }, [])
    useEffect(() => {
        getPageData()
        return () => {
        }
    }, [activeTab])
    const getPageData = async (BET_TYPE: string = currentTab) => {
        let data: any = {
            api: BET_TYPE !== 'casino' ? ADMIN_API.PLAYER_BET_HISTORY : ADMIN_API.PLAYER_CASINO_BET_HISTORY,
            value: {
                id: userId ? userId : userData._id,
                bet: activeTab === 'bethistory' ? 'history' : 'active',
                betStatus: 'all',
                betType: BET_TYPE ? BET_TYPE : currentTab,
                filter: activeTab === 'bethistory' ? 'all' : 'all'
            },
        }


        await postApiAdmin(data).then(function (response) {
            console.log(response);
            setPageData(response.data.data)
        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    const handlePageClick = (e: any) => {
        console.log('page clicked', e);
        getPageData()
    }

    const handleSubmit = (search: any) => {
        getPageData()
    }

    const onTabChange = (TAB: string) => {
        setCurrentTab(TAB)
        getPageData(TAB)

    }

    const [currentTab, setCurrentTab] = useState('exchange')

    const getProfit = (item: historyInterface) => {
        const { tType, betSide, profit, stake, exposure } = item
        if (tType === 'win') {
            if (betSide === 'yes' || betSide === 'back') {
                return { type: 'text-green', display: profit }
            }
            else {
                return { type: 'text-green', display: stake }
            }
        } else if (tType === 'lost') {
            if (betSide === 'yes' || betSide === 'back') {
                return { type: 'text-danger', display: exposure }
            }
            else {
                return { type: 'text-danger', display: profit }
            }
        } else {
            if (betSide === 'yes' || betSide === 'back') {
                return { type: 'text-danger', display: exposure }
            }
            else {
                return { type: 'text-green', display: stake }
            }
        }

    }

    const [activeStatus, setActiveStatus] = useState('all')

    const handleStatusChange = (event: any) => {
        setActiveStatus(event.target.value);
    };

    return (
        <>
            <div className='account_tabs_r_bet_content'>
                <ul className="nav nav-tabs" role="tablist">
                    <li className="nav-item">
                        <a className={`${currentTab === 'exchange' ? "active" : ""} nav-link `} onClick={() => onTabChange('exchange')}>Exchange</a>
                    </li>
                    <li className="nav-item">
                        <a className={`${currentTab === 'sportsBook' ? "active" : ""} nav-link `} onClick={() => onTabChange('sportsBook')}>Fancy Bet</a>
                    </li>
                    <li className="nav-item">
                        <a className={`${currentTab === 'bookMark' ? "active" : ""} nav-link `} onClick={() => onTabChange('bookMark')}>BookMaker</a>
                    </li>
                    <li className="nav-item">
                        <a className={`${currentTab === 'binary' ? "active" : ""} nav-link `} onClick={() => onTabChange('binary')}>Premium Bet</a>
                    </li>
                    <li className="nav-item">
                        <a className={`${currentTab === 'casino' ? "active" : ""} nav-link `} onClick={() => onTabChange('casino')}>Casino</a>
                    </li>
                </ul>

                <div className="function-wrap light-grey-bg">
                    <ul className="inputlist">
                        <li><label>Bet Status</label></li>
                        <li>
                            <select value={activeStatus} onChange={handleStatusChange}>
                                <option value="all">All</option>
                                <option value="matched">Matched</option>
                                <option value="unmatched">Unmatched</option>
                            </select>
                        </li>

                        <li><label>Period</label></li>
                        {(activeTab === 'bethistory' || activeTab === 'profitloss') &&
                            <li>
                                <input name="from_date" id="from_date" className="form-control1 hasDatepicker" type="date" />
                                <input id="startTime" className="form-control1 no-calender" type="text" placeholder="09:00" maxLength={5} readOnly />
                                <span> to </span>
                                <input name="to_date" id="to_date" className="form-control1 hasDatepicker" type="date" />
                                <input id="endTime" className="form-control1 no-calender" type="text" placeholder="08:59" maxLength={5} readOnly />
                            </li>
                        }

                    </ul>
                    {(activeTab === 'bethistory' || activeTab === 'profitloss') &&
                        <ul className="inputlist">
                            <li><a id="today" className="text-decoration-none btn btn-default-customize bg-white cursor-pointer">Just For Today</a>
                            </li>
                            <li>
                                <a id="yesterday" className="text-decoration-none btn btn-default-customize bg-white cursor-pointer">From
                                    Yesterday</a></li>
                            <li>
                                <a id="getPL" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, isHover)} className="btn_black p-1 text-decoration-none p-0 d-inline cursor-pointer" >Get
                                    History</a></li>
                        </ul>
                    }
                </div>
                {activeTab === 'mybet' || activeTab === 'bethistory' ?
                    <>
                        {(activeStatus === 'all' || activeStatus === 'matched') &&
                            <div className="table-responsive">
                                {/* create component of table and pass currentTab and Data */}
                                <table id="MatchedTable" className="table01 margin-table margin-table">
                                    <caption>Matched</caption>
                                    <thead>
                                        <>
                                            <tr>
                                                <th>Market</th>
                                                <th id="Matched_selection">Selection</th>
                                                <th id="Matched_type">Type</th>
                                                <th id="Matched_betId">Bet ID</th>
                                                <th id="Matched_betPlaced">Bet placed</th>
                                                <th id="Matched_matched">Stake</th>
                                                <th id="Matched_avgOdds">Odds (Volume)</th>
                                                {activeTab === 'bethistory' && <th>Profit/Loss</th>}
                                            </tr>
                                        </>

                                    </thead>
                                    {pageData && pageData?.length > 0 ? pageData.map((item: historyInterface, i: any) => {
                                        return (
                                            <tbody>
                                                <>
                                                    <tr>
                                                        <td>{item.type} &#9654; {item.name} &#9654; {item.betType}</td>
                                                        <td id="Matched_selection">{item.betType === "premium" ? `${item.selection} / ${item?.subSelection}` : item.selection}</td>
                                                        {/* #72bbef #faa9ba */}
                                                        <td id="Matched_type" style={{ textTransform: 'uppercase' }}> <span style={{ padding: 6, width: "42px", textAlign:"center", display:"inline-block", borderRadius: 3, background: `${item.betSide === 'back' || item.betSide === 'yes' ? '#72bbef' : '#faa9ba'}` }}>{item.betSide}</span></td>
                                                        <td id="Matched_betId">{item.betId}</td>
                                                        <td id="Matched_betPlaced">{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                                                        {/* className={item?.betSide === '' ? "text-danger" : "text-green"} */}
                                                        <td id="Matched_matched">{item.stake}</td>
                                                        <td id="Matched_avgOdds">{item.oddsUp}<small> ({item.oddsDown})</small></td>
                                                        {/* {activeTab === 'bethistory' && <td>Profit/Loss</td>} */}
                                                        {activeTab === 'bethistory' && <td className={getProfit(item)?.type}>{getProfit(item)?.display}</td>}

                                                    </tr>
                                                </>

                                            </tbody>
                                        )
                                    }) :
                                        <tbody id="MatchedContent"><tr>
                                            <td colSpan={activeTab === 'bethistory' ? 8 : 7}>
                                                <p>You have no bets in this time period.</p>
                                            </td>
                                        </tr>
                                        </tbody>}
                                </table>
                            </div>
                        }


                        {(currentTab !== "casino" &&(activeStatus === 'all' || activeStatus === 'unmatched')) && <div className="table-responsive">
                            {/* create component of table and pass currentTab and Data */}
                            <table id="MatchedTable" className="table01 margin-table margin-table">
                                <caption>UnMatched</caption>
                                <thead>
                                    <>
                                        <tr>
                                            <th>Market</th>
                                            <th id="Matched_selection">Selection</th>
                                            <th id="Matched_type">Type</th>
                                            <th id="Matched_betId">Bet ID</th>
                                            <th id="Matched_betPlaced">Bet placed</th>
                                            <th id="Matched_matched">Stake</th>
                                            <th id="Matched_avgOdds">Odds (Volume)</th>
                                            {activeTab === 'bethistory' && <th>Profit/Loss</th>}
                                        </tr>
                                    </>

                                </thead>
                                {pageData && pageData?.length > 0 && pageData.some((value: historyInterface)=> typeof value.isMatched !== "undefined" && !value?.isMatched) ? pageData.map((item: historyInterface, i: any) => {
                                    return (
                                        
                                        <tbody>
                                            <>
                                            {typeof item.isMatched !== "undefined" && !item?.isMatched && 
                                                <tr>
                                                    <td>{item.type} &#9654; {item.name} &#9654; {item.betType}</td>
                                                    <td id="Matched_selection">{item.betType === "premium" ? `${item.selection} / ${item?.subSelection}` : item.selection}</td>
                                                    {/* #72bbef #faa9ba */}
                                                    <td id="Matched_type" style={{ textTransform: 'uppercase' }}> <span style={{ padding: 6,  width: "42px", textAlign:"center", display:"inline-block",  borderRadius: 3, background: `${item.betSide === 'back' || item.betSide === 'yes' ? '#72bbef' : '#faa9ba'}` }}>{item.betSide}</span></td>
                                                    <td id="Matched_betId">{item.betId}</td>
                                                    <td id="Matched_betPlaced">{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                                                    {/* className={item?.betSide === '' ? "text-danger" : "text-green"} */}
                                                    <td id="Matched_matched">{item.stake}</td>
                                                    <td id="Matched_avgOdds">{item.oddsUp}<small> ({item.oddsDown})</small></td>
                                                    {/* {activeTab === 'bethistory' && <td>Profit/Loss</td>} */}
                                                    {activeTab === 'bethistory' && <td className={getProfit(item)?.type}>{getProfit(item)?.display}</td>}

                                                </tr>
                                                }
                                            </>

                                        </tbody>
                                        
                                    )
                                }) :
                                    <tbody id="MatchedContent"><tr>
                                        <td colSpan={activeTab === 'bethistory' ? 8 : 7}>
                                            <p>You have no bets in this time period.</p>
                                        </td>
                                    </tr>
                                    </tbody>}
                            </table>
                        </div>}
                    </>


                    :



                    activeTab === 'profitloss' &&
                    <>
                        {(activeStatus === 'all' || activeStatus === 'matched') &&
                            <div className="table-responsive">
                                {/* create component of table and pass currentTab and Data */}
                                <table id="MatchedTable" className="table01 margin-table margin-table">
                                    <caption>Matched</caption>
                                    <thead>
                                        <>
                                            <tr>
                                                <th>Market</th>
                                                <th id="Matched_selection">Selection</th>
                                                <th id="Matched_type">Type</th>
                                                <th id="Matched_betId">Bet ID</th>
                                                <th id="Matched_betPlaced">Bet placed</th>
                                                <th id="Matched_matched">Stake</th>
                                                <th id="Matched_avgOdds">Odds (Volume)</th>
                                                {activeTab === 'bethistory' && <th>Profit/Loss</th>}
                                            </tr>
                                        </>

                                    </thead>
                                    {pageData && pageData?.length > 0 ? pageData.map((item: historyInterface, i: any) => {
                                        return (
                                            <tbody>
                                                <>
                                                    <tr>
                                                        <td>{item.type} &#9654; {item.name} &#9654; {item.betType}</td>
                                                        <td id="Matched_selection">{item.betType === "premium" ? `${item.selection} / ${item?.subSelection}` : item.selection}</td>
                                                        <td id="Matched_type" style={{ textTransform: 'uppercase' }}> <span style={{ padding: 6, borderRadius: 3, background: `${item.betSide === 'back' || item.betSide === 'yes' ? '#72bbef' : '#faa9ba'}` }}>{item.betSide}</span></td>
                                                        <td id="Matched_betId">{item.betId}</td>
                                                        <td id="Matched_betPlaced">{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                                                        <td id="Matched_matched">{item.stake}</td>
                                                        <td id="Matched_avgOdds">{item.oddsUp}<small> ({item.oddsDown})</small></td>
                                                        {activeTab === 'bethistory' && <td className={getProfit(item)?.type}>{getProfit(item)?.display}</td>}

                                                    </tr>
                                                </>

                                            </tbody>
                                        )
                                    }) :
                                        <tbody id="MatchedContent"><tr>
                                            <td colSpan={activeTab === 'bethistory' ? 8 : 7}>
                                                <p>You have no bets in this time period.</p>
                                            </td>
                                        </tr>
                                        </tbody>}
                                    {/* <tbody id="MatchedContent"><tr>
                                        <td colSpan={activeTab === 'bethistory' ? 8 : 7}>
                                            <p>You have no bets in this time period.</p>
                                        </td>
                                    </tr>
                                    </tbody> */}
                                </table>
                            </div>
                        }


                        {(activeStatus === 'all' || activeStatus === 'unmatched') && <div className="table-responsive">
                            {/* create component of table and pass currentTab and Data */}
                            <table id="MatchedTable" className="table01 margin-table margin-table">
                                <caption>UnMatched</caption>
                                <thead>
                                    <>
                                        <tr>
                                            <th>Market</th>
                                            <th id="Matched_selection">Selection</th>
                                            <th id="Matched_type">Type</th>
                                            <th id="Matched_betId">Bet ID</th>
                                            <th id="Matched_betPlaced">Bet placed</th>
                                            <th id="Matched_matched">Stake</th>
                                            <th id="Matched_avgOdds">Odds (Volume)</th>
                                            {activeTab === 'bethistory' && <th>Profit/Loss</th>}
                                        </tr>
                                    </>

                                </thead>
                                {/* {pageData && pageData?.length > 0 ? pageData.map((item: historyInterface, i: any) => {
                                    return (
                                        <tbody>
                                            <>
                                                <tr>
                                                    <td>{item.type} &#9654; {item.name} &#9654; {item.betType}</td>
                                                    <td id="Matched_selection">{item.selection}</td>
                                                    <td id="Matched_type" style={{ textTransform: 'uppercase' }}> <span style={{ padding: 6, borderRadius: 3, background: `${item.betSide === 'back' ? '#72bbef' : '#faa9ba'}` }}>{item.betSide}</span></td>
                                                    <td id="Matched_betId">{item.betId}</td>
                                                    <td id="Matched_betPlaced">{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                                                    <td id="Matched_matched">{item.stake}</td>
                                                    <td id="Matched_avgOdds">{item.oddsUp}<small> ({item.oddsDown})</small></td>
                                                    {activeTab === 'bethistory' && <td className={getProfit(item)?.type}>{getProfit(item)?.display}</td>}

                                                </tr>
                                            </>

                                        </tbody>
                                    )
                                }) :
                                    <tbody id="MatchedContent"><tr>
                                        <td colSpan={activeTab === 'bethistory' ? 8 : 7}>
                                            <p>You have no bets in this time period.</p>
                                        </td>
                                    </tr>
                                    </tbody>} */}
                                <tbody id="MatchedContent"><tr>
                                    <td colSpan={activeTab === 'bethistory' ? 8 : 7}>
                                        <p>You have no bets in this time period.</p>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>}
                    </>

                }

            </div >
        </>

    )
}

export default MyBet