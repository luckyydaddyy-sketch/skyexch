/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { TableHTMLAttributes, useEffect, useState, useRef } from "react";
import { Tooltip } from 'react-tooltip';
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { USER_API } from "../../common/common";
import { getComparator, Logout, stableSort } from "../../common/Funcation";
import { styleObjectGetBG } from "../../common/StyleSeter";
import Footer from "../../components/Footer";
import Loader from "../../components/Loader";
import NewsLine from "../../components/NewsLine";
import QuickSport from "../../components/QuickSport";
import { bookExposerGetPopup } from "../../redux/reducer";
import {
  getApi,
  getApiLink,
  notifyError,
  notifyMessage,
  postApi,
  postApiLink,
  sendEvent,
} from "../../service";
import Login from "../Login";
import BetBox from "./BetBox";
import {
  DetailsTableInterface,
  FancyInterface,
  ListInterface,
  MultiMarketListInterface,
  PinInterface,
  PreMainInterface,
  PreSubInterface,
  SportDetailsInterface,
} from "./interface";
import CommonPopup from "../../components/CommonPopup";
import MarketDepthPopup from "../../components/MarketDepthPopup";
import moment from "moment";
import tvImage from "../../assets/images/tv_img.jpg";
import OddsDammyData from "../../components/multiMarket/OddsDammyData";

