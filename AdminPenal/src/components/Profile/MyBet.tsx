import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import { dataInterface } from "../../pages/Setting/interface";
import { postApi } from "../../service";
import NewPagination from "../new-pagination";

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
  profit: number;
  exposure: number;
}

function MyBet(props: any) {
  let { activeTab, userId } = props;
  const userData = useSelector((e: any) => e.userData);
  const [tab, setTab] = useState("All");
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [Filtertab, setFilterTab] = useState("all");

  let { userId: tempUserID } = useParams();
  const [currentTab, setCurrentTab] = useState("exchange");

  useEffect(() => {
    if (tempUserID && tempUserID !== "") {
      userId = tempUserID;
    }

    return () => {};
  }, []);
  // useEffect(() => {
  //     getPageData()
  //     return () => {
  //     }
  // }, [])
  useEffect(() => {
    getPageData("");
    return () => {};
  }, [activeTab]);
  const getPageData = async (
    FilterType: string,
    BET_TYPE: string = currentTab
  ) => {
    
    let data: any = {
      api: BET_TYPE !== "awcCasinoBet" ? ADMIN_API.PLAYER_BET_HISTORY : ADMIN_API.PLAYER_CASINO_BET_HISTORY,
      value: {
        id: userId ? userId : userData._id,
        bet: activeTab === "bethistory" ? "history" : "active",
        betStatus: "all",
        betType: BET_TYPE ? BET_TYPE === "awcCasinoBet" ? "casino" : BET_TYPE : currentTab,
        filter:
          activeTab === "bethistory"
            ? FilterType === ""
              ? Filtertab
              : FilterType
            : "all",
        from: startDate,
        to: endDate,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const handlePageClick = (e: any) => {
    console.log("page clicked", e);
    getPageData("");
  };

  const handleSubmit = (search: any) => {
    getPageData("");
  };

  const onTabChange = (TAB: string) => {
    setCurrentTab(TAB);
    getPageData("", TAB);
  };

  const getProfit = (item: historyInterface) => {
    const { tType, betSide, profit, stake, exposure } = item;
    if (tType === "win") {
      if (betSide === "yes" || betSide === "back") {
        return { type: "text-green", display: profit };
      } else {
        return { type: "text-green", display: stake };
      }
    } else if (tType === "lost") {
      if (betSide === "yes" || betSide === "back") {
        return { type: "text-danger", display: exposure };
      } else {
        return { type: "text-danger", display: profit };
      }
    } else {
      if (betSide === "yes" || betSide === "back") {
        return { type: "text-danger", display: exposure };
      } else {
        return { type: "text-green", display: stake };
      }
    }
  };

  return (
    <>
      <div className="account_tabs_r_bet_content">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a
              className={`${
                currentTab === "exchange" ? "active" : ""
              } nav-link `}
              onClick={() => onTabChange("exchange")}
            >
              Exchange
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                currentTab === "sportsBook" ? "active" : ""
              } nav-link `}
              onClick={() => onTabChange("sportsBook")}
            >
              Fancy Bet
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                currentTab === "bookMark" ? "active" : ""
              } nav-link `}
              onClick={() => onTabChange("bookMark")}
            >
              BookMaker
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${currentTab === "binary" ? "active" : ""} nav-link `}
              onClick={() => onTabChange("binary")}
            >
              Premium Bet
            </a>
          </li>
          {/* <li className="nav-item">
                        <a className={`${currentTab === 'fancyBet' ? "active" : ""} nav-link `} onClick={() => setCurrentTab('fancyBet')}>FancyBet</a>
                    </li> */}
          <li className="nav-item">
            <a
              className={`${
                currentTab === "fancy1Bet" ? "active" : ""
              } nav-link `}
              onClick={() => setCurrentTab("fancy1Bet")}
            >
              Fancy1Bet
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${currentTab === "toss" ? "active" : ""} nav-link `}
              onClick={() => setCurrentTab("toss")}
            >
              Toss
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                currentTab === "casinoBet" ? "active" : ""
              } nav-link `}
              onClick={() => setCurrentTab("casinoBet")}
            >
              Int. Casino Bet
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                currentTab === "awcCasinoBet" ? "active" : ""
              } nav-link `}
              onClick={() => onTabChange("awcCasinoBet")}
            >
              awc Casino Bet
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                currentTab === "virtualSports" ? "active" : ""
              } nav-link `}
              onClick={() => setCurrentTab("virtualSports")}
            >
              Virtual Sports
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                currentTab === "premium" ? "active" : ""
              } nav-link `}
              onClick={() => setCurrentTab("premium")}
            >
              Premium
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${currentTab === "other" ? "active" : ""} nav-link `}
              onClick={() => setCurrentTab("other")}
            >
              Other
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`${
                currentTab === "SABASports" ? "active" : ""
              } nav-link `}
              onClick={() => setCurrentTab("SABASports")}
            >
              SABA Sports
            </a>
          </li>
        </ul>

        <div className="function-wrap light-grey-bg">
          <ul className="inputlist">
            <li>
              <label>Bet Status</label>
            </li>
            <li>
              <select>
                <option value="">Matched</option>
              </select>
            </li>

            <li>
              <label>Period</label>
            </li>
            {activeTab === "bethistory" && (
              <li>
                <input
                  name="from_date"
                  id="from_date"
                  className="form-control1 hasDatepicker"
                  type="date"
                  value={`${moment(startDate).format("YYYY-MM-DD")}`}
                  onChange={(e: any) => {
                    setStartDate(e?.target?.value);
                    setFilterTab("date");
                  }}
                />
                <input
                  id="startTime"
                  className="form-control1 no-calender"
                  type="text"
                  placeholder="09:00"
                  maxLength={5}
                  readOnly
                />
                <span> to </span>
                <input
                  name="to_date"
                  id="to_date"
                  className="form-control1 hasDatepicker"
                  type="date"
                  value={`${moment(endDate).format("YYYY-MM-DD")}`}
                  placeholder="YYYY-MM-DD"
                  onChange={(e: any) => {
                    setEndDate(e?.target?.value);
                    setFilterTab("date");
                  }}
                />
                <input
                  id="endTime"
                  className="form-control1 no-calender"
                  type="text"
                  placeholder="08:59"
                  maxLength={5}
                  readOnly
                />
              </li>
            )}
          </ul>
          {activeTab === "bethistory" && (
            <ul className="inputlist">
              <li
                onClick={() => {
                  setFilterTab("today");
                  getPageData("today");
                }}
              >
                <a
                  id="today"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  className="text-decoration-none btn btn-default-customize bg-white cursor-pointer"
                >
                  Just For Today
                </a>
              </li>
              <li
                onClick={() => {
                  setFilterTab("yesterday");
                  getPageData("yesterday");
                }}
              >
                <a
                  id="yesterday"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  className="text-decoration-none btn btn-default-customize bg-white cursor-pointer"
                >
                  From Yesterday
                </a>
              </li>
              <li
                onClick={() => {
                  getPageData("");
                }}
              >
                <a
                  id="getPL"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  className="btn_black p-1 text-decoration-none p-0 d-inline cursor-pointer"
                >
                  Get History
                </a>
              </li>
            </ul>
          )}
        </div>
        <p>Betting History enables you to review the bets you have placed.</p>
        <p style={{ marginBottom: "7px" }}>
          Specify the time period during which your bets were placed, the type
          of markets on which the bets were placed, and the sport.
        </p>
        <p style={{ marginBottom: "7px" }}>
          Betting History is available online for the past 30 days.
        </p>

        <div className="table-responsive">
          {/* create component of table and pass currentTab and Data */}
          <table
            id="MatchedTable"
            className="table01 margin-table margin-table"
          >
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
                  {activeTab === "bethistory" && <th>Profit/Loss</th>}
                </tr>
              </>
            </thead>
            {pageData && pageData?.length > 0 ? (
              pageData.map((item: historyInterface, i: any) => {
                return (
                  <tbody>
                    <>
                      <tr>
                        <td>
                          {item.type} &#9654; {item.name} &#9654; {item.betType}
                        </td>
                        <td id="Matched_selection">
                          {item.betType === "premium"
                            ? `${item.selection} / ${item?.subSelection}`
                            : item.selection}
                        </td>
                        {/* #72bbef #faa9ba */}
                        <td
                          id="Matched_type"
                          style={{ textTransform: "uppercase" }}
                        >
                          {" "}
                          <span
                            style={{
                              padding: 6,
                              borderRadius: 3,
                              background: `${
                                item.betSide === "back" ||
                                item.betSide === "yes"
                                  ? "#72bbef"
                                  : "#faa9ba"
                              }`,
                            }}
                          >
                            {item.betSide}
                          </span>
                        </td>
                        <td id="Matched_betId">{item.betId}</td>
                        <td id="Matched_betPlaced">
                          {moment(item.createdAt).format("DD-MM-YYYY hh:mm A")}
                        </td>
                        {/* className={item?.betSide === 'back' ? "text-danger" : "text-green"} */}
                        <td id="Matched_matched">{item.stake}</td>
                        <td id="Matched_avgOdds">
                          {item.oddsUp}
                          <small> ({item.oddsDown})</small>
                        </td>
                        {/* "win", "lost", "cancel" */}
                        {activeTab === "bethistory" && (
                          <td className={getProfit(item)?.type}>
                            {getProfit(item)?.display}
                          </td>
                        )}
                      </tr>
                    </>
                  </tbody>
                );
              })
            ) : (
              <tbody id="MatchedContent">
                <tr>
                  <td colSpan={activeTab === "bethistory" ? 8 : 7}>
                    <p>You have no bets in this time period.</p>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        <NewPagination />
      </div>
    </>
  );
}

export default MyBet;
