import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { ADMIN_API } from "../../../common/common";
import { getComparator, Logout, stableSort } from "../../../common/Funcation";
import { postApi, sendEvent } from "../../../service";
import { dataInterface } from "../../Setting/interface";
import SearchInput from "../../../components/SearchInput";
import { styleObjectGetBG } from "../../../common/StyleSeter";

interface UserId {
  _id: string;
  agent_level: string;
  user_name: string;
}

interface BET_LIST_INTERFACE {
  _id: string;
  userId: UserId;
  matchId: string;
  type: string;
  betType: string;
  betSide: string;
  selection: string;
  betId: number;
  stake: number;
  oddsUp: number;
  oddsDown: number;
  exposure: number;
  deleted: boolean;
  createdAt: Date;
}

interface t1Interface {
  b1: number;
  b2: number;
  b3: number;
  bs1: number;
  bs2: number;
  bs3: number;
  gType: string;
  inPlay: boolean;
  l1: number;
  l2: number;
  l3: number;
  ls1: number;
  ls2: number;
  ls3: number;
  marketId: string;
  nat: string;
  openDate: string;
  betProfit?: number | any;
  sId: number;
  sortPriority: number;
  status: string;
}

interface FancyInterface {
  b1: number;
  bs1: number;
  gType: string;
  l1: number;
  ls1: number;
  marketId: string;
  nat: string;
  betProfit?: number | any;
  sId: number;
  sortPriority: number;
  status: string;
  status1: number;
}

interface PreSubInterface {
  nat: string;
  odds: number;
  sId: number;
  sortPriority: number;
  betProfit: any;
}

interface PreMainInterface {
  gType: string;
  id: string;
  marketId: string;
  marketName: string;
  sortPriority: number;
  status: string;
  sub_sb: PreSubInterface[];
}

