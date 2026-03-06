import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SimpleReactValidator from "simple-react-validator";
import Cookies from "universal-cookie";
import { ADMIN_API } from "../common/common";
import { getBrowser, getImageUrl } from "../common/Funcation";
import {
  loginBackGroundColor,
  loginPolicyTextColor,
  styleObjectGetBG,
  styleObjectGetBGasColor,
  styleObjectGetColor,
  styleObjectGetLoginImage,
} from "../common/StyleSeter";
import { getApiLink, notifyError, postApi } from "../service";
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
import login from "./../assets/images/login-new.png";
import user from "./../assets/images/usename-4.svg";
import password from "./../assets/images/password-4.svg";

const cookies = new Cookies();

const Login = () => {
  const [, updateState] = React.useState({});
  const [mobile, setMobile] = React.useState(false);
  const [contact, setContact] = React.useState("mail");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const DD = useSelector((e: any) => e.domainDetails);
  const isCaptcha = process.env.REACT_APP_CAPTCHA;
  const isB2C = process.env.REACT_APP_B2C;
  // const isB2C = "false";
  // const isB2C = 'true';
  const isDownloadFooter = process.env.REACT_APP_DOWNLOAD_FOOTER;
  const [showPassword, setShowPassword] = useState(false);

  const [isError, setIsError] = useState({ flag: false, msg: "" });
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    validationCode: "",
  });

  console.log("DD", DD);

  const SocialIcon = [
    { iconStatus: true, link: "", image: mail, name: "mail" },
    { iconStatus: true, link: "", image: whatsapp, name: "whatsapp" },
    { iconStatus: true, link: "", image: telegram, name: "telegram" },
    { iconStatus: true, link: "", image: skype, name: "skype" },
    { iconStatus: true, link: "", image: instagram, name: "instagram" },
  ];
  const SocialContact = DD?.email;
  const whatsappContact = DD?.whatsapp;
  const Telegram = DD?.telegram;
  const Skype = DD?.skype;
  const Instagram = DD?.instagram;

  const [confirmationCode, setConfirmationCode] = useState(
    Math.floor(1000 + Math.random() * 9000)
  );
  const [isValidationWrong, setIsValidationWrong] = useState(false);
  const handelInputChange = (e: any) => {
    const { name, value } = e.target;
    setIsValidationWrong(false);
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    document.body.classList.add("login_screen");
    document.documentElement.classList.add("login_screen");
    handleResize();
    function handleResize() {
      debugger;
      if (window.outerWidth < 577) {
        setMobile(true);
      } else {
        setMobile(false);
      }
    }
    window.addEventListener("resize", handleResize);
  }, []);

  const handelSubmit = async (e: any) => {
    let systemDetails = getBrowser();

    console.log(systemDetails);

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
        api: ADMIN_API.LOGIN,
        value: {
          user_name: formData.username,
          password: formData.password,
          browser_detail:
            systemDetails.BrowserName + " V" + systemDetails.BrowserVersion,
          systemDetail: systemDetails.OSname + " V" + systemDetails.OSversion,
          // city: ipDetails?.data?.city,
          // state: ipDetails?.data?.region,
          // country: ipDetails?.data?.country_name,
          // ISP: ipDetails?.data?.org,
          domain: window.location.hostname,
        },
      };
      await postApi(data)
        .then(function (loginData) {
          if (loginData) {
            let HeaderData = {
              ...loginData.data.data.roleAccess,
              user_name: loginData.data.data.user_name,
              remaining_balance: loginData.data.data.remaining_balance,
              depositeCount: loginData.data.data.depositeCount,
              withdrawaCount: loginData.data.data.withdrawaCount,
            };
            dispatch({ type: "HEADER_DETAILS", payload: HeaderData });
            dispatch({
              type: "PAYMENT_COUNT",
              payload: {
                depositeCount: loginData.data.data.depositeCount,
                withdrawaCount: loginData.data.data.withdrawaCount,
              },
            });

            cookies.set("skyToken", loginData.data.data.token, {
              domain: process.env.REACT_APP_COOKIE_DOMAIN,
              path: "/",
            });
            dispatch({
              type: "AUTHENTICATION",
              payload: { isLogin: true, token: loginData.data.data.token },
            });
            document.body.classList.remove("login_screen");
            document.documentElement.classList.remove("login_screen");
            if (loginData.data.data.newPassword === true) {
              navigate("change/password");
            } else {
              navigate("/");
            }
          }
        })
        .catch((err) => {
          if (mobile) {
            setIsError({
              flag: true,
              msg: err.response.data.message,
            });
          } else {
            notifyError(err.response.data.message);
          }
          setConfirmationCode(Math.floor(1000 + Math.random() * 9000));
          setIsValidationWrong(false);
          setFormData({ ...formData, validationCode: "" });
          if (err.response.data.statusCode === 401) {
          }
        });
    } else {
      Validator.current.showMessages();
      if (confirmationCode !== parseInt(formData.validationCode)) {
        setIsValidationWrong(true);
      }
      setConfirmationCode(Math.floor(1000 + Math.random() * 9000));
      forceUpdate();
    }
  };
  const Validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
    })
  );

  const downloadFile = () => {
    const imageUrl = `${process.env.REACT_APP_BASE_POINT}admin.apk`;
    // Create a new XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";

    xhr.onload = () => {
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(xhr.response);
      a.download = "admin.apk"; // Set the desired file name
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    xhr.open("GET", imageUrl);
    xhr.send();
  };

  const [privacyPopup, setPrivacyPopup] = useState(false);
  const [termsPopup, setTermsPopup] = useState(false);
  const [rulesPopup, setRulesPopup] = useState(false);
  const [kycPopup, setKycPopup] = useState(false);
  const [responsibleGamePopup, setResponsibleGamePopup] = useState(false);
  const [aboutPopup, setAboutPopup] = useState(false);
  const [selfExclusionPopup, setSelfExclusionPopup] = useState(false);
  const [underagePolicyPopup, setUnderagePolicyPopup] = useState(false);
  const [support, setSupport] = useState("whatsapp");

  return !window.location.hostname.includes("msa.") &&
    (!isB2C || isB2C === "false") ? (
    <>
      <Helmet>
        <link rel="icon" href={getImageUrl(DD?.favicon)} />
        <title>{DD?.title}</title>
      </Helmet>
      {!mobile ? (
        <div
          className="login_main"
          style={styleObjectGetBG(mobile ? DD?.colorSchema : {})}
        >
          <div
            className="login_main_popup"
            style={styleObjectGetBG(DD?.colorSchema)}
          >
            <div
              className="login_popup_image"
              style={
                styleObjectGetLoginImage(
                  mobile ? DD?.mobileLoginImage : DD?.loginImage
                ) || {}
              }
            ></div>
            <div className="login_form_main">
              <h3
                style={styleObjectGetColor(DD?.colorSchema)}
                className="form_title"
              >
                {" "}
                Agent Here{" "}
              </h3>
              <form className="login_form" onSubmit={(e) => handelSubmit(e)}>
                <InputGroup
                  name="username"
                  value={formData.username}
                  type="text"
                  onChange={handelInputChange}
                  placeholder="Enter your Username"
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
                  placeholder="Enter your Password"
                  showPass={showPassword}
                  setShowPass={setShowPassword}
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
                <button type="submit" onSubmit={(e) => handelSubmit(e)}>
                  Login
                </button>
              </form>
            </div>
          </div>
          <div className="login_footer">
            {mobile ? (
              <>
                <div className="login_footer_social">
                  {SocialIcon.map((item) => (
                    <div
                      className={`social_icon ${
                        contact === item.name ? "active" : ""
                      } `}
                      onClick={() => setContact(item.name)}
                    >
                      <img src={item.image} alt={item.name} />
                    </div>
                  ))}
                </div>
                <div className="login_footer_contact">
                  {contact === "mail" &&
                    SocialContact?.map((item: any) => <span>{item}</span>)}

                  {contact === "whatsapp" &&
                    whatsappContact?.map((item: any) => <span>{item}</span>)}

                  {contact === "telegram" &&
                    Telegram?.map((item: any) => <span> {item}</span>)}

                  {contact === "skype" &&
                    Skype?.map((item: any) => <span> {item}</span>)}

                  {contact === "instagram" &&
                    Instagram?.map((item: any) => <span> {item}</span>)}
                </div>
                {isDownloadFooter && (
                  <div className=" footer_power">
                    <h3 id="powerWrapW">
                      <span>Powered by</span>
                      <div className="powerby"></div>
                    </h3>
                    <div className="licence_embed">
                      <a onClick={downloadFile}>
                        <img src="./images/download_app.png" alt="" />
                      </a>
                      <p style={{ marginTop: "5px" }}>
                        v1.07 - 2020-11-11 - 8.2MB
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="login_footer_social">
                  {SocialIcon.map((item) => (
                    <div className="social_icon">
                      <img src={item.image} alt={item.name} />
                    </div>
                  ))}
                </div>
                <div className="login_footer_contact">
                  {SocialContact?.map((item: any) => (
                    <span>{item}</span>
                  ))}
                </div>
                {isDownloadFooter && (
                  <div className=" footer_power">
                    <h3 id="powerWrapW">
                      <span>Powered by</span>
                      <div className="powerby"></div>
                    </h3>
                    <div className="licence_embed">
                      <a onClick={downloadFile}>
                        <img src="./images/download_app.png" alt="" />
                      </a>
                      <p style={{ marginTop: "5px" }}>
                        v1.07 - 2020-11-11 - 8.2MB
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`${
            window.location.pathname === "/login" ? "login-screen" : ""
          } login_main mobile_screen`}
          style={loginBackGroundColor(DD?.colorSchema)}
        >
          <div
            className={`${
              window.location.pathname === "/login" ? "login-screen" : ""
            } login_main_popup`}
            style={loginBackGroundColor(DD?.colorSchema)}
          >
            <div
              className="login_popup_image"
              style={styleObjectGetLoginImage(DD?.mobileLoginImage) || {}}
            ></div>
            <div className="login_form_main">
              {window.location.pathname === "/login" ? (
                <a
                  id="close"
                  className="close"
                  href="/"
                  style={{ display: "none" }}
                ></a>
              ) : (
                <a id="close" className="close" style={{ display: "none" }}></a>
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
                  placeholder="Enter your Password"
                  showPass={showPassword}
                  setShowPass={setShowPassword}
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
                {isError.flag && (
                  <span className="error" style={{ color: "red", fontSize: "35px", paddingBottom:"30px" }}>
                    {isError.msg}
                  </span>
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
              style={styleObjectGetBG(DD?.colorSchema)}
            >
              <div className="footer">
                <ul className="policy-link">
                  <li>
                    <a
                      onClick={() => setPrivacyPopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setTermsPopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      Terms and Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setRulesPopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      Rules and Regulations
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setKycPopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      KYC
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setResponsibleGamePopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      Responsible Gaming
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setAboutPopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setSelfExclusionPopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      Self-exclusion Policy
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => setUnderagePolicyPopup(true)}
                      style={loginPolicyTextColor(DD?.colorSchema)}
                    >
                      Underage Policy
                    </a>
                  </li>
                </ul>

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
                          href={`https://api.whatsapp.com/send?phone=${
                            DD?.whatsapp?.length > 0 ? DD?.whatsapp[0] : 0
                          }`}
                          target="_blank"
                        >
                          Customer support1
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${
                            DD?.whatsapp?.length > 1 ? DD?.whatsapp[1] : 0
                          }`}
                          target="_blank"
                          className="split-line"
                        >
                          support2
                        </a>
                      </div>
                      {false && (
                        <div className="extend-btn">
                          <img
                            src="/images/whatsapp.svg"
                            title="WhatsApp"
                            className="support-whatsapp"
                          />
                          {/* <a href="https://api.whatsapp.com/send?phone=917700005178" target="_blank">+917700005178</a>
                                            <a href="https://api.whatsapp.com/send?phone=917700002943" target="_blank" className="split-line">+917700002943</a> */}
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
                        </div>
                      )}
                    </div>
                    <div className="extend-btn">
                      <img
                        src="/images/telegram.svg"
                        title="Telegram"
                        className="support-Telegram"
                      />
                      {/* <a href="http://www.t.me/skyexchange001" target="_blank">skyexchange001</a>
                                          <a href="http://www.t.me/skyexchange002" target="_blank" className="split-line">skyexchange002</a> */}
                      {DD
                        ? DD.telegram &&
                          DD.telegram.map((item: any, i: any) => (
                            <>
                              <a
                                href={`http://www.t.me/${item}`}
                                target="_blank"
                              >
                                {item}
                              </a>
                              {i == "0" || i == "1" ? "| " : ""}
                            </>
                          ))
                        : "00"}
                    </div>

                    <div className="footer_support_item support-social ">
                      <div className="extend-btn">
                        <img
                          src="/images/skype.svg"
                          title="Skype"
                          className="support-customer"
                        />
                        <a
                          href="skype:skyexchangeofficial?chat"
                          target="_blank"
                        >
                          Skype
                        </a>
                      </div>
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
                    </div>
                  </div>
                )}
                {false && (
                  <div className="social_tab">
                    <div className="row">
                      <div className="col-12 support-wrap">
                        <ul
                          className="nav nav-pills"
                          id="pills-tab"
                          role="tablist"
                          data-mouse="hover"
                        >
                          <li className="nav-item">
                            <a
                              onMouseEnter={() => setSupport("whatsapp")}
                              className={` nav-link ${
                                support === "whatsapp" ? "open" : ""
                              } `}
                              id="pills-whatsappp"
                              data-toggle="pill"
                              href="#pills-whatsapp"
                              role="tab"
                              aria-controls="pills-whatsapp"
                              aria-selected="false"
                            >
                              <img src="./images/whatsapp.svg" alt="" />
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              onMouseEnter={() => setSupport("email")}
                              className={` nav-link ${
                                support === "email" ? "open" : ""
                              } `}
                              id="pills-mail"
                              data-toggle="pill"
                              href="#pills-mail"
                              role="tab"
                              aria-controls="pills-mail"
                              aria-selected="true"
                            >
                              <img src="./images/supportemail.svg" alt="" />
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              onMouseEnter={() => setSupport("telegram")}
                              className={` nav-link ${
                                support === "telegram" ? "open" : ""
                              } `}
                              id="pills-telegram-tab"
                              data-toggle="pill"
                              href="#pills-telegram"
                              role="tab"
                              aria-controls="pills-telegram"
                              aria-selected="false"
                            >
                              <img src="./images/telegram.svg" alt="" />
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              onMouseEnter={() => setSupport("skype")}
                              className={` nav-link ${
                                support === "skype" ? "open" : ""
                              } `}
                              id="pills-skyep-tab"
                              data-toggle="pill"
                              href="#pills-skyep"
                              role="tab"
                              aria-controls="pills-skyep"
                              aria-selected="false"
                            >
                              <img src="./images/skype.svg" alt="" />
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              onMouseEnter={() => setSupport("instagram")}
                              className={` nav-link ${
                                support === "instagram" ? "open" : ""
                              } `}
                              id="pills-insta-tab"
                              data-toggle="pill"
                              href="#pills-insta"
                              role="tab"
                              aria-controls="pills-insta"
                              aria-selected="false"
                            >
                              <img src="./images/instagram.svg" alt="" />
                            </a>
                          </li>
                        </ul>
                        <div className="support-info">
                          <div
                            id="supportDetail_whatsapp"
                            className={` support-detail ${
                              support === "whatsapp" ? "open" : ""
                            } `}
                          >
                            {DD
                              ? DD.whatsapp &&
                                DD.whatsapp.map((item: any) => (
                                  <a>
                                    <span>{item}</span>
                                  </a>
                                ))
                              : ""}
                          </div>
                          <div
                            id="supportDetail_email"
                            className={` support-detail ${
                              support === "email" ? "open" : ""
                            } `}
                          >
                            {" "}
                            {DD
                              ? DD.email &&
                                DD.email.map((item: any) => (
                                  <a href={`mailto:${item}`}>{item}</a>
                                ))
                              : ""}
                          </div>
                          <div
                            id="supportDetail_telegram"
                            className={` support-detail ${
                              support === "telegram" ? "open" : ""
                            } `}
                          >
                            {DD
                              ? DD.telegram &&
                                DD.telegram.map((item: any) => (
                                  <a>
                                    <span>{item}</span>
                                  </a>
                                ))
                              : ""}
                          </div>
                          <div
                            id="supportDetail_skype"
                            className={` support-detail ${
                              support === "skype" ? "open" : ""
                            } `}
                          >
                            {" "}
                            {DD
                              ? DD.skype &&
                                DD.skype.map((item: any) => (
                                  <a href={`unsafe:skype:${item}?chat`}>
                                    {item}
                                  </a>
                                ))
                              : ""}
                          </div>
                          <div
                            id="supportDetail_instagram"
                            className={` support-detail ${
                              support === "instagram" ? "open" : ""
                            } `}
                          >
                            {" "}
                            {DD
                              ? DD.instagram &&
                                DD.instagram.map((item: any) => (
                                  <a target="_blank" className="ui-link">
                                    {item}
                                  </a>
                                ))
                              : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* footer poups */}
      {window.outerWidth < 576 && (
        <>
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
      )}
    </>
  ) : (
    <>
      {!isB2C || isB2C === "false" ? (
        <>
          <Helmet>
            <link rel="icon" href={getImageUrl(DD?.favicon)} />
            <title>{DD?.title}</title>
          </Helmet>
          <div className="login_main velki">
            <main
              className="h-full ml-0 flex-center justify-center bg-no-repeat bg-cover"
              style={{ minWidth: "100%" }}
            >
              <div className="form-size rounded-xl sm:flex justify-center items-center divide-x-0 sm:divide-x divide-white divide-opacity-30">
                <div className="logo-theme"></div>
                <div className="w-60 space-y-3 sm:pl-7">
                  <h3 className="lg-title text-white text-center">
                    <span className="text-3xl mr-2">Agent</span>Sign in
                  </h3>
                  {/* <form className='login_form' onSubmit={(e) => handelSubmit(e)}>
                                <InputGroup name='username' value={formData.username} type='text' onChange={handelInputChange} placeholder='Enter your Username' errorValidation={Validator.current.message('userName', formData.username, 'required')} />
                                <InputGroupPass name='password' value={formData.password} type="password" onChange={handelInputChange} placeholder='Enter your Password' showPass={showPassword} setShowPass={setShowPassword} errorValidation={Validator.current.message('password', formData.password, 'required')} />
                                {isCaptcha !== "false" && <div className='validation'>
                                    <InputGroup name='validationCode' value={formData.validationCode} type="text" onChange={handelInputChange} placeholder='Validation Code' errorValidation={Validator.current.message('validationCode', formData.validationCode, 'required')} />
                                    <div style={styleObjectGetColor(DD?.colorSchema)} className='validation_code'><h3>{confirmationCode}</h3></div>
                                </div>}
                                {isValidationWrong ? <span className="error" style={{ color: 'red' }}>invalid verification code</span> : ''}
                                <button type='submit' onSubmit={(e) => handelSubmit(e)}>Login</button>
                            </form> */}

                  <input
                    className="h-10 leading-10"
                    type="text"
                    name={"username"}
                    value={formData.username}
                    onChange={(e) => handelInputChange(e)}
                    placeholder="Enter your Username"
                  />
                  {Validator.current.message(
                    "userName",
                    formData.username,
                    "required"
                  ) ? (
                    <span className="error" style={{ color: "red" }}>
                      {Validator.current.message(
                        "userName",
                        formData.username,
                        "required"
                      )}
                    </span>
                  ) : (
                    ""
                  )}

                  <input
                    className="h-10 leading-10"
                    type="password"
                    name={"password"}
                    value={formData.password}
                    onChange={(e) => handelInputChange(e)}
                    placeholder="Enter your Password"
                  />
                  {Validator.current.message(
                    "password",
                    formData.password,
                    "required"
                  ) ? (
                    <span className="error" style={{ color: "red" }}>
                      {Validator.current.message(
                        "password",
                        formData.password,
                        "required"
                      )}
                    </span>
                  ) : (
                    ""
                  )}

                  <div className="relative">
                    <input
                      className="h-10 leading-10"
                      type="number"
                      name={"validationCode"}
                      value={formData.validationCode}
                      onChange={(e) => handelInputChange(e)}
                      placeholder="Validation Code"
                    />
                    <h3 className="absolute right-1 top-3 w-1/3">
                      {confirmationCode}
                    </h3>
                    {/* <input type="text" id="validationCode" pattern="[0-9]*" data-role="none" className="h-10 leading-10" placeholder="Validation Code" onChange={handelInputChange} autoComplete="off" inputMode="numeric" maxLength={4} onError={Validator.current.message('validationCode', formData.validationCode, 'required')} /> */}
                    {/* <img id="authenticateImage" src="https://msa.velkiex123.live/verifycode.gr?v=1710775362157" className="absolute right-1 top-3 w-1/3" /> */}
                    <input
                      id="valid"
                      name="valid"
                      type="hidden"
                      value="6876b222-2014-45a9-a562-28e98688fb7f"
                    />
                  </div>
                  {Validator.current.message(
                    "validationCode",
                    formData.validationCode,
                    "required"
                  ) ? (
                    <p
                      className="text-red-600 text-center sm:text-left"
                      style={{ color: "red", marginTop: "0" }}
                    >
                      {Validator.current.message(
                        "validationCode",
                        formData.validationCode,
                        "required"
                      )}
                    </p>
                  ) : (
                    ""
                  )}

                  <a
                    onClick={(e) => handelSubmit(e)}
                    id="loginBtn"
                    className="loginBtn btn btn-highlight w-full rounded-sm h-10 leading-10 text-black px-3 space-x-2"
                  >
                    <span className="text-base">Login</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            </main>
          </div>
        </>
      ) : (
        <>
          <Helmet>
            <link rel="icon" href={getImageUrl(DD?.favicon)} />
            <title>{DD?.title}</title>
          </Helmet>
          <div className="login-form">
            <div
              className="login-img"
              style={{
                background: `url(${login})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* <img src={login} alt="Login" /> */}
            </div>
            <div className="form-info">
              <form action="">
                <div className="logo-img">
                  <img src={getImageUrl(DD?.logo)} alt="logo" />
                </div>
                <h5>Welcome To Admin Login</h5>
                <div className="form-group">
                  <label htmlFor="">Username</label>
                  <div className="icon-input">
                    <input
                      className="h-10 leading-10"
                      type="text"
                      name={"username"}
                      value={formData.username}
                      onChange={(e) => handelInputChange(e)}
                      placeholder="Username"
                    />
                    <img src={user} alt="User" />
                  </div>
                  {Validator.current.message(
                    "userName",
                    formData.username,
                    "required"
                  ) ? (
                    <span className="error" style={{ color: "red" }}>
                      {Validator.current.message(
                        "userName",
                        formData.username,
                        "required"
                      )}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="">Password</label>
                  <div className="icon-input">
                    <input
                      className="h-10 leading-10"
                      type="password"
                      name={"password"}
                      value={formData.password}
                      onChange={(e) => handelInputChange(e)}
                      placeholder="Enter your Password"
                    />
                    <img src={password} alt="User" />
                  </div>
                  {Validator.current.message(
                    "password",
                    formData.password,
                    "required"
                  ) ? (
                    <span className="error" style={{ color: "red" }}>
                      {Validator.current.message(
                        "password",
                        formData.password,
                        "required"
                      )}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                {isError.flag && (
                  <span className="error" style={{ color: "red", fontSize: "16px" }}>
                    {isError.msg}
                  </span>
                )}
                <div className="form-group">
                  <a
                    onClick={(e) => handelSubmit(e)}
                    id="loginBtn"
                    className="loginBtn btn btn-highlight w-full rounded-sm h-10 leading-10 text-black px-3 space-x-2"
                  >
                    Login
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      ></path>
                    </svg>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </>
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
  const {
    type,
    placeholder,
    name,
    value,
    onChange,
    errorValidation,
    showPass,
    setShowPass,
  } = props;
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

// const Login = () => {

//     useEffect(() => {
//         document.body.classList.add('login_screen');
//         document.documentElement.classList.add('login_screen')
//     }, [])
// return (
//     <>
//         <div className='login_main velki'>
//             <main className="h-full ml-0 flex-center justify-center bg-no-repeat bg-cover" style={{ minWidth: "100%" }}>
//                 <div className="rounded-xl sm:flex justify-center items-center divide-x-0 sm:divide-x divide-white divide-opacity-30">
//                     <div className="logo-theme"></div>
//                     <div className="w-60 space-y-3 sm:pl-7">
//                         <h3 className="lg-title text-white text-center"><span className="text-3xl mr-2">Agent</span>Sign in</h3>
//                         <input className="h-10 leading-10" type="email" placeholder="Username" id="loginName" />
//                         <input className="h-10 leading-10" type="password" placeholder="Password" id="password" />
//                         <div className="relative">

//                             <input type="text" id="validCode" pattern="[0-9]*" data-role="none" className="h-10 leading-10" placeholder="Validation Code" autoComplete="off" inputMode="numeric" maxLength={4} />
//                             <img id="authenticateImage" src="https://msa.velkiex123.live/verifycode.gr?v=1710775362157" className="absolute right-1 top-3 w-1/3" />
//                             <input id="valid" name="valid" type="hidden" value="6876b222-2014-45a9-a562-28e98688fb7f" />
//                         </div>

//                         <a href="#" id="loginBtn" className="loginBtn btn btn-highlight w-full rounded-sm h-10 leading-10 text-black px-3 space-x-2">
//                             <span className="text-base">Login</span>
//                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
//                             </svg>
//                         </a>

//                         <p id="errorMsg" className="text-red-600 text-center sm:text-left" style={{ display: "none" }}></p>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     </>
// )
// }

// export default Login
