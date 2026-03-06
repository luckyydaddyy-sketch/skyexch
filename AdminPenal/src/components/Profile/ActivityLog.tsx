import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import { postApi } from "../../service";
import Pagination from "../Pagination";
interface UserStatementInterFace {
  action: string;
  browser_detail: string;
  createdAt: string;
  data: string;
  ip_address: string;
  systemDetail: string;
  updatedAt: string;
  ISP: string;
  city: string;
  state: string;
  country: string;
  userId: string;
  __v: number;
  _id: string;
}

const ActivityLog = (props: any) => {
  let { userId } = props;

  let { userId: tempUserID } = useParams();
  useEffect(() => {
    if (tempUserID && tempUserID !== "") {
      userId = tempUserID;
    }

    return () => {};
  }, []);

  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const userData = useSelector((e: any) => e.userData);

  useEffect(() => {
    if (userData) {
      getPageData("1");
    }

    return () => {};
  }, [userData]);

  const getPageData = async (PAGE: string) => {
    let data = {
      api: ADMIN_API.MY_ACCOUNT.GET_ACTIVITIES,
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
    console.log("page clicked", e);
    getPageData((e.selected + 1).toString());
  };
  return (
    <>
      <div className="account_tabs_r">
        <div className="mb-15">
          <strong style={{ fontSize: "16px" }}>Activity Log</strong>
        </div>
        <div className="table-responsive">
          <table id="resultTable" className="table01 margin-table">
            <thead>
              <tr>
                <th className="light-grey-bg">Login Date & Time</th>
                <th className="light-grey-bg">Login Status</th>
                <th className="light-grey-bg">IP Address</th>
                <th className="light-grey-bg">ISP</th>
                <th className="light-grey-bg">City/State/Country</th>
                <th className="light-grey-bg">Browser</th>
                <th className="light-grey-bg">User Agent Type</th>
              </tr>
            </thead>
            <tbody>
              {pageData.userActivitie &&
              pageData.userActivitie?.results?.length > 0 ? (
                pageData.userActivitie?.results.map(
                  (item: UserStatementInterFace, i: any) => {
                    return (
                      <>
                        <tr key={item._id}>
                          <td>
                            {moment(item.createdAt).format(
                              "DD-MM-YYYY hh:mm A"
                            )}
                          </td>
                          <td>{item.action}</td>
                          <td>{item.ip_address}</td>
                          <td>{item?.ISP}</td>
                          <td>
                            {item?.city}-{item?.state}-{item?.country}
                          </td>
                          <td>{item.browser_detail}</td>
                          <td>{item.systemDetail}</td>
                        </tr>
                      </>
                    );
                  }
                )
              ) : (
                <h2>No Record</h2>
              )}
            </tbody>
          </table>
        </div>
        {pageData.userActivitie?.totalPages === 1 ||
        pageData.userActivitie?.totalPages === 0 ? (
          ""
        ) : (
          <Pagination
            handlePageClick={handlePageClick}
            totalPages={pageData.userActivitie?.totalPages}
          />
        )}
      </div>
    </>
  );
};

export default ActivityLog;
