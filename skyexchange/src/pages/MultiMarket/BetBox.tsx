import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ADMIN_API, USER_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import { getApi, notifyError, notifyMessage, postApi } from '../../service'
import { betHistoryInterface } from './interface'
import Cookies from 'universal-cookie';
import { styleObjectGetBGasColor } from '../../common/StyleSeter'
const cookies = new Cookies()
const BetBox = (props: any) => {
    const DD = useSelector((e: any) => e.domainDetails);

    const { clickedBet, clickedTableData, resetClicked, placeBetClicked, clickedTable, isMobile, betHistoryShow, setPlaceBetLoader, setShowBetBox } = props
    console.log("clickedBet || clickedTableData :: ", { clickedBet, clickedTableData, clickedTable, resetClicked, placeBetClicked, betHistoryShow, setPlaceBetLoader, setShowBetBox });

    const BET_HISTORY = useSelector((e: any) => e.betHistory);
    const HeaderData = useSelector((e: any) => e.Header);
    const balanceData = useSelector((e: any) => e.balance);
    const [betTable, setBetTable] = useState<boolean>(true)
    const [OpenModal, setOpenModal] = useState<boolean>(false)
    const [betHistoryTable, setBetHistoryTable] = useState<boolean>(true)
    const [selecetdAmount, setSelecetdAmount] = useState<number>(0)
    const [selecetdOddsValue, setSelecetdOddsValue] = useState<any>(0)
    const [TotalAmount, setTotalAmount] = useState<any>()
    const [pageData, setPageData] = useState<any>(BET_HISTORY)

    const [getButtonStyle, setgetButtonStyle] = useState<any>({})
    // const [getOddsValue, setOddsValue] = useState<any>()
    const [manageStack, setManageStack] = useState<any>()
    const SPORT_DETAILS = useSelector((e: any) => e.sportDetails);
    const [detailSport, setDetailSport] = useState(SPORT_DETAILS)
    useEffect(() => {

        setDetailSport(SPORT_DETAILS)
        return () => {

        }
    }, [SPORT_DETAILS])

    useEffect(() => {
        if (cookies.get('skyTokenFront')) {
            getStack(cookies.get('skyTokenFront'))
        }
        return () => {
        }
    }, [])

    const dispatch = useDispatch()

    const checkFlout = (x: any) => {
        if (typeof x == 'number' && !isNaN(x)) {
            if (Number.isInteger(x)) {
                return false
            }
            else {
                return true
            }

        }
    }

    useEffect(() => {
        if (clickedBet && clickedTableData) {
            if (clickedTable === 't4') {
                setgetButtonStyle({ display: "none" })
                setTotalAmount(parseFloat(`${(clickedBet[clickedTableData] - 1 + (selecetdAmount === 0 ? 1 : 0)) * selecetdAmount}`).toFixed(2))
            } else if (clickedTable === 't2') {
                // betValu * betAmount / 100
                setgetButtonStyle({})
                if (checkFlout(clickedBet[clickedTableData])) {
                    // setTotalAmount(parseFloat(`${(clickedBet[clickedTableData] - 1 + (selecetdAmount === 0 ? 1 : 0)) * selecetdAmount}`).toFixed(2))

                    setTotalAmount(parseFloat(`${clickedBet[clickedTableData] * (selecetdAmount) / 100}`).toFixed(2))

                } else {
                    setTotalAmount(parseFloat(`${clickedBet[clickedTableData] * (selecetdAmount) / 100}`).toFixed(2))
                }
            }
            else if (clickedTable === 't3') {
                setgetButtonStyle({ display: "none" })
                let totalTableData = clickedTableData === 'b1' ? 'bs1' : 'ls1'
                setTotalAmount(
                    // down * betAmount/ 100
                    parseFloat(`${clickedBet[totalTableData] * (selecetdAmount) / 100}`).toFixed(2)
                )
            } else {
                setgetButtonStyle({})
                setTotalAmount(parseFloat(`${(clickedBet[clickedTableData] - 1 + (selecetdAmount === 0 ? 1 : 0)) * selecetdAmount}`).toFixed(2))
            }
        }
        return () => { }
    }, [selecetdAmount, clickedTableData, clickedBet])

    useEffect(() => {
        if (cookies.get('skyTokenFront')) {
            getPageData()
        }
        return () => {

        }
    }, [])
    useEffect(() => {

        setSelecetdAmount(0)

        if (clickedBet && clickedTableData) {
            // setSelecetdOddsValue(clickedBet[clickedTableData])
            if (clickedTable !== "t3") {
                setSelecetdOddsValue(clickedBet[clickedTableData])
            } else {
                if (clickedTableData === "b1") {
                    setSelecetdOddsValue(clickedBet[clickedTableData] + "/" + clickedBet['bs1']);
                } else {
                    setSelecetdOddsValue(clickedBet[clickedTableData] + "/" + clickedBet['ls1']);
                }

            }
        } else {
            setSelecetdOddsValue(0)
        }
        return () => {

        }


    }, [clickedBet])


    useEffect(() => {
        setPageData(BET_HISTORY)
        return () => { }

    }, [BET_HISTORY])



    const getPageData = async () => {
        let data = {
            api: USER_API.BET_LIST,
            value: {
            }
        }

        await postApi(data).then(function (response) {
            setPageData(response.data.data)
            dispatch({ type: 'USER_BET_HISTORY', payload: response.data.data })

        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                // navigate('/login')
            }
        })

    }

    const getTotalAmount = (AMOUNT: number) => {
        if (clickedBet && clickedTableData) {
            if (clickedTable === 't4') {
                return (parseFloat(`${(clickedBet[clickedTableData] - 1 + (AMOUNT === 0 ? 1 : 0)) * AMOUNT}`).toFixed(2))
            } else if (clickedTable === 't2') {
                // betValu * betAmount / 100
                if (checkFlout(clickedBet[clickedTableData])) {
                    // return (parseFloat(`${(clickedBet[clickedTableData] - 1 + (AMOUNT === 0 ? 1 : 0)) * AMOUNT}`).toFixed(2))
                    return (parseFloat(`${clickedBet[clickedTableData] * (AMOUNT) / 100}`).toFixed(2))

                } else {
                    return (parseFloat(`${clickedBet[clickedTableData] * (AMOUNT) / 100}`).toFixed(2))
                }
            } else if (clickedTable === 't3') {
                let totalTableData = clickedTableData === 'b1' ? 'bs1' : 'ls1'
                return (
                    // down * betAmount/ 100
                    parseFloat(`${clickedBet[totalTableData] * (AMOUNT) / 100}`).toFixed(2)
                )
            } else {
                return (parseFloat(`${(Number(selecetdOddsValue) - 1 + (AMOUNT === 0 ? 1 : 0)) * AMOUNT}`).toFixed(2))
            }
        }
    }
    const getTotalAmountWhenOddsChange = (OddsValue: number) => {
        const AMOUNT = Number(selecetdAmount);
        if (clickedBet && clickedTableData) {
            if (clickedTable === 't4') {
                return (parseFloat(`${(clickedBet[clickedTableData] - 1 + (AMOUNT === 0 ? 1 : 0)) * AMOUNT}`).toFixed(2))
            } else if (clickedTable === 't2') {
                // betValu * betAmount / 100
                if (checkFlout(clickedBet[clickedTableData])) {
                    // return (parseFloat(`${(clickedBet[clickedTableData] - 1 + (AMOUNT === 0 ? 1 : 0)) * AMOUNT}`).toFixed(2))
                    return (parseFloat(`${clickedBet[clickedTableData] * (AMOUNT) / 100}`).toFixed(2))

                } else {
                    return (parseFloat(`${clickedBet[clickedTableData] * (AMOUNT) / 100}`).toFixed(2))
                }
            } else if (clickedTable === 't3') {
                let totalTableData = clickedTableData === 'b1' ? 'bs1' : 'ls1'
                return (
                    // down * betAmount/ 100
                    parseFloat(`${clickedBet[totalTableData] * (AMOUNT) / 100}`).toFixed(2)
                )
            } else {
                return (parseFloat(`${(Number(OddsValue) - 1 + (AMOUNT === 0 ? 1 : 0)) * AMOUNT}`).toFixed(2))
            }
        }
    }

    const getBoxClassname = () => {
        let B = ['b1', 'b2', 'b3']
        let L = ['l1', 'l2', 'l3']
        if (clickedTable === 't4') {
            return 'GREEN'
        }
        if (B.includes(clickedTableData)) {
            return 'BACK'
        }
        if (L.includes(clickedTableData)) {
            return 'LAY'
        }
    }

    const calcSelectedAmount = async (AMOUNT: number) => {
        let B = ['b1', 'b2', 'b3']
        let L = ['l1', 'l2', 'l3']
        setSelecetdAmount(AMOUNT)
        console.log('::::::>>>', detailSport);
        let T_A = getTotalAmount(AMOUNT)
        await changeOddsValues();
        let data = await placeBetClicked(clickedBet, T_A, AMOUNT, clickedTable, clickedTableData, true)
        dispatch({ type: 'GET_SPORTS_LIVE_CALC', payload: { calcOntime: true, calcData: data } })
    }

    const onSelectedAmountInputChange = async (e: any) => {
        const { value } = e.target
        if (e.target.validity.valid) {
            setSelecetdAmount(value)
            let T_A = getTotalAmount(value)
            await changeOddsValues()
            let data = await placeBetClicked(clickedBet, T_A, value, clickedTable, clickedTableData, true)
            dispatch({ type: 'GET_SPORTS_LIVE_CALC', payload: { calcOntime: true, calcData: data } })
        }
    }
    const onSelectedOddsValueInputChange = async (e: any) => {
        const { value } = e.target
        if (e.target.validity.valid) {
            setSelecetdOddsValue(value)
            let T_A = getTotalAmount(value)
            await changeOddsValues()
            let data = await placeBetClicked(clickedBet, T_A, value, clickedTable, clickedTableData, true)
            dispatch({ type: 'GET_SPORTS_LIVE_CALC', payload: { calcOntime: true, calcData: data } })
        }
    }

    const callONChangeCalc = async (value: number) => {
        let T_A = getTotalAmount(value);
        await changeOddsValues();
        let data = await placeBetClicked(clickedBet, T_A, value, clickedTable, clickedTableData, true)
        dispatch({ type: 'GET_SPORTS_LIVE_CALC', payload: { calcOntime: true, calcData: data } })
    }

    const callONChangeCalcForOddsChange = async (value: number) => {
        let T_A = getTotalAmountWhenOddsChange(value);
        await changeOddsValues();
        let data = await placeBetClicked(clickedBet, T_A, selecetdAmount, clickedTable, clickedTableData, true)
        dispatch({ type: 'GET_SPORTS_LIVE_CALC', payload: { calcOntime: true, calcData: data } })
    }

    const changeOddsValues = () => {
        if (clickedBet && clickedTableData && clickedTable !== "t3" && clickedTable !== "t4") {
            clickedBet[clickedTableData] = Number(selecetdOddsValue)
        }
        return true;
    }

    const actionClick = (directAction: string = '', ButtonAction: string = '', isBackSpace: boolean = false) => {
        if (directAction && ButtonAction) {
            let SM = Number(selecetdAmount)
            if (ButtonAction === 'PLUS') {
                SM = SM + Number(directAction)
            }
            callONChangeCalc(SM)
            setSelecetdAmount(SM)
            return
        }
        if (directAction) {
            let SM = `${selecetdAmount}`
            SM = SM + `${directAction}`
            callONChangeCalc(Number(SM))

            setSelecetdAmount(Number(SM))
            return
        }
        if (ButtonAction) {
            let SM = Number(selecetdAmount)
            if (ButtonAction === 'PLUS') {
                SM = SM + 1
            } else {
                SM = SM - 1
            }
            callONChangeCalc(SM)
            setSelecetdAmount(SM)
            return
        }
        if (isBackSpace) {
            let SM = `${selecetdAmount}`
            SM = SM.slice(0, -1)
            console.log(SM);
            callONChangeCalc(Number(SM))
            setSelecetdAmount(Number(SM))
            return
        }
    }

    const actionClickForOdds = (directAction: string = '', ButtonAction: string = '', isBackSpace: boolean = false) => {
        if (directAction && ButtonAction) {
            let SM = Number(selecetdOddsValue)
            if (ButtonAction === 'PLUS') {
                SM = SM + Number(directAction)
            }
            callONChangeCalcForOddsChange(Number(SM.toFixed(2)))
            setSelecetdOddsValue(SM.toFixed(2))
            return
        }
        if (directAction) {
            let SM = `${selecetdOddsValue}`
            SM = SM + `${directAction}`
            callONChangeCalcForOddsChange(Number(Number(SM).toFixed(2)))

            setSelecetdOddsValue(Number(Number(SM).toFixed(2)).toFixed(2))
            return
        }
        if (ButtonAction) {
            let SM = Number(selecetdOddsValue)
            if (ButtonAction === 'PLUS') {
                SM = SM + 0.02
            } else {
                SM = SM - 0.02
            }
            callONChangeCalcForOddsChange(Number(SM.toFixed(2)))
            setSelecetdOddsValue(SM.toFixed(2))
            return
        }
        if (isBackSpace) {
            let SM = `${selecetdOddsValue}`
            SM = SM.slice(0, -1)
            console.log(SM);
            callONChangeCalcForOddsChange(Number(Number(SM).toFixed(2)))
            setSelecetdOddsValue(Number(Number(SM)).toFixed(2))
            return
        }
    }

    const placeBetConfirm = (clickedBet: any, TotalAmount: any, selecetdAmount: number, clickedTable: any, clickedTableData: any, type: string) => {

        if (type === 'CONFIRM' || (true && clickedTable !== 't1')) {
            if (HeaderData) {
                let timeout = 0
                switch (clickedTable) {
                    case 't1':
                        timeout = HeaderData.delay.odds
                        break;
                    case 't2':
                        timeout = HeaderData.delay.bookmaker
                        break;
                    case 't3':
                        timeout = HeaderData.delay.fancy
                        break;
                    case 't4':
                        timeout = HeaderData.delay.premium
                        break;
                    default:
                        break;
                }
                setPlaceBetLoader(true)
                setTimeout(() => {
                    changeOddsValues();
                    placeBetClicked(clickedBet, TotalAmount, selecetdAmount, clickedTable, clickedTableData)

                }, timeout * 1000);
                setTimeout(() => {
                    if (timeout !== 0) {
                        // notifyMessage('bet placed with delayed of ' + timeout + 's')
                    }
                    setOpenModal(false)
                }, 700);
                // setOpenModal(false)
            } else {
                changeOddsValues();
                placeBetClicked(clickedBet, TotalAmount, selecetdAmount, clickedTable, clickedTableData)
            }
        } else {
            setOpenModal(true)
        }

    }

    const getStack = async (token: string) => {

        let data = {
            api: USER_API.GET_STACK,
            value: {

            },
            token: token ? token : undefined
        }

        await getApi(data).then(function (response) {
            let resData = response.data?.data?.stackInfo
            if (response.data?.data?.stackInfo?.stack?.length > 0) {

                setManageStack(resData)
            } else {
                resData.stack = [10, 20, 30, 40, 50, 60, 70, 80]
                setManageStack(resData)
            }

            // setOpenSetting(!OpenSetting)
            // setSearchData(response.data.data)

        }).catch(err => {
            debugger
            notifyError(err.response.data.message)
            if (err.response.data.statusCode === 401) {
                Logout()
                // navigate('/login')
            }
        })
    }




    const closePopup = () => {
        setOpenModal(false)
    }
    const [isHover, setIsHover] = useState(false);
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };

    console.log("selecetdOddsValue :: ", selecetdOddsValue);

    return (
        <>
            <div className={`${betHistoryShow ? "show-mobile" : ""} multimarket_right`}>
                <div className='right-side-block-section'>

                    {window.innerWidth < 992 &&
                        <div className="side-head">
                            <h3 className="a-setting"><span />Open Bets </h3>
                            <a className="close ui-link" href="#" onClick={() => setShowBetBox(false)}></a>
                        </div>
                    }

                    {betTable && clickedBet && clickedTable !== '' &&
                        <>
                            <div className='bet_slip'>
                                <div className='bet_slip_head'>
                                    <h4 onClick={() => setBetTable(!betTable)}>Bet Slip</h4>
                                    <ul id="backSlipHeader" className="slip-head" >
                                        <li className="col-bet">Back (Bet For)</li>
                                        <li id="oddsHeader" className="col-odd">Odds</li>
                                        <li id="runsHeader" className="col-odd" style={{ display: "none" }}>Unit:Runs</li>
                                        <li className="col-stake">Stake</li>
                                        <li className="col-profit">Profit</li>
                                    </ul>
                                    <h5 className="inplay_live">{clickedBet.nat}</h5>

                                    <div className={`match_odd ${getBoxClassname()}`}>
                                        <ul className="match_odd_head">
                                            <li className="match_odd_head_first"><p className="m-0">{clickedBet.nat}</p> <span>ODDS</span></li>
                                            <li className="match_odd_head_second"><input step="0.01" type="number" value={clickedBet && clickedTableData && clickedBet[clickedTableData]} className="form-control" /></li>
                                            <li className="match_odd_head_third"><input step="0.01" type="number" value={selecetdAmount} className="form-control" /></li>
                                            <li className="match_odd_head_fourth"><span className="price">{TotalAmount}</span></li></ul> <ul className="match_odd_body">
                                            {/* parseFloat(`${(clickedBet[clickedTableData] - 1 + (selecetdAmount === 1 ? 1 : 0)) * selecetdAmount}`).toFixed(2) */}
                                            {
                                                manageStack?.stack?.map((item: any, i: any) => {
                                                    return (
                                                        <li key={i} onClick={() => calcSelectedAmount(item)}> <a> {item} </a> </li>
                                                    )
                                                })
                                            }
                                            {/* <li onClick={() => calcSelectedAmount(10)}><a>10</a></li>
                                            <li onClick={() => calcSelectedAmount(20)}><a>20</a></li>
                                            <li onClick={() => calcSelectedAmount(30)}><a>30</a></li>
                                            <li onClick={() => calcSelectedAmount(40)}><a>40</a></li>
                                            <li onClick={() => calcSelectedAmount(50)}><a>50</a></li>
                                            <li onClick={() => calcSelectedAmount(60)}><a>60</a></li> */}
                                        </ul>
                                        <div className="min_bet">
                                            <p>Min Bet: 1</p>
                                        </div>
                                    </div>

                                </div>
                                <div className="bet_slip_footer pt-3">
                                    {/* {console.log(balanceData, 'balanceDatabalanceDatabalanceDatabalanceData')} */}
                                    <div className="btn_group">
                                        <a className="cancel" onClick={() => resetClicked()}>Cancel All</a>
                                        <button className="place_bets" disabled={selecetdAmount === 0 || balanceData < 1 ? true : false} style={selecetdAmount === 0 ? { cursor: 'not-allowed' } : {}} onClick={() => placeBetConfirm(clickedBet, TotalAmount, selecetdAmount, clickedTable, clickedTableData, 'OPEN')}> Place Bets </button>
                                    </div>
                                    {balanceData < 1 ? <>  <span style={{ color: 'red' }}>don't have balance to place bet</span> </> : <></>}
                                </div>
                            </div>
                        </>
                    }


                    {cookies.get('skyTokenFront') &&
                        <div className="bet-open mt-2" style={{ marginTop: "8px" }}>
                            {/* <div className="bet_slip_head">
                                <h4 onClick={() => setBetHistoryTable(!betHistoryTable)}>Open Bets</h4>
                            </div> */}
                            {betHistoryTable && <div className="bets-html">
                                <select name="game_id" className="form-control mt-2">
                                    <option value="all">All</option>
                                    <option value="31865161">Windward Islands v Guyana [2022-10-31 18:30:00]</option>
                                </select>
                                <table className="w-100">
                                    <tbody>
                                        <tr>
                                            <th style={{ width: "60%" }}><h4> Back (Bet For) </h4></th>
                                            <th>Odds</th>
                                            <th>Stake</th>
                                            <th>Profit</th>
                                        </tr>
                                        {pageData?.length > 0 && pageData.map((item: betHistoryInterface, i: any) => {
                                            if (item.betSide !== "back" && item.betSide !== 'yes') {
                                                return
                                            }
                                            return (

                                                <tr key={i} className="light-blue-bg-2 border-bottom border-secondary">
                                                    <td>
                                                        <div className="bet-item pt-1 pb-1">
                                                            <div className="row align-items-center justify-content-center d_flex">
                                                                <div className="    bet-side">
                                                                    <span className="btn btn-sm slip_type cyan-bg">{item.betSide}</span>
                                                                </div>
                                                                <div className="bet-selection-type">
                                                                    <span className="bet-selection">{item.betType === "premium" ? `${item.selection} / ${item?.subSelection}` : item.selection}</span>
                                                                    <span className="bet-type">(Match {item.betType})</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{item.oddsUp}</td>
                                                    <td>{item.stake}</td>
                                                    <td>{item.profit}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>

                                <table className="w-100 mt-3">
                                    <tbody>
                                        <tr>
                                            <th style={{ width: "60%" }}>Lay (Bet Against)</th>
                                            <th>Odds</th>
                                            <th>Stake</th>
                                            <th>Liability</th>
                                        </tr>
                                        {pageData?.length > 0 && pageData.map((item: betHistoryInterface, i: any) => {
                                            if (item.betSide !== "no" && item.betSide !== 'lay') {
                                                return
                                            }
                                            return (
                                                <tr className="light-pink-bg-2 border-bottom border-secondary">
                                                    <td>
                                                        <div className="bet-item pt-1 pb-1">
                                                            <div className="row align-items-center justify-content-center d_flex">
                                                                <div className=" bet-side">
                                                                    <span className="btn btn-sm slip_type pink-bg">{item.betSide}</span>
                                                                </div>
                                                                <div className="bet-selection-type">
                                                                    <span className="bet-selection">{item.betType === "premium" ? `${item.selection} / ${item?.subSelection}` : item.selection}</span>
                                                                    <span className="bet-type">(Match {item.betType})</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{item.oddsUp}</td>
                                                    <td>{item.stake}</td>
                                                    <td>{item.exposure}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            }
                        </div>}
                </div>
            </div>

            {(isMobile && (clickedBet || clickedTableData)) &&
                <tr className="mobileView active">
                    <td colSpan={6}>
                        <ul className="btn-list ">
                            <li>
                                <p className="dynamic-min-bet">&nbsp;</p>
                                <div id="inputOdds" className="input-num">
                                    <a id="oddsDown" className="icon-minus" style={getButtonStyle} onClick={() => actionClickForOdds('', 'SUB')}></a>
                                    {/* <a id="oddsDown" className="icon-minus" onClick={() => actionClickForOdds('', 'SUB')}></a> */}
                                    {/* <span id="odds" className={`typed ${clickedTable === "t3" || clickedTable === "t4" ? 'disable' : ''}`}>{clickedBet && clickedTableData && clickedTable !== "t3" ? clickedBet[clickedTableData] : clickedBet && clickedTableData && clickedTableData.split('1') === "b" ? clickedBet[clickedTableData]+ "/" + clickedBet['bs1'] : clickedBet[clickedTableData]+ "/" + clickedBet['ls1'] }</span> */}
                                    {["t3", "t4"].includes(clickedTable) && <span id="odds" className={`typed ${clickedTable === "t3" || clickedTable === "t4" ? 'disable' : ''}`}>{selecetdOddsValue ? selecetdOddsValue : ''}</span>}
                                    {clickedTable !== "t3" && clickedTable !== "t4" && <input type='text' readOnly id="odds" pattern="[0-9]*" autoFocus={true} className={`typed ${clickedTable === "t3" || clickedTable === "t4" ? 'disable' : 'typeing'}`} value={selecetdOddsValue ? selecetdOddsValue : ''} onChange={(e) => onSelectedOddsValueInputChange(e)} />}
                                    {/* <input type='text' readOnly id="odds" pattern="[0-9]*" autoFocus={true} className={`typed ${clickedTable === "t3" || clickedTable === "t4" ? 'typeing' : 'typeing'}`} value={selecetdOddsValue ? selecetdOddsValue : ''} onChange={(e) => onSelectedOddsValueInputChange(e)} /> */}
                                    <a id="oddsUp" className="icon-plus" style={getButtonStyle} onClick={() => actionClickForOdds('', 'PLUS')}></a>
                                    {/* <a id="oddsUp" className="icon-plus"  onClick={() => actionClickForOdds('', 'PLUS')}></a> */}
                                </div>
                            </li>
                            <li>
                                <p className="dynamic-min-bet">Min Bet: <strong id="dynamicMinBet"></strong></p>
                                <div id="inputStake" className="input-num input-stake">
                                    <a id="stakeDown" className="icon-minus" onClick={() => actionClick('', 'SUB')}></a>
                                    <input type='text' readOnly id="stake" pattern="[0-9]*" autoFocus={true} className="typed typeing" value={selecetdAmount ? selecetdAmount : ''} onChange={(e) => onSelectedAmountInputChange(e)} />
                                    <a id="stakeUp" className="icon-plus" onClick={() => actionClick('', 'PLUS')}></a>
                                </div>
                            </li>
                        </ul>
                        <ul id="stakePopupList" className="coin-list">
                            {
                                manageStack?.stack?.map((item: any, i: any) => {
                                    return (
                                        <li key={i} onClick={() => actionClick(`${item}`, 'PLUS')}><a> {item} </a></li>
                                    )
                                })
                            }
                            {/* <li onClick={() => actionClick('5', 'PLUS')} ><a> 5</a></li>
                            <li onClick={() => actionClick('10', 'PLUS')} ><a> 10</a></li>
                            <li onClick={() => actionClick('50', 'PLUS')} ><a> 50</a></li>
                            <li onClick={() => actionClick('100', 'PLUS')} ><a> 100</a></li>
                            <li onClick={() => actionClick('500', 'PLUS')} ><a> 500</a></li>
                            <li onClick={() => actionClick('1000', 'PLUS')} ><a> 1000</a></li> */}
                        </ul>
                        <div id="keyboard" className="keyboard-wrap">
                            <ul id="numPad" className="btn-tel">
                                <li onClick={() => actionClick('1')}><a>1</a></li>
                                <li onClick={() => actionClick('2')}><a>2</a></li>
                                <li onClick={() => actionClick('3')}><a>3</a></li>
                                <li onClick={() => actionClick('4')}><a>4</a></li>
                                <li onClick={() => actionClick('5')}><a>5</a></li>
                                <li onClick={() => actionClick('6')}><a>6</a></li>
                                <li onClick={() => actionClick('7')}><a>7</a></li>
                                <li onClick={() => actionClick('8')}><a>8</a></li>
                                <li onClick={() => actionClick('9')}><a>9</a></li>
                                <li onClick={() => actionClick('0')}><a>0</a></li>
                                <li onClick={() => actionClick('00')}><a>00</a></li>
                                <li><a>.</a></li>
                            </ul>
                            <a id="delete" className="btn-delete" onClick={() => actionClick('', '', true)}></a></div>
                        <ul className="btn-list">

                            <li >
                                <button id="cancel" className="btn place-cancel" onClick={() => resetClicked()}>Cancel </button>
                            </li>

                            <li >
                                <button id="placeBet"
                                    style={styleObjectGetBGasColor(DD?.colorSchema)}
                                    className={`btn-send ${selecetdAmount ? 'active' : 'disabled'}`}
                                    disabled={!selecetdAmount}
                                    onClick={() => placeBetConfirm(clickedBet, TotalAmount, selecetdAmount, clickedTable, clickedTableData, 'OPEN')}>Place Bet </button>
                                {/* <button _ngcontent-wgb-c33="" type="submit" style="display: none;"></button> */}
                            </li>
                        </ul>
                    </td>
                </tr>
            }

            {/* popup design  */}
            {console.log(clickedBet, TotalAmount, selecetdAmount, clickedTable, clickedTableData, 'OPEN')}
            {OpenModal && <div className={`popup-wrp betpopup fade popup-show ${OpenModal ? "" : ""}`}>
                <div className="pop">
                    <div className="pop-content">
                        <div className="pop-head">
                            <h5> Please confirm your bet </h5>
                            <div className="pop-close"
                                onClick={() => closePopup()}
                            >
                            </div>
                        </div>
                        <form >
                            <div className="pop-body">
                                <div className='pop-body_title'>
                                    {clickedTableData.includes('l') ? <span className='lay pink-bg'>{clickedTable === 't3' ? 'yes' : 'Lay'}  </span> :
                                        <span className='lay cyan-bg'>{clickedTable === 't3' ? 'No' : 'Back'} </span>}
                                    <h3> {clickedBet.nat} </h3>
                                </div>
                                <ul>
                                    <li>
                                        Odds
                                        <span>
                                            {clickedBet[clickedTableData]}
                                        </span>
                                    </li>
                                    <li>
                                        Stake
                                        <span>
                                            {selecetdAmount}
                                        </span>
                                    </li>
                                    <li>
                                        {/* condition wise text */}
                                        Profit
                                        {/* condition wise class red or green  */}
                                        <span className={clickedTableData.includes('l') ? 'liability_red' : 'liability_green'}>
                                            {TotalAmount}
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pop-footer">
                                <div className={`button-wrap pb-0 d_flex d_flex_justify_spacebt d_flex_align_center w_100`}>
                                    <button onClick={() => closePopup()} type="button" className="btn  btn-sm" data-bs-dismiss="modal"> Back </button>
                                    <button className="submit-btn btn btn_black" type='button' onClick={() => placeBetConfirm(clickedBet, TotalAmount, selecetdAmount, clickedTable, clickedTableData, 'CONFIRM')}> Confirm </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div >}
        </>
    )
}

export default BetBox