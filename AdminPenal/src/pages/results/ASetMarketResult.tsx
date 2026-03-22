import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { notifyError, notifyMessage, postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import { dataInterface } from "../Setting/interface";
import ConfirmationPopup from "../../components/confirmationPopup";
import Loader from "../../components/Loader";

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
  settlementType?: string;
  settledBy?: any;
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

function ASetMarketResult() {
  const isEsoccer = process.env.REACT_APP_E_SOCCER;
  const isBasketBall = process.env.REACT_APP_BASKET_BALL;
  const navigate = useNavigate();
  const [sportNameTypeList, setSportNameTypeList] = useState<string>("ALL");
  const [sportName, setSportName] = useState<string>("");
  const [matchType, setMatchType] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [sportMatchName, setSportMatchName] = useState<Data>({});
  const [sportData, setSportData] = useState<Result>();
  const [open, setOpen] = useState<string>("");
  const [popUpText, setPopUpText] = useState<string>("");
  const [popUpTitle, setPopUpTitle] = useState<string>("");
  
  const [isLoader, setLoader] = useState(false);
  const [sportList, setSportList] = useState<any>({});
  const [sportItem, setSportItem] = useState<any>({});

  useEffect(() => {
    matchListData(sportNameTypeList);
    if (sportName !== "") getSportData();
    else {
      setSportMatchName({});
    }
    return () => { };
  }, [sportName]);

  useEffect(() => {
    if (sportName === "") {
      setMatchType("");
      setWinner("");
      setSportData(undefined);
    } else if (!sportData) {
      setMatchType("");
      setWinner("");
    } else if (matchType === "") {
      setWinner("");
    }
    return () => { };
  }, [sportName, sportData, matchType]);

  const getSportData = async () => {
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.GET_LIST_PLACE_BET,
      value: {
        type: sportName,
        page: "1",
        limit: "100",
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log(response, "response");
        setSportMatchName(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const setSportDataFromOnChange = (id: string) => {
    const sport = sportMatchName?.results?.find((value) => value._id === id);

    setSportData(sport);
  };

  const callWinnerAPI = async (e: any) => {
    e.preventDefault();
    setOpen("");
    if (typeof sportData === "undefined") {
      notifyError("please select the Match.");
      return;
    }
    if (winner === "") {
      notifyError("please select the winner.");
      return;
    }
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.DECLARE_WINNER,
      value: {
        id: sportData?._id,
        winner: winner,
      },
    };
    setLoader(true);
    await postApi(data)
      .then(function (response) {
        console.log(response);

        setLoader(false);
        notifyMessage(response.data.message);
        setTimeout(()=>{
          window.location.reload()
        },500)
        // setOpenModal(false)
      })
      .catch((err) => {
        setLoader(false);
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const matchListData = async (TYPE: string, SEARCH: string = "") => {
    let data: dataInterface = {
      api: ADMIN_API.SETTING.MATCH_HISTORY.GET_LIST,
      value: {
        type: TYPE,
        page: "1",
        limit: "100",
      },
    };
    if (SEARCH !== "") {
      data.value.search = SEARCH;
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setSportList(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const rollbackWinner = async (e: any) => {
    e.preventDefault();
    setOpen("");
    let data: any = {
      api: ADMIN_API.SETTING.MATCH_HISTORY.ROLL_BACK_WINNER,
      value: {
        id: sportItem._id,
      },
    };
    await postApi(data)
      .then(function (response) {
        console.log(response);
        matchListData(sportNameTypeList);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const setOpenTab = (tabName: string, item: any) => {
    let titleText = "";
    if (tabName === "setResult") {
      if (typeof sportData === "undefined") {
        notifyError("please select the Match.");
        return;
      }
      if (winner === "") {
        notifyError("please select the winner.");
        return;
      }
      titleText = `Set Winner Of - ${sportData.name} to - ${winner}`;
    } else if (tabName === "rollBackWinner") {
      titleText = `Set rollBack Winner Of - ${item.name}.`;
    }
    setPopUpTitle(`${titleText}.`);
    setPopUpText(`Are you sure you want to ${titleText} ?`);
    setOpen(tabName);
    setSportItem(item);
  };
  return (
    <>
      {isLoader && <Loader />}
      <React.Fragment>
        <h4 className="mb-10 main_wrap" style={{ padding: "15px 15px 0 0px", marginTop: "35px" }}>
          Market Result
        </h4>
        <div className="container main_wrap">
          <div className="admin-setting">
            <div className="admin-setting-inner">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <label>Select Sport:</label>
                <select
                  style={{ height: "25px", margin: "0 10px", width: "120px" }}
                  name="cars"
                  id="cars"
                  value={sportName}
                  onChange={(e) => {
                    setSportName(e.target.value);
                  }}
                >
                  <option value="">Select Sport</option>
                  <option value="cricket">Cricket</option>
                  <option value="soccer">Soccer</option>
                  <option value="tennis">Tennis</option>
                  {isEsoccer === "true" && (
                    <option value="esoccer">E-soccer</option>
                  )}
                  {isBasketBall === "true" && (
                    <option value="basketball">Basket Ball</option>
                  )}
                </select>
                <label>Select Match:</label>
                <select
                  style={{ height: "25px", margin: "0 10px", width: "120px" }}
                  name="cars"
                  id="cars"
                  onChange={(e) => {
                    setSportDataFromOnChange(e.target.value);
                  }}
                >
                  <option value="">Select Match</option>
                  {sportMatchName &&
                    sportMatchName?.results?.length &&
                    sportMatchName?.results?.map((item) => {
                      return <option value={item?._id}>{item?.name}</option>;
                    })}
                </select>
                <label>Select Market:</label>
                <select
                  style={{ height: "25px", margin: "0 10px", width: "120px" }}
                  name="cars"
                  id="cars"
                  onChange={(e) => {
                    setMatchType(e.target.value);
                  }}
                >
                  <option value="">Select Market</option>
                  {sportData && <option value="Odds">Match Odds</option>}
                </select>
                <label>Select Winner:</label>
                <select
                  style={{ height: "25px", margin: "0 10px", width: "120px" }}
                  name="cars"
                  id="cars"
                  value={winner}
                  onChange={(e) => setWinner(e.target.value)}
                >
                  <option value="">Select Winner</option>
                  {matchType !== "" && (
                    <option value="cancel">No Result</option>
                  )}
                  {sportData &&
                    matchType !== "" &&
                    sportData?.winnerSelection.length > 0
                    ? sportData?.winnerSelection.map((value: string) => {
                      return <option value={value}>{value}</option>;
                    })
                    : matchType !== "" &&
                    sportData?.name.split(" v ").map((value: string) => {
                      return <option value={value}>{value}</option>;
                    })}
                </select>
                <div className="search-btn">
                  <button
                    style={{ width: "100px" }}
                    onClick={(e) => setOpenTab("setResult", {})}
                  >
                    Set Result
                  </button>
                </div>
              </div>
            </div>
          </div>
          <table className="table01 margin-table">
            <thead>
              <tr className="light-grey-bg">
                <th> Sport </th>
                <th> Match ID </th>
                <th> Match Name </th>
                <th> Market </th>
                <th> Winner </th>
                <th> Status </th>
                <th> By Source </th>
                <th> Date </th>
                <th> Action </th>
              </tr>
            </thead>
            <tbody id="matches-table">
              {sportList &&
                sportList?.results?.length &&
                sportList?.results?.map((item: any) => {
                  return (
                    <tr>
                      <td style={{ width: "20%" }}>{item?.type}</td>
                      <td style={{ width: "20%" }}>{item?.gameId}</td>
                      <td style={{ width: "20%" }}>{item?.name} </td>
                      <td style={{ width: "20%" }}>Match Odds</td>
                      <td style={{ width: "20%" }}>{item?.winner}</td>
                      <td style={{ width: "20%" }}>
                        <span className={`badge ${item?.settlementType === 'auto' ? 'badge-success text-white' : 'badge-primary text-white'}`}>
                          {item?.settlementType || 'manual'}
                        </span>
                      </td>
                      <td style={{ width: "20%" }}>{item?.settledBy || 'Admin'}</td>
                      <td style={{ width: "20%" }}>{item?.openDate}</td>
                      <td
                        style={{
                          width: "20%",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div className="search-btn">
                          <button
                            style={{
                              width: "80px",
                              height: "25px",
                              fontSize: "11px",
                              background: "#dc143c",
                              color: "#FFF",
                            }}
                            onClick={() => setOpenTab("rollBackWinner", item)}
                          >
                            Rollback
                          </button>
                        </div>
                        <div className="search-btn">
                          <button
                            style={{
                              width: "80px",
                              height: "25px",
                              fontSize: "11px",
                              background: "red",
                              color: "#FFF",
                            }}
                          >
                            Inactive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {open !== "" && (
          <ConfirmationPopup
            title={popUpTitle}
            description={popUpText}
            OpenModal={open !== ""}
            closeModel={() => setOpen("")}
            submit={(e: any) =>
              open === "setResult" ? callWinnerAPI(e) : rollbackWinner(e)
            }
          />
        )}
      </React.Fragment>
    </>
  );
}
export default ASetMarketResult;
