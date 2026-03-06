import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SimpleReactValidator from "simple-react-validator";
import { transform } from "typescript";
import Cookies from "universal-cookie";
import { ADMIN_API, USER_API } from "../common/common";
import {
  loginBackGroundColor,
  loginPolicyTextColor,
  styleObjectGetBG,
  styleObjectGetBGasColor,
  styleObjectGetBGIMageLoginImage,
  styleObjectGetColor,
  styleObjectGetLoginImage,
} from "../common/StyleSeter";
import { getApiLink, notifyError, notifyMessage, postApi } from "../service";
import instagram from "./../assets/icons/instagram.svg";
import mail from "./../assets/icons/mail.svg";
import skype from "./../assets/icons/skype.svg";
import telegram from "./../assets/icons/telegram.svg";
import whatsapp from "./../assets/icons/whatsapp.svg";
import CommonPopup from "../components/CommonPopup";
import PrivacyPopup from "../components/Profile/PrivacyPopup";
import TermsPopup from "../components/Profile/TermsPopup";
import RulesPopup from "../components/Profile/RulesPopup";
import KYCPopup from "../components/Profile/KYCPopup";
import ResponsibleGamePopup from "../components/Profile/ResponsibleGamePopup";
import AboutPopup from "../components/Profile/AboutPopup";
import SelfExclusionPopup from "../components/Profile/SelfExclusionPopup";
import UnderagePolicyPopup from "../components/Profile/UnderagePolicyPopup";
const cookies = new Cookies();
const Login = (props: any) => {
  const { setOpenModal, OpenModal } = props;
  const [, updateState] = React.useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const DD = useSelector((e: any) => e.domainDetails);
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    validationCode: "",
  });

  useEffect(() => {
       
    if(DD?.isMaintenance === true){
      window.location.href = '/Maintenance';
    }
 }, [DD])

  const isCaptcha = process.env.REACT_APP_CAPTCHA;
  const SocialIcon = [
    { iconStatus: true, link: "", image: mail, name: "mail" },
    { iconStatus: true, link: "", image: whatsapp, name: "whatsapp" },
    { iconStatus: true, link: "", image: telegram, name: "telegram" },
    { iconStatus: true, link: "", image: skype, name: "skype" },
    { iconStatus: true, link: "", image: instagram, name: "instagram" },
  ];
  const SocialContact = ["+918888899999", "+918888897779", "+91888884399"];
  const [confirmationCode, setConfirmationCode] = useState(
    Math.floor(1000 + Math.random() * 9000)
  );
  const [isValidationWrong, setIsValidationWrong] = useState(false);

  const [support, setSupport] = useState(process.env.REACT_APP_WHATSAPP === "true" ? 'whatsapp' : 
                                         process.env.REACT_APP_EMAIL === "true" ? "email" : 
                                         process.env.REACT_APP_TELEGRAM === "true" ? "telegram" :
                                         process.env.REACT_APP_SKYPE === "true" ? "skype" :
                                         process.env.REACT_APP_INSTAGRAM === "true" ? "instagram" : "whatsapp" )
  const [privacyPopup, setPrivacyPopup] = useState(false);
  const [termsPopup, setTermsPopup] = useState(false);
  const [rulesPopup, setRulesPopup] = useState(false);
  const [kycPopup, setKycPopup] = useState(false);
  const [responsibleGamePopup, setResponsibleGamePopup] = useState(false);
  const [aboutPopup, setAboutPopup] = useState(false);
  const [selfExclusionPopup, setSelfExclusionPopup] = useState(false);
  const [underagePolicyPopup, setUnderagePolicyPopup] = useState(false);
