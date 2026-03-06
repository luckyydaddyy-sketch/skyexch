import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { USER_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import Footer from '../../components/Footer'
import QuickSport from '../../components/QuickSport';
import { notifyError, notifyMessage, postApi, sendEvent } from '../../service'
import { PinInterface, SportDetailsInterface } from '../MultiMarket/interface';
import SportTabination from './sportTabination';
import { styleObjectGetBG } from '../../common/StyleSeter';
import moment from 'moment';
import NewsLine from '../../components/NewsLine';
import LoaderImage from "../../assets/images/loaderajaxbet1.gif"
import CricketImage from "../../assets/images/cricket-m.jpeg"
import SportsFilter from '../../components/sportsFilter';
import Loader from '../../components/Loader';



const cookies = new Cookies()
const Cricket = () => {
    const DD = useSelector((e: any) => e.domainDetails);
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const getSport = useSelector((e: any) => e.cricket);
    const [sportDetails, setSportDetails] = useState(getSport)
    const [isLoadding, setIsLoadding] = useState(true)
    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const [turnamentName, setTurnamentName] = useState<string[]>([])
    const [activeClassForsport, setactiveClassForsport] = useState<string>('sortByTime');

    useEffect(() => { setSportDetails(getSport); return () => { } }, [getSport])
    useEffect(() => {
        if (JSON.stringify(getSport) !== '{}') {
            setIsLoadding(false)
        }
        return () => {

        }
    }, [getSport])


    useEffect(() => {
        setTimeout(() => {
            sendEvent('GET_SPORTS', { "type": "cricket" })
        }, 500);
        setTimeout(() => {
            dispatch({ type: 'GET_SPORTS_DETAILS', payload: {} });
        }, 1000);
        return () => {
        }
    }, [])

    const pinClick = (e: any, SUBITEM: PinInterface) => {
        console.log(SUBITEM);
        navigate(SUBITEM.gameId + '/' + SUBITEM.marketId)
        sendEvent('GET_SPORTS_DETAILS', { eventId: SUBITEM.gameId, marketId: SUBITEM.marketId, domain : window.location.hostname })
    }

    const pinMetch = async (e: any, item: SportDetailsInterface, type: string) => {
        if (isAuthenticated && cookies.get('skyTokenFront')) {
            debugger
            let data = {
                api: USER_API.PIN,
                value: {
                    sportId: item._id,
                    type: type,
                    flag: !item.pin
                }
            }

            await postApi(data).then(function (response) {
                sendEvent('GET_SPORTS', { "type": "cricket" })
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

    return (
        <>
            <div className='multimarket'>
                <div className='row'>
                    {/* {side menu of sport} */}
                    <QuickSport />
                    <div className='multimarket_center'>
                        {/* multimarket screen  */}
                        <>
                            <NewsLine />
                            <div className='cricket_wrap_main'>
                                <div className='cricket_wrap'>
                                    <div className="cricket_img">
                                        <img src="./images/sportsSliderNew.png" alt="" />
                                        {/* <img src="./images/cricket.jpg" alt="" /> */}
                                    </div>


                                    <div className='highlightLabel'>
                                        <div className='wrap-highlight '>
                                            <a className="a-search" href="">Search</a>
                                            <SportTabination activeClass={'cricket'} />
                                        </div>

                                    </div>

                                    {true &&
                                        <>
                                            <h3 style={styleObjectGetBG(DD?.colorSchema, false, true)} className="yellow-bg2 text-color-black2 highligths-txt">Sports Highlights</h3>
                                            <SportsFilter sportDetails={sportDetails} setSportDetails={setSportDetails} setactiveClassForsport={setactiveClassForsport} setTurnamentName={setTurnamentName}/>
                                            <div className={`game-wrap col3 `}>
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
                                                    activeClassForsport === 'sortByTime' && sportDetails && sportDetails?.res?.length > 0 && !isLoadding ? sportDetails?.res?.map((item: SportDetailsInterface, i: any) => {
                                                        return (<>

                                                            {console.log("item", item.pin)}
                                                            <dl className="game-list-col disabled">
                                                                <dt id="eventInfo" style={{ width: "calc(63.8% - 14px)", overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {window.innerWidth < 993 && <>
                                                                        <div>
                                                                            {/* <span className="" ></span> */}
                                                                            <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex" } : { display: "none" }} >Live</span>
                                                                            <span className="game-E" id="sportsBookEIcon_1" style={{ display: "none" }}><i></i>Soccer</span>
                                                                            <span className="game-E" id="sportsBookEIcon_137" style={{ display: "none" }}><i></i>e-Soccer</span>
                                                                            <span className="game-E" id="sportsBookEIcon_2" style={{ display: "none" }}><i></i>Tennis</span>
                                                                            <span className= {item.inPlay && false ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", } : { display: "none" }}>Fancy</span>
                                                                            <span className={item.inPlay && false ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex" } : { display: "none" }}>BookMaker</span>
                                                                            {/* {cookies.get('skyTokenFront') && <span className="game-sportsbook" id="sportsBookIcon_2" style={(item.p || true) ? { display: "inline-flex", } : { display: "none" }}>Premium Cricket</span>} */}
                                                                            <span className="game-sportsbook" id="sportsBookIcon_2" style={(item.p || true) ? { display: "inline-flex", } : { display: "none" }}>Premium Cricket</span>
                                                                            {<span id="dateTimeInfo" className="game-list-time" style={item.inPlay ? { padding: 1 } : {}}> {!item.inPlay && moment(item.openDate).calendar()} </span>}
                                                                            <span className="in_play">{item.inPlay ? 'In-Play' : ''}</span>
                                                                            {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_4"><i></i>Cricket</span>}
                                                                        </div>
                                                                    </>}
                                                                    {/* <img id="playIcon" style={!item.inPlay ? { backgroundColor: '#aeaeae', borderRadius: 10, backgroundImage: 'unset' } : {}} className="icon-in_play" src="../../images/transparent.gif" alt='gif' /> */}
                                                                    <span id="lowLiquidityTag" className="game-low_liq" style={{ display: "none" }}>Low Liquidity</span>
                                                                    <Link id="vsName" className={item.inPlay ? 'active vsName' : 'vsName'} to={`/multimarket/${item.gameId}/${item.marketId}`} onClick={()=>{
                                                                        localStorage.setItem('sportsName', item.eventName);
                                                                        localStorage.setItem('sportsData', JSON.stringify(item))
                                                                    }}>{item.eventName}</Link>
                                                                    {window.innerWidth > 993 && <>
                                                                        <span className="in_play">{item.inPlay ? 'In-Play' : ''}</span>
                                                                        {(!item.inPlay || true) && <span id="dateTimeInfo" className="game-list-time"> {moment(item.openDate).calendar()} </span>}
                                                                        <div style={{ display: "inline-flex", justifyContent: "center", verticalAlign: "middle" }}>
                                                                            <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }} >Live</span>
                                                                            <span className="game-E" id="sportsBookEIcon_1" style={{ display: "none" }}><i></i>Soccer</span>
                                                                            <span className="game-E" id="sportsBookEIcon_137" style={{ display: "none" }}><i></i>e-Soccer</span>                                    
                                                                            <span className="game-E" id="sportsBookEIcon_2" style={{ display: "none" }}><i></i>Tennis</span>
                                                                            <span className="game-fancy in-play" id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>Fancy</span>
                                                                            <span className="game-bookmaker in-play" id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>BookMaker</span>
                                                                            <span className="game-sportsbook" id="sportsBookIcon_2" style={(item.p || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>Premium Cricket</span>
                                                                            {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_4"><i></i>Cricket</span>}
                                                                            {/* {cookies.get('skyTokenFront') && <span className="game-sportsbook" id="sportsBookIcon_2" style={item.p ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>Premium Cricket</span>} */}
                                                                        </div></>}
                                                                </dt>
                                                                {/* <dd id="matched" className="col-matched">
                                                                </dd> */}
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
                                                                    <a id="multiMarketPin" className={`add-pin ${item?.pin ? "active" : ""}`} style={{ cursor: "pointer" }} onClick={(e) => pinMetch(e, item, 'cricket')} title="Add to Multi Markets">Pin</a>
                                                                </dd>
                                                            </dl></>)
                                                    })
                                                    : activeClassForsport === 'sortByCompetition' && sportDetails && sportDetails?.res?.length > 0 && !isLoadding ? 
                                                    turnamentName.map((tName: string) =>{
                                                        return(<>
                                                            <div className='comp-name'>
                                                                {tName}
                                                            </div>
                                                            {
                                                                sportDetails?.res?.map((item: SportDetailsInterface, i: any) => {
                                                                    if(item.Turnament !== tName) return false;
                                                                    return (<>

                                                                        {console.log("item", item.pin)}
                                                                        <dl className="game-list-col disabled">
                                                                            <dt id="eventInfo" style={{ width: "calc(63.8% - 14px)", overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                {window.innerWidth < 993 && <>
                                                                                    <div>
                                                                                        {/* <span className="" ></span> */}
                                                                                        <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex" } : { display: "none" }} >Live</span>
                                                                                        <span className="game-E" id="sportsBookEIcon_1" style={{ display: "none" }}><i></i>Soccer</span>
                                                                                        <span className="game-E" id="sportsBookEIcon_137" style={{ display: "none" }}><i></i>e-Soccer</span>
                                                                                        <span className="game-E" id="sportsBookEIcon_2" style={{ display: "none" }}><i></i>Tennis</span>
                                                                                        <span className= {item.inPlay && false ? "game-fancy in-play" : "game-fancy"} id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", } : { display: "none" }}>Fancy</span>
                                                                                        <span className={item.inPlay && false ? "game-bookmaker in-play" :"game-bookmaker"} id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex" } : { display: "none" }}>BookMaker</span>
                                                                                        {/* {cookies.get('skyTokenFront') && <span className="game-sportsbook" id="sportsBookIcon_2" style={(item.p || true) ? { display: "inline-flex", } : { display: "none" }}>Premium Cricket</span>} */}
                                                                                        <span className="game-sportsbook" id="sportsBookIcon_2" style={(item.p || true) ? { display: "inline-flex", } : { display: "none" }}>Premium Cricket</span>
                                                                                        {<span id="dateTimeInfo" className="game-list-time" style={item.inPlay ? { padding: 1 } : {}}> {!item.inPlay && moment(item.openDate).calendar()} </span>}
                                                                                        <span className="in_play">{item.inPlay ? 'In-Play' : ''}</span>
                                                                                        {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_4"><i></i>Cricket</span>}
                                                                                    </div>
                                                                                </>}
                                                                                {/* <img id="playIcon" style={!item.inPlay ? { backgroundColor: '#aeaeae', borderRadius: 10, backgroundImage: 'unset' } : {}} className="icon-in_play" src="../../images/transparent.gif" alt='gif' /> */}
                                                                                <span id="lowLiquidityTag" className="game-low_liq" style={{ display: "none" }}>Low Liquidity</span>
                                                                                <Link id="vsName" className={item.inPlay ? 'active vsName' : 'vsName'} to={`/multimarket/${item.gameId}/${item.marketId}`} onClick={()=>{
                                                                                    localStorage.setItem('sportsName', item.eventName);
                                                                                    localStorage.setItem('sportsData', JSON.stringify(item))
                                                                                }}>{item.eventName}</Link>
                                                                                {window.innerWidth > 993 && <>
                                                                                    <span className="in_play">{item.inPlay ? 'In-Play' : ''}</span>
                                                                                    {(!item.inPlay || true) && <span id="dateTimeInfo" className="game-list-time"> {moment(item.openDate).calendar()} </span>}
                                                                                    <div style={{ display: "inline-flex", justifyContent: "center", verticalAlign: "middle" }}>
                                                                                        <span className="game-live" id="streamingIcon" style={item.inPlay ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }} >Live</span>
                                                                                        <span className="game-E" id="sportsBookEIcon_1" style={{ display: "none" }}><i></i>Soccer</span>
                                                                                        <span className="game-E" id="sportsBookEIcon_137" style={{ display: "none" }}><i></i>e-Soccer</span>                                    
                                                                                        <span className="game-E" id="sportsBookEIcon_2" style={{ display: "none" }}><i></i>Tennis</span>
                                                                                        <span className="game-fancy in-play" id="fancyBetIcon" style={(item.f || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>Fancy</span>
                                                                                        <span className="game-bookmaker in-play" id="bookMakerIcon" style={(item.m1 || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>BookMaker</span>
                                                                                        <span className="game-sportsbook" id="sportsBookIcon_2" style={(item.p || true) ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>Premium Cricket</span>
                                                                                        {item?.ematch > 0 && <span className="game-E" id="sportsBookEIcon_4"><i></i>Cricket</span>}
                                                                                        {/* {cookies.get('skyTokenFront') && <span className="game-sportsbook" id="sportsBookIcon_2" style={item.p ? { display: "inline-flex", margin: "0 2px" } : { display: "none" }}>Premium Cricket</span>} */}
                                                                                    </div></>}
                                                                            </dt>
                                                                            {/* <dd id="matched" className="col-matched">
                                                                            </dd> */}
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
                                                                                <a id="multiMarketPin" className={`add-pin ${item?.pin ? "active" : ""}`} style={{ cursor: "pointer" }} onClick={(e) => pinMetch(e, item, 'cricket')} title="Add to Multi Markets">Pin</a>
                                                                            </dd>
                                                                        </dl></>)
                                                                })
                                                            }
                                                            </>
                                                        )
                                                    }) : isLoadding ?

                                                        <div className='loader_top loader_overlay'>
                                                            <div className=''>
                                                                <Loader />
                                                            </div>
                                                        </div>
                                                        :
                                                        <h2>No data</h2>
                                                }

                                                </div>
                                            </div >
                                        </>
                                    }

                                    <div id="inplayVirtualCricketImage" className="footer-kv">
                                        <a id="inplayVirtualCricketEntrance" className="entrance">
                                            <img src={CricketImage} />
                                        </a>
                                    </div>



                                    {false && <>

                                        <div className='game-highlight-wrap '>
                                            <h3 style={styleObjectGetBG(DD?.colorSchema, false, true)} className="yellow-bg2 text-color-black2 highligths-txt">Sports Highlights
                                                <div className="highlight-sorting">
                                                    <label htmlFor="lang">View by</label>
                                                    <div className="select">
                                                        <select id="viewType" name="View" >
                                                            <option value="competitionName" >Competition</option>
                                                            <option value="openDateTime" selected>Time</option>
                                                            <option value="totalMatched" >Matched</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </h3>

                                            <div className='game-wrap col3' style={{ marginBottom: "0" }}>
                                                <ul className="slip-head">
                                                    <li className="col-game"></li>
                                                    <li className="col-matched">Matched</li>
                                                    <li className="col-visit">1</li>
                                                    <li className="col-draw">x</li>
                                                    <li className="col-home">2</li>
                                                    <li className="col-info"></li>
                                                </ul>
                                                <div className='game-list'>
                                                    <dl className="game-list-col disabled">
                                                        <dt id="eventInfo" >
                                                            <img id="playIcon" className="icon-in_play" src="../../images/transparent.gif" alt='gif' />
                                                            <span id="lowLiquidityTag" className="game-low_liq" style={{ display: "none" }}>Low Liquidity</span>
                                                            <a id="vsName" href="">Combined Campuses &amp; Colleges<span>v</span>Windward Islands</a>
                                                            <span id="dateTimeInfo" className="game-list-time"><span className="in_play">In-Play</span></span>
                                                            <span className="game-live" id="streamingIcon" style={{ display: "inline-flex" }} >Live</span>
                                                            <span className="game-E" id="sportsBookEIcon_1" style={{ display: "inline-flex" }}><i></i>Soccer</span>
                                                            <span className="game-E" id="sportsBookEIcon_137" style={{ display: "none" }}><i></i>e-Soccer</span>
                                                            <span className="game-E" id="sportsBookEIcon_4" style={{ display: "none" }}><i></i>Cricket</span>
                                                            <span className="game-E" id="sportsBookEIcon_2" style={{ display: "none" }}><i></i>Tennis</span>
                                                            <span className="game-fancy in-play" id="fancyBetIcon" style={{ display: "none" }}>Fancy</span>
                                                            <span className="game-bookmaker in-play" id="bookMakerIcon" style={{ display: "inline-flex" }}>BookMaker</span>
                                                            <span className="game-sportsbook" id="feedingSiteIcon" style={{ display: "none" }}>Sportsbook</span>
                                                            <span className="game-sportsbook" id="sportsBookIcon_1" style={{ display: "none" }}>Premium Tennis</span>
                                                            {cookies.get('skyTokenFront') && <span className="game-sportsbook" id="sportsBookIcon_2" style={{ display: "none" }}>Premium Cricket</span>}
                                                        </dt>
                                                        <dd id="matched" className="col-matched">PTE29,484</dd>
                                                        <dd id="selectTemp" className="col-visit">
                                                            <div className="suspend" style={{ display: "none" }}>
                                                                <span>Suspend</span>
                                                            </div>
                                                            <a id="btnBack" className="btn-back" >&nbsp;</a>
                                                            <a id="btnLay" className="btn-lay" >&nbsp;</a>
                                                        </dd>
                                                        <dd className="col-draw" >
                                                            <div className="suspend" style={{ display: "none" }}>
                                                                <span>Suspend</span>
                                                            </div>
                                                            <a id="btnBack" className="btn-back" >--</a>
                                                            <a id="btnLay" className="btn-lay" >--</a>
                                                        </dd>
                                                        <dd className="col-home">
                                                            <div className="suspend" style={{ display: "none" }}>
                                                                <span>Suspend</span>
                                                            </div>
                                                            <a id="btnBack" className="btn-back">&nbsp;</a>
                                                            <a id="btnLay" className="btn-lay">&nbsp;</a>
                                                        </dd>
                                                        <dd className="col-info">
                                                            <a id="multiMarketPin" className="add-pin" style={{ cursor: "pointer" }} title="Add to Multi Markets">Pin</a>

                                                        </dd>
                                                    </dl>

                                                    <dl className="game-list-col disabled">
                                                        <dt id="eventInfo" >
                                                            <img id="playIcon" className="icon-in_play" src="../../images/transparent.gif" alt='gif' />
                                                            <span id="lowLiquidityTag" className="game-low_liq" style={{ display: "none" }}>Low Liquidity</span>
                                                            <a id="vsName" href="">Combined Campuses &amp; Colleges<span>v</span>Windward Islands</a>
                                                            <span id="dateTimeInfo" className="game-list-time"> In-Play </span>
                                                            <span className="game-live" id="streamingIcon" style={{ display: "none" }} >Live</span>
                                                            <span className="game-E" id="sportsBookEIcon_1" style={{ display: "inline-flex" }}><i></i>Soccer</span>
                                                            <span className="game-E" id="sportsBookEIcon_137" style={{ display: "none" }}><i></i>e-Soccer</span>
                                                            <span className="game-E" id="sportsBookEIcon_4" style={{ display: "none" }}><i></i>Cricket</span>
                                                            <span className="game-E" id="sportsBookEIcon_2" style={{ display: "none" }}><i></i>Tennis</span>
                                                            <span className="game-fancy in-play" id="fancyBetIcon" style={{ display: "none" }}>Fancy</span>
                                                            <span className="game-bookmaker in-play" id="bookMakerIcon" style={{ display: "inline-flex" }}>BookMaker</span>
                                                            <span className="game-sportsbook" id="feedingSiteIcon" style={{ display: "none" }}>Sportsbook</span>
                                                            <span className="game-sportsbook" id="sportsBookIcon_1" style={{ display: "none" }}>Premium Tennis</span>
                                                            {cookies.get('skyTokenFront') && <span className="game-sportsbook" id="sportsBookIcon_2" style={{ display: "none" }}>Premium Cricket</span>}
                                                        </dt>
                                                        <dd id="matched" className="col-matched">PTE29,484</dd>
                                                        <dd id="selectTemp" className="col-visit">
                                                            <div className="suspend" style={{ display: "none" }}>
                                                                <span>Suspend</span>
                                                            </div>
                                                            <a id="btnBack" className="btn-back" >&nbsp;</a>
                                                            <a id="btnLay" className="btn-lay" >&nbsp;</a>
                                                        </dd>
                                                        <dd className="col-draw" >
                                                            <div className="suspend" style={{ display: "none" }}>
                                                                <span>Suspend</span>
                                                            </div>
                                                            <a id="btnBack" className="btn-back" >--</a>
                                                            <a id="btnLay" className="btn-lay" >--</a>
                                                        </dd>
                                                        <dd className="col-home">
                                                            <div className="suspend" style={{ display: "none" }}>
                                                                <span>Suspend</span>
                                                            </div>
                                                            <a id="btnBack" className="btn-back">&nbsp;</a>
                                                            <a id="btnLay" className="btn-lay">&nbsp;</a>
                                                        </dd>
                                                        <dd className="col-info">
                                                            <a id="multiMarketPin" className="add-pin" style={{ cursor: "pointer" }} title="Add to Multi Markets">Pin</a>

                                                        </dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                    }
                                    {/* <Footer /> */}
                                    {window.innerWidth < 992 && <div className='mb_25 mt_25 pb_10'></div>}
                                </div>
                            </div>
                        </>

                    </div>
                </div>
            </div>
        </>
    )
}


export default Cricket