function RiskManagementDetail() {
  const [OpenDD, setOpenDD] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [fancyPremium, setFancyPremium] = useState(false);
  const [openedPre, setOpenedPre] = useState<any>([]);
  const dispatch = useDispatch();
  const [openAccordian, setopenAccordian] = useState(false);
  const [openAdminbook, setopenAdminbook] = useState(false);
  const clickedGame = useSelector((e: any) => e.clickedGame);
  const SPORT_DETAILS = useSelector((e: any) => e.sportDetails);
  const [sportDetail, setSportDetail] = useState(SPORT_DETAILS);
  const [teamName, setTeamName] = useState([]);
  const [pageData, setPageData] = useState<any>({});
  const [getBlockData, setGetBlockData] = useState<any>({});
  const HeaderData = useSelector((e: any) => e.Header);
  const [BetTypeValue, setBetTypeValue] = useState<any>([]);
  const [searchValue, setSearchValue] = useState("");
  const DD = useSelector((e: any) => e.domainDetails);
  const [domainDetails, setDomainDetails] = useState(DD);
  
  useEffect(() => {
    if (SPORT_DETAILS) {
      setSportDetail(SPORT_DETAILS);
      setTeamName(SPORT_DETAILS?.matchInfo?.name.split(" v "));
    }
    return () => { };
  }, [SPORT_DETAILS]);
  useEffect(() => {
    if (clickedGame) {
      setTimeout(() => {
        sendEvent("GET_SPORTS_DETAILS", clickedGame);
      }, 500);
      setInterval(() => {
        sendEvent("GET_SPORTS_DETAILS", clickedGame);
      }, 5000);
    }
    return () => { };
  }, [clickedGame]);
  useEffect(() => {
    getPageData();
    getBlockStatus();
    return () => { };
  }, []);

  const handleSearchSubmit = (search: any) => {
    setSearchValue(search);
    getPageData(BetTypeValue, search);
  };
  const handleBetTypeSearch = async (betValuesData: any) => {
    // getPageData(search);
    console.log("handleBetTypeSearch ::: ", betValuesData);
    // if (betValuesData.length) {
    //   const filterData = betValuesData.map((e: any) => e.value);
    //   await setBetTypeValue(filterData);
    // } else {
    //   await setBetTypeValue([]);
    // }

    // console.log("handleBetTypeSearch ::: BetTypeValue :: ", BetTypeValue);
    getPageData(betValuesData, searchValue);
  };

  const getPageData = async (BetTypeVal: any[] = [], SEARCH: string = "") => {
    let data: any = {
      api: ADMIN_API.RISK_BET_LIST,
      value: {
        id: id,
      },
    };
    console.log("handleBetTypeSearch :111: searchValue :", searchValue, SEARCH);
    if (SEARCH !== "") {
      data.value.search = SEARCH;
    }

    const filterData: any = BetTypeVal.map((e: any) => e?.value);

    await setBetTypeValue(BetTypeVal);
    console.log("handleBetTypeSearch :111: filterData : ", filterData);

    if (filterData.length) {
      data.value.betType = filterData;
    }

    await postApi(data)
      .then(function (response) {
        console.log("::::::=-=-=-=>>>>>", response);
        setPageData(response.data.data);
        dispatch({ type: "USER_BET_HISTORY", payload: response.data.data });
      })
      .catch((err) => {
        debugger;
        if (err.response?.data?.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  console.log(":::::;;", sportDetail);

  const options = [
    { value: "odds", label: "Odds" },
    { value: "bookMark", label: "BookMark" },
    { value: "session", label: "Session" },
    { value: "premium", label: "Premium" },
  ];

  const checkBoxChange = async (e: any, item: BET_LIST_INTERFACE) => {
    const deleted = item.deleted;
    let data: any = {
      api: ADMIN_API.RISK_DELETE_BET,
      value: {
        id: item._id,
        flag: !deleted,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("::::::=-=-=-=>>>>>", response);
        getPageData();
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const getBlockStatus = async () => {
    let data: any = {
      api: ADMIN_API.RISK_GET_BLOCK,
      value: {
        matchId: id,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("::::::=-=-=-=>>>>>", response);
        if (JSON.stringify(response.data.data.blockMatchDetail) === "{}") {
          setGetBlockData({
            blockAll: false,
            blockOdds: false,
            blockBookMaker: false,
            blockFancy: false,
            blockPremium: false,
            matchId: id,
          });
        } else {
          setGetBlockData(response.data.data.blockMatchDetail);
        }
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
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

  const updateBlockSelected = async (key: string) => {
    let data: any = {
      api: ADMIN_API.RISK_UPDATE_BLOCK,
      value: {
        blockAll: getBlockData.blockAll,
        blockOdds: getBlockData.blockOdds,
        blockBookMaker: getBlockData.blockBookMaker,
        blockFancy: getBlockData.blockFancy,
        blockPremium: getBlockData.blockPremium,
        matchId: id,
        [key]: !getBlockData[key],
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("::::::=-=-=-=>>>>>11", response);
        getBlockStatus();
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const refreshPage = (e:any)=>{
    e.preventDefault();
    if (clickedGame) {
      setTimeout(() => {
        sendEvent("GET_SPORTS_DETAILS", clickedGame);
      }, 500);
      setInterval(() => {
        sendEvent("GET_SPORTS_DETAILS", clickedGame);
      }, 5000);
    }
    getPageData();
    getBlockStatus();
  }
  return (
    <div className="container riskmang main_wrap" onClick={() => setOpenDD(false)}>
      <div className="top_header">
        <div className="top_header_title mt-3">
          <h5 className="font-weight-bold">
            {sportDetail && sportDetail?.matchInfo?.name} Risk Management Detail
          </h5>
          
        </div>
      </div>
      <div className="risk-management-detail">
        <div className="card mb-1">
          <div className="card_header">
            <div className="d_flex d_flex_align_center">
              <div className="col-4">
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-secondary shadow-none dropdown-toggle"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDD(!OpenDD);
                    }}
                  >
                    Block Option
                  </button>
                  <ul
                    className={`dropdown-menu block-option ${OpenDD ? "show" : ""
                      }`}
                  >
                    <li>
                      <a
                        onClick={() => updateBlockSelected("blockAll")}
                        className={`dropdown-item ${getBlockData?.blockAll ? "selected" : ""
                          }`}
                      >
                        {!getBlockData?.blockAll ? "Block" : "Unblock"} All
                      </a>
                    </li>
                    <li className="text-uppercase">
                      <a
                        onClick={() => updateBlockSelected("blockOdds")}
                        className={`dropdown-item ${getBlockData?.blockOdds ? "selected" : ""
                          }`}
                      >
                        {!getBlockData?.blockOdds ? "Block" : "Unblock"} ODDS
                      </a>
                    </li>
                    <li className="text-uppercase">
                      <a
                        onClick={() => updateBlockSelected("blockBookMaker")}
                        className={`dropdown-item ${getBlockData?.blockBookMaker ? "selected" : ""
                          }`}
                      >
                        {!getBlockData?.blockBookMaker ? "Block" : "Unblock"}{" "}
                        BOOKMAKER
                      </a>
                    </li>
                    <li className="text-uppercase">
                      <a
                        onClick={() => updateBlockSelected("blockFancy")}
                        className={`dropdown-item ${getBlockData?.blockFancy ? "selected" : ""
                          }`}
                      >
                        {!getBlockData?.blockFancy ? "Block" : "Unblock"}{" "}
                        SESSION
                      </a>
                    </li>
                    <li className="text-uppercase">
                      <a
                        onClick={() => updateBlockSelected("blockPremium")}
                        className={`dropdown-item ${getBlockData?.blockPremium ? "selected" : ""
                          }`}
                      >
                        {!getBlockData?.blockPremium ? "Block" : "Unblock"}{" "}
                        PREMIUM
                      </a>
                    </li>
                  </ul>

                  
                </div>
                
              </div>
              
              <div className="col-6">
                <h6 className="m-0">
                  <strong>
                    {sportDetail && sportDetail?.matchInfo?.name} [
                    {sportDetail?.matchInfo?.openDate}]
                  </strong>
                </h6>
              </div>

              <div className="col-2">
              <button
                    className="btn btn-sm btn-secondary shadow-none"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshPage(e);
                    }}
                    style={styleObjectGetBG(domainDetails?.colorSchema)}
                  >
                    refresh
                  </button>
              </div>
            </div>
          </div>

          <div className="card_body" style={{ padding: "0" }}>
            <div className="d_flex">
              {sportDetail?.page?.data?.t1?.length === 0 &&
                sportDetail?.page?.data?.t2?.length === 0 &&
                sportDetail?.page?.data?.t3?.length === 0 &&
                sportDetail?.pre?.data?.t4?.length === 0 ? (
                <>
                  <div
                    className="col-7"
                    style={{
                      height: 500,
                      minHeight: 500,
                      background: "#fdf0c8",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <h2>No match data available!</h2>
                  </div>
                </>
              ) : (
                <div className="col-7">
                  {/* <h4 className="text-center alert alert-warning nodata" style={{height:"70vh",paddingTop:"35vh"}}>No match data available!</h4> */}

                  <div className="match-detail">
                    <div className="inplay-tableblock table-responsive">
                      {!getBlockData.blockAll && !getBlockData.blockOdds && (
                        <table className="table custom-table inplay-table w1-table">
                          <tbody>
                            <tr className="betstr">
                              <td className="text-color-grey opacity-1">
                                <span className="totselection seldisplay">
                                  {sportDetail?.page?.data?.t1?.length}{" "}
                                  Selections
                                </span>
                              </td>
                              <td colSpan={2}>101.7%</td>
                              <td>
                                <span>Back</span>
                              </td>
                              <td>
                                <span>Lay</span>
                              </td>
                              <td colSpan={2}>97.9%</td>
                            </tr>
                            {sportDetail?.page?.data?.t1?.length > 0
                              ? stableSort(
                                sportDetail.page?.data?.t1,
                                getComparator("asc", "sortPriority")
                              ).map((item: t1Interface) => {
                                return (
                                  <>
                                    <tr className="bg-white tr-odds tr_team1">
                                      <td>
                                        <img src="/images/bars.png" alt="" />{" "}
                                        <b className="team1">{item.nat}</b>
                                        <div>
                                          <span
                                            className={`team_bet_count_old ${item?.betProfit < 0
                                              ? "to-lose"
                                              : "to-win"
                                              }`}
                                          >
                                            ({" "}
                                            <span className="team_total">
                                              {item?.betProfit
                                                ? item?.betProfit?.toFixed(2)
                                                : 0}
                                            </span>
                                            )
                                          </span>
                                        </div>
                                      </td>
                                      <td className="light-blue-bg-2 opnForm ODDSBack td_team1_back_2">
                                        <a
                                          href="javascript:void(0)"
                                          className="back1btn text-color-black"
                                        >
                                          {" "}
                                          {item.b1} <br />
                                          <span>{item.bs1}</span>
                                        </a>
                                      </td>
                                      <td
                                        data-team="team1"
                                        className="light-blue-bg-3 ODDSBack td_team1_back_1"
                                      >
                                        <a
                                          href="javascript:void(0)"
                                          className="back1btn text-color-black"
                                        >
                                          {" "}
                                          {item.b2} <br />
                                          <span>{item.bs2}</span>
                                        </a>
                                      </td>
                                      <td
                                        data-team="team1"
                                        className="cyan-bg ODDSBack td_team1_back_0"
                                      >
                                        <a
                                          href="javascript:void(0)"
                                          className="back1btn text-color-black"
                                        >
                                          {" "}
                                          {item.b3} <br />
                                          <span>{item.bs3}</span>
                                        </a>
                                      </td>
                                      <td
                                        data-team="team1"
                                        className="pink-bg ODDSLay td_team1_lay_0"
                                      >
                                        <a
                                          href="javascript:void(0)"
                                          className="lay1btn text-color-black"
                                        >
                                          {" "}
                                          {item.l1} <br />
                                          <span>{item.ls1}</span>
                                        </a>
                                      </td>
                                      <td
                                        data-team="team1"
                                        className="light-pink-bg-2 ODDSLay td_team1_lay_1"
                                      >
                                        <a
                                          href="javascript:void(0)"
                                          className="lay1btn text-color-black"
                                        >
                                          {" "}
                                          {item.l2} <br />
                                          <span>{item.ls2}</span>
                                        </a>
                                      </td>
                                      <td
                                        data-team="team1"
                                        className="light-pink-bg-3 ODDSLay td_team1_lay_2"
                                      >
                                        <a
                                          href="javascript:void(0)"
                                          className="lay1btn text-color-black"
                                        >
                                          {" "}
                                          {item.l3} <br />
                                          <span>{item.ls3}</span>
                                        </a>
                                      </td>
                                    </tr>
                                    {item.status === "SUSPEND" && (
                                      <tr className="fancy-suspend-tr">
                                        <td></td>
                                        <td
                                          colSpan={6}
                                          className="fancy-suspend-td"
                                        >
                                          <div className="fancy-suspend black-bg-5 text-color-white">
                                            <span>SUSPENDED</span>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                );
                              })
                              : "No DATA"}
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div className="bookmarket_table inplay-tableblock table-responsive">
                      {!getBlockData.blockAll &&
                        !getBlockData.blockBookMaker && (
                          <table className="table custom-table inplay-table w1-table">
                            <tbody>
                              <tr>
                                <td
                                  colSpan={7}
                                  className="text-color-grey fancybet-block"
                                  style={{ padding: "0" }}
                                >
                                  <div className="dark-blue-bg-1 text-color-white">
                                    <img src="/images/pin-bg.png" />
                                    Bookmaker Market{" "}
                                    <span className="zeroopa">
                                      | Zero Commission
                                    </span>
                                    <div className="mobile-bookmark-min-max-popup">
                                      <a
                                        href="https://ag.mysky247.xyz/backend/match/risk-management/31720403#feeds_for_bookmarket"
                                        data-toggle="collapse"
                                        aria-expanded="false"
                                        className="collapsed"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="15"
                                          height="15"
                                          viewBox="0 0 15 15"
                                        >
                                          <path
                                            fill="%233B5160"
                                            fill-rule="evenodd"
                                            d="M6.76 5.246V3.732h1.48v1.514H6.76zm.74 8.276a5.86 5.86 0 0 0 3.029-.83 5.839 5.839 0 0 0 2.163-2.163 5.86 5.86 0 0 0 .83-3.029 5.86 5.86 0 0 0-.83-3.029 5.839 5.839 0 0 0-2.163-2.163 5.86 5.86 0 0 0-3.029-.83 5.86 5.86 0 0 0-3.029.83A5.839 5.839 0 0 0 2.308 4.47a5.86 5.86 0 0 0-.83 3.029 5.86 5.86 0 0 0 .83 3.029 5.839 5.839 0 0 0 2.163 2.163 5.86 5.86 0 0 0 3.029.83zM7.5 0c1.37 0 2.638.343 3.804 1.028a7.108 7.108 0 0 1 2.668 2.668A7.376 7.376 0 0 1 15 7.5c0 1.37-.343 2.638-1.028 3.804a7.108 7.108 0 0 1-2.668 2.668A7.376 7.376 0 0 1 7.5 15a7.376 7.376 0 0 1-3.804-1.028 7.243 7.243 0 0 1-2.668-2.686A7.343 7.343 0 0 1 0 7.5c0-1.358.343-2.62 1.028-3.786a7.381 7.381 0 0 1 2.686-2.686A7.343 7.343 0 0 1 7.5 0zm-.74 11.268V6.761h1.48v4.507H6.76z"
                                          ></path>
                                        </svg>
                                      </a>{" "}
                                      <div
                                        id="feeds_for_bookmarket"
                                        className="fancy_minmax_info text-let collapse"
                                      >
                                        <dl className="text-center">
                                          <dt>Min / Max</dt>{" "}
                                          <dd id="minMax"> 1 / 50000</dd>
                                        </dl>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr className="betstr bg-light-yellow">
                                <td></td>
                                <td colSpan={2}> </td>
                                <td>
                                  {" "}
                                  <span>Back</span>{" "}
                                </td>
                                <td>
                                  {" "}
                                  <span>Lay</span>{" "}
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                              {sportDetail?.page?.data?.t2?.length > 0
                                ? stableSort(
                                  sportDetail.page?.data?.t2,
                                  getComparator("asc", "sortPriority")
                                ).map((item: t1Interface) => {
                                  return (
                                    <>
                                      <tr className="bg-white tr-odds tr_team1">
                                        <td>
                                          <b className="team1">{item.nat}</b>{" "}
                                          <div>
                                            <span
                                              className={`team_bet_count_old ${item?.betProfit < 0
                                                ? "to-lose"
                                                : "to-win"
                                                }`}
                                            >
                                              (
                                              <span className="team_total">
                                                {item?.betProfit
                                                  ? item?.betProfit?.toFixed(
                                                    2
                                                  )
                                                  : 0}
                                              </span>
                                              )
                                            </span>
                                          </div>
                                        </td>
                                        <td className="light-blue-bg-2 opnForm ODDSBack td_team1_back_2">
                                          <a
                                            href="javascript:void(0)"
                                            className="back1btn text-color-black"
                                          >
                                            {" "}
                                            {item.b1} <br />
                                            <span>{item.bs1}</span>
                                          </a>
                                        </td>
                                        <td
                                          data-team="team1"
                                          className="light-blue-bg-3 ODDSBack td_team1_back_1"
                                        >
                                          <a
                                            href="javascript:void(0)"
                                            className="back1btn text-color-black"
                                          >
                                            {" "}
                                            {item.b2} <br />
                                            <span>{item.bs2}</span>
                                          </a>
                                        </td>
                                        <td
                                          data-team="team1"
                                          className="cyan-bg ODDSBack td_team1_back_0"
                                        >
                                          <a
                                            href="javascript:void(0)"
                                            className="back1btn text-color-black"
                                          >
                                            {" "}
                                            {item.b3} <br />
                                            <span>{item.bs3}</span>
                                          </a>
                                        </td>
                                        <td
                                          data-team="team1"
                                          className="pink-bg ODDSLay td_team1_lay_0"
                                        >
                                          <a
                                            href="javascript:void(0)"
                                            className="lay1btn text-color-black"
                                          >
                                            {" "}
                                            {item.l1} <br />
                                            <span>{item.ls1}</span>
                                          </a>
                                        </td>
                                        <td
                                          data-team="team1"
                                          className="light-pink-bg-2 ODDSLay td_team1_lay_1"
                                        >
                                          <a
                                            href="javascript:void(0)"
                                            className="lay1btn text-color-black"
                                          >
                                            {" "}
                                            {item.l2} <br />
                                            <span>{item.ls2}</span>
                                          </a>
                                        </td>
                                        <td
                                          data-team="team1"
                                          className="light-pink-bg-3 ODDSLay td_team1_lay_2"
                                        >
                                          <a
                                            href="javascript:void(0)"
                                            className="lay1btn text-color-black"
                                          >
                                            {" "}
                                            {item.l3} <br />
                                            <span>{item.ls3}</span>
                                          </a>
                                        </td>
                                      </tr>
                                      {item.status === "SUSPEND" && (
                                        <tr className="fancy-suspend-tr">
                                          <td></td>
                                          <td
                                            colSpan={6}
                                            className="fancy-suspend-td"
                                          >
                                            <div className="fancy-suspend black-bg-5 text-color-white">
                                              <span>SUSPENDED</span>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </>
                                  );
                                })
                                : "No DATA"}
                            </tbody>
                          </table>
                        )}
                    </div>

                    <div className="fancy-section">
                      {/* {!fancyPremium && <} */}

                      {fancyPremium &&
                        sportDetail?.pre?.data?.t4?.length > 0 ? (
                        <div className="fancy-section premiume">
                          <div className="fancybetdiv fancy-bet-txt ">
                            <div className="sportsbook_bet-head ">
                              <h4 className="fa-in-play">
                                <span className="primary-theme-color">
                                  Premium Cricket
                                </span>
                                <a
                                  href="javascript:void(0)"
                                  data-toggle="modal"
                                  className="btn-head_rules"
                                  data-target="#rulesFancyBetsModal"
                                >
                                  Rules
                                </a>
                              </h4>
                              <a
                                href="javascript:void(0)"
                                id="showSportsBookBtn"
                                onClick={
                                  sportDetail?.page?.data?.t3.length > 0
                                    ? () => setFancyPremium(false)
                                    : () => console.log()
                                }
                                className="other-tab"
                              >
                                <span className="tag-new">New</span>{" "}
                                <span>Fancy Bet</span>
                              </a>
                            </div>
                          </div>

                          <div
                            id="fancyBetTabWrap"
                            className="fancy_bet_tab-wrap primary-theme-color general"
                          >
                            <ul
                              id="pills-tab"
                              role="tablist"
                              className="nav nav-pills special_bets-tab"
                            >
                              <li role="presentation" className="nav-item">
                                {" "}
                                <a
                                  href="javascript:void(0)"
                                  id="pills-home-tab"
                                  className="nav-link active"
                                >
                                  All
                                </a>{" "}
                              </li>
                              <li role="presentation" className="nav-item">
                                {" "}
                                <a
                                  href="javascript:void(0)"
                                  id="pills-profile-tab"
                                  aria-controls="pills-fancy"
                                  aria-selected="false"
                                  className="nav-link"
                                >
                                  Fancy
                                </a>{" "}
                              </li>
                              <li role="presentation" className="nav-item">
                                {" "}
                                <a
                                  href="javascript:void(0)"
                                  id="pills-contact-tab"
                                  className="nav-link"
                                >
                                  Ball by Ball
                                </a>{" "}
                              </li>
                              <li role="presentation" className="nav-item">
                                {" "}
                                <a
                                  href="javascript:void(0)"
                                  id="pills-contact-tab"
                                  className="nav-link"
                                >
                                  Khadda
                                </a>{" "}
                              </li>
                              <li role="presentation" className="nav-item">
                                {" "}
                                <a
                                  href="javascript:void(0)"
                                  id="pills-contact-tab"
                                  className="nav-link"
                                >
                                  Lottery
                                </a>{" "}
                              </li>
                              <li role="presentation" className="nav-item">
                                {" "}
                                <a
                                  href="javascript:void(0)"
                                  id="pills-contact-tab"
                                  className="nav-link"
                                >
                                  Odd/Even
                                </a>{" "}
                              </li>
                            </ul>
                          </div>

                          {!getBlockData.blockAll &&
                            !getBlockData.blockPremium &&
                            sportDetail.pre?.data?.t4.length > 0 &&
                            sportDetail.pre?.data?.t4.map(
                              (item: PreMainInterface, i: any) => {
                                // if (item.status === "DEACTIVED") {
                                //     return <></>
                                // }
                                return (
                                  <>
                                    <div
                                      className="tab-content"
                                      id="pills-tabContent"
                                    >
                                      <p
                                        className="fancyBetSpecialBet p-2"
                                        onClick={() =>
                                          OpenCollopsPre(item.sortPriority)
                                        }
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 384 512"
                                          width={9}
                                          height={10}
                                          style={{ marginRight: "5px" }}
                                        >
                                          <path
                                            style={{ fill: "#fff" }}
                                            d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3H32c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64H64C46.3 64 32 49.7 32 32zM160 384h64v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V384z"
                                          />
                                        </svg>
                                        {item.marketName}
                                      </p>
                                      <div className="tab_pane">
                                        <div
                                          className="bookmarket_table inplay-tableblock  table-responsive"
                                          style={{ padding: "0" }}
                                        >
                                          <table className="table custom-table inplay-table w1-table">
                                            <tbody>
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
                                                        <tr className="bg-white">
                                                          <td
                                                            colSpan={3}
                                                            className="item-name d-flex1"
                                                            style={{
                                                              width: "100%",
                                                            }}
                                                          >
                                                            <div className="row">
                                                              <div className="col-sm-10 col-12 ">
                                                                <b className="d_block">
                                                                  {subItem.nat}
                                                                </b>
                                                                <span className="premium_total0">
                                                                  <span
                                                                    id="premium_total0"
                                                                    className={
                                                                      subItem.betProfit >
                                                                        0
                                                                        ? "to-win text-green"
                                                                        : "to-lose"
                                                                    }
                                                                  >
                                                                    {subItem.betProfit
                                                                      ? subItem?.betProfit?.toFixed(
                                                                        2
                                                                      )
                                                                      : 0}
                                                                  </span>
                                                                  {/* <span id="premium_total0" className="new-fancy-total collapse">1</span> */}
                                                                </span>
                                                              </div>
                                                            </div>
                                                          </td>
                                                          <td
                                                            colSpan={2}
                                                            className="back-1 no-liq "
                                                          >
                                                            <a className="info">
                                                              {subItem.odds}
                                                            </a>
                                                          </td>
                                                        </tr>
                                                      </>
                                                    );
                                                  }
                                                )}
                                              {/* suspend */}
                                              {/* <tr className="fancy-suspend-tr">
                                          <td></td>
                                          <td colSpan={4} className="fancy-suspend-td">
                                            <div className="fancy-suspend black-bg-5 text-color-white">
                                              <span>SUSPENDED</span>
                                            </div>
                                          </td>
                                          <td></td>
                                        </tr> */}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                );
                              }
                            )}
                        </div>
                      ) : !getBlockData.blockAll &&
                        !getBlockData.blockFancy &&
                        sportDetail?.page?.data?.t3.length > 0 ? (
                        <>
                          <div className="fancy-section">
                            <div className="fancybetdiv fancy-bet-txt ">
                              <div className="fancy_bet-head ">
                                <h4 className="fa-in-play">
                                  <span className="primary-theme-color">
                                    Fancy Bet
                                  </span>
                                  <a
                                    href="javascript:void(0)"
                                    data-toggle="modal"
                                    className="btn-head_rules"
                                    data-target="#rulesFancyBetsModal"
                                  >
                                    Rules
                                  </a>
                                </h4>
                                <a
                                  href="javascript:void(0)"
                                  id="showSportsBookBtn"
                                  className="other-tab"
                                  onClick={() => setFancyPremium(true)}
                                >
                                  <span className="tag-new">New</span>{" "}
                                  <span>Premium Cricket</span>
                                </a>
                              </div>
                            </div>

                            <div
                              id="fancyBetTabWrap"
                              className="fancy_bet_tab-wrap primary-theme-color general"
                            >
                              <ul
                                id="pills-tab"
                                role="tablist"
                                className="nav nav-pills special_bets-tab"
                              >
                                <li role="presentation" className="nav-item">
                                  <a
                                    href="javascript:void(0)"
                                    id="pills-home-tab"
                                    className="nav-link active"
                                  >
                                    All
                                  </a>
                                </li>{" "}
                                <li role="presentation" className="nav-item">
                                  <a
                                    href="javascript:void(0)"
                                    id="pills-profile-tab"
                                    aria-controls="pills-fancy"
                                    aria-selected="false"
                                    className="nav-link"
                                  >
                                    Fancy
                                  </a>
                                </li>
                                <li role="presentation" className="nav-item">
                                  <a
                                    href="javascript:void(0)"
                                    id="pills-contact-tab"
                                    className="nav-link"
                                  >
                                    Ball by Ball
                                  </a>
                                </li>
                                <li role="presentation" className="nav-item">
                                  <a
                                    href="javascript:void(0)"
                                    id="pills-contact-tab"
                                    className="nav-link"
                                  >
                                    Khadda
                                  </a>
                                </li>
                                <li role="presentation" className="nav-item">
                                  <a
                                    href="javascript:void(0)"
                                    id="pills-contact-tab"
                                    className="nav-link"
                                  >
                                    Lottery
                                  </a>
                                </li>
                                <li role="presentation" className="nav-item">
                                  <a
                                    href="javascript:void(0)"
                                    id="pills-contact-tab"
                                    className="nav-link"
                                  >
                                    Odd/Even
                                  </a>
                                </li>
                              </ul>
                            </div>
                            <p className="fancyBetSpecialBet p-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 384 512"
                                width={9}
                                height={10}
                                style={{ marginRight: "5px" }}
                              >
                                <path
                                  style={{ fill: "#fff" }}
                                  d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3H32c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64H64C46.3 64 32 49.7 32 32zM160 384h64v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V384z"
                                />
                              </svg>
                              Fancy Bet
                            </p>

                            <div className="tab-content" id="pills-tabContent">
                              <div className="tab_pane">
                                <div className="bookmarket_table inplay-tableblock  table-responsive">
                                  <table className="table custom-table inplay-table w1-table">
                                    <tbody>
                                      <tr className="betstr bg-white">
                                        <td></td>{" "}
                                        <td className="text-center">No</td>{" "}
                                        <td className="text-center">Yes</td>{" "}
                                        <td></td>
                                      </tr>

                                      {sportDetail.page?.data?.t3.length && 
                                      // stableSort(sportDetail?.page?.data?.t3,
                                        // getComparator("asc", "sortPriority")).map(
                                        sportDetail?.page?.data?.t3.map(
                                          (item: FancyInterface, i: any) => {
                                            return (
                                              <> {![1,18].includes(item?.status1) && <>
                                                <tr className="bg-white" key={i + '1'}>
                                                  <td className="item-name d-flex1">
                                                    <div className="row">
                                                      <div className="col-sm-10 col-12 ">
                                                        <b
                                                          className="d_block"
                                                          style={{
                                                            marginBottom: "8px",
                                                          }}
                                                        >
                                                          {item.nat}
                                                        </b>
                                                        <div>
                                                          <span className="team_bet_count_old text-danger">
                                                            (
                                                            <span className="team_total">
                                                              {item?.betProfit
                                                                ? Number(
                                                                  item?.betProfit
                                                                )?.toFixed(2)
                                                                : 0}
                                                            </span>
                                                            )
                                                          </span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="pink-bg ODDSLay">
                                                    <a className="lay1btn text-color-black">
                                                      {" "}
                                                      {item.l1} <br />{" "}
                                                      <span>{item.ls1}</span>{" "}
                                                    </a>{" "}
                                                  </td>
                                                  <td className="cyan-bg ODDSBack">
                                                    <a className="back1btn text-color-black">
                                                      {" "}
                                                      {item.b1} <br />{" "}
                                                      <span>{item.bs1}</span>{" "}
                                                    </a>{" "}
                                                  </td>
                                                  <td
                                                    className="min_max"
                                                    style={{ width: "20%" }}
                                                  >
                                                    Min/Max{" "}
                                                    <span> 1 / 1000</span>{" "}
                                                  </td>
                                                </tr>
                                                {item.status === "SUSPEND" && (
                                                  <tr className="fancy-suspend-tr" key={i + '2'}>
                                                    <td></td>
                                                    <td
                                                      colSpan={2}
                                                      className="fancy-suspend-td"
                                                    >
                                                      <div className="fancy-suspend black-bg-5 text-color-white">
                                                        <span>SUSPENDED</span>
                                                      </div>
                                                    </td>
                                                    <td></td>
                                                  </tr>
                                                )}
                                                </>}
                                              </>
                                            );
                                          }
                                        )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-5">
                <div className="accordian">
                  <div className="accordian_item">
                    <h2
                      className={`accordian_item_header  ${openAccordian ? "active" : "active"
                        }`}
                      onClick={() => setopenAccordian(!openAccordian)}
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
                      className={`accordian_item_body ${openAccordian ? "open" : ""
                        }`}
                    >
                      <div style={{ zIndex: "2", position: "relative" }}>
                        <Select
                          placeholder="Select Bet Type"
                          options={options}
                          isMulti
                          closeMenuOnSelect={false}
                          onChange={handleBetTypeSearch}
                        />
                      </div>
                      <div className="search_box">
                        <svg width="19" height="19">
                          <path
                            d="M12.547 11.543H12l-.205-.172a4.539 4.539 0 001.06-2.914A4.442 4.442 0 008.41 4C5.983 4 4 5.989 4 8.457a4.442 4.442 0 004.445 4.457c1.094 0 2.12-.411 2.905-1.062l.206.171v.548L14.974 16 16 14.971l-3.453-3.428zm-4.102 0a3.069 3.069 0 01-3.077-3.086 3.068 3.068 0 013.077-3.086 3.069 3.069 0 013.076 3.086 3.069 3.069 0 01-3.076 3.086z"
                            fill="rgb(30,30,30"
                          ></path>
                        </svg>
                        {/* <input
                          type="text"
                          placeholder="Find Match..."
                          style={{ width: "100%" }}
                        />
                        <button>Search</button> */}
                        <SearchInput
                          searchSubmit={handleSearchSubmit}
                          placeholder="Find Match..."
                        />
                      </div>
                      <div
                        className="table-responsive"
                        style={{ overflow: "auto" }}
                      >
                        <table className="table bets-table table-bordered">
                          <thead>
                            <tr>
                              <th
                                style={
                                  HeaderData.name === "COM" || HeaderData.name === "SUO" || HeaderData.name === "WL"
                                    ? {}
                                    : { display: "none" }
                                }
                              >
                                Deleted?
                              </th>
                              <th className="text-center">Client</th>
                              <th className="text-center">Selection</th>
                              <th className="text-center">Type</th>
                              <th className="text-center">B/L</th>
                              <th className="text-center">Odds</th>
                              <th className="text-center">Stake</th>
                              <th className="text-center">P&amp;L</th>
                              <th>Placed Time</th>
                              <th className="light-grey-bg">COM</th>
                              <th className="light-grey-bg">AD</th>
                              <th className="light-grey-bg">SP</th>
                              <th className="light-grey-bg">SMDL</th>
                              <th className="light-grey-bg">MDL</th>
                              <th className="light-grey-bg">DL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageData &&
                              pageData.betsHistory &&
                              pageData.betsHistory?.length > 0 ? (
                              pageData.betsHistory.map(
                                (item: BET_LIST_INTERFACE, i: any) => {
                                  return (
                                    <tr key={i} className="cyan-bg">
                                      <td
                                        className="text-center"
                                        style={
                                          HeaderData.name === "O" || HeaderData.name === "SUO" || HeaderData.name === "WL"
                                            ? {}
                                            : { display: "none" }
                                        }
                                      >
                                        <div className="form-check form-switch large-switch">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            onChange={(e) =>
                                              checkBoxChange(e, item)
                                            }
                                            defaultChecked={item.deleted}
                                            id="deleted"
                                            name="deleted"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="delete"
                                          ></label>
                                        </div>
                                      </td>
                                      <td
                                        style={{ width: "250px" }}
                                        className="text-center"
                                      >
                                        <b>
                                          {item.userId.user_name}[
                                          {item.userId.agent_level}]
                                        </b>
                                      </td>
                                      <td className="text-center">
                                        <b>{item.selection}</b>
                                      </td>
                                      <td className="text-center">
                                        {item.betType}
                                      </td>
                                      <td className="text-center">
                                        {item.betSide}
                                      </td>
                                      <td className="text-center">
                                        <b>{item.oddsUp}</b>
                                      </td>
                                      <td className="text-center">
                                        <b>{item.stake}</b>
                                      </td>
                                      <td className="text-danger">
                                        {item.exposure}
                                      </td>
                                      <td>
                                        {moment(item.createdAt).format(
                                          "DD-MM-YYYY hh:mm A"
                                        )}
                                      </td>
                                      <td>--</td>
                                      <td>--</td>
                                      <td>--</td>
                                      <td>--</td>
                                      <td>--</td>
                                      <td>--</td>
                                    </tr>
                                  );
                                }
                              )
                            ) : (
                              <h2>No data</h2>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="accordian_item">
                    <h2
                      className={`accordian_item_header  ${openAdminbook ? "active" : "active"
                        }`}
                      onClick={() => setopenAdminbook(!openAdminbook)}
                    >
                      <button
                        className="accordion-button p-2 bg_secondary text-white shadow-none"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#panelsStayOpen-collapseOne"
                        aria-expanded="true"
                        aria-controls="panelsStayOpen-collapseOne"
                      >
                        Admin Book
                      </button>
                    </h2>
                    <div
                      className={`accordian_item_body ${openAdminbook ? "open" : ""
                        }`}
                    >
                      <div
                        className="table-responsive"
                        style={{ overflow: "auto" }}
                      >
                        <table className="table bets-table table-bordered">
                          <thead>
                            <tr>
                              <th>AD [ UserName ]</th>
                              <th className="text-center">
                                {teamName && teamName[0]}
                              </th>
                              <th className="text-center">
                                {teamName && teamName[1]}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageData &&
                              pageData?.adminBook &&
                              pageData.adminBook?.length > 0 ? (
                              pageData.adminBook.map((item: any, i: any) => {
                                return (
                                  <tr key={i}>
                                    <td>
                                      <h4 style={{ fontSize: 16 }}>
                                        {item.userName}
                                      </h4>
                                    </td>
                                    <td className="text-center">
                                      <h4 style={{ fontSize: 16 }}>
                                        {item.left}
                                      </h4>
                                    </td>
                                    <td className="text-center">
                                      <h4 style={{ fontSize: 16 }}>
                                        {item.right}
                                      </h4>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <h2>No data</h2>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  {/* <div className='accordian_item'>
                    <h2 className={`accordian_item_header  ${openAccordian ? 'active' : ''}`} onClick={() => setopenAccordian(!openAccordian)}>
                      <button className="accordion-button p-2 bg_secondary text-white shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                        Match Bets
                      </button>
                    </h2>
                    <div className={`accordian_item_body ${openAccordian ? 'open' : ''}`} >
                      <div style={{ zIndex: "2", position: "relative" }}>
                        <Select placeholder='Select Bet Type' options={options} isMulti closeMenuOnSelect={false} />
                      </div>
                      <div className="search_box"><svg width="19" height="19"><path d="M12.547 11.543H12l-.205-.172a4.539 4.539 0 001.06-2.914A4.442 4.442 0 008.41 4C5.983 4 4 5.989 4 8.457a4.442 4.442 0 004.445 4.457c1.094 0 2.12-.411 2.905-1.062l.206.171v.548L14.974 16 16 14.971l-3.453-3.428zm-4.102 0a3.069 3.069 0 01-3.077-3.086 3.068 3.068 0 013.077-3.086 3.069 3.069 0 013.076 3.086 3.069 3.069 0 01-3.076 3.086z" fill="rgb(30,30,30"></path></svg>
                        <input type="text" placeholder="Find Match..." style={{ width: "100%" }} />
                        <button>Search</button>
                      </div>
                      <div className='table-responsive' style={{ overflow: "auto" }}>
                        <table className="table bets-table table-bordered">
                          <thead>
                            <tr>
                              <th>Deleted?</th>
                              <th className="text-center">Client</th>
                              <th className="text-center">Selection</th>
                              <th className="text-center">Type</th>
                              <th className="text-center">B/L</th>
                              <th className="text-center">Odds</th>
                              <th className="text-center">Stake</th>
                              <th className="text-center">P&amp;L</th>
                              <th>Placed Time</th>
                              <th className="light-grey-bg">COM</th>
                              <th className="light-grey-bg">AD</th>
                              <th className="light-grey-bg">SP</th>
                              <th className="light-grey-bg">SMDL</th>
                              <th className="light-grey-bg">MDL</th>
                              <th className="light-grey-bg">DL</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="cyan-bg">
                              <td className="text-center">
                                <div className="form-check form-switch large-switch">
                                  <input className="form-check-input" type="checkbox" id="delete" name="delete" />
                                  <label className="form-check-label" htmlFor="delete">
                                  </label>
                                </div>
                              </td>
                              <td style={{ width: "250px" }} className="text-center"><b>jitPlayer[PL]</b></td>
                              <td className="text-center"><b>Tasmania Tigers</b></td>
                              <td className="text-center">PREMIUM</td>
                              <td className="text-center">BACK</td>
                              <td className="text-center"><b>14.00</b></td>
                              <td className="text-center"><b>10</b></td>
                              <td className="text-danger">10.00</td>
                              <td>07/10/2022 09:52 PM</td>
                              <td>--</td>
                              <td>--</td>
                              <td>--</td>
                              <td>--</td>
                              <td>--</td>
                              <td>--</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskManagementDetail;
