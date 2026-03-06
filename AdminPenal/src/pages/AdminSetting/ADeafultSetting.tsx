import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import SearchInput from "../../components/SearchInput";
import { ADMIN_API } from "../../common/common";
import { notifyError, notifyMessage, postApi } from "../../service";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Logout } from "../../common/Funcation";

function ADeafultSetting() {
  const navigate = useNavigate();
  const DD = useSelector((e: any) => e.domainDetails);
  const [sportName, setSportName] = useState<string>("cricket");
  const defaultDataLimit = {
    min: 0,
    max: 0,
    maxProfit: 0,
    betDelay: 0,
    maxPrice: 0,
    isShow: false,
  };
  const defaultAutoData = { cricket: false, soccer: false, tennis: false };
  const [siteData, setSiteData] = useState<any>({
    cricket: {
      oddsLimit: { ...defaultDataLimit, min: 55 },
      bet_odds_limit: { ...defaultDataLimit, min: 50 },
      bet_bookmaker_limit: { ...defaultDataLimit, min: 5 },
      bet_fancy_limit: { ...defaultDataLimit, min: 10 },
      bet_premium_limit: { ...defaultDataLimit },
    },
    soccer: {
      oddsLimit: { ...defaultDataLimit },
      bet_odds_limit: { ...defaultDataLimit },
      bet_bookmaker_limit: { ...defaultDataLimit },
      bet_premium_limit: { ...defaultDataLimit },
    },
    tennis: {
      oddsLimit: { ...defaultDataLimit },
      bet_odds_limit: { ...defaultDataLimit },
      bet_bookmaker_limit: { ...defaultDataLimit },
      bet_premium_limit: { ...defaultDataLimit },
    },
    setAutoSportsResult: { ...defaultAutoData },
    setAutoSportsAdd: { ...defaultAutoData },
  });
  const array = [
    "Odds Limit Min Max",
    "Bet Odds Limit Min Max",
    "Bet BookMaker Limit Min Max",
    "Bet Fancy Limit Min Max",
    "Bet Premium Limit Min Max",
  ];
  useEffect(() => {
    getSiteData();
    return () => {};
  }, []);
  const getSiteData = async () => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.GET_SPORTS_LIMIT,
    };

    await postApi(data)
      .then(function (response) {
        console.log("getSiteData :: ", response);
        if (response.data.data?.siteInfo) {
          console.log(
            "response.data.data?.siteInfo :: ",
            response.data.data?.siteInfo
          );
          setSiteData(response.data.data?.siteInfo);
        }
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const changefiled = (e: any) => {
    const { name, value, checked } = e.target;

    // console.log({ name, value, checked });

    if (name === "cricket") {
      siteData.setAutoSportsResult.cricket = checked;
    }
    if (name === "tennis") {
      siteData.setAutoSportsResult.tennis = checked;
    }
    if (name === "soccer") {
      siteData.setAutoSportsResult.soccer = checked;
    }
    setSiteData(siteData);
  };
  useEffect(() => {
    console.log("siteData :: ", siteData);
  }, [siteData]);
  const changeAutoAddSportfiled = (e: any) => {
    const { name, value, checked } = e.target;

    setSiteData((per: any) => ({
      ...per,
      setAutoSportsAdd: {
        ...per.setAutoSportsAdd,
        [name]: checked,
      },
    }));
  };

  const changeAutoAddSportResultfiled = (e: any) => {
    const { name, value, checked } = e.target;

    setSiteData((per: any) => ({
      ...per,
      setAutoSportsResult: {
        ...per.setAutoSportsResult,
        [name]: checked,
      },
    }));
  };

  const updateSiteData = async (e: any) => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.UPDATE_SPORTS_LIMIT,
      value: {
        ...siteData,
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

  const onChangeFiled = (e: any, key: string) => {
    const { name, value } = e.target;

    setSiteData((per: any) => ({
      ...per,
      [sportName]: {
        ...per[sportName],
        [key]: {
          ...per[sportName][key],
          [name]: Number(value),
        },
      },
    }));

    // siteData[sportName][key][name] = Number(value)
    // setSiteData(siteData);

    console.log("siteData :: ", siteData);
  };
  const onChangeFiledForCheckBox = (e: any, key: string) => {
    const { name, value, checked } = e.target;

    siteData[sportName][key][name] = checked;
    setSiteData(siteData);
  };
  return (
    <div className="container main_wrap">
      <div className="admin-setting">
        {/* <h4
          style={{
            background: "#000",
            fontSize: "16px",
            color: "white",
            padding: "10px",
          }}
        >
          SET AUTO SPORTS RESULT
        </h4>
        <div
          className="admin-setting-inner"
          style={{ background: "lightblue" }}
        >
          <div
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            <div className="form-check flex-align w-20">
              <input
                value={siteData?.setAutoSportsResult?.cricket}
                name="cricket"
                type="checkbox"
                onChange={(e) => changeAutoAddSportResultfiled(e)}
              />
              <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
                htmlFor="rolling_delay"
              >
                {siteData?.setAutoSportsResult?.cricket ? "ON" : "OFF"}{" "}
                (Cricket)
              </label>
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
        </div>
        <div className="admin-setting-inner">
          <h4 className="mb-10">Set Auto Add Sports</h4>
          <div
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            <div className="form-check flex-align w-20">
              <input type="checkbox" name="cricket" value={siteData?.setAutoSportsAdd?.cricket}
                onChange={(e) => changeAutoAddSportfiled(e)} />
              <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
              >
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
              <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
              >
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
              <label
                className="form-check-label"
                style={{ marginLeft: "5px" }}
              >
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
        </div> */}
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
              {(i !== 3 || (i === 3 && sportName === "cricket")) && (
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
                              : i === 4
                              ? "bet_premium_limit"
                              : "0"
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
                            : i === 4
                            ? siteData[sportName]?.bet_premium_limit?.min
                            : 0
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
                              : i === 4
                              ? "bet_premium_limit"
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
                            : i === 4
                            ? siteData[sportName]?.bet_premium_limit?.max
                            : 20
                        }
                      />
                    </div>
                    {i !== 0 && (
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
                                : i === 4
                                ? "bet_premium_limit"
                                : "20"
                            )
                          }
                          value={
                            i === 0
                              ? siteData[sportName]?.oddsLimit?.maxProfit
                              : i === 1
                              ? siteData[sportName]?.bet_odds_limit?.maxProfit
                              : i === 2
                              ? siteData[sportName]?.bet_bookmaker_limit
                                  ?.maxProfit
                              : i === 3
                              ? siteData[sportName]?.bet_fancy_limit?.maxProfit
                              : i === 4
                              ? siteData[sportName]?.bet_premium_limit
                                  ?.maxProfit
                              : 20
                          }
                        />
                      </div>
                    )}
                    {/* 
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

                      onChange={(e) => onChangeFiled(e, i === 0 ? 'oddsLimit' :
                        i === 1 ? "bet_odds_limit" :
                          i === 2 ? "bet_bookmaker_limit" :
                            i === 3 ? "bet_fancy_limit" : '20')}
                      value={
                        i === 0 ? siteData[sportName]?.oddsLimit?.betDelay :
                          i === 1 ? siteData[sportName]?.bet_odds_limit?.betDelay :
                            i === 2 ? siteData[sportName]?.bet_bookmaker_limit?.betDelay :
                              i === 3 ? siteData[sportName]?.bet_fancy_limit?.betDelay : 20
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

                      onChange={(e) => onChangeFiled(e, i === 0 ? 'oddsLimit' :
                        i === 1 ? "bet_odds_limit" :
                          i === 2 ? "bet_bookmaker_limit" :
                            i === 3 ? "bet_fancy_limit" : '20')}
                      value={
                        i === 0 ? siteData[sportName]?.oddsLimit?.maxPrice :
                          i === 1 ? siteData[sportName]?.bet_odds_limit?.maxPrice :
                            i === 2 ? siteData[sportName]?.bet_bookmaker_limit?.maxPrice :
                              i === 3 ? siteData[sportName]?.bet_fancy_limit?.maxPrice : 20
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

                        onChange={(e) => onChangeFiledForCheckBox(e, i === 0 ? 'oddsLimit' :
                          i === 1 ? "bet_odds_limit" :
                            i === 2 ? "bet_bookmaker_limit" :
                              i === 3 ? "bet_fancy_limit" : '20')}
                        value={
                          i === 0 ? siteData[sportName]?.oddsLimit?.isShow :
                            i === 1 ? siteData[sportName]?.bet_odds_limit?.isShow :
                              i === 2 ? siteData[sportName]?.bet_bookmaker_limit?.isShow :
                                i === 3 ? siteData[sportName]?.bet_fancy_limit?.isShow : false
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
                  </div> */}
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
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}

export default ADeafultSetting;
