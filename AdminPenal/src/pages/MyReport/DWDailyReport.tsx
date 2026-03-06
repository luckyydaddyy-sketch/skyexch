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
import NewPagination from "../../components/new-pagination";

function DWDailyReport() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
  );
  const [endDate, setEndDate] = useState(new Date());
  const HeaderData = useSelector((e: any) => e.Header);
  const DD = useSelector((e: any) => e.domainDetails);
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const [pageListData, setPageListData] = useState<any>({});
  const [userData, setUserData] = useState<any>({});
  const [isLoader, setLoader] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [tab, setTab] = useState("withdrawal");
  useEffect(() => {
    getPageData("", startDate.toString(), endDate.toString(), "all");
    getPageListData(startDate.toString(), endDate.toString(), '', tab, '1')
    getUserData();
    return () => {};
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
      api: ADMIN_API.REPORT.DW_DAILY,
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
        console.log("DW_DAILY", response);
        console.log("DW_DAILY", response.data.data);
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
  const getUserData = async (
    ID: string = "",
    FROM: string = "",
    TO: string = "",
    FILTER: string = ""
  ) => {
    //TYPE: string, PAGE: string, SEARCH: string = ''
    let data: any = {
      api: ADMIN_API.REPORT.USER_LIST,
      value: {
        // type: TYPE,
        // page: PAGE ? PAGE : '1',
        // limit: '10'
      },
    };
    // if (ID !== "") {
    //   data.value.id = ID;
    // }
    // if (TO !== "") {
    //   data.value.to = TO;
    // }
    // if (FROM !== "") {
    //   data.value.from = FROM;
    // }
    // if (FILTER !== "") {
    //   data.value.filter = FILTER;
    // }
    // setLoader(true);
    await postApi(data)
      .then(function (response) {
        // console.log("DW_DAILY",response);
        // console.log("DW_DAILY",response.data.data);
        setUserData(response.data.data);
        // setLoader(false);
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
    getPageListData(startDate.toString(), endDate.toString(), '', tab, e.toString())
  };

  const filterButtonClick = (TYPE: string) => {
    getPageData("", "", "", TYPE);
    getPageListData('', '', TYPE, tab, '1')
  };
  const getFilterButtonClick = () => {
    getPageData("", startDate.toString(), endDate.toString(), "all");
    getPageListData(startDate.toString(), endDate.toString(), 'all', tab, "1")
  };

  const userClick = (e: any) => {
    const { value } = e.target;
    // if (USER.agent_level && USER.agent_level !== "PL") {
    getPageData(value, startDate.toString(), endDate.toString(), "all");
    // getPageListData(startDate.toString(), endDate.toString(), 'all', tab, "1")
    // }
  };
  const getAdminClick = () => {
    getPageData("", "", "", "all");
  };

  const getPageListData = async (
    FROM: string = "",
    TO: string = "",
    FILTER: string = "",
    TYPE: string = "deposit",
    PAGE: string
  ) => {
    let data: any = {
      api: ADMIN_API.REPORT.DW,
      value: {
        // type: TYPE,
        // page: PAGE ? PAGE : '1',
        // limit: '10'
      },
    };
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

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageListData(response.data.data);

        console.log(response.data.data, ":::::");
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  return (
    <>
      <div className="container main_wrap">
        <div className="top_header">
          <div className="top_header_title">
            <h5>Daily report</h5>
          </div>
        </div>

        <section className="my-account-section">
          <div className="my-account-section_header">
            <ul
              className="input-list"
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <li>
                <label>Select Agent</label>
              </li>
              <li>
                <select
                  name="timezone"
                  id="timezone"
                  onChange={(e) => userClick(e)}
                >
                  <option value="">Select Agent</option>
                  {userData &&
                    userData?.agentInfo?.length &&
                    userData?.agentInfo?.map((item: any) => {
                      return (
                        <option value={item?._id}>{item?.user_name}</option>
                      );
                    })}
                </select>
              </li>
              <li></li>

              <li>
                <label>Period &nbsp;</label>
              </li>
              <li>
                <input
                  style={{ margin: "0px 5px 5px 0px" }}
                  id="startDate"
                  className="cal-input"
                  type="date"
                  value={`${moment(startDate).format("YYYY-MM-DD")}`}
                  placeholder="YYYY-MM-DD"
                  onChange={(e: any) => setStartDate(e?.target?.value)}
                />
                <input
                  style={{ margin: "0px 5px 5px 0px", width: "15%" }}
                  id="startTime"
                  className="time-input "
                  type="text"
                  placeholder="09:00"
                  maxLength={8}
                  readOnly
                />
                &nbsp;to &nbsp;
                <input
                  style={{ margin: "0px 5px 5px 0px" }}
                  id="endDate"
                  className="cal-input"
                  type="date"
                  value={`${moment(endDate).format("YYYY-MM-DD")}`}
                  placeholder="YYYY-MM-DD"
                  onChange={(e: any) => setEndDate(e?.target?.value)}
                />
                <input
                  style={{ margin: "0px 5px 5px 0px", width: "15%" }}
                  id="endTime"
                  className="time-input "
                  type="text"
                  placeholder="08:59"
                  maxLength={8}
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
                  onClick={() => filterButtonClick("today")}
                >
                  Just For Today
                </a>
              </li>
              <li>
                <a
                  id="yesterday"
                  className="btn"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  onClick={() => filterButtonClick("yesterday")}
                >
                  From Yesterday
                </a>
              </li>
              <li>
                <a
                  id="getPL"
                  className="btn-send"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  onClick={() => getFilterButtonClick()}
                >
                  Get P &amp; L
                </a>
              </li>
            </ul>
          </div>

          <div className="container account main_wrap">
            <div className="account_tabs">
              <div className="account_tabs_r" style={{ width: "100%" }}>
                <div className="d_flex account_tabs_r_d">
                  <div className="account_tabs_r_d_l">
                    <div className="account_tabs_r_d_l_item_wrp d_flex">
                      <div className="account_tabs_r_d_l_item">
                        <h5 className="account_tabs_r_d_l_item-header bg-card-header text-white">
                          Deposit
                        </h5>
                        <div>
                          <table className="w-100 table">
                            <tbody>
                              <tr>
                                <td width="50%">Total Successfull Deposit</td>
                                <td style={{ textAlign: "end" }}>
                                  {pageData.successfullyDeposit}
                                </td>
                              </tr>
                              <tr>
                                <td width="50%">Total Rejected Deposit</td>
                                <td style={{ textAlign: "end" }}>
                                  {pageData.rejectedDeposit}
                                </td>
                              </tr>
                              <tr>
                                <td width="50%">Total Pending Deposit</td>
                                <td style={{ textAlign: "end" }}>
                                  {pageData.pendingDeposit}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="account_tabs_r_d_l_item">
                        <h5 className="account_tabs_r_d_l_item-header bg-card-header text-white">
                          Withdraw
                        </h5>
                        <div>
                          <table className="w-100 table">
                            <tbody>
                              <tr>
                                <td width="50%">Total Successfull Withdraw</td>
                                <td style={{ textAlign: "end" }}>
                                  {pageData.successfullyWithdraw}
                                </td>
                              </tr>
                              <tr>
                                <td width="50%">Total Rejected Withdraw</td>
                                <td style={{ textAlign: "end" }}>
                                  {pageData.rejectedWithdraw}
                                </td>
                              </tr>
                              <tr>
                                <td width="50%">Total Pending Withdraw</td>
                                <td style={{ textAlign: "end" }}>
                                  {pageData.pendingWithdraw}
                                </td>
                              </tr>
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
                  {tab === "withdrawal" ? (
                    <tr>
                      <th className="light-grey-bg">Account No</th>
                      <th className="light-grey-bg">User Name</th>
                      <th className="light-grey-bg">Transaction Type</th>
                      <th className="light-grey-bg">Amount </th>
                      <th className="light-grey-bg">Bank Name</th>
                      <th className="light-grey-bg">Descriptions</th>
                      <th className="light-grey-bg">Holder Name</th>
                      <th className="light-grey-bg">IFSC Code</th>
                      <th className="light-grey-bg">Mobile No</th>
                      <th className="light-grey-bg">type</th>
                      <th className="light-grey-bg">Created At</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="light-grey-bg">User Name</th>
                      <th className="light-grey-bg">Amount </th>
                      <th className="light-grey-bg">Mobile No</th>
                      <th className="light-grey-bg">Transaction Id</th>
                      {/* <th className="light-grey-bg">Descriptions</th>
                  <th className="light-grey-bg">Holder Name</th>
                  <th className="light-grey-bg">IFSC Code</th>
                  <th className="light-grey-bg">type</th> */}
                      <th className="light-grey-bg">Created At</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {pageListData?.amountInfo &&
                  pageListData?.amountInfo?.results &&
                  pageListData?.amountInfo?.results?.length > 0 ? (
                    pageListData?.amountInfo?.results?.map((item: any, i: any) => {
                      return (
                        <>
                          {tab === "withdrawal" ? (
                            <tr>
                              <td className="">{item?.accountNo}</td>
                              <td className="">{item?.userName}</td>
                              <td className={item?.transactionType === "Deposit" ? "text-green" : "text-danger"}>{item?.transactionType}</td>
                              <td className={item?.transactionType === "Deposit" ? "text-green" : "text-danger"}>{item?.amount}</td>
                              <td className="">{item?.bankName}</td>
                              <td className="">{item?.descrpitions}</td>
                              <td className="">{item?.holderName}</td>
                              <td className="">{item?.ifscCode}</td>
                              <td className="">{item?.mobileNo}</td>
                              <td className="">{item?.type}</td>
                              <td className="">
                                {moment(item.createdAt).format(
                                  "DD-MM-YYYY hh:mm A"
                                )}
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td className="">{item?.userName}</td>
                              <td className="">{item?.amount}</td>
                              <td className="">{item?.mobileNo}</td>
                              <td className="">{item?.transactionId}</td>
                              <td className="">
                                {moment(item.createdAt).format(
                                  "DD-MM-YYYY hh:mm A"
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  ) : (
                    <>
                      <h2>No data</h2>
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    {/* <th>
                    <strong>Total</strong>
                  </th> */}
                    {/* <th className="">{pageData?.total?.matchPl}</th>
                  <th className="text-green">{pageData?.total?.fancyStack}</th>
                  <th className="text-green">{pageData?.total?.bookMakerPl}</th>
                  <th className="text-green">{pageData?.total?.bookMakerStack}</th>
                  <th className="text-green">{pageData?.total?.fancyPl}</th>
                  <th className="text-green">{pageData?.total?.fancyStack}</th>
                  <th className="text-green">{pageData?.total?.premPl}</th>
                  <th className="text-green">{pageData?.total?.premStack}</th>
                  <th className="text-danger">{pageData?.total?.total}</th> */}
                  </tr>
                </tfoot>
              </table>
              {/* {pageListData?.report?.totalPages === 1 ||
              pageListData?.report?.totalPages === 0 ? (
                ""
              ) : (
                <NewPagination
                  handlePageClick={handlePageClick}
                  totalPages={pageListData?.report?.totalPages}
                />
              )} */}
              {/* <NewPagination /> */}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default DWDailyReport;
