import React, { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Router from "./Router";
import { BrowserRouter } from "react-router-dom";
import Loader from "./components/Loader";
import Header from "./components/Header";
import Cookies from "universal-cookie";
import Footer from "./components/Footer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import ToastMessage from "./components/ToastMessage";
import { USER_API } from "./common/common";
import { getApi } from "./service";
import { getTheme } from "./common/StyleSeter";
// import dollar from "../public/images/dollar.svg"
// import dollarRed from "../public/images/dollar-red.svg"
const cookies = new Cookies();

function App() {
  const dispatch = useDispatch();
  const authToken = cookies.get("skyTokenFront");

  const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
  const betHistoryShow = useSelector((e: any) => e.betHistoryShow);
  const loaderFromStore = useSelector((e: any) => e.loader);
  const [isLoader, setLoader] = useState<any>(loaderFromStore || true);
  const DD = useSelector((e: any) => e.domainDetails);

  useEffect(() => {
    console.log("isLoader :: ", isLoader);

    setLoader(loaderFromStore);
  }, [loaderFromStore]);

  useEffect(() => {
    if (betHistoryShow) {
      document.body.classList.add("no_scroll");
    } else {
      document.body.classList.remove("no_scroll");
    }
    return () => {
      document.body.classList.remove("no_scroll");
    };
  }, [betHistoryShow]);

  useEffect(() => {
    // getPageData();
    if (!authToken) {
      dispatch({ type: "AUTHENTICATION", payload: false });
    }

    return () => {};
    // eslint-disable-next-line
  }, []);

  useEffect(()=>{
    const theme = getTheme(DD?.colorSchema)
    if(theme){
      const {headerBgFirst, headerBgSecond, headerTextColor} = theme
      document.documentElement.style.setProperty('--headerBgColor', `linear-gradient(-180deg, ${headerBgFirst} 0%, ${headerBgSecond} 100%)`)
      // if(DD?.colorSchema === "yellow-yellow"){
      //   document.documentElement.style.setProperty('--headerCoin', `url('../public/images/dollar-red.svg')`)
      // }else{
      //   document.documentElement.style.setProperty('--headerCoin', `url('../../../public/images/dollar.svg')`)
      // }
    }
  },[DD])
  const getPageData = async () => {
    let data = {
      api: `${USER_API.HOME}?domain=${window.location.hostname}`,
      value: {
        domain:
          window.location.hostname === "localhost"
            ? process.env.REACT_APP_DOMAIN
            : window.location.hostname,
      },
    };

    await getApi(data)
      .then(function (response) {
        console.log("getPageData", response);
        // setPageData(response.data.data)
        dispatch({ type: "SET_HOME_DATA", payload: response.data.data });
        // setLoadingImages(response.data.data.dashboardImagesInfo.map((item: any) => item.id));
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          // Logout()
          // navigate('/login')
        }
      });
  };

  return (
    <>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="loader_top loader_overlay">
              <div className="">{/* <Loader /> */}</div>
            </div>
          }
        >
          {isLoader && (
            <div className="loader_top loader_overlay">
              <div className="">
                
                <Loader />
              </div>
            </div>
          )}

          {/* {isAuthenticated?.isLogin && authToken ? <Header /> : <></>} */}
          {((window.location.pathname !== "/login" &&
            window.location.pathname !== "/change/password" &&
            window.location.pathname !== "/Maintenance") ||
            authToken) && <Header />}
          <ToastMessage />
          {/* <div style={{overflow: 'hidden'}}> */}
          <Router />
          {/* </div> */}
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;

/**
 * this code snippet going to use for disable site when user open console
 var $el = function (sel: any) {
        return document.querySelector(sel)
    };
    var isMac = navigator.platform.toLowerCase().indexOf('mac') > -1,
        openedRatio = isMac ? 0.85 : 1.2, // for console.error
        openedRatio = isMac ? 1.6 : 1.5, //for console.log 
        startedOpenedRatio = isMac ? 0.5 : 0.8,
        firstTest: any,
        inter: string | number | NodeJS.Timeout | undefined;

    if (window.location.hostname !== 'localhost') {
        window.addEventListener('load', function () {
            setTimeout(init, 1000);
        })
    }

    function init() {
        firstTest = testDevTools();
        // $el('.ConsoleOpen')!.innerHTML = firstTest;
        $el('.manual')!.addEventListener('click', function (e: { preventDefault: () => void; }) {
            e.preventDefault();
            stopCheck();
            // $el('.ConsoleOpen').innerHTML = testDevTools();
        })
        startCheck();
    }

    function testDevTools() {
        var t = performance.now();
        for (var i = 0; i < 100; i++) {
            // console.log('1');
            console.error('1');
            // console.clear();
        }
        return performance.now() - t;
    }

    function startCheck() {
        stopCheck();
        inter = setInterval(function () {
            var test = testDevTools(),
                ratio = test / firstTest,
                opened = ratio > openedRatio;
            // $el('.ConsoleOpen')!.innerHTML = 'Chrome Console is - ' + (opened ? 'Opened' : 'Closed');
            $el('.ConsoleOpen')!.style.display = opened ? 'block' : 'none';
            if (ratio < startedOpenedRatio) { firstTest = test; }
        }, 1000);
    }

    function stopCheck() {
        clearInterval(inter);
    }
 */
