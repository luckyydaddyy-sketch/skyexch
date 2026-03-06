import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import SearchInput from "../../components/SearchInput";
import { ADMIN_API } from "../../common/common";
import { notifyError, notifyMessage, postApi, getApi } from "../../service";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Logout } from "../../common/Funcation";

function DeafultContactSetting() {
  const navigate = useNavigate();
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const [formData, setFormData] = useState({
    bonus: 0,
    deposit_min: 0,
    deposit_max: 0,
    withdrow_min: 0,
    withdrow_max: 0,
    email: "",
    whatsapp: "",
    facebook: "",
  });
 
  useEffect(() => {
    getContactData();
    return () => {};
  }, []);
  const getContactData = async () => {
    let data = {
      api: ADMIN_API.SETTING.CONTACT_DETAILS.GET,
    };

    await getApi(data)
      .then(function (response) {
        console.log("getSiteData :: ", response);
        if (response.data.data) {
          console.log("response.data.data :: ", response.data.data);
          setFormData(response.data.data);
        }
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    if (type === "radio") {
      setFormData({
        ...formData,
        [name]: JSON.parse(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmitClick = async (e: any) => {
    let data = {
      api: ADMIN_API.SETTING.CONTACT_DETAILS.UPDATE,
      value: {
        ...formData,
      },
    };
    // e.preventDefault()
    await postApi(data)
      .then(function (response) {
        notifyMessage(response.data.message);
      })
      .catch((err) => {
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  return (
    <div className="container main_wrap">
      <div className="admin-setting">
        <h4
          style={{
            background: "#000",
            fontSize: "16px",
            color: "white",
            padding: "10px",
          }}
        >
          SETTINGS
        </h4>
        <div className="edit_body">
          <div className="card">
            <div className="card_body">
              <div className="card mb-15">
                <div className="card_body">
                  <div className="row">
                    <div className="card_body_h_item">
                      <label htmlFor="bonus">bonus:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="bonus"
                        type="number"
                        value={formData.bonus}
                        id="bonus"
                      ></input>
                    </div>
                    <div className="card_body_h_item">
                      <label htmlFor="deposit_min">minimum Deposit:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="deposit_min"
                        type="number"
                        value={formData.deposit_min}
                        id="deposit_min"
                      ></input>
                    </div>
                    <div className="card_body_h_item">
                      <label htmlFor="deposit_max">maximum Deposit:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="deposit_max"
                        type="number"
                        value={formData.deposit_max}
                        id="deposit_max"
                      ></input>
                    </div>
                    <div className="card_body_h_item">
                      <label htmlFor="withdrow_min">minimum Withdrow:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="withdrow_min"
                        type="number"
                        value={formData.withdrow_min}
                        id="withdrow_min"
                      ></input>
                    </div>
                    <div className="card_body_h_item">
                      <label htmlFor="withdrow_max">maximum Withdrow:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="withdrow_max"
                        type="number"
                        value={formData.withdrow_max}
                        id="withdrow_max"
                      ></input>
                    </div>
                    <div className="card_body_h_item">
                      <label htmlFor="email">Email:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="email"
                        type="text"
                        value={formData.email}
                        id="email"
                      ></input>
                    </div>
                    <div className="card_body_h_item">
                      <label htmlFor="whatsapp">Whatsapp:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="whatsapp"
                        type="text"
                        value={formData.whatsapp}
                        id="whatsapp"
                      ></input>
                    </div>
                    <div className="card_body_h_item">
                      <label htmlFor="facebook">Facebook:</label>
                      <input
                        onChange={(e) => handleInputChange(e)}
                        className="form-control"
                        name="facebook"
                        type="text"
                        value={formData.facebook}
                        id="facebook"
                      ></input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card_footer" style={{marginLeft:"15px", marginBottom:"15px"}}>
            <input
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={styleObjectBlackButton(DD?.colorSchema, isHover)}
              className="btn_black"
              type="submit"
              value="Save"
              onClick={(e) => handleSubmitClick(e)}
            />
          </div>
          </div>
        </div>

        {/* <div
          className="admin-setting-inner"
          style={{ background: "lightblue" }}
        >
          <div
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            <div className="form-check flex-align card_body_h_item">
            <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
                htmlFor="rolling_delay"
              >
                {siteData?.setAutoSportsResult?.cricket ? "ON" : "OFF"}{" "}
                (Cricket)
              </label>
              <input
                value={siteData?.setAutoSportsResult?.cricket}
                name="cricket"
                type="text"
                onChange={(e) => changeAutoAddSportResultfiled(e)}
              />
              
            </div>
            <div className="form-check flex-align w-20">
              <input
                value={siteData?.setAutoSportsResult?.tennis}
                name="tennis"
                type="checkbox"
                onChange={(e) => changeAutoAddSportResultfiled(e)}
              />
              <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
                htmlFor="rolling_delay"
              >
                {siteData?.setAutoSportsResult?.tennis ? "ON" : "OFF"} (Tennis)
              </label>
            </div>
            <div className="form-check flex-align w-20">
              <input
                value={siteData?.setAutoSportsResult?.soccer}
                name="soccer"
                type="checkbox"
                onChange={(e) => changeAutoAddSportResultfiled(e)}
              />
              <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
                htmlFor="rolling_delay"
              >
                {siteData?.setAutoSportsResult?.soccer ? "ON" : "OFF"} (Soccer)
              </label>
            </div>
            <div className="search-btn mb-10">
              <p style={{ marginLeft: "10px" }}>Action</p>
              <button
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "100px",
                  height: "25px",
                }}
                onClick={(e) => updateSiteData(e)}
              >
                Update
              </button>
            </div>
          </div>
        </div> */}
        {/* <div className="admin-setting-inner">
          <h4 className="mb-10">Set Auto Add Sports</h4>
          <div
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            <div className="form-check flex-align w-20">
              <input
                type="checkbox"
                name="cricket"
                value={siteData?.setAutoSportsAdd?.cricket}
                onChange={(e) => changeAutoAddSportfiled(e)}
              />
              <label className="form-check-label" style={{ marginLeft: "5px" }}>
                {siteData?.setAutoSportsAdd?.soccer ? "ON" : "OFF"} (Cricket)
              </label>
            </div>
            <div className="form-check flex-align w-20">
              <input
                value={siteData?.setAutoSportsAdd?.tennis}
                name="tennis"
                type="checkbox"
                onChange={(e) => changeAutoAddSportfiled(e)}
              />
              <label className="form-check-label" style={{ marginLeft: "5px" }}>
                {siteData?.setAutoSportsAdd?.soccer ? "ON" : "OFF"} (Tennis)
              </label>
            </div>
            <div className="form-check flex-align w-20">
              <input
                value={siteData?.setAutoSportsAdd?.soccer}
                name="soccer"
                type="checkbox"
                onChange={(e) => changeAutoAddSportfiled(e)}
              />
              <label className="form-check-label" style={{ marginLeft: "5px" }}>
                {siteData?.setAutoSportsAdd?.soccer ? "ON" : "OFF"} (Soccer)
              </label>
            </div>
            <div className="search-btn mb-10">
              <p style={{ marginLeft: "10px" }}>Action</p>
              <button
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "100px",
                  height: "25px",
                }}
                onClick={(e) => updateSiteData(e)}
              >
                Update
              </button>
            </div>
          </div>
        </div>
        <div style={{ background: "#e0e6e6", padding: "10px 0 0 10px" }}>
          <label>Select Sports:</label>
          <select
            style={{ height: "32px", margin: "0 10px", width: "120px" }}
            name="cars"
            id="cars"
            value={sportName}
            onChange={(e) => {
              setSportName(e.target.value);
            }}
          >
            <option value="cricket">Cricket</option>
            <option value="soccer">Soccer</option>
            <option value="tennis">Tennis</option>
          </select>
        </div>
        {array?.map((_, i) => {
          return (
            <>
              <div className="admin-setting-inner">
                <h4 className="mb-10">{_}</h4>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      width: "20%",
                    }}
                  >
                    <label style={{ marginRight: "5px" }}>Min</label>
                    <input
                      style={{ padding: "3px 5px" }}
                      type="number"
                      name="min"
                      placeholder="Enter Number or Link"
                      onChange={(e) =>
                        onChangeFiled(
                          e,
                          i === 0
                            ? "oddsLimit"
                            : i === 1
                            ? "bet_odds_limit"
                            : i === 2
                            ? "bet_bookmaker_limit"
                            : i === 3
                            ? "bet_fancy_limit"
                            : "20"
                        )
                      }
                      value={
                        i === 0
                          ? siteData[sportName]?.oddsLimit?.min
                          : i === 1
                          ? siteData[sportName]?.bet_odds_limit?.min
                          : i === 2
                          ? siteData[sportName]?.bet_bookmaker_limit?.min
                          : i === 3
                          ? siteData[sportName]?.bet_fancy_limit?.min
                          : 20
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      width: "20%",
                    }}
                  >
                    <label style={{ marginRight: "5px" }}>Max </label>
                    <input
                      style={{ padding: "3px 5px" }}
                      type="number"
                      name="max"
                      placeholder="Enter Number or Link"
                      onChange={(e) =>
                        onChangeFiled(
                          e,
                          i === 0
                            ? "oddsLimit"
                            : i === 1
                            ? "bet_odds_limit"
                            : i === 2
                            ? "bet_bookmaker_limit"
                            : i === 3
                            ? "bet_fancy_limit"
                            : "20"
                        )
                      }
                      value={
                        i === 0
                          ? siteData[sportName]?.oddsLimit?.max
                          : i === 1
                          ? siteData[sportName]?.bet_odds_limit?.max
                          : i === 2
                          ? siteData[sportName]?.bet_bookmaker_limit?.max
                          : i === 3
                          ? siteData[sportName]?.bet_fancy_limit?.max
                          : 20
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      width: "20%",
                    }}
                  >
                    <label style={{ marginRight: "5px" }}>Max Profit</label>
                    <input
                      style={{ padding: "3px 5px" }}
                      type="number"
                      name="maxProfit"
                      placeholder="Enter Number or Link"
                      onChange={(e) =>
                        onChangeFiled(
                          e,
                          i === 0
                            ? "oddsLimit"
                            : i === 1
                            ? "bet_odds_limit"
                            : i === 2
                            ? "bet_bookmaker_limit"
                            : i === 3
                            ? "bet_fancy_limit"
                            : "20"
                        )
                      }
                      value={
                        i === 0
                          ? siteData[sportName]?.oddsLimit?.maxProfit
                          : i === 1
                          ? siteData[sportName]?.bet_odds_limit?.maxProfit
                          : i === 2
                          ? siteData[sportName]?.bet_bookmaker_limit?.maxProfit
                          : i === 3
                          ? siteData[sportName]?.bet_fancy_limit?.maxProfit
                          : 20
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      width: "20%",
                    }}
                  >
                    <label style={{ marginRight: "5px" }}>Bet Delay</label>
                    <input
                      style={{ padding: "3px 5px" }}
                      type="number"
                      name="betDelay"
                      placeholder="Enter Number or Link"
                      onChange={(e) =>
                        onChangeFiled(
                          e,
                          i === 0
                            ? "oddsLimit"
                            : i === 1
                            ? "bet_odds_limit"
                            : i === 2
                            ? "bet_bookmaker_limit"
                            : i === 3
                            ? "bet_fancy_limit"
                            : "20"
                        )
                      }
                      value={
                        i === 0
                          ? siteData[sportName]?.oddsLimit?.betDelay
                          : i === 1
                          ? siteData[sportName]?.bet_odds_limit?.betDelay
                          : i === 2
                          ? siteData[sportName]?.bet_bookmaker_limit?.betDelay
                          : i === 3
                          ? siteData[sportName]?.bet_fancy_limit?.betDelay
                          : 20
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      width: "20%",
                    }}
                  >
                    <label style={{ marginRight: "5px" }}>Max Bhav</label>
                    <input
                      style={{ padding: "3px 5px" }}
                      type="number"
                      name="maxPrice"
                      placeholder="Enter Number or Link"
                      onChange={(e) =>
                        onChangeFiled(
                          e,
                          i === 0
                            ? "oddsLimit"
                            : i === 1
                            ? "bet_odds_limit"
                            : i === 2
                            ? "bet_bookmaker_limit"
                            : i === 3
                            ? "bet_fancy_limit"
                            : "20"
                        )
                      }
                      value={
                        i === 0
                          ? siteData[sportName]?.oddsLimit?.maxPrice
                          : i === 1
                          ? siteData[sportName]?.bet_odds_limit?.maxPrice
                          : i === 2
                          ? siteData[sportName]?.bet_bookmaker_limit?.maxPrice
                          : i === 3
                          ? siteData[sportName]?.bet_fancy_limit?.maxPrice
                          : 20
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      width: "15%",
                    }}
                  >
                    <div className="form-check flex-align">
                      <input
                        // className="form-check-input"
                        // checked={false}
                        name="isShow"
                        type="checkbox"
                        // role="switch"
                        id="rolling_delay"
                        onChange={(e) =>
                          onChangeFiledForCheckBox(
                            e,
                            i === 0
                              ? "oddsLimit"
                              : i === 1
                              ? "bet_odds_limit"
                              : i === 2
                              ? "bet_bookmaker_limit"
                              : i === 3
                              ? "bet_fancy_limit"
                              : "20"
                          )
                        }
                        value={
                          i === 0
                            ? siteData[sportName]?.oddsLimit?.isShow
                            : i === 1
                            ? siteData[sportName]?.bet_odds_limit?.isShow
                            : i === 2
                            ? siteData[sportName]?.bet_bookmaker_limit?.isShow
                            : i === 3
                            ? siteData[sportName]?.bet_fancy_limit?.isShow
                            : false
                        }
                      />
                      <label
                        className="form-check-label"
                        style={{ marginLeft: "5px" }}
                        htmlFor="rolling_delay"
                      >
                        ON (IS SHOWING)
                      </label>
                    </div>
                  </div>
                  <div className="search-btn mb-10">
                    <p style={{ marginLeft: "10px" }}>Action</p>
                    <button
                      style={{
                        ...styleObjectBlackButton(DD?.colorSchema, true),
                        width: "100px",
                        height: "25px",
                      }}
                      onClick={(e) => updateSiteData(e)}
                    >
                      Set Limit
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        })} */}
      </div>
    </div>
  );
}

export default DeafultContactSetting;
