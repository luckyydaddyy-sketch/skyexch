import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getImageUrl, Logout } from "../common/Funcation";
import { styleObjectGetBG, styleObjectGetColor } from "../common/StyleSeter";
import logoutArrow from "../assets/images/logout-arrow.svg";
import { Helmet } from "react-helmet";
import NewsLine from "./NewsLine";
// import useSound from "use-sound";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const HeaderData = useSelector((e: any) => e.Header);
  const PaymentCount = useSelector((e: any) => e.PaymentCount);
  const balanceData = useSelector((e: any) => e.balance);
  const DD = useSelector((e: any) => e.domainDetails);
  const [domainDetails, setDomainDetails] = useState(DD);
  const [balance, setBalance] = useState(balanceData);
  const [headerOptions, setHeaderOptions] = useState(HeaderData);
  const [paymentCounters, setPaymentCounters] = useState(PaymentCount);
  const [PlayNotification, setPlayNotification] = useState(false);
  const [audio, setAudio] = useState<any>(null);
  console.log("headerOptions :: ", headerOptions);
  // const [play] = useSound("../../images/music/notification.wav");

  // useEffect(() => {
  //   console.log(
  //     "headerOptions?.depositeCount > 0 : ",
  //     headerOptions?.depositeCount > 0
  //   );
  //   console.log(
  //     "headerOptions?.withdrawaCount > 0 : ",
  //     headerOptions?.withdrawaCount > 0
  //   );
  //   setTimeout(() => {
  //     if (headerOptions?.depositeCount > 0) {
  //       play();
  //     } else if (headerOptions?.withdrawaCount > 0) {
  //       play();
  //     }
  //   }, 2000);
  // }, [headerOptions]);
  useEffect(() => {
    const sound = new Audio("../../images/music/notification.wav");
    setAudio(sound);
    // sound.play().then(() => {
    //   // setIsAudioAllowed(true);
    // }).catch(err => console.log("User must interact first:", err));

    // setInterval(() => {
    //   if (audio) {
    //     audio
    //       .play()
    //       .then(() => {
    //         // setIsAudioAllowed(true);
    //       })
    //       .catch((err: any) => console.log("User must interact first:", err));
    //   }
    // }, 2000);
  }, []);

  useEffect(() => {
    if (
      paymentCounters?.depositeCount + paymentCounters?.withdrawaCount <
      PaymentCount?.depositeCount + PaymentCount?.withdrawaCount
    ) {
      setPlayNotification(true);
      // setTimeout(() => {
      //   setPlayNotification(false);
      // }, 2000);
      if (audio) {
        audio
          .play()
          .then(() => {
            // setIsAudioAllowed(true);
          })
          .catch((err: any) => console.log("User must interact first:", err));
      }
    } else if (
      paymentCounters?.depositeCount + paymentCounters?.withdrawaCount >
      0
    ) {
      setPlayNotification(true);
      if (audio) {
        audio
          .play()
          .then(() => {
            // setIsAudioAllowed(true);
          })
          .catch((err: any) => console.log("User must interact first:", err));
      }
    } else if (
      paymentCounters?.depositeCount + paymentCounters?.withdrawaCount ===
      0
    ) {
      setPlayNotification(false);
    }
    setPaymentCounters(PaymentCount);
    console.log("set new Count: ", PaymentCount);

    const audioElement = document.getElementById("notificationSound");
    if (audioElement)
      audioElement.addEventListener("ended", function () {
        console.log("Audio has finished playing.");
        setPlayNotification(false);
        // You can perform other actions here once the audio is done
      });
    return () => {};
  }, [PaymentCount]);
  useEffect(() => {
    setBalance(balance);
    return () => {};
  }, [balanceData]);

  useEffect(() => {
    setHeaderOptions(HeaderData);
    return () => {};
  }, [HeaderData]);

  useEffect(() => {
    setDomainDetails(DD);
    return () => {};
  }, [DD]);

  useEffect(() => {
    return () => {};
  }, [window.location.pathname]);

  const checkResultOption = () =>
    headerOptions.sports_main_market || headerOptions.manage_fancy;

  const checkSettingOption = () => {
    if (
      headerOptions.sports_main_market ||
      headerOptions.match_history ||
      headerOptions.manage_fancy ||
      headerOptions.fancy_history ||
      headerOptions.manage_premium ||
      headerOptions.premium_history ||
      headerOptions.manage_website ||
      headerOptions.casino_manage ||
      headerOptions.manage_dashboard_images ||
      headerOptions?.b2c_contact_seting ||
      headerOptions.banner
    )
      return true;
    else return false;
  };
  const checkSelected = (link: string) => {
    if (window.location.pathname.includes(link)) return true;
    else return false;
  };

  const checkSelectedMulti = (links: any) => {
    if (links.includes(window.location.pathname)) return true;
    else return false;
  };

  const [headerOption] = useState([
    {
      name: "Downline List",
      hasAccess: headerOptions.downline_list,
      link: "/",
      subOption: [],
    },
    {
      name: "My Account",
      selected: checkSelected("/profile"),
      hasAccess: headerOptions.my_account,
      link: "/profile",
      subOption: [],
    },
    {
      name: "My Report",
      selected: checkSelectedMulti([
        "/loss/down-line",
        "/loss/market",
        "/account/statement",
        "report/DW",
        "report/DWDaily",
      ]),
      hasAccess: true,
      link: "",
      subOption: [
        {
          name: "Profit/Loss Report by Down line",
          hasAccess: headerOptions.downline_report,
          link: "/loss/down-line",
        },
        {
          name: "Profit/Loss Report by Market",
          hasAccess: headerOptions.market_report,
          link: "/loss/market",
        },
        {
          name: "Account Statement",
          hasAccess: headerOptions.account_statement,
          link: "/account/statement",
        },
        // {
        //   name: "Deposit and withdraw",
        //   hasAccess: headerOptions?.onlinePaymentWithdrawals_report,
        //   link: "/report/DW",
        // },
        {
          name: "Online Deposit and withdraw",
          hasAccess: headerOptions?.onlinePaymentWithdrawals_report,
          link: "/report/DWDaily",
        },
        { name: "Match Profit Loss", hasAccess: 1, link: "/loss/match" },
        {
          name: "Profit/Loss Report by Casino",
          hasAccess:
            headerOptions.casinoReport || headerOptions?.casinoReport !== 0,
          link: "/loss/casino",
        },
        { name: "SABA P/L Downline Monthly", hasAccess: 1, link: "/loss/saba" },
      ],
    },
    {
      name: "Bet ListLive",
      hasAccess: headerOptions.bet_list_live,
      link: "/bet-live",
      subOption: [],
    },
    {
      name: "Bet List",
      hasAccess: headerOptions.bet_list,
      link: "/betList",
      subOption: [],
    },
    {
      name: "Risk Management",
      hasAccess: headerOptions.risk_management,
      link: "/risk-management",
      subOption: [],
    },
    // {
    //   name: 'Risk Management', selected: checkSelectedMulti(['/Ariskmanagement']), hasAccess: headerOptions.risk_management, link: '', subOption: [
    //     { name: 'Sports Risk Management', hasAccess: headerOptions.downline_report, link: '/Ariskmanagement' },
    //     { name: 'Casino Risk Management', hasAccess: headerOptions.market_report, link: '/ACasRiskMgmt' },
    //   ]
    // },
    // { name: 'Casino live', hasAccess: headerOptions.casino_manage, link: '', subOption: [], },
    {
      name: "Banking",
      hasAccess: headerOptions.agent_banking || headerOptions.player_banking,
      link: headerOptions.agent_banking ? "/agent/banking" : "/player/banking",
      subOption: [],
    },
    // {
    //   name: 'Banking', selected: checkSelectedMulti(['/master/banking', '/player/banking', '/agent/banking', '/bankingMethod']), hasAccess: true, link: '', subOption: [
    //     { name: 'Master Banking', hasAccess: headerOptions.add_balance, link: '/master/banking', },
    //     { name: 'Player Banking', hasAccess: headerOptions.player_banking, link: '/player/banking', },
    //     { name: 'Agent Banking', hasAccess: headerOptions.agent_banking, link: '/agent/banking', },
    //     { name: 'Banking Method', hasAccess: (headerOptions?.bankingMethod || headerOptions?.bankingMethod === undefined), link: '/bankingMethod', }],
    // },

    {
      name: "Banking Method",
      hasAccess:
        headerOptions?.bankingMethod ||
        headerOptions?.bankingMethod === undefined,
      link: "/bankingMethod",
      subOption: [],
    },
    {
      name: "Block Market",
      hasAccess: headerOptions.marketBlock,
      link: "/block-market",
      subOption: [],
    },
    {
      name: "Add Match",
      hasAccess: headerOptions.sports_leage,
      link: "/add-match",
      subOption: [],
    },
    // { name: 'Sport League', hasAccess: headerOptions.sports_leage, link: '/sport-league', subOption: [], },
    {
      name: "Admin Setting",
      hasAccess: checkSettingOption(),
      link: "/AdminSetting",
      subOption: [],
    },
    {
      name: "Company Payments",
      hasAccess: checkSettingOption(),
      link: "/ComPayments",
      subOption: [],
    },
    {
      name: "Result",
      hasAccess: checkResultOption(),
      link: "/AsetResult",
      subOption: [],
    },
    {
      name: "Old Res.",
      hasAccess: headerOptions.match_history,
      link: "/Achecksportwiseresult",
      subOption: [],
    },
    {
      name: "deposit-req",
      hasAccess:
        headerOptions?.onlinePaymentWithdrawals ||
        headerOptions?.onlinePaymentDeposite ||
        headerOptions?.onlinePaymentWithdrawals !== 0 ||
        headerOptions?.onlinePaymentDeposite !== 0,
      link: "/Atransactionlist",
      subOption: [],
      isShowCount: "deposit",
    },
    {
      name: "withdrawl-req",
      hasAccess:
        headerOptions?.onlinePaymentWithdrawals ||
        headerOptions?.onlinePaymentDeposite ||
        headerOptions?.onlinePaymentWithdrawals !== 0 ||
        headerOptions?.onlinePaymentDeposite !== 0,
      link: "/AtransactionlistWithdrawl",
      subOption: [],
      isShowCount: "withdrawl",
    },
    // {
    // name: 'Setting', hasAccess: checkSettingOption(), selected: checkSelectedMulti(['/main-market', '/winner/cricket/history', '/session/cricket/declare', '/session/cricket/history', '/cricket/premium/declare', '/cricket/premium/history', '/website', '/casino', '/dashboard-images', '/banner', '/add-website', 'add-dashboard', '/add-banner']), link: '', subOption: [
    // { name: 'Sports Main Market', hasAccess: headerOptions.sports_main_market, link: '/main-market', },
    // { name: 'Match History', hasAccess: headerOptions.match_history, link: '/winner/cricket/history', },
    // { name: 'Manage Fancy', hasAccess: headerOptions.manage_fancy, link: '/session/cricket/declare', },
    // { name: 'Fancy History', hasAccess: headerOptions.fancy_history, link: '/session/cricket/history', },
    // { name: 'Manage Premium', hasAccess: headerOptions.manage_premium, link: '/cricket/premium/declare', },
    // { name: 'Manage Premium History', hasAccess: headerOptions.premium_history, link: '/cricket/premium/history', },
    // { name: 'Website Setting', hasAccess: headerOptions.manage_website, link: '/website', },
    // { name: 'Manage Casino', hasAccess: headerOptions.casino_manage, link: '/casino', },
    // { name: 'Dashboard Images', hasAccess: headerOptions.manage_dashboard_images, link: '/dashboard-images', },
    // { name: 'Banner', hasAccess: headerOptions.banner, link: '/banner', },
    // ],
    // },
    {
      name: "Online Payment",
      hasAccess:
        false /*(headerOptions?.onlinePaymentWithdrawals || headerOptions?.onlinePaymentDeposite || headerOptions?.onlinePaymentWithdrawals !== 0 || headerOptions?.onlinePaymentDeposite !== 0) */,
      selected: checkSelectedMulti(["/payment/deposit", "/payment/withdraw"]),
      subOption: [
        {
          name: "Deposit",
          hasAccess:
            headerOptions?.onlinePaymentDeposite ||
            headerOptions?.onlinePaymentDeposite !== 0,
          link: "/payment/deposit",
        },
        {
          name: "Withdraw",
          hasAccess:
            headerOptions?.onlinePaymentWithdrawals ||
            headerOptions?.onlinePaymentWithdrawals !== 0,
          link: "/payment/withdraw",
        },
      ],
    },
    {
      name: "Privileges",
      hasAccess: headerOptions.privileges,
      link: "/Privileges",
      subOption: [],
    },
  ]);

  const HandleNavigation = (path: string) => {
    if (path !== "") {
      navigate(path);
    }
  };

  const HandleLogOut = async (e: any) => {
    e.preventDefault();
    await Logout(e);
    dispatch({
      type: "AUTHENTICATION",
      payload: { isLogin: false, token: "" },
    });
    navigate("/login");
  };

  return (
    <>
      {/* {PlayNotification && (
        <audio src="../../images/music/notification.wav" autoPlay></audio>
      )} */}
      <Helmet>
        <link rel="icon" href={getImageUrl(domainDetails?.favicon)} />
        <title>{domainDetails?.title}</title>
      </Helmet>
      <div className="top">
        <div className="header">
          <div className="header_wrp_l">
            <div className="header_wrp_l_logo">
              <h1>
                {/* <div className="menu-bar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#ffffff" d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
              </div> */}
                <img
                  src={
                    domainDetails?.adminLogo && domainDetails?.adminLogo !== ""
                      ? getImageUrl(domainDetails?.adminLogo)
                      : getImageUrl(domainDetails?.logo)
                  }
                  alt="logo"
                  onClick={() => (window.location.href = "/")}
                />
              </h1>
            </div>
            <div className="header_wrp_r">
              <ul className="account-wrap">
                {(headerOptions?.onlinePaymentWithdrawals ||
                  headerOptions?.onlinePaymentDeposite ||
                  headerOptions?.onlinePaymentWithdrawals !== 0 ||
                  headerOptions?.onlinePaymentDeposite !== 0) && (
                  <>
                    {/* <button onClick={()=>play()}></button> */}
                    <li
                      className="header-count cursor-pointer"
                      style={{ cursor: "pointer" }}
                      // onClick={() => HandleNavigation("/Atransactionlist")}
                      // onClick={()=>setPlayNotification(!PlayNotification)}
                    >
                      <img
                        src="../../images/notification.png"
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                      <span style={{ backgroundColor: "red" }}>
                        {paymentCounters?.depositeCount +
                          paymentCounters?.withdrawaCount}
                      </span>
                    </li>
                    {/* <li
                      className="header-count cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        HandleNavigation("/AtransactionlistWithdrawl")
                      }
                    >
                      <img
                        src="../../images/download-up.png"
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                      <span>{headerOptions?.withdrawaCount}</span>
                    </li> */}
                  </>
                )}
                <li>
                  <span>{headerOptions.name}</span>
                  <strong className="login-user-name">
                    {headerOptions.user_name}
                  </strong>
                </li>
                <li className="main-wallet no-multi">
                  <a className="a-wallet">
                    <ul>
                      <li>
                        <span>Main</span>
                        <strong className="login-user-balance" id="mainBalance">
                          {domainDetails?.currency
                            ? domainDetails?.currency
                            : "PTH"}{" "}
                          {balanceData}
                        </strong>
                      </li>
                    </ul>
                  </a>

                  <a
                    id="topRefresh"
                    style={styleObjectGetBG(domainDetails?.colorSchema)}
                    onClick={() => window.location.reload()}
                    className="a-refresh"
                  >
                    <img src="/images/refresh.svg" alt="" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="menu_part menu-wrap"
          style={styleObjectGetBG(domainDetails?.colorSchema)}
        >
          <div className="main_wrap">
            <ul className="menu">
              {headerOption.map((item, i) => {
                if (!item.hasAccess) return false;
                return (
                  <>
                    <li
                      key={i}
                      style={item?.isShowCount ? { position: "relative" } : {}}
                    >
                      <a
                        style={styleObjectGetColor(domainDetails?.colorSchema)}
                        className={`${
                          item.subOption.length > 0 ? "menu-drop " : ""
                        } ${
                          window.location.pathname === item.link ||
                          item.selected
                            ? "selected"
                            : ""
                        }`}
                        href={item.link ? item.link : "javascript:void(0)"}
                      >
                        {item.name}
                        {item.name === "Casino live" ? (
                          <img
                            style={{ width: "20px" }}
                            src="/images/card-game.svg"
                          />
                        ) : (
                          ""
                        )}
                      </a>
                      {item.subOption.length > 0 ? (
                        <>
                          <ul className="submenudiv">
                            {item.subOption.map((subItem, i) => {
                              if (!subItem.hasAccess) return false;
                              return (
                                <li
                                  style={styleObjectGetBG(
                                    domainDetails?.colorSchema
                                  )}
                                  className={`selected ${
                                    window.location.pathname === subItem.link
                                      ? "active"
                                      : ""
                                  }`}
                                  key={i}
                                >
                                  <a
                                    className="sbmenu"
                                    style={styleObjectGetColor(
                                      domainDetails?.colorSchema
                                    )}
                                    onClick={() =>
                                      HandleNavigation(subItem.link)
                                    }
                                    href={subItem.link}
                                  >
                                    {subItem.name}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      ) : (
                        ""
                      )}
                      {item?.isShowCount && (
                        <span
                          style={{
                            borderRadius: "50%",
                            fontSize: "10px",
                            left: "80%",
                            position: "absolute",
                            top: "-32%",
                            backgroundColor: "red",
                            color: "white",
                            height: "15px",
                            lineHeight: "15px",
                            padding: "0 5px",
                            marginRight: "3px",
                          }}
                        >
                          {item?.isShowCount === "withdrawl"
                            ? paymentCounters?.withdrawaCount
                            : paymentCounters?.depositeCount}
                        </span>
                      )}
                    </li>
                  </>
                );
              })}
              <li className="logout" onClick={(e) => HandleLogOut(e)}>
                <a
                  style={styleObjectGetColor(DD?.colorSchema)}
                  id="logout"
                  href="#"
                >
                  Logout
                  <img src={logoutArrow} />
                </a>
              </li>
              <li
                style={styleObjectGetColor(DD?.colorSchema)}
                className="time_zone"
              >
                <span></span> GMT+6:00
              </li>
            </ul>
          </div>
        </div>
      </div>
      {false && (
        <>
          <div
            className="mob-black-bg"
            id="mob-black-bg"
            style={{ visibility: "visible", opacity: "1" }}
          ></div>
          <div
            className="mob-left-panel"
            id="mob-left-panel"
            style={{ left: "0" }}
          >
            {/* <ul className="panel-ul">
          <li>Downline List</li>
          <li>My Account</li>
          <li>My Report <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#ffffff" d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg></li>
          <li>Bet ListLive</li>
          <li>Bet List</li>
          <li>Risk Management</li>
          <li>Banking</li>
          <li>Banking Method</li>
          <li>Block Market</li>
          <li>Add Match</li>
          <li>Admin Setting</li>
          <li>Company Payments</li>
          <li>Result</li>
          <li>Old Res.</li>
          <li> GMT+6:00</li>
          <li>Logout</li>
        </ul> */}
            <ul className="menu panel-ul">
              {headerOption.map((item, i) => {
                if (!item.hasAccess) return false;
                return (
                  <>
                    <li
                      key={i}
                      style={item?.isShowCount ? { position: "relative" } : {}}
                    >
                      <a
                        style={styleObjectGetColor(domainDetails?.colorSchema)}
                        className={`${
                          item.subOption.length > 0 ? "menu-drop " : ""
                        } ${
                          window.location.pathname === item.link ||
                          item.selected
                            ? "selected"
                            : ""
                        }`}
                        href={item.link ? item.link : "javascript:void(0)"}
                      >
                        {item.name}

                        {item.name === "Casino live" ? (
                          <img
                            style={{ width: "20px" }}
                            src="/images/card-game.svg"
                          />
                        ) : (
                          ""
                        )}
                      </a>
                      {item.subOption.length > 0 ? (
                        <>
                          <ul className="submenudiv">
                            {item.subOption.map((subItem, i) => {
                              if (!subItem.hasAccess) return false;
                              return (
                                <li
                                  style={styleObjectGetBG(
                                    domainDetails?.colorSchema
                                  )}
                                  className={`selected ${
                                    window.location.pathname === subItem.link
                                      ? "active"
                                      : ""
                                  }`}
                                  key={i}
                                >
                                  <a
                                    className="sbmenu"
                                    style={styleObjectGetColor(
                                      domainDetails?.colorSchema
                                    )}
                                    onClick={() =>
                                      HandleNavigation(subItem.link)
                                    }
                                    href={subItem.link}
                                  >
                                    {subItem.name}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      ) : (
                        ""
                      )}
                      {item?.isShowCount && (
                        <span
                          style={{
                            borderRadius: "50%",
                            fontSize: "10px",
                            left: "80%",
                            position: "absolute",
                            top: "-32%",
                            backgroundColor: "red",
                            color: "white",
                            height: "15px",
                            lineHeight: "15px",
                            padding: "0 5px",
                            marginRight: "3px",
                          }}
                        >
                          {item?.isShowCount === "withdrawl"
                            ? paymentCounters?.withdrawaCount
                            : paymentCounters?.depositeCount}
                        </span>
                      )}
                    </li>
                  </>
                );
              })}
              <li className="logout" onClick={(e) => HandleLogOut(e)}>
                <a
                  style={styleObjectGetColor(DD?.colorSchema)}
                  id="logout"
                  href="#"
                >
                  Logout
                  <img src={logoutArrow} />
                </a>
              </li>
              <li
                style={styleObjectGetColor(DD?.colorSchema)}
                className="time_zone"
              >
                <span>GMT+6:00</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
