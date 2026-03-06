import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import SearchInput from "../../components/SearchInput";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ADMIN_API } from "../../common/common";
import { notifyError, notifyMessage, postApi } from "../../service";
import { Logout } from "../../common/Funcation";

function Asearchusers() {
  const DD = useSelector((e: any) => e.domainDetails);
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  const [userID, setUserID] = useState<string>("");
  const HeaderData = useSelector((e: any) => e.Header);
  const [headerOptions, setHeaderOptions] = useState(HeaderData);
  //   useEffect(() => {
  //     getPageData();
  //     return () => {};
  //   }, []);
  useEffect(() => {
    setHeaderOptions(HeaderData);
    return () => { };
  }, [HeaderData]);

  useEffect(() => {
    if (pageData && pageData?.userList?.length) {
      setUserID(pageData?.userList[0]?._id)
    } else {
      setUserID("")
    }
    return () => { };
  }, [pageData]);

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

  const getPageData = async (search: string) => {
    let data: any = {
      api: ADMIN_API.SETTING.USERS.GET_USER_LIST_BY_DOWNLINE,
      value: {
        search
      }
    };

    await postApi(data)
      .then(function (response) {
        console.log("GET_USER_LIST_BY_DOWNLINE", response);
        setPageData(response.data.data);
      })
      .catch((err) => {
        // notifyMessage(response.data.message)
        notifyError(err.response.data.message)
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const handleSubmit = (search: any) => {
    getPageData(search)
  }

  const openStatement = () => {
    if (userID && userID !== "")
      navigate(`/user/transaction-history/player/${userID}`);
  }

  const submitStatusPopup = async (e: any, status: string) => {
    e.preventDefault();
      let data = {
        api: ADMIN_API.PLAYER_BLOCK,
        value: {
          id: userID,
          status: status,
        },
      };
      await postApi(data)
        .then(function (response) {
          notifyMessage(response.data.message);  
        })
        .catch((err) => {
          console.log("eeee", err);
          notifyError(err.response.data.message);
        });
    
  };
  return (
    <div className="container settings full-wrap">
      <div className="top_header">
        <div className="top_header_title mt-3 d_flex d_flex_justify_spacebt">
          <h5>Search Users</h5>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <SearchInput
            outsideBtn
            placeholder="Enter UserId..."
            style={{ display: "inline-block" }}
            searchSubmit={handleSubmit}
          />
          <div className="search-btn">
            <button
              style={{
                ...styleObjectBlackButton(DD?.colorSchema, true),
                width: "78px",
              }}

              onClick={openStatement}
            >
              Statement
            </button>
          </div>
          {userID && <>
            <div className="search-btn" onClick={(e)=> submitStatusPopup(e, 'locked')}>
              <button
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "120px",
                }}
              >
                Block For Cheat
              </button>
            </div>
            <div className="search-btn" onClick={(e)=> submitStatusPopup(e, 'active')}>
              <button
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "120px",
                }}
              >
                UnBlock For Cheat
              </button>
            </div>
            <div className="search-btn">
              <button
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "120px",
                }}
              >
                Is Placing UPDT
              </button>
            </div>
          </>}
        </div>
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            {getCollomActive("SUO") && <th>OWNER</th>}
            {getCollomActive("WL") && <th>WHITELEBEL</th>}
            {getCollomActive("SA") && <th>Super Admin</th>}
            {getCollomActive("A") && <th>Admin</th>}
            {getCollomActive("SUA") && <th>Sub Admin</th>}
            {getCollomActive("SS") && <th>Senior Super</th>}
            {getCollomActive("S") && <th>Super</th>}
            {getCollomActive("M") && <th>Master</th>}
            <th>User</th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {pageData && pageData?.userList?.length > 0 ? (
            pageData?.userList.map((item: any, i: any) => {
              return (
                <tr>
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
                  <td>
                    {item?.user_name}({item?.firstName})
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
    </div>
  );
}

export default Asearchusers;
