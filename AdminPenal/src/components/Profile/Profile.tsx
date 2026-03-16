import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import { notifyMessage, postApi } from "../../service";
import { styleObjectBlackButton } from "../../common/StyleSeter";

const cookies = new Cookies();
const Profile = (props: any) => {
  const authToken = cookies.get("skyToken");
  const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
  const [didLoad, setDidLoad] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let { ShowPopUp, userId, TYPE, ShowPopUpDomain } = props;

  let { userId: tempUserID, TYPE: tempType } = useParams();
  useEffect(() => {
    if (tempUserID && tempUserID !== "") {
      userId = tempUserID;
      TYPE = tempType;
    }

    return () => { };
  }, []);
  const [pageData, setPageData] = useState<any>({});
  // useEffect(() => {
  //     getPageData()
  //     return () => {
  //     }
  // }, [])

  const DD = useSelector((e: any) => e.domainDetails);
  const [domainDetails, setDomainDetails] = useState(DD);
  useEffect(() => {
    setDomainDetails(DD);
    return () => { };
  }, [DD]);
  useEffect(() => {
    //'/admin/downLineList'
    if (!didLoad) {
      if (authToken) {
        getPageData(authToken);
      }
      setDidLoad(true);
    }
    return () => { };
  }, [didLoad, isAuthenticated]);
  const getPageData = async (token: any = undefined) => {
    let data: any = {
      api:
        userId && TYPE === "player"
          ? ADMIN_API.PLAYER_GET_PROFILE
          : ADMIN_API.MY_ACCOUNT.GET_PROFILE,
      value: {},
      token: token ? token : undefined,
    };
    if (userId) {
      data.value = {
        id: userId,
      };
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
        dispatch({ type: "USER_DATA", payload: response.data.data });
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          dispatch({
            type: "AUTHENTICATION",
            payload: { isLogin: false, token: "" },
          });
          Logout();
          navigate("/login");
        }
      });
  };

  const copyToClipboard = () => {
    const copyText = pageData?.domain?.length > 0 ? `https://${pageData?.domain[0]?.domain}/signup/${pageData?.user_name}` : `${process.env.REACT_APP_BASE_POINT}signup/${pageData?.user_name}`
    navigator.clipboard
      .writeText(copyText)
      .then(() => { })
      .catch((err) => {
        // setCopySuccess('Failed to copy!');
        console.error("Error copying text: ", err);
      });

    notifyMessage("reffer code copy succesfully");
  };
  console.log("pageData :: ", pageData);
  return (
    <>
      <div className="account_tabs_r">
        <h2 className="mb-15 d_flex account_tabs_filter">
          <strong>Profile</strong>
          {/* process.env.REACT_APP_B2C === "true" && */}
          {
            pageData?.agent_level &&
            pageData?.agent_level === "M" &&
            (
              <input
                type="button"
                style={{
                  ...styleObjectBlackButton(DD?.colorSchema, true),
                  width: "100px",
                  marginLeft: "10px",
                }}
                value="copy Refer Link"
                name="today"
                id="today"
                className="btn btn-default-customize"
                onClick={() => copyToClipboard()}
              />
            )}
        </h2>
        {/* <div className='mb-15'>
                </div> */}
        <div className="table-responsive">
          <table className="table01 margin-table">
            <tbody>
              <tr>
                <th className="light-grey-bg">Wallet</th>
                <th className="light-grey-bg">Funds available to withdraw</th>
                {/* {TYPE === 'player' && <>  */}
                <th className="light-grey-bg">available to Bet</th>
                <th className="light-grey-bg">Current exposure</th>
                {/* </>} */}
              </tr>
              <tr>
                <td className="text-success"> Main wallet</td>
                <td className="text-success"> {pageData.balance} </td>
                {/* {TYPE === 'player' && <> */}
                <td className="text-success"> {pageData.remaining_balance} </td>
                <td className="text-success"> {pageData.exposure} </td>
                {/* </>} */}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="d_flex account_tabs_r_d">
          <div className="account_tabs_r_d_l">
            <div className="account_tabs_r_d_l_item_wrp d_flex">
              <div className="account_tabs_r_d_l_item">
                <h5 className="account_tabs_r_d_l_item-header bg-card-header text-white">
                  About You
                </h5>
                <div>
                  <table className="w-100 table">
                    <tbody>
                      <tr>
                        <td width="50%">First Name</td>
                        <td>{pageData.firstName}</td>
                      </tr>
                      <tr>
                        <td width="50%">Last Name</td>
                        <td>{pageData.lastName}</td>
                      </tr>
                      <tr>
                        <td width="50%">Birthday</td>
                        <td>--</td>
                      </tr>
                      <tr>
                        <td width="50%">E-mail</td>
                        <td>abc@xyz.com</td>
                      </tr>
                      {/* <tr>
                                                <td width="50%">Username</td>
                                                <td>{pageData.user_name}</td>
                                            </tr> */}
                      <tr>
                        <td width="50%">Password</td>
                        <td>
                          ******
                          <a onClick={(e) => ShowPopUp(pageData)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%">Domain</td>
                        <td>
                          {pageData?.domain && pageData?.domain.length > 0
                            ? pageData?.domain[0].domain
                            : "No Domain"}
                          <a onClick={(e) => ShowPopUpDomain(pageData)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%">Timezone</td>
                        <td>IST</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {/* <div className='account_tabs_r_d_l_item'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Address</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody>
                                            <tr>
                                                <td width="50%">Address</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Town/City</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Country</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Country/State</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Postcode</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Timezone</td>
                                                <td>IST</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div> */}

              <div className="account_tabs_r_d_l_item">
                <h5 className="account_tabs_r_d_l_item-header bg-card-header text-white">
                  Contact Details
                </h5>
                <div>
                  <table className="w-100 table">
                    <tbody>
                      <tr>
                        <td width="50%">Primary number</td>
                        <td>{pageData.mobileNumber}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* <div className='account_tabs_r_d_l right'>
                        <div className='d_flex account_tabs_r_d_l_item_wrp'>
                            <div className='account_tabs_r_d_l_item'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Contact Details</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody><tr>
                                            <td width="50%">Primary number</td>
                                            <td>{pageData.mobileNumber}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='account_tabs_r_d_l_item'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Address</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody>
                                            <tr>
                                                <td width="50%">Currency</td>
                                                <td>{domainDetails?.currency ? domainDetails?.currency : 'PTH'} </td>
                                            </tr>
                                            <tr>
                                                <td width="50%">Odds Format	</td>
                                                <td>-</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='account_tabs_r_d_l_item'>
                                <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Commission</h5>
                                <div>
                                    <table className="w-100 table">
                                        <tbody>
                                            <tr>
                                                <td width="50%">Commission</td>
                                                <td>0%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div> */}
        </div>
      </div>
    </>
  );
};

export default Profile;
