import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import { postApi, sendEvent } from "../../service";

interface RiskManagementInterFace {
  count: {
    left: number;
    right: number;
    total: number;
    draw: number;
  };
  mainBetData: any;
  name: string;
  openDate: string;
  startDate: string;
  _id: string;
  gameId: number;
  marketId: string;
  type: string;
}

function RiskManagement() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("cricket");
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const [pageDataAmount, setPageAmountData] = useState<any>([]);
  const [pageSoccerData, setPageSoccerData] = useState<any>({});
  const [pageTennisData, setPageTennisData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [betTab, setBetTab] = useState("amount"); // expouser // amount

  const switchTab = (tab: string) => {
    setTab(tab);
    setPageData([]);
    setPageSoccerData([]);
    setPageTennisData([]);
    getPageData(tab, "1");
  };

  const switchBetTab = (tabB: string) => {
    setBetTab(tabB);
    getBetAmountList(tab);
  };
  useEffect(() => {
    getPageData(tab, "1");
    getBetAmountList(tab);

    // getPageSoccerData("soccer", "1");
    // getPageTennisData("tennis", "1");
    return () => {};
  }, []);

  const getBetAmountList = async (TYPE: string) => {
    let data: any = {
      api: ADMIN_API.RISK_BET_BIG_AMOUNT_LIST,
      value: {
        type: TYPE,
        sorting: betTab,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("RISK_BET_BIG_AMOUNT_LIST: ", response);
        setPageAmountData(response.data.data.result);
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  // const [availableTab, setAvailableTab] = useState([])
  const getPageData = async (
    TYPE: string,
    PAGE: string,
    SEARCH: string = ""
  ) => {
    let data: any = {
      api: ADMIN_API.RISK,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : "1",
        limit: "50",
      },
    };
    if (SEARCH !== "") {
      data.value.search = SEARCH;
    }
    if (TYPE === "all") {
      delete data.value.type;
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const getPageSoccerData = async (
    TYPE: string,
    PAGE: string,
    SEARCH: string = ""
  ) => {
    let data: any = {
      api: ADMIN_API.RISK,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : "1",
        limit: "50",
      },
    };
    if (SEARCH !== "") {
      data.value.search = SEARCH;
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageSoccerData(response.data.data);
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const getPageTennisData = async (
    TYPE: string,
    PAGE: string,
    SEARCH: string = ""
  ) => {
    let data: any = {
      api: ADMIN_API.RISK,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : "1",
        limit: "50",
      },
    };
    if (SEARCH !== "") {
      data.value.search = SEARCH;
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageTennisData(response.data.data);
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const handleSearchSubmit = (search: any) => {
    // getPageData(tab, '1', search)
  };
  const getDetails = (item: RiskManagementInterFace) => {
    let data = {
      // "eventId":31801034,
      // "marketId":"1.204406834"
      eventId: item.gameId,
      marketId: item.marketId,
    };
    dispatch({ type: "CLICKED_GAME", payload: data });
    sendEvent("GET_SPORTS_DETAILS", data);
    navigate("/risk-management-detail/" + item._id);
  };
  const handlePageClick = (e: any) => {
    console.log("page clicked", e);
    getPageData(tab, (e.selected + 1).toString());
  };
  return (
    <div className="container riskmang main_wrap">
      <div className="top_header">
        <div className="top_header_title mt-3">
          <h5 className="font-weight-bold">Manage {tab} Risk Management</h5>
        </div>
      </div>
      <div className="tabs">
        {true && (
          <>
            <div className="tabs_list">
              <ul className="btn-group">
                <li
                  className={`${
                    tab === "cricket" ? "active" : ""
                  } tabs_list_item btn  btn-outline-dark `}
                  onClick={() => switchTab("cricket")}
                >
                  <a> Cricket </a>
                </li>
                <li
                  className={`${
                    tab === "soccer" ? "active" : ""
                  } tabs_list_item btn  btn-outline-dark`}
                  onClick={() => switchTab("soccer")}
                >
                  <a> Soccer </a>
                </li>
                <li
                  className={`${
                    tab === "tennis" ? "active" : ""
                  } tabs_list_item btn btn-outline-dark mb-0i `}
                  onClick={() => switchTab("tennis")}
                  style={{ marginBottom: "0px;" }}
                >
                  <a> Tennis </a>
                </li>
                <li
                  className={`${
                    tab === "all" ? "active" : ""
                  } tabs_list_item btn btn-outline-dark mb-0i `}
                  onClick={() => switchTab("all")}
                  style={{ marginBottom: "0px;" }}
                >
                  <a> All </a>
                </li>

                <li
                  className={`${
                    betTab === "amount" ? "active" : ""
                  } tabs_list_item btn btn-outline-dark mb-0i `}
                  onClick={() => switchBetTab("amount")}
                  style={{ marginBottom: "0px;" }}
                >
                  <a> Top Match Amount Player </a>
                </li>

                <li
                  className={`${
                    betTab === "expouser" ? "active" : ""
                  } tabs_list_item btn btn-outline-dark mb-0i `}
                  onClick={() => switchBetTab("expouser")}
                  style={{ marginBottom: "0px;" }}
                >
                  <a> Top Expouser Player </a>
                </li>
              </ul>
              {false && (
                <div className="top_header_right">
                  <div className="search_box common ">
                    <svg
                      width="19"
                      height="19"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.547 11.543H12l-.205-.172a4.539 4.539 0 001.06-2.914A4.442 4.442 0 008.41 4C5.983 4 4 5.989 4 8.457a4.442 4.442 0 004.445 4.457c1.094 0 2.12-.411 2.905-1.062l.206.171v.548L14.974 16 16 14.971l-3.453-3.428zm-4.102 0a3.069 3.069 0 01-3.077-3.086 3.068 3.068 0 013.077-3.086 3.069 3.069 0 013.076 3.086 3.069 3.069 0 01-3.076 3.086z"
                        fill="rgb(30,30,30"
                      ></path>
                    </svg>
                    <input type="text" placeholder="Find Member..." value="" />
                    <button
                      style={{
                        background: "rgb(41, 30, 57)",
                        color: "rgb(255, 255, 255)",
                      }}
                    >
                      Search
                    </button>
                  </div>
                  {/* <SearchInput searchSubmit={handleSearchSubmit} placeholder="Find Match..." /> */}
                </div>
              )}
            </div>
          </>
        )}
        {true && (
          <div className="tabs_content mb_5" style={{ display: "flex" }}>
            <table
              className="table01 margin-table mb_5"
              style={{ width: "50%", marginRight: "10px" }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      background: "#3b5160",
                      color: "white",
                      padding: "5px 10px",
                    }}
                    colSpan={15}
                  >
                    {tab} -{" "}
                    {betTab === "amount"
                      ? "Top Match Amount Player"
                      : "Top Expouser Player"}
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th>UID</th>
                  <th>Exposure</th>
                  <th>Matched Amount</th>
                </tr>
              </thead>
              <tbody id="matches-table">
                <>
                  {pageDataAmount &&
                    pageDataAmount.length &&
                    pageDataAmount
                      .slice(0, 10)
                      .map((item: any, index: number) => {
                        return (
                          <tr>
                            <td>{1 + index}</td>
                            <td>{item.userName}</td>
                            <td className="text-danger">({item.totalExp})</td>
                            <td>{item.betAmount}</td>
                          </tr>
                        );
                      })}
                </>
              </tbody>
            </table>
            <table
              className="table01 margin-table mb_5"
              style={{ width: "50%" }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      background: "#3b5160",
                      color: "white",
                      padding: "5px 10px",
                    }}
                    colSpan={15}
                  >
                    {tab} -{" "}
                    {betTab === "amount"
                      ? "Top Match Amount Player"
                      : "Top Expouser Player"}
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th>UID</th>
                  <th>Exposure</th>
                  <th>Matched Amount</th>
                </tr>
              </thead>
              <tbody id="matches-table">
                <>
                  {pageDataAmount &&
                    pageDataAmount.length > 10 &&
                    pageDataAmount
                      .slice(10, 20)
                      .map((item: any, index: number) => {
                        return (
                          <tr>
                            <td>{10 + index}</td>
                            <td>{item.userName}</td>
                            <td className="text-danger">({item.totalExp})</td>
                            <td>{item.betAmount}</td>
                          </tr>
                        );
                      })}
                </>
              </tbody>
            </table>
          </div>
        )}
        <div className="tabs_content mt-10">
          {false && (
            <>
              <section className="matches">
                {pageData && pageData.results?.length > 0 ? (
                  pageData.results.map(
                    (item: RiskManagementInterFace, i: any) => {
                      return (
                        <>
                          <div className="matches_card" key={item._id + i}>
                            <div className="matches_card_header">
                              <a
                                className="text-decoration-none d_flex"
                                onClick={() => getDetails(item)}
                              >
                                <h6 className="m-0 font-weight-bold ">
                                  <strong>
                                    <span></span> {item.name} [{item.openDate}]
                                  </strong>
                                </h6>
                              </a>
                            </div>
                            <div className="matches_card_body">
                              <div className="matches_card_body_content d_flex">
                                <div className="matches_card_body_content_item d_flex">
                                  <div className="runner_details">
                                    <div className="r_title">
                                      {item.name.split(" v ")[0]}
                                    </div>
                                    <div
                                      className={
                                        item.count.left < 0
                                          ? "text-danger"
                                          : "text-green"
                                      }
                                    >
                                      <b>» {item.count.left}</b>
                                    </div>
                                  </div>
                                  <div className="button_content">
                                    <button className="backbtn cyan-bg">
                                      {item?.mainBetData?.back1
                                        ? item?.mainBetData?.back1
                                        : "--"}
                                    </button>
                                    <button className="laybtn pink-bg">
                                      {item?.mainBetData?.lay1
                                        ? item?.mainBetData?.lay1
                                        : "--"}
                                    </button>
                                  </div>
                                </div>
                                <div className="matches_card_body_content_item d_flex">
                                  <div className="runner_details">
                                    <div className="r_title">
                                      {item.name.split(" v ")[1]}
                                    </div>
                                    <div
                                      className={
                                        item.count.right < 0
                                          ? "text-danger"
                                          : "text-green"
                                      }
                                    >
                                      <b>» {item.count.right}</b>
                                    </div>
                                  </div>
                                  <div className="button_content">
                                    <button className="backbtn cyan-bg">
                                      {item?.mainBetData?.back2
                                        ? item?.mainBetData?.back2
                                        : "--"}
                                    </button>
                                    <button className="laybtn pink-bg">
                                      {item?.mainBetData?.lay2
                                        ? item?.mainBetData?.lay2
                                        : "--"}
                                    </button>
                                  </div>
                                </div>
                                {tab === "soccer" && (
                                  <div className="matches_card_body_content_item d_flex">
                                    <div className="runner_details">
                                      <div className="r_title">The Draw</div>
                                      <div
                                        className={
                                          item.count.draw < 0
                                            ? "text-danger"
                                            : "text-green"
                                        }
                                      >
                                        <b>» {item.count.draw}</b>
                                      </div>
                                    </div>
                                    <div className="button_content">
                                      <button className="backbtn cyan-bg">
                                        {item?.mainBetData?.back3
                                          ? item?.mainBetData?.back3
                                          : "--"}
                                      </button>
                                      <button className="laybtn pink-bg">
                                        {item?.mainBetData?.lay3
                                          ? item?.mainBetData?.lay3
                                          : "--"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                <div className="matches_card_body_content_item d_flex">
                                  <div className="runner_details">
                                    <div className="r_title"> Total Bets</div>
                                    <div className="text-dark">
                                      <b>» {item.count.total}</b>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    }
                  )
                ) : (
                  <>
                    <div className="matches_card">
                      <div className="matches_card_header">
                        <a
                          className="text-decoration-none d_flex"
                          href="https://ag.mysky247.xyz/backend/match/risk-management/31739148"
                        >
                          <h6 className="m-0 font-weight-bold ">
                            <strong>
                              <span></span>{" "}
                            </strong>
                          </h6>
                        </a>
                        {/* no match found text here */}
                        <h6 className="nomatch"> No matches found. </h6>
                      </div>
                    </div>
                  </>
                )}

                {/* <div className='matches_card'>
              <div className='matches_card_header'>
                <a className="text-decoration-none d_flex" href="https://ag.mysky247.xyz/backend/match/risk-management/31739148">
                  <h6 className="m-0 font-weight-bold ">
                    <strong><span></span> Papua New Guinea v USA [2022-09-13 05:30:00]</strong>
                  </h6>
                </a>
              </div>
              <div className='matches_card_body'>
                <div className='matches_card_body_content d_flex'>
                  <div className='matches_card_body_content_item d_flex'>
                    <div className="runner_details">
                      <div className="r_title">New Zealand Legends</div>
                      <div className="text-green"><b>» 0</b></div>
                    </div>
                    <div className="button_content">
                      <button className="backbtn cyan-bg">--</button>
                      <button className="laybtn pink-bg">--</button>
                    </div>
                  </div>
                  <div className='matches_card_body_content_item d_flex'>
                    <div className="runner_details">
                      <div className="r_title">South Africa Legends</div>
                      <div className="text-green"><b>» 0</b></div>
                    </div>
                    <div className="button_content">
                      <button className="backbtn cyan-bg">--</button>
                      <button className="laybtn pink-bg">--</button>
                    </div>
                  </div>
                  <div className='matches_card_body_content_item d_flex'>
                    <div className="runner_details">
                      <div className="r_title"> Total Bets</div>
                      <div className="text-dark"><b>» 1</b></div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
              </section>
              {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? (
                ""
              ) : (
                <Pagination
                  handlePageClick={handlePageClick}
                  totalPages={pageData?.totalPages}
                />
              )}
            </>
          )}
          {true && (
            <>
              {(tab === "cricket" || tab === "all") && (
                <div className="match-wrap">
                  <div className="total_all">
                    <h2>Cricket</h2>
                    <a className="btn_replay" id="refresh_Match_Odds">
                      <img src="/images/refresh.svg" alt="" />
                    </a>
                    <a
                      className="btn_replay"
                      id="downloadFile_Match_Odds"
                      style={{ display: "none", width: "70" }}
                    >
                      Download
                    </a>
                  </div>
                  <table className="table01 risk_matchodd">
                    <tbody>
                      <tr>
                        <th
                          style={{ width: "10%" }}
                          className="align-L"
                          rowSpan={2}
                        >
                          Sports
                        </th>
                        <th
                          style={{ width: "8%" }}
                          className="align-L"
                          rowSpan={2}
                        >
                          Market Date
                        </th>
                        <th className="align-L" rowSpan={2}>
                          Event/Market Name
                        </th>
                        <th
                          style={{ width: "21%" }}
                          className="align-C border-l bg-yellow"
                          colSpan={3}
                        >
                          Player P/L
                        </th>
                      </tr>
                      <tr>
                        <th
                          style={{ width: "7%" }}
                          className="border-l bg-yellow"
                        >
                          1
                        </th>
                        <th style={{ width: "7%" }} className="bg-yellow">
                          X
                        </th>
                        <th style={{ width: "7%" }} className="bg-yellow">
                          2
                        </th>
                      </tr>
                    </tbody>
                    <tbody id="content_MATCH_ODDS_DRAW">
                      {pageData &&
                        pageData.results?.length > 0 &&
                        pageData.results.map(
                          (item: RiskManagementInterFace, i: any) => {
                            return (
                              <>
                                {item.type === "cricket" && (
                                  <tr
                                    id="tempTr_MATCH_ODDS_DRAW"
                                    className="border-t"
                                  >
                                    <td
                                      className="align-L"
                                      rowSpan={1}
                                      id="0_1"
                                    >
                                      <a id="eventType">Cricket</a>
                                    </td>
                                    <td
                                      className="align-L border-l"
                                      rowSpan={1}
                                      id="1_1"
                                    >
                                      {item?.openDate}
                                    </td>
                                    <td className="align-L border-l">
                                      <a
                                        id="marketPath"
                                        href="#"
                                        onClick={() => getDetails(item)}
                                      >
                                        <strong id="eventName">
                                          {item?.name}
                                        </strong>
                                        <img
                                          className="fromto"
                                          src="data:image/gif;base64,R0lGODdhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw=="
                                        />
                                        <span id="marketName">Match Odds</span>
                                      </a>
                                    </td>
                                    <td className="border-l">
                                      <a
                                        className={
                                          item?.count?.left >= 0
                                            ? "green"
                                            : "text-danger"
                                        }
                                        id="selection_exposure_1"
                                      >
                                        {item?.count?.left}
                                      </a>
                                    </td>
                                    <td>
                                      <a
                                        className="green"
                                        id="selection_exposure_3"
                                      >
                                        0.00
                                      </a>
                                    </td>
                                    <td>
                                      <a className="" id="selection_exposure_2">
                                        <span
                                          className={
                                            item?.count?.right >= 0
                                              ? "green"
                                              : "text-danger"
                                          }
                                        >
                                          {item?.count?.right}
                                        </span>
                                      </a>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          }
                        )}
                      {/* <tr id="tempTr_MATCH_ODDS_DRAW" className="border-t">
                      <td className="align-L" rowSpan={1} id="0_1">
                        <a id="eventType">Cricket</a>
                      </td>
                      <td className="align-L border-l" rowSpan={1} id="1_1">
                        2024-10-23 14:30
                      </td>
                      <td className="align-L border-l">
                        <a
                          id="marketPath"
                          href="/Runningmarketanlysis/33700962"
                        >
                          <strong id="eventName">
                            Pakistan Shaheens v United Arab Emirates
                          </strong>
                          <img
                            className="fromto"
                            src="data:image/gif;base64,R0lGODdhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw=="
                          />
                          <span id="marketName">Match Odds</span>
                        </a>
                      </td>
                      <td className="border-l">
                        <a className="green" id="selection_exposure_1">
                          0.00
                        </a>
                      </td>
                      <td>
                        <a className="green" id="selection_exposure_3">
                          0.00
                        </a>
                      </td>
                      <td>
                        <a className="" id="selection_exposure_2">
                          <span className="green">0.00</span>
                        </a>
                      </td>
                    </tr> */}
                      {/* <tr
                      id="expand_30180016"
                      className="expand"
                      style={{ display: "none" }}
                    >
                      <td className="border-l align-L" colSpan={4}>
                        <img
                          className="expand-arrow"
                          src="data:image/gif;base64,R0lGODdhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw=="
                        />
                        <iframe src="" height="197" scrolling="no"></iframe>
                        <div
                          className="risk-message"
                          id="risk_message"
                          style={{ display: "none" }}
                        ></div>
                      </td>
                      <td width="80" className="border-l"></td>
                    </tr> */}
                    </tbody>
                  </table>
                </div>
              )}
              {(tab === "soccer" || tab === "all") && (
                <div className="match-wrap">
                  <div className="total_all">
                    <h2>Soccer</h2>
                    <a className="btn_replay" id="refresh_Match_Odds">
                      <img src="/images/refresh.svg" alt="" />
                    </a>
                    <a
                      className="btn_replay"
                      id="downloadFile_Match_Odds"
                      style={{ display: "none", width: "70" }}
                    >
                      Download
                    </a>
                  </div>
                  <table className="table01 risk_matchodd">
                    <tbody>
                      <tr>
                        <th
                          style={{ width: "10%" }}
                          className="align-L"
                          rowSpan={2}
                        >
                          Sports
                        </th>
                        <th
                          style={{ width: "8%" }}
                          className="align-L"
                          rowSpan={2}
                        >
                          Market Date
                        </th>
                        <th className="align-L" rowSpan={2}>
                          Event/Market Name
                        </th>
                        <th
                          style={{ width: "21%" }}
                          className="align-C border-l bg-yellow"
                          colSpan={3}
                        >
                          Player P/L
                        </th>
                      </tr>
                      <tr>
                        <th
                          style={{ width: "7%" }}
                          className="border-l bg-yellow"
                        >
                          1
                        </th>
                        <th style={{ width: "7%" }} className="bg-yellow">
                          X
                        </th>
                        <th style={{ width: "7%" }} className="bg-yellow">
                          2
                        </th>
                      </tr>
                    </tbody>
                    <tbody id="content_MATCH_ODDS_DRAW">
                      {pageData &&
                        pageData.results?.length > 0 &&
                        pageData.results.map(
                          (item: RiskManagementInterFace, i: any) => {
                            return (
                              <>
                                {item.type === "soccer" && (
                                  <tr
                                    id="tempTr_MATCH_ODDS_DRAW"
                                    className="border-t"
                                  >
                                    <td
                                      className="align-L"
                                      rowSpan={1}
                                      id="0_1"
                                    >
                                      <a id="eventType">Soccer</a>
                                    </td>
                                    <td
                                      className="align-L border-l"
                                      rowSpan={1}
                                      id="1_1"
                                    >
                                      {item?.openDate}
                                    </td>
                                    <td className="align-L border-l">
                                      <a
                                        id="marketPath"
                                        href="#"
                                        onClick={() => getDetails(item)}
                                      >
                                        <strong id="eventName">
                                          {item?.name}
                                        </strong>
                                        <img
                                          className="fromto"
                                          src="data:image/gif;base64,R0lGODdhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw=="
                                        />
                                        <span id="marketName">Match Odds</span>
                                      </a>
                                    </td>
                                    <td className="border-l">
                                      <a
                                        className={
                                          item?.count?.left >= 0
                                            ? "green"
                                            : "text-danger"
                                        }
                                        id="selection_exposure_1"
                                      >
                                        {item?.count?.left}
                                      </a>
                                    </td>
                                    <td>
                                      <a
                                        className="green"
                                        id="selection_exposure_3"
                                      >
                                        0.00
                                      </a>
                                    </td>
                                    <td>
                                      <a className="" id="selection_exposure_2">
                                        <span
                                          className={
                                            item?.count?.right >= 0
                                              ? "green"
                                              : "text-danger"
                                          }
                                        >
                                          {item?.count?.right}
                                        </span>
                                      </a>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          }
                        )}
                    </tbody>
                  </table>
                </div>
              )}
              {(tab === "tennis" || tab === "all") && (
                <div className="match-wrap">
                  <div className="total_all">
                    <h2>Tennis</h2>
                    <a className="btn_replay" id="refresh_Match_Odds">
                      <img src="/images/refresh.svg" alt="" />
                    </a>
                    <a
                      className="btn_replay"
                      id="downloadFile_Match_Odds"
                      style={{ display: "none", width: "70" }}
                    >
                      Download
                    </a>
                  </div>
                  <table className="table01 risk_matchodd">
                    <tbody>
                      <tr>
                        <th
                          style={{ width: "10%" }}
                          className="align-L"
                          rowSpan={2}
                        >
                          Sports
                        </th>
                        <th
                          style={{ width: "8%" }}
                          className="align-L"
                          rowSpan={2}
                        >
                          Market Date
                        </th>
                        <th className="align-L" rowSpan={2}>
                          Event/Market Name
                        </th>
                        <th
                          style={{ width: "21%" }}
                          className="align-C border-l bg-yellow"
                          colSpan={3}
                        >
                          Player P/L
                        </th>
                      </tr>
                      <tr>
                        <th
                          style={{ width: "7%" }}
                          className="border-l bg-yellow"
                        >
                          1
                        </th>
                        <th style={{ width: "7%" }} className="bg-yellow">
                          X
                        </th>
                        <th style={{ width: "7%" }} className="bg-yellow">
                          2
                        </th>
                      </tr>
                    </tbody>
                    <tbody id="content_MATCH_ODDS_DRAW">
                      {pageData &&
                        pageData.results?.length > 0 &&
                        pageData.results.map(
                          (item: RiskManagementInterFace, i: any) => {
                            return (
                              <>
                                {item.type === "tennis" && (
                                  <tr
                                    id="tempTr_MATCH_ODDS_DRAW"
                                    className="border-t"
                                  >
                                    <td
                                      className="align-L"
                                      rowSpan={1}
                                      id="0_1"
                                    >
                                      <a id="eventType">Tennis</a>
                                    </td>
                                    <td
                                      className="align-L border-l"
                                      rowSpan={1}
                                      id="1_1"
                                    >
                                      {item?.openDate}
                                    </td>
                                    <td className="align-L border-l">
                                      <a
                                        id="marketPath"
                                        href="#"
                                        onClick={() => getDetails(item)}
                                      >
                                        <strong id="eventName">
                                          {item?.name}
                                        </strong>
                                        <img
                                          className="fromto"
                                          src="data:image/gif;base64,R0lGODdhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw=="
                                        />
                                        <span id="marketName">Match Odds</span>
                                      </a>
                                    </td>
                                    <td className="border-l">
                                      <a
                                        className={
                                          item?.count?.left >= 0
                                            ? "green"
                                            : "text-danger"
                                        }
                                        id="selection_exposure_1"
                                      >
                                        {item?.count?.left}
                                      </a>
                                    </td>
                                    <td>
                                      <a
                                        className="green"
                                        id="selection_exposure_3"
                                      >
                                        0.00
                                      </a>
                                    </td>
                                    <td>
                                      <a className="" id="selection_exposure_2">
                                        <span
                                          className={
                                            item?.count?.right >= 0
                                              ? "green"
                                              : "text-danger"
                                          }
                                        >
                                          {item?.count?.right}
                                        </span>
                                      </a>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          }
                        )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiskManagement;
