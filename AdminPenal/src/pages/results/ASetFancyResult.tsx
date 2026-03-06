import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { notifyError, notifyMessage, postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import ConfirmationPopup from "../../components/confirmationPopup";

function ASetFancyResult() {
  const isEsoccer = process.env.REACT_APP_E_SOCCER;
  const isBasketBall = process.env.REACT_APP_BASKET_BALL;
  const navigate = useNavigate();
  const [sportName, setSportName] = useState<string>("");
  const [sportMatchName, setSportMatchName] = useState<any>({});
  const [sportMatchBetsName, setSportMatchBetsName] = useState<any>({});
  const [sportId, setSportId] = useState<string>("");
  const [winningDetail, setWinningDetail] = useState<any>({});
  const [open, setOpen] = useState<string>("");
  const [popUpText, setPopUpText] = useState<string>("");
  const [popUpTitle, setPopUpTitle] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");

  useEffect(() => {
    if (sportName !== "") getSiteData();
    else {
      setSportMatchName({});
    }
    return () => { };
  }, [sportName]);

  useEffect(() => {
    if (sportName !== "" && sportId !== "") getBetsListData();
    else {
      setSportMatchName({});
      setSportName("");
    }
    return () => { };
  }, [sportId]);

  const getSiteData = async () => {
    let data = {
      api: ADMIN_API.SETTING.MANAGE_FANCY.GET_LIST,
      value: {
        type: sportName,
        page: "1",
        limit: "100",
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("getSiteData :: ", response);
        // if (response.data.data) {
        console.log("response.data.data?.siteInfo :: ", response.data.data);
        setSportMatchName(response.data.data);
        // }
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const getBetsListData = async () => {
    let data = {
      api: ADMIN_API.SETTING.MANAGE_FANCY.LIST_OF_BET,
      value: {
        id: sportId,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log("getSiteData :: ", response);
        // if (response.data.data) {
        console.log("response.data.data?.siteInfo :: ", response.data.data);
        setSportMatchBetsName(response.data.data);
        // }
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const onTextChange = (e: any) => {
    const { name, value } = e.target;
    // winningDetail[name] = value
    setWinningDetail({ ...winningDetail, [name]: value });
  };

  const clickSet = (item: string, id: string) => {
    console.log("click Set :: ", item, id, winningDetail[item]);
    if (winningDetail[item]) {
    } else {
      console.log("text box is emt");
    }
  };

  const declareResultClick = async (
    e: any,
    item: string,
    id: string,
    cancle: string
  ) => {
    e.preventDefault();
    setOpen("");
    if (
      (typeof winningDetail[item] === "undefined" ||
        (typeof winningDetail[item] !== "undefined" &&
          winningDetail[item] === "")) &&
      cancle !== "cancle"
    ) {
      notifyError("please enter Result");
      return;
    }
    let data: any = {
      api: ADMIN_API.SETTING.MANAGE_FANCY.DECLARE_WINNER,
      value: {
        id: id,
        selection: item,
        winner: cancle === "cancle" ? -2 : parseInt(winningDetail[item]),
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log(response);
        getBetsListData();
        notifyMessage("success");
        setTimeout(()=>{
          window.location.reload()
        },500)
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const setOpenTab = (tabName: string, item: string, cancle: string) => {
    let titleText = "";
    if (tabName === "setResult") {
      if (
        (typeof winningDetail[item] === "undefined" ||
          (typeof winningDetail[item] !== "undefined" &&
            winningDetail[item] === "")) &&
        cancle !== "cancle"
      ) {
        notifyError("please enter Result");
        return;
      }
      titleText = `Set Winner Of - ${sportMatchBetsName?.sportInfo?.name} - ${item} to - ${winningDetail[item]}`;
    } else if (tabName === "setResultCancel") {
      titleText = `Set Suspend Of - ${sportMatchBetsName?.sportInfo?.name} - ${item}`;
    }
    setPopUpTitle(`${titleText}.`);
    setPopUpText(`Are you sure you want to ${titleText} ?`);
    setOpen(tabName);
    setItemName(item);
  };
  return (
    <React.Fragment>
      <div className="container settings full-wrap" >
        <div className="top_header">
          <div className="top_header_title mt-3 d_flex d_flex_justify_spacebt">
            <h5>Set Fancy Result</h5>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <label>Select Sport:</label>
            <select
              style={{ height: "32px", margin: "0 10px", width: "120px" }}
              name="cars"
              id="cars"
              value={sportName}
              onChange={(e) => {
                setSportName(e.target.value);
              }}
            >
              <option value="">Select Sport</option>
              <option value="cricket">Cricket</option>
              <option value="soccer">Soccer</option>
              <option value="tennis">Tennis</option>
              {isEsoccer === "true" && (
                <option value="esoccer">E-soccer</option>
              )}
              {isBasketBall === "true" && (
                <option value="basketball">Basket Ball</option>
              )}
            </select>
            <label>Select Match:</label>
            <select
              style={{ height: "32px", margin: "0 10px", width: "120px" }}
              name="cars"
              id="cars"
              value={sportId}
              onChange={(e) => {
                setSportId(e.target.value);
              }}
            >
              <option value="">Select Match</option>
              {sportMatchName &&
                sportMatchName?.results &&
                sportMatchName?.results?.length &&
                sportMatchName?.results?.map((item: any) => {
                  return <option value={item?._id}>{item?.name}</option>;
                })}
            </select>
          </div>
        </div>
        <table className="table01 margin-table">
          <thead>
            <tr className="light-grey-bg">
              <th> Sport </th>
              <th> Fancy ID </th>
              <th> Fancy Name </th>
              <th> Match Name </th>
            </tr>
          </thead>
          <tbody id="matches-table">
            {sportMatchBetsName &&
              sportMatchBetsName?.betUnique?.length &&
              sportMatchBetsName?.betUnique?.map((item: any) => {
                return (
                  <>
                    <tr>
                      <td>{sportMatchBetsName?.sportInfo?.type}</td>
                      <td>-</td>
                      <td>{item}</td>
                      <td>{sportMatchBetsName?.sportInfo?.name}</td>
                    </tr>
                    <tr>
                      <td style={{ width: "20%" }}>
                        <input
                          style={{ padding: "3px 5px" }}
                          type="number"
                          name={item}
                          value={winningDetail[item] || ""}
                          placeholder="Enter Result"
                          onChange={(e) => onTextChange(e)}
                        />
                      </td>
                      <td style={{ width: "20%" }}>
                        <div className="search-btn">
                          <button
                            style={{
                              width: "80px",
                              height: "25px",
                              fontSize: "11px",
                            }}
                            onClick={() => setOpenTab("setResult", item, "")}
                          >
                            Set
                          </button>
                        </div>
                      </td>
                      <td style={{ width: "20%" }}>
                        <div className="search-btn">
                          <button
                            style={{
                              width: "80px",
                              height: "25px",
                              fontSize: "11px",
                              background: "#dc143c",
                              color: "#FFF",
                            }}
                            onClick={() =>
                              setOpenTab("setResultCancel", item, "cancle")
                            }
                          >
                            Suspended
                          </button>
                        </div>
                      </td>
                      <td style={{ width: "20%" }}></td>
                    </tr>
                  </>
                );
              })}
            {/* <tr>
                        <td>Cricket</td>
                        <td>1.223718205</td>
                        <td>Winner</td>
                        <td>Bangladesh Premier League</td>
                    </tr>
                    <tr>
                        <td style={{ width: "20%" }}><input style={{ padding: "3px 5px" }} type="text" name="min" placeholder="Enter Result" /></td>
                        <td style={{ width: "20%" }}>
                            <div className="search-btn">
                                <button style={{ width: "80px", height: "25px", fontSize: "11px" }}>Set</button>
                            </div>
                        </td>
                        <td style={{ width: "20%" }}>
                            <div className="search-btn">
                                <button style={{ width: "80px", height: "25px", fontSize: "11px", background: "#dc143c", color: "#FFF" }}>Suspended</button>
                            </div>
                        </td>
                        <td style={{ width: "20%" }}>
                        </td>
                    </tr>
                    <tr>
                        <td>Cricket</td>
                        <td>1.223718205</td>
                        <td>Winner</td>
                        <td>Bangladesh Premier League</td>
                    </tr>
                    <tr>
                        <td style={{ width: "20%" }}><input style={{ padding: "3px 5px" }} type="text" name="min" placeholder="Enter Result" /></td>
                        <td style={{ width: "20%" }}>
                            <div className="search-btn">
                                <button style={{ width: "80px", height: "25px", fontSize: "11px" }}>Set</button>
                            </div>
                        </td>
                        <td style={{ width: "20%" }}>
                            <div className="search-btn">
                                <button style={{ width: "80px", height: "25px", fontSize: "11px", background: "#dc143c", color: "#FFF" }}>Suspended</button>
                            </div>
                        </td>
                        <td style={{ width: "20%" }}>
                        </td>
                    </tr> */}
          </tbody>
        </table>
      </div>
      {open !== "" && (
        <ConfirmationPopup
          title={popUpTitle}
          description={popUpText}
          OpenModal={open !== ""}
          closeModel={() => setOpen("")}
          submit={(e: any) =>
            declareResultClick(
              e,
              itemName,
              sportMatchBetsName?.sportInfo?._id,
              open === "setResultCancel" ? "cancle" : ""
            )
          }
        />
      )}
      {/* {open === "setResultCancel" && <ConfirmationPopup
          title={`Suspend - Multan Sultans v Karachi Kings (33011518)`}
          description={`Are you sure you want to Inactive Multan Sultans v Karachi Kings (33011518) ?`}
          OpenModal={open === "setResultCancel"}
          closeModel={() => setOpen("")}
        />} */}
    </React.Fragment>
  );
}
export default ASetFancyResult;