const cookies = new Cookies();
const MultiMarket = () => {
  let interval: string | number | NodeJS.Timeout | undefined;
  const HeaderData = useSelector((e: any) => e.Header);
  const homeData = useSelector((e: any) => e.homeData);
  const isMountedRef = useRef(true);
  const DD = useSelector((e: any) => e.domainDetails);
  const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
  const SPORT_DETAILS = useSelector((e: any) => e.sportDetails);
  const BET_HISTORY = useSelector((e: any) => e.betHistory);
  const MY_TV_FLAG = useSelector((e: any) => e.myTv);
  const SCORE_CARD = useSelector((e: any) => e.scoreCard);
  const [placeBetLoader, setPlaceBetLoader] = useState(false);
  const [tab, setTab] = useState("cricket");
  const [fancyinfoId, setFancyinfoId] = useState<number>(0);
  const [fancyPremium, setFancyPremium] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openAccordian, setopenAccordian] = useState(true);
  const [openLive, setopenLive] = useState(false);
  const [detailsPage, setDetailsPage] = useState<any>({
    eventId: "",
    marketId: "",
  });
  const [detailSport, setDetailSport] = useState(SPORT_DETAILS);
  const [clickedBet, setClickedBet] = useState<DetailsTableInterface | any>();
  const [clickedTableData, setClickedTableData] = useState<string>("");
  let { eventId, marketId } = useParams<any>();
  const [openedPre, setOpenedPre] = useState<any>([]);
  const [clickedTable, setClickedTable] = useState<string>("");
  const [videoDetails, setVideoDetails] = useState<any>({});
  const [chennalID, setChennalID] = useState<any>("0");
  const [loginPopup, setLoginPopup] = useState(false);
  const [positonModal, setPositonModal] = useState<boolean>(false);
  const [premiumPopup, setPremiumPopup] = useState<boolean>(false);
  const [fancyPopup, setFancyPopup] = useState<boolean>(false);
  const [HistorySuccess, setHistorySuccess] = useState(false);
  const [positonDetails, setPositonDetails] = useState<any>({
    data: [],
    type: "",
  });
  
  const [fancyMinMaxPopup, setFancyMinMaxPopup] = useState<boolean>(false);
  const [oddsinfoId, setoddsinfoId] = useState(false);
  const [permiumMinpopup, setpermiumMinpopup] = useState(false);
  const [oddMinMaxpopup, setoddMinMaxpopup] = useState(false);
  const [isSportLoading, setIsSportLoading] = useState<boolean>(true);
  const [blockStatus, setBlockStatus] = useState<any>({});
  const [t4Main, setT4Main] = useState<any>({});
  const [betdetails, setBetdetails] = useState<any>({});
  const [betPlacePopup, setBetPlacePopup] = useState(false);
  const [marketPopup, setMarketPopup] = useState(false);
  const [isEventCall, setIsEventCall] = useState(true);
  const [openLiveTab, setopenLiveTab] = useState<any>("scoreboard");
  const [showMin, setMin] = useState(0);
  const [showMax, setMax] = useState(0);
  const [liveStreamUrl, setLiveStreamUrl] = useState<string>("");

  if (
    window.performance &&
    detailsPage.eventId &&
    detailsPage.marketId &&
    window.innerWidth < 993
  ) {
    if (performance.navigation.type == 1) {
      // navigate('/')
    } else {
    }
  }
  const [sportDetail, setSportDetail] = useState<any>({})
  let sportsData = localStorage.getItem("sportsData");
  const [match_id, setMatch_id] = useState(null);

  useEffect(()=>{
    if(sportsData){
      const sportsDataTemp = JSON.parse(sportsData)
      
      setMatch_id(sportsDataTemp._id)
      setSportDetail(sportsDataTemp)
    }
  },[])

  const [activePin, setActivePin] = useState("All");
  
  const getBlockStatus = async () => {
    let match_id = null; 
    if(sportsData){
      const sportsDataTemp = JSON.parse(sportsData)
      console.log("marketIddsd sdfdsfdff : sportsDataTemp : ", sportsDataTemp);
      match_id = sportsDataTemp._id
      console.log("marketIddsd sdfdsfdff : match_id : ", match_id);
    }
    console.log("marketIddsd sdfdsfdff : function ::: ", match_id);
    if(!match_id) {
      // No match_id available - set empty block status locally
      setBlockStatus({
        blockAll: false,
        blockOdds: false,
        blockBookMaker: false,
        blockFancy: false,
        blockPremium: false,
      });
      return false;
    }

    let data = {
      api: USER_API.GET_BLOCK,
      value: {
        // matchId: "63f3992e1ac591eee195eb31",
        matchId: match_id,
      },
    };

    await postApi(data)
      .then(function (response) {
        if (JSON.stringify(response.data.data.blockMatchDetail) === "{}") {
          setBlockStatus({
            blockAll: false,
            blockOdds: false,
            blockBookMaker: false,
            blockFancy: false,
            blockPremium: false,
            //   matchId: id
          });
        } else {
          setBlockStatus(response.data.data.blockMatchDetail);
        }
      })
      .catch((err) => {
        console.log("getBlockStatus error:", err?.message);
        if (err?.response?.data?.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };

  useEffect(() => {
    console.log("MY_TV_FLAG :: ", MY_TV_FLAG);

    setopenLive(MY_TV_FLAG);
  }, [dispatch]);

  useEffect(() => {
    console.log("openLive :: ", MY_TV_FLAG);

    if(MY_TV_FLAG){
      setopenLiveTab("live");
    }else{
      setopenLiveTab("scoreboard");
    }
  }, [MY_TV_FLAG]);

  const [pageData, setPageData] = useState<any>();
  const [cricketData, setcricketData] = useState<any>();
  const [tenisData, setTenisData] = useState<any>();
  const [soccerData, setSoccerData] = useState<any>();
  const [eSoccerData, setEsoccerData] = useState<any>();
  const [basketBallData, setBasketBallData] = useState<any>();
  useEffect(() => {
    if (isAuthenticated && cookies.get("skyTokenFront")) {
      getPageData("cricket");
    }

    return () => {};
  }, []);

  //for custom betplace popup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setBetPlacePopup(false);
    }, 4000);

    // Cleanup the timeout to avoid memory leaks
    return () => clearTimeout(timeoutId);
  }, [betPlacePopup]);

  useEffect(() => {
    if (JSON.stringify(SPORT_DETAILS) !== "{}") {
      setIsSportLoading(false);
    }
    setDetailSport(SPORT_DETAILS);
    return () => {};
  }, [SPORT_DETAILS]);

  const getPageData = async (TAB: string) => {
    let data = {
      api: USER_API.MULTI_LIST,
      value: { type: TAB },
    };
    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>", response);
        setPageData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };

  useEffect(() => {
    setTimeout(() => {
      sendEvent("GET_SPORTS", { type: "cricket" });
    }, 3000);
    window.onbeforeunload = () => {
      dispatch({ type: "GET_SCORE_ID", payload: [] });
    };
    getVideoUrl();
    getchennalIDForVideoUrl();
    getLiveStreamUrl();
    return () => {
      dispatch({ type: "GET_SPORTS_DETAILS", payload: {} });
      setDetailSport({});
    };
  }, [eventId]);

  const getMatchData = () => {
    let data: any = {};
    if (eventId && marketId) {
      setDetailsPage({ eventId: parseInt(eventId), marketId: marketId });
      data.eventId = parseInt(eventId);
      data.marketId = marketId;
      
      console.log("marketIddsd sdfdsfdff ", detailSport?.matchInfo);
      console.log("marketIddsd isAuthenticated ", isAuthenticated);
      console.log("marketIddsd cookies ", cookies.get("skyTokenFront"));
      // if(detailSport?.matchInfo){
      //   console.log("marketIddsd sdfdsfdff : set");
        
      //   setMatch_id(detailSport?.matchInfo?._id)
      // }
      data.domain = window.location.hostname;
      let num = 1;
      // clearInterval(interval)
      interval = setInterval(() => {
        if ((HistorySuccess || BET_HISTORY) && isMountedRef.current) {
          console.log("marketIddsd o isEventCall ", num);
          console.log("marketIddsd 0 isAuthenticated ", isAuthenticated);
      console.log("marketIddsd 0 cookies ", cookies.get("skyTokenFront"));
          if(num === 1 || (isAuthenticated && cookies.get("skyTokenFront"))){
            sendEvent("GET_SPORTS_DETAILS", data);
            setIsEventCall(false);
            num += 1;
          }
          if (isAuthenticated && cookies.get("skyTokenFront")) {
            console.log("marketIddsd sdfdsfdff : call in if :: ", detailSport?.matchInfo);
            getBlockStatus();
          }
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (cookies.get("skyTokenFront")) {
      let data: any = {};
      if (eventId && marketId) {
        setDetailsPage({ eventId: parseInt(eventId), marketId: marketId });

        data.eventId = parseInt(eventId);
        data.marketId = marketId;
        data.domain = window.location.hostname;
        if (HistorySuccess || BET_HISTORY) {
          setTimeout(() => {
            sendEvent("GET_SPORTS_DETAILS", data);
          }, 500);
        }
      }
    }
    return () => {
      dispatch({ type: "GET_SPORTS_DETAILS", payload: {} });
      setDetailSport({});
    };
  }, [HistorySuccess]);
  useEffect(() => {
    getMatchData();
    if (cookies.get("skyTokenFront")) {
      getCricketData("cricket");
      getSoccerData("soccer");
      getTennisData("tennis");
      if (homeData?.eSoccer === true) getEoccerData("esoccer");
      if (homeData?.basketBall === true) getBasketBallData("basketball");
    }
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      dispatch({ type: "GET_SPORTS_DETAILS", payload: {} });
      setDetailSport({});
    };
  }, []);

  const getCricketData = async (TAB: string) => {
    let data = {
      api: USER_API.MULTI_LIST,
      value: { type: TAB },
    };
    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>", response);
        setcricketData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };
  const getSoccerData = async (TAB: string) => {
    let data = {
      api: USER_API.MULTI_LIST,
      value: { type: TAB },
    };
    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>", response);
        setSoccerData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };
  const getTennisData = async (TAB: string) => {
    let data = {
      api: USER_API.MULTI_LIST,
      value: { type: TAB },
    };
    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>", response);
        setTenisData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };
  const getEoccerData = async (TAB: string) => {
    let data = {
      api: USER_API.MULTI_LIST,
      value: { type: TAB },
    };
    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>", response);
        setEsoccerData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };
  const getBasketBallData = async (TAB: string) => {
    let data = {
      api: USER_API.MULTI_LIST,
      value: { type: TAB },
    };
    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>", response);
        setBasketBallData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };

  const changeTab = (TAB: string) => {
    setTab(TAB);
    // getPageData(TAB)
    if (window.innerWidth > 993) {
      getPageData(TAB);
    } else {
      getCricketData("cricket");
      getSoccerData("soccer");
      getTennisData("tennis");
      if (homeData?.eSoccer === true) getEoccerData("esoccer");
      if (homeData?.basketBall === true) getBasketBallData("basketball");
    }
  };

  const pinClick = (e: any, SUBITEM: PinInterface) => {
    console.log(SUBITEM);
    setDetailsPage({ eventId: SUBITEM.gameId, marketId: SUBITEM.marketId });
    navigate(SUBITEM.gameId + "/" + SUBITEM.marketId);
    sendEvent("GET_SPORTS_DETAILS", {
      eventId: SUBITEM.gameId,
      marketId: SUBITEM.marketId,
      domain: window.location.hostname,
    });
  };

  const BetClick = (
    ITEM:
      | DetailsTableInterface
      | PreMainInterface
      | FancyInterface
      | PreSubInterface,
    TD: string,
    TABLE: string,
    _T4MAIN: any = undefined
  ) => {
    resetBet();
    dispatch({
      type: "GET_SPORTS_LIVE_CALC",
      payload: { calcOntime: false, calcData: {} },
    });
    if (cookies.get("skyTokenFront")) {
      console.log("clicked Table", TD, ITEM);
      setClickedBet(ITEM);
      setClickedTableData(TD);
      setClickedTable(TABLE);
      if (TABLE === "t4" && _T4MAIN) {
        setT4Main(_T4MAIN);
      } else setT4Main({});
    } else {
      if (window.innerWidth > 993) {
        setLoginPopup(true);
      } else {
        window.location.pathname = "/login";
      }
    }
  };

  const resetBet = () => {
    setClickedBet({});
    setClickedTableData("");
    setClickedTable("");
    dispatch({
      type: "GET_SPORTS_LIVE_CALC",
      payload: { calcOntime: false, calcData: {} },
    });
  };
  const OpenCollopsPre = (id: number) => {
    if (openedPre.includes(id)) {
      let openedPreCopy = openedPre;
      openedPreCopy = openedPre.filter((_: number) => _ !== id);
      setOpenedPre(openedPreCopy);
    } else {
      setOpenedPre([...openedPre, id]);
    }
  };
  const getBetTYPE = (TABLE: string) => {
    switch (TABLE) {
      case "t1":
        return "odds";
      case "t2":
        return "bookMark";
      case "t3":
        return "session";
      case "t4":
        return "premium";
      default:
        break;
    }
  };
  const getSecondValue = (FIRST: string) => {
    switch (FIRST) {
      case "b1":
        return "bs1";
      case "b2":
        return "bs2";
      case "b3":
        return "bs3";
      case "l1":
        return "ls1";
      case "l2":
        return "ls2";
      case "l3":
        return "ls3";
      default:
        return "bs1";
    }
  };
  const getBetSide = (TABLE: string, TYPE: string) => {
    let B = ["b1", "b2", "b3"];
    let L = ["l1", "l2", "l3"];
    if (TABLE === "t4") {
      return "back";
    }
    if (TABLE === "t1" || TABLE === "t2") {
      if (B.includes(TYPE)) {
        return "back";
      }
      if (L.includes(TYPE)) {
        return "lay";
      }
    }
    if (TABLE === "t3") {
      return TYPE === "b1" ? "yes" : "no";
    }
  };

  const PlaceBat = async (
    ITEM: any,
    TotalAmount: any,
    SelectedAmount: number,
    TABLE: string,
    TABLE_DATA: string,
    retundData: boolean = false
  ) => {
    console.log("::::::-----I", ITEM);
    console.log("::::::-----P", detailSport);
    let B = ["b1", "b2", "b3"];
    let L = ["l1", "l2", "l3"];
    let WS: any = [];
    if (retundData === false) {
      setPlaceBetLoader(true);
    }

    let filterDataTable =
      TABLE === "t1"
        ? detailSport.page.data.t1
        : TABLE === "t2"
        ? detailSport.page.data.t2
        : TABLE === "t2"
        ? detailSport.page.data.t3
        : detailSport.pre.data.t4;
    if (TABLE === "t1" || TABLE === "t2") {
      filterDataTable.forEach((element: DetailsTableInterface) => {
        WS.push(element.nat);
      });
    }
    if (TABLE === "t3") {
      WS = [ITEM.nat];
    }
    if (TABLE === "t4") {
      t4Main.sub_sb.forEach((element: DetailsTableInterface) => {
        WS.push(element.nat);
      });
    }
    console.log("::::::-----W", WS);
    console.log("::::::-----T", TABLE);
    console.log("::::::-----D", TABLE_DATA, t4Main);
    console.log("::::::-----S", getSecondValue(TABLE_DATA));
    let second = getSecondValue(TABLE_DATA);
    // "odds", "bookMark", "session", "premium"
    let data: any = {
      api: USER_API.PLACE_BET,
      value: {
        type: detailSport.matchInfo.type, // from match info
        matchId: detailSport.matchInfo._id,
        betType: getBetTYPE(TABLE), //t1 ods //t2 bookmaker //t3 session //t4 premium
        betSide: getBetSide(TABLE, TABLE_DATA), // back lay // fancy- yes no // Pre - back
        selection: TABLE === "t4" ? t4Main.marketName : ITEM.nat,
        betPlaced: SelectedAmount,
        stake: SelectedAmount,
        oddsUp: ITEM[TABLE_DATA], // b1
        oddsDown: TABLE === "t4" ? 0 : ITEM[second], //bs1
        profit: parseFloat(TotalAmount), // if l1 ? selecetdAmount  // check
        exposure: L.includes(TABLE_DATA)
          ? parseFloat(TotalAmount)
          : SelectedAmount, // if b1 TotalAmount : selecetdAmount // check
        winnerSelection: WS, //  array or name string
        // subSelection:'' // for t4  only
        sId: TABLE === "t4" ? t4Main?.id : ITEM.sId ? ITEM.sId : "",
        pId: TABLE === "t4" ? ITEM.sId : "",
        // clear amount if match change
        position: TABLE === "t4" ? "" : TABLE_DATA,
        domain: window.location.hostname,
        // fancyYes: joi.number().optional(), //
        // fancyNo: joi.number().optional(), //
        // subSelection: joi.string().allow("").optional(), // use only for premium
      },
    };
    if (TABLE === "t3") {
      data.value.fancyYes = ITEM.b1;
      data.value.fancyNo = ITEM.l1;
    }
    if (TABLE === "t4") {
      data.value.subSelection = ITEM.nat;
    }

    if (retundData) {
      let data1: any = {};
      data1.eventId = eventId ? parseInt(eventId) : eventId;
      data1.marketId = marketId;
      data1.domain = window.location.hostname;
      sendEvent("GET_SPORTS_DETAILS", data1);
      return data.value;
    }

    console.log("placeBet data ::::::-----", data);

    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>PlaceBet", response);
        setPageData(response.data.data);
        setBetdetails(response.data);
        setBetPlacePopup(true);

        // notifyMessage('Bet Placed')
        setPlaceBetLoader(false);
        bethistory();
        setTimeout(() => {
          sendEvent("UPDATE_USER_BALANCE", { userId: HeaderData?._id });
        }, 500);
        setTimeout(() => {
          sendEvent("UPDATE_USER_BALANCE", { userId: HeaderData?._id });
        }, 1500);

        resetBet();
      })
      .catch((err) => {
        console.log("::::::::::>>>>PlaceBet : err", err);
        notifyError(err.response.data.message);
        setPlaceBetLoader(false);
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
    // resetBet()
  };

  const pinMetch = async (e: any, item: PinInterface, type: string) => {
    if (isAuthenticated && cookies.get("skyTokenFront")) {
      let data = {
        api: USER_API.PIN,
        value: {
          sportId: item._id,
          type: type,
          flag: false,
        },
      };

      await postApi(data)
        .then(function (response) {
          getPageData(tab);
          getCricketData("cricket");
          getSoccerData("soccer");
          getTennisData("tennis");
          if (homeData?.eSoccer === true) getEoccerData("esoccer");
          if (homeData?.basketBall === true) getBasketBallData("basketball");
          notifyMessage("Pin Success");
        })
        .catch((err) => {
          console.log(err);
          if (err.response.data.statusCode === 401) {
            Logout();
            notifyError("Pin unsuccess");
            // navigate('/login')
          }
        });
    } else {
      notifyError("please login first");
    }
  };

  const getVideoUrl = async () => {
    console.log("==getVideoUrl=> calling for eventId:", eventId);
    setTimeout(() => {
      if (eventId) {
        sendEvent("GET_SCORE_ID", { gameId: eventId });
      }
    }, 1200);

    // https://multiexch.com/VRN/v1/api/scoreid/get?eventid=(bfeventid)
    // https://multiexch.com/VRN/v1/api/scoreid/get?eventid=32353856
    let data = {
      // api: `https://new.livingstreamvdo.com/?eventId=${eventId}`,
      api: `https://liveapi247.com/api1/livestreaming`,
      value: {
        eventid: eventId,
        // eventid: 31846646
      },
    };

    await postApiLink(data)
      .then(function (response) {
        console.log("::::::::::>>>>api123", response);
        setVideoDetails(response.data[0]);
      })
      .catch((err) => {
        console.log("::::::::::>>>>", err);
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };

  const getchennalIDForVideoUrl = async () => {
    // https://multiexch.com/VRN/v1/api/scoreid/get?eventid=(bfeventid)
    // https://multiexch.com/VRN/v1/api/scoreid/get?eventid=32353856
    let data = {
      // api: `https://new.livingstreamvdo.com/?eventId=${eventId}`,
      api: USER_API.GET_CHANNEL_ID,
      value: {
        gameId: eventId,
        // eventid: 31846646
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("::::::::::>>>>streaminfo", response);
        console.log("::::::::::>>>>streaminfo :: chennalID", chennalID);
        // if(response?.data?.data?.getMatches){
        //    const channelData = response?.data?.data?.getMatches?.find((value:any)=> value.MatchID === marketId);
        //    console.log('::::::::::>>>>streaminfo :: channelData', channelData);
        //    if(channelData){
        setChennalID(response?.data?.data?.ChannelId || "0");

        console.log(
          "::::::::::>>>>streaminfo :: chennalID :: after",
          chennalID
        );
        console.log(
          '::::::::::>>>>streaminfo :: chennalID === "0" :: after',
          chennalID === "0"
        );
        //    }
        // }
        // setVideoDetails(response.data[0])
      })
      .catch((err) => {
        console.log("::::::::::>>>>", err);
        // if (err.response.data.statusCode === 401) {
        // Logout()
        // navigate('/login')
        // }
      });
  };

  const getLiveStreamUrl = async () => {
    try {
      let data = {
        api: USER_API.GET_LIVE_STREAM,
        value: {
          matchId: eventId,
        },
      };

      const response = await postApi(data);
      console.log(":::::::::>>>LiveStream", response);
      const streamData = response?.data?.data?.liveStream;
      if (streamData) {
        // The API may return different response shapes:
        // 1. { url: "..." } or { iframe: "..." } or { streamUrl: "..." }
        // 2. { ip: "...", data: "..." } where data contains iframe HTML or a URL
        // 3. A string URL directly
        let streamUrl = "";
        
        if (typeof streamData === "string") {
          streamUrl = streamData;
        } else {
          streamUrl = streamData?.ip || streamData?.url || streamData?.iframe || streamData?.streamUrl || streamData?.src || streamData?.data || "";
          
          // If data contains HTML with an iframe, extract the src
          if (streamUrl && streamUrl.includes("<iframe")) {
            const srcMatch = streamUrl.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
              streamUrl = srcMatch[1];
            }
          }
        }
        
        if (streamUrl) {
          console.log(":::::::::>>>LiveStream URL set:", streamUrl);
          setLiveStreamUrl(streamUrl);
        }
      }
    } catch (err: any) {
      console.log("getLiveStreamUrl error:", err?.message);
    }
  };

  const closePositonPopup = () => {
    setPositonModal(false);
    setPremiumPopup(false);
    setFancyPopup(false);
  };
  useEffect(() => {
    if (cookies.get("skyTokenFront")) {
      bethistory();
    }
    dispatch({ type: "LIVE_TV", payload: false });
  }, []);

  const bethistory = async () => {
    let data = {
      api: USER_API.BET_LIST,
      value: {},
    };

    await postApi(data)
      .then(function (response) {
        // setPageData(response.data.data)
        dispatch({ type: "USER_BET_HISTORY", payload: response.data.data });
        setHistorySuccess(true);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };

  const onBookClick = (ITEM: any, HISTORY: any) => {
    let filterHistory = BET_HISTORY.filter(
      (_: any) => _.selection === ITEM.nat
    );
    let popupdata = bookExposerGetPopup(filterHistory);
    let data = [
      { main: HISTORY.oddsUp - 1, second: -10 },
      { main: HISTORY.oddsUp, second: 10 },
      { main: HISTORY.oddsUp + 1, second: 10 },
    ];
    setPositonDetails(popupdata);
    setPositonModal(true);
  };

  const setOpenTvFlag = () => {
    console.log("set flag : ", MY_TV_FLAG);

    dispatch({ type: "LIVE_TV", payload: !MY_TV_FLAG });
    setopenLive(!MY_TV_FLAG);
    console.log("MY_TV_FLAG :: 11 :: ", MY_TV_FLAG);
  };

const [sparkOddsBackDetail, setSparkOddsBackDetail] = useState(0);
const [sparkOddsLayDetail, setSparkOddsLayDetail] = useState(1);
const [sparkBookBackDetail, setSparkBookBackDetail] = useState(1);
const [sparkBookLayDetail, setSparkBookLayDetail] = useState(0);
const randomeNumber = () => Math.floor((Math.random()*2));
useEffect(()=>{
  setInterval(()=>{

    console.log("sparkDetail :: ", sparkOddsBackDetail);
    
    setSparkOddsBackDetail(randomeNumber())
    setSparkOddsLayDetail(randomeNumber())
    setSparkBookBackDetail(randomeNumber())
    setSparkBookLayDetail(randomeNumber())
    setTimeout(()=>{
      setSparkOddsBackDetail(-1)
      setSparkOddsLayDetail(-1)
      setSparkBookBackDetail(-1)
      setSparkBookLayDetail(-1)
    },1000)
  }, 5000)
},[])

const [scrollPosition, setScrollPosition] = useState("");
  const handleScroll = () => {
      
      const position1 = window.scrollY || document.documentElement.scrollTop;; // Get current scroll position
      
      console.log("start s: hhh1: ", position1);
      // Check if the scroll position is greater than or equal to 500px
      if (position1 >= 120) {
        console.log("start s: You have scrolled 500px or more");
        setScrollPosition("stuck");
        // Add any action you want here
      }else{
        setScrollPosition("");
      }
 
  };

// setInterval(() => console.log("start s: ScrollY:", window.scrollY), 1000);
  useEffect(() => {
    
    
    console.log("start s: init");
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup the event listener on component unmount
    return () => {
      console.log("start s: remove");
      window.removeEventListener('scroll', handleScroll);
    };
    }, []);
     // State to store the position of the div
  const [position, setPosition] = useState({ left: 100, top: 100 });

  // Reference for the div element
  const divRef = useRef<HTMLDivElement>(null);
  // const divRef = useRef<HTMLIFrameElement>(null);

  // Mouse and touch event states
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Function to get the clientX and clientY from either mouse or touch events
  const getClientCoords = (e: any) => {
    if (e.touches) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }; // For touch events
    } else {
      return { x: e.clientX, y: e.clientY }; // For mouse events
    }
  };

  // Handle mouse or touch start (start dragging)
  const handleStart = (e: any) => {
    console.log("move : handleStart :");
    
    e.preventDefault(); // Prevent default behavior (especially on touch)
    setIsDragging(true);

    const { x, y } = getClientCoords(e);
    if(divRef && divRef.current){
      console.log("move : handleStart : { x, y }: ", { x, y });
      const divRect = divRef.current.getBoundingClientRect();
      setOffset({
        x: x - divRect.left,
        y: y - divRect.top,
      });
    }
  };

  // Handle mouse or touch move (while dragging)
  const handleMove = (e: any) => {
    console.log("move: handleMove: ", isDragging);
    
    if (!isDragging) return;

    const { x, y } = getClientCoords(e);
    setPosition({
      left: x - offset.x,
      top: y - offset.y,
    });
  };

  // Handle mouse or touch end (stop dragging)
  const handleEnd = () => {
    setIsDragging(false);
  };

  // Attach event listeners for both mouse and touch events
  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);

      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, offset]);

  return (
    <>
      {/* <div className='loader_top betloader'>
            <Loader />
         </div> */}
      {/* <div className='loader_top loader_overlay'>
                                    <div className=''>
                                       <Loader />
                                    </div>
                                 </div> */}
      {placeBetLoader && (
        <div className="loader_top loader_overlay">
          <Loader />
        </div>
      )}
      <div className="multimarket">
        <div className="row">
          {/* {side menu of sport} */}
          <QuickSport />
          <>
            <div className="multimarket_center">
              {!detailsPage.eventId && !detailsPage.marketId ? (
                
                <>
                  {/* multimarket screen  */}
                  {/* {isAuthenticated && cookies.get('skyTokenFront') ? <></> : <div>
                                    <h1>Multi Markets</h1>
                                    <p>There are currently no followed multi markets.</p>
                                </div>} */}
                  {cookies.get("skyTokenFront") ? (
                    <>
                      <NewsLine />
                      <div className="cricket_wrap_main">
                        <div className="cricket_wrap">
                          {window.innerWidth > 992 ? (
                            <>
                              <div className="cricket_img">
                                <img src="./images/soccer.jpg" alt="" />
                              </div>
                              <h3
                                style={styleObjectGetBG(
                                  DD?.colorSchema,
                                  false,
                                  true
                                )}
                                className="yellow-bg2 text-color-black2 highligths-txt"
                              >
                                Highlights
                              </h3>

                              <div className="inplay_table mt-3">
                                <div className="table-responsive">
                                  <ul className="nav nav-tabs mb-2" id="myTab">
                                    <li
                                      className="nav-item"
                                      onClick={(e) => changeTab("cricket")}
                                    >
                                      {" "}
                                      <button
                                        className={`${
                                          tab === "cricket" ? "active" : ""
                                        } nav-link`}
                                        id="home-tab"
                                      >
                                        Cricket{" "}
                                      </button>{" "}
                                    </li>
                                    <li
                                      className="nav-item"
                                      onClick={(e) => changeTab("soccer")}
                                    >
                                      {" "}
                                      <button
                                        className={`${
                                          tab === "soccer" ? "active" : ""
                                        } nav-link`}
                                        id="profile-tab"
                                      >
                                        Soccer{" "}
                                      </button>{" "}
                                    </li>
                                    <li
                                      className="nav-item"
                                      onClick={(e) => changeTab("tennis")}
                                    >
                                      {" "}
                                      <button
                                        className={`${
                                          tab === "tennis" ? "active" : ""
                                        } nav-link`}
                                        id="contact-tab"
                                      >
                                        Tennis{" "}
                                      </button>{" "}
                                    </li>
                                  </ul>
                                  <div className="tab-content">
                                    <div className="tab-pane">
                                      <div className="accordian">
                                        <div className="accordian_item">
                                          <h2
                                            className={`accordian_item_header  ${
                                              openAccordian ? "active" : ""
                                            }`}
                                            onClick={() =>
                                              setopenAccordian(!openAccordian)
                                            }
                                          >
                                            <button
                                              className="accordion-button p-2 bg_secondary text-white shadow-none"
                                              type="button"
                                              data-bs-toggle="collapse"
                                              data-bs-target="#panelsStayOpen-collapseOne"
                                              aria-expanded="true"
                                              aria-controls="panelsStayOpen-collapseOne"
                                            >
                                              Match Bets
                                            </button>
                                          </h2>
                                          <div
                                            className={`accordian_item_body ${
                                              openAccordian ? "open" : ""
                                            }`}
                                          >
                                            <div className="inplay_table">
                                              <div className="table-responsive">
                                                <table>
                                                  <thead>
                                                    <tr>
                                                      <th></th>
                                                      <th></th>
                                                      <th></th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {pageData &&
                                                    pageData?.list?.length >
                                                      0 ? (
                                                      pageData?.list?.map(
                                                        (
                                                          item: ListInterface
                                                        ) => {
                                                          return (
                                                            <>
                                                              {item?.pin
                                                                ?.length > 0 ? (
                                                                item?.pin.map(
                                                                  (
                                                                    subItem: PinInterface
                                                                  ) => (
                                                                    <tr>
                                                                      <td>
                                                                        <a
                                                                          onClick={(
                                                                            e
                                                                          ) =>
                                                                            pinClick(
                                                                              e,
                                                                              subItem
                                                                            )
                                                                          }
                                                                          className="heading_title in-play"
                                                                        >
                                                                          {
                                                                            subItem.name
                                                                          }
                                                                        </a>
                                                                        <span className="inplay_text">
                                                                          {
                                                                            subItem.openDate
                                                                          }
                                                                        </span>
                                                                      </td>
                                                                      <td>
                                                                        <a
                                                                          data-id="31886422"
                                                                          onClick={(
                                                                            e
                                                                          ) =>
                                                                            pinMetch(
                                                                              e,
                                                                              subItem,
                                                                              tab
                                                                            )
                                                                          }
                                                                          className="pin_icon cursor-pointer selected"
                                                                        ></a>
                                                                      </td>
                                                                    </tr>
                                                                  )
                                                                )
                                                              ) : (
                                                                <>
                                                                  <tr>
                                                                    <td
                                                                      colSpan={
                                                                        5
                                                                      }
                                                                    >
                                                                      {" "}
                                                                      There are
                                                                      currently
                                                                      no
                                                                      followed
                                                                      multi
                                                                      markets.{" "}
                                                                    </td>
                                                                  </tr>
                                                                </>
                                                              )}
                                                            </>
                                                          );
                                                        }
                                                      )
                                                    ) : (
                                                      <tr>
                                                        <td colSpan={5}>
                                                          {" "}
                                                          There are currently no
                                                          followed multi
                                                          markets.{" "}
                                                        </td>
                                                      </tr>
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {cricketData?.list?.length &&
                                stableSort(
                                  cricketData?.list[0]?.pin,
                                  getComparator("asc", "sortPriority")
                                )?.map((item: PinInterface) => {
                                  return (
                                    <div className="game-main">
                                      <div className="game-main-wrap multi">
                                        <h4 id="gameInfo" className="game-info">
                                          {cricketData?.list[0].type}
                                          <ul
                                            id="infoIcon"
                                            className="info-icon"
                                          >
                                            <li id="inPlayIcon">
                                              <span className="info-inplay" />
                                              In-Play
                                            </li>
                                          </ul>
                                        </h4>
                                        <table
                                          id="gameTeam"
                                          className="game-team"
                                        >
                                          <tbody>
                                            <tr>
                                              <th>
                                                <a
                                                  id="multiMarketPin"
                                                  className="pin-on"
                                                  href="#"
                                                  title="Remove from Multi Markets"
                                                  onClick={(e) =>
                                                    pinMetch(
                                                      e,
                                                      item,
                                                      cricketData?.list[0].type
                                                    )
                                                  }
                                                ></a>
                                                <h4 id="eventName">
                                                  {item.name}
                                                </h4>
                                              </th>
                                              <td
                                                className="team-multi_Go"
                                                onClick={(e) =>
                                                  pinClick(e, item)
                                                }
                                              >
                                                <a
                                                  id="goToFullMarket"
                                                  className="multi-Go"
                                                  href=""
                                                ></a>
                                              </td>
                                              <td className="team-refresh">
                                                <a
                                                  id="refresh"
                                                  className="refresh"
                                                  href="#"
                                                ></a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="inplay-tableblock odds-table-section table-responsive first">
                                        <div
                                          id="marketBetsWrap"
                                          className="bets-wrap asiahadicap"
                                        >
                                          <a
                                            id="minMaxButton"
                                            className="bet-limit"
                                            // onClick={() => setoddMinMaxpopup(!oddMinMaxpopup)}
                                          >
                                            <div
                                              className={` odds_info-popup ${
                                                oddMinMaxpopup ? "active" : ""
                                              }`}
                                              id="fancy_popup_LUNCH_FAVOURITE"
                                            >
                                              {" "}
                                            </div>
                                          </a>

                                          <dl
                                            id="betsHead"
                                            className="bets-selections-head"
                                          >
                                            <dt>
                                              <a
                                                className="a-depth"
                                                onClick={() =>
                                                  setMarketPopup(true)
                                                }
                                                id="marketDepthBtn"
                                              >
                                                Markets Depth
                                              </a>
                                              <p>
                                                <span>Matched</span>
                                                <strong id="totalMatched">
                                                {DD?.currency
                                                  ? `${DD?.currency} `
                                                  : "PTH "}
                                                  {
                                                    detailSport?.page?.data
                                                      ?.t1[0]?.totalmatch
                                                  }
                                                </strong>
                                              </p>
                                            </dt>
                                            <dd>Back </dd>
                                            <dd>Lay </dd>
                                          </dl>
                                        </div>

                                        <table className="table custom-table inplay-table w1-table">
                                          <tbody>
                                            <tr className="betstr">
                                              <td className="text-color-grey opacity-1">
                                                <span className="totselection seldisplay">
                                                  2 Selections
                                                </span>
                                              </td>
                                              <td colSpan={2}>101.7%</td>
                                              <td>
                                                <span>Back</span>
                                              </td>{" "}
                                              <td>
                                                <span>Lay</span>
                                              </td>
                                              <td colSpan={2}>97.9%</td>
                                            </tr>

                                            {console.log(
                                              "cricketData?.list?.length",
                                              cricketData?.list?.length,
                                              cricketData?.list
                                            )}

                                            {cricketData?.list[0]?.pin.length &&
                                              stableSort(
                                                cricketData?.list[0]?.pin[0]
                                                  ?.t1,
                                                getComparator(
                                                  "asc",
                                                  "sortPriority"
                                                )
                                              ).map(
                                                (
                                                  subItem: DetailsTableInterface
                                                ) => {
                                                  return (
                                                    <>
                                                      <tr className="bg-white tr-odds tr_team1">
                                                        <td>
                                                          {/* <img src="../../../images/bars.png" /> */}
                                                          <b className="team1">
                                                            {subItem.nat}
                                                          </b>
                                                          <div>
                                                            {subItem.betProfit && (
                                                              <span
                                                                className={` ${
                                                                  subItem.betProfit <
                                                                  0
                                                                    ? "to-lose"
                                                                    : "to-win"
                                                                } team_bet_count_old `}
                                                              >
                                                                <span
                                                                  className={` ${
                                                                    subItem.betProfit <
                                                                    0
                                                                      ? "text-danger"
                                                                      : "text-green"
                                                                  } team_total`}
                                                                >
                                                                  (
                                                                  {subItem?.betProfit &&
                                                                  cookies.get(
                                                                    "skyTokenFront"
                                                                  )
                                                                    ? parseFloat(
                                                                        subItem.betProfit
                                                                      )?.toFixed(
                                                                        2
                                                                      )
                                                                    : 0}
                                                                  )
                                                                </span>
                                                              </span>
                                                            )}
                                                          </div>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b3",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b3"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled  light-blue-bg-2 opnForm ODDSBack td_team1_back_2`}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b3} <br />
                                                            <span>
                                                              {subItem.bs3}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b2",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b2"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled  light-blue-bg-3 ODDSBack td_team1_back_1`}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b2} <br />
                                                            <span>
                                                              {subItem.bs2}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b1",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b1"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled  cyan-bg ODDSBack td_team1_back_0`}
                                                          style={{
                                                            paddingTop: "20px",
                                                          }}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b1} <br />
                                                            <span>
                                                              {subItem.bs1}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l1",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l1"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled  pink-bg ODDSLay td_team1_lay_0`}
                                                          style={{
                                                            paddingTop: "20px",
                                                          }}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l1} <br />
                                                            <span>
                                                              {subItem.ls1}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l2",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l2"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled  light-pink-bg-2 ODDSLay td_team1_lay_1`}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l2} <br />
                                                            <span>
                                                              {subItem.ls2}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l3",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l3"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled  light-pink-bg-3 ODDSLay td_team1_lay_2`}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l3} <br />
                                                            <span>
                                                              {subItem.ls3}
                                                            </span>
                                                          </a>
                                                        </td>
                                                      </tr>
                                                      {/* {true && ( */}
                                                      {subItem.status ===
                                                        "SUSPEND" && (
                                                        <tr className="fancy-suspend-tr collapse">
                                                          <th colSpan={0}> </th>
                                                          <td
                                                            colSpan={6}
                                                            className="fancy-suspend-td"
                                                          >
                                                            <div className="suspend-white">
                                                              <span>
                                                                Suspend
                                                              </span>
                                                            </div>
                                                          </td>
                                                          {/* <td colSpan={0} className="refer-book"></td> */}
                                                        </tr>
                                                      )}
                                                      {/* {clickedBet?.sId === subItem.sId && window.innerWidth < 993 && <BetBox resetClicked={resetBet} placeBetClicked={PlaceBat} clickedBet={clickedBet} clickedTable={clickedTable} clickedTableData={clickedTableData} isMobile={true} setPlaceBetLoader={setPlaceBetLoader} />} */}
                                                    </>
                                                  );
                                                }
                                              )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  );
                                })}

                              {soccerData?.list?.length &&
                                stableSort(
                                  soccerData?.list[0]?.pin,
                                  getComparator("asc", "sortPriority")
                                )?.map((item: PinInterface) => {
                                  return (
                                    <div className="game-main">
                                      <div className="game-main-wrap multi">
                                        <h4 id="gameInfo" className="game-info">
                                          {soccerData?.list[0].type}
                                          <ul
                                            id="infoIcon"
                                            className="info-icon"
                                          >
                                            <li id="inPlayIcon">
                                              <span className="info-inplay" />
                                              In-Play
                                            </li>
                                          </ul>
                                        </h4>
                                        <table
                                          id="gameTeam"
                                          className="game-team"
                                        >
                                          <tbody>
                                            <tr>
                                              <th>
                                                <a
                                                  id="multiMarketPin"
                                                  className="pin-on"
                                                  href="#"
                                                  title="Remove from Multi Markets"
                                                  onClick={(e) =>
                                                    pinMetch(
                                                      e,
                                                      item,
                                                      soccerData?.list[0].type
                                                    )
                                                  }
                                                ></a>
                                                <h4 id="eventName">
                                                  {item.name}
                                                </h4>
                                              </th>
                                              <td className="team-multi_Go">
                                                <a
                                                  id="goToFullMarket"
                                                  className="multi-Go"
                                                  href=""
                                                ></a>
                                              </td>
                                              <td className="team-refresh">
                                                <a
                                                  id="refresh"
                                                  className="refresh"
                                                  href="#"
                                                ></a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="inplay-tableblock odds-table-section table-responsive first">
                                        <div
                                          id="marketBetsWrap"
                                          className="bets-wrap asiahadicap"
                                        >
                                          <a
                                            id="minMaxButton"
                                            className="bet-limit"
                                            // onClick={() => setoddMinMaxpopup(!oddMinMaxpopup)}
                                          >
                                            <div
                                              className={` odds_info-popup ${
                                                oddMinMaxpopup ? "active" : ""
                                              }`}
                                              id="fancy_popup_LUNCH_FAVOURITE"
                                            >
                                              {" "}
                                            </div>
                                          </a>

                                          <dl
                                            id="betsHead"
                                            className="bets-selections-head"
                                          >
                                            <dt>
                                              <a
                                                className="a-depth"
                                                onClick={() =>
                                                  setMarketPopup(true)
                                                }
                                                id="marketDepthBtn"
                                              >
                                                Markets Depth
                                              </a>
                                              <p>
                                                <span>Matched</span>
                                                <strong id="totalMatched">
                                                  PKU
                                                  {
                                                    detailSport?.page?.data
                                                      ?.t1[0]?.totalmatch
                                                  }
                                                </strong>
                                              </p>
                                            </dt>
                                            <dd>Back </dd>
                                            <dd>Lay </dd>
                                          </dl>
                                        </div>

                                        <table className="table custom-table inplay-table w1-table">
                                          <tbody>
                                            <tr className="betstr">
                                              <td className="text-color-grey opacity-1">
                                                <span className="totselection seldisplay">
                                                  2 Selections
                                                </span>
                                              </td>
                                              <td colSpan={2}>101.7%</td>
                                              <td>
                                                <span>Back</span>
                                              </td>{" "}
                                              <td>
                                                <span>Lay</span>
                                              </td>
                                              <td colSpan={2}>97.9%</td>
                                            </tr>

                                            {soccerData?.list[0]?.pin.length &&
                                              stableSort(
                                                soccerData?.list[0]?.pin[0]?.t1,
                                                getComparator(
                                                  "asc",
                                                  "sortPriority"
                                                )
                                              ).map(
                                                (
                                                  subItem: DetailsTableInterface
                                                ) => {
                                                  return (
                                                    <>
                                                      <tr className="bg-white tr-odds tr_team1">
                                                        <td>
                                                          {/* <img src="../../../images/bars.png" /> */}
                                                          <b className="team1">
                                                            {subItem.nat}
                                                          </b>
                                                          <div>
                                                            {subItem.betProfit && (
                                                              <span
                                                                className={` ${
                                                                  subItem.betProfit <
                                                                  0
                                                                    ? "to-lose"
                                                                    : "to-win"
                                                                } team_bet_count_old `}
                                                              >
                                                                <span
                                                                  className={` ${
                                                                    subItem.betProfit <
                                                                    0
                                                                      ? "text-danger"
                                                                      : "text-green"
                                                                  } team_total`}
                                                                >
                                                                  (
                                                                  {subItem?.betProfit &&
                                                                  cookies.get(
                                                                    "skyTokenFront"
                                                                  )
                                                                    ? parseFloat(
                                                                        subItem.betProfit
                                                                      )?.toFixed(
                                                                        2
                                                                      )
                                                                    : 0}
                                                                  )
                                                                </span>
                                                              </span>
                                                            )}
                                                          </div>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b3",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b3"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled light-blue-bg-2 opnForm ODDSBack td_team1_back_2`}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b3}{" "}
                                                            {subItem.bs3 !==
                                                              0 && (
                                                              <>
                                                                <br />
                                                                <span>
                                                                  {subItem.bs3}
                                                                </span>{" "}
                                                              </>
                                                            )}
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b2",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b2"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled light-blue-bg-3 ODDSBack td_team1_back_1`}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b2} <br />
                                                            <span>
                                                              {subItem.bs2}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b1",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b1"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled cyan-bg ODDSBack td_team1_back_0`}
                                                          style={{
                                                            paddingTop: "20px",
                                                          }}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b1} <br />
                                                            <span>
                                                              {subItem.bs1}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l1",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l1"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled pink-bg ODDSLay td_team1_lay_0`}
                                                          style={{
                                                            paddingTop: "20px",
                                                          }}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l1} <br />
                                                            <span>
                                                              {subItem.ls1}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l2",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l2"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled light-pink-bg-2 ODDSLay td_team1_lay_1`}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l2} <br />
                                                            <span>
                                                              {subItem.ls2}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l3",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l3"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled light-pink-bg-3 ODDSLay td_team1_lay_2`}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l3} <br />
                                                            <span>
                                                              {subItem.ls3}
                                                            </span>
                                                          </a>
                                                        </td>
                                                      </tr>
                                                      {/* {true && ( */}
                                                      {subItem.status ===
                                                        "SUSPEND" && (
                                                        <tr className="fancy-suspend-tr collapse">
                                                          <th colSpan={0}> </th>
                                                          <td
                                                            colSpan={6}
                                                            className="fancy-suspend-td"
                                                          >
                                                            <div className="suspend-white">
                                                              <span>
                                                                Suspend
                                                              </span>
                                                            </div>
                                                          </td>
                                                          {/* <td colSpan={0} className="refer-book"></td> */}
                                                        </tr>
                                                      )}
                                                      {/* {clickedBet?.sId === subItem.sId && window.innerWidth < 993 && <BetBox resetClicked={resetBet} placeBetClicked={PlaceBat} clickedBet={clickedBet} clickedTable={clickedTable} clickedTableData={clickedTableData} isMobile={true} setPlaceBetLoader={setPlaceBetLoader} />} */}
                                                    </>
                                                  );
                                                }
                                              )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  );
                                })}
                              {console.log("tenisData?.list", tenisData?.list)}
                              {tenisData?.list?.length > 0 &&
                                stableSort(
                                  tenisData?.list[0]?.pin,
                                  getComparator("asc", "sortPriority")
                                )?.map((item: PinInterface) => {
                                  return (
                                    <div className="game-main">
                                      <div className="game-main-wrap multi">
                                        <h4 id="gameInfo" className="game-info">
                                          {tenisData?.list[0].type}
                                          <ul
                                            id="infoIcon"
                                            className="info-icon"
                                          >
                                            <li id="inPlayIcon">
                                              <span className="info-inplay" />
                                              In-Play
                                            </li>
                                          </ul>
                                        </h4>
                                        <table
                                          id="gameTeam"
                                          className="game-team"
                                        >
                                          <tbody>
                                            <tr>
                                              <th>
                                                <a
                                                  id="multiMarketPin"
                                                  className="pin-on"
                                                  href="#"
                                                  title="Remove from Multi Markets"
                                                  onClick={(e) =>
                                                    pinMetch(
                                                      e,
                                                      item,
                                                      tenisData?.list[0].type
                                                    )
                                                  }
                                                ></a>
                                                <h4 id="eventName">
                                                  {item.name}
                                                </h4>
                                              </th>
                                              <td className="team-multi_Go">
                                                <a
                                                  id="goToFullMarket"
                                                  className="multi-Go"
                                                  href=""
                                                ></a>
                                              </td>
                                              <td className="team-refresh">
                                                <a
                                                  id="refresh"
                                                  className="refresh"
                                                  href="#"
                                                ></a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="inplay-tableblock odds-table-section table-responsive first">
                                        <div
                                          id="marketBetsWrap"
                                          className="bets-wrap asiahadicap"
                                        >
                                          <a
                                            id="minMaxButton"
                                            className="bet-limit"
                                          >
                                            <div
                                              className={` odds_info-popup ${
                                                oddMinMaxpopup ? "active" : ""
                                              }`}
                                              id="fancy_popup_LUNCH_FAVOURITE"
                                            >
                                              {" "}
                                            </div>
                                          </a>

                                          <dl
                                            id="betsHead"
                                            className="bets-selections-head"
                                          >
                                            <dt>
                                              <a
                                                className="a-depth"
                                                onClick={() =>
                                                  setMarketPopup(true)
                                                }
                                                id="marketDepthBtn"
                                              >
                                                Markets Depth
                                              </a>
                                              <p>
                                                <span>Matched</span>
                                                <strong id="totalMatched">
                                                {DD?.currency
                                                  ? `${DD?.currency} `
                                                  : "PTH "}
                                                  {
                                                    detailSport?.page?.data
                                                      ?.t1[0]?.totalmatch
                                                  }
                                                </strong>
                                              </p>
                                            </dt>
                                            <dd>Back </dd>
                                            <dd>Lay </dd>
                                          </dl>
                                        </div>

                                        <table className="table custom-table inplay-table w1-table">
                                          <tbody>
                                            <tr className="betstr">
                                              <td className="text-color-grey opacity-1">
                                                <span className="totselection seldisplay">
                                                  2 Selections
                                                </span>
                                              </td>
                                              <td colSpan={2}>101.7%</td>
                                              <td>
                                                <span>Back</span>
                                              </td>{" "}
                                              <td>
                                                <span>Lay</span>
                                              </td>
                                              <td colSpan={2}>97.9%</td>
                                            </tr>

                                            {tenisData?.list[0]?.pin.length &&
                                              stableSort(
                                                tenisData?.list[0]?.pin[0]?.t1,
                                                getComparator(
                                                  "asc",
                                                  "sortPriority"
                                                )
                                              ).map(
                                                (
                                                  subItem: DetailsTableInterface
                                                ) => {
                                                  return (
                                                    <>
                                                      <tr className="bg-white tr-odds tr_team1">
                                                        <td>
                                                          {/* <img src="../../../images/bars.png" /> */}
                                                          <b className="team1">
                                                            {subItem.nat}
                                                          </b>
                                                          <div>
                                                            {subItem.betProfit && (
                                                              <span
                                                                className={` ${
                                                                  subItem.betProfit <
                                                                  0
                                                                    ? "to-lose"
                                                                    : "to-win"
                                                                } team_bet_count_old `}
                                                              >
                                                                <span
                                                                  className={` ${
                                                                    subItem.betProfit <
                                                                    0
                                                                      ? "text-danger"
                                                                      : "text-green"
                                                                  } team_total`}
                                                                >
                                                                  (
                                                                  {subItem?.betProfit &&
                                                                  cookies.get(
                                                                    "skyTokenFront"
                                                                  )
                                                                    ? parseFloat(
                                                                        subItem.betProfit
                                                                      )?.toFixed(
                                                                        2
                                                                      )
                                                                    : 0}
                                                                  )
                                                                </span>
                                                              </span>
                                                            )}
                                                          </div>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b3",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b3"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled light-blue-bg-2 opnForm ODDSBack td_team1_back_2`}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b3} <br />
                                                            <span>
                                                              {subItem.bs3}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b2",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b2"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled light-blue-bg-3 ODDSBack td_team1_back_1`}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b2} <br />
                                                            <span>
                                                              {subItem.bs2}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "b1",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "b1"
                                                              ? "table-active"
                                                              : ""
                                                          } disabled cyan-bg ODDSBack td_team1_back_0`}
                                                          style={{
                                                            paddingTop: "20px",
                                                          }}
                                                        >
                                                          <a className="back1btn text-color-black">
                                                            {" "}
                                                            {subItem.b1} <br />
                                                            <span>
                                                              {subItem.bs1}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l1",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l1"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled pink-bg ODDSLay td_team1_lay_0`}
                                                          style={{
                                                            paddingTop: "20px",
                                                          }}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l1} <br />
                                                            <span>
                                                              {subItem.ls1}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l2",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l2"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled light-pink-bg-2 ODDSLay td_team1_lay_1`}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l2} <br />
                                                            <span>
                                                              {subItem.ls2}
                                                            </span>
                                                          </a>
                                                        </td>
                                                        <td
                                                          onClick={() =>
                                                            BetClick(
                                                              subItem,
                                                              "l3",
                                                              "t1"
                                                            )
                                                          }
                                                          className={`${
                                                            clickedBet?.sId ===
                                                              subItem.sId &&
                                                            clickedTableData ===
                                                              "l3"
                                                              ? "table-active-red"
                                                              : ""
                                                          } disabled light-pink-bg-3 ODDSLay td_team1_lay_2`}
                                                        >
                                                          <a className="lay1btn text-color-black">
                                                            {" "}
                                                            {subItem.l3} <br />
                                                            <span>
                                                              {subItem.ls3}
                                                            </span>
                                                          </a>
                                                        </td>
                                                      </tr>
                                                      {/* {true && ( */}
                                                      {subItem.status ===
                                                        "SUSPEND" && (
                                                        <tr className="fancy-suspend-tr collapse">
                                                          <th colSpan={0}> </th>
                                                          <td
                                                            colSpan={6}
                                                            className="fancy-suspend-td"
                                                          >
                                                            <div className="suspend-white">
                                                              <span>
                                                                Suspend
                                                              </span>
                                                            </div>
                                                          </td>
                                                          {/* <td colSpan={0} className="refer-book"></td> */}
                                                        </tr>
                                                      )}
                                                      {/* {clickedBet?.sId === subItem.sId && window.innerWidth < 993 && <BetBox resetClicked={resetBet} placeBetClicked={PlaceBat} clickedBet={clickedBet} clickedTable={clickedTable} clickedTableData={clickedTableData} isMobile={true} setPlaceBetLoader={setPlaceBetLoader} />} */}
                                                    </>
                                                  );
                                                }
                                              )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  );
                                })}

                              {!(
                                cricketData?.list[0]?.pin.length ||
                                soccerData?.list[0]?.pin.length ||
                                tenisData?.list[0]?.pin.length
                              ) ? (
                                <>
                                  <div id="noMultiMarkets" className="no-data">
                                    <h3>
                                      There are currently no followed multi
                                      markets.
                                    </h3>
                                    <p>Please add some markets from events.</p>
                                  </div>
                                </>
                              ) : (
                                ""
                              )}

                              {/* //end milan */}
                            </>
                          )}
                          {/* <Footer /> */}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div id="noMultiMarkets" className="no-data">
                        <h3>There are currently no followed multi markets.</h3>
                        <p>Please add some markets from events.</p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                {/* sport Data Page */}
                {cookies.get("skyTokenFront") && <NewsLine />}
                
                  <div className="live_data">
                  <div className="game">
                        <div className="game-main">
                          <div className="game-main-wrap">
                            <h4 id="gameInfo" className="game-info">
                              {sportDetail?.type || "Cricket"}
                              <ul id="infoIcon" className="info-icon">
                                {
                                // moment().isSameOrAfter(
                                //   moment(detailSport?.matchInfo?.openDate)
                                // ) &&
                                //   detailSport?.matchInfo?.winner === "" 
                                sportDetail?.inPlay
                                  && (
                                    <li id="inPlayIcon">
                                      <div className="imgdiv info-inplay" />
                                      In-Play
                                    </li>
                                  )}
                                <li style={{ display: "none" }}>
                                  <div className="imgdiv info-cashout" />
                                  Cash Out
                                </li>
                                <li
                                  id="fancyBetIcon"
                                  style={{ display: "none" }}
                                >
                                  <span className="game-fancy">Fancy</span>
                                </li>
                                <li
                                  id="bookMakerIcon"
                                  style={{ display: "none" }}
                                >
                                  <span className="game-bookmaker">
                                    BookMaker
                                  </span>
                                </li>
                                <li
                                  id="feedingSiteIcon"
                                  style={{ display: "none" }}
                                >
                                  <span className="game-sportsbook">
                                    Sportsbook
                                  </span>
                                </li>
                                <li>
                                  <span
                                    id="lowLiquidityTag"
                                    className="game-low_liq"
                                    style={{ display: "none" }}
                                  >
                                    Low
                                  </span>
                                </li>
                              </ul>
                            </h4>
                            { !cookies.get("skyTokenFront") && 
                              <table id="gameTeam" className="game-team">
                              <tbody>
                                <tr>
                                  <th>
                                    <a
                                      id="multiMarketPin"
                                      className="pin-off"
                                      href="#"
                                      title="Add to Multi Markets"
                                      onClick={(e) =>
                                        pinMetch(
                                          e,
                                          detailSport?.matchInfo,
                                          detailSport?.matchInfo?.type
                                        )
                                      }
                                    ></a>
                                    <h4 id="teamHome">
                                      {
                                        detailSport?.matchInfo?.name.split(
                                          " v "
                                        )[0]
                                      }{" "}
                                      <br />
                                      {
                                        detailSport?.matchInfo?.name.split(
                                          " v "
                                        )[1]
                                      }
                                    </h4>
                                    {/* <h4 id="teamAway">Royal Challengers Bangalore SRL T20</h4> */}
                                    <ul id="time" className="scores-time">
                                      <li>
                                        {detailSport?.matchInfo?.openDate}
                                      </li>
                                    </ul>
                                  </th>
                                  <td className="team-refresh">
                                    <a
                                      id="refresh"
                                      className="refresh"
                                      href="#"
                                      onClick={() => window.location.reload()}
                                    ></a>
                                  </td>
                                </tr>
                              </tbody>
                              </table>
                            }
                          </div>
                        </div>
                      </div>
                    {cookies.get("skyTokenFront") ? (
                

                      // <div className='live-tv-section'>
                      //    <div className='accordian'>
                      //       <div className='accordian_item'>
                      //          <h2 className={`accordian_item_header  ${MY_TV_FLAG ? 'active' : ''}`} onClick={() => setOpenTvFlag()}>
                      //             <button className="accordion-button p-2 bg_secondary text-white shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                      //                LIVE TV
                      //             </button>
                      //          </h2>
                      //          <div className={`iframe_container accordian_item_body ${MY_TV_FLAG ? 'open' : ''}`} >
                      //             {/* <iframe className='responsive-iframe' id='Iframe' src={`https://startv247.live/play/${eventId}/?security=off https://new.livingstreamvdo.com/?eventId=${eventId}`} width="100%"></iframe> */}
                      //             {/* <iframe className='responsive-iframe' id='Iframe' src={`https://mediasrv789-ss247-23-prod-sa-ulivestreaming.com/${Number(chennalID)}/index.m3u8`} width="100%"></iframe> */}
                      //             {/* video player for  m3u8 video player */}
                      //             {chennalID === "0" ? <img
                      //             className='responsive-iframe'
                      //             height="100%"
                      //             width="100%"
                      //             src={tvImage}
                      //              /> :

                      //             <ReactPlayer
                      //                            className='responsive-iframe'
                      //                            height="100%"
                      //                            width="100%"
                      //                            url={`https://mediasrv789-ss247-23-prod-sa-ulivestreaming.com/${Number(chennalID)}/index.m3u8`}
                      //                            // url={`https://new.livingstreamvdo.com/?eventId=${eventId}`}
                      //                            // url='https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
                      //                            controls
                      //                            playing
                      //                        />
                      //              }
                      //          </div>
                      //       </div>
                      //    </div>
                      // </div>

                      <div
                        className={` ${
                          cookies.get("skyTokenFront") ? "live_match" : ""
                        } `}
                      >
                        {cookies.get("skyTokenFront") && (
                          <div className="topnav">
                            <p
                              className={`${
                                openLiveTab === "live" ? "active" : ""
                              }`}
                              onClick={() => {
                                setopenLiveTab("live");
                                setOpenTvFlag();
                                setLiveStreamUrl("");
                                getLiveStreamUrl();
                              }}
                            >
                              Live
                            </p>
                            <p
                              className={`${
                                openLiveTab === "scoreboard" ? "active" : ""
                              }`}
                              onClick={() => {
                                setopenLiveTab("scoreboard");
                                setOpenTvFlag();
                                setLiveStreamUrl("");
                              }}
                            >
                              ScoreBoard
                            </p>
                          </div>
                        )}
                        {/* <div className='cst_live_tv_section'> */}
                        {/* <div className="live-header">
                                    <span>{detailSport?.matchInfo?.name?.split('v')[0]}</span> - <span>{detailSport?.matchInfo?.name?.split('v')[1]}</span>
                                 </div> */}

                        {cookies.get("skyTokenFront") ? (
                          openLiveTab === "scoreboard" ? (
                            SCORE_CARD?.length > 0 &&
                            cookies.get("skyTokenFront") && (
                              <div className="cst_live_tv_section score_card">
                                {/* Old Legacy Scorecard */}
                                {/* <iframe
                                  src={`https://www.satsports.net/score_widget/index.html?id=${SCORE_CARD?.[0]?.score_id}&amp;aC=bGFzZXJibook247`}
                                  width="100%"
                                ></iframe> */}

                                {/* New 9tens Scorecard */}
                                <iframe
                                  src={SCORE_CARD?.[0]?.scoreCardURL || `https://www.satsports.net/score_widget/index.html?id=${SCORE_CARD?.[0]?.score_id}&amp;aC=bGFzZXJib29rMjQ3`}
                                  width="100%"
                                ></iframe>
                              </div>
                            )
                          ) : // <iframe className='responsive-iframe w-100' id='Iframe' /src={`https://startv247.live/play/${eventId}`} width="100%"></iframe>
                          (chennalID === "0" && false) ? (
                            <div className="cst_live_tv_section live_tv">
                              <img
                                className="responsive-iframe"
                                height="100%"
                                width="100%"
                                src={tvImage}
                                alt=""
                              />
                            </div>
                          ) : (
                            // <ReactPlayer
                            //       height="100%"
                            //       width="100%"
                            //       url={`https://mediasrv789-ss247-23-prod-sa-ulivestreaming.com/${Number(chennalID)}/index.m3u8`}
                            //       // url={`https://new.livingstreamvdo.com/?eventId=${eventId}`}
                            //       // url='https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
                            //       controls
                            //       playing
                            // />
                            <>
                            {scrollPosition !== "" &&  <div className="cst_live_tv_section live_tv">
                            <img
                              className="responsive-iframe"
                              height="100%"
                              width="100%"
                              src={tvImage}
                              alt=""
                            />
                          </div>}
                            
                            <div className={`cst_live_tv_section live_tv ${scrollPosition}`}
                             ref={divRef}
                             onMouseDown={handleStart}
                             onTouchStart={handleStart}
                             style={{
                               left: position.left,
                               top: position.top,
                               cursor: "move",
                              userSelect: "none",
                              touchAction: "none",
                             }}
                            >
                              <iframe
                                // ref={divRef}
                                style={{
                                  minHeight: "206px",
                                  height: "100%",
                                  overflow: "hidden",
                                }}
                                className="cst_live_tv responsive-iframe w-100"
                                id="Iframe"
                                // src={`https://ss247.life/api/13eb1ef122caaff1a8398292ef0a4f67f52eb748/Nstreamapi.php?chid=${chennalID}`}
                                // src={`https://e765432.xyz/static/69fb31e65e4ed5d6eaebf3b8b0e0e6a715c77cc6/getdata.php?chid=${chennalID}`}
                                // src={liveStreamUrl || ""}
                                src={`${process.env.REACT_APP_BASE_POINT}user/sports/getStreamRedirect/${eventId}`}
                                width="100%"
                              ></iframe>
                            </div>
                            </>
                          )
                        ) : (
                          SCORE_CARD?.length > 0 && (
                            <div className="cst_live_tv_section score_card">
                                {/* Old Legacy Scorecard */}
                                {/* <iframe
                                  src={`https://www.satsports.net/score_widget/index.html?id=${SCORE_CARD?.[0]?.score_id}&amp;aC=bGFzZXJib29rMjQ3`}
                                  width="100%"
                                ></iframe> */}

                                {/* New 9tens Scorecard */}
                                <iframe
                                  src={SCORE_CARD?.[0]?.scoreCardURL || `https://www.satsports.net/score_widget/index.html?id=${SCORE_CARD?.[0]?.score_id}&amp;aC=bGFzZXJib29rMjQ3`}
                                  width="100%"
                                ></iframe>
                            </div>
                          )
                        )}

                        {/* </div> */}
                      </div>
                    ) : (
                      <></>
                      // <div className="game">
                      //   <div className="game-main">
                      //     <div className="game-main-wrap">
                      //       <h4 id="gameInfo" className="game-info">
                      //         {sportDetail?.type || "Cricket"}
                      //         <ul id="infoIcon" className="info-icon">
                      //           {
                      //           // moment().isSameOrAfter(
                      //           //   moment(detailSport?.matchInfo?.openDate)
                      //           // ) &&
                      //           //   detailSport?.matchInfo?.winner === "" 
                      //           sportDetail?.inPlay
                      //             && (
                      //               <li id="inPlayIcon">
                      //                 <div className="imgdiv info-inplay" />
                      //                 In-Play
                      //               </li>
                      //             )}
                      //           <li style={{ display: "none" }}>
                      //             <div className="imgdiv info-cashout" />
                      //             Cash Out
                      //           </li>
                      //           <li
                      //             id="fancyBetIcon"
                      //             style={{ display: "none" }}
                      //           >
                      //             <span className="game-fancy">Fancy</span>
                      //           </li>
                      //           <li
                      //             id="bookMakerIcon"
                      //             style={{ display: "none" }}
                      //           >
                      //             <span className="game-bookmaker">
                      //               BookMaker
                      //             </span>
                      //           </li>
                      //           <li
                      //             id="feedingSiteIcon"
                      //             style={{ display: "none" }}
                      //           >
                      //             <span className="game-sportsbook">
                      //               Sportsbook
                      //             </span>
                      //           </li>
                      //           <li>
                      //             <span
                      //               id="lowLiquidityTag"
                      //               className="game-low_liq"
                      //               style={{ display: "none" }}
                      //             >
                      //               Low
                      //             </span>
                      //           </li>
                      //         </ul>
                      //       </h4>

                      //       <table id="gameTeam" className="game-team">
                      //         <tbody>
                      //           <tr>
                      //             <th>
                      //               <a
                      //                 id="multiMarketPin"
                      //                 className="pin-off"
                      //                 href="#"
                      //                 title="Add to Multi Markets"
                      //                 onClick={(e) =>
                      //                   pinMetch(
                      //                     e,
                      //                     detailSport?.matchInfo,
                      //                     detailSport?.matchInfo?.type
                      //                   )
                      //                 }
                      //               ></a>
                      //               <h4 id="teamHome">
                      //                 {
                      //                   detailSport?.matchInfo?.name.split(
                      //                     " v "
                      //                   )[0]
                      //                 }{" "}
                      //                 <br />
                      //                 {
                      //                   detailSport?.matchInfo?.name.split(
                      //                     " v "
                      //                   )[1]
                      //                 }
                      //               </h4>
                      //               {/* <h4 id="teamAway">Royal Challengers Bangalore SRL T20</h4> */}
                      //               <ul id="time" className="scores-time">
                      //                 <li>
                      //                   {detailSport?.matchInfo?.openDate}
                      //                 </li>
                      //               </ul>
                      //             </th>
                      //             <td className="team-refresh">
                      //               <a
                      //                 id="refresh"
                      //                 className="refresh"
                      //                 href="#"
                      //                 onClick={() => window.location.reload()}
                      //               ></a>
                      //             </td>
                      //           </tr>
                      //         </tbody>
                      //       </table>
                      //     </div>
                      //   </div>
                      // </div>
                    )}

                    {Array.isArray(SCORE_CARD) && SCORE_CARD.length > 0 &&
                      window.location.hostname !== "localhost" &&
                      cookies.get("skyTokenFront") && (
                        <div className="scoreboard">
                          {/* <iframe src={`https://www.satsports.net/score_widget/index.html?id=${SCORE_CARD?.[0]?.score_id}&amp;aC=bGFzZXJib29rMjQ3`} width="100%"></iframe> */}
                        </div>
                      )}

                    <ul id="liveMatchTrackerBtn" className="match-btn bg-white">
                      <li>
                        <a
                          id="liveMultiMarketPin"
                          data-id="31889831"
                          className="btn-pin "
                          title="Add to Multi Markets"
                        > Pin </a>
                      </li>
                      <li onClick={() => window.location.reload()}>
                        <a href="#" className="btn-refresh">Refresh</a>
                      </li>
                    </ul>

                    {/* <div className="twodiv-ireland">
                                 <div className="ireland-txt ">Match Odds</div>
                                 <div className="timeblockireland" onClick={() => window.location.reload()}>
                                    <span className="detail-in-play_text ">
                                       <a href="">In-Play</a>
                                    </span>
                                 </div>
                                 <div className="minmax-txt">
                                    <span className="text-muted">Min</span>
                                    <span id="div_min_bet_odds_limit" className="oddMin">1</span>
                                    <span className="text-muted">Max</span>
                                    <span id="div_max_bet_odds_limit" className="oddMax">10000</span>
                                 </div>
                              </div> */}

                    <div
                      id="naviMarket"
                      className="market-type ps ps--theme_default"
                    >
                      <ul id="naviMarketList">
                        <li id="naviMarket_-10556801" className="select">
                          <a href="">Match Odds</a>
                        </li>
                      </ul>
                    </div>

                    {console.log(
                      "detailSport?.matchInfo",
                      detailSport?.matchInfo?.openDate
                    )}

                    {isSportLoading ? (
                      <div className="loader_top loader_overlay">
                        <div className="">
                          <Loader />
                        </div>
                      </div>
                      // <></>
                    ) : (

                      <div id="app">
                        <div className="d-block match-detail">
                          {!blockStatus.blockAll &&
                            !blockStatus.blockOdds &&
                            detailSport?.page?.data?.t1?.length > 0 && (
                              <div className="inplay-tableblock odds-table-section table-responsive first">
                                <div
                                  id="marketBetsWrap"
                                  className="bets-wrap asiahadicap"
                                >
                                  {/* <a
                                    id="minMaxButton"
                                    className="bet-limit"
                                    onClick={() =>
                                      setoddMinMaxpopup(!oddMinMaxpopup)
                                    }
                                  >
                                    <div
                                      className={` odds_info-popup ${
                                        oddMinMaxpopup ? "active" : ""
                                      }`}
                                      id="fancy_popup_LUNCH_FAVOURITE"
                                    >
                                      <dl>
                                        <dt>Min / Max</dt>
                                        <dd id="minMax">
                                          {" "}
                                          {
                                            detailSport?.matchInfo
                                              ?.bet_odds_limit?.min
                                          }{" "}
                                          /{" "}
                                          {
                                            detailSport?.matchInfo
                                              ?.bet_odds_limit?.max
                                          }
                                        </dd>
                                      </dl>
                                      <a
                                        id="close-odds_info"
                                        className="close 11"
                                        onClick={() => setoddMinMaxpopup(false)}
                                      >
                                        Close
                                      </a>
                                    </div>
                                  </a> */}
                                  <span
                                  data-tooltip-id="info-icon"
                                    id="info-icon"
                                    className="bet-limit info-icon"
                                    onClick={() =>{
                                      setoddMinMaxpopup(!oddMinMaxpopup);
                                      setMin(detailSport?.matchInfo
                                        ?.bet_odds_limit?.min)
                                        setMax(detailSport?.matchInfo
                                          ?.bet_odds_limit?.max)
                                    }
                                    }
                                  ></span>
                                  <dl
                                    id="betsHead"
                                    className="bets-selections-head"
                                  >
                                    <dt>
                                      <a
                                        className="a-depth"
                                        onClick={() => setMarketPopup(true)}
                                        id="marketDepthBtn"
                                      >
                                        Markets Depth
                                      </a>
                                      <p>
                                        <span>Matched 2</span>
                                        <strong id="totalMatched">
                                        {DD?.currency
                                                  ? `${DD?.currency} `
                                                  : "PTH "}
                                          {
                                            detailSport?.page?.data?.t1?.[0]
                                              ?.totalmatch || ""
                                          }
                                        </strong>
                                      </p>
                                    </dt>
                                    <dd>Back </dd>
                                    <dd>Lay </dd>
                                  </dl>
                                </div>

                                <table className="table custom-table inplay-table w1-table" style={{lineHeight:2}}>
                                  <tbody>
                                    <tr className="betstr">
                                      <td className="text-color-grey opacity-1">
                                        <span className="totselection seldisplay">
                                          2 Selections
                                        </span>
                                      </td>
                                      <td colSpan={2}>101.7%</td>
                                      <td>
                                        <span>Back</span>
                                      </td>{" "}
                                      <td>
                                        <span>Lay</span>
                                      </td>
                                      <td colSpan={2}>97.9%</td>
                                    </tr>

                                    {
                                      // stableSort(detailSport.page?.data?.t1, getComparator('asc', 'sortPriority'))
                                      detailSport &&
                                        stableSort(
                                          detailSport.page?.data?.t1,
                                          getComparator("asc", "sortPriority")
                                        ).map((item: DetailsTableInterface, i:number) => {
                                          return (
                                            <>
                                            {console.log("DetailsTableInterface: item :: ", item)}
                                              <tr className="bg-white tr-odds tr_team1">
                                                <td>
                                                  {/* <img src="../../../images/bars.png" /> */}
                                                  <b className="team1">
                                                    {item.nat}
                                                  </b>
                                                  <div>
                                                    {item.betProfit && (
                                                      <span
                                                        className={` ${
                                                          item.betProfit < 0
                                                            ? "to-lose"
                                                            : "to-win"
                                                        } team_bet_count_old `}
                                                      >
                                                        {item.betProfit < 0 ? <img src="../../../images/right-arrow-red.svg" alt="red"/> :<img src="../../../images/right-arrow-green.svg" alt="green"/>}
                                                        <span
                                                          className={` ${
                                                            item.betProfit < 0
                                                              ? "text-danger"
                                                              : "text-green"
                                                          } team_total`}
                                                        >
                                                          (
                                                          {item?.betProfit &&
                                                          cookies.get(
                                                            "skyTokenFront"
                                                          )
                                                            ? parseFloat(
                                                                item.betProfit
                                                              )?.toFixed(2)
                                                            : 0}
                                                          )
                                                        </span>
                                                      </span>
                                                    )}
                                                  </div>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "b3", "t1")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "b3"
                                                      ? "table-active"
                                                      : ""
                                                  } light-blue-bg-2 opnForm ODDSBack td_team1_back_2 ${sparkOddsBackDetail === i ? "spark-back" : ""}`}
                                                >
                                                  <a className="back1btn text-color-black">
                                                    {" "}
                                                    {item.b3} <br />
                                                    <span>{item.bs3}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "b2", "t1")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "b2"
                                                      ? "table-active"
                                                      : ""
                                                  } light-blue-bg-3 ODDSBack td_team1_back_1 ${sparkOddsBackDetail === i ? "spark-back" : ""}`}
                                                >
                                                  <a className="back1btn text-color-black">
                                                    {" "}
                                                    {item.b2} <br />
                                                    <span>{item.bs2}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "b1", "t1")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "b1"
                                                      ? "table-active"
                                                      : ""
                                                  } ${
                                                    // new Date(
                                                    //   detailSport?.matchInfo?.openDate
                                                    // ).toLocaleDateString() ===           
                                                    // new Date().toLocaleDateString() 
                                                    // && 

                                                    // detailSport?.matchInfo?.oddsLimit?.min <= item.l1 &&
                                                    // detailSport?.matchInfo?.oddsLimit?.max >= item.l2 || 
                                                    detailSport?.matchInfo?.oddsLimit?.min <= item.b1 && 
                                                    detailSport?.matchInfo?.oddsLimit?.max >= item.b1 
                                                    // 10 <= item.l1 && 
                                                    // 0 >= item.l2 
                                                    // 2 <= item.b1 && 
                                                    // 10 >= item.b1                                     
                                                      ? ""
                                                      : "disable"
                                                  } cyan-bg ODDSBack td_team1_back_0 ${sparkOddsBackDetail === i ? "spark-back" : ""}`}
                                                  // style={{ paddingTop: "20px" }}
                                                  style={{ lineHeight:1.3 }}
                                                >
                                                  <a className="back1btn text-color-black">
                                                    {" "}
                                                    {item.b1} <br />
                                                    <span>{item.bs1}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "l1", "t1")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "l1"
                                                      ? "table-active-red"
                                                      : ""
                                                  } ${
                                                    // new Date(
                                                    //   detailSport?.matchInfo?.openDate
                                                    // ).toLocaleDateString() ===
                                                    // new Date().toLocaleDateString() 
                                                    // && 
                                                    // detailSport?.matchInfo?.oddsLimit?.min <= item.l1 &&
                                                    // detailSport?.matchInfo?.oddsLimit?.max >= item.l2 || 
                                                    detailSport?.matchInfo?.oddsLimit?.min <= item.l1 && 
                                                    detailSport?.matchInfo?.oddsLimit?.max >= item.l2 
                                                    // 10 <= item.l1 && 
                                                    // 0 >= item.l2 
                                                    // 2 <= item.b1 && 
                                                    // 10 >= item.b1     
                                                      ? ""
                                                      : "disable"
                                                  } pink-bg ODDSLay td_team1_lay_0 ${sparkOddsLayDetail === i ? "spark-lay" : ""}`}
                                                  // style={{ paddingTop: "20px" }}
                                                  style={{ lineHeight:1.3 }}
                                                >
                                                  <a className="lay1btn text-color-black">
                                                    {" "}
                                                    {item.l1} <br />
                                                    <span>{item.ls1}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "l2", "t1")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "l2"
                                                      ? "table-active-red"
                                                      : ""
                                                  } light-pink-bg-2 ODDSLay td_team1_lay_1 ${sparkOddsLayDetail === i ? "spark-lay" : ""}`}
                                                >
                                                  <a className="lay1btn text-color-black">
                                                    {" "}
                                                    {item.l2} <br />
                                                    <span>{item.ls2}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "l3", "t1")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "l3"
                                                      ? "table-active-red"
                                                      : ""
                                                  } light-pink-bg-3 ODDSLay td_team1_lay_2 ${sparkOddsLayDetail === i ? "spark-lay" : ""}`}
                                                >
                                                  <a className="lay1btn text-color-black">
                                                    {" "}
                                                    {item.l3} <br />
                                                    <span>{item.ls3}</span>
                                                  </a>
                                                </td>
                                              </tr>
                                              {/* {true && ( */}
                                              {item.status === "SUSPEND" && (
                                                <tr className="fancy-suspend-tr collapse">
                                                  <th colSpan={1}> </th>
                                                  <td
                                                    colSpan={6}
                                                    className="fancy-suspend-td"
                                                  >
                                                    <div className="suspend-white">
                                                      <span>Suspend</span>
                                                    </div>
                                                  </td>
                                                  {/* <td colSpan={0} className="refer-book"></td> */}
                                                </tr>
                                              )}
                                              {clickedBet?.sId === item.sId &&
                                                window.innerWidth < 993 && (
                                                  <BetBox
                                                    resetClicked={resetBet}
                                                    placeBetClicked={PlaceBat}
                                                    clickedBet={clickedBet}
                                                    clickedTable={clickedTable}
                                                    clickedTableData={
                                                      clickedTableData
                                                    }
                                                    isMobile={true}
                                                    setPlaceBetLoader={
                                                      setPlaceBetLoader
                                                    }
                                                  />
                                                )}
                                            </>
                                          );
                                        })
                                    }
                                  </tbody>
                                </table>
                              </div>
                            )}

                          {/* stableSort(detailSport.page?.data?.t1, getComparator('asc', 'sortPriority')) */}
                          {detailSport?.matchInfo?.activeStatus?.bookmaker &&
                            !blockStatus.blockAll &&
                            !blockStatus.blockBookMaker &&
                            detailSport?.page?.data?.t2?.length > 0 && (
                              <>
                                <div className="inplay-tableblock odds-table-section table-responsive second bookmark">
                                  <table className="table custom-table inplay-table w1-table">
                                    <tbody>
                                      <tr>
                                        <td
                                          colSpan={7}
                                          className="text-color-grey fancybet-block  p-0"
                                        >
                                          <div className="dark-blue-bg-1 text-color-white bookmaker">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="25"
                                              height="25"
                                              viewBox="0 0 25 25"
                                            >
                                              <path
                                                fill="rgb(126,151,167)"
                                                d="M12.5 25C5.596 25 0 19.404 0 12.5S5.596 0 12.5 0 25 5.596 25 12.5 19.404 25 12.5 25zm0-1C18.85 24 24 18.85 24 12.5S18.85 1 12.5 1 1 6.15 1 12.5 6.15 24 12.5 24zm5.09-12.078c1.606.516 2.41 1.13 2.41 2.19 0 .373-.067.616-.2.73-.135.115-.403.173-.804.173H13.57l-.81 7.988h-.536l-.795-7.988H6.003c-.4 0-.67-.065-.803-.194-.133-.128-.2-.364-.2-.708 0-1.06.804-1.674 2.41-2.19.09 0 .18-.03.27-.086.49-.172.802-.444.936-.816L9.82 5.95v-.216c0-.23-.222-.415-.668-.558l-.067-.043h-.067c-.536-.143-.804-.387-.804-.73 0-.402.09-.652.268-.753.18-.1.49-.15.938-.15h6.16c.447 0 .76.05.938.15.178.1.268.35.268.752 0 .344-.268.588-.804.73h-.067l-.067.044c-.446.143-.67.33-.67.558v.215l1.206 5.07c.134.372.446.644.937.816.09.057.18.086.27.086z"
                                              />
                                            </svg>
                                            Bookmaker Market
                                            <span className="zeroopa">
                                              | Zero Commission
                                            </span>
                                            <div className="mobile-bookmark-min-max-popup">
                                              {/* <a href="#feeds_for_bookmarket" data-toggle="collapse" aria-expanded="false" className="collapsed">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15">
                                                                                    <path fill="%233B5160" fill-rule="evenodd" d="M6.76 5.246V3.732h1.48v1.514H6.76zm.74 8.276a5.86 5.86 0 0 0 3.029-.83 5.839 5.839 0 0 0 2.163-2.163 5.86 5.86 0 0 0 .83-3.029 5.86 5.86 0 0 0-.83-3.029 5.839 5.839 0 0 0-2.163-2.163 5.86 5.86 0 0 0-3.029-.83 5.86 5.86 0 0 0-3.029.83A5.839 5.839 0 0 0 2.308 4.47a5.86 5.86 0 0 0-.83 3.029 5.86 5.86 0 0 0 .83 3.029 5.839 5.839 0 0 0 2.163 2.163 5.86 5.86 0 0 0 3.029.83zM7.5 0c1.37 0 2.638.343 3.804 1.028a7.108 7.108 0 0 1 2.668 2.668A7.376 7.376 0 0 1 15 7.5c0 1.37-.343 2.638-1.028 3.804a7.108 7.108 0 0 1-2.668 2.668A7.376 7.376 0 0 1 7.5 15a7.376 7.376 0 0 1-3.804-1.028 7.243 7.243 0 0 1-2.668-2.686A7.343 7.343 0 0 1 0 7.5c0-1.358.343-2.62 1.028-3.786a7.381 7.381 0 0 1 2.686-2.686A7.343 7.343 0 0 1 7.5 0zm-.74 11.268V6.761h1.48v4.507H6.76z"></path></svg>
                                                                            </a> */}
                                              {/* <div id="feeds_for_bookmarket" className="fancy_minmax_info text-let collapse">
                                                                                <dl className="text-center">
                                                                                    <dt>Min / Max</dt>
                                                                                    <dd id="minMax"> 1 / 50000</dd>

                                                                                </dl>
                                                                            </div> */}
                                            </div>
                                            {/* <dl className="fancy-info">
                                                                            <dt><span>Min</span></dt>
                                                                            <dd id="min"> {detailSport?.matchInfo?.bet_bookmaker_limit?.min}</dd>
                                                                            <dt><span>Max</span></dt>
                                                                            <dd id="max"> {detailSport?.matchInfo?.bet_bookmaker_limit?.max}</dd>

                                                                        </dl> */}
                                            {/* <a
                                              id="open-odds_info"
                                              className="btn-odds_info"
                                              onClick={() =>
                                                setoddsinfoId(true)
                                              }
                                            >
                                              fancybet info
                                            </a>
                                            <div
                                              className={` odds_info-popup ${
                                                oddsinfoId ? "active" : ""
                                              }`}
                                              id="fancy_popup_LUNCH_FAVOURITE"
                                            >
                                              <dl>
                                                <dt>Min / Max</dt>
                                                <dd id="minMax">
                                                  {" "}
                                                  {
                                                    detailSport?.matchInfo
                                                      ?.bet_bookmaker_limit?.min
                                                  }{" "}
                                                  /{" "}
                                                  {
                                                    detailSport?.matchInfo
                                                      ?.bet_bookmaker_limit?.max
                                                  }
                                                </dd>
                                              </dl>
                                              <a
                                                id="close-odds_info"
                                                className="close"
                                                onClick={() =>
                                                  setoddsinfoId(false)
                                                }
                                              >
                                                Close
                                              </a>
                                            </div> */}
                                            <span
                                              data-tooltip-id="open-odds_info"
                                                id="open-odds_info"
                                                className="btn-odds_info"
                                                onClick={() =>{
                                                  setoddsinfoId(!oddsinfoId);
                                                  setMin(detailSport?.matchInfo
                                                    ?.bet_bookmaker_limit?.min)
                                                    setMax(detailSport?.matchInfo
                                                      ?.bet_bookmaker_limit?.max)
                                                }
                                                }
                                              ></span>
                                          </div>
                                        </td>
                                      </tr>
                                      <tr className="betstr">
                                        <td className="text-color-grey opacity-1">
                                          <span className="totselection seldisplay"></span>
                                        </td>
                                        <td colSpan={2}></td>
                                        <td>
                                          <span>Back</span>
                                        </td>{" "}
                                        <td>
                                          <span>Lay</span>
                                        </td>
                                        <td colSpan={2}></td>
                                      </tr>

                                      {detailSport &&
                                        stableSort(
                                          detailSport?.page?.data?.t2,
                                          getComparator("asc", "sortPriority")
                                        ).map((item: DetailsTableInterface, i:number) => {
                                          return (
                                            <>
                                              <tr className=" tr-odds tr_team1">
                                                <td>
                                                  {/* <img src="../../../images/bars.png" /> */}
                                                  <b className="team1">
                                                    {item.nat}
                                                  </b>
                                                  <div>
                                                    {item.betProfit && (
                                                      <span
                                                        className={` ${
                                                          item.betProfit < 0
                                                            ? "to-lose"
                                                            : "to-win"
                                                        } team_bet_count_old`}
                                                      >
                                                        <span
                                                          className={` ${
                                                            item.betProfit < 0
                                                              ? "text-danger"
                                                              : "text-green"
                                                          } team_total`}
                                                        >
                                                          (
                                                          {item?.betProfit &&
                                                          cookies.get(
                                                            "skyTokenFront"
                                                          )
                                                            ? parseFloat(
                                                                item.betProfit
                                                              )?.toFixed(2)
                                                            : 0}
                                                          )
                                                        </span>
                                                      </span>
                                                    )}
                                                  </div>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "b3", "t2")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "b3"
                                                      ? "table-active"
                                                      : ""
                                                  } light-blue-bg-2 opnForm ODDSBack td_team1_back_2 ${sparkBookBackDetail === i ? "spark-back" : ""}`}
                                                >
                                                  <a className="back1btn text-color-black">
                                                    {" "}
                                                    {item.b3} <br />
                                                    <span>{item.bs3}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "b2", "t2")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "b2"
                                                      ? "table-active"
                                                      : ""
                                                  } light-blue-bg-3 ODDSBack td_team1_back_1 ${sparkBookBackDetail === i ? "spark-back" : ""}`}
                                                >
                                                  <a className="back1btn text-color-black">
                                                    {" "}
                                                    {item.b2} <br />
                                                    <span>{item.bs2}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "b1", "t2")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "b1"
                                                      ? "table-active"
                                                      : ""
                                                  } cyan-bg ODDSBack td_team1_back_0 ${sparkBookBackDetail === i ? "spark-back" : ""}`}
                                                >
                                                  <a
                                                    style={{ padding: "2.3vw" }}
                                                    className="back1btn text-color-black out_line_box"
                                                  >
                                                    {" "}
                                                    {item.b1}
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "l1", "t2")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "l1"
                                                      ? "table-active-red"
                                                      : ""
                                                  } pink-bg ODDSLay td_team1_lay_0 ${sparkBookLayDetail === i ? "spark-lay": "" }`}
                                                >
                                                  <a
                                                    style={{ padding: "2.3vw" }}
                                                    className="lay1btn text-color-black out_line_box"
                                                  >
                                                    {" "}
                                                    {item.l1}
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "l2", "t2")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "l2"
                                                      ? "table-active-red"
                                                      : ""
                                                  } light-pink-bg-2 ODDSLay td_team1_lay_1 ${sparkBookLayDetail === i ? "spark-lay": "" }`}
                                                >
                                                  <a className="lay1btn text-color-black">
                                                    {" "}
                                                    {item.l2} <br />
                                                    <span>{item.ls2}</span>
                                                  </a>
                                                </td>
                                                <td
                                                  onClick={() =>
                                                    BetClick(item, "l3", "t2")
                                                  }
                                                  className={`${
                                                    clickedBet?.sId ===
                                                      item.sId &&
                                                    clickedTableData === "l3"
                                                      ? "table-active-red"
                                                      : ""
                                                  } light-pink-bg-3 ODDSLay td_team1_lay_2 ${sparkBookLayDetail === i ? "spark-lay": "" }`}
                                                >
                                                  <a className="lay1btn text-color-black">
                                                    {" "}
                                                    {item.l3} <br />
                                                    <span>{item.ls3}</span>
                                                  </a>
                                                </td>
                                              </tr>
                                              {/* {true && ( */}
                                               {item.status === "SUSPEND" && (
                                                <tr className="fancy-suspend-tr collapse">
                                                  <th colSpan={1}> </th>
                                                  <td
                                                    colSpan={6}
                                                    className="fancy-suspend-td"
                                                  >
                                                    <div className="suspend-white5">
                                                      <span>Suspend</span>
                                                    </div>
                                                  </td>
                                                  {/* <td colSpan={0} className="refer-book"></td> */}
                                                </tr>
                                              )}
                                              {clickedBet?.sId === item.sId &&
                                                window.innerWidth < 993 && (
                                                  <BetBox
                                                    resetClicked={resetBet}
                                                    placeBetClicked={PlaceBat}
                                                    clickedBet={clickedBet}
                                                    clickedTable={clickedTable}
                                                    clickedTableData={
                                                      clickedTableData
                                                    }
                                                    isMobile={true}
                                                    setPlaceBetLoader={
                                                      setPlaceBetLoader
                                                    }
                                                  />
                                                )}
                                            </>
                                          );
                                        })}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            )}

                          {/* premium tab */}
                          <div className="fancy-section">
                            {fancyPremium &&
                            detailSport?.matchInfo?.activeStatus?.fancy &&
                            !blockStatus.blockAll &&
                            !blockStatus.blockFancy &&
                            detailSport?.page?.data?.t3?.length > 0 ? (
                              <>
                                <div
                                  className="fancy-bet-txt"
                                  style={{ paddingTop: "10px" }}
                                >
                                  <div className="fancy-head sportsbook_bet-head">
                                    <a
                                      id=""
                                      title="Add to Multi Markets"
                                      className="add-pin multiMarketPin"
                                    ></a>
                                    <h4 className="fa-in-play">
                                      <span
                                        id="headerName"
                                        style={{ color: "076976" }}
                                      >
                                        <pre></pre>
                                        Fancy Bet
                                      </span>
                                      <a
                                        href="#feeds_premium"
                                        data-toggle="collapse"
                                        className="btn-head_rules 1"
                                        onClick={() => setFancyPopup(true)}
                                      >
                                        Rules
                                      </a>
                                    </h4>

                                    {cookies.get("skyTokenFront") &&
                                      detailSport.pre?.data?.t4?.length > 0 &&
                                      detailSport?.matchInfo?.activeStatus
                                        ?.premium && (
                                        <a
                                          id="showFancyBetBtn"
                                          className="other-tab"
                                          onClick={
                                            detailSport.pre?.data?.t4?.length >
                                              0 &&
                                            detailSport?.matchInfo?.activeStatus
                                              ?.premium
                                              ? () => setFancyPremium(false)
                                              : () => console.log()
                                          }
                                        >
                                          <span className="tag-new">New</span>
                                          Premium {detailSport.matchInfo.type === 'cricket' ? 'Cricket' : detailSport.matchInfo.type === 'soccer' ? 'Soccer' : 'Tennis'}
                                        </a>
                                      )}
                                  </div>

                                  <div className="fancy_bet_tab-wrap premium fancy_bet">
                                    <ul
                                      id="pills-tab"
                                      role="tablist"
                                      className="nav nav-pills special_bets-tab "
                                    >
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "All" ? "active" : ""
                                          } `}
                                          onClick={() => setActivePin("All")}
                                        >
                                          All
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Popular"
                                              ? "active"
                                              : ""
                                          } `}
                                          onClick={() =>
                                            setActivePin("Popular")
                                          }
                                        >
                                          Popular
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Match"
                                              ? "active"
                                              : ""
                                          } `}
                                          onClick={() => setActivePin("Match")}
                                        >
                                          Match
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Innings"
                                              ? "active"
                                              : ""
                                          } `}
                                          onClick={() =>
                                            setActivePin("Innings")
                                          }
                                        >
                                          Innings
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Over" ? "active" : ""
                                          } `}
                                          onClick={() => setActivePin("Over")}
                                        >
                                          Over
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "More" ? "active" : ""
                                          } `}
                                          onClick={() => setActivePin("More")}
                                        >
                                          More
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>

                                <table className="bets w-100 premium-table fancy_table">
                                  <colgroup>
                                    <col
                                      span={1}
                                      width="280"
                                      style={{ width: "280px" }}
                                    />
                                    <col span={1} width="70" />
                                    <col span={1} width="70" />
                                    <col span={1} width="70" />
                                    <col span={1} width="70" />
                                    <col span={1} width="70" />
                                    <col span={1} width="70" />
                                  </colgroup>

                                  <tbody style={{ position: "relative" }}>
                                    <tr className="special_bet">
                                      <td colSpan={7}>
                                        <h3 className="marketHeader">
                                          <a
                                            id=""
                                            title="Add to Multi Markets"
                                            className="add-pin multiMarketPin"
                                          >
                                            <svg
                                              width="11"
                                              height="12"
                                              viewBox="0 0 8 12"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                d="M6.714 5.25c.857.321 1.286.812 1.286 1.473 0 .232-.036.384-.107.455-.071.071-.214.107-.429.107h-2.893l-.429 4.714h-.286l-.429-4.714h-2.893c-.214 0-.357-.04-.429-.121-.071-.08-.107-.228-.107-.442 0-.661.429-1.152 1.286-1.473l.143-.054c.262-.107.429-.277.5-.509l.643-3.161v-.134c0-.143-.119-.259-.357-.348l-.036-.027h-.036c-.286-.089-.429-.241-.429-.455 0-.25.048-.406.143-.469.095-.063.262-.094.5-.094h3.286c.238 0 .405.031.5.094.095.063.143.219.143.469 0 .214-.143.366-.429.455h-.036l-.036.027c-.238.089-.357.205-.357.348v.134l.643 3.161c.071.232.238.402.5.509l.143.054z"
                                                fill="rgb(255,255,255)"
                                              />
                                            </svg>
                                          </a>
                                          <a className="marketName">
                                            Fancy Bet
                                          </a>
                                        </h3>

                                        <dl className="fancy-info">
                                          <dt>
                                            <span>Min</span>
                                          </dt>
                                          <dd id="min">
                                            {" "}
                                            {
                                              detailSport?.matchInfo
                                                ?.bet_fancy_limit?.min
                                            }
                                          </dd>
                                          <dt>
                                            <span>Max</span>
                                          </dt>
                                          <dd id="max">
                                            {" "}
                                            {
                                              detailSport?.matchInfo
                                                ?.bet_fancy_limit?.max
                                            }
                                          </dd>
                                        </dl>
                                      </td>
                                    </tr>
                                    <tr className="bet-all">
                                      <td></td>
                                      <td
                                        className="refer-bet"
                                        colSpan={2}
                                      ></td>
                                      <td>No</td>
                                      <td>Yes</td>
                                      <td
                                        className="refer-book"
                                        colSpan={2}
                                      ></td>
                                    </tr>
                                    {
                                      // stableSort(detailSport?.page?.data?.t3, getComparator('asc', 'sortPriority'))
                                      detailSport.page?.data?.t3?.length &&
                                        stableSort(
                                          detailSport?.page?.data?.t3,
                                          getComparator("asc", "sortPriority")
                                        ).map(
                                          (item: FancyInterface, i: any) => {
                                            let data =
                                              JSON.stringify(BET_HISTORY) !==
                                              "{}"
                                                ? BET_HISTORY?.find(
                                                    (_: {
                                                      selection: string;
                                                    }) =>
                                                      _.selection === item.nat
                                                  )
                                                : null;
                                            return (
                                              <>{![1,18].includes(item?.status1) && <>
                                                <tr id="fancyBetMarket_703991">
                                                  <th colSpan={3}>
                                                    <dl className="fancy-th-layout">
                                                      <dt>
                                                        <p id="marketName">
                                                          {item.nat}

                                                          <p>
                                                            <span
                                                              className={
                                                                item?.betProfit <
                                                                0
                                                                  ? "to-lose text-danger"
                                                                  : item?.betProfit >
                                                                    0
                                                                  ? "to-win text-green"
                                                                  : ""
                                                              }
                                                              style={{
                                                                display:
                                                                  "block",
                                                              }}
                                                            >
                                                              {item?.betProfit ? (
                                                                <>
                                                                  (
                                                                  {parseFloat(
                                                                    item?.betProfit
                                                                  )?.toFixed(2)}
                                                                  )
                                                                </>
                                                              ) : (
                                                                ""
                                                              )}
                                                            </span>
                                                          </p>
                                                        </p>
                                                        {/* {item?.betProfit < 0
                                                                                                ? */}
                                                        {/*  <span id="before" className="to-win text-green" style={{ display: "block" }}>({item?.betProfit})</span> */}
                                                        {/* } */}
                                                      </dt>
                                                      <dd className="dd-tips">
                                                        <ul className="fancy-tips">
                                                          <li
                                                            id="remarkFirstRow"
                                                            style={{
                                                              display: "none",
                                                            }}
                                                          ></li>
                                                          <li
                                                            id="remarkSecondRow"
                                                            style={{
                                                              display: "none",
                                                            }}
                                                          ></li>
                                                        </ul>
                                                        {data && (
                                                          <a
                                                            id="fancyBetBookBtn"
                                                            className="btn-book"
                                                            onClick={() =>
                                                              onBookClick(
                                                                item,
                                                                data
                                                              )
                                                            }
                                                          >
                                                            Book
                                                          </a>
                                                        )}
                                                      </dd>
                                                    </dl>
                                                  </th>
                                                  <td
                                                    colSpan={2}
                                                    className="multi_select "
                                                  >
                                                    <ul>
                                                      <li
                                                        className={` ${
                                                          clickedBet?.sId ===
                                                            item.sId &&
                                                          clickedTableData ===
                                                            "l1"
                                                            ? "table-active-red"
                                                            : ""
                                                        } lay-1`}
                                                        id="lay_1"
                                                        onClick={() =>
                                                          BetClick(
                                                            item,
                                                            "l1",
                                                            "t3"
                                                          )
                                                        }
                                                      >
                                                        {" "}
                                                        <a id="runsInfo">
                                                          {item.l1}
                                                          <span>
                                                            {item.ls1}
                                                          </span>
                                                        </a>{" "}
                                                      </li>

                                                      <li
                                                        className={` ${
                                                          clickedBet?.sId ===
                                                            item.sId &&
                                                          clickedTableData ===
                                                            "b1"
                                                            ? "table-active"
                                                            : ""
                                                        } back-1`}
                                                        id="back_1"
                                                        onClick={() =>
                                                          BetClick(
                                                            item,
                                                            "b1",
                                                            "t3"
                                                          )
                                                        }
                                                      >
                                                        {" "}
                                                        <a id="runsInfo">
                                                          {item.b1}
                                                          <span>
                                                            {item.bs1}
                                                          </span>
                                                        </a>{" "}
                                                      </li>
                                                    </ul>
                                                  </td>
                                                  {/* <td className="td-fancy_merge" colSpan={2}>
                                                                                        <dl className="fancy-info">
                                                                                            <dt>Min/Max</dt>
                                                                                            <dd id="minMax"> {detailSport?.matchInfo?.bet_fancy_limit?.min} /  {detailSport?.matchInfo?.bet_fancy_limit?.max}</dd>
                                                                                        </dl>
                                                                                        <dl className="fancy-info">
                                                                                            <dt id="rebateName" style={{ display: "none" }}>Rebate</dt>
                                                                                            <dd id="rebate" style={{ display: "none" }}></dd>
                                                                                        </dl>
                                                                                    </td> */}
                                                </tr>
                                                {(item.status === "SUSPEND" ||
                                                  item.status ===
                                                    "BALL RUNNING") && (
                                                  <tr
                                                    id="suspend_702908"
                                                    className="fancy-suspend-tr"
                                                  >
                                                    <th></th>
                                                    <td colSpan={2}></td>
                                                    <td
                                                      className="fancy-suspend-td"
                                                      colSpan={2}
                                                    >
                                                      <div
                                                        id="suspendClass"
                                                        className="fancy-suspend"
                                                      >
                                                        <span id="info">
                                                          {item.status ===
                                                          "SUSPEND"
                                                            ? "Suspend"
                                                            : item.status ===
                                                              "BALL RUNNING"
                                                            ? "Ball Running"
                                                            : ""}
                                                        </span>
                                                      </div>
                                                    </td>
                                                    <td colSpan={2}></td>
                                                  </tr>
                                                )}
                                              </>}
                                              </>
                                            );
                                          }
                                        )
                                    }
                                  </tbody>
                                </table>

                                <div className="fancy_mobile">
                                  <table className="bets w-100 premium-table fancy_table">
                                    <colgroup>
                                      <col
                                        span={1}
                                        width="280"
                                        style={{ width: "280px" }}
                                      />
                                      <col span={1} width="70" />
                                      <col span={1} width="70" />
                                      <col span={1} width="70" />
                                      <col span={1} width="70" />
                                      <col span={1} width="70" />
                                      <col span={1} width="70" />
                                    </colgroup>
                                    <tbody>
                                      <tr className="special_bet">
                                        <td colSpan={7}>
                                          <h3 className="marketHeader">
                                            <a
                                              id=""
                                              title="Add to Multi Markets"
                                              className="add-pin multiMarketPin"
                                            >
                                              <svg
                                                width="11"
                                                height="12"
                                                viewBox="0 0 8 12"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M6.714 5.25c.857.321 1.286.812 1.286 1.473 0 .232-.036.384-.107.455-.071.071-.214.107-.429.107h-2.893l-.429 4.714h-.286l-.429-4.714h-2.893c-.214 0-.357-.04-.429-.121-.071-.08-.107-.228-.107-.442 0-.661.429-1.152 1.286-1.473l.143-.054c.262-.107.429-.277.5-.509l.643-3.161v-.134c0-.143-.119-.259-.357-.348l-.036-.027h-.036c-.286-.089-.429-.241-.429-.455 0-.25.048-.406.143-.469.095-.063.262-.094.5-.094h3.286c.238 0 .405.031.5.094.095.063.143.219.143.469 0 .214-.143.366-.429.455h-.036l-.036.027c-.238.089-.357.205-.357.348v.134l.643 3.161c.071.232.238.402.5.509l.143.054z"
                                                  fill="rgb(255,255,255)"
                                                />
                                              </svg>
                                            </a>
                                            <a className="marketName">
                                              Fancy Bet
                                            </a>
                                          </h3>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div
                                    className="bets-wrap fancy-bet"
                                    id="fancyBetMarket_758273"
                                    style={{
                                      backgroundColor: "unset",
                                    }}
                                  >
                                    <dl
                                      className="bets-selections"
                                      style={{ minHeight: "auto" }}
                                    >
                                      <dt className="line_market-selection">
                                        <dl className="tips tips-mob">
                                          <dt>
                                            {/* <span id="before"></span>
                                                                                            <span className={item?.betProfit < 0 ? "to-lose text-danger" : item?.betProfit > 0 ? "to-win text-green" : ''} style={{ display: "block" }}>
                                                                                                {item?.betProfit ? <>({parseFloat(item?.betProfit)?.toFixed(2)})</> : ''}
                                                                                            </span> */}
                                          </dt>

                                          <dd
                                            id="remarkFirstRow"
                                            style={{ display: "none" }}
                                          ></dd>
                                          <dd
                                            id="remarkSecondRow"
                                            style={{ display: "none" }}
                                          ></dd>
                                          {/* {data && <a id="fancyBetBookBtn" className="btn-book" onClick={() => onBookClick(item, data)} >Book</a>} */}
                                        </dl>
                                      </dt>
                                      <dd
                                        id="lay_1"
                                        style={{
                                          justifyContent: "center",
                                          fontSize: "14px",
                                          fontWeight: "bold",
                                          border: "none",
                                        }}
                                      >
                                        NO
                                        {/* <a className={`lay-1 ${clickedBet?.sId === item.sId && clickedTableData === 'l1' ? 'table-active-red' : ''} lay-1`}> {item.l1}<span>{item.ls1}</span>
                                                                                        </a> */}
                                      </dd>
                                      <dd
                                        id="back_1"
                                        style={{
                                          justifyContent: "center",
                                          fontSize: "14px",
                                          fontWeight: "bold",
                                          border: "none",
                                        }}
                                      >
                                        {/* <a className={`back-1 ${clickedBet?.sId === item.sId && clickedTableData === 'b1' ? 'table-active' : ''} back-1`}> {item.b1}<span>{item.bs1}</span></a> */}
                                        YES
                                      </dd>
                                      <dd className="mode-land"> </dd>
                                      <dd className="mode-land"></dd>
                                    </dl>
                                  </div>
                                  {detailSport?.matchInfo?.activeStatus
                                    ?.fancy &&
                                    detailSport.page?.data?.t3?.length &&
                                    detailSport?.page?.data?.t3?.map(
                                      (item: FancyInterface, i: any) => {
                                        let data =
                                          JSON.stringify(BET_HISTORY) !== "{}"
                                            ? BET_HISTORY?.find(
                                                (_: { selection: string }) =>
                                                  _.selection === item.nat
                                              )
                                            : null;
                                        return (
                                          <>{![1,18].includes(item?.status1) && <>
                                            <div
                                              className="bets-wrap fancy-bet"
                                              id="fancyBetMarket_758273"
                                            >
                                              <h5>
                                                <span id="marketName">
                                                  {item.nat}
                                                </span>
                                                {/* <a
                                                  id="open-fancy_info"
                                                  className="btn-fancy_info"
                                                  onClick={() =>
                                                    setFancyinfoId(item.sId)
                                                  }
                                                >
                                                  fancybet info
                                                </a> */}
                                                <a
                                                data-tooltip-id="open-fancy_info"
                                                  id="open-fancy_info"
                                                  className="btn-fancy_info"
                                                  onClick={() =>{
                                                    setFancyMinMaxPopup(!fancyMinMaxPopup);
                                                    setMin(detailSport?.matchInfo
                                                      ?.bet_fancy_limit?.min)
                                                      setMax(detailSport?.matchInfo
                                                        ?.bet_fancy_limit?.max)
                                                  }
                                                  }
                                              ></a>
                                                {/* <div
                                                  className={` fancy_info-popup ${
                                                    fancyinfoId === item.sId
                                                      ? "active"
                                                      : ""
                                                  }`}
                                                  id="fancy_popup_LUNCH_FAVOURITE"
                                                >
                                                  <dl>
                                                    <dt>Min / Max</dt>
                                                    <dd id="minMax">
                                                      {" "}
                                                      {
                                                        detailSport?.matchInfo
                                                          ?.bet_fancy_limit?.min
                                                      }
                                                      /
                                                      {
                                                        detailSport?.matchInfo
                                                          ?.bet_fancy_limit?.max
                                                      }{" "}
                                                    </dd>
                                                  </dl>
                                                  <a
                                                    id="close-fancy_info"
                                                    className="close"
                                                    onClick={() =>
                                                      setFancyinfoId(0)
                                                    }
                                                  >
                                                    Close
                                                  </a>
                                                </div> */}

                                              </h5>
                                              <dl className="bets-selections">
                                                <dt className="line_market-selection">
                                                  <dl className="tips tips-mob">
                                                    <dt>
                                                      <span id="before"></span>
                                                      {/* <span id="after" className="to-lose" style={{ display: "none" }}>( 490.00)</span> */}
                                                      <span
                                                        className={
                                                          item?.betProfit < 0
                                                            ? "to-lose text-danger"
                                                            : item?.betProfit >
                                                              0
                                                            ? "to-win text-green"
                                                            : ""
                                                        }
                                                        style={{
                                                          display: "block",
                                                        }}
                                                      >
                                                        {item?.betProfit ? (
                                                          <>
                                                            (
                                                            {parseFloat(
                                                              item?.betProfit
                                                            )?.toFixed(2)}
                                                            )
                                                          </>
                                                        ) : (
                                                          ""
                                                        )}
                                                      </span>
                                                    </dt>

                                                    <dd
                                                      id="remarkFirstRow"
                                                      style={{
                                                        display: "none",
                                                      }}
                                                    ></dd>
                                                    <dd
                                                      id="remarkSecondRow"
                                                      style={{
                                                        display: "none",
                                                      }}
                                                    ></dd>
                                                    {data && (
                                                      <a
                                                        id="fancyBetBookBtn"
                                                        className="btn-book"
                                                        onClick={() =>
                                                          onBookClick(
                                                            item,
                                                            data
                                                          )
                                                        }
                                                      >
                                                        Book
                                                      </a>
                                                    )}
                                                  </dl>
                                                </dt>
                                                <dd
                                                  id="lay_1"
                                                  onClick={() =>
                                                    BetClick(item, "l1", "t3")
                                                  }
                                                >
                                                  <a
                                                    className={`lay-1 ${
                                                      clickedBet?.sId ===
                                                        item.sId &&
                                                      clickedTableData === "l1"
                                                        ? "table-active-red"
                                                        : ""
                                                    } lay-1`}
                                                  >
                                                    {" "}
                                                    {item.l1}
                                                    <span>{item.ls1}</span>
                                                  </a>
                                                </dd>
                                                <dd
                                                  id="back_1"
                                                  onClick={() =>
                                                    BetClick(item, "b1", "t3")
                                                  }
                                                >
                                                  <a
                                                    className={`back-1 ${
                                                      clickedBet?.sId ===
                                                        item.sId &&
                                                      clickedTableData === "b1"
                                                        ? "table-active"
                                                        : ""
                                                    } back-1`}
                                                  >
                                                    {" "}
                                                    {item.b1}
                                                    <span>{item.bs1}</span>
                                                  </a>
                                                </dd>
                                                <dd className="mode-land"> </dd>
                                                <dd className="mode-land"></dd>
                                                {(item.status === "SUSPEND" ||
                                                  item.status ===
                                                    "BALL RUNNING") && (
                                                  <dd
                                                    id="suspend"
                                                    className="suspend-fancy"
                                                  >
                                                    <p className="info">
                                                      {" "}
                                                      {item.status === "SUSPEND"
                                                        ? "Suspend"
                                                        : item.status ===
                                                          "BALL RUNNING"
                                                        ? "Ball Running"
                                                        : ""}{" "}
                                                    </p>
                                                  </dd>
                                                )}
                                              </dl>
                                            </div>
                                            <table
                                              className="table custom-table inplay-table w1-table"
                                              style={{ margin: 0 }}
                                            >
                                              <tbody>
                                                {clickedBet?.sId === item.sId &&
                                                  window.innerWidth < 993 &&
                                                  item.status !== "SUSPEND" &&
                                                  item.status !==
                                                    "BALL RUNNING" && (
                                                    <BetBox
                                                      resetClicked={resetBet}
                                                      placeBetClicked={PlaceBat}
                                                      clickedBet={clickedBet}
                                                      clickedTable={
                                                        clickedTable
                                                      }
                                                      clickedTableData={
                                                        clickedTableData
                                                      }
                                                      isMobile={true}
                                                      setPlaceBetLoader={
                                                        setPlaceBetLoader
                                                      }
                                                    />
                                                  )}
                                              </tbody>
                                            </table>
                                            </>}
                                          </>
                                        );
                                      }
                                    )}
                                </div>
                              </>
                            ) : detailSport?.pre?.data?.t4?.length > 0 &&
                              detailSport?.matchInfo?.activeStatus?.premium ? (
                              <>
                                <div
                                  className="fancy-bet-txt"
                                  style={{ paddingTop: "10px" }}
                                >
                                  <div className="sportsbook_bet-head">
                                    <h4 className="fa-in-play">
                                      <span>Premium {detailSport.matchInfo.type === 'cricket' ? 'Cricket' : detailSport.matchInfo.type === 'soccer' ? 'Soccer' : 'Tennis'}</span>
                                      <a
                                        href="#feeds_premium"
                                        data-toggle="collapse"
                                        className="btn-head_rules"
                                        onClick={() => setPremiumPopup(true)}
                                      >
                                        Rules
                                      </a>
                                    </h4>
                                    {detailSport?.page?.data?.t3?.length > 0 &&
                                    detailSport?.matchInfo?.activeStatus
                                      ?.fancy ? (
                                      <a
                                        id="showFancyBetBtn"
                                        className="other-tab"
                                        onClick={
                                          detailSport?.page?.data?.t3?.length >
                                            0 &&
                                          detailSport?.matchInfo?.activeStatus
                                            ?.fancy
                                            ? () => setFancyPremium(true)
                                            : () => console.log()
                                        }
                                      >
                                        Fancy Bet
                                      </a>
                                    ) : (
                                      <></>
                                    )}
                                    <a
                                      data-tooltip-id="open-premium_info"
                                        id="open-premium_info"
                                        className="btn-fancy_info"
                                        onClick={() =>{
                                          setpermiumMinpopup(!permiumMinpopup);
                                          setMin(detailSport?.matchInfo
                                            ?.bet_premium_limit?.min)
                                            setMax(detailSport?.matchInfo
                                              ?.bet_premium_limit?.max)
                                        }
                                        }
                                    >Min</a>
                                    {/* <a
                                      id="minMaxBtn_2"
                                      href="#"
                                      className="btn-fancy_info"
                                      onClick={() => setpermiumMinpopup(true)}
                                    >
                                      Min
                                    </a>
                                    <div
                                      className={` odds_info-popup ${
                                        permiumMinpopup ? "active" : ""
                                      }`}
                                      id="fancy_popup_LUNCH_FAVOURITE"
                                    >
                                      <dl>
                                        <dt>Min</dt>
                                        <dd id="minMax">
                                          {" "}
                                          {
                                            detailSport?.matchInfo
                                              ?.bet_premium_limit?.min
                                          }
                                        </dd>
                                      </dl>
                                      <a
                                        id="close-odds_info"
                                        className="close"
                                        onClick={() =>
                                          setpermiumMinpopup(false)
                                        }
                                      >
                                        Close
                                      </a>
                                    </div> */}
                                  </div>

                                  <div className="fancy_bet_tab-wrap premium ">
                                    <ul
                                      id="pills-tab"
                                      role="tablist"
                                      className="nav nav-pills special_bets-tab "
                                    >
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "All" ? "active" : ""
                                          } `}
                                          onClick={() => setActivePin("All")}
                                        >
                                          All
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Popular"
                                              ? "active"
                                              : ""
                                          } `}
                                          onClick={() =>
                                            setActivePin("Popular")
                                          }
                                        >
                                          Popular
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Match"
                                              ? "active"
                                              : ""
                                          } `}
                                          onClick={() => setActivePin("Match")}
                                        >
                                          Match
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Innings"
                                              ? "active"
                                              : ""
                                          } `}
                                          onClick={() =>
                                            setActivePin("Innings")
                                          }
                                        >
                                          Innings
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "Over" ? "active" : ""
                                          } `}
                                          onClick={() => setActivePin("Over")}
                                        >
                                          Over
                                        </a>
                                      </li>
                                      <li
                                        role="presentation"
                                        className="nav-item"
                                      >
                                        <a
                                          className={`nav-link ${
                                            activePin === "More" ? "active" : ""
                                          } `}
                                          onClick={() => setActivePin("More")}
                                        >
                                          More
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>

                                <table style={{ width: "100%" }}>
                                  <tr>
                                    <td>
                                      <table className="bets w-100 premium-table">
                                        {detailSport?.matchInfo?.activeStatus
                                          ?.premium &&
                                          !blockStatus.blockAll &&
                                          !blockStatus.blockPremium &&
                                          detailSport.pre?.data?.t4?.length >
                                            0 &&
                                          detailSport.pre?.data?.t4?.map(
                                            (
                                              item: PreMainInterface,
                                              i: any
                                            ) => {
                                              if (item.status === "DEACTIVED") {
                                                return <></>;
                                              }
                                              return (
                                                <>
                                                  <tr
                                                    className="special_bet"
                                                    key={i}
                                                    onClick={() =>
                                                      OpenCollopsPre(
                                                        item.sortPriority
                                                      )
                                                    }
                                                  >
                                                    <td colSpan={7}>
                                                      <h3 className="marketHeader">
                                                        <a
                                                          id=""
                                                          title="Add to Multi Markets"
                                                          className="add-pin multiMarketPin"
                                                        >
                                                          <svg
                                                            width="11"
                                                            height="12"
                                                            viewBox="0 0 8 12"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                          >
                                                            <path
                                                              d="M6.714 5.25c.857.321 1.286.812 1.286 1.473 0 .232-.036.384-.107.455-.071.071-.214.107-.429.107h-2.893l-.429 4.714h-.286l-.429-4.714h-2.893c-.214 0-.357-.04-.429-.121-.071-.08-.107-.228-.107-.442 0-.661.429-1.152 1.286-1.473l.143-.054c.262-.107.429-.277.5-.509l.643-3.161v-.134c0-.143-.119-.259-.357-.348l-.036-.027h-.036c-.286-.089-.429-.241-.429-.455 0-.25.048-.406.143-.469.095-.063.262-.094.5-.094h3.286c.238 0 .405.031.5.094.095.063.143.219.143.469 0 .214-.143.366-.429.455h-.036l-.036.027c-.238.089-.357.205-.357.348v.134l.643 3.161c.071.232.238.402.5.509l.143.054z"
                                                              fill="rgb(255,255,255)"
                                                            />
                                                          </svg>
                                                        </a>
                                                        <a className="marketName">
                                                          {item.marketName}
                                                        </a>
                                                      </h3>
                                                    </td>
                                                  </tr>
                                                  {!openedPre.includes(
                                                    item.sortPriority
                                                  ) &&
                                                    item.sub_sb.length > 0 &&
                                                    item.sub_sb.map(
                                                      (
                                                        subItem: PreSubInterface,
                                                        j: any
                                                      ) => {
                                                        return (
                                                          <>
                                                            <tr
                                                              className="bg-white collapsable"
                                                              style={{
                                                                display:
                                                                  "inline-table",
                                                                width: "100%",
                                                              }}
                                                            >
                                                              <th colSpan={3}>
                                                                <dl className="fancy-th-layout">
                                                                  <dt>
                                                                    <p className="selectionName">
                                                                      {
                                                                        subItem.nat
                                                                      }
                                                                    </p>
                                                                    {subItem.betProfit && (
                                                                      <span className="premium_total0">
                                                                        <span
                                                                          id="premium_total0"
                                                                          className={
                                                                            subItem.betProfit >
                                                                            0
                                                                              ? "to-win"
                                                                              : "to-lose"
                                                                          }
                                                                        >
                                                                          {subItem.betProfit
                                                                            ? parseFloat(
                                                                                subItem.betProfit
                                                                              )?.toFixed(
                                                                                2
                                                                              )
                                                                            : 0}
                                                                        </span>
                                                                        <span
                                                                          id="premium_total0"
                                                                          className="new-fancy-total collapse"
                                                                        >
                                                                          1
                                                                        </span>
                                                                      </span>
                                                                    )}
                                                                  </dt>
                                                                </dl>
                                                              </th>
                                                              {/* onClick={() => BetClick(item, 'odds', 't4')} */}
                                                              <td
                                                                colSpan={2}
                                                                onClick={() =>
                                                                  BetClick(
                                                                    subItem,
                                                                    "odds",
                                                                    "t4",
                                                                    item
                                                                  )
                                                                }
                                                                className="back-1 no-liq spark_div_1886060226"
                                                              >
                                                                <a className="info">
                                                                  {subItem.odds}
                                                                </a>
                                                              </td>
                                                              <td
                                                                colSpan={2}
                                                                className="refer-book"
                                                              ></td>
                                                            </tr>
                                                            <table
                                                              className="table custom-table inplay-table w1-table"
                                                              style={{
                                                                margin: 0,
                                                              }}
                                                            >
                                                              {clickedBet?.sId ===
                                                                subItem.sId &&
                                                                window.innerWidth <
                                                                  993 && (
                                                                  <BetBox
                                                                    resetClicked={
                                                                      resetBet
                                                                    }
                                                                    placeBetClicked={
                                                                      PlaceBat
                                                                    }
                                                                    clickedBet={
                                                                      clickedBet
                                                                    }
                                                                    clickedTable={
                                                                      clickedTable
                                                                    }
                                                                    clickedTableData={
                                                                      clickedTableData
                                                                    }
                                                                    isMobile={
                                                                      true
                                                                    }
                                                                    setPlaceBetLoader={
                                                                      setPlaceBetLoader
                                                                    }
                                                                  />
                                                                )}
                                                              <tbody></tbody>
                                                            </table>

                                                            {/* <tr className="fancy-suspend-tr collapse">
                                                                                               <th colSpan={3}> </th>
                                                                                               <td colSpan={2} className="fancy-suspend-td">
                                                                                                   <div className="fancy-suspend-white"><span>Suspend</span>
                                                                                                   </div>
                                                                                               </td>
                                                                                               <td colSpan={2} className="refer-book"></td>
                                                                                           </tr> */}
                                                          </>
                                                        );
                                                      }
                                                    )}
                                                </>
                                              );
                                            }
                                          )}
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                        <div className="mb-50 hight-10"></div>
                      </div>
                    )}

                 {/* { !detailSport?.page && 
                    <OddsDammyData 
                    detailSport={detailSport} 
                    setoddMinMaxpopup={setoddMinMaxpopup}
                    oddMinMaxpopup = {oddMinMaxpopup}
                    setMarketPopup = {setMarketPopup}
                    />
                 }  */}
                 
                  </div>
                </>
              )}
            </div>

            {detailsPage.eventId && detailsPage.marketId && (
              <BetBox
                resetClicked={resetBet}
                placeBetClicked={PlaceBat}
                clickedBet={clickedBet}
                clickedTable={clickedTable}
                clickedTableData={clickedTableData}
                setPlaceBetLoader={setPlaceBetLoader}
              />
            )}
          </>
        </div>
      </div>

      {loginPopup && (
        <Login OpenModal={loginPopup} setOpenModal={setLoginPopup} />
      )}

      {positonModal && (
        <div
          className={`popup-wrp runposition  fade popup-show ${
            positonModal ? "" : ""
          }`}
        >
          <div className="pop">
            <div className="pop-content">
              <div className="pop-head">
                <h5> Run Position </h5>
                <div
                  className="pop-close"
                  onClick={() => closePositonPopup()}
                ></div>
              </div>
              <div className="pop-body">
                <table className="table table-bordered w-100 fonts-1 mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }} className="text-center">
                        Run
                      </th>
                      <th style={{ width: "50%" }} className="text-left">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="position">
                    {Object.keys(positonDetails)?.map((item: any, i: any) => {
                      return (
                        <tr>
                          <td
                            className={`text-center ${
                              positonDetails[item] < 0 ? "pink-bg" : "cyan-bg"
                            }`}
                          >
                            {item}
                          </td>
                          <td
                            className={`text-left ${
                              positonDetails[item] < 0 ? "pink-bg" : "cyan-bg"
                            }`}
                          >
                            {positonDetails[item]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pop-footer">
                <div
                  className={`button-wrap  pb-0 d_flex d_flex_justify_end d_flex_align_center w_100`}
                >
                  <button
                    onClick={() => closePositonPopup()}
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    data-bs-dismiss="modal"
                  >
                    {" "}
                    Close{" "}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {premiumPopup && (
        <div
          className={`popup-wrp premiumpopup fade popup-show ${
            premiumPopup ? "" : ""
          }`}
        >
          <div className="pop">
            <div className="pop-content">
              <div className="pop-head">
                <h5> Rules of Premium Cricket </h5>
                <a className="close" onClick={() => closePositonPopup()}>
                  Close
                </a>
              </div>

              <div className="popup-body">
                <div
                  id="sportradarCricketRules"
                  className="side-content rules-content"
                >
                  <dl className="download-list">
                    <dt className="icon-pdf">
                      <a href="/In_Play_Market_Details.pdf" className="ui-link">
                        Pre Match Market Details
                      </a>
                    </dt>
                    <dd>
                      <a href="/In_Play_Market_Details.pdf" className="ui-link">
                        download
                      </a>
                    </dd>
                  </dl>
                  <dl className="download-list">
                    <dt className="icon-pdf">
                      <a
                        href="/Pre_Match_Market_Details.pdf"
                        target="_blank"
                        className="ui-link"
                      >
                        In Play Market Details
                      </a>
                    </dt>
                    <dd>
                      <a
                        href="/Pre_Match_Market_Details.pdf"
                        target="_blank"
                        className="ui-link"
                      >
                        download
                      </a>
                    </dd>
                  </dl>
                </div>
              </div>

              <ul className="btn-list">
                <li>
                  <a
                    onClick={() => closePositonPopup()}
                    className="btn ui-link"
                  >
                    OK
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {fancyPopup && (
        <CommonPopup
          title={`Rules of Fancy Bets`}
          OpenModal={fancyPopup}
          closeModel={() => setFancyPopup(false)}
        >
          <ol id="fancyBetRules">
            <li>
              Once all session/fancy bets are completed and settled there will
              be no reversal even if the Match is Tied or is Abandoned.
              <ul>
                1.2 Middle session and Session is not completed due to Innings
                declared or all out so that particular over considered as
                completed and remaining over counted in next team Innings for
                ex:- In case of Innings declared or all out In 131.5th over
                Considered as 132 over completed remaining 1 over counted for
                133 over middle session and 3 over counted for 135 over session
                from next team Innings and One over session and Only over
                session is not completed due to innings declared so that
                Particular over session bets will be deleted and all out
                considered as valid for ex:- In case of Innings declared In
                131.5th over so 132 over will be deleted and if all out then 132
                over and Only 132 over will be Valid.
              </ul>
            </li>
            <li>
              Advance Session or Player Runs and all Fancy Bets are only valid
              for 20/50 overs full match each side. (Please Note this condition
              is applied only in case of Advance Fancy Bets only).
              <ul>
                • Adv Session Markets is Valid Only for First Innings of the
                Match
              </ul>
            </li>
            <li>
              All advance fancy bets market will be suspended 60 mins prior to
              match and will be settled.
            </li>
            <li>
              Under the rules of Session/Fancy Bets if a market gets Suspended
              for any reason whatsoever and does not resume then all previous
              Bets will remain Valid and become HAAR/JEET bets.
            </li>
            <li>
              Incomplete Session/Fancy Bet will be cancelled but Complete
              Session will be settled.
            </li>
            <li>
              In the case of Running Match getting Cancelled/ No Result/
              Abandoned but the session is complete it will still be settled.
              Player runs / fall of wicket will be also settled at the figures
              where match gets stopped due to rain for the inning (D/L) ,
              cancelled , abandoned , no result.
            </li>
            <li>
              If a player gets Retired Hurt and one ball is completed after you
              place your bets then all the betting till then is and will remain
              valid. We Consider Retired Out as Retired Hurt
            </li>
            <li>
              Should a Technical Glitch in Software occur, we will not be held
              responsible for any losses.
            </li>
            <li>
              Should there be a power failure or a problem with the Internet
              connection at our end and session/fancy market does not get
              suspended then our decision on the outcome is final.
            </li>
            <li>
              All decisions relating to settlement of wrong market being offered
              will be taken by management. Management will consider all actual
              facts and decision taken will be full in final.
            </li>
            <li>
              Any bets which are deemed of being suspicious, including bets
              which have been placed from the stadium or from a source at the
              stadium maybe voided at anytime. The decision of whether to void
              the particular bet in question or to void the entire market will
              remain at the discretion of Company. The final decision of whether
              bets are suspicious will be taken by Company and that decision
              will be full and final.
            </li>
            <li>
              Any sort of cheating bet , any sort of Matching (Passing of
              funds), Court Siding (Ghaobaazi on commentary), Sharpening,
              Commission making is not allowed in Company, If any company User
              is caught in any of such act then all the funds belonging that
              account would be seized and confiscated. No argument or claim in
              that context would be entertained and the decision made by company
              management will stand as final authority.
            </li>
            <li>
              Fluke hunting/Seeking is prohibited in Company , All the fluke
              bets will be reversed. Cricket commentary is just an additional
              feature and facility for company user but company is not
              responsible for any delay or mistake in commentary.
            </li>
            <li>
              Valid for only 1st inning.
              <ul>
                • Highest Inning Run :- This fancy is valid only for first
                inning of the match.
              </ul>
              <ul>
                • Lowest Inning Run :- This fancy is valid only for first inning
                of the match.
              </ul>
            </li>
            <li>
              If any fancy value gets passed, we will settle that market after
              that match gets over. For example :- If any market value is (
              22-24 ) and incase the result is 23 than that market will be
              continued, but if the result is 24 or above then we will settle
              that market. This rule is for the following market.
              <ul>• Total Sixes In Single Match</ul>
              <ul>• Total Fours In Single Match</ul>
              <ul>• Highest Inning Run</ul>
              <ul>• Highest Over Run In Single Match</ul>
              <ul>• Highest Individual Score By Batsman</ul>
              <ul>• Highest Individual Wickets By Bowler</ul>
            </li>
            <li>
              If any fancy value gets passed, we will settle that market after
              that match gets over. For example :- If any market value is (
              22-24 ) and incase the result is 23 than that market will be
              continued, but if the result is 22 or below then we will settle
              that market. This rule is for the following market.
              <ul>• Lowest Inning Run</ul>
              <ul>• Fastest Fifty</ul>
              <ul>• Fastest Century</ul>
            </li>
            <li>
              If any case wrong rate has been given in fancy ,that particular
              bets will be cancelled (Wrong Commentary).
            </li>
            <li>
              In case customer make bets in wrong fancy we are not liable to
              delete, no changes will be made and bets will be considered as
              confirm bet.
            </li>
            <li>
              Dot Ball Market Rules<ul>Wides Ball - Not Count</ul>
              <ul>No Ball - Not Count</ul>
              <ul>Leg Bye - Not Count as A Dot Ball</ul>
              <ul>Bye Run - Not Count as A Dot Ball</ul>
              <ul>Run Out - On 1st Run Count as A Dot Ball</ul>
              <ul>Run Out - On 2nd n 3rd Run Not Count as a Dot Ball</ul>
              <ul>
                Out - Catch Out, Bowled, Stumped n LBW Count as A Dot Ball
              </ul>
            </li>
            <li>
              Bookmaker Rules
              <ul>
                • Due to any reason any team will be getting advantage or
                disadvantage we are not concerned.
              </ul>
              <ul>
                • We will simply compare both teams 25 overs score higher score
                team will be declared winner in ODI.
              </ul>
              <ul>
                • We will simply compare both teams 10 overs higher score team
                will be declared winner in T20 matches.
              </ul>
            </li>
            <li>
              Penalty Runs - Any Penalty Runs Awarded in the Match (In Any
              Running Fancy or ADV Fancy) Will Not be Counted While Settling in
              our Exchange.
            </li>
            <li>
              LIVE STREAMING OF ALL VIRTUAL CRICKET MATCHES IS AVAILABLE HERE
              https://www.youtube.com/channel/UCd837ZyyiO5KAPDXibynq_Q/featured
            </li>
            <li>
              CHECK SCORE OF VIRTUAL CRICKET ON
              https://sportcenter.sir.sportradar.com/simulated-reality/cricket
            </li>
            <li>
              Comparison Market
              <ul>
                In Comparison Market We Don't Consider Tie or Equal Runs on Both
                the Innings While Settling . Second Batting Team Must need to
                Surpass 1st Batting's team Total to win otherwise on Equal Score
                or Below We declare 1st Batting Team as Winner .
              </ul>
            </li>
            <li>
              Player Boundaries Fancy:- We will only consider Direct Fours and
              Sixes hit by BAT.
            </li>
            <li>
              BOWLER RUN SESSION RULE :-
              <ul>
                IF BOWLER BOWL 1.1 OVER,THEN VALID ( FOR BOWLER 2 OVER RUNS
                SESSION )
              </ul>
              <ul>
                IF BOWLER BOWL 2.1 OVER,THEN VALID ( FOR BOWLER 3 OVER RUNS
                SESSION )
              </ul>
              <ul>
                IF BOWLER BOWL 3.1 OVER,THEN VALID ( FOR BOWLER 4 OVER RUNS
                SESSION )
              </ul>
              <ul>
                IF BOWLER BOWL 4.1 OVER,THEN VALID ( FOR BOWLER 5 OVER RUNS
                SESSION )
              </ul>
              <ul>
                IF BOWLER BOWL 9.1 OVER,THEN VALID ( FOR BOWLER 10 OVER RUNS
                SESSION )
              </ul>
            </li>
            <li>
              Total Match Playing Over ADV :- We Will Settle this Market after
              Whole Match gets Completed
              <ul>
                Criteria :- We Will Count Only Round- Off Over For Both the
                Innings While Settling (For Ex :- If 1st Batting team gets all
                out at 17.3 , 18.4 or 19.5 we Will Count Such Overs as 17, 18
                and 19 Respectively and if Match gets Ended at 17.2 , 18.3 or
                19.3 Overs then we will Count that as 17 , 18 and 19 Over
                Respectively... and this Will Remain Same For Both the Innings
                ..
              </ul>
              <ul>
                In Case Of Rain or if Over gets Reduced then this Market will
                get Voided
              </ul>
            </li>
            <li>
              3 WKT OR MORE BY BOWLER IN MATCH ADV :-
              <ul>
                We Will Settle this Market after Whole Match gets Completed .
              </ul>
              <ul>
                In Case Of Rain or if Over Gets Reduced then this Market Will
                get Voided
              </ul>
            </li>
            <li>
              KHADDA :-
              <ul>
                ADV Khadda Fancy is Valid Only for First Innings of the Match
              </ul>
              <ul>
                In Case of Rain or If Over Gets Reduced then this Market Will
                get Voided
              </ul>
              <ul>
                Incomplete Session Bet will be Cancelled but Complete Session
                Will be Settled
              </ul>
            </li>
            <li>
              LOTTERY :-
              <ul>
                In Case of Rain or If Over Gets Reduced then this Market Will
                get Voided
              </ul>
              <ul>
                Incomplete Session Bet will be Cancelled but Complete Session
                Will be Settled
              </ul>
              <ul>
                Criteria :- We will Only Count Last Digit of Sessions Total
                while settling ..For Example if in 6 Overs Market the Score is
                37 ...so we will Settle the Market for 6 Over Lottery @ 7
              </ul>
            </li>
            <li>
              Any cricket event which is being held behind closed doors in that
              if any players found to be taking advantage of groundline in fancy
              bets in such cases bets can be voided after the market ends .
              Company decision to be final .
            </li>
            <li>
              IPL 2021 RULES :-
              <ul>
                If Over Reduced in Match, we will not count the actual scores of
                the Over Reduced Matches instead we will count the Market’s
                Average Scores.
              </ul>
              <ul>
                If Match is Abandoned, we will not count the actual scores of
                the Abandoned Matches instead we will count the Market’s Average
                Scores.
              </ul>
              <ul>
                NOTE: -. These rules are for the following Markets of ENTIRE IPL
                2021 {`60 Matches`}: -
              </ul>
              <ul>
                Total Match 1st Over Run :- Average 6 Runs will be given if the
                match is abandoned or over reduced, But If 1st Over is Completed
                then it will not be counted as Average Score instead we will
                count the Actual Score if Over is Reduced after completion of
                1st Over.
              </ul>
              <ul>
                Total Fours: - Average 26 Fours will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Sixes: - Average 13 Sixes will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Wide: - Average 8 Wide’s will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Extras: - Average 14 Extras will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total No Ball: - Average 1 No Ball will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Duck: - Average 1 Duck will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Fifties: - Average 2 Fifties will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Century: -Average 0 Century will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Run Out: - Average 1 Run Out will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Wickets: - Average 12 Wickets will be given if the match
                is abandoned or over reduced.
              </ul>
              <ul>
                Total Caught out: - Average 8 Caught Out will be given if the
                match is abandoned or over reduced.
              </ul>
              <ul>
                Total Maiden Over: - Average 0 Maiden Over will be given if the
                match is abandoned or over reduced.
              </ul>
              <ul>
                Total LBW: - Average 1 LBW will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                Total Bowled: - Average 2 Bowled will be given if the match is
                abandoned or over reduced.
              </ul>
              <ul>
                • In case IPL Matches Gets Stopped or Interrupted Due to
                "COVID-19" or Any "ACT OF GOD" Reasons, Under 45 Matches then
                All IPL 2021 Tournament Fancy Markets will be Voided, But if 45
                or Above Matches are Being Played then we will Settle all the
                Fancy Markets and Also If there are NON Played Matches Above 45
                then we will settle the markets as per our Markets Average.
              </ul>
              <ul>
                * If IPL 2021 gets stopped due to “Covid-19” or Any “Act of God”
                reason then We will wait till 45 days from the day IPL gets
                stopped , and if IPL Matches gets Resumed before 45th day then
                we will continue as Usual Score Countation but if IPL 2021 does
                not resumes until 45th day then we will settle the markets
                according to our above mentioned Markets Averages and In case of
                Void, We will Void the under 45 matches on 45th day from the day
                IPL 2021 stopped.
              </ul>
            </li>
            <li>
              Session Odd-Even Rule:-
              <ul>
                We Will Settle the Session ODD-EVEN Market only if the Over is
                Completed, But If that Over is Not Completed then we will Void
                that “Session Total Odd” Market.
              </ul>
            </li>
            <li>
              Company reserves the right to void any bets (only winning bets) of
              any event at any point of the match if the company believes there
              is any cheating/wrong doing in that particular event by the
              players (either batsman/bowler)
            </li>
          </ol>
        </CommonPopup>
      )}

      {betPlacePopup && (
        <>
          <div className="betplacepopup message-wrap">
            <div className="message">
              <h4 id="popheader">{betdetails?.message}</h4>
              <p id="info">
                <span id="popsideType" className="back">
                  {betdetails?.data?.betSide}
                </span>
                <strong id="popselectionName">
                  {betdetails?.data?.selection}
                </strong>
                &nbsp;<strong id="popstake">{DD?.currency} {betdetails?.data?.betPlaced}</strong> at{" "}
                {betdetails?.data?.betType}{" "}
                <strong id="popodds">{betdetails?.data?.oddsUp}</strong>
              </p>
            </div>
            <a
              id="close"
              className="close ui-link"
              onClick={() => setBetPlacePopup(false)}
            >
              Close
            </a>
          </div>
        </>
      )}

      {marketPopup && (
        <MarketDepthPopup
          OpenSetting={marketPopup}
          setOpenSetting={setMarketPopup}
          data={detailSport}
        />
      )}

{(oddMinMaxpopup || true) && (                                   
    <Tooltip
    id="info-icon"
      // anchorSelect="#info-icon"                                
      place="top"
      style={{ backgroundColor: '#d0d6db', color: 'black', padding: '10px', border: '1px solid #ccc' }}
      // events={['click']}
      openOnClick={true}
      // noArrow={true}
      // arrowColor="red"
      variant="info"
    >
      {/* <div className="tooltip-arrow">{"<"}</div> */}
      <div className="tooltip-content">
        <div className="upper">min/max</div>
        <div className="lower">{showMin}/{showMax}</div>
      </div>
    </Tooltip>
  )}
{(oddsinfoId || true) && (                                   
    <Tooltip
    id="open-odds_info"
      // anchorSelect="#info-icon"                                
      place="left"
      style={{ backgroundColor: '#d0d6db', color: 'black', padding: '10px', border: '1px solid #ccc' }}
      // events={['click']}
      openOnClick={true}
      // noArrow={true}
      // arrowColor="red"
      variant="info"
    >
      {/* <div className="tooltip-arrow">{"<"}</div> */}
      <div className="tooltip-content">
        <div className="upper">min/max</div>
        <div className="lower">{showMin}/{showMax}</div>
      </div>
    </Tooltip>
  )}
{(fancyMinMaxPopup || true) && (                                   
    <Tooltip
    id="open-fancy_info"
      // anchorSelect="#info-icon"                                
      place="left"
      style={{ backgroundColor: '#d0d6db', color: 'black', padding: '10px', border: '1px solid #ccc' }}
      // events={['click']}
      openOnClick={true}
      // noArrow={true}
      // arrowColor="red"
      variant="info"
    >
      {/* <div className="tooltip-arrow">{"<"}</div> */}
      <div className="tooltip-content">
        <div className="upper">min/max</div>
        <div className="lower">{showMin}/{showMax}</div>
      </div>
    </Tooltip>
  )}
{(permiumMinpopup || true) && (                                   
    <Tooltip
    id="open-premium_info"
      // anchorSelect="#info-icon"                                
      place="left"
      style={{ backgroundColor: '#d0d6db', color: 'black', padding: '10px', border: '1px solid #ccc' }}
      // events={['click']}
      openOnClick={true}
      // noArrow={true}
      // arrowColor="red"
      variant="info"
    >
      {/* <div className="tooltip-arrow">{"<"}</div> */}
      <div className="tooltip-content">
        <div className="upper">min/max</div>
        <div className="lower">{showMin}/{showMax}</div>
      </div>
    </Tooltip>
  )}
    </>
  );
};

export default MultiMarket;
