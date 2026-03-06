import React, { lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import Cookies from "universal-cookie";
import { ADMIN_API } from "./common/common";
import { Logout } from "./common/Funcation";
import ImageUpload from "./components/ImageUpload";
import AddEdit from "./pages/banking/method/AddEdit";
import BankingMethod from "./pages/banking/method/BankingMethod";
import ChangePassword from "./pages/ChangePassword";
import DWReport from "./pages/MyReport/DWReport";
import NotFound from "./pages/NotFound";
import Deposit from "./pages/Payment/Deposit";
import Withdraw from "./pages/Payment/Withdraw";
import RiskManagementDetail from "./pages/RiskManagement/component/RiskManagementDetail";
import EditDashBanner from "./pages/Setting/Edit/EditDashBanner";
import EditDashBoard from "./pages/Setting/Edit/EditDashBoard";
import EditWebsites from "./pages/Setting/Edit/EditWebsites";
import MangeFancy from "./pages/Setting/Edit/MangeFancy";
import MangePremium from "./pages/Setting/Edit/MangePremium";
import ManageBanner from "./pages/Setting/ManageBanner";
import ManageCasino from "./pages/Setting/ManageCasino";
import ManageDashboard from "./pages/Setting/ManageDashboard";
import ManageWebsites from "./pages/Setting/ManageWebsites";
import PremiumDeclare from "./pages/Setting/PremiumDeclare";
import PremiumHistory from "./pages/Setting/PremiumHistory";
import SessionDeclare from "./pages/Setting/SessionDeclare";
import SessionHistory from "./pages/Setting/SessionHistory";
import WinnerHistory from "./pages/Setting/WinnerHistory";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import { getApi, postApi, sendEvent, socketConnect } from "./service";
import MatchProfitLoss from "./pages/MyReport/MatchProfitLoss";
import SABADownline from "./pages/MyReport/SABADownline";

// import Home from './pages/Home'
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const LossDownLine = lazy(() => import("./pages/MyReport/LossDownlineNew"));
const DWDailyReport = lazy(() => import("./pages/MyReport/DWDailyReport"));
const LossCasino = lazy(() => import("./pages/MyReport/LossCasino"));
const LossMarket = lazy(() => import("./pages/MyReport/LossMarket"));
const AccountStatement = lazy(
  () => import("./pages/MyReport/AccountStatement")
);
const BetLive = lazy(() => import("./pages/BetLive/BetLive"));
const BetList = lazy(() => import("./pages/BetList/BetList"));
const RiskManagement = lazy(
  () => import("./pages/RiskManagement/RiskManagement")
);
const MasterBanking = lazy(() => import("./pages/banking/MasterBanking"));
const PlayerBanking = lazy(() => import("./pages/banking/PlayerBanking"));
const AgentBanking = lazy(() => import("./pages/banking/AgentBanking"));
const SportLegue = lazy(() => import("./pages/SportLegue/SportLegue"));
const MainMarket = lazy(() => import("./pages/Setting/MainMarket"));
const BlockMarket = lazy(() => import("./pages/BlockMarket/BlockMarket"));
const AddMatch = lazy(() => import("./pages/AddMatch/AddMatch"));
const AdminSetting = lazy(() => import("./pages/AdminSetting/AdminSetting"));
const Asearchusers = lazy(() => import("./pages/AdminSetting/Asearchusers"));
const AWebsiteSetting = lazy(
  () => import("./pages/AdminSetting/AWebsiteSetting")
);
const AAddWebsiteSetting = lazy(
  () => import("./pages/AdminSetting/AAddWebsiteSetting")
);
const AManageLinks = lazy(() => import("./pages/AdminSetting/AManageLinks"));
const GameUsersList = lazy(() => import("./pages/AdminSetting/gameUsersList"));
const Asurveillance = lazy(() => import("./pages/AdminSetting/Asurveillance"));
const MonitorUserPnL = lazy(
  () => import("./pages/AdminSetting/monitorUserPnL")
);
const Prematchpl = lazy(() => import("./pages/AdminSetting/prematchpl"));
const Prematchuserbet = lazy(
  () => import("./pages/AdminSetting/prematchuserbet")
);
const AMasterCheat = lazy(() => import("./pages/AdminSetting/AMasterCheat"));
const ACheatIps = lazy(() => import("./pages/AdminSetting/ACheatIps"));
const AsameIpUsers = lazy(() => import("./pages/AdminSetting/AsameIpUsers"));
const AliveMatchbets = lazy(
  () => import("./pages/AdminSetting/AliveMatchbets")
);
const AbetCount = lazy(() => import("./pages/AdminSetting/AbetCount"));
const AbetLockUsers = lazy(() => import("./pages/AdminSetting/AbetLockUsers"));
const AactiveMatch = lazy(() => import("./pages/AdminSetting/AactiveMatch"));
const WhiteLimit = lazy(() => import("./pages/AdminSetting/WhiteLimit"));
const AinactiveMatch = lazy(
  () => import("./pages/AdminSetting/AinactiveMatch")
);
const AdeletedBets = lazy(() => import("./pages/AdminSetting/AdeletedBets"));
const AupdateFancyStatus = lazy(
  () => import("./pages/AdminSetting/AupdateFancyStatus")
);
const AsuspendedResults = lazy(
  () => import("./pages/AdminSetting/AsuspendedResults")
);
const AUserMessage = lazy(() => import("./pages/AdminSetting/AUserMessage"));
const AHyperMessage = lazy(() => import("./pages/AdminSetting/AHyperMessage"));
const AImpMessage = lazy(() => import("./pages/AdminSetting/AImpMessage"));
const AImageAdd = lazy(() => import("./pages/AdminSetting/AImageAdd"));
const AdeletedUsers = lazy(() => import("./pages/AdminSetting/AdeletedUsers"));
const AsuspendedfancyResult = lazy(
  () => import("./pages/AdminSetting/AsuspendedfancyResult")
);
const AsuspendedmarketResult = lazy(
  () => import("./pages/AdminSetting/AsuspendedmarketResult")
);
const ADeafultSetting = lazy(
  () => import("./pages/AdminSetting/ADeafultSetting")
);
const DeafultContactSetting = lazy(
  () => import("./pages/AdminSetting/DeafultContactSetting")
);
const P2PSetting = lazy(() => import("./pages/AdminSetting/P2PSetting"));
const AsetResult = lazy(() => import("./pages/results/AsetResult"));
const ASetMarketResult = lazy(() => import("./pages/results/ASetMarketResult"));
const ASetFancyResult = lazy(() => import("./pages/results/ASetFancyResult"));
const Achecksportwiseresult = lazy(
  () => import("./pages/old-res/Achecksportwiseresult")
);
const Atransactionlist = lazy(() => import("./pages/dw-req/Atransactionlist"));
const AtransactionlistWithdrawl = lazy(
  () => import("./pages/dw-req/AtransactionlistWithdrawl")
);
const PrivilegesRoles = lazy(() => import("./pages/PrivilegesRoles"));
const Ariskmanagement = lazy(
  () => import("./pages/risk-management/Ariskmanagement")
);
const ACasRiskMgmt = lazy(() => import("./pages/risk-management/ACasRiskMgmt"));

const cookies = new Cookies();
const Router = () => {
  const dispatch = useDispatch();
  const userData = useSelector((e: any) => e.userData);
  const HeaderData = useSelector((e: any) => e.Header);
  const [routeData, setRouteData] = useState<any>();
  useEffect(() => {
    const authToken = cookies.get("skyToken");
    if (authToken) {
      getHeaderDetails();
    }
    socketConnect(dispatch, (flag: any) => {
      if (flag) {
        if (authToken && HeaderData) {
          setTimeout(() => {
            sendEvent("SIGN_UP_ADMIN", { userId: HeaderData?.user_name });
          }, 500);

          setTimeout(() => {
            sendEvent("VERIFY_TOKEN_ADMIN", {
              userId: HeaderData?._id,
              token: authToken,
            });
          }, 700);
        }
      }
    });
    getDomainDetails();
    return () => {};
  }, []);

  const getHeaderDetails = async () => {
    let data = {
      api: ADMIN_API.GET_ROLE,
      value: {},
    };
    await getApi(data)
      .then(function (response) {
        console.log(response);
        setRouteData(response.data.data);
        dispatch({ type: "HEADER_DETAILS", payload: response.data.data });
        dispatch({
          type: "PAYMENT_COUNT",
          payload: {
            depositeCount: response.data.data.depositeCount,
            withdrawaCount: response.data.data.withdrawaCount,
          },
        });
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };
  const getDomainDetails = async () => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.GET_SITE,
      value: {
        domain: window.location.hostname,
      },
    };
    await postApi(data)
      .then(function (response) {
        console.log(response);
        dispatch({ type: "DOMAIN_DETAILS", payload: response.data.data });
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };

  const checkSettingOption = () =>
    routeData?.add_balance ||
    routeData?.manage_website ||
    routeData?.surveillance ||
    routeData?.whiteLablesCasinoLimit ||
    routeData?.p2pSettings ||
    routeData?.sports_main_market ||
    routeData?.bet_list ||
    routeData?.fancy_history ||
    routeData?.manage_fancy;
  // {
  // if (routeData.sports_main_market ||
  //   routeData.match_history ||
  //   routeData.manage_fancy ||
  //   routeData.fancy_history ||
  //   routeData.manage_premium ||
  //   routeData.premium_history ||
  //   routeData.manage_website ||
  //   routeData.casino_manage ||
  //   routeData.manage_dashboard_images ||
  //   routeData.banner) return true
  // else return false
  //   }

  return (
    <>
      <Routes>
        <Route
          path={`/`}
          element={
            <PrivateRoute hasAccess={routeData?.downline_list}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path={`/:agentId`}
          element={
            <PrivateRoute hasAccess={routeData?.downline_list}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path={`/login`}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path={`/change/password`}
          element={
            <PublicRoute>
              <ChangePassword />
            </PublicRoute>
          }
        />
        <Route
          path={`/profile`}
          element={
            <PrivateRoute hasAccess={routeData?.my_account}>
              <MyAccount />
            </PrivateRoute>
          }
        >
          <Route
            path={`:tab/`}
            element={
              <PrivateRoute hasAccess={routeData?.my_account}>
                <MyAccount />
              </PrivateRoute>
            }
          />
          <Route
            path={`/profile`}
            element={
              <PrivateRoute hasAccess={routeData?.my_account}>
                <MyAccount />
              </PrivateRoute>
            }
          />
        </Route>
        <Route
          path={`/user/:tab/:TYPE/:userId`}
          element={
            <PrivateRoute hasAccess={routeData?.my_account}>
              <MyAccount />
            </PrivateRoute>
          }
        />
        <Route
          path={`/loss/down-line`}
          element={
            <PrivateRoute hasAccess={routeData?.downline_report}>
              <LossDownLine />
            </PrivateRoute>
          }
        />
        <Route
          path={`/report/DWDaily`}
          element={
            <PrivateRoute hasAccess={routeData?.onlinePaymentWithdrawals_report}>
              <DWDailyReport />
            </PrivateRoute>
          }
        />
        <Route
          path={`/loss/casino`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.casinoReport || routeData?.casinoReport !== 0
              }
            >
              <LossCasino />
            </PrivateRoute>
          }
        />
        <Route
          path={`/loss/market`}
          element={
            <PrivateRoute hasAccess={routeData?.market_report}>
              <LossMarket />
            </PrivateRoute>
          }
        />
        <Route
          path={`/report/DW`}
          element={
            <PrivateRoute hasAccess={routeData?.onlinePaymentWithdrawals_report}>
              <DWReport />
            </PrivateRoute>
          }
        />
        <Route
          path={`/loss/match`}
          element={
            <PrivateRoute hasAccess={1}>
              <MatchProfitLoss />
            </PrivateRoute>
          }
        />
        <Route
          path={`/loss/saba`}
          element={
            <PrivateRoute hasAccess={1}>
              <SABADownline />
            </PrivateRoute>
          }
        />
        <Route
          path={`/account/statement`}
          element={
            <PrivateRoute hasAccess={routeData?.account_statement}>
              <AccountStatement />
            </PrivateRoute>
          }
        />
        <Route
          path={`/bet-live`}
          element={
            <PrivateRoute hasAccess={routeData?.bet_list_live}>
              <BetLive />
            </PrivateRoute>
          }
        />
        <Route
          path={`/betList`}
          element={
            <PrivateRoute hasAccess={routeData?.bet_list}>
              <BetList />
            </PrivateRoute>
          }
        />
        <Route
          path={`/risk-management`}
          element={
            <PrivateRoute hasAccess={routeData?.risk_management}>
              <RiskManagement />
            </PrivateRoute>
          }
        />
        <Route
          path={`/block-market`}
          element={
            <PrivateRoute hasAccess={routeData?.marketBlock}>
              <BlockMarket />
            </PrivateRoute>
          }
        />
        <Route
          path={`/risk-management-detail/:id`}
          element={
            <PrivateRoute hasAccess={routeData?.risk_management}>
              <RiskManagementDetail />
            </PrivateRoute>
          }
        />
        <Route
          path={`/master/banking`}
          element={
            <PrivateRoute hasAccess={routeData?.add_balance}>
              <MasterBanking />
            </PrivateRoute>
          }
        />
        <Route
          path={`/player/banking`}
          element={
            <PrivateRoute hasAccess={routeData?.player_banking}>
              <PlayerBanking />
            </PrivateRoute>
          }
        />
        <Route
          path={`/agent/banking`}
          element={
            <PrivateRoute hasAccess={routeData?.agent_banking}>
              <AgentBanking />
            </PrivateRoute>
          }
        />
        <Route
          path={`/bankingMethod`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.bankingMethod ||
                routeData?.bankingMethod === undefined
              }
            >
              <BankingMethod />
            </PrivateRoute>
          }
        />
        <Route
          path={`/add-bankingMethod`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.bankingMethod ||
                routeData?.bankingMethod === undefined
              }
            >
              <AddEdit />
            </PrivateRoute>
          }
        />
        <Route
          path={`/edit-bankingMethod/:id`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.bankingMethod ||
                routeData?.bankingMethod === undefined
              }
            >
              <AddEdit />
            </PrivateRoute>
          }
        />
        <Route
          path={`/sport-league`}
          element={
            <PrivateRoute hasAccess={routeData?.sports_leage}>
              <SportLegue />
            </PrivateRoute>
          }
        />
        <Route
          path={`/main-market`}
          element={
            <PrivateRoute hasAccess={routeData?.sports_main_market}>
              <MainMarket />
            </PrivateRoute>
          }
        />
        <Route
          path={`/winner/cricket/history`}
          element={
            <PrivateRoute hasAccess={routeData?.match_history}>
              <WinnerHistory />
            </PrivateRoute>
          }
        />
        <Route
          path={`/session/cricket/declare`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_fancy}>
              <SessionDeclare />
            </PrivateRoute>
          }
        />
        <Route
          path={`/session/cricket/history`}
          element={
            <PrivateRoute hasAccess={routeData?.fancy_history}>
              <SessionHistory />
            </PrivateRoute>
          }
        />
        <Route
          path={`/session/bets/history/:id/:type`}
          element={
            <PrivateRoute hasAccess={1}>
              <MangeFancy />
            </PrivateRoute>
          }
        />
        <Route
          path={`/cricket/premium/declare`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_premium}>
              <PremiumDeclare />
            </PrivateRoute>
          }
        />
        <Route
          path={`/cricket/premium/history`}
          element={
            <PrivateRoute hasAccess={routeData?.premium_history}>
              <PremiumHistory />
            </PrivateRoute>
          }
        />
        <Route
          path={`/cricket/bets/declare/:id/:type`}
          element={
            <PrivateRoute hasAccess={1}>
              <MangePremium />
            </PrivateRoute>
          }
        />
        <Route
          path={`/website`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <ManageWebsites />
            </PrivateRoute>
          }
        />
        <Route
          path={`/add-website`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <EditWebsites />
            </PrivateRoute>
          }
        />
        <Route
          path={`/edit-website/:id`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <EditWebsites />
            </PrivateRoute>
          }
        />
        <Route
          path={`/casino`}
          element={
            <PrivateRoute hasAccess={routeData?.casino_manage}>
              <ManageCasino />
            </PrivateRoute>
          }
        />
        <Route
          path={`/dashboard-images`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_dashboard_images}>
              <ManageDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path={`/edit-dashboard/:id`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_dashboard_images}>
              <EditDashBoard />
            </PrivateRoute>
          }
        />
        <Route
          path={`/add-dashboard/:id`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_dashboard_images}>
              <EditDashBoard />
            </PrivateRoute>
          }
        />
        <Route
          path={`/upload`}
          element={
            <PrivateRoute hasAccess={1}>
              <ImageUpload />
            </PrivateRoute>
          }
        />
        <Route
          path={`/payment/deposit`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.onlinePaymentDeposite ||
                routeData?.onlinePaymentDeposite !== 0
              }
            >
              <Deposit />
            </PrivateRoute>
          }
        />
        <Route
          path={`/payment/withdraw`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.onlinePaymentWithdrawals ||
                routeData?.onlinePaymentWithdrawals !== 0
              }
            >
              <Withdraw />
            </PrivateRoute>
          }
        />
        x
        <Route
          path={`/banner`}
          element={
            <PrivateRoute hasAccess={routeData?.banner}>
              <ManageBanner />
            </PrivateRoute>
          }
        />
        <Route
          path={`/edit-banner/:id`}
          element={
            <PrivateRoute hasAccess={routeData?.banner}>
              <EditDashBanner />
            </PrivateRoute>
          }
        />
        <Route
          path={`/add-banner/:id`}
          element={
            <PrivateRoute hasAccess={routeData?.banner}>
              <EditDashBanner />
            </PrivateRoute>
          }
        />
        <Route
          path={`/add-match`}
          element={
            <PrivateRoute hasAccess={routeData?.sports_leage}>
              <AddMatch />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AdminSetting`}
          element={
            <PrivateRoute hasAccess={checkSettingOption()}>
              <AdminSetting companyPayments={false}/>
            </PrivateRoute>
          }
        />
        <Route
          path={`/ComPayments`}
          element={
            <PrivateRoute hasAccess={checkSettingOption()}>
              <AdminSetting companyPayments={true}/>
            </PrivateRoute>
          }
        />
        <Route
          path={`/Asearchusers`}
          element={
            <PrivateRoute hasAccess={true}>
              <Asearchusers />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AWebsiteSetting`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <AWebsiteSetting />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AAddWebsiteSetting`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <AAddWebsiteSetting />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AManageLinks`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <AManageLinks />
            </PrivateRoute>
          }
        />
        <Route
          path={`/gameUsersList`}
          element={
            <PrivateRoute hasAccess={true}>
              <GameUsersList />
            </PrivateRoute>
          }
        />
        <Route
          path={`/Asurveillance`}
          element={
            <PrivateRoute hasAccess={routeData?.surveillance}>
              <Asurveillance />
            </PrivateRoute>
          }
        />
        <Route
          path={`/MonitorUserPnL`}
          element={
            <PrivateRoute hasAccess={true}>
              <MonitorUserPnL />
            </PrivateRoute>
          }
        />
        <Route
          path={`/Prematchpl`}
          element={
            <PrivateRoute hasAccess={true}>
              <Prematchpl />
            </PrivateRoute>
          }
        />
        <Route
          path={`/Prematchuserbet/:id`}
          element={
            <PrivateRoute hasAccess={true}>
              <Prematchuserbet />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AMasterCheat`}
          element={
            <PrivateRoute hasAccess={true}>
              <AMasterCheat />
            </PrivateRoute>
          }
        />
        <Route
          path={`/ACheatIps`}
          element={
            <PrivateRoute hasAccess={true}>
              <ACheatIps />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AsameIpUsers`}
          element={
            <PrivateRoute hasAccess={true}>
              <AsameIpUsers />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AliveMatchbets`}
          element={
            <PrivateRoute hasAccess={true}>
              <AliveMatchbets />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AbetCount`}
          element={
            <PrivateRoute hasAccess={true}>
              <AbetCount />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AbetLockUsers`}
          element={
            <PrivateRoute hasAccess={true}>
              <AbetLockUsers />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AactiveMatch`}
          element={
            <PrivateRoute hasAccess={routeData?.sports_main_market}>
              <AactiveMatch />
            </PrivateRoute>
          }
        />
        <Route
          path={`/WhiteLimit`}
          element={
            <PrivateRoute hasAccess={routeData?.whiteLablesCasinoLimit}>
              <WhiteLimit />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AinactiveMatch`}
          element={
            <PrivateRoute hasAccess={routeData?.sports_main_market}>
              <AinactiveMatch />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AdeletedBets`}
          element={
            <PrivateRoute hasAccess={routeData?.bet_list}>
              <AdeletedBets />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AupdateFancyStatus`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_fancy}>
              <AupdateFancyStatus />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AsuspendedResults`}
          element={
            <PrivateRoute hasAccess={routeData?.fancy_history}>
              <AsuspendedResults />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AUserMessage`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <AUserMessage />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AHyperMessage`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <AHyperMessage />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AImpMessage`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <AImpMessage />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AImageAdd`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <AImageAdd />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AdeletedUsers`}
          element={
            <PrivateRoute hasAccess={true}>
              <AdeletedUsers />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AsuspendedfancyResult`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_fancy}>
              <AsuspendedfancyResult />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AsuspendedmarketResult`}
          element={
            <PrivateRoute hasAccess={routeData?.match_history}>
              <AsuspendedmarketResult />
            </PrivateRoute>
          }
        />
        <Route
          path={`/ADeafultSetting`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_website}>
              <ADeafultSetting />
            </PrivateRoute>
          }
        />
        <Route
          path={`/DeafultContactSetting`}
          element={
            <PrivateRoute hasAccess={1}>
              <DeafultContactSetting />
            </PrivateRoute>
          }
        />
        <Route
          path={`/P2PSetting`}
          element={
            <PrivateRoute hasAccess={routeData?.p2pSettings}>
              <P2PSetting />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AsetResult`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.sports_main_market || routeData?.manage_fancy
              }
            >
              <AsetResult />
            </PrivateRoute>
          }
        />
        <Route
          path={`/ASetMarketResult`}
          element={
            <PrivateRoute hasAccess={routeData?.sports_main_market}>
              <ASetMarketResult />
            </PrivateRoute>
          }
        />
        <Route
          path={`/ASetFancyResult`}
          element={
            <PrivateRoute hasAccess={routeData?.manage_fancy}>
              <ASetFancyResult />
            </PrivateRoute>
          }
        />
        <Route
          path={`/Achecksportwiseresult`}
          element={
            <PrivateRoute hasAccess={true}>
              <Achecksportwiseresult />
            </PrivateRoute>
          }
        />
        <Route
          path={`/Atransactionlist`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.onlinePaymentWithdrawals ||
                routeData?.onlinePaymentDeposite
              }
            >
              <Atransactionlist />
            </PrivateRoute>
          }
        />
        <Route
          path={`/AtransactionlistWithdrawl`}
          element={
            <PrivateRoute
              hasAccess={
                routeData?.onlinePaymentWithdrawals ||
                routeData?.onlinePaymentDeposite
              }
            >
              <AtransactionlistWithdrawl />
            </PrivateRoute>
          }
        />
        <Route
          path={`/Ariskmanagement`}
          element={
            <PrivateRoute hasAccess={routeData?.risk_management}>
              <Ariskmanagement />
            </PrivateRoute>
          }
        />
        <Route
          path={`/ACasRiskMgmt`}
          element={
            <PrivateRoute hasAccess={routeData?.risk_management}>
              <ACasRiskMgmt />
            </PrivateRoute>
          }
        />
        <Route
          path={`/Privileges`}
          element={
            <PrivateRoute hasAccess={routeData?.privileges}>
              <PrivilegesRoles />
            </PrivateRoute>
          }
        />
        <Route
          path={`/*`}
          element={
            <PrivateRoute hasAccess={1}>
              <NotFound />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default Router;
