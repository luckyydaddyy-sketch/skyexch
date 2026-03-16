import moment from "moment";
import React, { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import { postApi } from "../../service";
import Pagination from "../Pagination";
import SkyPopup from "../SkyPopup";
import NewPagination from "../new-pagination";

interface UserStatementInterFace {
  Remark: string;
  balance: number;
  createdAt: string;
  credit: number;
  debit: number;
  from: any;
  fromModel: string;
  to: any;
  toModel: string;
  type: string;
  updatedAt: string;
  userId: string;
  __v: number;
  _id: string;
}

const AccountStatement = (props: any) => {
  let { userId } = props;

  let { userId: tempUserID } = useParams();
  useEffect(() => {
    if (tempUserID && tempUserID !== "") {
      userId = tempUserID;
    }

    return () => { };
  }, []);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [betView, setBetView] = useState<any>();
  const [filterForm, setFilterForm] = useState({
    id: "",
    from: "",
    to: "",
    reportType: "",
    report: "up/down",
  });
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const userData = useSelector((e: any) => e.userData);
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const [OpenModal, setOpenModal] = useState<boolean>(false);
  useEffect(() => {
    if (userData) {
      getPageData();
    }
    return () => { };
  }, [userData]);

  const getPageData = async (
    FROM: string = "",
    TO: string = "",
    FILTER: any = { reportType: "", report: "" },
    PAGE: string = "1"
  ) => {
    let data: any = {
      api: ADMIN_API.MY_ACCOUNT.GET_STATEMENTS,
      value: {
        id: userId ? userId : userData._id,
        page: PAGE ? PAGE : "1",
        limit: "50",
      },
    };
    //reportType
    //report

    if (TO !== "") {
      data.value.to = TO;
    }
    if (FROM !== "") {
      data.value.from = FROM;
    }
    if (FILTER.reportType !== "") {
      data.value.type = FILTER.reportType;
    }

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
    // getPageData(
    //   startDate.toString(),
    //   endDate.toString(),
    //   { reportType: filterForm.reportType, report: filterForm.report },
    //   (e.selected + 1).toString()
    // );
    getPageData(
      "",
      "",
      { reportType: filterForm.reportType, report: filterForm.report },
      (e).toString()
    );
  };
  const filterSubmit = () => {
    getPageData(
      startDate.toString(),
      endDate.toString(),
      { reportType: filterForm.reportType, report: filterForm.report },
      "1"
    );
  };
  const remarkClick = async (item: any) => {
    if (item.matchId && !!item.openSportBetUserId) {
      console.log("click", item);
      let data: any = {
        api: ADMIN_API.REPORT.STATEMENT_BET_VIEW,
        value: {
          id: item?.openSportBetUserId,
          matchId: item.matchId,
          betType: item.betType,
        },
      };
      if (
        (item.betType === "session" || item.betType === "premium") &&
        item.selection !== ""
      ) {
        data.value.selection = item.selection;
      }
      await postApi(data)
        .then(function (response) {
          console.log(response);
          setBetView(response.data.data);
        })
        .catch((err) => {
          setBetView({});
          if (err.response.data.statusCode === 401) {
            Logout();
            navigate("/login");
          }
        });
      setOpenModal(true);
    } else {
      console.log("nothing");
    }
  };
  return (
    <>
      <div className="account_tabs_r">
        <h2 className="mb-10 mt-5 p-0">
          <strong>
            {" "}
            <span className="font-size-16">Account Statement</span>
          </strong>
        </h2>

        {/* <div className='account_tabs_filter d_flex'>
                    <div className="account_tabs_filter_item">
                        <label> From: </label>
                        <div className='input_group no-wrap'>
                            <div className='w_80'>
                                <ReactDatePicker selected={startDate} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />
                            </div>
                            <span className='input-group-text p-0 ps-3 pe-3'> 09:00 </span>
                        </div>
                    </div>

                    <div className="account_tabs_filter_item">
                        <label> To: </label>
                        <div className='input_group no-wrap'>
                            <div className='w_80'>
                                <ReactDatePicker selected={endDate} className='form-control hasDatepicker' onChange={(date: Date) => setEndDate(date)} />
                            </div>
                            <span className='input-group-text p-0 ps-3 pe-3'> 09:00 </span>
                        </div>
                    </div>

                    <div className="account_tabs_filter_item">
                        <label> Report Type:  </label>
                        <select name="report_type" id="report_type" className="form-control" onChange={(e) => {
                            setFilterForm({ ...filterForm, reportType: e.target.value })
                        }}>
                            <option value=""> All</option>
                            <option value="deposit"> Deposit/Withdraw Report</option>
                            <option value="game"> Game Report</option>
                        </select>
                    </div>

                    <div className="account_tabs_filter_item">
                        <label> &nbsp; </label>
                        <input type="button" value="Submit" name="acntbtn" className="submit-btn btn_black p-2" onClick={() => filterSubmit()} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, isHover)} />
                    </div>
                </div> */}

        <div className="table-responsive">
          <table
            id="resultTable"
            className="table01 margin-table account-statement"
          >
            <thead>
              <tr>
                <th className="light-grey-bg">Sr no</th>
                <th className="light-grey-bg">Date/Time</th>
                <th className="light-grey-bg">Credit</th>
                <th className="light-grey-bg">Debit</th>
                <th className="light-grey-bg">Balance</th>
                <th className="light-grey-bg">Remark</th>
                <th className="light-grey-bg">From/To</th>
              </tr>
            </thead>
            <tbody id="tbdata">
              {pageData.userStatement &&
                pageData.userStatement?.results?.length > 0 ? (
                pageData.userStatement.results.map(
                  (item: UserStatementInterFace, i: any) => {
                    return (
                      <>
                        <tr>
                          <td style={{ width: "110px" }}>{i + 1}</td>
                          <td style={{ width: "150px" }}>
                            {moment(item.createdAt).format(
                              "DD-MM-YYYY hh:mm A"
                            )}
                          </td>
                          <td style={{ width: "110px" }} className="text-green">
                            {item.credit}
                          </td>
                          <td
                            style={{ width: "110px" }}
                            className="text-danger"
                          >
                            {item.debit}
                          </td>
                          <td>{item.balance}</td>
                          <td>
                            <u
                              onClick={() => remarkClick(item)}
                              style={{ cursor: "pointer" }}
                            >
                              {item.Remark}
                            </u>
                          </td>
                          <td>
                            {item.from?.user_name}/{item.to?.user_name}
                          </td>
                        </tr>
                      </>
                    );
                  }
                )
              ) : (
                <h2>No Record</h2>
              )}
              <tr>
                {" "}
                <td colSpan={7}> </td>{" "}
              </tr>
            </tbody>
          </table>

          {/* {pageData.userStatement?.totalPages === 1 || pageData.userStatement?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData.userStatement?.totalPages} />} */}
          {pageData.userStatement?.totalPages === 1 || pageData.userStatement?.totalPages === 0 ? '' : <NewPagination handlePageClick={handlePageClick} totalPages={pageData.userStatement?.totalPages} />}
          {/* <NewPagination handlePageClick={handlePageClick} totalPages={pageData.userStatement?.totalPages}/> */}
        </div>

        <SkyPopup
          title={`Bet Report`}
          OpenModal={OpenModal}
          closeModel={() => setOpenModal(false)}
          closebtn={true}
        >
          <div>
            <table role="table" className="table b-table table-bordered">
              <tbody>
                <tr role="row" className="pink-bg">
                  <th className="text-left">No</th>
                  <th className="text-center">Nation</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Side</th>
                  <th className="text-left">Rate</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Win/Loss</th>
                  <th className="text-center">Place Date</th>
                </tr>
                {betView && betView.betInfo?.length > 0 ? (
                  <>
                    {betView.betInfo?.map((item: any, i: any) => {
                      return (
                        <tr className="cyan-bg">
                          <td>{i + 1}</td>
                          <td align="center"> {item.selection} </td>
                          <td align="center">{item.betType}</td>
                          <td align="center"> {item.betSide} </td>
                          <td> {item.oddsUp} </td>
                          <td>{item.stake}</td>
                          <td
                            className={
                              item.tType === "lost"
                                ? "text-color-red"
                                : "text-color-green"
                            }
                          >
                            {item.profit}
                          </td>
                          <td align="center">
                            {moment(item.createdAt).format(
                              "DD/MM/YYYY hh:mm A"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={6} align="right">
                        <strong>Total</strong>
                      </td>
                      <td
                        colSpan={2}
                        className={
                          betView?.total > 0
                            ? "text-color-green"
                            : "text-color-red"
                        }
                      >
                        {betView?.total}
                      </td>
                    </tr>
                  </>
                ) : (
                  <h3>No Data</h3>
                )}
              </tbody>
            </table>
          </div>
        </SkyPopup>
      </div>
    </>
  );
};

export default AccountStatement;
