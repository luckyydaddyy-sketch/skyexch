/* eslint-disable jsx-a11y/anchor-is-valid */
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import SimpleReactValidator from "simple-react-validator";
import Cookies from "universal-cookie";
import { ADMIN_API } from "../common/common";
import { Logout } from "../common/Funcation";
import SearchInput from "../components/SearchInput";
import SkyPopup from "../components/SkyPopup";
import {
  getApi,
  notifyError,
  notifyMessage,
  postApi,
  sendEvent,
} from "../service";
import Loader from "../components/Loader";
import { styleObjectBlackButton } from "../common/StyleSeter";
import NewsLine from "../components/NewsLine";

interface ModelObject {
  type: string;
  data: object | any;
}
interface dataInterface {
  api: string;
  value: {
    status: string;
    search?: string;
    userId?: string;
  };
  token: any;
}
interface formInterface {
  user_name: string;
  password: string;
  confirmPassword: string;
  commission: string;
  firstName: string;
  lastName: string;
  domain: any[];
  rolling_delay: boolean;
  agent_level?: string;
  limit?: number;
  delay?: Delay;
}
interface Delay {
  bookmaker?: number;
  fancy?: number;
  premium?: number;
  odds?: number;
  soccer?: number;
  tennis?: number;
}
const cookies = new Cookies();

