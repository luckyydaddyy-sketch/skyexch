import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ADMIN_API } from "../../common/common";
import { postApi } from "../../service";
import { Logout } from "../../common/Funcation";

function AbetLockUsers() {
  const DD = useSelector((e: any) => e.domainDetails);
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const [betData, setBetData] = useState<any>({});
  const [userID, setUserID] = useState<string>("");
  const HeaderData = useSelector((e: any) => e.Header);
  const [headerOptions, setHeaderOptions] = useState(HeaderData);
  useEffect(() => {
    getPageData();
    return () => { };
  }, []);
  useEffect(() => {
    setHeaderOptions(HeaderData);
    return () => { };
  }, [HeaderData]);

  useEffect(() => {
    if (userID !== "") getUserBetsData(userID);
    return () => { };
  }, [userID]);

  const getCollomActive = (userRole: string) => {
    if (
      headerOptions?.name === "O" &&
      (userRole === "SUO" ||
        userRole === "WL" ||
        userRole === "SA" ||
        userRole === "A" ||
        userRole === "SUA" ||
        userRole === "SS" ||
        userRole === "S" ||
        userRole === "M")
    ) {
      return true;
    } else if (
      headerOptions?.name === "SUO" &&
      (userRole === "WL" ||
        userRole === "SA" ||
        userRole === "A" ||
        userRole === "SUA" ||
        userRole === "SS" ||
        userRole === "S" ||
        userRole === "M")
    ) {
      return true;
    } else if (
      headerOptions?.name === "WL" &&
      (userRole === "SA" ||
        userRole === "A" ||
        userRole === "SUA" ||
        userRole === "SS" ||
        userRole === "S" ||
        userRole === "M")
    ) {
      return true;
    } else if (
      headerOptions?.name === "SA" &&
      (userRole === "A" ||
        userRole === "SUA" ||
        userRole === "SS" ||
        userRole === "S" ||
        userRole === "M")
    ) {
      return true;
    } else if (
      headerOptions?.name === "A" &&
      (userRole === "SUA" ||
        userRole === "SS" ||
        userRole === "S" ||
        userRole === "M")
    ) {
      return true;
    } else if (
      headerOptions?.name === "SUA" &&
      (userRole === "SS" || userRole === "S" || userRole === "M")
    ) {
      return true;
    } else if (
      headerOptions?.name === "SS" &&
      (userRole === "S" || userRole === "M")
    ) {
      return true;
    } else if (headerOptions?.name === "S" && userRole === "M") {
      return true;
    }
    return false;
  };

  const getPageData = async () => {
    let data: any = {
      api: ADMIN_API.SETTING.USERS.GET_USER_LIST_BY_DOWNLINE,
      value: {
        isBlock: true,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("GET_USER_LIST_BY_DOWNLINE", response);
        setPageData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const getUserBetsData = async (id: string) => {
    let data: any = {
      api: ADMIN_API.PLAYER_BET_LIST,
      value: {
        id,
        bet: "history",
        betType: "exchange",
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("getUserBetsData", response);
        setBetData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const betHistory = (id: string) => {
    setUserID(id);
  };
  const backTo = () => {
    setUserID("");
  };

  return (
    <>
      <div className="container full-wrap">
        <div className="top_header">
          <div className="top_header_title mt-3">
            <h5>Bet Lock</h5>
          </div>

          {userID && (
            <div className="search-btn">
              <button
                style={{
                  // ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "80px",
                  height: "35px",
                }}
                onClick={backTo}
              >
                Back
              </button>
            </div>
          )}
        </div>
        <div className="my-account-section-content">
          <div className="my-account-section-content-table">
            {userID === "" && (
              <table id="resultTable" className="table01 margin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Reason</th>
                    {getCollomActive("SUO") && <th>OWNER</th>}
                    {getCollomActive("WL") && <th>WHITELEBEL</th>}
                    {getCollomActive("SA") && <th>Super Admin</th>}
                    {getCollomActive("A") && <th>Admin</th>}
                    {getCollomActive("SUA") && <th>Sub Admin</th>}
                    {getCollomActive("SS") && <th>Senior Super</th>}
                    {getCollomActive("S") && <th>Super</th>}
                    {getCollomActive("M") && <th>Master</th>}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData && pageData?.userList?.length > 0 ? (
                    pageData?.userList.map((item: any, i: any) => {
                      return (
                        <tr>
                          <td>
                            {item?.user_name}({item?.firstName})
                          </td>
                          <td>{item?.status}</td>
                          {/* newValue?.agent_level !== "O" */}
                          {item?.whoAdd
                            ?.filter((newValue: any) =>
                              getCollomActive(newValue?.agent_level)
                            )
                            .map((value: any) => {
                              return (
                                <>
                                  <td>
                                    {value?.user_name}({value?.firstName})
                                  </td>
                                </>
                              );
                            })}
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
                                  ...styleObjectBlackButton(
                                    DD?.colorSchema,
                                    true
                                  ),
                                  width: "125px",
                                }}
                              >
                                Activate
                              </button>
                            </div>
                            <div className="search-btn">
                              <button
                                style={{
                                  ...styleObjectBlackButton(
                                    DD?.colorSchema,
                                    true
                                  ),
                                  width: "125px",
                                }}
                                onClick={(e) => betHistory(item?._id)}
                              >
                                Show Bets
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <h2>No data</h2>
                    </>
                  )}
                </tbody>
              </table>
            )}

            {userID && (
              <table id="resultTable" className="table01 margin-table">
                <thead>
                  <tr key="userList">
                    <th>Member</th>
                    <th>Match</th>
                    <th>Market</th>
                    <th>Selection</th>
                    <th>Back/Lay</th>
                    <th>Odds</th>
                    <th>Stake</th>
                    <th>Pnl</th>
                    <th>Date</th>
                    <th>PlaceTime</th>
                    <th>MatchedTime</th>
                  </tr>
                </thead>
                <tbody>
                  {betData &&
                    betData?.length > 0 &&
                    betData?.map((item: any, i: any) => {
                      return (
                        <tr key="betList">
                          <td>{item?.userId?.user_name}</td>
                          <td>{item?.name}</td>
                          <td>Match {item?.betType}</td>
                          <td>{item?.selection}</td>
                          <td>{item?.betSide}</td>
                          <td>{item?.oddsUp}</td>
                          <td>{item?.stake}</td>
                          <td>{item?.profit}</td>
                          <td>{item?.createdAt}</td>
                          <td>{item?.createdAt}</td>
                          <td>{item?.createdAt}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AbetLockUsers;
