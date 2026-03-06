import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import SimpleReactValidator from "simple-react-validator";
import { ADMIN_API, COLOR_OPTION } from "../../../common/common";
import { Logout } from "../../../common/Funcation";
import { styleObjectBlackButton } from "../../../common/StyleSeter";
import ImageUpload from "../../../components/ImageUpload";
import { notifyError, notifyMessage, postApi } from "../../../service";
import { COLOR_OPTION_INTERFACE, WebSiteList } from "../interface";

function EditWebsites(this: any) {
  const [formData, setFormData] = useState<WebSiteList | any>({
    colorSchema: COLOR_OPTION[0].value,
    title: "",
    domain: "",
    favicon: "",
    logo: "",
    adminLogo: "",
    loginImage: "",
    mobileLoginImage: "",
    agentListUrl: "",
    email: ["", "", ""],
    whatsapp: ["", "", ""],
    telegram: ["", "", ""],
    instagram: ["", "", ""],
    skype: ["", "", ""],
    maintenanceMessage: "",
    agentMessage: "",
    userMessage: "",
    adminStatus: false,
    currency: "PTH",
    theme: "Emerald",
    status: false,
    change_password_on_first_login: false,
    cricket: {
      oddsLimit: { min: 1, max: 2 },
      bet_odds_limit: { min: 1, max: 2 },
      bet_bookmaker_limit: { min: 1, max: 2 },
      bet_fancy_limit: { min: 1, max: 2 },
      bet_premium_limit: { min: 1, max: 2 },
    },
    soccer: {
      oddsLimit: { min: 1, max: 2 },
      bet_odds_limit: { min: 1, max: 2 },
      bet_bookmaker_limit: { min: 1, max: 2 },
      bet_premium_limit: { min: 1, max: 2 },
    },
    tennis: {
      oddsLimit: { min: 1, max: 2 },
      bet_odds_limit: { min: 1, max: 2 },
      bet_bookmaker_limit: { min: 1, max: 2 },
      bet_premium_limit: { min: 1, max: 2 },
    },
  });

  const [SelectedColor, setSelectedColor] = useState<COLOR_OPTION_INTERFACE>(
    COLOR_OPTION.find((_) => _.value === formData.colorSchema) ||
      COLOR_OPTION[0]
  );
  const EDIT_DATA = useSelector((e: any) => e.webEdit);
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  useEffect(() => {
    setSelectedColor(
      COLOR_OPTION.find((_) => _.value === formData.colorSchema) ||
        COLOR_OPTION[0]
    );
  }, [formData.colorSchema]);

  const dispatch = useDispatch();

  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  // const [pageData, setPageData] = useState<any>({})
  const navigate = useNavigate();
  const { id } = useParams();
  const MODE =
    window.location.pathname.includes("edit-website") && id ? "EDIT" : "ADD";

  const Validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
    })
  );

  useEffect(() => {
    if (id && MODE === "EDIT" && EDIT_DATA) {
      setFormData({
        ...formData,
        ...EDIT_DATA,
      });
    } else if (MODE === "EDIT" && !EDIT_DATA && !id) {
      navigate("/website");
    }
    return () => {};
  }, []);

  const getPageData = async () => {
    let data: any = {
      api:
        id && MODE === "EDIT"
          ? ADMIN_API.SETTING.WEBSITE.UPDATE
          : ADMIN_API.SETTING.WEBSITE.CREATE,
      value: {
        colorSchema: formData.colorSchema,
        title: formData.title,
        domain: formData.domain,
        favicon: formData.favicon,
        logo: formData.logo,
        adminLogo: formData.adminLogo,
        loginImage: formData.loginImage,
        mobileLoginImage: formData.mobileLoginImage,
        agentListUrl: formData.agentListUrl,
        email: formData.email,
        whatsapp: formData.whatsapp,
        telegram: formData.telegram,
        instagram: formData.instagram,
        skype: formData.skype,
        adminStatus: formData.adminStatus,
        currency: formData.currency,
        theme: formData.theme,
        status: formData.status,
        change_password_on_first_login: formData.change_password_on_first_login,
        cricket: formData.cricket,
        soccer: formData.soccer,
        tennis: formData.tennis,
        maintenanceMessage: formData.maintenanceMessage,
        agentMessage: formData.agentMessage,
        userMessage: formData.userMessage,
      },
    };
    delete data?.value?.soccer?.bet_fancy_limit;
    delete data?.value?.tennis?.bet_fancy_limit;

    if (id && MODE === "EDIT") {
      data.value.id = id;
    }
    if (formData.maintenanceMessage) {
      data.value.maintenanceMessage = formData.maintenanceMessage;
    }
    if (formData.agentMessage) {
      data.value.agentMessage = formData.agentMessage;
    }
    if (formData.userMessage) {
      data.value.userMessage = formData.userMessage;
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        // setPageData(response.data.data)
        notifyMessage(response.data.message);
        getDomainDetails();
      })
      .catch((err) => {
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const handleSelectChange = (e: any) => {
    console.log("page clicked", e.target.value);
    setFormData({
      ...formData,
      colorSchema:
        COLOR_OPTION.find((_) => _.value === e.target.value)?.value ||
        COLOR_OPTION[0].value,
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    if (type === "radio") {
      setFormData({
        ...formData,
        [name]: JSON.parse(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleCricketMinMax = (e: any, OBJECT: string = "cricket") => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      cricket: {
        ...formData.cricket,
        [OBJECT]: {
          ...formData.cricket[OBJECT],
          [name]: value,
        },
      },
    });
  };
  const handleSoccerMinMax = (e: any, OBJECT: string) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      soccer: {
        ...formData.soccer,
        [OBJECT]: {
          ...formData.soccer[OBJECT],
          [name]: value,
        },
      },
    });
  };
  const handleTennisMinMax = (e: any, OBJECT: string) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      tennis: {
        ...formData.tennis,
        [OBJECT]: {
          ...formData.tennis[OBJECT],
          [name]: value,
        },
      },
    });
  };
  const handleImageUpload = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitClick = (e: any) => {
    e.preventDefault();
    getPageData();
  };

  const getDomainDetails = async () => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.GET_SITE,
      value: {
        domain: window.location.hostname,
      },
    };
    await postApi(data)
      .then(function (response) {
        console.log(response);
        dispatch({ type: "DOMAIN_DETAILS", payload: response.data.data });
        navigate("/website");
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };

  const handleCancelClick = (e: any) => {
    e.preventDefault();
    navigate("/website");
  };

  const handleMultiInput = (e: any, name: string, index: number) => {
    let formDataCopy = JSON.parse(JSON.stringify(formData));
    debugger;
    formDataCopy[name][index] = e.target.value;

    // formDataCopy[name].splice(index, 1, e.target.value);
    setFormData({ ...formData, [name]: formDataCopy[name] });
  };

  return (
    <div className="container banking website edit full-wrap">
      <div className="top_header">
        <div className="top_header_title align-items-center mt-3">
          <h5 className="font-weight-bold">Update Website Banner</h5>
        </div>
      </div>

      <div className="edit_body">
        <div className="card">
          <div className="card_body">
            <div className="card mb-15">
              <div className="card_header">Basic Information For Website</div>
              <div className="card_body">
                <div className="row">
                  <div className="card_body_h_item">
                    <label htmlFor="title">Title:</label>
                    <input
                      onChange={(e) => handleInputChange(e)}
                      className="form-control"
                      name="title"
                      type="text"
                      value={formData.title}
                      id="title"
                    ></input>
                  </div>

                  <div className="mb-3 card_body_h_item">
                    <label htmlFor="domain">Domain:</label>
                    <input
                      onChange={(e) => handleInputChange(e)}
                      className="form-control"
                      name="domain"
                      type="text"
                      value={formData.domain}
                      id="domain"
                    />
                  </div>

                  <div className="mb-3 card_body_h_item">
                    <label htmlFor="theme">Theme:</label>
                    <select
                      className="form-control"
                      value={formData.theme}
                      id="theme"
                      name="theme"
                    >
                      <option value="Emerald" selected>
                        Emerald
                      </option>
                    </select>
                  </div>

                  <div className="mb-3 card_body_h_item">
                    <label htmlFor="color_schema">Color Schema:</label>
                    <select
                      name="color_schema"
                      id="color_schema"
                      className="form-control"
                      value={SelectedColor.value}
                      style={{
                        backgroundColor: SelectedColor.backgroundColor,
                        color: SelectedColor.color,
                      }}
                      onChange={(e) => handleSelectChange(e)}
                    >
                      {COLOR_OPTION.map((item: COLOR_OPTION_INTERFACE) => {
                        return (
                          <option
                            key={item.value}
                            style={{
                              backgroundColor: item.backgroundColor,
                              color: item.color,
                            }}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="card_body_f_item">
                    {/* filename setFileName */}
                    <ImageUpload
                      label="Favicon Image"
                      filename={formData.favicon}
                      name="favicon"
                      setFileName={handleImageUpload}
                    />

                    <ImageUpload
                      label="Logo Image"
                      filename={formData.logo}
                      name="logo"
                      setFileName={handleImageUpload}
                    />

                    <ImageUpload
                      label="Login Image"
                      filename={formData.loginImage}
                      name="loginImage"
                      setFileName={handleImageUpload}
                    />

                    <ImageUpload
                      label="Mobile Login Image"
                      filename={formData.mobileLoginImage}
                      name="mobileLoginImage"
                      setFileName={handleImageUpload}
                    />
                  </div>

                  <div className="mb-3 col-2 card_body_item ">
                    <label htmlFor="currency">Currency:</label>
                    <input
                      className="form-control"
                      onChange={(e) => handleInputChange(e)}
                      name="currency"
                      type="text"
                      value={formData.currency}
                      id="currency"
                    />
                  </div>

                  <div className="mb-3 col-4 card_body_item">
                    <label htmlFor="agentListUrl">Agent List URL:</label>
                    <input
                      className="form-control"
                      onChange={(e) => handleInputChange(e)}
                      value={formData.agentListUrl}
                      name="agentListUrl"
                      type="text"
                      id="agent_list_url"
                    />
                  </div>

                  <div className="mb-3 col-3 card_body_item">
                    <label htmlFor="active">Status:</label> <br />
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic radio toggle button group"
                    >
                      <div
                        className="btn-group credit-type"
                        role="group"
                        aria-label="Basic radio toggle button group"
                        onChange={(e) => handleInputChange(e)}
                      >
                        <input
                          className="btn-check"
                          type="radio"
                          name="status"
                          value={JSON.parse("true")}
                          id="on"
                          checked={formData.status === true}
                        />
                        <label
                          className="btn btn-outline-primary shadow-none"
                          htmlFor="on"
                        >
                          On
                        </label>
                        <input
                          className="btn-check"
                          id="off"
                          type="radio"
                          name="status"
                          value={JSON.parse("false")}
                          checked={formData.status === false}
                        />
                        <label
                          className="btn btn-outline-primary shadow-none"
                          htmlFor="off"
                        >
                          Off
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 col-3 card_body_item">
                    <label htmlFor="active">
                      Force to change password on first login:
                    </label>{" "}
                    <br />
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic radio toggle button group"
                      onChange={(e) => handleInputChange(e)}
                    >
                      <input
                        className="btn-check"
                        type="radio"
                        id="on"
                        value={JSON.parse("true")}
                        checked={
                          formData.change_password_on_first_login === true
                        }
                        name="change_password_on_first_login"
                      />
                      <label
                        className="btn btn-outline-primary shadow-none"
                        htmlFor="on"
                      >
                        On
                      </label>
                      <input
                        className="btn-check"
                        id="off"
                        type="radio"
                        value={JSON.parse("false")}
                        checked={
                          formData.change_password_on_first_login === false
                        }
                        name="change_password_on_first_login"
                      />
                      <label
                        className="btn btn-outline-primary shadow-none"
                        htmlFor="off"
                      >
                        Off
                      </label>
                    </div>
                  </div>

                  <div className="card_body_f_item">
                    <ImageUpload
                      label="Admin Logo Image: "
                      filename={formData?.adminLogo}
                      name="adminLogo"
                      setFileName={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-15">
              <div className="card_header">Social Media For Website</div>
              <div className="card_body social-media">
                <div className="row mb_15 mb_15">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="#d71b1b"
                          d="M215.4 96H144 107.8 96v8.8V144v40.4 89L.2 202.5c1.6-18.1 10.9-34.9 25.7-45.8L48 140.3V96c0-26.5 21.5-48 48-48h76.6l49.9-36.9C232.2 3.9 243.9 0 256 0s23.8 3.9 33.5 11L339.4 48H416c26.5 0 48 21.5 48 48v44.3l22.1 16.4c14.8 10.9 24.1 27.7 25.7 45.8L416 273.4v-89V144 104.8 96H404.2 368 296.6 215.4zM0 448V242.1L217.6 403.3c11.1 8.2 24.6 12.7 38.4 12.7s27.3-4.4 38.4-12.7L512 242.1V448v0c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64v0zM176 160H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
                        />
                      </svg>
                      Email{" "}
                    </label>
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="email-0"
                      onChange={(e) => handleMultiInput(e, "email", 0)}
                      id="email-0"
                      placeholder="Email..."
                      value={formData.email[0] ? formData.email[0] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="email-1"
                      onChange={(e) => handleMultiInput(e, "email", 1)}
                      id="email-1"
                      placeholder="Email..."
                      value={formData.email[1] ? formData.email[1] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="email-2"
                      onChange={(e) => handleMultiInput(e, "email", 2)}
                      id="email-2"
                      placeholder="Email..."
                      value={formData.email[2] ? formData.email[2] : ""}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row mb_15">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="#1bd741"
                          d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                        />
                      </svg>
                      WhatsApp{" "}
                    </label>
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="whatsapp-0"
                      onChange={(e) => handleMultiInput(e, "whatsapp", 0)}
                      id="whatsapp-0"
                      placeholder="+XX XXXXX XXXXX"
                      value={formData.whatsapp[0] ? formData.whatsapp[0] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="whatsapp-1"
                      onChange={(e) => handleMultiInput(e, "whatsapp", 1)}
                      id="whatsapp-1"
                      placeholder="+XX XXXXX XXXXX"
                      value={formData.whatsapp[1] ? formData.whatsapp[1] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="whatsapp-2"
                      onChange={(e) => handleMultiInput(e, "whatsapp", 2)}
                      id="whatsapp-2"
                      placeholder="+XX XXXXX XXXXX"
                      value={formData.whatsapp[2] ? formData.whatsapp[2] : ""}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row mb_15">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 496 512"
                      >
                        <path
                          fill="#25a1de"
                          d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z"
                        />
                      </svg>
                      Telegram{" "}
                    </label>
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="telegram-0"
                      onChange={(e) => handleMultiInput(e, "telegram", 0)}
                      id="telegram-0"
                      placeholder="Telegram..."
                      value={formData.telegram[0] ? formData.telegram[0] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="telegram-1"
                      onChange={(e) => handleMultiInput(e, "telegram", 1)}
                      id="telegram-1"
                      placeholder="Telegram..."
                      value={formData.telegram[1] ? formData.telegram[1] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="telegram-2"
                      onChange={(e) => handleMultiInput(e, "telegram", 2)}
                      id="telegram-2"
                      placeholder="Telegram..."
                      value={formData.telegram[2] ? formData.telegram[2] : ""}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row mb_15">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="#d82c7e"
                          d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                        />
                      </svg>
                      Instagram{" "}
                    </label>
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="instagram-0"
                      onChange={(e) => handleMultiInput(e, "instagram", 0)}
                      id="instagram-0"
                      placeholder="Instagram..."
                      value={formData.instagram[0] ? formData.instagram[0] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="instagram-1"
                      onChange={(e) => handleMultiInput(e, "instagram", 1)}
                      id="instagram-1"
                      placeholder="Instagram..."
                      value={formData.instagram[1] ? formData.instagram[1] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="instagram-2"
                      onChange={(e) => handleMultiInput(e, "instagram", 2)}
                      id="instagram-2"
                      placeholder="Instagram..."
                      value={formData.instagram[2] ? formData.instagram[2] : ""}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path
                          fill="#00aff0"
                          d="M424.7 299.8c2.9-14 4.7-28.9 4.7-43.8 0-113.5-91.9-205.3-205.3-205.3-14.9 0-29.7 1.7-43.8 4.7C161.3 40.7 137.7 32 112 32 50.2 32 0 82.2 0 144c0 25.7 8.7 49.3 23.3 68.2-2.9 14-4.7 28.9-4.7 43.8 0 113.5 91.9 205.3 205.3 205.3 14.9 0 29.7-1.7 43.8-4.7 19 14.6 42.6 23.3 68.2 23.3 61.8 0 112-50.2 112-112 .1-25.6-8.6-49.2-23.2-68.1zm-194.6 91.5c-65.6 0-120.5-29.2-120.5-65 0-16 9-30.6 29.5-30.6 31.2 0 34.1 44.9 88.1 44.9 25.7 0 42.3-11.4 42.3-26.3 0-18.7-16-21.6-42-28-62.5-15.4-117.8-22-117.8-87.2 0-59.2 58.6-81.1 109.1-81.1 55.1 0 110.8 21.9 110.8 55.4 0 16.9-11.4 31.8-30.3 31.8-28.3 0-29.2-33.5-75-33.5-25.7 0-42 7-42 22.5 0 19.8 20.8 21.8 69.1 33 41.4 9.3 90.7 26.8 90.7 77.6 0 59.1-57.1 86.5-112 86.5z"
                        />
                      </svg>
                      Skype{" "}
                    </label>
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="skype-0"
                      onChange={(e) => handleMultiInput(e, "skype", 0)}
                      id="skype-0"
                      placeholder="Skype..."
                      value={formData.skype[0] ? formData.skype[0] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="skype-1"
                      onChange={(e) => handleMultiInput(e, "skype", 1)}
                      id="skype-1"
                      placeholder="Skype..."
                      value={formData.skype[1] ? formData.skype[1] : ""}
                      className="form-control"
                    />
                  </div>

                  <div className="col-3">
                    <input
                      type="text"
                      name="skype-2"
                      onChange={(e) => handleMultiInput(e, "skype", 2)}
                      id="skype-2"
                      placeholder="Skype..."
                      value={formData.skype[2] ? formData.skype[2] : ""}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-15">
              <div className="card_header"> Messages </div>
              <div className="card_body social-media">
                <div className="row mb-15">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      {" "}
                      Maintenance Message{" "}
                    </label>
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      onChange={(e) => handleInputChange(e)}
                      name="maintenanceMessage"
                      id="maintenanceMessage"
                      placeholder=""
                      value={formData.maintenanceMessage}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row mb-15">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      {" "}
                      Agent Message{" "}
                    </label>
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      onChange={(e) => handleInputChange(e)}
                      name="agentMessage"
                      id="agentMessage"
                      placeholder=""
                      value={formData.agentMessage}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row mb-15">
                  <div className="col-2 d_flex d_flex_align_center">
                    <label className="d_flex d_flex_align_center">
                      {" "}
                      User Message{" "}
                    </label>
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      onChange={(e) => handleInputChange(e)}
                      name="userMessage"
                      id="userMessage"
                      placeholder=""
                      value={formData.userMessage}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>

            {false && (
              <>
                <div className="card mb-15">
                  <div className="card_header">
                    <h2
                      className="card-title m-0"
                      style={{ fontWeight: "normal" }}
                    >
                      Cricket Odds Limits
                    </h2>
                  </div>
                  <div className="card_body">
                    <div className="row ">
                      <div className="col-2 card_body_item ">
                        <label htmlFor="currency">Odds Limit:</label>
                        <input
                          className="form-control"
                          placeholder="Max"
                          name="max"
                          onChange={(e) => handleCricketMinMax(e, "oddsLimit")}
                          type="text"
                          value={formData.cricket?.oddsLimit?.max}
                        />
                      </div>

                      <div className="form-group1 col-1"></div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Bet Odds Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_odds_limit")
                              }
                              value={formData.cricket?.bet_odds_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_odds_limit")
                              }
                              value={formData.cricket?.bet_odds_limit?.max}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Bookmaker Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_bookmaker_limit")
                              }
                              value={formData.cricket?.bet_bookmaker_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_bookmaker_limit")
                              }
                              value={formData.cricket?.bet_bookmaker_limit?.max}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Fancy Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_fancy_limit")
                              }
                              value={formData.cricket?.bet_fancy_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_fancy_limit")
                              }
                              value={formData.cricket?.bet_fancy_limit?.max}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Premium Odds Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_premium_limit")
                              }
                              value={formData.cricket?.bet_premium_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleCricketMinMax(e, "bet_premium_limit")
                              }
                              value={formData.cricket?.bet_premium_limit?.max}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mb-15">
                  <div className="card_header">
                    <h2
                      className="card-title m-0"
                      style={{ fontWeight: "normal" }}
                    >
                      Soccer Odds Limits
                    </h2>
                  </div>
                  <div className="card_body">
                    <div className="row ">
                      <div className="col-2 card_body_item ">
                        <label htmlFor="currency">Odds Limit:</label>
                        <input
                          className="form-control"
                          placeholder="Max"
                          name="max"
                          onChange={(e) => handleSoccerMinMax(e, "oddsLimit")}
                          type="text"
                          value={formData.soccer?.oddsLimit?.max}
                        />
                      </div>

                      <div className="form-group1 col-1"></div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Bet Odds Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleSoccerMinMax(e, "bet_odds_limit")
                              }
                              value={formData.soccer?.bet_odds_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleSoccerMinMax(e, "bet_odds_limit")
                              }
                              value={formData.soccer?.bet_odds_limit?.max}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Bookmaker Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleSoccerMinMax(e, "bet_bookmaker_limit")
                              }
                              value={formData.soccer?.bet_bookmaker_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleSoccerMinMax(e, "bet_bookmaker_limit")
                              }
                              value={formData.soccer?.bet_bookmaker_limit?.max}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Premium Odds Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleSoccerMinMax(e, "bet_premium_limit")
                              }
                              value={
                                formData.soccer?.bet_premium_limit?.min
                                  ? formData.soccer?.bet_premium_limit?.min
                                  : ""
                              }
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleSoccerMinMax(e, "bet_premium_limit")
                              }
                              value={
                                formData.soccer?.bet_premium_limit?.max
                                  ? formData.soccer?.bet_premium_limit?.max
                                  : ""
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card_header">
                    <h2
                      className="card-title m-0"
                      style={{ fontWeight: "normal" }}
                    >
                      Tennis Odds Limits
                    </h2>
                  </div>
                  <div className="card_body">
                    <div className="row ">
                      <div className="col-2 card_body_item ">
                        <label htmlFor="currency">Odds Limit:</label>
                        <input
                          className="form-control"
                          placeholder="Max"
                          name="max"
                          onChange={(e) => handleTennisMinMax(e, "oddsLimit")}
                          type="text"
                          value={formData.tennis?.oddsLimit?.max}
                        />
                      </div>

                      <div className="form-group1 col-1"></div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Bet Odds Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleTennisMinMax(e, "bet_odds_limit")
                              }
                              value={formData.tennis?.bet_odds_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleTennisMinMax(e, "bet_odds_limit")
                              }
                              value={formData.tennis?.bet_odds_limit?.max}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Bookmaker Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleTennisMinMax(e, "bet_bookmaker_limit")
                              }
                              value={formData.tennis?.bet_bookmaker_limit?.min}
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleTennisMinMax(e, "bet_bookmaker_limit")
                              }
                              value={formData.tennis?.bet_bookmaker_limit?.max}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group1 col-2">
                        <label htmlFor="tennis_min_bet_odds_limit">
                          Premium Odds Limit:
                        </label>
                        <div className="row">
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Min"
                              name="min"
                              type="text"
                              onChange={(e) =>
                                handleTennisMinMax(e, "bet_premium_limit")
                              }
                              value={
                                formData.tennis?.bet_premium_limit?.min
                                  ? formData.tennis?.bet_premium_limit?.min
                                  : ""
                              }
                            />
                          </div>
                          <div className="form-group1 col-6">
                            <input
                              className="form-control"
                              placeholder="Max"
                              name="max"
                              type="number"
                              onChange={(e) =>
                                handleTennisMinMax(e, "bet_premium_limit")
                              }
                              value={
                                formData.tennis?.bet_premium_limit?.max
                                  ? formData.tennis?.bet_premium_limit?.max
                                  : ""
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="card_footer">
            <input
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={styleObjectBlackButton(DD?.colorSchema, isHover)}
              className="btn_black"
              type="submit"
              value="Save"
              onClick={(e) => handleSubmitClick(e)}
            />
            <button
              type="button"
              onClick={(e) => handleCancelClick(e)}
              className="btn btn-sm btn-default"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditWebsites;
