import React, { useDebugValue, useEffect, useState } from "react";
import moment from 'moment';
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
import Loader from "../../components/Loader";
import InPageLoader from "../../components/InPlageLoader";
import { Value } from "sass";

function LossCasino() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const DD = useSelector((e: any) => e.domainDetails);
  const HeaderData = useSelector((e: any) => e.Header);

  const [isLoader, setLoader] = useState(false);
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  useEffect(() => {
    getPageData();
    return () => { };
  }, []);

  const getPageData = async (
    ID: string = "",
    FROM: string = "",
    TO: string = "",
    FILTER: string = ""
  ) => {
    setLoader(true);
    //TYPE: string, PAGE: string, SEARCH: string = ''
    let data: any = {
      api: ADMIN_API.REPORT.DOWN_LINE_CASINO,
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
    } else {
      data.value.filter = "today";
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        debugger;
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
    }
  };
  const getAdminClick = () => {
    getPageData("", startDate.toString(), endDate.toString(), "all");
  };

  return (
    <>
      <div className="container main_wrap">
        <div className="top_header">
          <div className="top_header_title">
            <h5>Profit/Loss Report by Casino</h5>
          </div>
        </div>

        <div
          style={{
            // display: "flex",
            display: "none",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p style={{ fontSize: "14px" }}> Data source : </p>
          <select
            style={{ height: "22px", margin: "0 10px" }}
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
            <ul className="input-list">
              <li><label>Type</label></li>
              <li>
                <select name="sports" id="sports">

                  <option value="0">All</option>

                  <option value="6">Inter. Casino</option>

                  <option value="7">AWC Casino</option>
                </select>
              </li>
              <li></li>

              <li><label>Period</label></li>
              <li>
                <input id="startDate" className="cal-input" value={`${moment(startDate).format('YYYY-MM-DD')}`}  type="date" placeholder="YYYY-MM-DD" onChange={(e:any)=> setStartDate(e?.target?.value)}/>
                {/* <ReactDatePicker id="startDate" selected={startDate} className='cal-input' onChange={(date: Date) => setStartDate(date)} /> */}
                &nbsp; to&nbsp;
                <input id="endDate" className="cal-input" value={`${moment(endDate).format('YYYY-MM-DD')}`} type="date" placeholder="YYYY-MM-DD" onChange={(e:any)=> setEndDate(e?.target?.value)} />
                {/* <ReactDatePicker selected={endDate} className='form-control hasDatepicker' onChange={(date: Date) => setEndDate(date)} /> */}
              </li>
            </ul>

            <div className="account_tabs_filter d_flex">
              <div style={{ marginRight: "10px" }}>
                <input
                  type="button"
                  onClick={() => filterButtonClick("today")}
                  value="Just For Today"
                  name="today"
                  id="today"
                  className="btn btn-default-customize"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                />
              </div>
              <div style={{ marginRight: "10px" }}>
                <input
                  type="button"
                  onClick={() => filterButtonClick("yesterday")}
                  value="From Yesterday"
                  name="yesterday"
                  id="yesterday"
                  className="btn btn-default-customize"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                />
              </div>
              <div style={{ marginRight: "10px" }}>
                <input
                  type="button"
                  onClick={() => getFilterButtonClick()}
                  value="Get P & L"
                  name="getPL"
                  id="getPL"
                  className="submit-btn btn_black"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                />
              </div>
            </div>
          </div>

          <div className="my-account-section-content">
            <div style={{display:"none"}}>
              <ul className="agentlist d_flex_fix">
                {pageData?.uperLineInfo?.map((item: any, i: any) => {
                  return (
                    <li
                      onClick={() =>
                        i === 0 ? getAdminClick() : userClick(item)
                      }
                    >
                      <a
                        href="javascript:void(0)"
                        className="agent-bread-cum sub-agent"
                        data-id="1"
                      >
                        <span className="blue-bg text-white">
                          {item?.agent_level}
                        </span>
                        <strong id="1">{item?.user_name}</strong>
                      </a>
                      <img src={arrowImage} />
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="my-account-section-content-table">
              <table id="resultTable" className="table01 margin-table">
                <thead>
                  <tr>
                    <th className="light-grey-bg">Website</th>
                    <th className="light-grey-bg">UID</th>
                    {/* <th className="light-grey-bg">Casino Stack</th> */}
                    <th className="light-grey-bg align-R">Casino P/L</th>
                    <th className="light-grey-bg align-R">Comm.</th>
                    <th className="light-grey-bg align-R">Total P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoader && pageData.userList && pageData.userList?.length > 0 ? (
                    pageData.userList.map((item: any, i: any) => {
                      return (
                        <>
                          <tr key={item._id}>
                          <td className="text-green">{item?.domain?.length ? item?.domain[0]?.domain : ""}</td>
                            <td>
                              <a
                                onClick={() => userClick(item)}
                                href="javascript:void(0)"
                                className="text-decoration-none"
                                data-id="149"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                                </svg>
                                <span className="badge bg-warningNew text-white">
                                  {item.agent_level}
                                </span>
                                {item.user_name}
                              </a>
                            </td>
                            {/* <td className="text-green">{item.casinoStack}</td> */}
                            <td
                              className={
                                item.casinoProfitLost < 0
                                  ? "text-danger align-R"
                                  : "text-green align-R"
                              }
                            >
                              {item.casinoProfitLost}
                            </td>
                            <td className="text-green align-R">{item.comm}</td>
                            <td
                              className={
                                item.total < 0 ? "text-danger align-R" : "text-green align-R"
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
                      <strong>All</strong>
                    </th>
                    <th className="border-top">
                      <strong>Total</strong>
                    </th>
                    {/* <th className="light-grey-bg border-top">
                      {pageData?.mainTotal?.casinoStack}
                    </th> */}
                    <th className="light-grey-bg border-top align-R">
                      {pageData?.mainTotal?.casinoProfitLost}
                    </th>
                    <th className="light-grey-bg border-top align-R">
                      {pageData?.mainTotal?.comm}
                    </th>
                    <th className="light-grey-bg border-top align-R">
                      {pageData?.mainTotal?.total}
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

export default LossCasino;
