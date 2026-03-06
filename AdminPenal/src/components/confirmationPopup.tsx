import React, { useState } from "react";
import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../common/StyleSeter";

const ConfirmationPopup = (props: any) => {
  const { closeModel, OpenModal, submit, type, closebtn, customClass, isHideSubmit, maxWidth } = props
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => { setIsHover(true); };
  const handleMouseLeave = () => { setIsHover(false); };
  return (
    <>
      <div className={`popup-wrp-confirm fade ${customClass ? customClass : ''} ${OpenModal ? "popup-show " : ""}`}>
        <div className="pop" style={maxWidth && {maxWidth: maxWidth}}>
          <div className="pop-content">
            <div className="pop-head" style={styleObjectBlackButton(DD?.colorSchema, true, true)}>
              <h5 dangerouslySetInnerHTML={{ __html: props.title }}></h5>
            </div>
            <form onSubmit={(e) => submit(e, type ? type : '')}>
              <div className="s_p-15">
              <div className="pop-body s_pb-15">
                {props.description}
              </div>
                <div className={`buttons flex-align content-center`}>
                  <button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{...styleObjectBlackButton(DD?.colorSchema, true), padding: "3px 20px", marginRight: "10px"}} className="submit-btn btn btn_black" > <img src="/images/check-mark.png" alt="" /> Confirm </button>
                  {/* <button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{...styleObjectBlackButton(DD?.colorSchema, true), padding: "3px 20px", marginRight: "10px"}} onClick={(e) => submit(e, type ? type : '')} className="submit-btn btn btn_black" > <img src="/images/check-mark.png" alt="" /> Confirm </button> */}
                  <button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{...styleObjectBlackButton(DD?.colorSchema, true), padding: "3px 20px"}} onClick={(e) => closeModel(e, type ? type : '')} className="submit-btn btn btn_black" > <img src="/images/cross.png" alt="" /> Cancel </button>
                </div>
                </div>
            </form>
          </div>
        </div>
      </div >
    </>
  );
}

export default ConfirmationPopup