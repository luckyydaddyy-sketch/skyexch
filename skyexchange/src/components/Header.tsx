/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SimpleReactValidator from "simple-react-validator";
import Cookies from "universal-cookie";
import { ADMIN_API, USER_API } from "../common/common";
import { getImageUrl, Logout } from "../common/Funcation";
import {
  getTheme,
  styleObjectGetBG,
  styleObjectGetBGasColor,
  styleObjectGetBorderColor,
  styleObjectGetColor,
} from "../common/StyleSeter";
import { Helmet } from "react-helmet";

import Login from "../pages/Login";
import {
  getApi,
  getApiLink,
  notifyError,
  notifyMessage,
  postApi,
  sendEvent,
} from "../service";
import StakePopup from "./StakePopup";
import BetBox from "../pages/MultiMarket/BetBox";
import transparent from "../assets/images/transparent.gif";
import yelloImage from "../assets/images/s-yellow.svg";
import redSetingImage from "../assets/images/s-red.svg";
import whiteSetingImage from "../assets/images/s-white.svg";
import { isMobile } from "react-device-detect";

const cookies = new Cookies();

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const homeData = useSelector((e: any) => e.homeData);
  const HeaderData = useSelector((e: any) => e.Header);
  const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
  const marketListDetails = useSelector((e: any) => e.marketListDetails);
  const [searchEvent, setSearchEvent] = useState<any>({
    searchText: "",
    typing: false,
    typingTimeout: undefined,
  });
  const [showBetBox, setShowBetBox] = useState(false);
  const [searchData, setSearchData] = useState<any>();
  const balanceData = useSelector((e: any) => e.balance);
  const exposureData = useSelector((e: any) => e.exposure);
  const DD = useSelector((e: any) => e.domainDetails);
  const [domainDetails, setDomainDetails] = useState(DD);
  const [balance, setBalance] = useState(balanceData);
  const [exposures, setExposure] = useState(exposureData);
  const [headerOptions, setHeaderOptions] = useState(HeaderData);
  const [OpenModal, setOpenModal] = useState<boolean>(false);
  const [manageStack, setManageStack] = useState<any>();
  const matchCount = useSelector((e: any) => e.matchCount);
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    validationCode: "",
  });
  const [headerOption, setHeaderOption] = useState([
    { name: "Home", hasAccess: true, link: "/", subOption: [] },
    { name: "InPlay ", hasAccess: true, link: "/in-play", subOption: [] },
    {
      name: "Multi Markets",
      hasAccess: true,
      link: "/multimarket",
      subOption: [],
    },
    { name: "Cricket", hasAccess: true, link: "/cricket", subOption: [] },
    { name: "Soccer", hasAccess: true, link: "/soccer", subOption: [] },
    { name: "Tennis", hasAccess: true, link: "/tennis", subOption: [] },
    { name: "E-Soccer", hasAccess: false, link: "/Esoccer", subOption: [] },
    { name: "basketBall", hasAccess: false, link: "/basketBall", subOption: [] },
    { name: "Casino", hasAccess: true, link: "", subOption: [] },
  ]);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    console.log("marketListDetails :: ", marketListDetails, homeData)
    if (marketListDetails?.data?.length > 0) {
      let HEADER_OPTIONS = [...headerOption];
      HEADER_OPTIONS.forEach((element: any) => {
        marketListDetails.data.forEach((item: any) => {
          if (item?.name === element?.name) {
            element.hasAccess = !item.isBlock;
          }
        });
      if(element?.name === "E-Soccer" && homeData?.eSoccer === true){
        element.hasAccess = true;
      }
      if(element?.name === "basketBall" && homeData?.basketBall === true){
        element.hasAccess = true;
      }
      });
      setHeaderOption([...HEADER_OPTIONS]);
    }else{
      let HEADER_OPTIONS = [...headerOption];
      HEADER_OPTIONS.forEach((element: any) => {
        if(element?.name === "E-Soccer" && homeData?.eSoccer === true){
          element.hasAccess = true;
        }
        if(element?.name === "basketBall" && homeData?.basketBall === true){
          element.hasAccess = true;
        }
      })
      setHeaderOption([...HEADER_OPTIONS]);
    }
    return () => {};
  }, [marketListDetails, homeData]);

  const [isLoadding, setIsLoadding] = useState(true);
  const [searchString, setSearchString] = useState("");
  const [oneClickActive, setOneClickActive] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [OpenSetting, setOpenSetting] = useState(false);
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [confirmationCode, setConfirmationCode] = useState(
    Math.floor(1000 + Math.random() * 9000)
  );
  const [isValidationWrong, setIsValidationWrong] = useState(false);
  const isCaptcha = process.env.REACT_APP_CAPTCHA;
  const isSignUp = process.env.REACT_APP_SIGN_UP_BUTTON;
  console.log("isSignUp ::: ", { isSignUp, isCaptcha });

  const handelInputChange = (e: any) => {
    const { name, value } = e.target;
    setIsValidationWrong(false);
    setFormData({ ...formData, [name]: value });
  };
  const handelSubmit = async (e: any) => {
    e.preventDefault();

    if (
      Validator.current.allValid() &&
      (confirmationCode === parseInt(formData.validationCode) ||
        isCaptcha === "false")
    ) {
      setIsValidationWrong(false);
      // const ipDetails = await getApiLink({
      //   api: "https://ipapi.co/json/?key=wfzfdfQ4cUsaTVURUkj2oF6L51Y4jNE0IM2yE0V2xMyMkxjTsr",
      // });
      // console.log("call ip:  ipDetails :", ipDetails);

      let data = {
        api: USER_API.LOGIN,
        value: {
          user_name: formData.user_name,
          password: formData.password,
          domain: window.location.hostname,
          // city: ipDetails?.data?.city,
          // state: ipDetails?.data?.region,
          // country: ipDetails?.data?.country_name,
          // ISP: ipDetails?.data?.org
        },
      };
      setIsLoadding(true);
      await postApi(data)
        .then(function (loginData) {
          if (loginData) {
            // notifyMessage(loginData.data.message)

            let HeaderData = {
              ...loginData.data.data.roleAccess,
              user_name: loginData.data.data.user_name,
              remaining_balance: loginData.data.data?.balance,
              exposure: loginData.data.data?.exposure,
              ...loginData.data.data,
            };
            dispatch({ type: "HEADER_DETAILS", payload: HeaderData });
            cookies.set("skyTokenFront", loginData.data.data.token, {
              domain: process.env.REACT_APP_COOKIE_DOMAIN,
              path: "/",
            });
            dispatch({
              type: "AUTHENTICATION",
              payload: {
                isLogin: true,
                token: loginData.data.data.token,
                changePassword: loginData.data.data.newPassword,
              },
            });
            setOpenModal(false);
            if (loginData.data.data.newPassword) {
              navigate("change/password");
            }
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        })
        .catch((err) => {
          setIsLoadding(false);
          notifyError(err.response.data.message);
          setIsValidationWrong(false);
          setConfirmationCode(Math.floor(1000 + Math.random() * 9000));
          setFormData({ ...formData, validationCode: "" });
        });
    } else {
      Validator.current.showMessages();
      if (confirmationCode !== parseInt(formData.validationCode)) {
        setIsValidationWrong(true);
      }
      setConfirmationCode(Math.floor(1000 + Math.random() * 9000));
      forceUpdate();
    }
  };
  const Validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
    })
  );

  const getBalance = async () => {
    let data = {
      api: USER_API.GET_PROFILE,
      // value: { user_name: formData.user_name, password: formData.password }
    };
    setIsLoadding(true);
    await getApi(data)
      .then(function (profileData) {
        if (profileData) {
          setBalance(profileData?.data?.data?.balance);
          setIsLoadding(false);
        }
      })
      .catch((err) => {
        setIsLoadding(false);
        notifyError(err.response.data.message);
        setIsValidationWrong(false);
        setConfirmationCode(Math.floor(1000 + Math.random() * 9000));
        setFormData({ ...formData, validationCode: "" });
      });
  };

  useEffect(() => {
    setBalance(balanceData);

    return () => {};
  }, [balanceData]);
  useEffect(() => {
    setExposure(exposureData);
    return () => {};
  }, [exposureData]);

  useEffect(() => {
    if (balanceData !== "" && exposureData !== "") {
      setIsLoadding(false);
    }
  }, [balanceData, exposureData]);

  useEffect(() => {
    setHeaderOptions(HeaderData);
    return () => {};
  }, [HeaderData]);

  useEffect(() => {
    setDomainDetails(DD);
    return () => {};
  }, [DD]);

  useEffect(() => {
    if (HeaderData) {
      setTimeout(() => {
        sendEvent("UPDATE_USER_BALANCE", { userId: HeaderData?._id });
      }, 1000);
    }
    if (matchCount) {
      setInterval(() => {
        sendEvent("GET_LIVE_MATCH_COUNT", {});
      }, 10000);
    }
    return () => {};
  }, []);

  const HandleNavigation = (path: string) => {
    navigate(path);
  };

  const HandleLogOut = (e: any) => {
    e.preventDefault();
    Logout(e);
    dispatch({
      type: "AUTHENTICATION",
      payload: { isLogin: false, token: "", changePassword: false },
    });
    navigate("/login");
  };

  const items = [
    { id: 0, name: "Cobol" },
    { id: 1, name: "JavaScript" },
    { id: 2, name: "Basic" },
    { id: 3, name: "PHP" },
    { id: 4, name: "Java" },
  ];

  const handleOnSearch = (e: string) => {
    // setSearchString(string);
  };

  const oneClick = () => {
    setOneClickActive(true);
  };
  const formatResult = () => {
    return (
      <>
        <span style={{ display: "block", textAlign: "left" }}>id: </span>
        <span style={{ display: "block", textAlign: "left" }}>name:</span>
      </>
    );
  };

  const getInPlayData = async (FILTER: string) => {
    // setIsLoading(true)

    let data = {
      api: USER_API.IN_PLAY,
      value: { filter: FILTER },
    };

    await postApi(data)
      .then(function (response) {
        if (FILTER === "play") {
          dispatch({
            type: "SET_IN_PLAY_DETAILS_IN_PLAY",
            payload: response.data.data,
          });
        } else if (FILTER === "today") {
          dispatch({
            type: "SET_IN_PLAY_DETAILS_TODAY",
            payload: response.data.data,
          });
        } else if (FILTER === "tomorrow") {
          dispatch({
            type: "SET_IN_PLAY_DETAILS_TOMORROW",
            payload: response.data.data,
          });
        } else {
          dispatch({ type: "SET_IN_PLAY_DETAILS", payload: undefined });
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.data.statusCode === 401) {
          Logout();
          // navigate('/login')
        }
      });
  };

  useEffect(() => {
    setTimeout(() => {
      sendEvent("GET_SPORTS", { type: "cricket" });
      sendEvent("GET_SPORTS", { type: "tennis" });
      sendEvent("GET_SPORTS", { type: "soccer" });
      if(homeData?.eSoccer === true){
        sendEvent("GET_SPORTS", { type: "esoccer" });
      }
      if(homeData?.basketBall === true){
        sendEvent("GET_SPORTS", { type: "basketball" });
      }
    }, 5000);
    setTimeout(() => {
      getInPlayData("play");
      getInPlayData("today");
      getInPlayData("tomorrow");
    }, 3300);
  }, []);

  const handleOneclick = () => {
    setOneClickActive(!oneClickActive);
    setOpenModal(true);
  };
  const handleSetting = async () => {
    setOpenSetting(!OpenSetting);
  };
  const updateSetting = async () => {
    let data = {
      api: USER_API.UPDATE_STACK,
      value: {
        defaultStack: manageStack.defaultStack,
        stack: manageStack.stack,
        highLightsOdds: manageStack.highLightsOdds,
        acceptFancyOdds: manageStack.acceptFancyOdds,
        acceptBookmakerOdds: manageStack.acceptBookmakerOdds,
      },
    };

    await postApi(data)
      .then(function (response) {
        setOpenSetting(false);
        // setSearchData(response.data.data)
      })
      .catch((err) => {
        notifyError(err.response.data.message);
        setOpenSetting(false);
        if (err.response.data.statusCode === 401) {
          // Logout()
          // navigate('/login')
        }
      });
    // setOpenModal(true)
  };
  const handleChange = (e: any) => {
    if (searchEvent.typingTimeout) {
      clearTimeout(searchEvent.typingTimeout);
    }

    setSearchEvent({
      searchText: e.target.value,
      typing: false,
      typingTimeout: setTimeout(function () {
        if (searchEvent.searchText.trim() === "") {
        } else {
          getSeatchData(e.target.value);
        }
      }, 500),
    });
  };
  const getSeatchData = async (VALUE: string = "") => {
    let data = {
      api: USER_API.SEARCH,
      value: {
        search: VALUE,
      },
    };

    await postApi(data)
      .then(function (response) {
        setSearchData(response.data.data);
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const onBetHistoryClick = () => {
    dispatch({ type: "SHOW_BET_HISTORY", payload: {} });
    setShowBetBox(!showBetBox);
  };

  const getCasinoLink = async (fromMobile: boolean = false) => {
    if (cookies.get("skyTokenFront")) {
      let data = {
        api: USER_API.CASINO_LOGIN,
        value: {
          id: "loginType",
          isMobileLogin: isMobile ? true : false,
          domain:
            window.location.hostname === "localhost"
              ? "taka365.win"
              : window.location.hostname,
        },
        token: cookies.get("skyTokenFront") ? cookies.get("skyTokenFront") : "",
      };

      await postApi(data)
        .then(function (response) {
          window.open(response?.data?.data?.url, "_blank");
        })
        .catch((err) => {
          console.log(err);
          notifyError(err?.response?.data?.message);

          if (err.response.data.statusCode === 401) {
            Logout();
            // notifyError('Pin unsuccess')
            // navigate('/login')
          }
        });
    } else {
      if (fromMobile) {
        window.location.pathname = "/login";
      }
      notifyError("please login first");
    }
  };

  const MY_TV_FLAG = useSelector((e: any) => e.myTv);
  const [liveTv, setLiveTv] = useState(false);
  const setOpenTvFlag = () => {
    console.log("set flag :h: ", MY_TV_FLAG);

    dispatch({ type: "LIVE_TV", payload: !MY_TV_FLAG });
    // setLiveTv(!MY_TV_FLAG);
    console.log("MY_TV_FLAG :h: 11 :: ", MY_TV_FLAG);
  };
  return (
    <>
      {window.innerWidth < 993 && showBetBox && (
        <div>
          {" "}
          <BetBox
            isMobile={true}
            betHistoryShow={showBetBox}
            setShowBetBox={setShowBetBox}
          />{" "}
        </div>
      )}

      <header className="header">
        <Helmet>
          <link rel="icon" href={getImageUrl(domainDetails?.favicon)} />
          <title>{domainDetails?.title}</title>
        </Helmet>
        <div className="header_wrp">
          {window.innerWidth > 768 ? (
            <>
              <div className="header_wrp_l">
                {window.innerWidth > 768 ? (
                  <>
                    <div className="header_wrp_l_logo c">
                      <img src={getImageUrl(domainDetails?.logo)} alt="logo" onClick={()=> window.location.href = "/"}/>
                    </div>
                  </>
                ) : cookies.get("skyTokenFront") ? (
                  <>
                    {window.location.pathname.split("/").length > 3 && (
                      <a
                        id="openTV"
                        className={`a-open_tv ui-link ${
                          MY_TV_FLAG ? "close_tv" : ""
                        }`}
                        onClick={() => setOpenTvFlag()}
                      >
                        <div />
                      </a>
                    )}
                    <a
                      id="openBetsBtn"
                      className={`a-open_bets ui-link ${
                        window.location.pathname.split("/").length < 3
                          ? "ml-0"
                          : ""
                      }`}
                      style={styleObjectGetBGasColor(
                        domainDetails?.colorSchema, false, true
                      )}
                      onClick={() => onBetHistoryClick()}
                      href="#"
                    >
                      <img src={transparent} />
                      Bets
                    </a>
                  </>
                ) : (
                  <div className="header_wrp_l_logo">
                    <img src={getImageUrl(domainDetails?.logo)} alt="logo" onClick={()=> window.location.href = "/"}/>
                  </div>
                )}

                <div className="search_box">
                  <svg
                    width="19"
                    height="19"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.547 11.543H12l-.205-.172a4.539 4.539 0 001.06-2.914A4.442 4.442 0 008.41 4C5.983 4 4 5.989 4 8.457a4.442 4.442 0 004.445 4.457c1.094 0 2.12-.411 2.905-1.062l.206.171v.548L14.974 16 16 14.971l-3.453-3.428zm-4.102 0a3.069 3.069 0 01-3.077-3.086 3.068 3.068 0 013.077-3.086 3.069 3.069 0 013.076 3.086 3.069 3.069 0 01-3.076 3.086z"
                      fill="rgb(30,30,30"
                    ></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Events"
                    onChange={(e) => handleChange(e)}
                  />
                  {searchData && searchEvent.searchText !== "" && (
                    <div className="search-result">
                      <ul
                        id="ui-id-2"
                        className="ui-menu ui-widget ui-widget-content ui-autocomplete ui-front"
                        unselectable="on"
                        style={{
                          top: "52px",
                          left: "167.672px",
                          width: "275.484px",
                        }}
                      >
                        {searchData &&
                          searchData.map((item: any) => (
                            <li className="ui-menu-item">
                              <div
                                id="ui-id-15"
                                className="ui-menu-item-wrapper"
                              >
                                <a
                                  href={`/multimarket/${item.gameId}/${item.marketId}`}
                                >
                                  {item.name}
                                </a>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`header_wrp_r ${
                  window.location.pathname.split("/")[1] === "user"
                    ? "user"
                    : ""
                }`}
              >
                {!isAuthenticated && !cookies.get("skyTokenFront") ? (
                  <>
                    <ul className="login-wrap d_flex ">
                      <li className="user error">
                        <input
                          id="loginName"
                          value={formData.user_name}
                          onChange={(e) => handelInputChange(e)}
                          name="user_name"
                          type="text"
                          placeholder="Username"
                        />
                        <span className="error" style={{ color: "red" }}>
                          {Validator.current.message(
                            "user_Name",
                            formData.user_name,
                            "required"
                          )}
                        </span>
                      </li>
                      <li>
                        <div style={{ position: "relative" }}>
                          <input
                            id="password"
                            value={formData.password}
                            onChange={(e) => handelInputChange(e)}
                            type={showPass ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            style={{ paddingRight: "30px" }}
                          />
                          <span
                            onClick={() => setShowPass(!showPass)}
                            style={{
                              position: "absolute",
                              right: "5px",
                              top: "50%",
                              transform: "translate(0, -50%)",
                            }}
                          >
                            <img
                              style={{ width: "15px", cursor: "pointer" }}
                              src={
                                showPass
                                  ? "./images/eye_close.png"
                                  : "./images/eye.png"
                              }
                              alt=""
                            />
                          </span>
                        </div>
                        <span className="error" style={{ color: "red" }}>
                          {Validator.current.message(
                            "password",
                            formData.password,
                            "required"
                          )}
                        </span>
                      </li>
                      {isCaptcha !== "false" && (
                        <li className="valid-code">
                          <input
                            id="validCode"
                            type="text"
                            onChange={(e) => handelInputChange(e)}
                            value={formData.validationCode}
                            name="validationCode"
                            placeholder="Validation"
                            maxLength={4}
                          />
                          <h3>{confirmationCode}</h3>
                          {/* <img id="authenticateImage" src="https://bxawscf.skyexchange.com/verifycode.gr?v=1666603469424" /> */}
                        </li>
                      )}
                      <li>
                        <input id="valid" name="valid" type="hidden" value="" />
                      </li>
                      <li>
                        <a
                          id="loginBtn"
                          className="btn-login"
                          onClick={(e) => handelSubmit(e)}
                        >
                          Login
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="11"
                          >
                            <path
                              d="M5.71 7.706l1.432-1.604H1.778V4.898h5.39L5.71 3.294l.781-.86L9.278 5.5 6.49 8.565l-.78-.86zM1.12 0C.825 0 .564.124.339.372a1.24 1.24 0 0 0-.339.86v8.536c0 .325.113.611.339.86.225.248.486.372.78.372H8.88c.295 0 .556-.124.781-.372a1.24 1.24 0 0 0 .339-.86V7.333H8.88v2.435H1.12V1.232h7.76v2.435H10V1.232a1.24 1.24 0 0 0-.339-.86C9.436.124 9.175 0 8.881 0H1.12z"
                              fill="#FFF"
                              fillRule="evenodd"
                            />
                          </svg>
                        </a>
                      </li>
                      {homeData?.signup === true && isSignUp === "true" && (
                        <li>
                          <a
                            className="btn-signup"
                            href={domainDetails?.agentListUrl}
                            target="_blank"
                          >
                            Sign-Up
                          </a>
                        </li>
                      )}
                    </ul>
                    <ul className="login-wrap d_flex mobile_login ">
                      {homeData?.signup === true && isSignUp === "true" && (
                        <li>
                          <a
                            className="btn-signup"
                            href={domainDetails?.agentListUrl}
                            target="_blank"
                          >
                            Sign-Up
                          </a>
                        </li>
                      )}
                      <li>
                        {" "}
                        <a id="loginBtn" href="/login" className="btn-login">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ marginRight: "5px" }}
                            width="17"
                            height="17"
                            viewBox="0 0 17 17"
                          >
                            <path
                              fill="rgb(255,255,255)"
                              fillRule="evenodd"
                              d="M11.797 11.65c2.342.338 4.072 1.702 4.51 2.1C16.74 14.148 17 17 17 17H0s-.03-2.314.744-3.25c.437-.398 1.81-1.762 4.153-2.1 2.326-.322 1.616-2.774 1.696-2.743.08.045-.016-.522-.016-.522S4.88 6.837 4.897 5.442c.032-1.41 0-2.132 0-2.132S5.17 0 7.563 0l1.34.614c2.15 0 2.505 2.696 2.505 2.696v2.33S11.134 7.62 9.792 8.34c0 0-.096.57-.015.52.08-.03-.307 2.47 2.02 2.792z"
                            />
                          </svg>
                          Login
                        </a>
                      </li>
                    </ul>
                  </>
                ) : (
                  <ul className="account-wrap">
                    <li className="main-wallet">
                      <a
                        id="multiWallet"
                        href="#multiBalancePop"
                        className="a-wallet"
                      >
                        <ul id="accountCredit d_flex">
                          {!isLoadding ? (
                            <>
                              <li
                                style={styleObjectGetBGasColor(
                                  domainDetails?.colorSchema, false, true
                                )}
                              >
                                <span>Main </span>
                                <span
                                  style={{ fontWeight: "bolder" }}
                                  id="betCredit"
                                >
                                  {domainDetails?.currency
                                    ? `${domainDetails?.currency} `
                                    : "PTH "}
                                    {balance}
                                </span>
                              </li>
                              <li
                                style={styleObjectGetBGasColor(
                                  domainDetails?.colorSchema, false, true
                                )}
                              >
                                <span>Exposure</span>{" "}
                                <span
                                  className={`exposures ${
                                    exposures > 0 ? "active" : ""
                                  }`}
                                  id="totalExposure"
                                >
                                  {Math.abs(exposures)}
                                </span>
                              </li>
                              {/* <li className="nums">+<span id="vendorQuantity">4</span></li> */}
                            </>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="100px"
                              height="40px"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="xMidYMid"
                            >
                              <g transform="translate(20 50)">
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="6"
                                  fill={
                                    getTheme(domainDetails?.colorSchema)
                                      ?.backgroundColor
                                  }
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="scale"
                                    begin="-0.375s"
                                    calcMode="spline"
                                    keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                    values="0;1;0"
                                    keyTimes="0;0.5;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                  ></animateTransform>
                                </circle>
                              </g>
                              <g transform="translate(40 50)">
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="6"
                                  fill={
                                    getTheme(domainDetails?.colorSchema)
                                      ?.backgroundColor
                                  }
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="scale"
                                    begin="-0.25s"
                                    calcMode="spline"
                                    keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                    values="0;1;0"
                                    keyTimes="0;0.5;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                  ></animateTransform>
                                </circle>
                              </g>
                              <g transform="translate(60 50)">
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="6"
                                  fill={
                                    getTheme(domainDetails?.colorSchema)
                                      ?.backgroundColor
                                  }
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="scale"
                                    begin="-0.125s"
                                    calcMode="spline"
                                    keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                    values="0;1;0"
                                    keyTimes="0;0.5;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                  ></animateTransform>
                                </circle>
                              </g>
                              <g transform="translate(80 50)">
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="6"
                                  fill={
                                    getTheme(domainDetails?.colorSchema)
                                      ?.backgroundColor
                                  }
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="scale"
                                    begin="0s"
                                    calcMode="spline"
                                    keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                    values="0;1;0"
                                    keyTimes="0;0.5;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                  ></animateTransform>
                                </circle>
                              </g>
                            </svg>
                          )}
                        </ul>
                        <div
                          className="nums"
                          style={styleObjectGetBorderColor(
                            domainDetails?.colorSchema
                          )}
                        >
                          <span
                            id="vendorQuantity"
                            style={styleObjectGetBGasColor(
                              domainDetails?.colorSchema, false, true
                            )}
                          >
                            +4
                          </span>
                        </div>

                        {/* show wallet */}
                        <div className="wallet-detail" id="multiBalancePop">
                          <div>
                            <div className="wallet-detail-group">
                              <dl className="wallet-detail-content">
                                <dt>Main Balance</dt>
                                <dd className="wallet-balance-num">
                                  <span
                                    className="badge-currency"
                                    id="currency"
                                  >
                                    {domainDetails?.currency
                                      ? domainDetails?.currency
                                      : "PTH"}
                                  </span>
                                  <span id="mainBalance">{balance}</span>
                                </dd>
                                <dd className="wallet-exposure">
                                  Exposure{" "}
                                  <span id="mainExposure">{exposures}</span>
                                </dd>
                              </dl>
                            </div>
                            <div
                              id="walletContent"
                              className="wallet-detail-group"
                            >
                              <dl id="tempDl" className="wallet-detail-content">
                                <dt id="vendorTitle_1">Casino Balance</dt>
                                <dd className="wallet-balance-num">
                                  <span
                                    className="badge-currency"
                                    id="vendorCurrency_1"
                                  >
                                    PTH
                                  </span>
                                  <span id="vendorBalance_1">0</span>
                                </dd>
                                <dd className="wallet-recall">
                                  <button
                                    className="btn-recall"
                                    id="recall_1"
                                    //  onclick="TopMenuHandler.recall('1')"
                                  >
                                    Recall
                                  </button>
                                </dd>
                              </dl>
                              <dl id="tempDl" className="wallet-detail-content">
                                <dt id="vendorTitle_3">BPoker Balance</dt>
                                <dd className="wallet-balance-num">
                                  <span
                                    className="badge-currency"
                                    id="vendorCurrency_3"
                                  >
                                    PTH
                                  </span>
                                  <span id="vendorBalance_3">0 Points</span>
                                </dd>
                                <dd className="wallet-recall">
                                  <button
                                    className="btn-recall"
                                    id="recall_3"
                                    // onclick="TopMenuHandler.recall('3')"
                                  >
                                    Recall
                                  </button>
                                </dd>
                              </dl>
                              <dl id="tempDl" className="wallet-detail-content">
                                <dt id="vendorTitle_5">SABA Balance</dt>
                                <dd className="wallet-balance-num">
                                  <span
                                    className="badge-currency"
                                    id="vendorCurrency_5"
                                  >
                                    PTH
                                  </span>
                                  <span id="vendorBalance_5">0</span>
                                </dd>
                                <dd className="wallet-recall">
                                  <button
                                    className="btn-recall"
                                    id="recall_5"
                                    // onclick="TopMenuHandler.recall('5')"
                                  >
                                    Recall
                                  </button>
                                </dd>
                              </dl>
                              <dl id="tempDl" className="wallet-detail-content">
                                <dt id="vendorTitle_4">Sky Trader Balance</dt>
                                <dd className="wallet-balance-num">
                                  <span
                                    className="badge-currency"
                                    id="vendorCurrency_4"
                                  >
                                    PTH
                                  </span>
                                  <span id="vendorBalance_4">0</span>
                                </dd>
                                <dd className="wallet-recall">
                                  <button
                                    className="btn-recall"
                                    id="recall_4"
                                    //  onclick="TopMenuHandler.recall('4')"
                                  >
                                    Recall
                                  </button>
                                </dd>
                              </dl>
                              <dl
                                id="recallAllDl"
                                className="wallet-detail-content"
                              >
                                <dd className="text_right">
                                  <button
                                    className="btn-recall"
                                    id="recallAll"
                                    // onclick="TopMenuHandler.recall('1,3,5')"
                                  >
                                    Recall All
                                  </button>
                                </dd>
                              </dl>
                            </div>
                            <div
                              id="walletTemp"
                              className="wallet-detail-group"
                              style={{ display: "none" }}
                            >
                              <dl id="tempDl" className="wallet-detail-content">
                                <dt id="vendorTitle">Housie Balance</dt>
                                <dd className="wallet-balance-num">
                                  <span
                                    className="badge-currency"
                                    id="vendorCurrency"
                                  >
                                    USD
                                  </span>
                                  <span id="vendorBalance">$ 0.00</span>
                                </dd>
                                <dd className="wallet-recall">
                                  <button className="btn-recall" id="recall">
                                    Recall
                                  </button>
                                </dd>
                              </dl>
                              <dl
                                id="recallAllDl"
                                className="wallet-detail-content"
                              >
                                <dd className="text_right">
                                  <button className="btn-recall" id="recallAll">
                                    Recall All
                                  </button>
                                </dd>
                              </dl>
                            </div>
                            <div className="btn-box">
                              <button
                                className="btn"
                                onClick={() =>
                                  (window.location.href =
                                    "javascript:history.back();")
                                }
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>

                        <p
                          className="loading-bar"
                          id="menuRefreshLoading"
                          style={{ display: "none" }}
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </p>
                      </a>
                      {/* <a id="menuRefresh" className="a-refresh" onClick={() => window.location.reload()} title="Refresh Main Wallet"> */}
                      <a
                        id="menuRefresh"
                        className="a-refresh"
                        onClick={() => getBalance()}
                        title="Refresh Main Wallet"
                      >
                        <span />
                      </a>
                    </li>

                    <li className="account">
                      <a
                        id="accountPopup"
                        style={styleObjectGetBGasColor(
                          domainDetails?.colorSchema
                        )}
                        onClick={() => setMenuActive(!menuActive)}
                      >
                        My Account
                      </a>

                      <ul
                        id="account_pop"
                        onClick={() => setMenuActive(!menuActive)}
                        style={{ display: `${menuActive ? "block" : "none"}` }}
                      >
                        <li>
                          <h4>
                            {headerOptions?.user_name}
                            <span className="gmt" title="Time Zone">
                              GMT+5:30
                            </span>
                          </h4>
                        </li>

                        <li>
                          <Link to="/profile" replace={true}>
                            My Profile
                          </Link>
                        </li>
                        {/* 
                                        <li>
                                            <a href="/#" target="_self">Balance Overview
                                            </a>
                                        </li> */}

                        <li>
                          <Link to="/user/account-statement/" replace={true}>
                            Account Statement{" "}
                          </Link>
                        </li>

                        <li>
                          <Link to="/user/mybet/" replace={true}>
                            My Bets{" "}
                          </Link>
                        </li>

                        <li>
                          <Link to="/user/bethistory/" replace={true}>
                            Bets History{" "}
                          </Link>
                        </li>

                        {/* <li>
                                            <a href="/#" replace={true}>Profit &amp; Loss
                                            </a>
                                        </li> */}

                        <li>
                          <Link to="/user/activity-log/" replace={true}>
                            Activity Log{" "}
                          </Link>
                        </li>

                        <li>
                          <Link to={"d-w"} replace={true}>
                            {" "}
                            <b>Deposit/Withdraw wallet</b>{" "}
                          </Link>
                        </li>

                        <li className="logout" onClick={(e) => HandleLogOut(e)}>
                          <a id="logout">
                            LOGOUT
                            <span />
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li>
                      <a
                        className="a-setting frntStng ui-link"
                        href="#"
                        title="Setting"
                        onClick={() => setOpenSetting(!OpenSetting)}
                      >
                        <img className="img" src={yelloImage} />
                      </a>
                      <StakePopup
                        setOpenSetting={setOpenSetting}
                        OpenSetting={OpenSetting}
                      />
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div
              className={`header_wrp_r ${
                window.location.pathname.split("/")[1] === "user" ? "user" : ""
              }`}
            >
              {/* {
                                cookies.get('skyTokenFront') ?
                                    <>
                                        {window.location.pathname.split('/').length > 3 &&
                                            <a id="openTV" className={`a-open_tv ui-link ${liveTv ? 'close_tv' : ''}`} onClick={() => setLiveTv(!liveTv)}>
                                                <div />
                                            </a>
                                        }
                                        <a id="openBetsBtn" className={`a-open_bets ui-link ${window.location.pathname.split('/').length < 3 ? 'ml-0' : ''}`} style={styleObjectGetBGasColor(domainDetails?.colorSchema)} onClick={() => onBetHistoryClick()} href="#"><img src={transparent} />Bets</a>

                                    </>
                                    :
                                    <div className="header_wrp_l_logo">
                                        <img src={getImageUrl(domainDetails?.logo)} alt="logo" />
                                    </div>
                            } */}
              {!isAuthenticated && !cookies.get("skyTokenFront") ? (
                <>
                  <div className="header_wrp_l_logo">
                    <img src={getImageUrl(domainDetails?.logo)} alt="logo" onClick={()=> window.location.href = "/"}/>
                  </div>
                  <ul className="login-wrap d_flex ">
                    <li className="user error">
                      <input
                        id="loginName"
                        value={formData.user_name}
                        onChange={(e) => handelInputChange(e)}
                        name="user_name"
                        type="text"
                        placeholder="Username"
                      />
                      <span className="error" style={{ color: "red" }}>
                        {Validator.current.message(
                          "user_Name",
                          formData.user_name,
                          "required"
                        )}
                      </span>
                    </li>
                    <li>
                      <div style={{ position: "relative" }}>
                        <input
                          id="password"
                          value={formData.password}
                          onChange={(e) => handelInputChange(e)}
                          type={showPass ? "text" : "password"}
                          name="password"
                          placeholder="Password"
                          style={{ paddingRight: "30px" }}
                        />
                        <span
                          onClick={() => setShowPass(!showPass)}
                          style={{
                            position: "absolute",
                            right: "5px",
                            top: "50%",
                            transform: "translate(0, -50%)",
                          }}
                        >
                          <img
                            style={{ width: "15px", cursor: "pointer" }}
                            src={
                              showPass
                                ? "./images/eye_close.png"
                                : "./images/eye.png"
                            }
                            alt=""
                          />
                        </span>
                      </div>
                      <span className="error" style={{ color: "red" }}>
                        {Validator.current.message(
                          "password",
                          formData.password,
                          "required"
                        )}
                      </span>
                    </li>
                    {isCaptcha !== "false" && (
                      <li className="valid-code">
                        <input
                          id="validCode"
                          type="text"
                          onChange={(e) => handelInputChange(e)}
                          value={formData.validationCode}
                          name="validationCode"
                          placeholder="Validation"
                          maxLength={4}
                        />
                        <h3>{confirmationCode}</h3>
                        {/* <img id="authenticateImage" src="https://bxawscf.skyexchange.com/verifycode.gr?v=1666603469424" /> */}
                      </li>
                    )}
                    <li>
                      <input id="valid" name="valid" type="hidden" value="" />
                    </li>
                    <li>
                      <a
                        id="loginBtn"
                        className="btn-login"
                        onClick={(e) => handelSubmit(e)}
                      >
                        Login
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="11"
                        >
                          <path
                            d="M5.71 7.706l1.432-1.604H1.778V4.898h5.39L5.71 3.294l.781-.86L9.278 5.5 6.49 8.565l-.78-.86zM1.12 0C.825 0 .564.124.339.372a1.24 1.24 0 0 0-.339.86v8.536c0 .325.113.611.339.86.225.248.486.372.78.372H8.88c.295 0 .556-.124.781-.372a1.24 1.24 0 0 0 .339-.86V7.333H8.88v2.435H1.12V1.232h7.76v2.435H10V1.232a1.24 1.24 0 0 0-.339-.86C9.436.124 9.175 0 8.881 0H1.12z"
                            fill="#FFF"
                            fillRule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                    {homeData?.signup === true && isSignUp === "true" && (
                      <li>
                        <a
                          className="btn-signup"
                          href={domainDetails?.agentListUrl}
                          target="_blank"
                        >
                          Sign-Up
                        </a>
                      </li>
                    )}
                  </ul>
                  <ul className="login-wrap d_flex mobile_login ">
                    {homeData?.signup === true && isSignUp === "true" && (
                      <li>
                        <a
                          className="btn-signup"
                          href={domainDetails?.agentListUrl}
                          target="_blank"
                        >
                          Sign-Up
                        </a>
                      </li>
                    )}
                    <li>
                      {" "}
                      <a id="loginBtn" href="/login" className="btn-login">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: "5px" }}
                          width="17"
                          height="17"
                          viewBox="0 0 17 17"
                        >
                          <path
                            fill="rgb(255,255,255)"
                            fillRule="evenodd"
                            d="M11.797 11.65c2.342.338 4.072 1.702 4.51 2.1C16.74 14.148 17 17 17 17H0s-.03-2.314.744-3.25c.437-.398 1.81-1.762 4.153-2.1 2.326-.322 1.616-2.774 1.696-2.743.08.045-.016-.522-.016-.522S4.88 6.837 4.897 5.442c.032-1.41 0-2.132 0-2.132S5.17 0 7.563 0l1.34.614c2.15 0 2.505 2.696 2.505 2.696v2.33S11.134 7.62 9.792 8.34c0 0-.096.57-.015.52.08-.03-.307 2.47 2.02 2.792z"
                          />
                        </svg>
                        Login
                      </a>
                    </li>
                  </ul>
                </>
              ) : (
                <ul className="account-wrap">
                  <li className="tv_bets" >
                    {window.location.pathname.split("/").length > 3 &&
                      window.location.pathname.split("/")[1] ===
                        "multimarket" && (
                        <a
                          id="openTV"
                          className={`a-open_tv ui-link ${
                            MY_TV_FLAG ? "close_tv" : ""
                          }`}
                          onClick={() => setOpenTvFlag()}
                        >
                          <div />
                        </a>
                      )}
                    <a
                      id="openBetsBtn"
                      className={`a-open_bets ui-link ${
                        window.location.pathname.split("/").length < 3
                          ? "ml-0"
                          : ""
                      }`}
                      style={styleObjectGetBGasColor(
                        domainDetails?.colorSchema, false, true
                      )}
                      onClick={() => onBetHistoryClick()}
                      href="#"
                    >
                      <img id={domainDetails?.colorSchema === "yellow-yellow" ? "openBetsBtn_white":""}  src={transparent} />
                      <span>Bets</span>
                    </a>
                  </li>
                  <li className="main-wallet">
                    <a
                      id="multiWallet"
                      href="#multiBalancePop"
                      className="a-wallet"
                    >
                      <ul id="accountCredit d_flex">
                        {!isLoadding ? (
                          <>
                            <li
                              style={styleObjectGetBGasColor(
                                domainDetails?.colorSchema, false, true
                              )}
                            >
                              <span>Main </span>
                              <span
                                style={{ fontWeight: "bolder" }}
                                id="betCredit"
                              >
                                {domainDetails?.currency
                                  ? `${domainDetails?.currency} `
                                  : "PTH "}
                                  {balance}
                              </span>
                            </li>
                            <li
                              style={styleObjectGetBGasColor(
                                domainDetails?.colorSchema, false, true
                              )}
                            >
                              <span>Exposure</span>{" "}
                              <span
                                className={`exposures ${
                                  exposures > 0 ? "active" : ""
                                }`}
                                id="totalExposure"
                                style={styleObjectGetBGasColor(
                                  domainDetails?.colorSchema, false, true
                                )}
                              >
                                {Math.abs(exposures)}
                              </span>
                            </li>
                            {/* <li className="nums">+<span id="vendorQuantity">4</span></li> */}
                          </>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="100px"
                            height="40px"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="xMidYMid"
                          >
                            <g transform="translate(20 50)">
                              <circle
                                cx="0"
                                cy="0"
                                r="6"
                                fill={
                                  getTheme(domainDetails?.colorSchema)
                                    ?.headerTextColor
                                }
                              >
                                <animateTransform
                                  attributeName="transform"
                                  type="scale"
                                  begin="-0.375s"
                                  calcMode="spline"
                                  keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                  values="0;1;0"
                                  keyTimes="0;0.5;1"
                                  dur="1s"
                                  repeatCount="indefinite"
                                ></animateTransform>
                              </circle>
                            </g>
                            <g transform="translate(40 50)">
                              <circle
                                cx="0"
                                cy="0"
                                r="6"
                                fill={
                                  getTheme(domainDetails?.colorSchema)
                                    ?.headerTextColor
                                }
                              >
                                <animateTransform
                                  attributeName="transform"
                                  type="scale"
                                  begin="-0.25s"
                                  calcMode="spline"
                                  keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                  values="0;1;0"
                                  keyTimes="0;0.5;1"
                                  dur="1s"
                                  repeatCount="indefinite"
                                ></animateTransform>
                              </circle>
                            </g>
                            <g transform="translate(60 50)">
                              <circle
                                cx="0"
                                cy="0"
                                r="6"
                                fill={
                                  getTheme(domainDetails?.colorSchema)
                                    ?.headerTextColor
                                }
                              >
                                <animateTransform
                                  attributeName="transform"
                                  type="scale"
                                  begin="-0.125s"
                                  calcMode="spline"
                                  keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                  values="0;1;0"
                                  keyTimes="0;0.5;1"
                                  dur="1s"
                                  repeatCount="indefinite"
                                ></animateTransform>
                              </circle>
                            </g>
                            <g transform="translate(80 50)">
                              <circle
                                cx="0"
                                cy="0"
                                r="6"
                                fill={
                                  getTheme(domainDetails?.colorSchema)
                                    ?.headerTextColor
                                }
                              >
                                <animateTransform
                                  attributeName="transform"
                                  type="scale"
                                  begin="0s"
                                  calcMode="spline"
                                  keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
                                  values="0;1;0"
                                  keyTimes="0;0.5;1"
                                  dur="1s"
                                  repeatCount="indefinite"
                                ></animateTransform>
                              </circle>
                            </g>
                          </svg>
                        )}
                      </ul>
                      <div
                        className="nums"
                        style={styleObjectGetBorderColor(
                          domainDetails?.colorSchema, true
                        )}
                      >
                        <span
                          id="vendorQuantity"
                          style={styleObjectGetBGasColor(
                            domainDetails?.colorSchema, false, true
                          )}
                        >
                          +4
                        </span>
                      </div>

                      {/* show wallet */}
                      <div className="wallet-detail" id="multiBalancePop">
                        <div>
                          <div className="wallet-detail-group">
                            <dl className="wallet-detail-content">
                              <dt>Main Balance</dt>
                              <dd className="wallet-balance-num">
                                <span className="badge-currency" id="currency">
                                  {domainDetails?.currency
                                    ? domainDetails?.currency
                                    : "PTH"}
                                </span>
                                <span id="mainBalance">{balance}</span>
                              </dd>
                              <dd className="wallet-exposure">
                                Exposure{" "}
                                <span id="mainExposure">{exposures}</span>
                              </dd>
                            </dl>
                          </div>
                          <div
                            id="walletContent"
                            className="wallet-detail-group"
                          >
                            <dl id="tempDl" className="wallet-detail-content">
                              <dt id="vendorTitle_1">Casino Balance</dt>
                              <dd className="wallet-balance-num">
                                <span
                                  className="badge-currency"
                                  id="vendorCurrency_1"
                                >
                                  PTH
                                </span>
                                <span id="vendorBalance_1">0</span>
                              </dd>
                              <dd className="wallet-recall">
                                <button
                                  className="btn-recall"
                                  id="recall_1"
                                  //  onclick="TopMenuHandler.recall('1')"
                                >
                                  Recall
                                </button>
                              </dd>
                            </dl>
                            <dl id="tempDl" className="wallet-detail-content">
                              <dt id="vendorTitle_3">BPoker Balance</dt>
                              <dd className="wallet-balance-num">
                                <span
                                  className="badge-currency"
                                  id="vendorCurrency_3"
                                >
                                  PTH
                                </span>
                                <span id="vendorBalance_3">0 Points</span>
                              </dd>
                              <dd className="wallet-recall">
                                <button
                                  className="btn-recall"
                                  id="recall_3"
                                  // onclick="TopMenuHandler.recall('3')"
                                >
                                  Recall
                                </button>
                              </dd>
                            </dl>
                            <dl id="tempDl" className="wallet-detail-content">
                              <dt id="vendorTitle_5">SABA Balance</dt>
                              <dd className="wallet-balance-num">
                                <span
                                  className="badge-currency"
                                  id="vendorCurrency_5"
                                >
                                  PTH
                                </span>
                                <span id="vendorBalance_5">0</span>
                              </dd>
                              <dd className="wallet-recall">
                                <button
                                  className="btn-recall"
                                  id="recall_5"
                                  // onclick="TopMenuHandler.recall('5')"
                                >
                                  Recall
                                </button>
                              </dd>
                            </dl>
                            <dl id="tempDl" className="wallet-detail-content">
                              <dt id="vendorTitle_4">Sky Trader Balance</dt>
                              <dd className="wallet-balance-num">
                                <span
                                  className="badge-currency"
                                  id="vendorCurrency_4"
                                >
                                  PTH
                                </span>
                                <span id="vendorBalance_4">0</span>
                              </dd>
                              <dd className="wallet-recall">
                                <button
                                  className="btn-recall"
                                  id="recall_4"
                                  //  onclick="TopMenuHandler.recall('4')"
                                >
                                  Recall
                                </button>
                              </dd>
                            </dl>
                            <dl
                              id="recallAllDl"
                              className="wallet-detail-content"
                            >
                              <dd className="text_right">
                                <button
                                  className="btn-recall"
                                  id="recallAll"
                                  // onclick="TopMenuHandler.recall('1,3,5')"
                                >
                                  Recall All
                                </button>
                              </dd>
                            </dl>
                          </div>
                          <div
                            id="walletTemp"
                            className="wallet-detail-group"
                            style={{ display: "none" }}
                          >
                            <dl id="tempDl" className="wallet-detail-content">
                              <dt id="vendorTitle">Housie Balance</dt>
                              <dd className="wallet-balance-num">
                                <span
                                  className="badge-currency"
                                  id="vendorCurrency"
                                >
                                  USD
                                </span>
                                <span id="vendorBalance">$ 0.00</span>
                              </dd>
                              <dd className="wallet-recall">
                                <button className="btn-recall" id="recall">
                                  Recall
                                </button>
                              </dd>
                            </dl>
                            <dl
                              id="recallAllDl"
                              className="wallet-detail-content"
                            >
                              <dd className="text_right">
                                <button className="btn-recall" id="recallAll">
                                  Recall All
                                </button>
                              </dd>
                            </dl>
                          </div>
                          <div className="btn-box">
                            <button
                              className="btn"
                              onClick={() =>
                                (window.location.href =
                                  "javascript:history.back();")
                              }
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>

                      <p
                        className="loading-bar"
                        id="menuRefreshLoading"
                        style={{ display: "none" }}
                      >
                        <span></span> <span></span> <span></span> <span></span>{" "}
                        <span></span> <span></span> <span></span> <span></span>
                      </p>
                    </a>
                    {/* <a id="menuRefresh" className="a-refresh" onClick={() => window.location.reload()} title="Refresh Main Wallet"> */}
                    <a
                      id="menuRefresh"
                      className= {domainDetails?.colorSchema === "yellow-yellow" ? "a-refresh white":"a-refresh"} 
                      onClick={() => getBalance()}
                      title="Refresh Main Wallet"
                    >
                      <span />
                    </a>
                  </li>

                  <li className="account">
                    <a
                      id="accountPopup"
                      style={styleObjectGetBGasColor(
                        domainDetails?.colorSchema
                      )}
                      onClick={() => setMenuActive(!menuActive)}
                    >
                      My Account
                    </a>

                    <ul
                      id="account_pop"
                      onClick={() => setMenuActive(!menuActive)}
                      style={{ display: `${menuActive ? "block" : "none"}` }}
                    >
                      <li>
                        <h4>
                          {headerOptions?.user_name}
                          <span className="gmt" title="Time Zone">
                            GMT+5:30
                          </span>
                        </h4>
                      </li>

                      <li>
                        <Link to="/profile" replace={true}>
                          My Profile
                        </Link>
                      </li>
                      {/* 
                                <li>
                                    <a href="/#" target="_self">Balance Overview
                                    </a>
                                </li> */}

                      <li>
                        <Link to="/user/account-statement/" replace={true}>
                          Account Statement{" "}
                        </Link>
                      </li>

                      <li>
                        <Link to="/user/mybet/" replace={true}>
                          My Bets{" "}
                        </Link>
                      </li>

                      <li>
                        <Link to="/user/bethistory/" replace={true}>
                          Bets History{" "}
                        </Link>
                      </li>

                      {/* <li>
                                    <a href="/#" replace={true}>Profit &amp; Loss
                                    </a>
                                </li> */}

                      <li>
                        <Link to="/user/activity-log/" replace={true}>
                          Activity Log{" "}
                        </Link>
                      </li>

                      <li>
                        <Link to={"d-w"} replace={true}>
                          {" "}
                          <b>Deposit/Withdraw wallet</b>{" "}
                        </Link>
                      </li>

                      <li className="logout" onClick={(e) => HandleLogOut(e)}>
                        <a id="logout">
                          LOGOUT
                          <span />
                        </a>
                      </li>
                    </ul>
                  </li>

                  <li>
                    <a
                      className="a-setting frntStng ui-link"
                      href="#"
                      title="Setting"
                      onClick={() => setOpenSetting(!OpenSetting)}
                    >
                      <img className="img" src={domainDetails?.colorSchema === "yellow-yellow" ? whiteSetingImage:yelloImage} />
                       
                    </a>
                    <StakePopup
                      setOpenSetting={setOpenSetting}
                      OpenSetting={OpenSetting}
                    />
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        <div
          className="menu_part"
          style={styleObjectGetBG(domainDetails?.colorSchema)}
        >
          <ul>
            {headerOption.map((item, i) => {
              if (!item.hasAccess) return false;
              if (item.name === "Casino" && !cookies.get("skyTokenFront"))
                return false;
              return (
                <li key={i}>
                  {["Cricket", "Soccer", "Tennis", "E-Soccer", "basketBall"].includes(item.name) ? (
                    <Link
                      style={styleObjectGetColor(domainDetails?.colorSchema)}
                      className={`${
                        item.subOption.length > 0 ? "menu-drop" : ""
                      } ${
                        window.location.pathname === item.link ? "selected" : ""
                      }`}
                      to={item.link}
                    >
                      {item.name}
                      {item.name === "Cricket" && matchCount && (
                        <span id="tagLive" className="tag-live">
                          <strong></strong>
                          {matchCount.cricket}
                        </span>
                      )}
                      {item.name === "Soccer" && matchCount && (
                        <span id="tagLive" className="tag-live">
                          <strong></strong>
                          {matchCount.soccer}
                        </span>
                      )}
                      {item.name === "Tennis" && matchCount && (
                        <span id="tagLive" className="tag-live">
                          <strong></strong>
                          {matchCount.tennis}
                        </span>
                      )}
                      {item.name === "E-Soccer" && (
                        <span id="tagLive" className="tag-live">
                          <strong></strong>{matchCount?.eSoccer}
                        </span>
                      )}
                      {item.name === "Kabaddi" && (
                        <span id="tagLive" className="tag-live">
                          <strong></strong>0
                        </span>
                      )}
                      {item.name === "basketBall" && (
                        <span id="tagLive" className="tag-live">
                          <strong></strong>{matchCount?.basketBall}
                        </span>
                      )}
                    </Link>
                  ) : item.name === "Casino" && cookies.get("skyTokenFront") ? (
                    <a
                      style={styleObjectGetColor(domainDetails?.colorSchema)}
                      className={`${
                        item.subOption.length > 0 ? "menu-drop" : ""
                      } ${
                        window.location.pathname === item.link ? "selected" : ""
                      } ${item.name === "Casino" ? "casino_class" : ""}`}
                      onClick={() => getCasinoLink()}
                    >
                      {item.name}
                      {item.name === "Casino" ? (
                        <img
                          style={{ width: "20px" }}
                          src="/images/card-game.svg"
                        />
                      ) : (
                        ""
                      )}
                    </a>
                  ) : (
                    <a
                      style={styleObjectGetColor(domainDetails?.colorSchema)}
                      className={`${
                        item.subOption.length > 0 ? "menu-drop" : ""
                      } ${
                        window.location.pathname === item.link ? "selected" : ""
                      }`}
                      href={item.link}
                    >
                      {item.name}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          <ul className="setting-wrap">
            {/* {cookies.get('skyTokenFront') && <li>
                            <Link to={'d-w'}>
                                <b>Deposit/Withdraw wallet</b>
                            </Link>
                        </li>} */}
            <li
              style={styleObjectGetColor(DD?.colorSchema)}
              className="time_zone"
            >
              <span>Time Zone :</span> GMT+6.00
            </li>
            <li>
              <a
                id="oneClickSetting"
                className={`one_click ${oneClickActive ? "active" : ""}`}
                style={styleObjectGetBGasColor(
                  domainDetails?.colorSchema,
                  true
                )}
              >
                {" "}
                <input
                  type="checkbox"
                  name=""
                  id=""
                  style={{ margin: 0 }}
                />{" "}
                One Click Bet{" "}
              </a>
            </li>{" "}
            {/* onClick={() => handleOneclick()} */}
            <li>
              <a
                id="slipSet"
                className="setting"
                onClick={() => handleSetting()}
              >
                Setting <img src="/images/setting.svg" />
              </a>
            </li>
          </ul>
        </div>
        {window.location.pathname.split("/")[1] !== "user" && (
          <div className="mobilemenu">
            <nav>
              <ul>
                <li id="mini" className="game-nav">
                  <a onClick={() => getCasinoLink(true)} className="ui-link">
                    <img
                      className="icon-promote"
                      src="/images/promot.gif"
                      alt="mini"
                    />
                  </a>
                </li>
                <li
                  className={
                    ["/cricket", "/soccer", "/tennis"].includes(
                      window.location.pathname
                    )
                      ? "main-nav select"
                      : ""
                  }
                >
                  <Link className="" to="/cricket">
                    <img
                      className="icon-sports"
                      src="/images/Sports.svg"
                      alt="Sports"
                    />
                    Sports
                  </Link>
                </li>
                <li
                  className={
                    ["/in-play"].includes(window.location.pathname)
                      ? "main-nav select"
                      : ""
                  }
                >
                  <Link className="" to="/in-play">
                    <img
                      className="icon-inplay"
                      src="/images/menu-In-Plan.svg"
                      alt="In-Play"
                    />
                    In-Play
                  </Link>
                </li>
                <li
                  className={
                    window.location.pathname === "/" ||
                    window.location.pathname === "/#"
                      ? "main-nav select"
                      : ""
                  }
                >
                  <a className="" onClick={()=> navigate('/')}>
                    <img
                      className="icon-home"
                      src="/images/Home.svg"
                      alt="Home"
                    />
                    Home
                  </a>
                </li>
                <li
                  className={
                    ["/multimarket"].includes(window.location.pathname)
                      ? "main-nav select"
                      : ""
                  }
                >
                  <a className="multi_market" href="/multimarket">
                    <img
                      className="icon-pin"
                      src="/images/Multi-Markets.svg"
                      alt="Multi Markets"
                    />
                    Multi Markets
                  </a>
                </li>
                <li
                  className={
                    ["/myAccount", "/user"].includes(window.location.pathname)
                      ? "main-nav select"
                      : ""
                  }
                >
                  <a
                    href="/myAccount"
                    data-bs-toggle="modal"
                    data-bs-target="#myLoginModalFront"
                  >
                    <img
                      className="icon-account"
                      src="/images/Account.svg"
                      alt="Account"
                    />
                    Account
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {window.location.pathname.split("/")[1] === "user" && (
        <div className="header foruser">
          <div
            className="menu_part"
            style={styleObjectGetBG(domainDetails?.colorSchema)}
          >
            <ul>
              {headerOption.map((item, i) => {
                if (!item.hasAccess) return false;
                if (item.name === "Casino" && !cookies.get("skyTokenFront"))
                  return false;
                return (
                  <li key={i}>
                    {["Cricket", "Soccer", "Tennis","basketBall","E-Soccer"].includes(item.name) ? (
                      <Link
                        style={styleObjectGetColor(domainDetails?.colorSchema)}
                        className={`${
                          item.subOption.length > 0 ? "menu-drop" : ""
                        } ${
                          window.location.pathname === item.link
                            ? "selected"
                            : ""
                        }`}
                        to={item.link}
                      >
                        {item.name}
                        {item.name === "Cricket" && matchCount && (
                          <span id="tagLive" className="tag-live">
                            <strong></strong>
                            {matchCount.cricket}
                          </span>
                        )}
                        {item.name === "Soccer" && matchCount && (
                          <span id="tagLive" className="tag-live">
                            <strong></strong>
                            {matchCount.soccer}
                          </span>
                        )}
                        {item.name === "Tennis" && matchCount && (
                          <span id="tagLive" className="tag-live">
                            <strong></strong>
                            {matchCount.tennis}
                          </span>
                        )}
                        {item.name === "E-Soccer" && (
                          <span id="tagLive" className="tag-live">
                            <strong></strong>{matchCount?.eSoccer}
                          </span>
                        )}
                        {item.name === "Kabaddi" && (
                          <span id="tagLive" className="tag-live">
                            <strong></strong>0
                          </span>
                        )}
                        {item.name === "basketBall" && (
                        <span id="tagLive" className="tag-live">
                          <strong></strong>{matchCount?.basketBall}
                        </span>
                      )}
                      </Link>
                    ) : item.name === "Casino" &&
                      cookies.get("skyTokenFront") ? (
                      <a
                        style={styleObjectGetColor(domainDetails?.colorSchema)}
                        className={`${
                          item.subOption.length > 0 ? "menu-drop" : ""
                        } ${
                          window.location.pathname === item.link
                            ? "selected"
                            : ""
                        } ${item.name === "Casino" ? "casino_class" : ""}`}
                        onClick={() => getCasinoLink()}
                      >
                        {item.name}
                        {item.name === "Casino" ? (
                          <img
                            style={{ width: "20px" }}
                            src="/images/card-game.svg"
                          />
                        ) : (
                          ""
                        )}
                      </a>
                    ) : (
                      <a
                        style={styleObjectGetColor(domainDetails?.colorSchema)}
                        className={`${
                          item.subOption.length > 0 ? "menu-drop" : ""
                        } ${
                          window.location.pathname === item.link
                            ? "selected"
                            : ""
                        }`}
                        href={item.link}
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>

            <ul className="setting-wrap">
              {/* {cookies.get('skyTokenFront') && <li>
                            <Link to={'d-w'}>
                                <b>Deposit/Withdraw wallet</b>
                            </Link>
                        </li>} */}
              <li
                style={styleObjectGetColor(DD?.colorSchema)}
                className="time_zone"
              >
                <span>Time Zone :</span> GMT+6.00
              </li>
              <li>
                <a
                  id="oneClickSetting"
                  className={`one_click ${oneClickActive ? "active" : ""}`}
                  style={styleObjectGetBGasColor(
                    domainDetails?.colorSchema,
                    true
                  )}
                >
                  {" "}
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    style={{ margin: 0 }}
                  />{" "}
                  One Click Bet{" "}
                </a>
              </li>{" "}
              {/* onClick={() => handleOneclick()} */}
              <li>
                <a
                  id="slipSet"
                  className="setting"
                  onClick={() => handleSetting()}
                >
                  Setting <img src="/images/setting.svg" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {OpenModal && (
        <div
          className={`login popup-wrp fade ${OpenModal ? "popup-show " : ""}`}
        >
          <div className="pop">
            <div className="pop-content">
              <div className="pop-head">
                <div
                  className="pop-close"
                  onClick={() => setOpenModal(true)}
                ></div>
              </div>
              <div className="pop-body">
                <Login OpenModal={OpenModal} setOpenModal={setOpenModal} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
