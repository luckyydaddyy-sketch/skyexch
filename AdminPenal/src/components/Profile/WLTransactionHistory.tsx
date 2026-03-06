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

interface UserWlInterFace {
  transactionType: string;
  amount: number;
  isApprove: boolean;
  approvalBy: string;
  createdAt: string;
  _id: string;
}

const WLTransactionHistory = (props: any) => {
  let { userId } = props;

  let { userId: tempUserID } = useParams();
  useEffect(() => {
    if (tempUserID && tempUserID !== "") {
      userId = tempUserID;
    }

    return () => {};
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
    console.log("userData:: ", userData);

    if (userData) {
      getPageData();
    }
    return () => {};
  }, [userData]);

  const getPageData = async (
    FROM: string = "",
    TO: string = "",
    FILTER: any = { reportType: "", report: "" },
    PAGE: string = "1"
  ) => {
    let data: any = {
      api: ADMIN_API.ONLINE_PAYMENT.ADD_REQUEST.GET_TRANSACTIONS,
      value: {
        id: userId ? userId : userData._id,
        page: PAGE ? PAGE : "1",
        limit: "50",
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
  const handlePageClick = (e: any) => {
    getPageData(
      startDate.toString(),
      endDate.toString(),
      { reportType: filterForm.reportType, report: filterForm.report },
      (e.selected + 1).toString()
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
          debugger;
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

  const pageUserId = () => (userId ? userId : userData._id);

  return (
    <>
      <div className="account_tabs_r">
        <div className="mb-15">
          <strong style={{ fontSize: "16px" }}>Online Transaction History</strong>
        </div>

        <div className="table-responsive">
          <table
            id="resultTable"
            className="table01 margin-table account-statement"
          >
            <thead>
              <tr>
                <th className="light-grey-bg">Type</th>
                <th className="light-grey-bg">Amount</th>
                <th className="light-grey-bg">Status</th>
                <th className="light-grey-bg">Txn Date</th>
              </tr>
            </thead>
            <tbody id="tbdata">
              {pageData?.data && pageData?.data?.results?.length > 0 ? (
                pageData?.data?.results.map((item: UserWlInterFace, i: any) => {
                  return (
                    <>
                      <tr>
                        <td style={{ width: "150px" }}>
                          {item?.transactionType}
                        </td>
                        <td style={{ width: "110px" }} className="text-green">
                          {item?.amount}
                        </td>
                        <td
                          style={{ width: "150px" }}
                          className={`${
                            item?.approvalBy === null
                              ? "text-pending"
                              : item?.approvalBy && item?.isApprove
                              ? "text-green"
                              : "text-danger"
                          }`}
                        >
                          {item?.approvalBy === null
                            ? "pending"
                            : item?.approvalBy && item?.isApprove
                            ? "Success"
                            : "Fail"}
                        </td>
                        <td style={{ width: "110px" }}>
                          {moment(item.createdAt).format("MM/DD/YYYY HH:mm:ss")}{" "}
                        </td>
                      </tr>
                    </>
                  );
                })
              ) : (
                <h2>No Record</h2>
              )}
              <tr>
                {" "}
                <td colSpan={8}> </td>{" "}
              </tr>
            </tbody>
          </table>
          {/* {pageData.userStatement?.totalPages === 1 || pageData.userStatement?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData.userStatement?.totalPages} />} */}
          {pageData.data?.totalPages === 1 ||
          pageData.data?.totalPages === 0 ? (
            ""
          ) : (
            <NewPagination />
          )}
        </div>
      </div>
    </>
  );
};

export default WLTransactionHistory;
