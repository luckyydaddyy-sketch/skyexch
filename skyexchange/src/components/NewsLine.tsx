import React, { useState } from "react";
import { useSelector } from "react-redux";
import Cookies from "universal-cookie";
import CommonPopup from "./CommonPopup";
import NewsLinePopup from "./NewsLinePopup";
const cookies = new Cookies();

const NewsLine = () => {
  const DD = useSelector((e: any) => e.domainDetails);
  const authToken = cookies.get("skyTokenFront");
  const [newsPopup, setNewsPopup] = useState(false)
  return (
    <>
      {authToken ? (
        <div className="marquee-box" style={{ display: "flex" }}>
          <h4>News</h4>
          <div className="marquee">
            <div className="js-marquee-wrapper">
              <div className="js-marquee">
                <a onClick={() => setNewsPopup(true)}>
                  {DD?.maintenanceMessage
                    ? DD?.maintenanceMessage
                    : DD?.userMessage}
                </a>
                {/* <a><span>30 Oct 2022</span>Match :- Melbourne Renegades WBBL v Sydney Sixers WBBL .. Market :- SYSW 20 Over Runs '184 - 186' ( IST 10:32:44 - 10:32:55) Bets Voided Because of Wrong Commentary ... Sorry for the Inconvenience Caused</a><a><span>30 Oct 2022</span>Event :- Bangladesh v Zimbabwe ... Market :- Bookmaker ... Selection :- Bangladesh ' 116 - 117.5 ' ( IST 11:29:30 ) Bets Voided Because Wrong Odds Offered By Mistake ... Sorry for the Inconvenience Caused</a> */}
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}


      {newsPopup &&
        <CommonPopup
          title={`Announcement`}
          OpenModal={newsPopup}
          closeModel={() => setNewsPopup(false)}
          customclass="newspopup"
        >

          <NewsLinePopup eventData={DD?.maintenanceMessage ? DD?.maintenanceMessage : DD?.userMessage} /> </CommonPopup>
      }
    </>
  );
};

export default NewsLine;
