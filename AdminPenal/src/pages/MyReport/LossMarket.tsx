import React, { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import Pagination from "../../components/Pagination";
import { postApi } from "../../service";
import arrowImage from "../../assets/images/arrow-right2.png";
import InPageLoader from "../../components/InPlageLoader";
import moment from "moment";

interface Report {
  results: any[];
  page: string;
  limit: string;
  totalPages: number;
  totalResults: number;
}

interface Total {
  // matchPl: number;
  // matchStack: number;
  // bookMakerStack: number;
  // bookMakerPl: number;
  // fancyStack: number;
  // fancyPl: number;
  // premPl: number;
  // premStack: number;
  // total: number;

  downlinePl: number;
  playerPl: number;
  stake: number;
  commission: number;
  UpLinePl: number;
}

interface PAGE_DATA {
  report: Report;
  total: Total;
}
function LossMarket() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [userList, setUserList] = useState<any>({});
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleRow = (index: any) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const [isLoader, setLoader] = useState(false);

  const [filterForm, setFilterForm] = useState({
    id: "",
    from: "",
    to: "",
    filter: "",
  });

  const [selectedOption, setSelectedOption] = useState(null);

  const [tab, setTab] = useState("all");

  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PAGE_DATA>();
  useEffect(() => {
    // getPageData("", "", "", "", "", "1");
    getPageData("", startDate.toString(), endDate.toString(), "", "" ,"1");
    getUserList();
    return () => {};
  }, []);

  const getUserList = async () => {
    let data: any = {
      api: ADMIN_API.REPORT.USER_LIST,
      value: {},
    };

    await postApi(data)
      .then(function (response) {
        console.log(response);
        let options: any[] = [{ value: "", label: "all" }];
        response.data.data.userInfo.forEach((item: any) => {
          const option: any = { value: item._id, label: item.user_name };
          options.push(option);
        });
        setUserList(options);
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const getPageData = async (
    ID: string = "",
    FROM: string = "",
    TO: string = "",
    FILTER: string = "",
    TYPE: string = "",
    PAGE: string
  ) => {
    let data: any = {
      api: ADMIN_API.REPORT.PL_MARKET_REPORT,
      value: {
        // type: TYPE,
        page: PAGE ? PAGE : "1",
        limit: "50",
      },
    };
    if (ID !== "") {
      data.value.id = ID;
    }
    if (TO !== "") {
      data.value.to = TO;
    }
    if (FROM !== "") {
      data.value.from = FROM;
    }
    if (FILTER !== "") {
      data.value.filter = FILTER;
    }
    if (TYPE !== "") {
      data.value.type = TYPE;
    }
    setLoader(true);
    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const filterButtonClick = (TYPE: string) => {
    getPageData("", "", "", TYPE, "", "");
  };
  const handlePageClick = (e: any) => {
    console.log("page clicked", e);
    getPageData("", "", "", "", "", (e.selected + 1).toString());
  };

  const userSelectChange = (e: any) => {
    setFilterForm({ ...filterForm, id: e.value });
  };
  const filterSubmit = () => {
    getPageData(
      "",
      startDate.toString(),
      endDate.toString(),
      "",
      "",
      "1"
    );
  };
  return (
    <>
      <div className="container main_wrap">
        <div className="top_header">
          <div className="top_header_title pt-10">
            <h5>Profit/Loss Report by Market</h5>
          </div>
        </div>
        <div
          style={{
            // display: "flex",
            display: "none",
            alignItems: "center",
            marginBottom: "5px",
          }}
        >
          <span className="data-l">Data source : &nbsp;</span>
          <select name="cars" id="cars">
            <option value="volvo">All</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </div>
        <section className="my-account-section">
          <div className="function-wrap" style={{ display: "block" }}>
            <ul className="input-list">
              <li>
                <label>Sports</label>
              </li>
              <li>
                <select id="func_sports">
                  <option value="4">CRICKET OODS</option>
                  <option value="Book">CRICKET BOOKMAKER</option>
                  <option value="Fancy">CRICKET FANCY</option>
                  <option value="Fancy1">CRICKET FANCY1</option>
                  <option value="PremiumC">CRICKET PREMIUM</option>
                  <option value="OtherC">CRICKET OTHER</option>
                  <option value="Toss" selected>
                    Toss
                  </option>
                  <option value="2">TENNIS OODS</option>
                  <option value="PremiumT">TENNIS PREMIUM</option>
                  <option value="OtherT">TENNIS OTHER</option>
                  <option value="1">SOCCER OODS</option>
                  <option value="PremiumS">SOCCER PREMIUM</option>
                  <option value="OtherS">SOCCER OTHER</option>

                  <option value="2378962">ELECTION FANCY</option>
                  <option value="138">KABADDI</option>
                  <option value="-100">BINARY</option>
                </select>
              </li>
              <li>
                <label>Time Zone</label>
              </li>
              <li>
                <select name="timezone" id="timezone">
                  <option value="Pacific/Midway">
                    Pacific/Midway(GMT-11:00)
                  </option>

                  <option value="Pacific/Honolulu">
                    Pacific/Honolulu(GMT-10:00)
                  </option>

                  <option value="America/Juneau">
                    America/Juneau(GMT-9:00)
                  </option>

                  <option value="America/Los_Angeles">
                    America/Los_Angeles(GMT-8:00)
                  </option>

                  <option value="America/Phoenix">
                    America/Phoenix(GMT-7:00)
                  </option>

                  <option value="America/Chicago">
                    America/Chicago(GMT-6:00)
                  </option>

                  <option value="America/New_York">
                    America/New_York(GMT-5:00)
                  </option>

                  <option value="America/Santiago">
                    America/Santiago(GMT-4:00)
                  </option>

                  <option value="America/Sao_Paulo">
                    America/Sao_Paulo(GMT-3:00)
                  </option>

                  <option value="Atlantic/South_Georgia">
                    Atlantic/South_Georgia(GMT-2:00)
                  </option>

                  <option value="Atlantic/Azores">
                    Atlantic/Azores(GMT-1:00)
                  </option>

                  <option value="Europe/London">Europe/London(GMT+0:00)</option>

                  <option value="Europe/Paris">Europe/Paris(GMT+1:00)</option>

                  <option value="Africa/Cairo">Africa/Cairo(GMT+2:00)</option>

                  <option value="Asia/Qatar">Asia/Qatar(GMT+3:00)</option>

                  <option value="Asia/Dubai">Asia/Dubai(GMT+4:00)</option>

                  <option value="Asia/Karachi">Asia/Karachi(GMT+5:00)</option>

                  <option value="IST" selected>
                    IST(Bangalore / Bombay / New Delhi) (GMT+5:30)
                  </option>

                  <option value="Asia/Kathmandu">
                    Asia/Kathmandu(GMT+5:45)
                  </option>

                  <option value="Asia/Dhaka">Asia/Dhaka(GMT+6:00)</option>

                  <option value="Asia/Bangkok">Asia/Bangkok(GMT+7:00)</option>

                  <option value="Asia/Hong_Kong">
                    Asia/Hong_Kong(GMT+8:00)
                  </option>

                  <option value="Asia/Tokyo">Asia/Tokyo(GMT+9:00)</option>

                  <option value="Australia/Adelaide">
                    Australia/Adelaide(GMT+9:30)
                  </option>

                  <option value="Australia/Melbourne">
                    Australia/Melbourne(GMT+10:00)
                  </option>

                  <option value="Asia/Magadan">Asia/Magadan(GMT+11:00)</option>

                  <option value="Pacific/Fiji">Pacific/Fiji(GMT+12:00)</option>
                </select>
              </li>
              <li></li>

              <li>
                <label>Period</label>
              </li>
              <li>
                <input
                  id="startDate"
                  className="cal-input"
                  type="date"
                  value={`${moment(startDate).format("YYYY-MM-DD")}`}
                  placeholder="YYYY-MM-DD"
                  onChange={(e: any) => setStartDate(e?.target?.value)}
                />
                <input
                  id="startTime"
                  className="time-input "
                  type="text"
                  placeholder="09:00"
                  maxLength={8}
                  style={{ width: "15%" }}
                  readOnly
                />
                to
                <input
                  id="endDate"
                  className="cal-input"
                  type="date"
                  value={`${moment(endDate).format("YYYY-MM-DD")}`}
                  placeholder="YYYY-MM-DD"
                  onChange={(e: any) => setEndDate(e?.target?.value)}
                />
                <input
                  id="endTime"
                  className="time-input "
                  type="text"
                  placeholder="08:59"
                  maxLength={8}
                  style={{ width: "15%" }}
                  readOnly
                />
              </li>
            </ul>

            <ul className="input-list">
              <li>
                <a
                  id="today"
                  className="btn"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  onClick={()=> filterButtonClick('today')}
                >
                  Just For Today
                </a>
              </li>
              <li>
                <a
                  id="yesterday"
                  className="btn"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  onClick={()=> filterButtonClick('yesterday')}
                >
                  From Yesterday
                </a>
              </li>
              <li>
                <a
                  id="getPL"
                  className="btn-send"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  onClick={()=> filterSubmit()}
                >
                  Get P &amp; L
                </a>
              </li>
            </ul>
          </div>

          <div className="my-account-section-content">
            {/* <div>
            <ul className="agentlist" ><li>
              <a href="javascript:void(0)" className="agent-bread-cum sub-agent" data-id="1">
                <span className="blue-bg text-white">COM</span>
                <strong id="1">galaxy</strong>
              </a>
              <img src={arrowImage} />
            </li></ul>
          </div> */}
            <div className="my-account-section-content-table">
              <table id="resultTable" className="table01 margin-table">
                <thead>
                  <tr>
                    <th className="light-grey-bg">UID</th>
                    <th className="light-grey-bg align-R">Stake </th>
                    <th className="light-grey-bg align-R">Downline P/L </th>
                    <th className="light-grey-bg align-R">Player P/L </th>
                    <th className="light-grey-bg align-R">Comm. </th>
                    <th className="light-grey-bg align-R">Upline P/L</th>
                    {/* <th className="light-grey-bg">Match P/L </th>
                    <th className="light-grey-bg">Match Stake</th>
                    <th className="light-grey-bg">BM P/L</th>
                    <th className="light-grey-bg">BM Stake</th>
                    <th className="light-grey-bg">Fancy P/L</th>
                    <th className="light-grey-bg">Fancy Stake</th>
                    <th className="light-grey-bg">Premium P/L</th>
                    <th className="light-grey-bg">Premium Stake</th>
                    <th className="light-grey-bg">Net P/L</th> */}
                  </tr>
                </thead>
                <tbody>
                  {!isLoader &&
                  pageData?.report &&
                  pageData?.report?.results.length > 0 ? (
                    pageData?.report?.results.map((item: any, i: any) => {
                      return (
                        <>
                          <tr>
                            <td>
                              <a
                                href="javascript:void(0)"
                                className="text-decoration-none"
                                data-id="152"
                                onClick={() => {
                                  toggleRow(i);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                                </svg>
                                {/* <span>Toss</span> */}
                                {/* <span className="badge bg-warning text-dark">PL</span> */}
                                {item?.uid}
                              </a>
                            </td>
                            <td className="align-R">{item?.stake}</td>
                            <td className={item && item?.downlinePl >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.downlinePl}</td>
                            <td className={item && item?.playerPl >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.playerPl}</td>
                            <td className={item && item?.commission >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.commission}</td>
                            <td className={item && item?.UpLinePl >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.UpLinePl}</td>
                            {/* <td className="">{item?.matchPl}</td>
                            <td className="">{item?.fancyStack}</td>
                            <td className="">{item?.bookMakerPl}</td>
                            <td className="">{item?.bookMakerStack}</td>
                            <td className="">{item?.fancyPl}</td>
                            <td className="">{item?.fancyStack}</td>
                            <td className="">{item?.premPl}</td>
                            <td className="">{item?.premStack}</td>
                            <td className="">{item?.total}</td> */}
                          </tr>
                          {activeIndex === i && (
                            <tr>
                              <td>Toss</td>
                              <td className="align-R">{item?.stake}</td>
                              <td className={item && item?.downlinePl >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.downlinePl}</td>
                              <td className={item && item?.playerPl >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.playerPl}</td>
                              <td className={item && item?.commission >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.commission}</td>
                              <td className={item && item?.UpLinePl >= 0 ? "align-R text-green" : "align-R text-danger"}>{item?.UpLinePl}</td>
                              {/* <td className="">{item?.matchPl}</td>
                              <td className="">{item?.fancyStack}</td>
                              <td className="">{item?.bookMakerPl}</td>
                              <td className="">{item?.bookMakerStack}</td>
                              <td className="">{item?.fancyPl}</td>
                              <td className="">{item?.fancyStack}</td>
                              <td className="">{item?.premPl}</td>
                              <td className="">{item?.premStack}</td>
                              <td className="">{item?.total}</td> */}
                            </tr>
                          )}
                        </>
                      );
                    })
                  ) : isLoader ? (
                    <InPageLoader />
                  ) : (
                    <h2>No data Found</h2>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th className="border-top">
                      <strong>Total</strong>
                    </th>
                    <th className="border-top align-R">{pageData?.total.stake}</th>
                    <th className={pageData && pageData?.total?.downlinePl >= 0 ? 'border-top align-R text-green' : 'border-top align-R text-danger'}>{pageData?.total.downlinePl}</th>
                    <th className={pageData && pageData?.total?.playerPl >= 0 ? 'border-top align-R text-green' : 'border-top align-R text-danger'}>{pageData?.total.playerPl}</th>
                    <th className={pageData && pageData?.total?.commission >= 0 ? 'border-top align-R text-green' : 'border-top align-R text-danger'}>{pageData?.total.commission}</th>
                    <th className={pageData && pageData?.total?.UpLinePl >= 0 ? 'border-top align-R text-green' : 'border-top align-R text-danger'}>{pageData?.total.UpLinePl}</th>
                    {/* <th className="border-top">{pageData?.total.matchPl}</th>
                    <th className="text-green border-top">{pageData?.total.fancyStack}</th>
                    <th className="text-green border-top">
                      {pageData?.total.bookMakerPl}
                    </th>
                    <th className="text-green border-top">
                      {pageData?.total.bookMakerStack}
                    </th>
                    <th className="text-green border-top">{pageData?.total.fancyPl}</th>
                    <th className="text-green border-top">{pageData?.total.fancyStack}</th>
                    <th className="text-green border-top">{pageData?.total.premPl}</th>
                    <th className="text-green border-top">{pageData?.total.premStack}</th>
                    <th className="text-danger border-top">{pageData?.total.total}</th> */}
                  </tr>
                </tfoot>
              </table>
              {pageData?.report?.totalPages === 1 ||
              pageData?.report?.totalPages === 0 ? (
                ""
              ) : (
                <Pagination
                  handlePageClick={handlePageClick}
                  totalPages={pageData?.report?.totalPages}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default LossMarket;
