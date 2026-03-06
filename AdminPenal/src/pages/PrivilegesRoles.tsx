import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker"
import { styleObjectBlackButton } from "../common/StyleSeter"
import NewPagination from "../components/new-pagination";
import { styleObjectGetBG } from '../common/StyleSeter'
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../common/common";
import { getApi, notifyError, notifyMessage, postApi } from "../service";
import { Logout } from "../common/Funcation";

function PrivilegesRoles() {
  const navigate = useNavigate()
  const DD = useSelector((e: any) => e.domainDetails);
  const [rolesDetail, setRolesDetail] = useState<any>({});
  const [roleId, setRoleId] = useState<string>("");
  const [roleData, setRoleData] = useState<any>({});

  const USER_LEVEL: any = {
    "O": "Owner",
    "SUO": "SUB - OWNER",
    "WL": "WHITELEBEL",
    "SA": "Super Admin",
    "A": "Admin",
    "SUA": "Sub Admin",
    "SS": "Senior Super",
    "S": "Super",
    "M": "Master",
    "CL": "User",
  };

  useEffect(() => {
    getRoleData()
    return () => {
    }
  }, [])
  useEffect(() => {
    if (roleId !== "") {
      const role = rolesDetail?.roles?.find((item: any) => item?._id === roleId);
      setRoleData(role);
    } else {
      setRoleData({})
    }
    return () => {
    }
  }, [roleId, rolesDetail])

  const getRoleData = async () => {
    let data = {
      api: ADMIN_API.PRIVILEGES.GET,
    }

    await getApi(data).then(function (response) {
      console.log("setRolesDetail :: ", response);
      setRolesDetail(response.data.data)
    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }

  const updateSiteData = async (e: any) => {
    let data = {
      api: ADMIN_API.PRIVILEGES.UPDATE,
      value: {
        id: roleId,
        update: roleData
      }
    };
    // e.preventDefault()
    await postApi(data)
      .then(function (response) {
        notifyMessage(response.data.message)
        getRoleData();
      })
      .catch((err) => {
        notifyError(err.response.data.message)
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const getIdForRoles = (e: any) => {
    const { value } = e.target
    console.log("value ::: ", value);
    setRoleId(value)
  }

  const updateRoleValue = (e: any) => {
    const { name, value, checked } = e.target;
    setRoleData({ ...roleData, [name]: roleData[name] === 0 ? 1 : 0 })

    console.log("roleData :: ", roleData);

  }

  return (
    <>
      <div className="container main_wrap">
        <div className="top_header">
          <div className="top_header_title  mt-3">
            <h5>Privileges</h5>
          </div>
        </div>

        <section className="my-account-section">
          <div className='top_header'>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div><label>Select Role:</label>
                <select style={{ height: "32px", margin: "0 10px", width: "120px" }} name="cars" id="cars"
                  onChange={(e) => getIdForRoles(e)}
                >
                  <option value="">Select Role</option>
                  {rolesDetail && rolesDetail?.roles?.length && rolesDetail?.roles?.map((item: any) => {
                    return (
                      <option value={item?._id}>{USER_LEVEL[`${item.name}`]} - {item.name}</option>

                    )
                  })}
                </select></div>
              {
                roleId &&
                <div className="search-btn">
                  <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "100px" }} onClick={(e) => updateSiteData(e)}>UpDate Role</button>
                </div>
              }
            </div>
          </div>

          {
            roleId && roleData && Object.keys(roleData).map((key: string) => {
              return (
                key === 'name' || key === '_id' ? <></> :
                  <>
                    <div className="admin-setting-inner">
                      <h4 className="mb-10">{key}</h4>

                      <div style={{ display: "flex", alignItems: "right", marginBottom: "10px", width: "15%" }}>
                        {/* <div className="form-check form-switch large-switch">
                                        <input className="form-check-input" type="checkbox" id="g" onChange={() => updateRoleValue(key)} checked={roleData[key] === 0 ? false : true} name={key} />
                                    </div> */}
                        <div className="form-check flex-align w-20">
                          <input
                            // value={roleData[key]}
                            // value = {0}
                            checked={roleData[key]}
                            name={key}
                            type="checkbox"
                            onChange={(e) => updateRoleValue(e)}
                          // onChange={(e) => changefiled(e)}
                          />
                          {/* <label className="form-check-label" style={{ marginLeft: "5px" }} htmlFor="rolling_delay">ON (IS SHOWING)</label> */}
                        </div>
                      </div>
                    </div>
                  </>
              )
            })
          }

        </section>
      </div>
    </>
  )
}

export default PrivilegesRoles