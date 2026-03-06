import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import CommonPopup from './CommonPopup';
import PrivacyPopup from './Profile/PrivacyPopup';
import TermsPopup from './Profile/TermsPopup';
import RulesPopup from './Profile/RulesPopup';
import KYCPopup from './Profile/KYCPopup';
import ResponsibleGamePopup from './Profile/ResponsibleGamePopup';
import AboutPopup from './Profile/AboutPopup';
import SelfExclusionPopup from './Profile/SelfExclusionPopup';
import UnderagePolicyPopup from './Profile/UnderagePolicyPopup';

const Footer = () => {
    const DD = useSelector((e: any) => e.domainDetails);

    const [support, setSupport] = useState(process.env.REACT_APP_WHATSAPP === "true" ? 'whatsapp' :
        process.env.REACT_APP_EMAIL === "true" ? "email" :
            process.env.REACT_APP_TELEGRAM === "true" ? "telegram" :
                process.env.REACT_APP_SKYPE === "true" ? "skype" :
                    process.env.REACT_APP_INSTAGRAM === "true" ? "instagram" : "whatsapp");

    const [privacyPopup, setPrivacyPopup] = useState(false)
    const [termsPopup, setTermsPopup] = useState(false)
    const [rulesPopup, setRulesPopup] = useState(false)
    const [kycPopup, setKycPopup] = useState(false)
    const [responsibleGamePopup, setResponsibleGamePopup] = useState(false)
    const [aboutPopup, setAboutPopup] = useState(false)
    const [selfExclusionPopup, setSelfExclusionPopup] = useState(false)
    const [underagePolicyPopup, setUnderagePolicyPopup] = useState(false)

    const downloadFile = () => {

        const imageUrl = `${process.env.REACT_APP_BASE_POINT}client.apk`;
        // Create a new XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';

        xhr.onload = () => {
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            a.download = 'client.apk'; // Set the desired file name
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        xhr.open('GET', imageUrl);
        xhr.send();

    };

    return (
        <>
            <div className='footer onlylogin'>
                {(process.env.REACT_APP_WHATSAPP === "true" || process.env.REACT_APP_EMAIL === "true" || process.env.REACT_APP_TELEGRAM === "true" || process.env.REACT_APP_SKYPE === "true" || process.env.REACT_APP_INSTAGRAM === "true") &&
                    <div className="social_tab">
                        <div className="row">
                            <div className="col-12 support-wrap home-wrap-bg">
                                <ul className="nav nav-pills" id="pills-tab" role="tablist" data-mouse="hover">
                                    {process.env.REACT_APP_WHATSAPP !== "false" &&
                                        <li className="nav-item">
                                            <a
                                                onMouseEnter={() => setSupport('whatsapp')}
                                                className={` nav-link ${support === "whatsapp" ? "open" : ""} `}
                                                id="pills-whatsappp" data-toggle="pill" href="#pills-whatsapp" role="tab" aria-controls="pills-whatsapp" aria-selected="false">
                                                <img src="./images/footerIcon/whatsapp.svg" alt="" />
                                            </a>
                                        </li>
                                    }
                                    {process.env.REACT_APP_EMAIL !== "false" &&
                                        <li className="nav-item">
                                            <a
                                                onMouseEnter={() => setSupport('email')}
                                                className={` nav-link ${support === "email" ? "open" : ""} `}
                                                id="pills-mail" data-toggle="pill" href="#pills-mail" role="tab" aria-controls="pills-mail" aria-selected="true">
                                                <img src="./images/footerIcon/supportemail.svg" alt="" />
                                            </a>
                                        </li>
                                    }
                                    {process.env.REACT_APP_TELEGRAM !== "false" &&
                                        <li className="nav-item">
                                            <a
                                                onMouseEnter={() => setSupport('telegram')}
                                                className={` nav-link ${support === "telegram" ? "open" : ""} `}
                                                id="pills-telegram-tab" data-toggle="pill" href="#pills-telegram" role="tab" aria-controls="pills-telegram" aria-selected="false">
                                                <img src="./images/footerIcon/telegram.svg" alt="" />
                                            </a>
                                        </li>
                                    }
                                    {process.env.REACT_APP_SKYPE !== "false" &&
                                        <li className="nav-item">
                                            <a
                                                onMouseEnter={() => setSupport('skype')}
                                                className={` nav-link ${support === "skype" ? "open" : ""} `}
                                                id="pills-skyep-tab" data-toggle="pill" href="#pills-skyep" role="tab" aria-controls="pills-skyep" aria-selected="false">
                                                <img src="./images/footerIcon/skype.svg" alt="" />
                                            </a>
                                        </li>
                                    }
                                    {process.env.REACT_APP_INSTAGRAM !== "false" &&
                                        <li className="nav-item">
                                            <a
                                                onMouseEnter={() => setSupport('instagram')}
                                                className={` nav-link ${support === "instagram" ? "open" : ""} `}
                                                id="pills-insta-tab" data-toggle="pill" href="#pills-insta" role="tab" aria-controls="pills-insta" aria-selected="false">
                                                <img src="./images/footerIcon/instagram.svg" alt="" />
                                            </a>
                                        </li>
                                    }
                                </ul>
                                <div className="support-info">
                                    <div id="supportDetail_whatsapp" className={` support-detail ${support === "whatsapp" ? "open" : ""} `}   >{DD ? DD.whatsapp && (Array.isArray(DD.whatsapp) ? DD.whatsapp : [DD.whatsapp]).map((item: any) => (<a style={{ color: "#000" }} key={item}><span>{item}</span></a>)) : ''}</div>
                                    <div id="supportDetail_email" className={` support-detail ${support === "email" ? "open" : ""} `}> {DD ? DD.email && (Array.isArray(DD.email) ? DD.email : [DD.email]).map((item: any) => (<a href={`mailto:${item}`} key={item}>{item}</a>)) : ''}</div>
                                    <div id="supportDetail_telegram" className={` support-detail ${support === "telegram" ? "open" : ""} `}>{DD ? DD.telegram && (Array.isArray(DD.telegram) ? DD.telegram : [DD.telegram]).map((item: any) => (<a key={item}><span>{item}</span></a>)) : ''}</div>
                                    <div id="supportDetail_skype" className={` support-detail ${support === "skype" ? "open" : ""} `}>  {DD ? DD.skype && (Array.isArray(DD.skype) ? DD.skype : [DD.skype]).map((item: any) => (<a href={`unsafe:skype:${item}?chat`} key={item}>{item}</a>)) : ''}</div>
                                    <div id="supportDetail_instagram" className={` support-detail ${support === "instagram" ? "open" : ""} `}>  {DD ? DD.instagram && (Array.isArray(DD.instagram) ? DD.instagram : [DD.instagram]).map((item: any) => (<a target="_blank" className="ui-link" key={item}>{item}</a>)) : ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <ul className="policy-link">
                    <li>
                        <a onClick={() => setPrivacyPopup(true)}>Privacy Policy</a>
                    </li>
                    <li>
                        <a onClick={() => setTermsPopup(true)}>Terms and Conditions</a>
                    </li>
                    <li>
                        <a onClick={() => setRulesPopup(true)}>Rules and Regulations</a>
                    </li>
                    <li>
                        <a onClick={() => setKycPopup(true)}>KYC</a></li>
                    <li>
                        <a onClick={() => setResponsibleGamePopup(true)}>Responsible Gaming</a>
                    </li>
                    <li>
                        <a onClick={() => setAboutPopup(true)}>About Us</a>
                    </li>
                    <li>
                        <a onClick={() => setSelfExclusionPopup(true)}>Self-exclusion Policy</a>
                    </li>
                    <li>
                        <a onClick={() => setUnderagePolicyPopup(true)}>Underage Policy</a>
                    </li>
                </ul>

                <div className=' footer_power' style={{ display: "none" }}>
                    <h3 id="powerWrapW"><span>Powered by</span>
                        <div className='powerby'></div>
                    </h3>
                    <div className="licence_embed">
                        <a onClick={downloadFile}><img src="./images/download_app.png" alt="" /></a>
                        <p style={{ marginTop: "5px" }}>v1.07 - 2020-11-11 - 8.2MB</p>
                    </div>
                </div>

                <div className="extra-wrap">
                    <div id="powerWrap" className="power-wrap-b" >

                        <span>Powered by</span>
                        <div className='power-img' />

                    </div>


                    <div className="appdl-link-android" >
                        <a target="_blank" href="/exchange/mobile/member/downloadApp.jsp">
                            <img onClick={downloadFile} src="./images/btn-appdl-android.png" alt="" /></a>
                        <p>v1.11 - 2022-03-23 - 3.1MB
                        </p>
                    </div>
                </div>

            </div>

            <div className='footer mobile_footer' style={{ display: "none" }}>
                <div className='footer_support'>
                    <div className='footer_support_item'>
                        {/* <div className='extend-btn f_c'>
                            <img src="/images/support.svg" title="customer" className="support-customer" />
                            <div className='footer_support_item_links r_f_c'>
                                Customer support 1 | support 2
                                {DD ? DD.whatsapp && DD.whatsapp.map((item: any, i:any) => (<><a href={`https://api.whatsapp.com/send?phone=${item}`} target="_blank">{item}</a> {i == '0' || i == '1' ? '|' : ''} </>)) : ''}
                            </div>
                            <a href="https://api.whatsapp.com/send?phone=917700002913" target="_blank">Customer support1</a>
                            <a href="https://api.whatsapp.com/send?phone=917700002874" target="_blank" className="split-line">support2</a>
                        </div> */}
                        {(false && process.env.REACT_APP_WHATSAPP !== "false") &&
                            <div className="extend-btn f_c">
                                <img src="/images/whatsapp.svg" title="WhatsApp" className="support-whatsapp" />
                                <div className='footer_support_item_links r_f_c'>
                                    {DD ? DD.whatsapp && (Array.isArray(DD.whatsapp) ? DD.whatsapp : [DD.whatsapp]).map((item: any, i: any) => (<><a href={`https://api.whatsapp.com/send?phone=${item}`} target="_blank" key={item}>{item}</a> {i == '0' || i == '1' ? '|' : ''} </>)) : ''}
                                </div>
                                {/* <a href="https://api.whatsapp.com/send?phone=917700005178" target="_blank">+917700005178</a>
                                <a href="https://api.whatsapp.com/send?phone=917700002943" target="_blank" className="split-line">+917700002943</a> */}
                            </div>
                        }
                    </div>
                    {process.env.REACT_APP_TELEGRAM !== "false" &&
                        <div className="extend-btn f_c">
                            <img src="/images/telegram.svg" title="Telegram" className="support-Telegram" />
                            <div className='footer_support_item_links r_f_c'>
                                {DD ? DD.telegram && (Array.isArray(DD.telegram) ? DD.telegram : [DD.telegram]).map((item: any, i: any) => <><a href={`http://www.t.me/${item}`} target="_blank" key={item}>{item}</a> {i == '0' || i == '1' ? '|' : ''} </>) : ''}
                            </div>
                            {/* <a href="http://www.t.me/skyexchange001" target="_blank">skyexchange001</a>
                            <a href="http://www.t.me/skyexchange002" target="_blank" className="split-line">skyexchange002</a> */}
                        </div>
                    }

                    <div className='footer_support_item support-social '>
                        {process.env.REACT_APP_SKYPE !== "false" &&
                            <div className='extend-btn'>
                                <img src="/images/skype.svg" title="Skype" className="support-customer" />
                                <div className='footer_support_item_links r_f_c'>
                                    <a href="" target="_blank" rel="noopener noreferrer">Skype</a>
                                    {/* {DD ? DD.skype && DD.skype.map((item: any) => (<a href={`unsafe:skype:${item}?chat`}>{item}</a>)) : ''} */}
                                </div>
                                {/* <a href="skype:skyexchangeofficial?chat" target="_blank">skype</a> */}
                            </div>
                        }
                        {process.env.REACT_APP_EMAIL !== "false" &&
                            <div className="extend-btn">
                                <img src="/images/send.svg" title="Email" className="support-mail" />
                                <div className='footer_support_item_links r_f_c'>
                                    <a href="" target="_blank" rel="noopener noreferrer">Email</a>
                                    {/* {DD ? DD.email && DD.email.map((item: any) => (<a href={`mailto:${item}`} target="_blank">{item}</a>)) : ''} */}
                                </div>
                                {/* <a href="mailto:info@skyexchange.com" target="_blank">Email.com</a> */}
                            </div>
                        }
                        {process.env.REACT_APP_INSTAGRAM !== "false" &&
                            <div className="extend-btn">
                                <img src="/images/instagram.svg" title="Instagram" className="support-instagram" />
                                <div className='footer_support_item_links r_f_c'>
                                    <a target="_blank" className="">Instagram</a>
                                    {/* {DD ? DD.instagram && DD.instagram.map((item: any) => (<a target="_blank" className="">{item}</a>)) : ''} */}
                                </div>
                                {/* <a href="https://www.instagram.com/sky_exch_?igshid=YmMyMTA2M2Y=/" target="_blank">instagram</a> */}
                            </div>
                        }
                    </div>
                </div>

                <div className='footer_power desktop'>
                    <h3 id="powerWrapW"><span>Powered by</span>
                        <div className='powerby'></div>
                    </h3>
                    <div className="licence_embed">
                        <iframe src="https://licensing.gaming-curacao.com/validator/?lh=7a83475c9e54450a218a18bd28e33fad&amp;template=seal" width="150" height="50" ></iframe>
                    </div>
                    <p>{DD?.domain} is operated by Sky Infotech N.V. a limited liability company incorporated under the laws of Curacao with
                        company Registration number 152377 with registered office at Abraham de Veerstraat 9 , Curacao P.O Box 3421 and is licensed
                        and regulated by the Curacao authority as the regulatory body responsible holding a (Sub-license with License number 365/JAZ
                        Sub-License GLH- OCCHKTW0707072017 granted on 6.07.2017).
                        <br />
                        Players are requested not to contact any untrusted sources for <a href="https://www.{DD?.domain}" target="_blank">https://www.{DD?.domain}/</a> accounts as this is an online site and they can only
                        register independently without any agents. Only deposit through the account details generated by the system or provided by our
                        official support team.
                    </p>
                    <div className="footer_info">
                        <p className="icon_phone"><img src="images/transparent.gif" />+351926917651 / +351926917279</p>
                        <p><a href={`mailto:support@${DD?.domain}`} ><img src="images/transparent.gif" />support@{DD?.domain}</a></p>
                    </div>
                </div>

                <div className="footer_browser">
                    <div></div>
                    <br />
                    Our website works best in the newest and last prior version of these browsers: <br />Google Chrome. Firefox
                </div>

                <ul className="policy-link">
                    <li>
                        <a onClick={() => setPrivacyPopup(true)}>Privacy Policy</a>
                    </li>
                    <li>
                        <a onClick={() => setTermsPopup(true)}>Terms and Conditions</a>
                    </li>
                    <li>
                        <a onClick={() => setRulesPopup(true)}>Rules and Regulations</a>
                    </li>
                    <li>
                        <a onClick={() => setKycPopup(true)}>KYC</a></li>
                    <li>
                        <a onClick={() => setResponsibleGamePopup(true)}>Responsible Gaming</a>
                    </li>
                    <li>
                        <a onClick={() => setAboutPopup(true)}>About Us</a>
                    </li>
                    <li>
                        <a onClick={() => setSelfExclusionPopup(true)}>Self-exclusion Policy</a>
                    </li>
                    <li>
                        <a onClick={() => setUnderagePolicyPopup(true)}>Underage Policy</a>
                    </li>
                </ul>

                <div className='dekstop-app-link'>
                    <div className="licence_embed">
                        <a onClick={downloadFile}><img src="./images/download_app.png" alt="" /></a>
                        <p style={{ marginTop: "5px" }}>v1.07 - 2020-11-11 - 8.2MB</p>
                    </div>
                </div>




                <div className="extra-wrap">
                    <div id="powerWrap" className="power-wrap-b" >

                        <span>Powered by</span>
                        <div className='power-img' />

                    </div>


                    <div className="appdl-link-android" >
                        <a target="_blank" href="/exchange/mobile/member/downloadApp.jsp">
                            <img onClick={downloadFile} src="./images/btn-appdl-android.png" alt="" /></a>
                        <p>v1.11 - 2022-03-23 - 3.1MB
                        </p>
                    </div>
                </div>

                {/* <div className='mobile_footer_applink'>
                    <div className=' footer_power'>
                        <h3 id="powerWrapW"><span>Powered by</span>
                            <div className='powerby'></div>
                        </h3>
                    </div>
                    <div className='app-link'>
                        <div className="licence_embed">
                            <a onClick={downloadFile}><img src="./images/btn-appdl-android.png" alt="" /></a>
                            <p style={{ marginTop: "5px" }}>v1.07 - 2020-11-11 - 8.2MB</p>
                        </div>
                    </div>
                </div> */}
            </div>


            {/* footer poups */}

            {privacyPopup &&
                <CommonPopup
                    title={`Rules of Fancy Bets`}
                    OpenModal={privacyPopup}
                    closeModel={() => setPrivacyPopup(false)}
                    customclass="footerpopup"
                >
                    <PrivacyPopup />
                </CommonPopup>
            }

            {termsPopup &&
                <CommonPopup
                    title={`Terms & Conditions`}
                    OpenModal={termsPopup}
                    closeModel={() => setTermsPopup(false)}
                    customclass="footerpopup"
                >

                    <TermsPopup />
                </CommonPopup>
            }
            {rulesPopup &&
                <CommonPopup
                    title={`Exchange Rules and Regulations`}
                    OpenModal={rulesPopup}
                    closeModel={() => setRulesPopup(false)}
                    customclass="footerpopup"
                >

                    <RulesPopup />
                </CommonPopup>
            }
            {kycPopup &&
                <CommonPopup
                    title={`KYC`}
                    OpenModal={kycPopup}
                    closeModel={() => setKycPopup(false)}
                    customclass="footerpopup"
                >

                    <KYCPopup />
                </CommonPopup>
            }
            {responsibleGamePopup &&
                <CommonPopup
                    title={`Responsible Gaming`}
                    OpenModal={responsibleGamePopup}
                    closeModel={() => setResponsibleGamePopup(false)}
                    customclass="footerpopup"
                >
                    <ResponsibleGamePopup />
                </CommonPopup>
            }
            {aboutPopup &&
                <CommonPopup
                    title={`About Us`}
                    OpenModal={aboutPopup}
                    closeModel={() => setAboutPopup(false)}
                    customclass="footerpopup"
                >
                    <AboutPopup />
                </CommonPopup>
            }
            {selfExclusionPopup &&
                <CommonPopup
                    title={`Self-Exclusion Policy`}
                    OpenModal={selfExclusionPopup}
                    closeModel={() => setSelfExclusionPopup(false)}
                    customclass="footerpopup"
                >

                    <SelfExclusionPopup />
                </CommonPopup>
            }
            {underagePolicyPopup &&
                <CommonPopup
                    title={`Underage Gaming Policy – ${DD.domain}`}
                    OpenModal={underagePolicyPopup}
                    closeModel={() => setUnderagePolicyPopup(false)}
                    customclass="footerpopup"
                >

                    <UnderagePolicyPopup />
                </CommonPopup>
            }
        </>
    )
}

export default Footer