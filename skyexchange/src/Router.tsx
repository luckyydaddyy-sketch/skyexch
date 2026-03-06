import React, { lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { ADMIN_API, USER_API } from "./common/common";
import { Logout } from "./common/Funcation";
import ChangePassword from "./pages/ChangePassword";
import DepositWithdraw from "./pages/DepositWithdraw";
import Maintenance from "./pages/Maintenance";
import Inplay from "./pages/Inplay/Inplay";
import MultiMarket from "./pages/MultiMarket/MultiMarket";
import MyAccount from "./pages/MyAccount";
import MyAccountMobile from "./pages/MyAccountMobile ";
import Cricket from "./pages/Sport/Cricket";
import Soccer from "./pages/Sport/Soccer";
import Tennis from "./pages/Sport/Tennis";
import BasketBall from "./pages/Sport/BasketBall";
import Esoccer from "./pages/Sport/Esoccer";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import {
  getApi,
  postApi,
  postApiAdmin,
  sendEvent,
  socketConnect,
} from "./service";
import PageNotFound from "./pages/PageNotFound";

// import Home from './pages/Home'
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));

const cookies = new Cookies();
const Router = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const HeaderData = useSelector((e: any) => e.Header);
  useEffect(() => {
    const authToken = cookies.get("skyTokenFront");
    if (authToken) {
      getHeaderDetails();
      getMarketListDetails();
    }
    if (authToken && HeaderData) {
      setTimeout(() => {
        sendEvent("SIGN_UP", { userId: HeaderData?._id });
      }, 500);
      setTimeout(() => {
        sendEvent("VERIFY_TOKEN", {
          userId: HeaderData?._id,
          token: authToken,
        });
        sendEvent("UPDATE_USER_BALANCE", { userId: HeaderData?._id });
      }, 700);

      getHeaderDetails();
    }
    socketConnect(dispatch, (flag: any) => {
      if (flag) {
        setTimeout(() => {
          sendEvent("GET_LIVE_MATCH_COUNT", {});
        }, 500);
      }
    });
    getDomainDetails();
    return () => {};
  }, []);

  const getHeaderDetails = async () => {
    let data = {
      api: USER_API.GET_PROFILE,
      value: {},
    };
    await getApi(data)
      .then(function (response) {
        dispatch({ type: "HEADER_DETAILS", payload: response.data.data });
        if (
          response.data.data.newPassword &&
          window.location.pathname !== "/change/password"
        ) {
          window.location.href = "/change/password";
        }
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
    await postApiAdmin(data)
      .then(function (response) {
        if (response.data.data) {
          dispatch({ type: "DOMAIN_DETAILS", payload: response.data.data });
          if (response?.data?.data?.isMaintenance === true) {
            navigate("/Maintenance");
          }
        } else {
          navigate("/404");
        }
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        } else {
          navigate("/404");
        }
      });
  };
  const getMarketListDetails = async () => {
    let data = {
      api: USER_API.MARKET_LIST,
      value: {},
    };
    await getApi(data)
      .then(function (response) {
        dispatch({ type: "MARKET_LIST_DETAILS", payload: response.data.data });
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };
  return (
    <>
      <Routes>
        <Route path={`/404`} element={<PageNotFound />} />
        <Route path={`/`} element={<Home />} />
        <Route
          path={`/login`}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path={`/profile`}
          element={
            <PrivateRoute>
              <MyAccount />
            </PrivateRoute>
          }
        >
          <Route
            path={`:tab/`}
            element={
              <PrivateRoute>
                <MyAccount />
              </PrivateRoute>
            }
          />
          <Route
            path={`/profile`}
            element={
              <PrivateRoute>
                <MyAccount />
              </PrivateRoute>
            }
          />
        </Route>
        <Route
          path={`/user/:tab/`}
          element={
            <PrivateRoute>
              <MyAccount />
            </PrivateRoute>
          }
        />
        <Route
          path={`/myAccount`}
          element={
            <PrivateRoute>
              <MyAccountMobile />
            </PrivateRoute>
          }
        />
        <Route
          path={`/d-w`}
          element={
            <PrivateRoute>
              <DepositWithdraw />
            </PrivateRoute>
          }
        />

        <Route
          path={`/change/password`}
          element={
            <>
              <ChangePassword />
            </>
          }
        />
        <Route
          path={`/maintenance`}
          element={
            <PublicRoute>
              <Maintenance />
            </PublicRoute>
          }
        />
        <Route path={`/in-play`} element={<Inplay />} />
        <Route path={`/cricket`} element={<Cricket />} />
        <Route path={`/soccer`} element={<Soccer />} />
        <Route path={`/tennis`} element={<Tennis />} />
        <Route path={`/Esoccer`} element={<Esoccer />} />
        <Route path={`/basketBall`} element={<BasketBall />} />
        <Route path={`/multimarket`} element={<MultiMarket />}>
          <Route path={`:eventId/:marketId`} element={<MultiMarket />} />
        </Route>
      </Routes>
    </>
  );
};

export default Router;
