import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl, Logout } from "../common/Funcation";
import { styleObjectGetBG, styleObjectGetColor } from "../common/StyleSeter";
import logoutArrow from "../assets/images/logout-arrow.svg";
import { Helmet } from "react-helmet";
import NewsLine from "./NewsLine";
import "../styles/components/_sidebar.scss";
// import useSound from "use-sound";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    return () => { };
  }, [PaymentCount]);
  useEffect(() => {
    setBalance(balance);
    return () => { };
  }, [balanceData]);

  useEffect(() => {
    setHeaderOptions(HeaderData);
    return () => { };
  }, [HeaderData]);

  useEffect(() => {
    setDomainDetails(DD);
    return () => { };
  }, [DD]);

  useEffect(() => {
    return () => { };
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
      <div className="header-top-bar">
        <div className="header_wrp_l">
          <h2 className="page-title">
            {location.pathname === "/" ? "Downline List" : ""}
            {location.pathname === "/profile" ? "My Account" : ""}
            {location.pathname === "/bet-live" ? "Bet ListLive" : ""}
            {location.pathname === "/betList" ? "Bet List" : ""}
            {location.pathname === "/risk-management" ? "Risk Management" : ""}
            {location.pathname === "/bankingMethod" ? "Banking Method" : ""}
            {location.pathname === "/block-market" ? "Block Market" : ""}
            {location.pathname === "/add-match" ? "Add Match" : ""}
            {location.pathname === "/AdminSetting" ? "Admin Setting" : ""}
            {location.pathname === "/ComPayments" ? "Company Payments" : ""}
            {location.pathname === "/AsetResult" ? "Result" : ""}
          </h2>
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
            <li className="role-box">
              <span className="dark-label">{headerOptions.name || "admin"}</span>
              <strong className="dark-text" style={{ marginLeft: "8px" }}>
                {headerOptions.user_name || ""}
              </strong>
            </li>

            <li className="main-wallet-box">
              <span className="dark-label">Main</span>
              <strong className="dark-text" id="mainBalance" style={{ marginLeft: "8px" }}>
                {domainDetails?.currency ? domainDetails?.currency : "PTH"} {balanceData}
              </strong>
            </li>

            <li className="refresh-box">
              <button
                id="topRefresh"
                onClick={() => window.location.reload()}
                className="dark-button sq-btn"
                title="Refresh"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.25 1.64" />
                </svg>
              </button>
            </li>

            <li className="logout-box" onClick={(e) => HandleLogOut(e)}>
              <button
                id="logout"
                className="dark-button logout-button"
              >
                Logout
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px" }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;
