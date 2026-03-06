import { useEffect, useState } from "react";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import NewPagination from "../../components/new-pagination";
import { styleObjectGetBG } from "../../common/StyleSeter";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { notifyMessage, postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import ConfirmationPopup from "../../components/confirmationPopup";
import PreViewImagePopup from "../../components/PreViewImagePopup";
import Loader from "../../components/Loader";

function Atransactionlist() {
  const DD = useSelector((e: any) => e.domainDetails);
  const HeaderData = useSelector((e: any) => e.Header);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 3))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [showType, setShowType] = useState("pending"); // approve, pending, rejected
  const [pageData, setPageData] = useState<any>({});
  const [activePage, setActivePage] = useState("1");
  const [isLoader, setIsLoader] = useState(false);

  const [open, setOpen] = useState<string>("");
  const [openImage, setOpenImage] = useState<string>("");
  const [popUpText, setPopUpText] = useState<string>(
    "Are you sure you want to Reject this Request."
  );
  const [popUpTitle, setPopUpTitle] = useState<string>("Aleart");
  const [isItem, setItem] = useState<any>({});

  useEffect(() => {
    getPageData(showType, activePage);
    return () => {};
  }, []);
  const getPageData = async (TYPE: string, PAGE: string, e: any = null) => {
    if (e) e.preventDefault();
    let data: any = {
      api: ADMIN_API.ONLINE_PAYMENT.DEPOSIT.GET_LIST,
      value: {
        page: PAGE ? PAGE : activePage,
        limit: "50",
        status: TYPE,
        from: startDate,
        to: endDate,
      },
    };

    setIsLoader(true);
    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
        setIsLoader(false);
      })
      .catch((err) => {
        setIsLoader(false);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const handlePageClick = (e: any) => {
    console.log("page clicked", e);
    setActivePage((e.selected + 1).toString());
    getPageData(showType, (e.selected + 1).toString());
  };
  const handlePopUp = async (item: any, isApprove: boolean) => {
    setOpen("open");
    if (isApprove) {
      setPopUpText("Are you sure you want to Approve this Request.");
    } else {
      setPopUpText("Are you sure you want to Reject this Request.");
    }
    setItem({ item, isApprove });
  };
  const handleStatusChange = async (e: any, item: any, isApprove: boolean) => {
    setOpen("");
    e.preventDefault();
    let data: any = {
      api: ADMIN_API.ONLINE_PAYMENT.DEPOSIT.APPROVE_DEPOSIT,
      // HeaderData?.name === "M"
      //   ? ADMIN_API.ONLINE_PAYMENT.DEPOSIT.APPROVE_DEPOSIT
      //   : ADMIN_API.ONLINE_PAYMENT.DEPOSIT.APPROVE_DEPOSIT_ADMIN,
      value: {
        id: item._id,
        isApprove: isApprove,
      },
    };
    setIsLoader(true);
    await postApi(data)
      .then(function (response) {
        console.log(response);
        notifyMessage("Update");
        getPageData(showType, activePage, e);
        setIsLoader(false);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
        setIsLoader(false);
      });
  };
  const userClick = (e: any) => {
    const { value } = e.target;
    setShowType(value);
    // if (USER.agent_level && USER.agent_level !== "PL") {
    getPageData(value, activePage);
    // }
  };
  return (
    <>
      {isLoader && <Loader />}
      <div className="container full-wrap">
        <div className="top_header">
          <div className="top_header_title  mt-3">
            <h5>DEPOSIT REQUEST</h5>
          </div>
        </div>

        <section className="my-account-section">
          <div
            className="my-account-section_header"
            style={{
              padding: "10px",
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              background: "#E0E6E6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "28px",
                marginRight: "10px",
              }}
            >
              <select
                name="timezone"
                id="timezone"
                onChange={(e) => userClick(e)}
                value={showType}
              >
                <option value="">Select Status</option>
                <option value="all">All</option>
                <option value="approve">Approve</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <label style={{ flexShrink: 0, paddingRight: "5px" }}>
                {" "}
                Period:{" "}
              </label>
              <ReactDatePicker
                selected={startDate}
                className="form-control hasDatepicker"
                onChange={(date: Date) => setStartDate(date)}
              />
            </div>
            <div
              style={{ display: "flex", alignItems: "center", height: "28px" }}
            >
              <label style={{ flexShrink: 0, paddingRight: "5px" }}>
                {" "}
                to :{" "}
              </label>
              <ReactDatePicker
                selected={endDate}
                className="form-control hasDatepicker"
                onChange={(date: Date) => setEndDate(date)}
              />
            </div>
            <div className="search-btn">
              <button
                style={{
                  ...styleObjectGetBG(DD?.colorSchema, true),
                  width: "100px",
                  height: "25px",
                }}
                onClick={() => getPageData(showType, activePage)}
              >
                Get P & L
              </button>
            </div>
          </div>
          <table className="table01 margin-table">
            <thead>
              <tr className="black-bg">
                <th> Date </th>
                <th> User ID </th>
                {/* <th> Website	</th> */}
                <th> Transaction ID </th>
                <th> Amount </th>
                <th> Bank Account</th>
                <th> Bank Name</th>
                <th> Account Name</th>
                <th> Image </th>
                <th> Status </th>
                <th> Action</th>
              </tr>
            </thead>
            <tbody id="matches-table">
              {pageData && pageData?.results?.length > 0 ? (
                pageData?.results?.map((item: any, i: any) => {
                  return (
                    <>
                      <tr>
                        <td>
                          {moment(item.createdAt).format("DD/MM/YYYY hh:mm A")}
                        </td>
                        <td>{item.userName || "-"}</td>
                        {/* <td>winx365.live</td> */}
                        <td>{item.transactionId || "-"}</td>
                        <td>{item.amount || "-"}</td>
                        <td>{item?.bankId?.accountNo || "-"}</td>
                        <td>{item?.bankId?.name || "-"}</td>
                        <td>{item?.bankId?.holderName || "-"}</td>
                        <td>
                          <img
                            src={`${process.env.REACT_APP_BASE_POINT}${item.image}`}
                            alt="Dimage"
                            onClick={() =>
                              setOpenImage(
                                `${process.env.REACT_APP_BASE_POINT}${item.image}`
                              )
                            }
                          ></img>
                        </td>
                        <td>
                          {item.approvalBy === null && item.isApprove === false
                            ? "Panging"
                            : item.approvalBy !== null &&
                              item.isApprove === false
                            ? "Reject"
                            : "Approve"}
                        </td>
                        {/* {item.approvalBy === null &&
                        item.isApprove === false ? ( */}
                        <td className="flex-align">
                          {((item.approvalBy === null &&
                            item.isApprove === false) ||
                            (item.approvalBy !== null &&
                              item.isApprove === false)) && (
                            <div className="search-btn">
                              <button
                                style={{
                                  width: "100px",
                                  height: "25px",
                                  color: "white",
                                  background: "green",
                                }}
                                onClick={() => handlePopUp(item, true)}
                              >
                                Approve
                              </button>
                            </div>
                          )}
                          {item.approvalBy === null &&
                            item.isApprove === false && (
                              <div className="search-btn">
                                <button
                                  style={{
                                    width: "100px",
                                    height: "25px",
                                    color: "white",
                                    background: "red",
                                  }}
                                  onClick={() => handlePopUp(item, false)}
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                        </td>
                        {/* ) : (
                          <td>-</td>
                        )} */}
                      </tr>
                    </>
                  );
                })
              ) : (
                <>
                  <h2>No Record Found</h2>
                </>
              )}
              {/* <tr>
                                <td>2024-01-23 13:49:47</td>
                                <td>anam555(T)</td>
                                <td>winx365.live</td>
                                <td>WithDrawl</td>
                                <td>50</td>
                                <td>PENDING</td>
                                <td className="flex-align">
                                    <div className="search-btn"><button style={{ width: "100px", height: "25px", color: "white", background: "green" }}>Approve</button></div>
                                    <div className="search-btn"><button style={{ width: "100px", height: "25px", color: "white", background: "red" }}>Decline</button></div>
                                </td>
                            </tr> */}
            </tbody>
          </table>
          <NewPagination />
        </section>
      </div>
      {open !== "" && (
        <ConfirmationPopup
          title={popUpTitle}
          description={popUpText}
          OpenModal={open !== ""}
          closeModel={() => setOpen("")}
          submit={(e: any) =>
            handleStatusChange(e, isItem.item, isItem.isApprove)
          }
        />
      )}
      {openImage !== "" && (
        <PreViewImagePopup
          title={"Image"}
          img={openImage}
          OpenModal={openImage !== ""}
          closeModel={() => setOpenImage("")}
          // submit={(e: any) => handleStatusChange(isItem.item, isItem.isApprove)}
        />
      )}
    </>
  );
}

export default Atransactionlist;