// console.log("fffffffffffff : ", loginBackGroundColor(DD?.colorSchema));

  const handelInputChange = (e: any) => {
    const { name, value } = e.target;
    setIsValidationWrong(false);
    setFormData({ ...formData, [name]: value });
  };
  const handelSubmit = async (e: any) => {
    e.preventDefault();
    if (
      Validator.current.allValid() &&
      (confirmationCode === parseInt(formData.validationCode) ||
        isCaptcha === "false")
    ) {
      setIsValidationWrong(false);
      // const ipDetails = await getApiLink({
      //   api: "https://ipapi.co/json/?key=wfzfdfQ4cUsaTVURUkj2oF6L51Y4jNE0IM2yE0V2xMyMkxjTsr",
      // });
      // console.log("call ip:  ipDetails :", ipDetails);

      let data = {
        api: USER_API.LOGIN,
        value: {
          user_name: formData.username,
          password: formData.password,
          domain: window.location.hostname,
          // domain:"nayaludish.com",
          // city: ipDetails?.data?.city,
          // state: ipDetails?.data?.region,
          // country: ipDetails?.data?.country_name,
          // ISP: ipDetails?.data?.org
        },
      };
      await postApi(data)
        .then(function (loginData) {
          if (loginData) {
            //  notifyMessage(loginData.data.message)

            console.log("::::::::;", loginData);
            let HeaderData = {
              ...loginData.data.data.roleAccess,
              user_name: loginData.data.data.user_name,
              remaining_balance: loginData.data.data?.balance,
              ...loginData.data.data,
            };
            dispatch({ type: "HEADER_DETAILS", payload: HeaderData });
            cookies.set("skyTokenFront", loginData.data.data.token, {
              domain: process.env.REACT_APP_COOKIE_DOMAIN,
              path: "/",
            });
            dispatch({
              type: "AUTHENTICATION",
              payload: {
                isLogin: true,
                token: loginData.data.data.token,
                changePassword: loginData.data.data.newPassword,
              },
            });
            if (OpenModal) {
              window.location.reload();
            }
            setOpenModal(false);
            if (loginData.data.data.newPassword === true) {
              navigate("change/password");
            }
          }
        })
        .catch((err) => {
          notifyError(err.response.data.message);
          setIsValidationWrong(false);
          setConfirmationCode(Math.floor(1000 + Math.random() * 9000));
          setFormData({ ...formData, validationCode: "" });
        });
    } else {
      debugger;
      Validator.current.showMessages();
      if (confirmationCode !== parseInt(formData.validationCode)) {
        setIsValidationWrong(true);
      }
      forceUpdate();
      setConfirmationCode(Math.floor(1000 + Math.random() * 9000));
    }
  };
  const Validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
    })
  );

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 992) {
        navigate("/");
      }
    }

    window.addEventListener("resize", handleResize);
    
    document.documentElement.style.setProperty('--login-page-bg', `${loginBackGroundColor(DD?.colorSchema)?.background}`);
  });

  return (
    <>
      {console.log("DD", DD)}

      {OpenModal ? (
        <div
          className={`${
            window.location.pathname === "/login" ? "login-screen" : ""
          } login_main login_main_absolute`}
        >
          <div
            className={`${
              window.location.pathname === "/login" ? "login-screen" : ""
            } login_main_popup`}
            style={styleObjectGetBG(DD?.colorSchema)}
          >
            <div
              className="login_popup_image"
              style={styleObjectGetLoginImage(DD?.loginImage) || {}}
            ></div>
            <div className="login_form_main">
              {window.location.pathname === "/login" ? (
                <a id="close" className="close" href="/"></a>
              ) : (
                <a
                  id="close"
                  className="close"
                  onClick={() => setOpenModal(false)}
                ></a>
              )}
              {/* <h3 style={styleObjectGetColor(DD?.colorSchema)} className="form_title"> Please login to continue </h3> */}
              <form className="login_form" onSubmit={(e) => handelSubmit(e)}>
                <InputGroup
                  name="username"
                  value={formData.username}
                  type="text"
                  onChange={handelInputChange}
                  placeholder="Username"
                  errorValidation={Validator.current.message(
                    "userName",
                    formData.username,
                    "required"
                  )}
                />
                <InputGroupPass
                  name="password"
                  value={formData.password}
                  type="password"
                  onChange={handelInputChange}
                  placeholder="Password"
                  errorValidation={Validator.current.message(
                    "password",
                    formData.password,
                    "required"
                  )}
                />
                {isCaptcha !== "false" && (
                  <div className="validation">
                    <InputGroup
                      name="validationCode"
                      value={formData.validationCode}
                      type="number"
                      onChange={handelInputChange}
                      placeholder="Valida tion Code"
                      errorValidation={Validator.current.message(
                        "validationCode",
                        formData.validationCode,
                        "required"
                      )}
                    />
                    <div
                      style={styleObjectGetColor(DD?.colorSchema)}
                      className="validation_code"
                    >
                      <h3>{confirmationCode}</h3>
                    </div>
                  </div>
                )}
                {isValidationWrong ? (
                  <span className="error" style={{ color: "red" }}>
                    invalid verification code
                  </span>
                ) : (
                  ""
                )}
                <button type="submit" onSubmit={(e) => handelSubmit(e)}>
                  Login
                  <span />
                </button>
              </form>
            </div>
            {window.location.pathname === "/login" && (
              <div className="login_footer mobile_view">
                <div className="login_footer_social">
                  {SocialIcon.map((item) => (
                    <div className="social_icon">
                      <img src={item.image} alt={item.name} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {window.location.pathname === "/login" && (
            <div className="login_footer">
              <div className="login_footer_social">
                {SocialIcon.map((item) => (
                  <div className="social_icon">
                    <img src={item.image} alt={item.name} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`${
            window.location.pathname === "/login" ? "login-screen" : ""
          } login_main mobile_screen backGround`}
          // style={styleObjectGetBG(DD?.colorSchema)}
          // style={loginBackGroundColor(DD?.colorSchema)}
        >
          <div
            className={`${
              window.location.pathname === "/login" ? "login-screen" : ""
            } login_main_popup`}
            // style={loginBackGroundColor(DD?.colorSchema)}
          >
            <div
              className="login_popup_image"
              style={
                styleObjectGetBGIMageLoginImage(DD?.mobileLoginImage) || {}
              }
            ></div>
            <div className="login_form_main">
              {window.location.pathname === "/login" ? (
                <a id="close" className="close" href="/"></a>
              ) : (
                <a
                  id="close"
                  className="close"
                  onClick={() => setOpenModal(false)}
                ></a>
              )}
              {/* <h3 style={styleObjectGetColor(DD?.colorSchema)} className="form_title"> Please login to continue </h3> */}
              <form className="login_form" onSubmit={(e) => handelSubmit(e)}>
                <InputGroup
                  name="username"
                  value={formData.username}
                  type="text"
                  onChange={handelInputChange}
                  placeholder="Username"
                  errorValidation={Validator.current.message(
                    "userName",
                    formData.username,
                    "required"
                  )}
                />
                <InputGroupPass
                  name="password"
                  value={formData.password}
                  type="password"
                  onChange={handelInputChange}
                  placeholder="Password"
                  errorValidation={Validator.current.message(
                    "password",
                    formData.password,
                    "required"
                  )}
                />
                {isCaptcha !== "false" && (
                  <div className="validation">
                    <InputGroup
                      name="validationCode"
                      value={formData.validationCode}
                      type="number"
                      onChange={handelInputChange}
                      placeholder="Validation Code"
                      errorValidation={Validator.current.message(
                        "validationCode",
                        formData.validationCode,
                        "required"
                      )}
                    />
                    <div
                      style={styleObjectGetColor(DD?.colorSchema)}
                      className="validation_code"
                    >
                      <h3>{confirmationCode}</h3>
                    </div>
                  </div>
                )}
                {isValidationWrong ? (
                  <span className="error" style={{ color: "red" }}>
                    invalid verification code
                  </span>
                ) : (
                  ""
                )}
                <button
                  type="submit"
                  style={loginBackGroundColor(DD?.colorSchema, true)}
                  onSubmit={(e) => handelSubmit(e)}
                >
                  Login
                  <span />
                </button>
              </form>
            </div>
          </div>
          {window.location.pathname === "/login" && (
            <div
              className="login_footer"
              // style={loginBackGroundColor(DD?.colorSchema)}
            >
              <div className="footer">
                {(process.env.REACT_APP_POLICY_LINK === "true" || typeof process.env.REACT_APP_POLICY_LINK === 'undefined') &&
                
                <ul className="policy-link">
                  <li>
                    <a onClick={() => setPrivacyPopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>Privacy Policy</a>
                  </li>
                  <li>
                    <a onClick={() => setTermsPopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>
                      Terms and Conditions
                    </a>
                  </li>
                  <li>
                    <a onClick={() => setRulesPopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>
                      Rules and Regulations
                    </a>
                  </li>
                  <li>
                    <a onClick={() => setKycPopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>KYC</a>
                  </li>
                  <li>
                    <a onClick={() => setResponsibleGamePopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>
                      Responsible Gaming
                    </a>
                  </li>
                  <li>
                    <a onClick={() => setAboutPopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>About Us</a>
                  </li>
                  <li>
                    <a onClick={() => setSelfExclusionPopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>
                      Self-exclusion Policy
                    </a>
                  </li>
                  <li>
                    <a onClick={() => setUnderagePolicyPopup(true)} style={loginPolicyTextColor(DD?.colorSchema)}>
                      Underage Policy
                    </a>
                  </li>
                </ul>
}
                {true && (
                  <div className="footer_support">
                    <div className="footer_support_item">
                      <div className="extend-btn">
                        <img
                          src="/images/support.svg"
                          title="customer"
                          className="support-customer"
                        />
                        <a
                          href={`https://api.whatsapp.com/send?phone=${DD?.whatsapp?.length > 0 ? DD?.whatsapp[0] : 0}`}
                          target="_blank"
                        >
                          Customer support1
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${DD?.whatsapp?.length > 1 ? DD?.whatsapp[1] : 0}`}
                          target="_blank"
                          className="split-line"
                        >
                          support2
                        </a>
                      </div>
                      { (false && process.env.REACT_APP_WHATSAPP !== "false") && 
                      <div className="extend-btn">
                        <img
                          src="/images/whatsapp.svg"
                          title="WhatsApp"
                          className="support-whatsapp"
                        />
                        {DD
                          ? DD.whatsapp &&
                            DD.whatsapp.map((item: any, i: any) => (
                              <>
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${item}`}
                                  target="_blank"
                                >
                                  {item}
                                </a>
                                {i == "0" || i == "1" ? "| " : ""}
                              </>
                            ))
                          : "00"}
                        {/* <a href="https://api.whatsapp.com/send?phone=917700005178" target="_blank">+917700005178</a>
                                              <a href="https://api.whatsapp.com/send?phone=917700002943" target="_blank" className="split-line">+917700002943</a> */}
                      </div>
                      }
                    </div>
                    { process.env.REACT_APP_TELEGRAM !== "false" && 
                      <div className="extend-btn">
                        <img
                          src="/images/telegram.svg"
                          title="Telegram"
                          className="support-Telegram"
                        />
                        {DD
                          ? DD.telegram &&
                            DD.telegram.map((item: any, i: any) => (
                              <>
                                <a href={`http://www.t.me/${item}`} target="_blank">
                                  {item}
                                </a>
                                {i == "0" || i == "1" ? "| " : ""}
                              </>
                            ))
                          : "00"}
                        {/* <a href="http://www.t.me/skyexchange001" target="_blank">skyexchange001</a>
                                            <a href="http://www.t.me/skyexchange002" target="_blank" className="split-line">skyexchange002</a> */}
                      </div>
                    }
                    <div className="footer_support_item support-social ">
                      { process.env.REACT_APP_SKYPE !== "false" && 
                        <div className="extend-btn">
                          <img
                            src="/images/skype.svg"
                            title="Skype"
                            className="support-customer"
                            />
                          <a href="skype:skyexchangeofficial?chat" target="_blank">
                            Skype
                          </a>
                        </div>
                      }
                      { process.env.REACT_APP_EMAIL !== "false" && 
                        <div className="extend-btn">
                          <img
                            src="/images/send.svg"
                            title="Email"
                            className="support-mail"
                            />
                          <a href="mailto:info@skyexchange.com" target="_blank">
                            Email
                          </a>
                        </div>
                      }
                      { process.env.REACT_APP_INSTAGRAM !== "false" && 
                        <div className="extend-btn">
                          <img
                            src="/images/instagram.svg"
                            title="Instagram"
                            className="support-instagram"
                          />
                          <a
                            href="https://www.instagram.com/sky_exch_?igshid=YmMyMTA2M2Y=/"
                            target="_blank"
                          >
                            Instagram
                          </a>
                        </div>
                      }
                    </div>
                  </div>
                )}
                
                {
                // (process.env.REACT_APP_WHATSAPP === "true" || process.env.REACT_APP_EMAIL === "true" || process.env.REACT_APP_TELEGRAM === "true" || process.env.REACT_APP_SKYPE === "true" || process.env.REACT_APP_INSTAGRAM === "true") 
                false &&
                  <div className="social_tab">
                      <div className="row">
                          <div className="col-12 support-wrap">
                              <ul className="nav nav-pills" id="pills-tab" role="tablist" data-mouse="hover">
                                  {process.env.REACT_APP_WHATSAPP !== "false" && 
                                    <li className="nav-item">
                                        <a
                                            onMouseEnter={() => setSupport('whatsapp')}
                                            className={` nav-link ${support === "whatsapp" ? "open" : ""} `}
                                            id="pills-whatsappp" data-toggle="pill" href="#pills-whatsapp" role="tab" aria-controls="pills-whatsapp" aria-selected="false">
                                            <img src="./images/whatsapp.svg" alt="" />
                                        </a>
                                    </li>
                                  }
                                  {process.env.REACT_APP_EMAIL !== "false" &&
                                    <li className="nav-item">
                                        <a
                                            onMouseEnter={() => setSupport('email')}
                                            className={` nav-link ${support === "email" ? "open" : ""} `}
                                            id="pills-mail" data-toggle="pill" href="#pills-mail" role="tab" aria-controls="pills-mail" aria-selected="true">
                                            <img src="./images/supportemail.svg" alt="" />
                                        </a>
                                    </li>
                                  }
                                  {process.env.REACT_APP_TELEGRAM !== "false" &&
                                    <li className="nav-item">
                                        <a
                                            onMouseEnter={() => setSupport('telegram')}
                                            className={` nav-link ${support === "telegram" ? "open" : ""} `}
                                            id="pills-telegram-tab" data-toggle="pill" href="#pills-telegram" role="tab" aria-controls="pills-telegram" aria-selected="false">
                                            <img src="./images/telegram.svg" alt="" />
                                        </a>
                                    </li>
                                  }
                                  {process.env.REACT_APP_SKYPE !== "false" &&
                                    <li className="nav-item">
                                        <a
                                            onMouseEnter={() => setSupport('skype')}
                                            className={` nav-link ${support === "skype" ? "open" : ""} `}
                                            id="pills-skyep-tab" data-toggle="pill" href="#pills-skyep" role="tab" aria-controls="pills-skyep" aria-selected="false">
                                            <img src="./images/skype.svg" alt="" />
                                        </a>
                                    </li>
                                  }
                                  {process.env.REACT_APP_INSTAGRAM !== "false" &&
                                    <li className="nav-item">
                                        <a
                                            onMouseEnter={() => setSupport('instagram')}
                                            className={` nav-link ${support === "instagram" ? "open" : ""} `}
                                            id="pills-insta-tab" data-toggle="pill" href="#pills-insta" role="tab" aria-controls="pills-insta" aria-selected="false">
                                            <img src="./images/instagram.svg" alt="" />
                                        </a>
                                    </li>
                                  }
                              </ul>
                              <div className="support-info">
                                  <div id="supportDetail_whatsapp" className={` support-detail ${support === "whatsapp" ? "open" : ""} `}   >{DD ? DD.whatsapp && DD.whatsapp.map((item: any) => (<a ><span>{item}</span></a>)) : ''}</div>
                                  <div id="supportDetail_email" className={` support-detail ${support === "email" ? "open" : ""} `}> {DD ? DD.email && DD.email.map((item: any) => (<a href={`mailto:${item}`}>{item}</a>)) : ''}</div>
                                  <div id="supportDetail_telegram" className={` support-detail ${support === "telegram" ? "open" : ""} `}>{DD ? DD.telegram && DD.telegram.map((item: any) => (<a ><span>{item}</span></a>)) : ''}</div>
                                  <div id="supportDetail_skype" className={` support-detail ${support === "skype" ? "open" : ""} `}>  {DD ? DD.skype && DD.skype.map((item: any) => (<a href={`unsafe:skype:${item}?chat`}>{item}</a>)) : ''}</div>
                                  <div id="supportDetail_instagram" className={` support-detail ${support === "instagram" ? "open" : ""} `}>  {DD ? DD.instagram && DD.instagram.map((item: any) => (<a target="_blank" className="ui-link">{item}</a>)) : ''}</div>
                              </div>
                          </div>
                      </div>
                  </div>
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* footer poups */}

      {privacyPopup && (
        <CommonPopup
          title={`Rules of Fancy Bets`}
          OpenModal={privacyPopup}
          closeModel={() => setPrivacyPopup(false)}
          customclass="footerpopup"
        >
          <PrivacyPopup />
        </CommonPopup>
      )}

      {termsPopup && (
        <CommonPopup
          title={`Terms & Conditions`}
          OpenModal={termsPopup}
          closeModel={() => setTermsPopup(false)}
          customclass="footerpopup"
        >
          <TermsPopup />
        </CommonPopup>
      )}
      {rulesPopup && (
        <CommonPopup
          title={`Exchange Rules and Regulations`}
          OpenModal={rulesPopup}
          closeModel={() => setRulesPopup(false)}
          customclass="footerpopup"
        >
          <RulesPopup />
        </CommonPopup>
      )}
      {kycPopup && (
        <CommonPopup
          title={`KYC`}
          OpenModal={kycPopup}
          closeModel={() => setKycPopup(false)}
          customclass="footerpopup"
        >
          <KYCPopup />
        </CommonPopup>
      )}
      {responsibleGamePopup && (
        <CommonPopup
          title={`Responsible Gaming`}
          OpenModal={responsibleGamePopup}
          closeModel={() => setResponsibleGamePopup(false)}
          customclass="footerpopup"
        >
          <ResponsibleGamePopup />
        </CommonPopup>
      )}
      {aboutPopup && (
        <CommonPopup
          title={`About Us`}
          OpenModal={aboutPopup}
          closeModel={() => setAboutPopup(false)}
          customclass="footerpopup"
        >
          <AboutPopup />
        </CommonPopup>
      )}
      {selfExclusionPopup && (
        <CommonPopup
          title={`Self-Exclusion Policy`}
          OpenModal={selfExclusionPopup}
          closeModel={() => setSelfExclusionPopup(false)}
          customclass="footerpopup"
        >
          <SelfExclusionPopup />
        </CommonPopup>
      )}
      {underagePolicyPopup && (
        <CommonPopup
          title={`Underage Gaming Policy – ${DD.domain}`}
          OpenModal={underagePolicyPopup}
          closeModel={() => setUnderagePolicyPopup(false)}
          customclass="footerpopup"
        >
          <UnderagePolicyPopup />
        </CommonPopup>
      )}
    </>
  );
};

export default Login;

export const InputGroup = (props: any) => {
  const { type, placeholder, name, value, onChange, errorValidation } = props;
  return (
    <div className="input_group">
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e)}
        placeholder={placeholder}
      />
      {errorValidation ? (
        <span className="error" style={{ color: "red" }}>
          {errorValidation}
        </span>
      ) : (
        ""
      )}
    </div>
  );
};
export const InputGroupPass = (props: any) => {
  const { type, placeholder, name, value, onChange, errorValidation } = props;
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="input_group">
      <div style={{ position: "relative" }}>
        <input
          type={showPass ? "text" : type}
          name={name}
          value={value}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
        />
        <span
          onClick={() => setShowPass(!showPass)}
          style={{
            position: "absolute",
            right: "5px",
            top: "50%",
            transform: "translate(0, -50%)",
          }}
        >
          <img
            src={showPass ? "./images/eye_close.png" : "./images/eye.png"}
            alt=""
          />
        </span>
      </div>
      {errorValidation ? (
        <span className="error" style={{ color: "red" }}>
          {errorValidation}
        </span>
      ) : (
        ""
      )}
    </div>
  );
};
