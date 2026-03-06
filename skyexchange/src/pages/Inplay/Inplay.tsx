import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { USER_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import Loader from '../../components/Loader';
import NewsLine from '../../components/NewsLine';
import { notifyError, notifyMessage, postApi } from '../../service';
import LoaderImage from "../../assets/images/loaderajaxbet1.gif"
import CricketImage from "../../assets/images/cricket-m.jpeg"

export interface gameInterface {
    back1: number;
    back2: number;
    back3: number;
    eid: number;
    eventName: string;
    f: boolean;
    gameId: number;
    ifb: boolean;
    inPlay: boolean;
    lay1: number;
    lay2: number;
    lay3: number;
    m1: boolean;
    marketId: string;
    openDate: string;
    p: boolean;
    pin: boolean;
    _id: string;
    ematch: number;
}
const cookies = new Cookies()

const Inplay = () => {
    const navigate = useNavigate()
    const Header = useSelector((e: any) => e.Header);
    const inPlayDetail = useSelector((e: any) => e.inPlayDetail ? e.inPlayDetail : undefined);
    const [pageData, setPageData] = useState<any>(inPlayDetail?.inPlay ? inPlayDetail?.inPlay : {})
    const [tab, setTab] = useState('play')
    const [cricketToggle, setCricketToggle] = useState(false)
    const [soccerToggle, setSoccerToggle] = useState(false)
    const [tennisToggle, setTennisToggle] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const [isLoadingMain, setIsLoadingMain] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)

    useEffect(() => {
        debugger
        if (Header) {
            setIsLoadingMain(true)
            getPageData('play')
            setTimeout(() => {
                dispatch({ type: 'GET_SPORTS_DETAILS', payload: {} });
            }, 1000);
            return () => { }
        }
    }, [Header])

    useEffect(() => {
        if (JSON.stringify(inPlayDetail) !== '{}' && inPlayDetail !== undefined) {
            setIsLoadingMain(false)
            setPageData(
                tab === 'play' ? inPlayDetail?.inPlay :
                    tab === 'today' ? inPlayDetail?.today :
                        tab === 'tomorrow' ? inPlayDetail?.tomorrow : {}
            )

        }
    }, [inPlayDetail])


    const getPageData = async (FILTER: string) => {
        // setIsLoading(true)
        debugger
        let data = {
            api: USER_API.IN_PLAY,
            value: { filter: FILTER, userId: cookies.get('skyTokenFront') ? Header?._id : '' }
        }

        await postApi(data).then(function (response) {
            setPageData(response.data.data)
            if (FILTER === 'play') {
                dispatch({ type: 'SET_IN_PLAY_DETAILS_IN_PLAY', payload: response.data.data });
            } else if (FILTER === 'today') {
                dispatch({ type: 'SET_IN_PLAY_DETAILS_TODAY', payload: response.data.data });
            } else if (FILTER === 'tomorrow') {
                dispatch({ type: 'SET_IN_PLAY_DETAILS_TOMORROW', payload: response.data.data });
            } else {
                dispatch({ type: 'SET_IN_PLAY_DETAILS', payload: undefined });
            }
            setIsLoading(false)
            setIsLoadingMain(false)
        }).catch(err => {
            setIsLoadingMain(false)
            setIsLoading(false)
            console.log(err);
            if (err.response.data.statusCode === 401) {
                Logout()
                // navigate('/login')
            }
        })
    }


    const pinMetch = async (e: any, item: gameInterface, type: string) => {
        if (cookies.get('skyTokenFront')) {
            let data = {
                api: USER_API.PIN,
                value: {
                    sportId: item._id,
                    type: type,
                    flag: !item.pin
                }
            }

            await postApi(data).then(function (response) {
                // setIsLoading(true)
                getPageData(tab)
                notifyMessage('Pin Success')
            }).catch(err => {
                console.log(err);
                if (err.response.data.statusCode === 401) {
                    Logout()
                    notifyError('Pin unsuccess')
                    // navigate('/login')
                }
            })
        } else {
            notifyError('please login first')
        }
    }

    const changeTab = (TAB: string) => {
        // setIsLoading(true)
        if (TAB === 'play') {
            setPageData(inPlayDetail?.inPlay)
        } else if (TAB === 'today') {
            setPageData(inPlayDetail?.today)
        } else if (TAB === 'tomorrow') {
            setPageData(inPlayDetail?.tomorrow)
        }
        getPageData(TAB)
        setTab(TAB)
        setCricketToggle(false)
        setSoccerToggle(false)
        setTennisToggle(false)
    }

    return (
        <>
            {console.log("inPlayDetail", inPlayDetail)}
            {console.log("userData", Header)}
            <div className='full-wrap'>
                <div className='inplay_left col-center'>
                    <NewsLine />

                    <div className='tab'>
                        <div className="tab_list">
                            <ul className="btn-group">
                                <li onClick={() => changeTab('play')} className={`${tab === 'play' ? 'active' : ''} tab_list_item`}>
                                    <a> In-Play </a>
                                </li>
                                <li onClick={() => changeTab('today')} className={`${tab === 'today' ? 'active' : ''} tab_list_item`}>
                                    <a> Today </a>
                                </li>
                                <li onClick={() => changeTab('tomorrow')} className={`${tab === 'tomorrow' ? 'active' : ''} tab_list_item`}>
                                    <a> Tomorrow </a>
                                </li>
                                {window.innerWidth < 993 &&
                                    <li onClick={() => changeTab('Result')} className={`${tab === 'Result' ? 'active' : ''} tab_list_item`}>
                                        <a> Result </a>
                                    </li>
                                }
                            </ul>
                            {window.innerWidth < 993 && <a className="a-search" href="javascript:void(0)">Search</a>}
                        </div>
                    </div>

                    {isLoadingMain ?
                        <div className='loader_top loader_overlay'>
                            <div className=''>
                                <Loader />
                            </div>
                        </div>

                        :
                        <>
                            <div className='over-wrap'>
                                {/* // add close class for toggle on off in right side of col3 */}

                                {(isLoading || pageData?.cricket?.length > 0) &&
                                    <>
                                        <div className={`game-wrap col3 ${cricketToggle ? 'close' : ''}`}>
                                            <h3 onClick={() => setCricketToggle(!cricketToggle)}>
                                                <a id="eventType" className="to-expand">Cricket</a>
                                            </h3>
                                            <ul className="slip-head">
                                                <li className="col-game"></li>
                                                <li className="col-matched">
                                                    {/* Matched */}
                                                </li>
                                                <li className="col-visit">1</li>
                                                <li className="col-draw">x</li>
                                                <li className="col-home">2</li>
                                                <li className="col-info"></li>
                                            </ul>
                                            <div className='game-list'>


                                                {
                                                    pageData && !isLoading && pageData.cricket.length > 0 ? pageData.cricket.map((item: gameInterface, i: any) => {
                                                        return (<>
                                                            <dl className="game-list-col disabled">
                                                                <dt id="eventInfo" >
                                                                    {window.innerWidth < 993 && <>
                                                                        <div style={{ marginLeft: "17px" }}>
                                                                            <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }} >Live</span>
                                                                            <span className={item.inPlay ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>Fancy</span>
                                                                            <span className={item.inPlay ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>BookMaker</span>
                                                                            <span className="game-sportsbook" id="sportsBookIcon_2" style={(item.p || true) ? { display: "inline-flex", } : { display: "none" }}>Premium Cricket</span>
                                                                            {item.inPlay && <span className="in_play">In-Play</span>}
                                                                            {!item.inPlay && <span id="dateTimeInfo" className="game-list-time">{moment(item.openDate).calendar()}</span>}
                                                                            {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_4"><i></i>Cricket</span>}
                                                                        </div>
                                                                    </>}
                                                                    {/* <img id="playIcon" className="icon-in_play" style={!item.inPlay ? { backgroundColor: '#aeaeae', borderRadius: 10, backgroundImage: 'unset' } : {}} src="../../images/transparent.gif" alt="gif" /> */}
                                                                    <span id="lowLiquidityTag" className="game-low_liq" style={{ display: "none" }}>Low Liquidity</span>
                                                                    <a id="vsName" className={item.inPlay ? 'active vsName' : 'vsName'} href={`/multimarket/${item.gameId}/${item.marketId}`}
                                                                    onClick={()=>{
                                                                        localStorage.setItem('sportsName', item.eventName);
                                                                        localStorage.setItem('sportsData', JSON.stringify(item))
                                                                    }}
                                                                    >{item.eventName}</a>
                                                                    {window.innerWidth > 993 && <>
                                                                        {!item.inPlay && <span id="dateTimeInfo" className="game-list-time">{moment(item.openDate).calendar()}</span>}
                                                                        {item.inPlay && <span className="in_play" >In-Play</span>}
                                                                        <div style={{ display: "inline-flex", verticalAlign: "middle", justifyContent: "center" }}>
                                                                            <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }} >Live</span>
                                                                            <span className={item.inPlay ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>Fancy</span>
                                                                            <span className={item.inPlay ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>BookMaker</span>
                                                                            {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_4"><i></i>Cricket</span>}
                                                                        </div>
                                                                    </>}
                                                                </dt>
                                                                <dd id="matched" className="col-matched">
                                                                    {/* PTE29,484 */}
                                                                </dd>
                                                                <dd id="selectTemp" className="col-visit">
                                                                    <div className="suspend" style={{ display: "none" }}>
                                                                        <span>Suspend</span>
                                                                    </div>
                                                                    <a id="btnBack" className="btn-back" >{item.back1}</a>
                                                                    <a id="btnLay" className="btn-lay" >{item.lay1}</a>
                                                                </dd>
                                                                <dd className="col-draw" >
                                                                    <div className="suspend" style={{ display: "none" }}>
                                                                        <span>Suspend</span>
                                                                    </div>
                                                                    <a id="btnBack" className="btn-back" >{item.back2}</a>
                                                                    <a id="btnLay" className="btn-lay" >{item.lay2}</a>
                                                                </dd>
                                                                <dd className="col-home">
                                                                    <div className="suspend" style={{ display: "none" }}>
                                                                        <span>Suspend</span>
                                                                    </div>
                                                                    <a id="btnBack" className="btn-back">{item.back3}</a>
                                                                    <a id="btnLay" className="btn-lay">{item.lay3}</a>
                                                                </dd>
                                                                <dd className="col-info" onClick={(e) => pinMetch(e, item, 'cricket')}>
                                                                    <a id="multiMarketPin" className={`add-pin ${item?.pin ? "active" : ""}`} style={{ cursor: "pointer" }} title="Add to Multi Markets">Pin</a>

                                                                </dd>
                                                            </dl>
                                                        </>)
                                                    }) : isLoading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img style={{ width: 100 }} src={LoaderImage} alt="" /></div> : <h2 className='no-data'>No data</h2>
                                                }
                                            </div>

                                        </div>

                                        <div id="inplayVirtualCricketImage" className="footer-kv">
                                            <a id="inplayVirtualCricketEntrance" className="entrance">
                                                <img src={CricketImage} />
                                            </a>
                                        </div>
                                    </>
                                }



                                {(isLoading || pageData?.soccer?.length > 0) && <div className={`game-wrap col3 ${soccerToggle ? 'close' : ''}`}>
                                    <h3 onClick={() => setSoccerToggle(!soccerToggle)}>
                                        <a id="eventType" className="to-expand">Soccer</a>
                                    </h3>
                                    <ul className="slip-head">
                                        <li className="col-game"></li>
                                        <li className="col-matched">
                                            {/* Matched */}
                                        </li>
                                        <li className="col-visit">1</li>
                                        <li className="col-draw">x</li>
                                        <li className="col-home">2</li>
                                        <li className="col-info"></li>
                                    </ul>
                                    <div className='game-list'>
                                        {pageData && !isLoading && pageData?.soccer?.length > 0 ? pageData?.soccer?.map((item: gameInterface, i: any) => {
                                            return (<>
                                                <dl className="game-list-col disabled">
                                                    <dt id="eventInfo" >
                                                        {window.innerWidth < 993 && <>
                                                            <div style={{ marginLeft: "17px" }}>
                                                                <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }} >Live</span>
                                                                {/* <span className={item.inPlay ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>Fancy</span> */}
                                                                <span className={item.inPlay ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>BookMaker</span>
                                                                {item.inPlay && <span className="in_play">In-Play</span>}
                                                                {!item.inPlay && <span id="dateTimeInfo" className="game-list-time">{moment(item.openDate).calendar()}</span>}
                                                                {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_137"><i></i>e-Soccer</span>}
                                                            </div>
                                                        </>}
                                                        {/* <img id="playIcon" className="icon-in_play" src="../../images/transparent.gif" alt="gif" /> */}
                                                        <span id="lowLiquidityTag" className="game-low_liq" style={{ display: "none" }}>Low Liquidity</span>
                                                        <a id="vsName" className={item.inPlay ? 'active vsName' : 'vsName'} href={`/multimarket/${item.gameId}/${item.marketId}`}
                                                        onClick={()=>{
                                                            localStorage.setItem('sportsName', item.eventName);
                                                            localStorage.setItem('sportsData', JSON.stringify(item))
                                                        }}
                                                        >{item.eventName}</a>
                                                        {/* <span id="dateTimeInfo" className="game-list-time"><span className="in_play">{item.inPlay ? 'In-Play' : ''}</span></span>
                                                    <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex" } : { display: "none" }} >Live</span>
                                                    <span className="game-fancy in-play" id="fancyBetIcon" style={item.f ? { display: "inline-flex" } : { display: "none" }}>Fancy</span>
                                                    <span className="game-bookmaker in-play" id="bookMakerIcon" style={item.m1 ? { display: "inline-flex" } : { display: "none" }}>BookMaker</span> */}
                                                        {window.innerWidth > 993 && <>
                                                            {!item.inPlay && <span id="dateTimeInfo" className="game-list-time">{moment(item.openDate).calendar()}</span>}
                                                            {item.inPlay && <span className="in_play">In-Play</span>}
                                                            <div style={{ display: "inline-flex", verticalAlign: "middle", justifyContent: "center" }}>
                                                                <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }} >Live</span>
                                                                <span className={item.inPlay ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>Fancy</span>
                                                                <span className={item.inPlay ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>BookMaker</span>
                                                                {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_137"><i></i>e-Soccer</span> }
                                                            </div>
                                                        </>}
                                                    </dt>
                                                    <dd id="matched" className="col-matched">
                                                        {/* PTE29,484 */}
                                                    </dd>
                                                    <dd id="selectTemp" className="col-visit">
                                                        <div className="suspend" style={{ display: "none" }}>
                                                            <span>Suspend</span>
                                                        </div>
                                                        <a id="btnBack" className="btn-back" >{item.back1}</a>
                                                        <a id="btnLay" className="btn-lay" >{item.lay1}</a>
                                                    </dd>
                                                    <dd className="col-draw" >
                                                        <div className="suspend" style={{ display: "none" }}>
                                                            <span>Suspend</span>
                                                        </div>
                                                        <a id="btnBack" className="btn-back" >{item.back2}</a>
                                                        <a id="btnLay" className="btn-lay" >{item.lay2}</a>
                                                    </dd>
                                                    <dd className="col-home">
                                                        <div className="suspend" style={{ display: "none" }}>
                                                            <span>Suspend</span>
                                                        </div>
                                                        <a id="btnBack" className="btn-back" >{item.back3}</a>
                                                        <a id="btnLay" className="btn-lay" >{item.lay3}</a>
                                                    </dd>
                                                    <dd className="col-info">
                                                        <a id="multiMarketPin" className={`add-pin ${item?.pin ? "active" : ""}`} style={{ cursor: "pointer" }} onClick={(e) => pinMetch(e, item, 'soccer')} title="Add to Multi Markets">Pin</a>

                                                    </dd>
                                                </dl>
                                            </>
                                            )
                                        }) : isLoading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img style={{ width: 100 }} src={LoaderImage} alt="" /></div> : <h2 className='no-data'>No data</h2>
                                        }
                                    </div >
                                </div >}

                                {(isLoading || pageData?.tennis?.length > 0) && <div className={`game-wrap col3 ${tennisToggle ? 'close' : ''}`}>
                                    <h3 onClick={() => setTennisToggle(!tennisToggle)}>
                                        <a id="eventType" className="to-expand">Tennis</a>
                                    </h3>
                                    <ul className="slip-head">
                                        <li className="col-game" style={{ width: "calc(63.8% - 14px)" }}></li>
                                        <li className="col-matched">
                                            {/* Matched */}
                                        </li>
                                        <li className="col-visit">1</li>
                                        <li className="col-draw">x</li>
                                        <li className="col-home">2</li>
                                        <li className="col-info"></li>
                                    </ul>
                                    <div className='game-list'>{
                                        pageData && !isLoading && pageData?.tennis?.length > 0 ? pageData?.tennis?.map((item: gameInterface, i: any) => {
                                            return (<>
                                                {console.log("pageData?.tennis", item)}
                                                <dl className="game-list-col disabled">
                                                    <dt id="eventInfo" style={{ width: "calc(63.8% - 14px)" }}>
                                                        {window.innerWidth < 993 && <>
                                                            <div style={{ marginLeft: "17px" }}>
                                                                <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }} >Live</span>
                                                                {/* <span className={item.inPlay ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>Fancy</span> */}
                                                                <span className={item.inPlay ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex", marginRight: "5px" } : { display: "none" }}>BookMaker</span>
                                                                {item.inPlay && <span className="in_play">In-Play</span>}
                                                                {<span id="dateTimeInfo" className="game-list-time">{!item.inPlay && moment(item.openDate).calendar()}</span>}
                                                                {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_2" ><i></i>Tennis</span>}
                                                            </div>
                                                        </>}
                                                        {/* <img id="playIcon" className="icon-in_play" src="../../images/transparent.gif" alt="gif" /> */}
                                                        <span id="lowLiquidityTag" className="game-low_liq" style={{ display: "none" }}>Low Liquidity</span>
                                                        <a id="vsName" className={item.inPlay ? 'active vsName' : 'vsName'} href={`/multimarket/${item.gameId}/${item.marketId}`}
                                                        onClick={()=>{
                                                            localStorage.setItem('sportsName', item.eventName);
                                                            localStorage.setItem('sportsData', JSON.stringify(item))
                                                        }}
                                                        >{item.eventName}</a>
                                                        {window.innerWidth > 993 && <>
                                                            {!item.inPlay && <span id="dateTimeInfo" className="game-list-time">{moment(item.openDate).calendar()}</span>}
                                                            {item.inPlay && <span className="in_play">In-Play</span>}
                                                            <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex" } : { display: "none" }} >Live</span>
                                                            <span className={item.inPlay ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex" } : { display: "none" }}>Fancy</span>
                                                            <span className={item.inPlay ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex" } : { display: "none" }}>BookMaker</span>
                                                           {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_2"><i></i>Tennis</span>}
                                                        </>}
                                                        {/* <span id="dateTimeInfo" className="game-list-time"><span className="in_play">{item.inPlay ? 'In-Play' : ''}</span></span>
                                                        <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex" } : { display: "none" }} >Live</span>
                                                        <span className="game-fancy in-play" id="fancyBetIcon" style={item.f ? { display: "inline-flex" } : { display: "none" }}>Fancy</span>
                                                        <span className="game-bookmaker in-play" id="bookMakerIcon" style={item.m1 ? { display: "inline-flex" } : { display: "none" }}>BookMaker</span> */}
                                                    </dt>
                                                    <dd id="matched" className="col-matched">
                                                        {/* PTE29,484 */}
                                                    </dd>
                                                    <dd id="selectTemp" className="col-visit">
                                                        <div className="suspend" style={{ display: "none" }}>
                                                            <span>Suspend</span>
                                                        </div>
                                                        <a id="btnBack" className="btn-back" >{item.back1}</a>
                                                        <a id="btnLay" className="btn-lay" >{item.lay1}</a>
                                                    </dd>
                                                    <dd className="col-draw" >
                                                        <div className="suspend" style={{ display: "none" }}>
                                                            <span>Suspend</span>
                                                        </div>
                                                        <a id="btnBack" className="btn-back" >{item.back2}</a>
                                                        <a id="btnLay" className="btn-lay" >{item.lay2}</a>
                                                    </dd>
                                                    <dd className="col-home">
                                                        <div className="suspend" style={{ display: "none" }}>
                                                            <span>Suspend</span>
                                                        </div>
                                                        <a id="btnBack" className="btn-back" >{item.back3}</a>
                                                        <a id="btnLay" className="btn-lay" >{item.lay3}</a>
                                                    </dd>
                                                    {/* {console.log("flag", item.flag)} */}

                                                    <dd className="col-info">
                                                        <a id="multiMarketPin" className={`add-pin ${item?.pin ? "active" : ""}`} style={{ cursor: "pointer" }} onClick={(e) => pinMetch(e, item, 'tennis')} title="Add to Multi Markets">Pin</a>

                                                    </dd>
                                                </dl></>)
                                        }) : isLoading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img style={{ width: 100 }} src={LoaderImage} alt="" /></div> : isLoading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img style={{ width: 100 }} src={LoaderImage} alt="" /></div> : <h2 className='no-data'>No data</h2>
                                    }
                                    </div>
                                </div >}
                                {window.innerWidth < 993 ? <div className="mb-50 hight-10"></div> : ""}
                            </div >

                        </>
                    }

                    {(window.innerWidth > 992 && (tab === "tomorrow" || tab === "today")) &&

                        <div className='tab_content'>
                            <div className='today_tab'>
                                <div className="sports_filters">
                                    <div className="sports_filters_left">
                                        <h5>Sports Filters:</h5>
                                        <ul className="d-flex align-items-center ">
                                            <li>Cricket</li>
                                            <li>Soccer</li>
                                            <li>Tennis</li>
                                        </ul>
                                    </div>
                                    <div className="sports_filters_right">
                                        <button type="button" className="close_btn btn btn-primary" onClick={() => setFilterOpen(!filterOpen)}>Filter</button>
                                        {filterOpen &&
                                            <>
                                                <div className='tooltip_modal'>
                                                    <div className="popover-arrow" style={{ position: 'absolute', right: '50px', }}></div>
                                                    <div className="popover-body">
                                                        <div className="container">
                                                            <form className="filter_menu">
                                                                <div className="filter_menu_wrp">
                                                                    <div className='filter_menu_wrp_top'>
                                                                        <div className="filter_menu_wrp_left">
                                                                            <div>
                                                                                <div className="mb-0">
                                                                                    <div className="form-check">
                                                                                        <input type="checkbox" id="formBasicCheckbox" className="form-check-input" value="all" />
                                                                                        <label title="" htmlFor="formBasicCheckbox" className="form-check-label">All</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="mb-0"><div className="form-check">
                                                                                    <input type="checkbox" id="formBasicCheckbox2" className="form-check-input" value="2" />
                                                                                    <label title="" htmlFor="formBasicCheckbox2" className="form-check-label">Tennis</label>
                                                                                </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="filter_menu_wrp_right">
                                                                            <div>
                                                                                <div className="mb-0">
                                                                                    <div className="form-check">
                                                                                        <input type="checkbox" id="formBasicCheckbox4" className="form-check-input" value="1" />
                                                                                        <label title="" htmlFor="formBasicCheckbox4" className="form-check-label">Soccer</label>
                                                                                    </div>
                                                                                </div>

                                                                            </div>
                                                                            <div>
                                                                                <div className="mb-0">
                                                                                    <div className="form-check">
                                                                                        <input type="checkbox" id="formBasicCheckbox5" className="form-check-input" value="4" />
                                                                                        <label title="" htmlFor="formBasicCheckbox5" className="form-check-label">Cricket</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <ul className="filter_menu_wrp_bottom btn-wrap">
                                                                        <li className="col-send">
                                                                            <button type="submit" className="btn-send m-0 btn btn-primary" onClick={() => setFilterOpen(false)}>Save</button>
                                                                        </li>
                                                                        <li className=" me-4">
                                                                            <button type="button" className="btn btn btn-primary" onClick={() => setFilterOpen(false)}>Cancel </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className='game-list today_table'>
                                {pageData?.cricket?.length > 0 &&
                                    pageData?.cricket.map((item: gameInterface, i: any) => {
                                        return (
                                            <dl className='game-list-col' key={i}>
                                                <dt>
                                                    {/* {tab === "today" ? "today" : " Tomorrow"} */}
                                                    {moment(item.openDate, "YYYY-MM-DD HH:mm").format("hh:mm A")}
                                                </dt>
                                                <dt>
                                                    <div className="table_data">
                                                        <h5>
                                                            Cricket
                                                            <span className="angle_unicode">▸</span>
                                                            <a href="/markets/tennis/32649309/1.218542244">{item.eventName}</a>
                                                        </h5>
                                                    </div>
                                                </dt>
                                            </dl>
                                        )
                                    })

                                }

                                {pageData?.soccer?.length > 0 &&
                                    pageData?.soccer.map((item: gameInterface, i: any) => {
                                        return (
                                            <dl className='game-list-col' key={i}>
                                                <dt>
                                                    {/* {tab === "today" ? "today" : " Tomorrow"} */}
                                                    {moment(item.openDate, "YYYY-MM-DD HH:mm").format("hh:mm A")}
                                                </dt>
                                                <dt>
                                                    <div className="table_data">
                                                        <h5> Soccer
                                                            <span className="angle_unicode">▸</span>
                                                            <a href="/markets/tennis/32649309/1.218542244">{item.eventName}</a>
                                                        </h5>
                                                    </div>
                                                </dt>
                                            </dl>
                                        )
                                    })

                                }


                                {pageData?.tennis?.length > 0 &&
                                    pageData?.tennis.map((item: gameInterface, i: any) => {
                                        return (
                                            <dl className='game-list-col' key={i}>
                                                <dt>
                                                    {/* {tab === "today" ? "today" : " Tomorrow"} */}
                                                    {moment(item.openDate, "YYYY-MM-DD HH:mm").format("hh:mm A")}
                                                </dt>
                                                <dt>
                                                    <div className="table_data">
                                                        <h5>
                                                            Tennis
                                                            <span className="angle_unicode">▸</span>
                                                            <a href="/markets/tennis/32649309/1.218542244">{item.eventName}</a>
                                                        </h5>
                                                    </div>
                                                </dt>
                                            </dl>
                                        )
                                    })

                                }

                            </div>
                        </div>
                    }




                </div >

                <div className='inplay_right col-right'>
                    <div className='slip-wrap no-open-bet_slip'>
                        <h3>
                            <a className="to-expand" >Bet Slip </a>
                        </h3>
                        <ul id="loadingMsg" className="loading" style={{ display: "none" }}>
                            <li><span /></li>
                            <li id="countDownTime">Place Bets </li>
                        </ul>

                        <p id="noBetSlipInfo">Click on the odds to add selections to the betslip. </p>
                    </div>
                </div>

            </div >
        </>
    )
}


export default Inplay



