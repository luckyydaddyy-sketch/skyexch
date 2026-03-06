import React, { useEffect, useState } from "react";
import LoaderImage from "../assets/images/loaderajaxbet1-small.gif";
import { useSelector } from "react-redux";
import { styleObjectGetBGasColor } from "../common/StyleSeter";

const Loader = () => {
  const [loaderColor, setLoaderColor] = useState("#FFB80C");
  const DD = useSelector((e: any) => e.domainDetails);

  useEffect(() => {
    setLoaderColor(
      styleObjectGetBGasColor(DD?.colorSchema)?.color || "#FFB80C"
    );
  }, [DD]);
  useEffect(() => {
    document.querySelector("body")!.classList.add("no-scroll");
    return () => {
      document.querySelector("body")!.classList.remove("no-scroll");
    };
  }, []);

  return (
    // <div className="sd_loader">
    //     <svg xmlns="http://www.w3.org/2000/svg" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
    //         <path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#04ac80" stroke="none">
    //             <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51" />
    //         </path>
    //     </svg>
    // </div>
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `\n@charset "UTF-8";\n\n.loading-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100vw;\n    height: 100vh;\n    background-color: transparent;\n    z-index: 99;\n  display: flex;\n  justify-content: center;\n    align-items: center\n}\n\n.loading-wrap {\n    background: #fff;\n    font-size: 1.2vw;\n    color: #243a48;\n    box-shadow: 0 .8vw 2.66667vw 0 rgba(0, 0, 0, .5);\n    border-radius: 1.33333vw;\n    padding: 6vw 25px;\n    justify-content: center;\n    align-items: center;\n    flex-wrap: wrap\n}\n\n.loading-wrap p {\n    flex: 0 0 100%;\n    text-align: center;\n    margin-bottom: 0px;\n}\n\n.loading-text {\n    top: 50% !important;\n    left: 36% !important;\n}\n\n.loadingr {\n    position: relative;\n    width: 20vw;\n    height: 8vw;\n}\n\n.loadingr>div {\n    position: absolute;\n    width: 10vw;\n    height: 10vw;\n    border-radius: 50%\n}\n\n.loadingr>div:nth-of-type(1) {\n    left: 0;\n    background: ${loaderColor};\n    animation: loading-1 .6s ease infinite;\n    z-index: 5\n}\n.disable{\n    pointer-events: none;\n}\n\n.loadingr>div:nth-of-type(2) {\n    left: 50%;\n    background: #243a48;\n    animation: loading-2 .6s ease infinite\n}\n\n@keyframes loading-1 {\n    0% {\n        left: 0\n    }\n\n    50% {\n        left: 50%\n    }\n\n    100% {\n        left: 0\n    }\n}\n\n@keyframes loading-2 {\n    0% {\n        left: 50%;\n        z-index: 1\n    }\n\n    49% {\n        z-index: 1\n    }\n\n    50% {\n        left: 0;\n        z-index: 10\n    }\n\n    100% {\n        left: 50%;\n        z-index: 10\n    }\n}\n\n`,
        }}
      />
      <div className="loading-overlay loader" id="loading">
        <div className="loading-wrap" style={{ display: "flex" }}>
          <div className="loadingr">
            <div _ngcontent-ng-c452888632="" />
            <div _ngcontent-ng-c452888632="" />
          </div>
          <p>Loading...</p>
        </div>
      </div>
      {/* <div className="main-loader">
            <ul className="loading">
                <li>
                    <img src={LoaderImage} />
                </li>
                <li>Loading...</li>
            </ul>
        </div> */}
    </>
  );
};
export default Loader;

// position: absolute;
//     width: 100%;
//     height: 100%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     z-index: 9999;
//     background: rgba(0, 0, 0, 0.5);

// position: fixed;
// top: 50%;
// left: 50%;
// transform: translate(-50%, -50%);
// z-index: 9999;
