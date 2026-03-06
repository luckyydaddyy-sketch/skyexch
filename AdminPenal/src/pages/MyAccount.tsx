import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import AccountStatement from "../components/Profile/AccountStatement";
import ActivityLog from "../components/Profile/ActivityLog";
import Profile from "../components/Profile/Profile";
import SkyPopup from "../components/SkyPopup";
import MyBet from "../components/Profile/MyBet";
import SimpleReactValidator from "simple-react-validator";
import Input from "../components/Input";
import { ADMIN_API } from "../common/common";
import { postApi, notifyMessage, notifyError, getApi } from "../service";
import { styleObjectBlackButton, styleObjectGetBG } from "../common/StyleSeter";
import Cookies from "universal-cookie";
import TransactionHistory from "../components/Profile/TransactionHistory";
import BalanceSummary from "../components/Profile/BalanceSummary";
import AccountSummary from "../components/Profile/AccountSummary";
import WLTransactionHistory from "../components/Profile/WLTransactionHistory";
import { Logout } from "../common/Funcation";

interface changePassInterface {
  password: string;
  id: string;
  status?: string;
  newPassword?: string;
  confirmPassword?: string;
  domain?: string[];
}
const cookies = new Cookies();
const MyAccount = () => {
  const authToken = cookies.get("skyToken");
  const [, updateState] = React.useState({});
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const DD = useSelector((e: any) => e.domainDetails);
  const USER_DATA = useSelector((e: any) => e.userData);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const [domainList, setDomainList] = useState<any>([]);

  const Validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
    })
  );
  useEffect(() => {
    if (authToken) {
      getDomainDetails(authToken);
    }
  }, []);
  const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
  console.log(isAuthenticated);

  const navigate = useNavigate();
  let { tab, userId, TYPE } = useParams();

  const [changePassword, setChangePassword] = useState<changePassInterface>({
    password: "",
    id: userId ? userId : "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changeDomain, setChangeDomain] = useState<changePassInterface>({
    password: "",
    id: userId ? userId : "",
    domain: [],
  });

  const handleChangePasswordInput = (e: any) => {
    const { name, value } = e.target;
    setChangePassword({
      ...changePassword,
      [name]: value,
    });
  };

  const [OpenModal, setOpenModal] = useState<boolean>(false);
  const ShowPopUp = (item: any, type: string) => {
    setChangePassword({
      ...changePassword,
      id: item._id,
    });
    setOpenModal(true);
  };

  const closePopup = () => {
    setOpenModal(false);
    setChangePassword({
      password: "",
      id: userId ? userId : "",
      newPassword: "",
      confirmPassword: "",
    });
    Validator.current.hideMessages();
  };

  const switchTab = (newTab: string, tab2: string) => {
    if (userId && TYPE) {
      navigate(`/user/${tab2}/${TYPE}/${userId}`, { replace: true });
    } else {
      navigate(newTab);
    }
  };

  const submitChangePasswordForm = async (e: any) => {
    e.preventDefault();
    const isValid = !Validator.current.message(
      "id",
      changePassword.id,
      "required"
    ) && !Validator.current.message(
      "Password",
      changePassword.password,
      "required"
    ) && !Validator.current.message(
      "New Password",
      changePassword.newPassword,
      "required"
    ) && !Validator.current.message(
      "confirmPassword",
      changePassword.confirmPassword,
      "required"
    );
    if (Validator.current.allValid() || isValid) {
      let data = {
        api:
          TYPE === "player"
            ? ADMIN_API.PLAYER_UPDATE_INFO
            : ADMIN_API.AGENT_UPDATE_INFO,
        value: changePassword,
        token: authToken ? authToken : undefined,
      };
      await postApi(data)
        .then(function (response) {
          setOpenModal(false);
          notifyMessage(response.data.message);
          closePopup();
        })
        .catch((err) => {
          notifyError(err.response.data.message);
        });
    } else {
      Validator.current.showMessages();
      forceUpdate();
    }
  };

  const submitDomianChange = async (e: any) => {
    console.log("changeDomain:: ", changeDomain);

    e.preventDefault();
    // if (Validator.current.allValid()) {
      let data = {
        api:
          TYPE === "player"
            ? ADMIN_API.PLAYER_UPDATE_INFO
            : ADMIN_API.AGENT_UPDATE_INFO,
        value: changeDomain,
        token: authToken ? authToken : undefined,
      };
      await postApi(data)
        .then(function (response) {
          setOpenDomainModal(false);
          notifyMessage(response.data.message);
          closePopupDomain();
        })
        .catch((err) => {
          notifyError(err.response.data.message);
        });
    // } else {
    //   Validator.current.showMessages();
    //   forceUpdate();
    // }
  };
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
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          window.open("/login");
        }
      });
  };

  const [OpenDomainModal, setOpenDomainModal] = useState<boolean>(false);
  const ShowPopUpDomain = (item: any, type: string) => {
    setChangeDomain({
      ...changeDomain,
      id: item._id,
    });
    setOpenDomainModal(true);
  };
  const closePopupDomain = () => {
    setOpenDomainModal(false);
    setChangeDomain({
      password: "",
      domain: [],
      id: userId ? userId : "",
    });
    Validator.current.hideMessages();
  };

  const handleChangePasswordInputDomain = (e: any) => {
    const { name, value } = e.target;
    setChangeDomain({
      ...changeDomain,
      [name]: value,
    });
  };
  const onAddAgentSelectChange = (e: any) => {
    console.log(e);
    let data: any[] = [];
    e.forEach((element: any) => {
      data.push(element.value);
    });
    setChangeDomain({
      ...changeDomain,
      domain: data,
    });
  };
  return (
    <>
      <div className="container account main_wrap">
        <div className="top_header">
          <div className="top_header_title align-items-center mt-3">
            <h5>
              <strong className="">
                {USER_DATA?.user_name}{" "}
                {USER_DATA?.firstName || USER_DATA?.lastName
                  ? `[${USER_DATA?.firstName + " " + USER_DATA?.lastName}]`
                  : ""}
              </strong>{" "}
              Manage Profile
            </h5>
          </div>
        </div>

        <div className="account_tabs">
          <div className="account_tabs_l">
            <ul className="account_tabs_l_list">
              <li
                style={{
                  color: "white",
                  background: "#243a48",
                  padding: "8px 16px",
                }}
              >
                Position
              </li>
              <li
                className={`${
                  tab === "account-summary" ? "active" : ""
                } account_tabs_l_list_item`}
              >
                <a
                  style={
                    tab === "account-summary"
                      ? styleObjectGetBG(DD?.colorSchema, true, true)
                      : {}
                  }
                  onClick={() =>
                    switchTab("/profile/account-summary", "account-statement")
                  }
                >
                  {" "}
                  Account Summary{" "}
                </a>
              </li>
              <li
                style={{
                  color: "white",
                  background: "#243a48",
                  padding: "8px 16px",
                }}
              >
                Account Details
              </li>
              <li
                className={`${
                  tab === "profile" || window.location.pathname === "/profile"
                    ? "active"
                    : ""
                } account_tabs_l_list_item`}
              >
                <a
                  style={
                    tab === "profile" || window.location.pathname === "/profile"
                      ? styleObjectGetBG(DD?.colorSchema, true, true)
                      : {}
                  }
                  onClick={() => switchTab("/profile", "profile")}
                >
                  {" "}
                  Profile{" "}
                </a>
              </li>
              <li
                className={`${
                  tab === "transaction-history" ? "active" : ""
                } account_tabs_l_list_item`}
              >
                <a
                  style={
                    tab === "transaction-history"
                      ? styleObjectGetBG(DD?.colorSchema, true, true)
                      : {}
                  }
                  onClick={() =>
                    switchTab(
                      "/profile/transaction-history",
                      "transaction-history"
                    )
                  }
                >
                  {" "}
                  Transaction History{" "}
                </a>
              </li>
              <li
                className={`${
                  tab === "account-statement" ? "active" : ""
                } account_tabs_l_list_item`}
              >
                <a
                  style={
                    tab === "account-statement"
                      ? styleObjectGetBG(DD?.colorSchema, true, true)
                      : {}
                  }
                  onClick={() =>
                    switchTab("/profile/account-statement", "account-statement")
                  }
                >
                  {" "}
                  Account Statement{" "}
                </a>
              </li>
              <li
                className={`${
                  tab === "DPWD-transaction" ? "active" : ""
                } account_tabs_l_list_item`}
              >
                <a
                  style={
                    tab === "DPWD-transaction"
                      ? styleObjectGetBG(DD?.colorSchema, true, true)
                      : {}
                  }
                  onClick={() =>
                    switchTab("/profile/DPWD-transaction", "DPWD-transaction")
                  }
                >
                  {" "}
                  Online DP/WD transaction{" "}
                </a>
              </li>
              <li
                className={`${
                  tab === "balance-summary" ? "active" : ""
                } account_tabs_l_list_item`}
                style={{display:"none"}}
              >
                <a
                  style={
                    tab === "balance-summary"
                      ? styleObjectGetBG(DD?.colorSchema, true, true)
                      : {}
                  }
                  onClick={() =>
                    switchTab("/profile/balance-summary", "balance-summary")
                  }
                >
                  {" "}
                  Life Time P&L{" "}
                </a>
              </li>
              {userId && TYPE === "player" && (
                <>
                  <li
                    className={`${
                      tab === "mybet" ? "active" : ""
                    } account_tabs_l_list_item`}
                  >
                    <a
                      style={
                        tab === "mybet"
                          ? styleObjectGetBG(DD?.colorSchema, true, true)
                          : {}
                      }
                      onClick={() => switchTab("/profile/mybet", "mybet")}
                    >
                      {" "}
                      My Bet{" "}
                    </a>
                  </li>
                  <li
                    className={`${
                      tab === "bethistory" ? "active" : ""
                    } account_tabs_l_list_item`}
                  >
                    <a
                      style={
                        tab === "bethistory"
                          ? styleObjectGetBG(DD?.colorSchema, true, true)
                          : {}
                      }
                      onClick={() =>
                        switchTab("/profile/bethistory", "bethistory")
                      }
                    >
                      {" "}
                      Bet History{" "}
                    </a>
                  </li>
                </>
              )}
              <li
                className={`${
                  tab === "activity-log" ? "active" : ""
                } account_tabs_l_list_item `}
              >
                <a
                  style={
                    tab === "activity-log"
                      ? styleObjectGetBG(DD?.colorSchema, true, true)
                      : {}
                  }
                  onClick={() =>
                    switchTab("/profile/activity-log", "activity-log")
                  }
                >
                  {" "}
                  Activity Log{" "}
                </a>
              </li>
            </ul>
          </div>
          {(tab === "profile" || window.location.pathname === "/profile") && (
            <Profile
              TYPE={TYPE}
              ShowPopUp={ShowPopUp}
              userId={userId}
              ShowPopUpDomain={ShowPopUpDomain}
            />
          )}
          {(tab === "mybet" || tab === "bethistory") && (
            <>
              <div className="account_tabs_r">
                <h2 className="mb-15">
                  <strong>Betting History</strong>
                </h2>
                {/* <div className='account_tabs_r_bet d_flex'>
                                    <ul className="btn-group">
                                        <li className={`${tab === 'mybet' ? "active" : ""} btn btn btn-outline-secondary gray`} onClick={() => switchTab('/profile/mybet', 'mybet')}> Current Bets </li>
                                        <li className={`${tab === 'bethistory' ? "active" : ""} btn btn btn-outline-secondary gray`} onClick={() => switchTab('/profile/bethistory', 'bethistory')}> Bets History </li>
                                    </ul>
                                </div> */}
                <MyBet activeTab={tab} userId={userId} />
              </div>
            </>
          )}

          {tab === "account-summary" && (
            <AccountSummary userId={userId} TYPE={TYPE} />
          )}

          {tab === "account-statement" && (
            <AccountStatement userId={userId} TYPE={TYPE} />
          )}

          {tab === "transaction-history" && (
            <TransactionHistory userId={userId} TYPE={TYPE} />
          )}
          {tab === "DPWD-transaction" && (
            <WLTransactionHistory userId={userId} TYPE={TYPE} />
          )}

          {tab === "balance-summary" && (
            <BalanceSummary userId={userId} TYPE={TYPE} />
          )}

          {tab === "activity-log" && (
            <ActivityLog userId={userId} TYPE={TYPE} />
          )}
        </div>
      </div>

      <SkyPopup
        title={`Update Password`}
        OpenModal={OpenModal}
        closeModel={closePopup}
        submit={submitChangePasswordForm}
        customClass="update-pass"
        isHideSubmit
      >
        <div>
          <div className="modal-body">
            <div
              className="d_flex"
              style={{ width: "360px", margin: "0px 60px 0px auto" }}
            >
              <div className="fieldset full d_flex">
                <Input
                  divClass="mb-2"
                  label="New Password"
                  value={changePassword.newPassword}
                  errorValidation={Validator.current.message(
                    "New Password",
                    changePassword.newPassword,
                    "required"
                  )}
                  onChange={handleChangePasswordInput}
                  type="password"
                  name="newPassword"
                  maxLength={16}
                  className="form-control"
                />
              </div>
              <div className="fieldset full d_flex">
                <Input
                  divClass="mb-2"
                  label="Confirm Password"
                  value={changePassword.confirmPassword}
                  errorValidation={Validator.current.message(
                    "Confirm Password",
                    changePassword.confirmPassword,
                    `required|in:${changePassword.newPassword}`,
                    { messages: { in: "Passwords need to match!" } }
                  )}
                  onChange={handleChangePasswordInput}
                  type="password"
                  name="confirmPassword"
                  maxLength={16}
                  className="form-control"
                />
              </div>
              <div className="fieldset full d_flex">
                <Input
                  divClass="mb-2"
                  label="Your Password"
                  errorValidation={Validator.current.message(
                    "Password",
                    changePassword.password,
                    "required"
                  )}
                  value={changePassword.password}
                  onChange={handleChangePasswordInput}
                  type="password"
                  name="password"
                  className="form-control"
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "140px",
                }}
                onClick={(e) => submitChangePasswordForm(e)}
                className="submit-btn btn btn_black"
                type="submit"
              >
                {" "}
                Change{" "}
              </button>
            </div>
          </div>
        </div>
      </SkyPopup>

      <SkyPopup
        title={`Update Domain`}
        OpenModal={OpenDomainModal}
        closeModel={closePopupDomain}
        submit={submitChangePasswordForm}
        customClass="update-pass"
        isHideSubmit
      >
        <div>
          <div className="modal-body">
            <div
              className="d_flex"
              style={{ width: "360px", margin: "0px 60px 0px auto" }}
            >
              {/* <div className="fieldset full d_flex">
                                <Input divClass='mb-2'
                                    label='New Password'
                                    value={changePassword.newPassword}
                                    errorValidation={Validator.current.message('New Password', changePassword.newPassword, 'required')}
                                    onChange={handleChangePasswordInput}
                                    type="password"
                                    name="newPassword"
                                    maxLength={16}
                                    className="form-control" />
                            </div> */}
              {/* <div className="fieldset full d_flex">
                                <Input divClass='mb-2'
                                    label='Confirm Password'
                                    value={changePassword.confirmPassword}
                                    errorValidation={Validator.current.message('Confirm Password', changePassword.confirmPassword, `required|in:${changePassword.newPassword}`, { messages: { in: 'Passwords need to match!' } })}
                                    onChange={handleChangePasswordInput}
                                    type="password"
                                    name="confirmPassword"
                                    maxLength={16}
                                    className="form-control" />
                            </div> */}
              <div className="fieldset full new d_flex">
                <div>
                  <span>Domain:</span>
                  <Select
                    defaultValue={changeDomain.domain}
                    options={domainList}
                    isMulti
                    onChange={(e) => onAddAgentSelectChange(e)}
                  />
                  <span>
                    <span className="must">＊</span>
                  </span>
                </div>
              </div>
              <div className="fieldset full d_flex">
                <Input
                  divClass="mb-2"
                  label="Your Password"
                  errorValidation={Validator.current.message(
                    "Password",
                    changeDomain.password,
                    "required"
                  )}
                  value={changeDomain.password}
                  onChange={handleChangePasswordInputDomain}
                  type="password"
                  name="password"
                  className="form-control"
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "140px",
                }}
                onClick={(e) => submitDomianChange(e)}
                className="submit-btn btn btn_black"
              >
                {" "}
                Change{" "}
              </button>
            </div>
          </div>
        </div>
      </SkyPopup>
    </>
  );
};

export default MyAccount;
