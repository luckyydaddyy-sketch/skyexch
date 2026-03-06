import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_API } from "../../../common/common";
import { Logout } from "../../../common/Funcation";
import { styleObjectBlackButton } from "../../../common/StyleSeter";
import ImageUpload from "../../../components/ImageUpload";
import { postApi, notifyError, notifyMessage, getApi } from "../../../service";

const AddEdit = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<any>({
    type: "bKash",
    name: "",
    accountNo: "",
    ifscCode: "",
    holderName: "",
    paymentType: "Deposit",
  });
  const { id } = useParams();
  const MODE =
    window.location.pathname.includes("edit-bankingMethod") && id
      ? "EDIT"
      : "ADD";

  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const TRANSACTION_METHOD: any = {
    bKash: "bKash",
    Rocket: "Rocket",
    Nagad: "Nagad",
    Ok_Wallet: "Ok Wallet",
    SureCash: "SureCash",
    Upay: "Upay",
    Tap: "Tap",
    USDT_TRC20: "USDT TRC20",
    BTC: "BTC",
    Local_Bank: "Local Bank",
    GPay: "google pay",
    PhonePe: "phone pe",
    PAYTM: "PAYTM",
    UPI: "upi",
  };

  useEffect(() => {
    if (id && MODE === "EDIT") {
      getEditData();
      setFormData({
        ...formData,
      });
    } else if (MODE === "EDIT" && !id) {
      navigate("/bankingMethod");
    }
    return () => {};
  }, [id]);

  const getEditData = async () => {
    let data: any = {
      api: ADMIN_API.BANKING.METHODS.GET_ONE + "?id=" + id,
      // value: {
      //     id: id
      // }
    };
    await getApi(data)
      .then(function (response) {
        console.log(response);
        setFormData({
          ...formData,
          type: response.data.data.type,
          name: response.data.data.name,
          accountNo: response.data.data.accountNo,
          ifscCode: response.data.data.ifscCode,
          holderName: response.data.data.holderName,
          //   title: response.data.data.title,
          //   link: response.data.data.link,
          //   image: response.data.data.image,
          //   Width: response.data.data.Width,
          //   gameCode: response.data.data.gameCode,
          //   gameName: response.data.data.gameName,
          //   gameType: response.data.data.gameType,
          //   platform: response.data.data.platform,
          //   gameLimit: response.data.data.gameLimit
        });
        // setPageData(response.data.data)
        // notifyMessage(response.data.message)
        // navigate('/bankingMethod')
      })
      .catch((err) => {
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const getPageData = async () => {
    let data: any = {
      api:
        id && MODE === "EDIT"
          ? ADMIN_API.BANKING.METHODS.UPDATE
          : ADMIN_API.BANKING.METHODS.ADD,
      value: formData,
    };
    if (id && MODE === "EDIT") {
      data.value.id = id;
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        // setPageData(response.data.data)
        notifyMessage(response.data.message);
        navigate("/bankingMethod");
      })
      .catch((err) => {
        notifyError(err.response.data.message);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  const handleSubmitClick = (e: any) => {
    e.preventDefault();
    console.log(formData);

    getPageData();
  };

  const handleCancelClick = (e: any) => {
    e.preventDefault();
    navigate("/bankingMethod");
  };

  return (
    <div className="container banking website edit">
      <div className="top_header">
        <div className="top_header_title align-items-center mt-3">
          <h5 className="font-weight-bold">Update Dashboard Image</h5>
        </div>
      </div>

      <div className="edit_body">
        <div className="card 5 ">
          <div className="row ">
            <div className="col-6 p_15">
              <div className="mb-3 p_0 col-12">
                <label htmlFor="type" className="mb_5 d_block">
                  Type:
                </label>
                <select
                  className="form-control"
                  onChange={(e) => handleInputChange(e)}
                  id="type"
                  name="type"
                  value={formData.type}
                >
                  {Object.keys(TRANSACTION_METHOD).map((key: any) => {
                    return (
                      <>
                        <option value={TRANSACTION_METHOD[key]}>
                          {TRANSACTION_METHOD[key]}
                        </option>
                      </>
                    );
                  })}
                  {/* <option value="bank">Bank</option>
                  <option value="upi">UPI</option>
                  <option value="google pay">Google Pay</option>
                  <option value="phone pay">Phone Pay</option> */}
                </select>
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="paymentType" className="mb_5 d_block">
                  Payments Gateway Type:
                </label>
                <select
                  className="form-control"
                  onChange={(e) => handleInputChange(e)}
                  id="paymentType"
                  name="paymentType"
                  value={formData.paymentType}
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                </select>
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="name" className="mb_5 d_block">
                  Name:
                </label>
                <input
                  className="form-control"
                  onChange={(e) => handleInputChange(e)}
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                />
              </div>

              <div className="mb-3 p_0 col-12">
                <label htmlFor="accountNo" className="mb_5 d_block">
                  Account No:
                </label>
                <input
                  className="form-control"
                  onChange={(e) => handleInputChange(e)}
                  id="accountNo"
                  name="accountNo"
                  type="text"
                  value={formData.accountNo}
                />
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="ifscCode" className="mb_5 d_block">
                  IFSC Code:
                </label>
                <input
                  className="form-control"
                  onChange={(e) => handleInputChange(e)}
                  id="ifscCode"
                  name="ifscCode"
                  type="text"
                  value={formData.ifscCode}
                />
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="holderName" className="mb_5 d_block">
                  Holder Name:
                </label>
                <input
                  className="form-control"
                  onChange={(e) => handleInputChange(e)}
                  id="holderName"
                  name="holderName"
                  type="text"
                  value={formData.holderName}
                />
              </div>
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
    </div>
  );
};

export default AddEdit;
