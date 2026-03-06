import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import ReactDatePicker from "react-datepicker";
import { useEffect, useState } from "react";
import SearchInput from "../../components/SearchInput";
import { ADMIN_API } from "../../common/common";
import { postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import { useNavigate } from "react-router-dom";

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

function AliveMatchbets() {
  const isEsoccer = process.env.REACT_APP_E_SOCCER;
  const isBasketBall = process.env.REACT_APP_BASKET_BALL;
  const navigate = useNavigate();
  const DD = useSelector((e: any) => e.domainDetails);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [sportName, setSportName] = useState<string>("");
  const [sportMatchName, setSportMatchName] = useState<Data>({});
  const [sportData, setSportData] = useState<Result>();
  const [betType, setBetType] = useState<string>("");
  const [marketType, setMarketType] = useState<string>("");
  const [marketList, setMarketList] = useState<any>({});
  const [betSiteType, setBetSiteType] = useState<string>("ALL");
  const [pageData, setPageData] = useState<any>({});

  useEffect(() => {
    // matchListData(sportNameTypeList)
    if (sportName !== "") getSportData();
    else {
      setSportMatchName({});
    }
    return () => { };
  }, [sportName]);

  useEffect(() => {
    if (sportName === "") {
      setBetType("");
      setMarketType("");
      setSportData(undefined);
    } else if (!sportData) {
      setBetType("");
      setMarketType("");
      setMarketList({});
    } else if (betType === "") {
      setMarketList({});
    }
    return () => { };
  }, [sportName, sportData, betType]);

  useEffect(() => {
    if (betType !== "") {
      if (betType === "market") {
        setMarketList({ betUnique: ["odds", "bookMark"] });
      } else {
        getFancyBetsListData();
      }
    }
  }, [betType]);
  useEffect(() => {
    if (
      marketType !== "" &&
      sportName !== "" &&
      sportData &&
      marketType !== ""
    ) {
      getPageData();
    }
  }, [marketType]);

  const getPageData = async () => {
    let data = {
      api: ADMIN_API.BET_LIST.LIST_LIVE,
      value: {
        matchId: sportData?._id,
        type: sportName,
        betType: marketType,
        betSide: betSiteType,
        page: "1",
        limit: "100",
      },
    };

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

  const getFancyBetsListData = async () => {
    let data = {
      api: ADMIN_API.SETTING.MANAGE_FANCY.LIST_OF_BET,
      value: {
        id: sportData?._id,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("getSiteData :: ", response);
        // if (response.data.data) {
        console.log("response.data.data?.siteInfo :: ", response.data.data);
        setMarketList(response.data.data);
        // }
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const getSportData = async () => {
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.GET_LIST,
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
  return (
    <>
      <div className="container main_wrap">
        <div className="my-account-section-content">
          <div className="my-account-section-content-table">
            <table id="resultTable" className="table01 margin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Refresh</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ width: "25%" }}>1</td>
                  <td style={{ width: "25%" }}>
                    <div className="search-btn s_mb-3">
                      <button
                        style={{ ...styleObjectBlackButton("red", true) }}
                      >
                        STOP
                      </button>
                    </div>
                  </td>
                  <td style={{ width: "25%" }}>is Idle</td>
                  <td style={{ width: "25%" }}>
                    <div className="search-btn s_mb-3">
                      <button
                        style={{ ...styleObjectBlackButton("red", true) }}
                        className="flex-align content-center rotate-icon"
                      >
                        <img
                          src="/images/reload.png"
                          alt=""
                          style={{ width: "16px", height: "16px" }}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="my-account-section_header s_pb-5">
            <div className="account_tabs_filter flex-align content-between">
              <div className="flex-align">
                <label> Select Sport </label>
                <div className="input_group s_mr-20">
                  <select
                    name="report_type"
                    id="report_type"
                    className="form-control"
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
                </div>
                <label> Select Match </label>
                <div className="input_group s_mr-20">
                  <select
                    name="report_type"
                    id="report_type"
                    className="form-control"
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
                </div>
                <label> Select Type </label>
                <div className="input_group s_mr-20">
                  <select
                    name="report_type"
                    id="report_type"
                    className="form-control"
                    onChange={(e) => {
                      setBetType(e.target.value);
                    }}
                  >
                    <option value=""> Select Type</option>
                    {sportData && (
                      <>
                        <option value="market">Market</option>
                        <option value="session"> Fancy</option>
                        <option value="toss"> Toss</option>
                        <option value="session1"> Fancy1</option>
                        <option value="premium"> Premium</option>
                        <option value="other"> Other</option>
                      </>
                    )}
                  </select>
                </div>
                <label> Select Market </label>
                <div className="input_group s_mr-20">
                  <select
                    name="report_type"
                    id="report_type"
                    className="form-control"
                    onChange={(e) => {
                      setMarketType(e.target.value);
                    }}
                  >
                    <option value=""> Select Market</option>
                    {marketList &&
                      marketList?.betUnique?.length &&
                      marketList?.betUnique?.map((item: any) => {
                        return (
                          <option value={item}>
                            {item === "odds"
                              ? "Match Odds"
                              : item === "bookMark"
                                ? "book Mark"
                                : item}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <label> Select Bet Type </label>
                <div className="input_group s_mr-20">
                  <select
                    name="report_type"
                    id="report_type"
                    className="form-control"
                    onChange={(e) => {
                      setBetSiteType(e.target.value);
                    }}
                  >
                    {marketType && (
                      <>
                        <option value="All"> All</option>
                        <option value="back"> Back</option>
                        <option value="lay"> Lay</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-align s_mt-10 justify-end">
            <input
              style={styleObjectBlackButton("red", true)}
              type="button"
              value="Delete Bets"
              name="acntbtn"
              className="submit-btn btn_black p-2 s_ml-10"
            />
            <input
              style={styleObjectBlackButton(DD?.colorSchema, true)}
              type="button"
              value="Shoe Bet Count"
              name="acntbtn"
              className="submit-btn btn_black p-2 s_ml-10"
            />
          </div>
          <div className="s_mb-10">
            <p>Enter Time Range</p>
          </div>
          <div className="account_tabs_filter flex-align s_mx-0 s_mb-10">
            <div className="input_group from-to">
              <div className="no-wrap flex-align">
                <div className="w_80">
                  <ReactDatePicker
                    selected={startDate}
                    className="form-control hasDatepicker"
                    onChange={(date: Date) => setStartDate(date)}
                  />
                </div>
                <span className="input-group-text p-0 ps-3 pe-3"> 09:00 </span>
              </div>
            </div>

            <label className="s_mx-10"> To </label>
            <div className="input_group from-to">
              <div className="no-wrap flex-align">
                <div className="w_80">
                  <ReactDatePicker
                    selected={endDate}
                    className="form-control hasDatepicker"
                    onChange={(date: Date) => setStartDate(date)}
                  />
                </div>
                <span className="input-group-text p-0 ps-3 pe-3"> 09:00 </span>
              </div>
            </div>
            <label className="s_mx-10"> Use Time </label>
            <div className="form-check flex-align w-20">
              <input
                className="form-check-input"
                checked={false}
                name="rolling_delay"
                type="checkbox"
                role="switch"
                id="rolling_delay"
              />
            </div>
          </div>
          <div className="s_mb-10">
            <p>Enter Odds</p>
          </div>

          <div className="fieldset flex-align s_mb-10">
            <div className="mb-2" style={{ width: "110px" }}>
              <span>
                <input
                  type="number"
                  name="credit_ref"
                  maxLength={16}
                  className="form-control"
                />
              </span>
            </div>
            <label className="s_mx-10"> Use Time </label>
            <div className="form-check">
              <input
                className="form-check-input"
                checked={false}
                name="rolling_delay"
                type="checkbox"
                role="switch"
                id="rolling_delay"
              />
            </div>
            <div className="search-btn">
              <button
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "60px",
                }}
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex-align content-between">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <SearchInput
                outsideBtn
                className="black-btn"
                placeholder="Enter UserId..."
                style={{ display: "inline-block" }}
              />
              <div className="search-btn">
                <button style={{ background: "black", color: "white" }}>
                  clear
                </button>
              </div>
            </div>
            <div className="flex-align">
              <div className="search-btn">
                <button
                  style={{
                    ...styleObjectBlackButton(DD?.colorSchema, true),
                    width: "95px",
                  }}
                >
                  User P/L
                </button>
              </div>
              <div className="search-btn">
                <button
                  style={{
                    ...styleObjectBlackButton(DD?.colorSchema, true),
                    width: "95px",
                  }}
                >
                  Pre Match P/L
                </button>
              </div>
              <div className="search-btn">
                <button
                  style={{
                    ...styleObjectBlackButton(DD?.colorSchema, true),
                    width: "95px",
                  }}
                >
                  Rejected Bets
                </button>
              </div>
            </div>
          </div>
          <div className="my-account-section-content-table">
            <table id="resultTable" className="table01 margin-table">
              <thead>
                <tr>
                  <th>Sports</th>
                  <th>Match Name</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Selection</th>
                  <th>Odds</th>
                  <th>Stake</th>
                  <th>Place Time</th>
                  <th>IP</th>
                  <th>Pnl</th>
                  <th>Del</th>
                </tr>
              </thead>
              <tbody>
                {pageData &&
                  pageData?.results?.length &&
                  pageData?.results?.map((item: any) => {
                    return (
                      <tr>
                        <td style={{ width: "5%" }}>{item?.type}</td>
                        <td style={{ width: "25%" }}>{item?.name}</td>
                        <td style={{ width: "8%" }}>
                          {item?.userId?.user_name}
                        </td>
                        <td style={{ width: "10%" }}>{item?.betType}</td>
                        <td style={{ width: "25%" }}>{item?.selection}</td>
                        <td style={{ width: "10%" }}>{item?.oddsUp}</td>
                        <td style={{ width: "10%" }}>{item?.stake}</td>
                        <td style={{ width: "25%" }}>{item?.createdAt}</td>
                        <td style={{ width: "25%" }}>-</td>
                        <td style={{ width: "10%" }}>{item?.profit}</td>
                        <td style={{ width: "25%" }}>
                          <button
                            style={{
                              ...styleObjectBlackButton(DD?.colorSchema, true),
                              width: "95px",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {/* <tr>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                    <td style={{ width: "25%" }}>Cricket</td>
                                </tr> */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default AliveMatchbets;
