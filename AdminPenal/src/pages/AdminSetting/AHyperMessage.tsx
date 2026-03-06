import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import ReactDatePicker from "react-datepicker";
import { useEffect, useState } from "react";
import SearchInput from "../../components/SearchInput";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { getApi, postApi } from "../../service";
import { Logout } from "../../common/Funcation";

function AHyperMessage() {
  const navigate = useNavigate()
  const DD = useSelector((e: any) => e.domainDetails);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [siteDataTemp, setSiteDataTemp] = useState<any>({})
  const [siteDropDownData, setSiteDropDownData] = useState<any>({})
  const [webSiteId, setWebSiteIdData] = useState<string>("")
  const [siteData, setSiteData] = useState<any>({})
  const [siteListData, setSiteListData] = useState<any>({})

  useEffect(() => {
    getSiteDropDownData()
    getSiteListData()
    return () => {
    }
  }, [])

  useEffect(() => {
    if (webSiteId !== "")
      getSiteData(webSiteId)

    setSiteDataTemp({})
    return () => {
    }
  }, [webSiteId])

  const getSiteDropDownData = async () => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.GET_DOMAIN,
    }

    await getApi(data).then(function (response) {
      console.log("getSiteDropDownDataData :: ", response);
      setSiteDropDownData(response.data.data)

    }).catch(err => {
      debugger
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }

  const getSiteData = async (id: string) => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.GET_SITE_BY_ID,
      value: {
        id
      },
    }

    await postApi(data).then(function (response) {
      console.log("getSiteData :: ", response);
      setSiteData(response.data.data)
      setSiteDataTemp({})
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }
  const getSiteListData = async () => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.LIST,
    }

    await getApi(data).then(function (response) {
      console.log("getSiteListData :: ", response);
      setSiteListData(response.data.data)

    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }

  const getIdForWebSite = (e: any) => {
    const { value } = e.target
    console.log("value ::: ", value);
    setWebSiteIdData(value)
  }

  const selectEditSite = (item: any) => {
    setSiteData(item)
  }

  const updateSiteData = async () => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.UPDATE_LINKS,
      value: {
        id: siteData?._id,
        titleMaintenanceMessage: siteData?.titleMaintenanceMessage,
        maintenanceMessage: siteData?.maintenanceMessage,
        maintenanceDate: startDate,
      },
    }

    await postApi(data).then(function (response) {
      console.log("updateSiteData :: ", response);
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }

  const changeMessage = (e: any) => {
    const { name, value } = e.target

    if (name === 'title') {
      siteData.titleMaintenanceMessage = value
    }
    if (name === 'message') {
      siteData.maintenanceMessage = value
    }

    setSiteData(siteData)
  }
  return (
    <>
      <div className="container main_wrap">
        <div className='my-account-section-content'>
          <div className='my-account-section_header'>
            <h4 className="s_mb-8"> Set Message For Mgmt</h4>
            <div className="account_tabs_filter" style={{ marginLeft: "0px" }}>
              <h4> Select Website  </h4>
              <div className="flex-align">
                <div className="input_group s_mr-20 flex-align" style={{ width: "140px" }}>
                  <select name="report_type" id="report_type" className="form-control" onChange={(e) => getIdForWebSite(e)}>
                    <option value=""> Select Sport</option>
                    {siteDropDownData && siteDropDownData?.length && siteDropDownData.map((item: any) => {
                      return (
                        <option value={item?._id}>{item?.title}</option>
                      )
                    })}
                  </select>
                </div>
                <span className="must">＊</span>
              </div>

              <div className="flex-align s_my-10">
                <div className="mb-2">
                  <span>
                    <input type="text" placeholder="Title" name="text" maxLength={16} className="form-control" onChange={(e) => changeMessage(e)} value={siteData?.titleMaintenanceMessage} />
                  </span>
                </div>
                <div className="input_group from-to s_ml-10">
                  <div className="no-wrap flex-align">
                    <div className='w_80'>
                      <ReactDatePicker selected={siteData?.maintenanceDate ? new Date(siteData?.maintenanceDate) : startDate} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ width: "30%" }}>
                <textarea style={{ width: "100%", minHeight: "100px" }} name="message" value={siteData?.maintenanceMessage} onChange={(e) => changeMessage(e)} />
              </div>
              <div className="search-btn">
                <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "95px", marginLeft: "0" }} onClick={updateSiteData}>Save Message</button>
              </div>
            </div>
          </div>
          <div className="flex-align s_mt-10">
            <p>Message List:</p>
            <div className="input_group s_ml-10 flex-align">
              <select name="report_type" id="report_type" className="form-control" style={{ padding: "6px 12px", height: "30px" }}>
                <option value=""> Select Action</option>
                <option value="deposit"> Local Message</option>
                <option value="deposit"> Open Message</option>
                <option value="deposit"> Delete Message</option>
              </select>
            </div>
            <div className="search-btn">
              <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true) }}>Action</button>
            </div>
          </div>
          <div className='my-account-section-content-table'>
            <table id="resultTable" className="table01 margin-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Website</th>
                  <th>Msg_ID</th>
                  <th>Msg_Title</th>
                  <th>Msg_Date</th>
                  <th>IsLock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  siteListData && siteListData?.length && siteListData?.map((item: any, i: number) => {
                    return (
                      <tr>
                        <td>
                          <div className="flex-align">
                            <p>{i + 1}</p>
                            <div className="form-check flex-align s_pl-5">
                              <input className="form-check-input" name="rolling_delay" type="checkbox" id="rolling_delay" />
                            </div>
                          </div>
                        </td>
                        <td>{item?.domain}</td>
                        <td>{item?._id}</td>
                        <td>{item?.titleMaintenanceMessage}</td>
                        <td>{item?.maintenanceDate}</td>
                        <td>{item?.status}</td>
                        <td>
                          <div className="search-btn">
                            <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true) }} onClick={() => selectEditSite(item)}>Edit</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                }

              </tbody>
            </table>
          </div>
        </div>
      </div >
    </>
  )
}

export default AHyperMessage