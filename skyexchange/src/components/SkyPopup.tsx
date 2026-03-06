import React, { useState } from "react";
import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../common/StyleSeter";

const SkyPopup = (props: any) => {
  const { closeModel, OpenModal, submit, type, closebtn } = props
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => { setIsHover(true); };
  const handleMouseLeave = () => { setIsHover(false); };
  return (
    <>
      <div className={`popup-wrp fade ${OpenModal ? "popup-show " : ""}`}>
        <div className="pop">
          <div className="pop-content">
            <div className="pop-head">
              <h5 dangerouslySetInnerHTML={{ __html: props.title }}></h5>
              <div className="pop-close"
                onClick={closeModel}
              >
              </div>
            </div>
            <form onSubmit={(e) => submit(e, type ? type : '')}>
              <div className="pop-body">
                {props.children}
              </div>

              <div className="pop-footer">
                <div className={`button-wrap pb-0 ${closebtn ? "d_flex d_flex_justify_spacebt d_flex_align_center w_100 " : ""}`}>
                  {closebtn && <button onClick={closeModel} type="button" className="btn btn-outline-dark btn-sm" data-bs-dismiss="modal">Close</button>}
                  <button onMouseEnter={handleMouseEnter}  onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, isHover)} onClick={(e) => submit(e, type ? type : '')} className="submit-btn btn btn_black" > {type === 'status' ? "Change" : "Submit"} </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div >
    </>
  );
}

export default SkyPopup