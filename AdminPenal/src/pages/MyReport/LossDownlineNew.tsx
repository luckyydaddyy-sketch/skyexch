import React, { useDebugValue, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import Pagination from "../../components/Pagination";
import { postApi } from "../../service";
import { Data, dataInterface } from "../Setting/interface";
import arrowImage from "../../assets/images/arrow-right2.png";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import InPageLoader from "../../components/InPlageLoader";
import moment from "moment";

function LossDownline() {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
  const HeaderData = useSelector((e: any) => e.Header);
  const DD = useSelector((e: any) => e.domainDetails);
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const [isLoader, setLoader] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {
    getPageData("", startDate.toString(), endDate.toString(), "all");
    return () => { };
  }, []);

  const toggleRow = (index: any) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const getPageData = async (
    ID: string = "",
    FROM: string = "",
    TO: string = "",
    FILTER: string = ""
  ) => {
    //TYPE: string, PAGE: string, SEARCH: string = ''
    let data: any = {
      api: ADMIN_API.REPORT.DOWN_LINE,
      value: {
        // type: TYPE,
        // page: PAGE ? PAGE : '1',
        // limit: '10'
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
    setLoader(true);
    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
        setLoader(false);
      })
      .catch((err) => {
        debugger;
        setLoader(false);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const handlePageClick = (e: any) => {
    console.log("page clicked", e);
    getPageData();
  };

  const filterButtonClick = (TYPE: string) => {
    getPageData("", "", "", TYPE);
  };
  const getFilterButtonClick = () => {
    getPageData("", startDate.toString(), endDate.toString(), "all");
  };

  const userClick = (USER: any) => {
    if (USER.agent_level && USER.agent_level !== "PL") {
      getPageData(USER._id, startDate.toString(), endDate.toString(), "all");
    }else{
      navigate(`/user/bethistory/player/${USER._id}/`);
    }
  };
  const getAdminClick = () => {
    getPageData("", "", "", "all");
  };

  return (
    <>
      <div className="container main_wrap">
        <div className="top_header">
          <div className="top_header_title">
            <h5>Profit/Loss Report by Downline</h5>
          </div>
        </div>

        <div
          style={{
            display: "none",
            // display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label className="data-l">Data source :</label>
          {/* <p style={{ fontSize: "14px" }}> Data source : </p> */}
          <select
            style={{ height: "25px", margin: "0 5px" }}
            name="cars"
            id="cars"
          >
            <option value="volvo">All</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </div>
        <section className="my-account-section">
          <div className="my-account-section_header">
            <ul className="input-list" style={{
              display: "flex",
              alignItems: "center",
            }}>
              <li><label>Time Zone</label></li>
              <li>
                <select name="timezone" id="timezone">
                  <option value="Pacific/Midway">Pacific/Midway(GMT-11:00)</option>
                  <option value="Pacific/Honolulu">Pacific/Honolulu(GMT-10:00)</option>
                  <option value="America/Juneau">America/Juneau(GMT-9:00)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles(GMT-8:00)</option>
                  <option value="America/Phoenix">America/Phoenix(GMT-7:00)</option>

                  <option value="America/Chicago">America/Chicago(GMT-6:00)</option>

                  <option value="America/New_York">America/New_York(GMT-5:00)</option>

                  <option value="America/Santiago">America/Santiago(GMT-4:00)</option>

                  <option value="America/Sao_Paulo">America/Sao_Paulo(GMT-3:00)</option>

                  <option value="Atlantic/South_Georgia">Atlantic/South_Georgia(GMT-2:00)</option>

                  <option value="Atlantic/Azores">Atlantic/Azores(GMT-1:00)</option>

                  <option value="Europe/London">Europe/London(GMT+0:00)</option>

                  <option value="Europe/Paris">Europe/Paris(GMT+1:00)</option>

                  <option value="Africa/Cairo">Africa/Cairo(GMT+2:00)</option>

                  <option value="Asia/Qatar">Asia/Qatar(GMT+3:00)</option>

                  <option value="Asia/Dubai">Asia/Dubai(GMT+4:00)</option>

                  <option value="Asia/Karachi">Asia/Karachi(GMT+5:00)</option>

                  <option value="IST" selected>IST(Bangalore / Bombay / New Delhi) (GMT+5:30)</option>

                  <option value="Asia/Kathmandu">Asia/Kathmandu(GMT+5:45)</option>

                  <option value="Asia/Dhaka">Asia/Dhaka(GMT+6:00)</option>

                  <option value="Asia/Bangkok">Asia/Bangkok(GMT+7:00)</option>

                  <option value="Asia/Hong_Kong">Asia/Hong_Kong(GMT+8:00)</option>

                  <option value="Asia/Tokyo">Asia/Tokyo(GMT+9:00)</option>

                  <option value="Australia/Adelaide">Australia/Adelaide(GMT+9:30)</option>

                  <option value="Australia/Melbourne">Australia/Melbourne(GMT+10:00)</option>

                  <option value="Asia/Magadan">Asia/Magadan(GMT+11:00)</option>

                  <option value="Pacific/Fiji">Pacific/Fiji(GMT+12:00)</option>

                </select>
              </li>
              <li></li>

              <li><label>Period &nbsp;</label></li>
              <li >
                <input style={{ margin: "0px 5px 5px 0px" }} id="startDate" className="cal-input" type="date" value={`${moment(startDate).format('YYYY-MM-DD')}`}  placeholder="YYYY-MM-DD" onChange={(e:any)=> setStartDate(e?.target?.value)} />
                <input style={{ margin: "0px 5px 5px 0px", width: "15%" }} id="startTime" className="time-input " type="text" placeholder="09:00" maxLength={8} readOnly />
                &nbsp;to &nbsp;
                <input style={{ margin: "0px 5px 5px 0px" }} id="endDate" className="cal-input" type="date" value={`${moment(endDate).format('YYYY-MM-DD')}`} placeholder="YYYY-MM-DD" onChange={(e:any)=> setEndDate(e?.target?.value)}/>
                <input style={{ margin: "0px 5px 5px 0px", width: "15%" }} id="endTime" className="time-input " type="text" placeholder="08:59" maxLength={8} readOnly />
              </li>
            </ul>
            <ul className="input-list">
              <li><a id="today" className="btn" style={styleObjectBlackButton(DD?.colorSchema, true)} onClick={()=> filterButtonClick('today')}>Just For Today</a></li>
              <li ><a id="yesterday" className="btn" style={styleObjectBlackButton(DD?.colorSchema, true)} onClick={()=> filterButtonClick('yesterday')} >From Yesterday</a></li>
              <li><a id="getPL" className="btn-send" style={styleObjectBlackButton(DD?.colorSchema, true)} onClick={()=> getFilterButtonClick()}>Get P &amp; L</a></li>
            </ul>
          </div>

          <div className="my-account-section-content">
            {/* <div>
                            <ul className="agentlist d_flex_fix" >
                                {pageData?.uperLineInfo?.map((item: any, i: any) => {
                                    return (
                                        <li onClick={() => i === 0 ? getAdminClick() : userClick(item)}>
                                            <a href="javascript:void(0)" className="agent-bread-cum sub-agent" data-id="1">
                                                <span className="blue-bg text-white">{item?.agent_level}</span>
                                                <strong id="1">{item?.user_name}</strong>
                                            </a>
                                            <img src={arrowImage} />
                                        </li>
                                    )
                                })}
                            </ul>
                        </div> */}
            <div className="my-account-section-content-table">
              <table id="resultTable" className="table01 margin-table">
                <thead>
                  <tr>
                    <th className="light-grey-bg" style={{ width: "270px" }}>UID</th>
                    {/* <th className="light-grey-bg">Stack</th> */}
                    <th className="light-grey-bg align-R" style={{ width: "270px" }}>Sports PL</th>
                    {/* <th className="light-grey-bg">Player AWC Casino Stack</th> */}
                    <th className="light-grey-bg align-R" style={{ width: "270px" }}>Casino P/L</th>
                    <th className="light-grey-bg align-R" style={{ width: "270px" }}>Comm.</th>
                    <th className="light-grey-bg align-R" style={{ width: "270px" }}>Total P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoader && pageData.userList && pageData.userList?.length > 0 ? (
                    pageData.userList.map((item: any, i: any) => {
                      return (
                        <>
                          <tr key={item._id}>
                            <td>
                              <a
                                onClick={() => {
                                  toggleRow(i);
                                  userClick(item)
                                }
                                }
                                href="javascript:void(0)"
                                className="text-decoration-none"
                                data-id="149"
                              >
                                {/* <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                                </svg> */}
                                <span className="badge bg-warning text-dark">
                                  {item.agent_level}
                                </span>
                                {item.user_name}
                              </a>
                            </td>
                            {/* <td className="">{item.stack}</td> */}
                            <td
                              className={
                                item.playerProfitLost < 0
                                  ? "text-danger align-R"
                                  : "text-green align-R"
                              }
                            >
                              {item.playerProfitLost}
                            </td>
                            {/* <td className="text-green">{item.casinoStack}</td> */}
                            <td className={
                                item.casinoProfitLost < 0
                                  ? "text-danger align-R"
                                  : "text-green align-R"
                              }>
                              {item.casinoProfitLost}
                            </td>
                            <td className="text-green align-R">{item.comm}</td>
                            <td
                              className={
                                item.total < 0
                                  ? "text-danger align-R"
                                  : "text-green align-R"
                              }
                            >
                              {item.total}
                            </td>
                          </tr>
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
                    {/* <th className="border-top">{pageData?.total?.stack}</th> */}
                    <th
                      className={
                        pageData?.total?.playerProfitLost < 0
                          ? "text-danger border-top align-R"
                          : "text-green border-top align-R"
                      }
                    >
                      {pageData?.total?.playerProfitLost}
                    </th>
                    {/* <th className="text-green border-top">
                      {pageData?.total?.casinoStack}
                      </th> */}
                    <th className={
                        pageData?.total?.casinoProfitLost < 0
                          ? "text-danger border-top align-R"
                          : "text-green border-top align-R"
                      }>
                      {pageData?.total?.casinoProfitLost}
                    </th>
                    <th className="text-green border-top align-R">{pageData?.total?.comm}</th>
                    <th
                      className={
                        pageData?.total?.total < 0
                          ? "text-danger border-top align-R"
                          : "text-green border-top align-R"
                      }
                    >
                      {pageData?.total?.total}
                    </th>
                  </tr>
                </tfoot>
              </table>
              {/* {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />} */}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default LossDownline;
