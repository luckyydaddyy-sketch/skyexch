import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Router from './Router';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Loader from './components/Loader';
import Header from './components/Header';
import Cookies from 'universal-cookie';
import Footer from './components/Footer';

import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import ToastMessage from './components/ToastMessage';
import disableDevtool from 'disable-devtool';
import { getTheme } from './common/StyleSeter';
const cookies = new Cookies()

function App() {
    const dispatch = useDispatch()
    const authToken = cookies.get('skyToken')
    const DD = useSelector((e: any) => e.domainDetails);
    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    // disableDevtool()
    useEffect(() => {
        if (!authToken) {
            dispatch({ type: 'AUTHENTICATION', payload: false })
        }

        return () => {

        }
        // eslint-disable-next-line
    }, [])
    useEffect(()=>{
        const theme = getTheme(DD?.colorSchema)
        if(theme){
          const {headerBgFirst, headerBgSecond} = theme
          document.documentElement.style.setProperty('--headerBgColor', `linear-gradient(-180deg, ${headerBgFirst} 0%, ${headerBgSecond} 100%)`)
        }
      },[DD])
    return (
        <>
            <BrowserRouter>
                <Suspense fallback={<Loader />}>
                    {isAuthenticated?.isLogin && authToken ? <Header /> : <></>}
                    <ToastMessage />
                    <Router />
                    {isAuthenticated?.isLogin && authToken && ["/"].includes(window.location.pathname) ? <Footer /> : <></>}
                    {/* {["/profile", "Asearchusers"].includes(window.location.pathname) && <Footer />} */}
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

