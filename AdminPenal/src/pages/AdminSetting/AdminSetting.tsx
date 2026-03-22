import React, { useEffect, useRef, useState } from "react";
import SkyPopup from "../../components/SkyPopup";
import {
  getApi,
  getApiLink,
  notifyError,
  notifyMessage,
  postApi,
} from "../../service";
import { ADMIN_API } from "../../common/common";
import SimpleReactValidator from "simple-react-validator";
import Cookies from "universal-cookie";
import {
  styleObjectBlackButton,
  styleObjectGetBGasColor,
} from "../../common/StyleSeter";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Logout } from "../../common/Funcation";
// import ImageUpload from "../../components/ImageUpload";
const cookies = new Cookies();

function AdminSetting(this: any, thisData: any) {
  const {companyPayments} = thisData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [, updateState] = React.useState({});
  const DD = useSelector((e: any) => e.domainDetails);
  const HeaderData = useSelector((e: any) => e.Header);
  const [headerOptions, setHeaderOptions] = useState(HeaderData);
  const [changePass, setChangePass] = useState(false);
  const [depositeChip, setDepositeChip] = useState(false);
  const [onlineChip, setOnlineChip] = useState(false);
  const [onlineTypeChip, setOnlineTypeChip] = useState("Deposit");
  const [methods, setMethods] = useState<any>([]);
  const [balanceData, setBalanceData] = useState<any>({});
  const [newAmount, setNewAmount] = useState<string>("");

  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [isValidationWrong, setIsValidationWrong] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    conformPassword: "",
    currentPassword: "",
  });
  const [domainDetails, setDomainDetails] = useState(DD);
  const [methodDetail, setMethodDetail] = useState<any>(null);
  const [depositTab, setDepositTab] = useState("");
  const [depositForm, setDepositForm] = useState({
    userName: HeaderData?.user_name,
    mobileNo: HeaderData?.mobileNumber || 0,
    transactionId: "",
    amount: "0",
    image: "",
    accountNo: methodDetail?.accountNo,
    bankId: methodDetail?._id,
  });
  const [withdrawForm, setWithdrawForm] = useState({
    accountNo: "",
    holderName: "",
    ifscCode: "",
    bankName: "",
    mobileNo: 0,
    amount: "",
    userName: "",
    descrpitions: "",
  });
  const handleDepositForm = (e: any) => {
    setDepositForm({ ...depositForm, [e.target.name]: e.target.value });
  };
  const handleImageUpload = (value: any, name: string) => {
    const file = value.target.files[0];
    setDepositForm({ ...depositForm, [name]: file });
  };
  const TRANSACTION_METHOD: any = {
    bKash: "../../images/extra-icon/bkash.png",
    Rocket: "../../images/extra-icon/rocket.png",
    Nagad: "../../images/extra-icon/nagad.png",
    "Ok Wallet": "../../images/extra-icon/ok-wallet.png",
    SureCash: "../../images/extra-icon/surecash.png",
    Upay: "../../images/extra-icon/upay.png",
    Tap: "../../images/extra-icon/tap.png",
    "USDT TRC20": "../../images/extra-icon/trc20.png",
    BTC: "../../images/extra-icon/btc.png",
    "Local Bank": "../../images/extra-icon/local-bank.png",
    "google pay" : "../../images/extra-icon/payment/google-pay-logo.avif",
    "phone pe" : "../../images/extra-icon/payment/PhonePe_v.png",
    "PAYTM" : "../../images/extra-icon/payment/paytm-logo.jpg",
    "upi" : "../../images/extra-icon/payment/UPI-Logo.png",
  };
  useEffect(() => {
    setHeaderOptions(HeaderData);
    return () => {};
  }, [HeaderData]);

  useEffect(() => {
    setDomainDetails(DD);
    getBalanceData("get");
    return () => {};
  }, [DD]);

  const handelInputChange = (e: any) => {
    const { name, value } = e.target;
    setIsValidationWrong(false);
    setFormData({ ...formData, [name]: value });
  };

  const handleWithdrawForm = (e: any) => {
    setWithdrawForm({ ...withdrawForm, [e.target.name]: e.target.value });
  };

  const Validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: true,
    })
  );
  const BankValidator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
    })
  );
  const handelSubmit = async (e: any) => {
    e.preventDefault();
    if (Validator.current.allValid()) {
      setIsValidationWrong(false);
      // const ipDetails = await getApiLink({
      //   api: "https://ipapi.co/json/?key=wfzfdfQ4cUsaTVURUkj2oF6L51Y4jNE0IM2yE0V2xMyMkxjTsr",
      // });
      // console.log("call ip:  ipDetails :", ipDetails);
      let data = {
        api: ADMIN_API.CHANGE_PASSWORD,
        value: {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          conformPassword: formData.conformPassword,
          // city: ipDetails?.data?.city,
          // state: ipDetails?.data?.region,
          // country: ipDetails?.data?.country_name,
          // ISP: ipDetails?.data?.org,
        },
        token: cookies.get("skyToken"),
      };
      await postApi(data)
        .then(function (response) {
          cookies.set("skyToken", response.data.data.token, {
            domain: process.env.REACT_APP_COOKIE_DOMAIN,
            path: "/",
          });

          notifyMessage("change password successfully");
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
          // navigate('/')
        })
        .catch((err) => {
          notifyError(err.response.data.message);

          if (err.response.data.statusCode === 401) {
            // Logout()
            // navigate('/login')
          }
        });
    } else {
      Validator.current.showMessages();
      forceUpdate();
    }
  };

  const handleInputChange = (e: HTMLInputElement | any) => {
    const { value } = e.target;
    setNewAmount(value);
  };

  const getBalanceData = async (API: string) => {
    console.log("API :: ", API);

    if (API === "get") {
      let data = {
        api: ADMIN_API.BANKING.GET_BALANCE,
        value: {},
      };
      await getApi(data)
        .then(function (response) {
          console.log(response);
          setBalanceData(response.data.data);
          dispatch({
            type: "UPDATE_BALANCE",
            payload: response.data.data.remaining_balance,
          });
        })
        .catch((err) => {
          if (err.response.data.statusCode === 401) {
            Logout();
            navigate("/login");
          }
        });
    } else {
      let data = {
        api: ADMIN_API.BANKING.ADD_BALANCE,
        value: {
          amount: newAmount,
        },
      };
      if (newAmount !== "")
        await postApi(data)
          .then(function (response) {
            console.log(response);
            getBalanceData("get");
            setNewAmount("");
          })
          .catch((err) => {
            if (err.response.data.statusCode === 401) {
              Logout();
              navigate("/login");
            }
          });
    }
  };
  const updateBalanceSubmit = (e: any) => {
    e.preventDefault();
    getBalanceData("update");
  };

  // Wd
  const onWithdrawSubmit = async (e: any) => {
    e.preventDefault();
    setOnlineChip(false);
    // if (secondTabSelected === "bank" && BankValidator.current.allValid()) {
    const data = {
      type: methodDetail?.type,
      accountNo: withdrawForm.accountNo,
      holderName: withdrawForm.holderName,
      userName: withdrawForm.holderName,
      ifscCode: withdrawForm.ifscCode,
      bankName: withdrawForm.bankName,
      mobileNo: withdrawForm.mobileNo,
      amount: withdrawForm.amount,
      descrpitions: withdrawForm.descrpitions,
    };
    const finalData = {
      api: ADMIN_API.ONLINE_PAYMENT.ADD_REQUEST.ADD_WITHDRAWAL,
      value: data,
    };
    await postApi(finalData)
      .then(function (response: any) {
        console.log(response);
        notifyMessage(response.data.message);
        // window.location.reload()
        setWithdrawForm({
          accountNo: "",
          holderName: "",
          ifscCode: "",
          bankName: "",
          mobileNo: 0,
          amount: "",
          userName: "",
          descrpitions: "",
        });
      })
      .catch((err: any) => {
        debugger;
        console.log(err);
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
        }
      });
  };
  // online deposit
  const onDepositSubmit = async (e: any) => {
    e.preventDefault();
    if (Validator.current.allValid()) {
      setOnlineChip(false);
      console.log("methodDetail ::: ", methodDetail);
      console.log("depositForm ::: ", depositForm);

      const data = new FormData();
      data.append("userName", depositForm.userName);
      data.append("mobileNo", depositForm.mobileNo);
      data.append("transactionId", depositForm.transactionId);
      data.append("amount", depositForm.amount);
      data.append("image", depositForm.image);
      data.append("accountNo", methodDetail?.accountNo);
      data.append("bankId", methodDetail?._id);

      const finalData = {
        api: ADMIN_API.ONLINE_PAYMENT.ADD_REQUEST.ADD_DEPOSIT,
        value: data,
      };
      await postApi(finalData)
        .then(function (response: any) {
          console.log(response);
          notifyMessage(response.data.message);
          setDepositForm({
            userName: HeaderData?.user_name,
            mobileNo: HeaderData?.mobileNumber || 0,
            transactionId: "",
            amount: "0",
            image: "",
            accountNo: methodDetail?.accountNo,
            bankId: methodDetail?._id,
          });
          // window.location.reload()
        })
        .catch((err: any) => {
          debugger;
          console.log(err);
          notifyError(err.response.data.message);
          if (err.response.data.statusCode === 401) {
          }
        });
    } else {
      Validator.current.showMessages();
      forceUpdate();
    }
  };
  const getMethods = async (e: any, paymentType: string) => {
    e.preventDefault();
    setOnlineTypeChip(paymentType);

    const finalData = {
      api:
        ADMIN_API.ONLINE_PAYMENT.ADD_REQUEST.GET_METHOD +
        "?paymentType=" +
        paymentType,
      value: {
        paymentType: "Deposit",
      },
    };

    await getApi(finalData)
      .then(function (response: any) {
        console.log(response.data.data, "methods");

        setMethods(response.data.data.data);
      })
      .catch((err: any) => {
        debugger;
        console.log(err);
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
        }
      });
  };
  return (
    <>
      <div className="container main_wrap">
        <div className="admin-setting">
          {(headerOptions.name !== "M" && !companyPayments) && (
            <>
              <div className="admin-setting-inner">
                <h2>General Settings</h2>
                <ul>
                  <li onClick={() => setChangePass(true)}>
                    <a className="but_suspend openchangepwdmodal"></a>
                  </li>
                  {headerOptions?.add_balance !== 0 &&
                    headerOptions.name === "O" && (
                      <li onClick={() => setDepositeChip(true)}>
                        <a className="but_suspend opendepositchipmodal"></a>
                      </li>
                    )}
                  <li onClick={() => navigate("/Asearchusers")}>
                    <a className="but_suspend searchusericon"></a>
                  </li>
                  {headerOptions?.manage_website !== 0 && (
                    <li onClick={() => navigate("/AWebsiteSetting")}>
                      <a className="but_suspend websetting"></a>
                    </li>
                  )}
                  {headerOptions?.manage_website !== 0 && (
                    <li onClick={() => navigate("/ADeafultSetting")}>
                      <a className="but_suspend defaultsettings"></a>
                    </li>
                  )}
                  <li onClick={() => navigate("/gameUsersList")}>
                    <a className="but_suspend cusers"></a>
                  </li>
                  {headerOptions?.p2pSettings !== 0 && (
                    <li onClick={() => navigate("/P2PSetting")}>
                      <a className="but_suspend p2ptransfer"></a>
                    </li>
                  )}
                  {headerOptions?.surveillance !== 0 && (
                    <li onClick={() => navigate("/Asurveillance")}>
                      <a className="but_suspend surveillanceicon"></a>
                    </li>
                  )}
                  {headerOptions?.whiteLablesCasinoLimit !== 0 && (
                    <li onClick={() => navigate("/WhiteLimit")}>
                      <a className="but_suspend limitset"></a>
                    </li>
                  )}
                </ul>
              </div>

              <div className="admin-setting-inner">
                <h2>Match And Bets</h2>
                <ul>
                  {headerOptions?.sports_main_market !== 0 && (
                    <li onClick={() => navigate("/AactiveMatch")}>
                      <a className="but_suspend aactivematch"></a>
                    </li>
                  )}
                  {headerOptions?.sports_main_market !== 0 && (
                    <li onClick={() => navigate("/AinactiveMatch")}>
                      <a className="but_suspend ainactivematch"></a>
                    </li>
                  )}
                  {headerOptions?.bet_list !== 0 && (
                    <li onClick={() => navigate("/AdeletedBets")}>
                      <a className="but_suspend adeletedbet"></a>
                    </li>
                  )}
                  {headerOptions?.manage_fancy !== 0 && (
                    <li onClick={() => navigate("/AupdateFancyStatus")}>
                      <a className="but_suspend aupdatestatus"></a>
                    </li>
                  )}
                  {headerOptions?.fancy_history !== 0 && (
                    <li onClick={() => navigate("/AsuspendedResults")}>
                      <a className="but_suspend asuspendresult"></a>
                    </li>
                  )}
                </ul>
              </div>

              <div className="admin-setting-inner">
                <h2>Message Settings</h2>
                <ul>
                  {headerOptions?.manage_website !== 0 && (
                    <>
                      <li onClick={() => navigate("/AUserMessage")}>
                        <a className="but_suspend ausermessage"></a>
                      </li>
                      <li onClick={() => navigate("/AHyperMessage")}>
                        <a className="but_suspend ahypermessage"></a>
                      </li>
                      <li onClick={() => navigate("/AImpMessage")}>
                        <a className="but_suspend aimpmessage"></a>
                      </li>
                      <li onClick={() => navigate("/AImageAdd")}>
                        <a className="but_suspend imgmsg"></a>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="admin-setting-inner">
                <h2>User Settings</h2>
                <ul>
                  <li>
                    <a className="but_suspend ainactiveuser"></a>
                  </li>
                  <li>
                    <a className="but_suspend abetlockuser"></a>
                  </li>
                  <li onClick={() => navigate("/AdeletedUsers")}>
                    <a className="but_suspend deletedUser"></a>
                  </li>
                </ul>
              </div>
              <div className="admin-setting-inner">
                <h2>Match And Bets</h2>
                <ul>
                  <li>
                    <a className="but_suspend acheatbet"></a>
                  </li>
                </ul>
              </div>
            </>
          )}
          <div className="admin-setting-inner">
            <h2>Common Setting</h2>
            <ul>
              {headerOptions?.sports_main_market !== 0 && !companyPayments && (
                <li onClick={() => navigate("/main-market")}>
                  <a className="but_suspend sportMainMarket"></a>
                </li>
              )}
              {headerOptions?.manage_website !== 0 && !companyPayments && (
                <li onClick={() => navigate("/website")}>
                  <a className="but_suspend webSiteSetting"></a>
                </li>
              )}
              {headerOptions?.manage_website !== 0 && !companyPayments && (
                <li onClick={() => navigate("/manage-api-providers")} style={{ position: "relative" }}>
                   <a className="but_suspend defaultsettings" style={{ opacity: 0.1 }}></a>
                   <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", textAlign: "center", color: "white", fontWeight: "bold", zIndex: 10, fontSize: "16px" }}>API Settings</div>
                </li>
              )}
              {headerOptions?.manage_dashboard_images !== 0 && !companyPayments && (
                <li onClick={() => navigate("/dashboard-images")}>
                  <a className="but_suspend dashboardImage"></a>
                </li>
              )}
              {headerOptions?.banner !== 0 && !companyPayments && (
                <li onClick={() => navigate("/banner")}>
                  <a className="but_suspend bannerImage"></a>
                </li>
              )}

              {headerOptions?.b2c_contact_seting !== 0 && !companyPayments && (
                <li onClick={() => navigate("/DeafultContactSetting")}>
                  <a className="but_suspend defaultsettings"></a>
                </li>
              )}
              {headerOptions?.add_balance !== 0 && process.env.REACT_APP_B2C === 'true' && companyPayments && (
                <li
                  onClick={(e) => {
                    setOnlineChip(true);
                    getMethods(e, "Deposit");
                  }}
                >
                  <a className="but_suspend openonlinedepositchipmodal"></a>
                </li>
              )}
              {headerOptions?.add_balance !== 0 && process.env.REACT_APP_B2C === 'true' && companyPayments && (
                <li
                  onClick={(e) => {
                    setOnlineChip(true);
                    getMethods(e, "Withdrawal");
                  }}
                >
                  <a className="but_suspend openonlinewithdrwalchipmodal"></a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {changePass && (
        <SkyPopup
          title={`Change Password`}
          OpenModal={true}
          closeModel={() => setChangePass(false)}
          customClass="change-password"
          isHideSubmit
        >
          <div className="login_form_main">
            <form className="login_form" onSubmit={(e) => handelSubmit(e)}>
              <InputGroup
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                type="password"
                onChange={handelInputChange}
                placeholder="New Password"
                errorValidation={Validator.current.message(
                  "newPassword",
                  formData.newPassword,
                  "required"
                )}
              />
              <InputGroup
                label="New Password Confirm"
                name="conformPassword"
                value={formData.conformPassword}
                type="password"
                onChange={handelInputChange}
                placeholder="New Password Confirm"
                errorValidation={Validator.current.message(
                  "conformPassword",
                  formData.conformPassword,
                  "required"
                )}
              />
              <InputGroup
                label="Your Password"
                name="currentPassword"
                value={formData.currentPassword}
                type="password"
                onChange={handelInputChange}
                placeholder="Old Password"
                errorValidation={Validator.current.message(
                  "currentPassword",
                  formData.currentPassword,
                  "required"
                )}
              />

              {isValidationWrong ? (
                <span className="error" style={{ color: "red" }}>
                  invalid verification code
                </span>
              ) : (
                ""
              )}

              <div className="account_tabs_filter d_flex justify-end">
                <div className="s_mr-60">
                  <input
                    style={{
                      ...styleObjectBlackButton(DD?.colorSchema, true),
                      fontSize: "12px",
                      width: "125px",
                      padding: "4px 12px",
                    }}
                    type="button"
                    value="Change"
                    name="today"
                    id="today"
                    className="btn btn-default-customize"
                  />
                </div>
              </div>
            </form>
          </div>
        </SkyPopup>
      )}

      {depositeChip && (
        <SkyPopup
          title={`Deposit Chips`}
          OpenModal={true}
          closeModel={() => setDepositeChip(false)}
          btnName="Deposite"
          customClass="deposite-chips"
          submit={updateBalanceSubmit}
        >
          <div className="deposite">
            <h3 className="deposite-title">
              Current Balance :{" "}
              <span id="depoOwnBal">
                {balanceData?.remaining_balance || 0}{" "}
                {domainDetails?.currency ? domainDetails?.currency : "PBU"}
              </span>
            </h3>
            <input
              type="text"
              name="amount"
              placeholder="Add Amount"
              value={newAmount}
              onChange={(e) => handleInputChange(e)}
            />
          </div>
        </SkyPopup>
      )}

      {onlineChip && onlineTypeChip === "Deposit" && (
        <SkyPopup
          title={`Deposit Chips`}
          OpenModal={true}
          closeModel={() => {
            setOnlineChip(false);
            setMethodDetail(null);
            setDepositTab("");
          }}
          btnName="Deposite"
          customClass="deposite-chips"
          submit={onDepositSubmit}
          closebtn={true}
        >
          <div className="deposite">
            <h3 className="deposite-title">
              Current Balance :{" "}
              <span id="depoOwnBal">
                {balanceData?.remaining_balance || 0}{" "}
                {domainDetails?.currency ? domainDetails?.currency : "PBU"}
              </span>
            </h3>
            <div className="pm-box">
              <div className="box-title">
                <span>Payment Method</span>
              </div>
              <div className="pm-grid">
                {methods?.map((item: any) => {
                  return (
                    <>
                      <div
                        className={
                          depositTab === item.type ? "pm pm-brc" : "pm"
                        }
                        onClick={() => {
                          setDepositTab(item.type);
                          setMethodDetail(item);
                        }}
                      >
                        <img
                          className="bank-icon"
                          src={TRANSACTION_METHOD[item.type]}
                          alt={item.type}
                        />
                        <br></br>
                        <span className="bank-name">{item.type}</span>
                        {depositTab === item.type && (
                          <img
                            className="bottom-tick"
                            src="../../images/extra-icon/bottom-tick.png"
                            alt=""
                          ></img>
                        )}
                      </div>
                    </>
                  );
                })}
              </div>
              {methodDetail && (
                <div className="pm-box">
                  <div className="box-title">
                    <span>Deposit Detail</span>
                  </div>
                  <div className="pm-grid-btn">
                    <div style={{ color: "white" }}>
                      Agent Cashout Number: {methodDetail?.accountNo}
                    </div>
                    <br />
                    <div style={{ color: "white" }}>
                      Account Type: {methodDetail?.holderName}
                    </div>
                  </div>
                  <div className="topTabs">
                    <div className="first_tab_content">
                      <div className="tab_view">
                        <form action="" className="tab_form">
                          {/* <InputGroup type='text' placeholder='User/Login ID' name='userName' value={depositForm.userName} onChange={(e: any) => handleDepositForm(e)} errorValidation={Validator.current.message('userName', depositForm.userName, 'required')} /> */}
                          <InputGroup
                            type="number"
                            label="Your Deposit Number"
                            placeholder="Mobile"
                            name="mobileNo"
                            value={depositForm.mobileNo}
                            onChange={(e: any) => handleDepositForm(e)}
                            errorValidation={Validator.current.message(
                              "mobileNo",
                              depositForm.mobileNo,
                              "required|phone"
                            )}
                            // colorSchema={DD?.colorSchema}
                          />
                          <InputGroup
                            type="text"
                            placeholder="Transaction Id"
                            label="Transaction Id No"
                            name="transactionId"
                            value={depositForm.transactionId}
                            onChange={(e: any) => handleDepositForm(e)}
                            errorValidation={Validator.current.message(
                              "transactionId",
                              depositForm.transactionId,
                              "required"
                            )}
                            // colorSchema={DD?.colorSchema}
                          />
                          <InputGroup
                            type="number"
                            label="Amount"
                            placeholder="Amount"
                            name="amount"
                            value={depositForm.amount}
                            onChange={(e: any) => handleDepositForm(e)}
                            errorValidation={Validator.current.message(
                              "amount",
                              depositForm.amount,
                              "required|numeric"
                            )}
                            // colorSchema={DD?.colorSchema}
                          />

                          <ImageUpload
                            label="Your Payments Screenshort Upload"
                            filename={depositForm.image}
                            name="image"
                            setFileName={handleImageUpload}
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SkyPopup>
      )}
      {onlineChip && onlineTypeChip === "Withdrawal" && (
        <SkyPopup
          title={`Withdrawal Chips`}
          OpenModal={true}
          closeModel={() => {
            setOnlineChip(false);
            setMethodDetail(null);
            setDepositTab("");
          }}
          btnName="Withdrawal"
          customClass="deposite-chips"
          submit={onWithdrawSubmit}
          closebtn={true}
        >
          <div className="deposite">
            <h3 className="deposite-title">
              Current Balance :{" "}
              <span id="depoOwnBal">
                {balanceData?.remaining_balance || 0}{" "}
                {domainDetails?.currency ? domainDetails?.currency : "PBU"}
              </span>
            </h3>
            <div className="pm-box">
              <div className="box-title">
                <span>Payment Method</span>
              </div>
              <div className="pm-grid">
                {methods?.map((item: any) => {
                  return (
                    <>
                      <div
                        className={
                          depositTab === item.type ? "pm pm-brc" : "pm"
                        }
                        onClick={() => {
                          setDepositTab(item.type);
                          setMethodDetail(item);
                        }}
                      >
                        <img
                          className="bank-icon"
                          src={TRANSACTION_METHOD[item.type]}
                          alt={item.type}
                        />
                        <br></br>
                        <span className="bank-name">{item.type}</span>
                        {depositTab === item.type && (
                          <img
                            className="bottom-tick"
                            src="../../images/extra-icon/bottom-tick.png"
                            alt=""
                          ></img>
                        )}
                        {/* <div className="ribbon">
                  <img src="../../images/extra-icon/ribbon.png" />
                  <span>+15%</span>
                </div> */}
                      </div>
                    </>
                  );
                })}
              </div>
              {methodDetail && (
                <div className="pm-box">
                  <div className="box-title">
                    <span>Withdraw Detail</span>
                  </div>
                  <div className="topTabs">
                    <div className="first_tab_content">
                      <div className="tab_view">
                        <form action="" className="tab_form">
                          <div className="side_by_side">
                            <InputGroup
                              type="number"
                              placeholder="Please Enter Bank Account No*"
                              label="Personal Account Number :"
                              name="accountNo"
                              value={withdrawForm.accountNo}
                              onChange={(e: any) => handleWithdrawForm(e)}
                              errorValidation={BankValidator.current.message(
                                "accountNo",
                                withdrawForm.accountNo,
                                "required"
                              )}
                              // colorSchema={DD?.colorSchema}
                            />
                            <InputGroup
                              type="text"
                              placeholder="Please Enter Account Name *"
                              label="Account Name."
                              name="holderName"
                              value={withdrawForm.holderName}
                              onChange={(e: any) => handleWithdrawForm(e)}
                              errorValidation=""
                              // colorSchema={DD?.colorSchema}
                            />

                            <InputGroup
                              type="number"
                              placeholder="Please Enter Withdrawal Amount *"
                              label="Amount"
                              // amount={balance}
                              name="amount"
                              value={withdrawForm.amount}
                              onChange={(e: any) => handleWithdrawForm(e)}
                              errorValidation={BankValidator.current.message(
                                "amount",
                                withdrawForm.amount,
                                "required|numeric"
                              )}
                              // colorSchema={DD?.colorSchema}
                            />
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SkyPopup>
      )}
    </>
  );
}
export default AdminSetting;

export const InputGroup = (props: any) => {
  const { type, placeholder, name, value, onChange, errorValidation } = props;
  return (
    <div
      className="input_group"
      style={{ display: "flex", alignItems: "center" }}
    >
      <p style={{ width: "145px", flexShrink: 0, paddingRight: "5px" }}>
        {props?.label}
      </p>
      <>
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
      </>
    </div>
  );
};

const ImageUpload = (props: any) => {
  const { label, filename, setFileName, name, topClass } = props;

  const [file, setFile] = useState<any>({ name: "" });
  const handleShowPrivew = (e: any) => {
    setFile(URL.createObjectURL(e.target.files[0]));
  };
  return (
    // <div className='document_view'>
    //     Upload Payment Screenshot
    //     <input type="file" name="file" id="file" className="inputfile" />
    // </div>
    <div className={topClass ? topClass : `mb-3 `}>
      <div>
        <label className="form-label">
          {label ? (label === "NO_LABEL" ? "" : "Image") : "Image"}
        </label>
        <div className="input-group custom-file-button">
          <label className="input-group-text" htmlFor={name}>
            Choose File
          </label>
          <input
            name={name}
            className="form-control form-control-lg"
            onChange={(e) => {
              setFileName(e, name);
              handleShowPrivew(e);
            }}
            id={name}
            type="file"
          />
        </div>
        {filename && (
          <a href={"#"} target="_blank">
            <img
              className="mt-3"
              style={{ maxWidth: "300px" }}
              src={file}
              alt="Image"
            />
          </a>
        )}
      </div>
    </div>
  );
};
