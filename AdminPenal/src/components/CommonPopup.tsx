import React, { useState } from 'react'
import { styleObjectBlackButton } from '../common/StyleSeter';
import { useSelector } from 'react-redux';

function CommonPopup(props: any) {
    const { closeModel, OpenModal, submit, type, closebtn, customclass, newsclass } = props
    const DD = useSelector((e: any) => e.domainDetails);
    const [isHover, setIsHover] = useState(false);
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };
    return (
        <>
            <div className={`popup-wrp commonpopup fade  ${OpenModal ? "popup-show " : ""} ${customclass|| ''} ${newsclass|| ''} `}>
                <div className="pop">
                    <div className="pop-content">
                        <div className={`pop-head ${!closebtn ? 'center' : ''}`}>
                            <h5 dangerouslySetInnerHTML={{ __html: props.title }}></h5>
                            {closebtn && <div className="pop-close" onClick={closeModel} > </div>}
                            <a className="close ui-link mobileclose" onClick={closeModel} >Close</a>
                        </div>

                        <div className="pop-body">
                            {props.children}
                        </div>



                        {customclass === 'newspopup' ?
                            <ul id="pageNumberContent" className="pages">
                                <li id="prev"><a href="javascript:void(0);" className="ui-link disable" >Prev
                                </a>
                                </li>
                                <li id="pageNumber"><a href="javascript:void(0);" className="ui-link select" >1</a></li>
                                <li id="next"><a href="javascript:void(0);" className="ui-link disable" >Next
                                </a>
                                </li>
                            </ul>
                            :
                            <ul className="btn-wrap break">
                                <li>
                                    <a className="btn" onClick={closeModel}>{customclass ? 'Close' : 'Ok'}</a>
                                </li>
                            </ul>

                        }
                    </div>
                </div>
            </div >
        </>
    );
}

export default CommonPopup