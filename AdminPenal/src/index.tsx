import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';



window.addEventListener('keypress', logKey);

let logger = function () {
    /* +-------------------------------------------------------------------+
     desc: Enable or disable logger and disable warn function.
     +-------------------------------------------------------------------+ */
    let oldConsoleLog: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; } | null = null;
    let pub: any = {};

    pub.enableLogger = function enableLogger() {
        if (oldConsoleLog == null) return;
        window['console']['log'] = oldConsoleLog;
        console.log('=== LOG ENABLED ===');
    };
    pub.disableLogger = function disableLogger() {
        console.log('=== LOG DISABLED ===');
        oldConsoleLog = console.log;
        window['console']['log'] = () => { };
    };
    pub.disableWarn = function disableWarn() {
        window['console']['warn'] = () => { };
    };
    return pub;
}();

function logKey(e: { ctrlKey: any; shiftKey: any; altKey: any; code: any; }) {
    /* +-------------------------------------------------------------------+
     desc: define log enable disable key.
     +-------------------------------------------------------------------+ */
    if (e.ctrlKey && e.shiftKey && e.altKey) {
        switch (e.code) {
            case 'KeyE':
                logger.disableLogger();
                break;
            case 'KeyS':
                logger.enableLogger();
                break;
            default:
                break;
        }
    }
}

if (window.location.hostname !== 'localhost') {
    logger.disableLogger();
    logger.disableWarn();
} else {
    logger.disableWarn();
}


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <>
    {/* <React.StrictMode> */}
        <Provider store={store}>
            <App />
        </Provider>
    {/* </React.StrictMode> */}
    </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