const Home = () => {
  // agentId
  let { agentId } = useParams<any>();
  const COM_Admin = "O";
  const authToken = cookies.get("skyToken");
  const isMultiAccount = process.env.REACT_APP_MULTIUSER;
  const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
  const HeaderData = useSelector((e: any) => e.Header);
  const USERS_COUNT = useSelector((e: any) => e.home_userCount);
  const [usersCount, setUsersCount] = useState(USERS_COUNT);
  const [creditRef, setCreditRef] = useState<any>({
    type: "",
    password: "",
    credit_ref: "",
    id: "",
    current_credit: "",
  });
  const [sportLimit, setSportLimit] = useState<any>({
    type: "",
    password: "",
    sportWinLimit: "",
    id: "",
    current_limit: "",
  });
  const [headerBalance, setHeaderBalance] = useState<any>({});
  const [isLoader, setLoader] = useState(false);

  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [didLoad, setDidLoad] = useState<boolean>(false);
  const [OpenModal, setOpenModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModelObject>({
    type: "",
    data: {},
  });
  const [domainList, setDomainList] = useState<any>([]);
  const [searchStatus, setSearchStatus] = useState<string>("active");
  const [open, setOpen] = useState<boolean>(false);
  const [adminBgColor, setAdminBgColor] = useState<any>({
    O: "#c43434",
    SUO: "#c5c81f",
    WL: "#d71990",
    SA: "#9f19d7",
    A: "#D77319",
    SUA: "#D65D5D",
    SS: "#85B352",
    S: "#568BC8",
    M: "#A762B5",
    CL: "#85B352",
  });
  const Validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
    })
  );
  const DD = useSelector((e: any) => e.domainDetails);
  const [domainDetails, setDomainDetails] = useState(DD);

  useEffect(() => {
    setDomainDetails(DD);
    return () => {};
  }, [DD]);
  const [statusUpdate, setStatusUpdate] = useState<any>({
    password: "",
    id: "",
    status: "",
    // newPassword: '',
    // confirmPassword: '',
    allData: {},
    API: "",
  });
  const [pageData, setPageData] = useState<any>({
    allData: {},
    agent: [],
    player: [],
  });

  const [addPlayerFrom, setAddPlayerFrom] = useState<formInterface>({
    user_name: "",
    password: "",
    confirmPassword: "",
    commission: HeaderData?.name === "O" ? "" : headerBalance?.commission,
    firstName: "",
    lastName: "",
    domain: [],
    rolling_delay: false,
    delay: {
      bookmaker: 0,
      fancy: 0,
      premium: 0,
      odds: 0,
      soccer: 0,
      tennis: 0,
    },
  });

  const getOptions = () => {
    switch (HeaderData?.name) {
      // case "COM":
      //     return "SP"
      // case 'SP':
      //     return "AD"
      // case 'AD':
      //     return "SMDL"
      // case 'SMDL':
      //     return "MDL"
      // case 'MDL':
      //     return "DL"
      // case 'DL':
      //     return ''
      // default:
      //     return "";

      case "O":
        return "SUO";
      case "SUO":
        return "WL";
      case "WL":
        return "SA";
      case "SA":
        return "A";
      case "A":
        return "SUA";
      case "SUA":
        return "SS";
      case "SS":
        return "S";
      case "S":
        return "M";
      case "M":
        return "";
      default:
        return "";
    }
  };
  // for add agent text
  const getButtonText = () => {
    switch (HeaderData?.name) {
      // case "COM":
      //     return "Super Admin"
      // case 'SP':
      //     return "Admin"
      // case 'AD':
      //     return "Sub Admin"
      // case 'SMDL':
      //     return "Super Master"
      // case 'MDL':
      //     return "Master"
      // case 'DL':
      //     return ''
      // default:
      //     return "";
      case "O":
        return "Owner";
      case "SUO":
        return "WHITELEBEL";
      case "WL":
        return "Super Admin";
      case "SA":
        return "Admin";
      case "A":
        return "Sub Admin";
      case "SUA":
        return "Senior Super";
      case "SS":
        return "Super";
      case "S":
        return "Master";
      case "M":
        return "";
      default:
        return "";
    }
  };

  useEffect(() => {
    return () => {};
  }, []);

  const [addAgentFrom, setAddAgentFrom] = useState<formInterface>({
    agent_level: getOptions(),
    user_name: "",
    password: "",
    confirmPassword: "",
    commission: HeaderData?.name === COM_Admin ? "" : headerBalance?.commission,
    firstName: "",
    lastName: "",
    limit: 1000,
    domain: [],
    rolling_delay: false,
    delay: {
      bookmaker: 0,
      fancy: 0,
      premium: 0,
      odds: 0,
      soccer: 0,
      tennis: 0,
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (USERS_COUNT) setUsersCount(USERS_COUNT);
    return () => {};
  }, [USERS_COUNT]);
  useEffect(() => {
    setTimeout(() => {
      sendEvent("GET_USER_COUNT", {});
    }, 500);
    return () => {};
  }, []);

  useEffect(() => {
    //'/admin/downLineList'
    if (!didLoad) {
      if (isAuthenticated?.isLogin) {
        // getUserData(isAuthenticated.token, '', agentId ? agentId : "");
        getDomainDetails(isAuthenticated.token);
      }
      setDidLoad(true);
    }
    return () => {};
  }, [didLoad, isAuthenticated]);

  useEffect(() => {
    console.log("onChanges :agentId: ", agentId);
    getUserData(isAuthenticated.token, "", agentId ? agentId : "");
  }, [agentId]);

  const getDomainDetails = async (token: any = undefined) => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.GET_DOMAIN,
      value: {},
      token: token ? token : undefined,
    };
    await getApi(data)
      .then(function (response) {
        console.log(response);

        let newData: { value: any; label: any }[] = [];
        response.data.data.forEach((element: any) => {
          let newobj = { value: element._id, label: element.domain };
          newData.push(newobj);
        });
        setDomainList(newData);
        setAddAgentFrom({
          ...addAgentFrom,
          domain: response.data.data[0]._id,
        });
        setAddPlayerFrom({
          ...addPlayerFrom,
          domain: response.data.data[0]._id,
        });
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };

  const getUserData = async (
    token: any = undefined,
    SEARCH: string = "",
    ID: string = "",
    status: string = ""
  ) => {
    let data: dataInterface = {
      api: ID ? ADMIN_API.AGENT_GET_LIST : ADMIN_API.DOWN_LINE_LIST,
      value: { status: status ? status : searchStatus },
      token: token ? token : undefined,
    };
    if (SEARCH !== "") {
      data.value.search = SEARCH;
    }
    if (ID && ID !== "") {
      data.value.userId = ID;
    }
    setLoader(true);
    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData({
          allData: response.data?.data,
          agent: response.data?.data["agent"],
          player: response.data?.data["player"],
        });

        if (response.data?.data?.agent_level === HeaderData?.name) {
          setHeaderBalance(response.data?.data);
          setAddAgentFrom({
            ...addAgentFrom,
            commission:
              HeaderData?.name === COM_Admin
                ? ""
                : response.data?.data?.commission,
          });
          setAddPlayerFrom({
            ...addPlayerFrom,
            commission:
              HeaderData?.name === COM_Admin
                ? ""
                : response.data?.data?.commission,
          });
        }
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
          dispatch({
            type: "AUTHENTICATION",
            payload: { isLogin: false, token: "" },
          });
        }
      });
    dispatch({ type: "AUTHENTICATION", payload: { isLogin: true, token: "" } });
    // console.log(userData);
  };

  const ShowPopUp = (item: any, type: string, API: string = "") => {
    setOpenModal(true);
    if (type === "status") {
      console.log("::::::", item);
      setStatusUpdate({
        status: item.status,
        id: item._id,
        allData: item,
        API: API,
      });
    }
    if (type === "update") {
      console.log("::::::", item);
      setCreditRef({
        ...creditRef,
        current_credit: item.credit_ref,
        id: item._id,
        type: item.agent_level === "PL" ? "player" : "agent",
      });
    }
    if (type === "updateSportLimit") {
      console.log(":updateSportLimit:::::", item);
      setSportLimit({
        ...sportLimit,
        current_limit: item?.sportWinLimit,
        id: item._id,
        type: item.agent_level === "PL" ? "player" : "agent",
      });
    }
    setModalType({ type: type, data: {} });
  };

  const onCreditRefChange = (e: any) => {
    const { value, name } = e.target;
    setCreditRef({
      ...creditRef,
      [name]: value,
    });
  };
  const onSportLimitChange = (e: any) => {
    const { value, name } = e.target;
    setSportLimit({
      ...sportLimit,
      [name]: value,
    });
  };
  const onCreditRefSubmit = async (e: any) => {
    e.preventDefault();
    let data = {
      api: ADMIN_API.CREDIT_REF,
      value: {
        type: creditRef.type,
        password: creditRef.password,
        credit_ref: creditRef.credit_ref,
        id: creditRef.id,
      },
      token: authToken ? authToken : undefined,
    };
    await postApi(data)
      .then(function (response) {
        console.log(response);
        notifyMessage(response.data.message);
        setOpenModal(false);
        setCreditRef({
          type: "",
          password: "",
          credit_ref: "",
          id: "",
          current_credit: "",
        });
        getUserData(authToken ? authToken : undefined);
      })
      .catch((err) => {
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };
  const onSportLimitSubmit = async (e: any) => {
    e.preventDefault();
    console.log("sportLimit ::: ", sportLimit);
    let data = {
      api: ADMIN_API.SPORTS_LIMIT,
      value: {
        type: sportLimit.type,
        password: sportLimit.password,
        sportWinLimit: sportLimit.sportWinLimit,
        id: sportLimit.id,
      },
      token: authToken ? authToken : undefined,
    };
    await postApi(data)
      .then(function (response) {
        console.log(response);
        notifyMessage(response.data.message);
        setOpenModal(false);
        setSportLimit({
          type: "",
          password: "",
          sportWinLimit: "",
          id: "",
          current_limit: "",
        });
        getUserData(authToken ? authToken : undefined);
      })
      .catch((err) => {
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };

  const onAddPlayerChange = (e: any, isDelay: boolean = false) => {
    const { value, name, checked, type } = e.target;
    if (type === "checkbox") {
      setAddPlayerFrom({
        ...addPlayerFrom,
        commission:
          HeaderData?.name === COM_Admin
            ? name === "commission"
              ? value
              : ""
            : headerBalance?.commission,
        rolling_delay: checked,
      });
    } else {
      if (isDelay) {
        setAddPlayerFrom({
          ...addPlayerFrom,
          commission:
            HeaderData?.name === COM_Admin
              ? name === "commission"
                ? value
                : ""
              : headerBalance?.commission,
          delay: { ...addPlayerFrom.delay, [name]: parseInt(value) },
        });
      } else {
        if (name === "user_name") {
          setAddPlayerFrom({
            ...addPlayerFrom,
            commission:
              HeaderData?.name === COM_Admin
                ? name === "commission"
                  ? value
                  : ""
                : headerBalance?.commission,
            [name]: value.trim(),
          });
        } else {
          setAddPlayerFrom({
            ...addPlayerFrom,
            commission:
              HeaderData?.name === COM_Admin
                ? name === "commission"
                  ? value
                  : ""
                : headerBalance?.commission,
            [name]: value,
          });
        }
      }
    }
  };

  const onAddAgentChange = (e: any, isDelay: boolean = false) => {
    const { value, name, checked, type } = e.target;
    console.log("addAgentFrom:b: ", addAgentFrom);
    if (type === "checkbox") {
      setAddAgentFrom({
        ...addAgentFrom,
        commission:
          HeaderData?.name === COM_Admin
            ? name === "commission"
              ? value
              : ""
            : headerBalance?.commission,
        rolling_delay: checked,
        agent_level: isMultiAccount === "true" ? addAgentFrom?.agent_level:getOptions(),
      });
    } else if (isDelay) {
      setAddAgentFrom({
        ...addAgentFrom,
        commission:
          HeaderData?.name === COM_Admin
            ? name === "commission"
              ? value
              : ""
            : headerBalance?.commission,
        agent_level: isMultiAccount === "true" ? addAgentFrom?.agent_level:getOptions(),
        delay: { ...addAgentFrom.delay, [name]: parseInt(value) },
      });
    } else {
      if (name === "user_name") {
        setAddAgentFrom({
          ...addAgentFrom,
          [name]: value.trim(),
          commission:
            HeaderData?.name === COM_Admin
              ? name === "commission"
                ? value
                : ""
              : headerBalance?.commission,
          agent_level: isMultiAccount === "true" ? addAgentFrom?.agent_level:getOptions(),
        });
      } else {
        console.log(
          "we are there: name: ",
          name,
          value,
          isMultiAccount === "true" && name === "agent_level"
        );

        setAddAgentFrom({
          ...addAgentFrom,
          [name]: value,
          commission:
            HeaderData?.name === COM_Admin
              ? name === "commission"
                ? value
                : ""
              : headerBalance?.commission,
          // agent_level:
          //   isMultiAccount === "true" && name === "agent_level"
          //     ? value
          //     : getOptions(),
        });

        if (isMultiAccount !== "true") {
          setAddAgentFrom({
            ...addAgentFrom,
            agent_level:
            //  getOptions(),
            isMultiAccount === "true" && name === "agent_level"
              ? value
              : getOptions(),
          });
        }
      }
      console.log("addAgentFrom:: ", addAgentFrom);
    }
  };

  const submitAddPopup = async (e: any, type: string) => {
    e.preventDefault();
    let data: any;

    // console.log("addAgentFrom::final: ", addAgentFrom);
    
    // return false;
    const { password, confirmPassword } =
      type === "addplayer" ? addPlayerFrom : addAgentFrom;
    if (
      confirmPassword !== "" &&
      password !== "" &&
      password === confirmPassword
    ) {
      if (type === "addplayer") {
        data = {
          api: ADMIN_API.PLAYER_CREATE,
          value: { ...addPlayerFrom },
          token: authToken ? authToken : undefined,
        };
      } else if (type === "addagent") {
        data = {
          api: ADMIN_API.AGENT_CREATE,
          value: { ...addAgentFrom },
          token: authToken ? authToken : undefined,
        };
      }
      delete data?.value?.bookmaker;
      delete data?.value?.fancy;
      delete data?.value?.premium;
      delete data?.value?.odds;
      delete data?.value?.soccer;
      delete data?.value?.tennis;
      if (
        HeaderData?.name !== COM_Admin &&
        HeaderData?.name !== "WL" &&
        HeaderData?.name !== "SUO"
      ) {
        delete data?.value?.domain;
      }
      // console.log("data :: ", data);

      // return false;
      await postApi(data)
        .then(function (response) {
          setOpenModal(false);
          notifyMessage(response.data.message);
          setAddPlayerFrom({
            user_name: "",
            password: "",
            confirmPassword: "",
            commission:
              HeaderData?.name === COM_Admin ? "" : headerBalance?.commission,
            firstName: "",
            lastName: "",
            domain: [],
            rolling_delay: false,
            delay: {
              bookmaker: 0,
              fancy: 0,
              premium: 0,
              odds: 0,
              soccer: 0,
              tennis: 0,
            },
          });
          setAddAgentFrom({
            agent_level: getOptions(),
            user_name: "",
            confirmPassword: "",
            password: "",
            commission:
              HeaderData?.name === COM_Admin ? "" : headerBalance?.commission,
            firstName: "",
            lastName: "",
            limit: 1000,
            domain: [],
            rolling_delay: false,
            delay: {
              bookmaker: 0,
              fancy: 0,
              premium: 0,
              odds: 0,
              soccer: 0,
              tennis: 0,
            },
          });
          getUserData(authToken ? authToken : undefined);
        })
        .catch((err) => {
          console.log("eeee", err);
          notifyError(err.response.data.message);
        });
    } else {
      notifyError("password not match");
    }
  };

  const onStatusChange = (e: string) => {
    setStatusUpdate({
      ...statusUpdate,
      status: e,
    });
  };

  const onPasswordChang = (e: any) => {
    setStatusUpdate({
      ...statusUpdate,
      password: e.target.value,
    });
  };

  const submitStatusPopup = async (e: any) => {
    e.preventDefault();
    if (Validator.current.allValid()) {
      let data = {
        api:
          statusUpdate.API === "AGENT"
            ? ADMIN_API.AGENT_UPDATE_INFO
            : ADMIN_API.PLAYER_UPDATE_INFO,
        value: {
          password: statusUpdate.password,
          id: statusUpdate.id,
          status: statusUpdate.status,
        },
        token: authToken ? authToken : undefined,
      };
      await postApi(data)
        .then(function (response) {
          setOpenModal(false);
          notifyMessage(response.data.message);
          setStatusUpdate({ password: "", id: "", status: "", allData: {} });

          getUserData(authToken ? authToken : undefined);
        })
        .catch((err) => {
          console.log("eeee", err);
          notifyError(err.response.data.message);
        });
    } else {
      Validator.current.showMessages();
      forceUpdate();
    }
  };

  // user detail click
  // const gotoUser = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, item: any) => {
  //     e.preventDefault()
  //     console.log('::::::::item', item);
  //     navigate(`/user/${item._id}/profile/`)
  // }

  const handleSubmit = (search: any) => {
    getUserData(authToken ? authToken : undefined, search);
  };
  const gotoUser = (
    e: any,
    item: any,
    type: string,
    path: string = "profile"
  ) => {
    e.preventDefault();
    if (path) {
      navigate(`/user/${path}/${type}/${item._id}/`);
    } else {
      navigate(`/user/profile/${type}/${item._id}/`);
    }
    console.log(item);
  };

  const agentClick = (e: any, item: any) => {
    e.preventDefault();
    navigate(`/${item._id}`);
    // getUserData(authToken ? authToken : undefined, "", item._id);
  };
  const onAddAgentSelectChange = (e: any) => {
    console.log(e);
    let data: any[] = [];
    e.forEach((element: any) => {
      data.push(element.value);
    });
    setAddAgentFrom({
      ...addAgentFrom,
      domain: data,
    });
  };
  const onStatusSelectChange = (e: any) => {
    console.log(e);
    let data: any[] = [];
    e.forEach((element: any) => {
      data.push(element.value);
    });
    setAddPlayerFrom({
      ...addPlayerFrom,
      domain: data,
    });
  };
  const closeModel = () => {
    setStatusUpdate({ password: "", id: "", status: "", allData: {} });
    setAddPlayerFrom({
      user_name: "",
      password: "",
      confirmPassword: "",
      commission:
        HeaderData?.name === COM_Admin ? "" : headerBalance?.commission,
      firstName: "",
      lastName: "",
      domain: [],
      rolling_delay: false,
      delay: {
        bookmaker: 0,
        fancy: 0,
        premium: 0,
        odds: 0,
        soccer: 0,
        tennis: 0,
      },
    });
    setAddAgentFrom({
      agent_level: getOptions(),
      user_name: "",
      confirmPassword: "",
      password: "",
      commission:
        HeaderData?.name === COM_Admin ? "" : headerBalance?.commission,
      firstName: "",
      lastName: "",
      limit: 1000,
      domain: [],
      rolling_delay: false,
      delay: {
        bookmaker: 0,
        fancy: 0,
        premium: 0,
        odds: 0,
        soccer: 0,
        tennis: 0,
      },
    });
    setOpenModal(false);
  };

  const removeNegative = (num: number) => {
    return Math.abs(num);
  };
  return (
    <>
      {isLoader && <Loader />}
      <div className="main_wrap" id="mainWrap">
        <NewsLine />
        <div className="container dashboard_main">
          <div className="top_header">
            <div className="search_form">
              <SearchInput searchSubmit={handleSubmit} />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "10px",
                  marginRight: "10px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Status
              </label>
              <select
                name="status"
                id=""
                className="form-control"
                value={searchStatus}
                onChange={(e) => {
                  setSearchStatus(e.target.value);
                  getUserData(
                    authToken ? authToken : undefined,
                    "",
                    "",
                    e.target.value
                  );
                }}
              >
                <option value="all">ALL</option>
                <option value="active">ACTIVE</option>
                <option value="suspend">SUSPEND</option>
                <option value="locked">LOCKED</option>
              </select>
            </div>
            <div className="agents">
              <ul className="agentlist d_flex_fix">
                {/* {HeaderData.user_name !== pageData.allData.user_name && <li onClick={() => getUserData()}>
                                <a href="javascript:void(0)" className="agent-bread-cum sub-agent" data-id="1">
                                    <span className="blue-bg text-white">{HeaderData.name}</span>
                                    <strong id="1">{HeaderData.user_name}</strong>
                                </a>
                                <img src="./images/arrow-right2.png" />
                            </li>}
                            <li>
                                <a href="javascript:void(0)" className="agent-bread-cum sub-agent">
                                    <span className="blue-bg text-color-white">{pageData.allData.agent_level}</span>
                                    <strong id="1">{pageData.allData.user_name}</strong>
                                </a>
                                <img src="./images/arrow-right2.png" />
                            </li> */}
                {pageData?.allData?.uperLineInfo?.map((item: any, i: any) => {
                  return (
                    <li
                      onClick={
                        () =>
                          i === 0
                            ? navigate(`/`) //getUserData(authToken ? authToken : undefined)
                            : navigate(`/${item._id}`) //getUserData(
                        // authToken ? authToken : undefined,
                        // "",
                        // item._id
                        //
                      }
                    >
                      <a
                        href="javascript:void(0)"
                        className="agent-bread-cum sub-agent"
                      >
                        <span
                          className="blue-bg text-color-white"
                          style={{
                            backgroundColor: adminBgColor[item?.agent_level],
                          }}
                        >
                          {item?.agent_level}
                        </span>
                        <strong
                          id="1"
                          style={{ color: "#000000" }}
                          className="text-color-black"
                        >
                          {item?.user_name}
                        </strong>
                      </a>
                      {pageData?.allData?.uperLineInfo?.length - 1 !== i && (
                        <img src="./images/arrow-right2.png" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="top_header_btn">
              {HeaderData.add_player ? (
                <a
                  className="  btn "
                  onClick={(e) => ShowPopUp(e, "addplayer")}
                >
                  {/* <svg viewBox="0 0 640 512">
                                <path d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                            </svg> */}
                  <div></div>
                  Add User
                </a>
              ) : (
                ""
              )}
              {HeaderData.add_agent ? (
                <a
                  className="add_agent btn "
                  onClick={(e) => ShowPopUp(e, "addagent")}
                >
                  {/* <svg viewBox="0 0 640 512">
                                <path d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                            </svg> */}
                  <div></div>
                  Add {getButtonText()}{" "}
                </a>
              ) : (
                ""
              )}
              <a className="  btn " onClick={(e) => window.location.reload()}>
                <img src="/images/refresh.svg" alt="" />
              </a>
            </div>
          </div>
          {/* {HeaderData?.name === "COM" && <div className='dashboard_users'>
                    <ul>
                        <li>
                            <label> Active: </label>
                            <span className='text-green'> {usersCount?.activeUser} </span>
                        </li>
                        <li>
                            <label> Suspend: </label>
                            <span className='text-danger'> {usersCount?.suspendUser} </span>
                        </li>
                        <li>
                            <label> Locked: </label>
                            <span className='text-muted'> {usersCount?.lockedUser} </span>
                        </li>
                        <li>
                            <label> Total user: </label>
                            <span className='text-dark'> {usersCount?.totalUser} </span>
                        </li>
                    </ul>
                </div>} */}

          <div className="downlist_remain">
            <div className="downlist_remain_wrp">
              <ul>
                <li className="downlist_remain_item">
                  <span>Remaining Balance</span>
                  <h4>
                    <span className="text-muted me-2">
                      {domainDetails?.currency
                        ? domainDetails?.currency
                        : "PTH"}{" "}
                    </span>
                    <span className="d-inline-block balance">
                      {headerBalance.remaining_balance}
                    </span>
                  </h4>
                </li>
                <li className="downlist_remain_item">
                  <span>Total Agent Balance</span>
                  <h4>
                    <span className="text-muted me-2">
                      {domainDetails?.currency
                        ? domainDetails?.currency
                        : "PTH"}{" "}
                    </span>
                    <span className="d-inline-block balance">
                      {headerBalance.AgentBalance}
                    </span>
                  </h4>
                </li>
                <li className="downlist_remain_item">
                  <span> Total Client Balance</span>
                  <h4>
                    <span className="text-muted me-2">
                      {domainDetails?.currency
                        ? domainDetails?.currency
                        : "PTH"}{" "}
                    </span>
                    <span className="d-inline-block balance">
                      {headerBalance.ClientBalance}
                    </span>
                  </h4>
                </li>
                <li className="downlist_remain_item">
                  <span>Total Exposure</span>
                  <h4>
                    <span className="text-muted me-2">
                      {domainDetails?.currency
                        ? domainDetails?.currency
                        : "PTH"}{" "}
                    </span>
                    <span className="d-inline-block text-danger totalExposure">
                      {headerBalance.exposure}
                    </span>
                  </h4>
                </li>
                <li className="downlist_remain_item">
                  <span>Available Balance</span>
                  <h4>
                    <span className="text-muted me-2">
                      {domainDetails?.currency
                        ? domainDetails?.currency
                        : "PTH"}{" "}
                    </span>
                    <span className="d-inline-block balance">
                      {headerBalance.balance}
                    </span>
                  </h4>
                </li>
                <li className="downlist_remain_item">
                  <span>MY P/L</span>
                  <h4>
                    <span className="text-muted me-2">
                      {domainDetails?.currency
                        ? domainDetails?.currency
                        : "PTH"}{" "}
                    </span>
                    <span
                      className={`exp_div d-inline-block ${
                        headerBalance.myPl > 0 ? "text-green" : "text-danger"
                      }`}
                    >
                      {removeNegative(headerBalance.myPl)}
                    </span>
                  </h4>
                </li>
              </ul>
            </div>
          </div>

          <div className="table-responsive ">
            {pageData.allData.agent_level !== "M" && (
              <table className="table01">
                <thead>
                  <tr>
                    {/* <th>Account(Agent)</th>
                                <th>Credit Ref.</th>
                                <th>Remaining bal.</th>
                                <th>Total Agent bal.</th>
                                <th>Total client bal.</th>
                                <th>Available bal.</th>
                                <th>Exposure</th>
                                <th>Ref. P/L</th>
                                <th>Cumulative P/L</th>
                                <th>Status</th>
                                <th>Action</th> */}
                    <th
                      style={{ width: "10%" }}
                      id="accountTh"
                      className="align-L"
                    >
                      Account (Agent)
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="creditRefTh"
                    >
                      Credit Ref.
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="remainBal"
                    >
                      Balance
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="exposure"
                    >
                      Exposure
                    </th>
                    {/* <th style={{ textAlign: "right", width: "10%" }} id="totalAgentBal" >Total Agent bal</th> */}
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="availableBal"
                    >
                      Avail. bal.
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="webSite"
                    >
                      Website Name
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="totalclientBal"
                    >
                      Player Balance
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="refPLTh"
                    >
                      Ref. P/L
                    </th>
                    {/* <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="refPLTh"
                    >
                      Cumulative P/L
                    </th> */}
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="statusTh"
                    >
                      Status
                    </th>
                    <th
                      style={{ textAlign: "right", width: "15%" }}
                      id="actionTh"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody id="users-agent">
                  {pageData.agent && pageData.agent.length > 0 ? (
                    pageData.agent.map((item: any) => {
                      return (
                        <tr>
                          <td width="10%">
                            <a
                              href="javascript:void(0)"
                              className="text-decoration-none sub-agent"
                              data-id="131"
                              onClick={(e) => agentClick(e, item)}
                            >
                              {/* <span className="badge bg-warning">{item.agent_level}</span> */}
                              <span className="badge bg-info bg-blue">
                                {item.agent_level}
                              </span>
                              {/* [{item.firstName} {item.lastName}] */}
                              <u className="text-blue">{item.user_name}</u>
                            </a>
                          </td>
                          <td align="right" width="10%">
                            <a
                              className="open-credit-popup cursor-pointer text-decoration-none"
                              data-id="131"
                              data-current-credit="0"
                              onClick={() => ShowPopUp(item, "update")}
                            >
                              <u
                                className="text-blue"
                                style={{ marginRight: "5px" }}
                              >
                                {item.credit_ref}
                              </u>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                              >
                                <path d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z" />
                              </svg>
                            </a>
                          </td>
                          <td align="right" width="10%" className="text-blue">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                textAlign: "right",
                                justifyContent: "flex-end",
                              }}
                            >
                              {item.remaining_balance}
                              <img
                                src="/images/plus.svg"
                                style={{
                                  maxWidth: "15px",
                                  maxHeight: "15px",
                                  marginLeft: "5px",
                                  cursor: "pointer",
                                }}
                              />
                            </div>
                          </td>
                          <td align="right" width="10%" className="text-danger">
                            {/* <p className='exposure badge bg-suspend p-2' onClick={() => setOpen(true)}>{item.exposure}</p> */}
                            <p className="exposure badge bg-suspend p-2">
                              {item.exposure}
                            </p>
                          </td>
                          {/* <td align="right" width="10%">{item.agentBalance}</td> */}
                          <td align="right" width="10%">
                            {item.balance}
                          </td>
                          <td align="right" width="10%">
                            {item?.domain?.[0]?.domain}
                            {/* {item?.domain?.map((_v:any) => _v.domain).join(',')} */}
                          </td>
                          <td align="right" width="10%">
                            {item.clientBalance}
                          </td>
                          <td
                            align="right"
                            width="10%"
                            className={
                              item.ref_pl > 0 ? "text-green" : "text-danger"
                            }
                          >
                            ({removeNegative(item.ref_pl)})
                          </td>
                          {/* <td
                            align="right"
                            width="10%"
                            className={
                              item.cumulative_pl > 0
                                ? "text-green"
                                : "text-danger"
                            }
                          >
                            {removeNegative(item.cumulative_pl)}
                          </td> */}
                          <td
                            width="7%"
                            className="status"
                            style={{ textAlign: "right" }}
                          >
                            <span className={`badge bg-${item.status} p-2`}>
                              {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                                    <path d="M192 64C86 64 0 150 0 256S86 448 192 448H384c106 0 192-86 192-192s-86-192-192-192H192zM384 352c-53 0-96-43-96-96s43-96 96-96s96 43 96 96s-43 96-96 96z" />
                                                </svg> */}
                              <div className="icons" />
                              {item.status}
                            </span>
                          </td>
                          {/* <td width="15%" align="right">
                                            <div className="btn-group" role="group" aria-label="Basic example">
                                                <button type="button" className="btn btn-outline-info change-status" title="Change Status" data-agent-level="AD" data-id="131" data-username="ngalaxy [New Galaxy]" data-status="active" onClick={() => ShowPopUp(item, "status", 'AGENT')}>
                                                    <img src="/images/setting-icon.png" alt="" />
                                                </button>
                                                <a onClick={(e) => gotoUser(e, item, 'agent')} className="btn btn-outline-warning" title="Change Password" href="https://ag.mysky247.xyz/backend/user/1afa34a7f984eeabdbb0a7d494132ee5/profile">
                                                    <img src="/images/user-icon.png" alt="" />
                                                </a>
                                            </div>
                                        </td> */}
                          <td width="15%" align="right">
                            <div
                              className="action_btn"
                              role="group"
                              aria-label="Basic example"
                            >
                              <a
                                className="btn bet_history"
                                title="Bet History"
                                href="#"
                                onClick={(e) =>
                                  gotoUser(e, item, "agent", "bethistory")
                                }
                              >
                                {" "}
                              </a>
                              <a
                                className="btn account_statement"
                                title="Account Statement"
                                href="#"
                                onClick={(e) =>
                                  gotoUser(
                                    e,
                                    item,
                                    "agent",
                                    "account-statement"
                                  )
                                }
                              >
                                {" "}
                              </a>
                              <button
                                type="button"
                                className="btn change_status"
                                title="Change Status"
                                onClick={() =>
                                  ShowPopUp(item, "status", "AGENT")
                                }
                              >
                                {" "}
                              </button>
                              <a
                                className="btn change_password"
                                title="Change Password"
                                onClick={(e) => gotoUser(e, item, "agent")}
                              >
                                {" "}
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <h2>No Data</h2>
                  )}
                </tbody>
              </table>
            )}

            {pageData.player.length > 0 && (
              <table className="table01">
                <thead>
                  <tr>
                    <th
                      style={{ width: "10%" }}
                      id="accountTh"
                      className="align-L"
                    >
                      Account (Player)
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="creditRefTh"
                    >
                      Credit Ref.
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="balanceTh"
                    >
                      Balance
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="exposureTh"
                    >
                      Exposure
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="availableBalanceTh"
                    >
                      Avail. bal.
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="refPLTh"
                    >
                      Ref. P/L
                    </th>
                    {/* <th style={{ textAlign: "right", width: "10%" }} id="refPLTh">Cumulative P/L</th> */}
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="creditRefTh"
                    >
                      Sport Limit
                    </th>
                    <th
                      style={{ textAlign: "right", width: "10%" }}
                      id="statusTh"
                    >
                      Status
                    </th>
                    <th
                      style={{ textAlign: "right", width: "15%" }}
                      id="actionTh"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody id="users-agent">
                  {pageData.player && pageData.player.length > 0 ? (
                    pageData.player.map((item: any) => {
                      return (
                        <tr>
                          <td width="10%">
                            <a
                              href="javascript:void(0)"
                              className="text-decoration-none color_black sub-agent"
                              data-id="131"
                            >
                              <span className="badge bg-warning">
                                {item.agent_level}
                              </span>
                              {/* <span className="badge bg-blue">{item.agent_level}</span> */}
                              {/* [{item.firstName} {item.lastName}] */}
                              <u className="text-blue"> {item.user_name} </u>
                            </a>
                          </td>
                          <td align="right" width="10%">
                            <u
                              className="text-blue"
                              style={{ marginRight: "5px" }}
                            >
                              {item.credit_ref}
                            </u>
                            <a
                              className="open-credit-popup color_black cursor-pointer text-decoration-none"
                              data-id="131"
                              data-current-credit="0"
                              onClick={() => ShowPopUp(item, "update")}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                              >
                                <path d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z" />
                              </svg>
                            </a>
                          </td>
                          <td align="right" width="10%" className="text-blue">
                            {item.remaining_balance}
                          </td>
                          <td align="right" className="text-danger" width="10%">
                            <p className="exposure badge bg-suspend p-2">
                              {item.exposure}
                            </p>
                          </td>
                          <td align="right" width="10%">
                            {item.balance}
                          </td>
                          <td
                            align="right"
                            width="10%"
                            className={
                              item.ref_pl > 0 ? "text-green" : "text-danger"
                            }
                          >
                            ({removeNegative(item.ref_pl)})
                          </td>
                          {/* <td align="right" width="10%" className="">{item.cumulative_pl}</td> */}
                          <td align="right" width="10%">
                            <u
                              className="text-blue"
                              style={{ marginRight: "5px" }}
                            >
                              {item?.sportWinLimit}
                            </u>
                            <a
                              className="open-credit-popup color_black cursor-pointer text-decoration-none"
                              data-id="131"
                              data-current-credit="0"
                              onClick={() =>
                                ShowPopUp(item, "updateSportLimit")
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                              >
                                <path d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z" />
                              </svg>
                            </a>
                          </td>
                          <td
                            width="7%"
                            className="status"
                            style={{ textAlign: "right" }}
                          >
                            <span className={`badge bg-${item.status} p-2`}>
                              {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                                    <path d="M192 64C86 64 0 150 0 256S86 448 192 448H384c106 0 192-86 192-192s-86-192-192-192H192zM384 352c-53 0-96-43-96-96s43-96 96-96s96 43 96 96s-43 96-96 96z" />
                                                </svg> */}
                              <div className="icons" />
                              {item.status}
                            </span>
                          </td>
                          {/* <td width="15%" align="right">
                                            <div className="btn-group action_btn" role="group" aria-label="Basic example">
                                                <button type="button" className="btn btn-outline-warning change-status" title="Change Status" onClick={() => ShowPopUp(item, "status", 'PLAYER')} >
                                                    <img src="/images/setting-icon.png" alt="" />
                                                </button>
                                                <a className="btn btn-outline-warning" title="Change Password" onClick={(e) => gotoUser(e, item, 'player')}>
                                                    <img src="/images/user-icon.png" alt="" />
                                                </a>
                                                <a className="btn btn-outline-warning" title="Bet History" href="#" onClick={(e) => gotoUser(e, item, 'player', 'bethistory')}>
                                                    <img src="/images/updown-arrow-icon.png" alt="" />
                                                </a>
                                                <a className="btn btn-outline-warning" title="Account Statement" href="#" onClick={(e) => gotoUser(e, item, 'player', 'account-statement')}>
                                                    <img src="/images/history-icon.png" alt="" />
                                                </a>
                                            </div>
                                        </td> */}
                          <td width="15%" align="right">
                            <div
                              className="action_btn"
                              role="group"
                              aria-label="Basic example"
                            >
                              <a
                                className="btn bet_history"
                                title="Bet History"
                                href="#"
                                onClick={(e) =>
                                  gotoUser(e, item, "player", "bethistory")
                                }
                              >
                                {" "}
                              </a>
                              <a
                                className="btn account_statement"
                                title="Account Statement"
                                href="#"
                                onClick={(e) =>
                                  gotoUser(
                                    e,
                                    item,
                                    "player",
                                    "account-statement"
                                  )
                                }
                              >
                                {" "}
                              </a>
                              <button
                                type="button"
                                className="btn change_status"
                                title="Change Status"
                                onClick={() =>
                                  ShowPopUp(item, "status", "PLAYER")
                                }
                              >
                                {" "}
                              </button>
                              <a
                                className="btn change_password"
                                title="Change Password"
                                onClick={(e) => gotoUser(e, item, "player")}
                              >
                                {" "}
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <h2>No Data</h2>
                  )}
                  {/* <tr className='total'>
                                <td align="left" style={{ fontWeight: "bold" }}> Total </td>
                                <td align="right" style={{ fontWeight: "bold" }}> 0.00 </td>
                                <td align="right" style={{ fontWeight: "bold" }}> 0.00 </td>
                                <td align="right" style={{ fontWeight: "bold" }} className="text-danger"> (0.00) </td>
                                <td align="right" style={{ fontWeight: "bold" }}> 0.00 </td>
                                <td align="right" style={{ fontWeight: "bold" }}> 0.00</td>
                                <td colSpan={3}> </td>
                            </tr> */}
                </tbody>
              </table>
            )}
          </div>

          {modalType.type === "updateSportLimit" && (
            <SkyPopup
              title={`Update Sports Limit`}
              OpenModal={OpenModal}
              closeModel={() => setOpenModal(false)}
              submit={onSportLimitSubmit}
            >
              <div>
                <input type="hidden" name="_token" />
                <input type="hidden" name="user_id" id="user_id" value="133" />
                <div className="modal-body">
                  <div className="d_flex">
                    <div className="fieldset">
                      <div className="mb-2">
                        <span>Current</span>
                        <span>
                          <input
                            type="text"
                            name="current_limit"
                            maxLength={16}
                            onChange={(e) => onSportLimitChange(e)}
                            className="form-control"
                            readOnly
                            value={sportLimit?.current_limit}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="fieldset">
                      <div className="mb-2">
                        <span>New Current</span>
                        <span>
                          <input
                            type="number"
                            name="sportWinLimit"
                            maxLength={16}
                            value={sportLimit?.sportWinLimit}
                            onChange={(e) => onSportLimitChange(e)}
                            className="form-control"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="fieldset full new">
                      <div className="mb-2">
                        <span> Password </span>
                        <span>
                          <input
                            type="password"
                            name="password"
                            value={sportLimit.password}
                            onChange={(e) => onSportLimitChange(e)}
                            className="form-control"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SkyPopup>
          )}
          {modalType.type === "update" && (
            <SkyPopup
              title={`Update Credit Reference`}
              OpenModal={OpenModal}
              closeModel={() => setOpenModal(false)}
              submit={onCreditRefSubmit}
            >
              <div>
                <input type="hidden" name="_token" />
                <input type="hidden" name="user_id" id="user_id" value="133" />
                <div className="modal-body">
                  <div className="d_flex">
                    <div className="fieldset">
                      <div className="mb-2">
                        <span>Current</span>
                        <span>
                          <input
                            type="text"
                            name="current_credit"
                            maxLength={16}
                            onChange={(e) => onCreditRefChange(e)}
                            className="form-control"
                            readOnly
                            value={creditRef.current_credit}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="fieldset">
                      <div className="mb-2">
                        <span>New Current</span>
                        <span>
                          <input
                            type="number"
                            name="credit_ref"
                            maxLength={16}
                            value={creditRef.credit_ref}
                            onChange={(e) => onCreditRefChange(e)}
                            className="form-control"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="fieldset full new">
                      <div className="mb-2">
                        <span> Password </span>
                        <span>
                          <input
                            type="password"
                            name="password"
                            value={creditRef.password}
                            onChange={(e) => onCreditRefChange(e)}
                            className="form-control"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SkyPopup>
          )}
          {modalType.type === "addplayer" && (
            <AddModal
              title={`Add Player`}
              customClass="add-player"
              OpenModal={OpenModal}
              closeModel={() => closeModel()}
              type="addplayer"
              submitForm={submitAddPopup}
              onAddDataChange={onAddPlayerChange}
              addDataFrom={addPlayerFrom}
              onSelectChange={onStatusSelectChange}
              domainList={domainList}
              pageData={HeaderData}
            />
          )}
          {modalType.type === "addagent" && (
            <AddModal
              title={`Add ${getButtonText()}`}
              customClass="add-agent"
              pageData={HeaderData}
              OpenModal={OpenModal}
              closeModel={() => closeModel()}
              type="addagent"
              submitForm={submitAddPopup}
              onAddDataChange={onAddAgentChange}
              onSelectChange={onAddAgentSelectChange}
              addDataFrom={addAgentFrom}
              domainList={domainList}
            />
          )}
          {modalType.type === "status" && (
            <UpdateModal
              title={`Change Status`}
              OpenModal={OpenModal}
              closeModel={() => closeModel()}
              type="status"
              submitForm={submitStatusPopup}
              onAddDataChange={onStatusChange}
              onPasswordChange={onPasswordChang}
              addDataFrom={statusUpdate}
              Validator={Validator}
            />
          )}
          {open && (
            <SkyPopup
              title={`Exposure Information`}
              OpenModal={true}
              closeModel={() => setOpen(false)}
              btnName="Cancel"
              submit={() => setOpen(false)}
            >
              <table className="table01">
                <thead>
                  <tr>
                    <th
                      style={{ width: "10%" }}
                      id="accountTh"
                      className="align-L"
                    >
                      Match Name
                    </th>
                    <th
                      style={{ width: "10%" }}
                      id="accountTh"
                      className="align-L"
                    >
                      Market/FancyName
                    </th>
                    <th
                      style={{ width: "10%" }}
                      id="accountTh"
                      className="align-L"
                    >
                      SourceId
                    </th>
                    <th
                      style={{ width: "10%" }}
                      id="accountTh"
                      className="align-L"
                    >
                      Exposure
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ireland U19 v Pakistan U19</td>
                    <td>Match odds</td>
                    <td>32976984</td>
                    <td>1.00</td>
                  </tr>
                  <tr>
                    <td>Ireland U19 v Pakistan U19</td>
                    <td>Match odds</td>
                    <td>32976984</td>
                    <td>1.00</td>
                  </tr>
                  <tr>
                    <td>Ireland U19 v Pakistan U19</td>
                    <td>Match odds</td>
                    <td>32976984</td>
                    <td>1.00</td>
                  </tr>
                </tbody>
              </table>
            </SkyPopup>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;

export const Input = (props: any) => {
  const {
    label,
    placeholder,
    type,
    name,
    value,
    onChange,
    errorValidation,
    readOnly,
    maxLength,
    secondPar,
  } = props;
  return (
    <>
      <div>
        <span>{label}</span>
        <span>
          <input
            type={type}
            placeholder={placeholder ? placeholder : ""}
            name={name}
            maxLength={maxLength}
            className="form-control"
            readOnly={readOnly}
            value={value}
            onChange={(e) => onChange(e, secondPar)}
          />
        </span>
        <span className="must">＊</span>
      </div>
      {name !== "firstName" && name !== "lastName" && errorValidation ? (
        <>
          <span className="error" style={{ color: "red" }}>
            {errorValidation}
          </span>
        </>
      ) : (
        ""
      )}
    </>
  );
};
export const InputPass = (props: any) => {
  const [showPass, setShowPass] = useState(false);

  const {
    label,
    placeholder,
    type,
    name,
    value,
    onChange,
    errorValidation,
    readOnly,
    maxLength,
    required,
  } = props;
  return (
    <>
      <div>
        <span>{label}:</span>
        <span>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : type}
              placeholder={placeholder ? placeholder : ""}
              name={name}
              maxLength={maxLength}
              className="form-control"
              readOnly={readOnly}
              value={value}
              onChange={(e) => onChange(e)}
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
        </span>
        {required && <span className="must">＊</span>}
      </div>
      {errorValidation ? (
        <span className="error" style={{ color: "red", marginLeft: "175px" }}>
          {errorValidation}
        </span>
      ) : (
        ""
      )}
    </>
  );
};

export const AddModal = (props: any) => {
  const {
    title,
    OpenModal,
    closeModel,
    submitForm,
    type,
    onAddDataChange,
    addDataFrom,
    pageData,
    domainList,
    onSelectChange,
    customClass,
  } = props;
  // const onSelectChangeInside =(e:any)=>{
  //     console.log(e);
  //     let data: any[] = []
  //     e.forEach((element:any) => {
  //         data.push(element.value)
  //     });
  //     onSelectChange(data)

  // }

  const isMultiAccount = process.env.REACT_APP_MULTIUSER;

  const agentLevelAccess = (optionIndex: number) => {
    // let arr = ["SP", "AD", "SMDL", "MDL", "DL"];
    let arr = ["SUO", "WL", "SA", "A", "SUA", "SS", "S", "M"];
    const checkIndex = arr.findIndex((_: any) => _ === pageData.agent_level);
    if (optionIndex <= checkIndex) return true;
    else return false;
  };

  const getOptions = () => {
    switch (pageData?.name) {
      case "COM":
        return (
          <option selected disabled={agentLevelAccess(0)} value="SP">
            SUPER ADMIN (SP)
          </option>
        );
      case "SA":
        return (
          <option selected disabled={agentLevelAccess(1)} value="AD">
            ADMIN (AD)
          </option>
        );
      case "AD":
        return (
          <option selected disabled={agentLevelAccess(2)} value="SMDL">
            SUB ADMIN (SMDL)
          </option>
        );
      case "SMDL":
        return (
          <option selected disabled={agentLevelAccess(3)} value="MDL">
            SUPER MASTER (MDL)
          </option>
        );
      case "MDL":
        return (
          <option selected disabled={agentLevelAccess(4)} value="DL">
            MASTER (DL)
          </option>
        );
      case "DL":
        return <></>;
      default:
        break;
    }
  };
  console.log(pageData?.name, ":::::::::::::::::::::::::::::::;paaa");

  const getAgentLevelAccess = (optionIndex: number, agent_level: string) => {
    const USER_LEVEL_NAME: any = {
      O: "Owner",
      SUO: "Sub Owner",
      WL: "WHITELEBEL",
      SP: "Super Admin",
      A: "Admin",
      SUA: "Sub Admin",
      SS: "Senior Super",
      S: "Super",
      M: "Master",
      CL: "Player",
      PL: "Player",
    };
    let nameArr = [
      "Sub Owner",
      "WHITELEBEL",
      "Super Admin",
      "Admin",
      "Sub Admin",
      "Senior Super",
      "Super",
      "Master",
      "Player",
      "Player",
    ];
    let arr = ["SUO", "WL", "SA", "A", "SUA", "SS", "S", "M"];

    const checkIndex = arr.findIndex((_: any) => _ === agent_level);
    // if (optionIndex <= checkIndex) return true;
    // else return false;
    return (
      <>
        <option selected={checkIndex === optionIndex} value={arr[checkIndex]}>
          {/* WHITELEBEL (WL) */}
          {`${nameArr[checkIndex]} (${arr[checkIndex]})`}
        </option>
      </>
    );
  };
  const getOptionsForNEw = () => {
    switch (pageData?.name) {
      case "O":
        return (
          // <option selected disabled={agentLevelAccess(0)} value="SUO">
          //   SUB OWNER (SUO)
          // </option>
          // getAgentLevelAccess(0, 'SUO')
          <>{getAgentLevelAccess(0, "SUO")}</>
        );
      case "SUO":
        return (
          // <option selected disabled={agentLevelAccess(1)} value="WL">
          //   WHITELEBEL (WL)
          // </option>
          <>{getAgentLevelAccess(1, "WL")}</>
        );
      case "WL":
        return (
          // <option selected disabled={agentLevelAccess(2)} value="SMDL">
          //   SUB ADMIN (SMDL)
          // </option>
          <>
            {getAgentLevelAccess(2, "SA")}
            {getAgentLevelAccess(2, "A")}
            {getAgentLevelAccess(2, "SUA")}
            {getAgentLevelAccess(2, "SS")}
            {getAgentLevelAccess(2, "S")}
            {getAgentLevelAccess(2, "M")}
          </>
        );
      case "SA":
        return (
          // <option selected disabled={agentLevelAccess(3)} value="MDL">
          //   SUPER MASTER (MDL)
          // </option>
          <>
            {getAgentLevelAccess(3, "A")}
            {getAgentLevelAccess(3, "SUA")}
            {getAgentLevelAccess(3, "SS")}
            {getAgentLevelAccess(3, "S")}
            {getAgentLevelAccess(3, "M")}
          </>
        );
      case "A":
        return (
          // <option selected disabled={agentLevelAccess(4)} value="DL">
          //   MASTER (DL)
          // </option>
          <>
            {getAgentLevelAccess(4, "SUA")}
            {getAgentLevelAccess(4, "SS")}
            {getAgentLevelAccess(4, "S")}
            {getAgentLevelAccess(4, "M")}
          </>
        );
      case "SUA":
        return (
          <>
            {getAgentLevelAccess(5, "SS")}
            {getAgentLevelAccess(5, "S")}
            {getAgentLevelAccess(5, "M")}
          </>
        );
      case "SS":
        return (
          <>
            {getAgentLevelAccess(6, "S")}
            {getAgentLevelAccess(6, "M")}
          </>
        );
      case "S":
        return <>{getAgentLevelAccess(7, "M")}</>;
      case "M":
        return <></>;
      default:
        break;
    }
  };
  return (
    <>
      <SkyPopup
        title={title}
        OpenModal={OpenModal}
        closeModel={closeModel}
        type={type}
        submit={submitForm}
        customClass={customClass}
      >
        <div className="addplayer">
          <div className="modal-body">
            <div className="d_flex">
              {type === "addagent" && isMultiAccount === "true" && (
                <div
                  className="fieldset full new"
                  // style={{ display: "none" }}
                >
                  <div>
                    <span>Agent Level:</span>
                    <span>
                      <select
                        className="form-control"
                        name="agent_level"
                        id="agent_level"
                        value={addDataFrom.agent_level}
                        onChange={onAddDataChange}
                        // disabled
                      >
                        {/* <option disabled={true} selected value="">Select From below</option> */}
                        {getOptionsForNEw()}
                      </select>
                    </span>
                    <span className="must">＊</span>
                  </div>
                  {addDataFrom.agent_level === "" &&
                    addDataFrom.user_name !== "" && (
                      <span
                        className="error"
                        style={{
                          color: "red",
                          width: "154px",
                          marginLeft: "auto",
                          display: "block",
                          fontSize: "10px",
                        }}
                      >
                        this field is required
                      </span>
                    )}
                </div>
              )}
              <div className="fieldset full new">
                <Input
                  label="User Name"
                  placeholder="Enter"
                  type="text"
                  name="user_name"
                  onChange={onAddDataChange}
                  value={addDataFrom.user_name}
                  maxLength={16}
                  required
                />
              </div>
              <div className="fieldset full new">
                <InputPass
                  label="Password"
                  placeholder="Enter"
                  type="password"
                  name="password"
                  onChange={onAddDataChange}
                  value={addDataFrom.password}
                  required
                />
              </div>
              <div className="fieldset full new">
                <InputPass
                  label="Confirm Password"
                  placeholder="Enter"
                  type="password"
                  name="confirmPassword"
                  required
                  onChange={onAddDataChange}
                  value={addDataFrom.confirmPassword}
                  errorValidation={
                    addDataFrom.confirmPassword !== "" &&
                    addDataFrom.password !== "" &&
                    addDataFrom.password !== addDataFrom.confirmPassword
                      ? "password not match"
                      : false
                  }
                />
              </div>

              <hr />

              <div className="fieldset full new">
                <Input
                  label="First Name"
                  type="text"
                  placeholder="Enter"
                  name="firstName"
                  onChange={onAddDataChange}
                  value={addDataFrom.firstName}
                  maxLength={16}
                  // required
                />
              </div>
              <div className="fieldset full new">
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Enter"
                  name="lastName"
                  onChange={onAddDataChange}
                  value={addDataFrom.lastName}
                  maxLength={16}
                  // required
                />
              </div>
              {(pageData?.name === "O" || pageData?.name === "M") && (
                <div className="fieldset full new">
                  <Input
                    label="Commission(%)"
                    type="text"
                    placeholder="Enter"
                    name="commission"
                    onChange={onAddDataChange}
                    value={addDataFrom.commission}
                    maxLength={16}
                    readOnly={pageData?.name !== "O" ? true : false}
                  />
                </div>
              )}
              {type === "addagent" && (
                <div className="fieldset full new" style={{ display: "none" }}>
                  <Input
                    label="Limit"
                    type="text"
                    placeholder="Enter"
                    name="limit"
                    onChange={onAddDataChange}
                    value={addDataFrom.limit}
                    maxLength={16}
                  />
                </div>
              )}
              {(pageData?.name === "O" ||
                pageData?.name === "SUO" ||
                pageData?.name === "WL") && (
                <div className="fieldset full new domain">
                  <div>
                    <span>Domain:</span>
                    <Select
                      defaultValue={addDataFrom.value}
                      options={domainList}
                      isMulti
                      onChange={(e) => onSelectChange(e)}
                    />
                    <span>
                      <span className="must">＊</span>
                      {/* <select className="form-control" name="domain" id="domain" value={addDataFrom.value} onChange={onAddDataChange}>
                                            {domainList?.length > 0 && domainList.map((item: any) => {
                                                return (
                                                    <option value={item.value}>{item.label}</option>
                                                    )
                                                })}
                                            </select> */}
                    </span>
                  </div>
                </div>
              )}

              {pageData?.name === "O" && (
                <>
                  <div className="fieldset full new switch">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        onChange={(e) => onAddDataChange(e)}
                        checked={addDataFrom.rolling_delay}
                        name="rolling_delay"
                        type="checkbox"
                        role="switch"
                        id="rolling_delay"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="rolling_delay"
                      >
                        Rolling Delay
                      </label>
                    </div>
                  </div>
                  {addDataFrom.rolling_delay ? (
                    <div className="d_flex rolling">
                      <div className="fieldset">
                        <div>
                          <Input
                            label="Odds"
                            type="number"
                            placeholder="Enter"
                            secondPar={true}
                            onChange={onAddDataChange}
                            value={addDataFrom.delay.odds}
                            name="odds"
                            maxLength={16}
                          />
                        </div>
                      </div>
                      <div className="fieldset">
                        <div>
                          <Input
                            label="Bookmaker"
                            type="number"
                            secondPar={true}
                            onChange={onAddDataChange}
                            value={addDataFrom.delay.bookmaker}
                            placeholder="Enter"
                            name="bookmaker"
                            maxLength={16}
                          />
                        </div>
                      </div>
                      <div className="fieldset">
                        <div>
                          <Input
                            label="Fancy"
                            type="number"
                            placeholder="Enter"
                            secondPar={true}
                            onChange={onAddDataChange}
                            value={addDataFrom.delay.fancy}
                            name="fancy"
                            maxLength={16}
                          />
                        </div>
                      </div>
                      <div className="fieldset">
                        <div>
                          <Input
                            label="Premium"
                            type="number"
                            placeholder="Enter"
                            secondPar={true}
                            onChange={onAddDataChange}
                            value={addDataFrom.delay.premium}
                            name="premium"
                            maxLength={16}
                          />
                        </div>
                      </div>
                      <div className="fieldset">
                        <div>
                          <Input
                            label="Soccer"
                            type="number"
                            placeholder="Enter"
                            secondPar={true}
                            onChange={onAddDataChange}
                            value={addDataFrom.delay.soccer}
                            name="soccer"
                            maxLength={16}
                          />
                        </div>
                      </div>
                      <div className="fieldset">
                        <div>
                          <Input
                            label="Tennis"
                            type="number"
                            placeholder="Enter"
                            secondPar={true}
                            onChange={onAddDataChange}
                            value={addDataFrom.delay.tennis}
                            name="tennis"
                            maxLength={16}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  {/* } */}
                </>
              )}
            </div>
          </div>
        </div>
      </SkyPopup>
    </>
  );
};

export const UpdateModal = (props: any) => {
  const {
    title,
    OpenModal,
    closeModel,
    submitForm,
    type,
    onAddDataChange,
    onPasswordChange,
    addDataFrom,
    Validator,
  } = props;
  console.log("::::;", addDataFrom);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const [isSelect, setIsSelect] = useState("");
  const DD = useSelector((e: any) => e.domainDetails);

  useEffect(() => {
    setIsSelect("");
  }, []);
  const getStatus = (
    type: string,
    currentStatus: string,
    oldStatus: string
  ) => {
    let status = "";
    let bg = "";
    // currentStatus has been change.

    if (oldStatus === type) {
      if (currentStatus === type && isSelect !== "" && isSelect === type) {
        status = "status_selected";
        bg = `${type}_selected_hover`;
      } else {
        status = "status_active";
        bg = `${type}_selected_not`;
      }
    } else {
      if (currentStatus === type) {
        status = "status_selected";
        bg = `${type}_selected`;
        // bg = `${type}_selected_hover`;
      } else {
        status = "status_off";
        bg = `${type}_selected_not_active`;
      }
    }

    return { status, bg };
  };

  return (
    <>
      <SkyPopup
        title={title}
        OpenModal={OpenModal}
        closeModel={closeModel}
        type={type}
        isHideSubmit
        customClass="updated-modal"
        submit={submitForm}
      >
        <div className="update_status">
          <div className="modal-body">
            <div className="updated-modal-inner">
              <div
                className="update_status_block"
                style={{ padding: "10px 12px" }}
              >
                <div className="d_flex">
                  <div className="update_status_block_user">
                    <span
                      id="agent-level"
                      className="badge bg-warning text-white"
                    >
                      {addDataFrom.allData?.agent_level}
                    </span>
                    <span id="user-name">
                      {addDataFrom.allData?.user_name} [
                      {addDataFrom.allData?.firstName}{" "}
                      {addDataFrom.allData?.lastName}]
                    </span>
                  </div>
                  <div className="">
                    <p className="status-active text-uppercase">
                      {addDataFrom.allData?.status}
                    </p>
                  </div>
                </div>
              </div>
              <div className="update_status_block_content d_flex">
                <div
                  className="update_status_block_content_item"
                  onClick={() => {
                    onAddDataChange("active");
                    setIsSelect("active");
                  }}
                >
                  <div
                    className={`${
                      getStatus(
                        "active",
                        addDataFrom.status,
                        addDataFrom?.allData?.status
                      )?.bg
                    }  status-box card active `}
                    data-status="active"
                  >
                    <div className="card-body">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg> */}
                      {/* <div className='action_img active_action status_selected'/> */}
                      <div
                        className={`${
                          getStatus(
                            "active",
                            addDataFrom.status,
                            addDataFrom?.allData?.status
                          )?.status
                        }  action_img active_action `}
                      />
                      <h5 className="card-title">Active</h5>
                    </div>
                  </div>
                </div>
                <div
                  className="update_status_block_content_item"
                  onClick={() => {
                    onAddDataChange("suspend");
                    setIsSelect("suspend");
                  }}
                >
                  <div
                    className={`${
                      getStatus(
                        "suspend",
                        addDataFrom.status,
                        addDataFrom?.allData?.status
                      )?.bg
                    }  status-box card suspend `}
                    data-status="active"
                  >
                    <div className="card-body">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" /></svg> */}
                      {/* <h5 className="card-title">Suspend</h5> */}
                      <div
                        className={`${
                          getStatus(
                            "suspend",
                            addDataFrom.status,
                            addDataFrom?.allData?.status
                          )?.status
                        }  action_img suspend_action `}
                      />
                      <h5 className="card-title">Suspend</h5>
                    </div>
                  </div>
                </div>
                <div
                  className="update_status_block_content_item"
                  onClick={() => {
                    onAddDataChange("locked");
                    setIsSelect("locked");
                  }}
                >
                  <div
                    className={`${
                      getStatus(
                        "locked",
                        addDataFrom.status,
                        addDataFrom?.allData?.status
                      )?.bg
                    }  status-box card locked `}
                    data-status="active"
                  >
                    <div className="card-body">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" /></svg> */}
                      {/* <h5 className="card-title">Locked</h5> */}
                      <div
                        className={`${
                          getStatus(
                            "locked",
                            addDataFrom.status,
                            addDataFrom?.allData?.status
                          )?.status
                        }  action_img lock_action `}
                      />
                      <h5 className="card-title">Locked</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d_flex">
              <div className="fieldset full new">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Enter"
                  onChange={onPasswordChange}
                  errorValidation={Validator.current.message(
                    "Password",
                    addDataFrom.password,
                    "required"
                  )}
                  value={addDataFrom.password}
                />
                <button
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                  onClick={(e) => submitForm(e, type ? type : "")}
                  className="submit-btn btn btn_black"
                >
                  {" "}
                  Change{" "}
                </button>
              </div>
            </div>
          </div>
        </div>
      </SkyPopup>
    </>
  );
};
