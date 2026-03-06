import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import SearchInput from "../../components/SearchInput"
import { ADMIN_API } from "../../common/common";
import { getApi, notifyError, notifyMessage, postApi } from "../../service";
import { useEffect, useState } from "react";
import { Logout } from "../../common/Funcation";
import { useNavigate } from "react-router-dom";


function AManageLinks() {
  const navigate = useNavigate()
  const DD = useSelector((e: any) => e.domainDetails);
  const [siteDropDownData, setSiteDropDownData] = useState<any>({})
  const [siteData, setSiteData] = useState<any>({})
  const [siteDataTemp, setSiteDataTemp] = useState<any>({})
  const [webSiteId, setWebSiteIdData] = useState<string>("")
  useEffect(() => {
    getSiteDropDownData()
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

  // const array = [
  //     {telegram : "Set Telegram",},
  //     {telegram : "Set Whatsapp",},
  //     {telegram : "Set Email",},
  //     {telegram : "Set Skype",},
  //     {telegram : "Set Instagram",},
  //     {telegram : "Set Facebook",},
  //     {telegram : "Set Signup",},
  //     {telegram : "Set App Link",},
  //     {telegram : "Set SABA Link",},
  //     {telegram : "Set Validation Code"}
  // ]
  const array = [
    "Set Telegram",
    "Set Whatsapp",
    "Set Email",
    "Set Skype",
    "Set Instagram",
    "Set Facebook",
    "Set Signup",
    "Set App Link",
    "Set SABA Link",
    "Set Validation Code"
  ]

  const getSiteDropDownData = async () => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.GET_DOMAIN,
      // value: {
      //   type: TYPE,
      //   page: PAGE ? PAGE : '1',
      //   limit: '10'
      // },
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

  const getIdForWebSite = (e: any) => {
    const { value } = e.target
    console.log("value ::: ", value);
    setWebSiteIdData(value)
  }

  const getName = (i: any) =>
    i === 0 ? "telegram" :
      i === 1 ? "whatsapp" :
        i === 2 ? "email" :
          i === 3 ? "skype" :
            i === 4 ? "instagram" :
              i === 5 ? "facebook" :
                i === 6 ? "signup" :
                  i === 7 ? "appLink" :
                    i === 8 ? "SABALink" :
                      i === 9 ? "validationLink" : "name"

  const changeFiledValue = (e: any) => {
    const { name, value } = e.target;
    if (siteData) {
      console.log(" temp :: ", siteDataTemp);

      if (["telegram", "whatsapp", "email", "instagram", "skype"].includes(name)) {
        siteData[name][0] = value
        if (siteDataTemp[name])
          siteDataTemp[name][0] = value
        else {
          siteDataTemp[name] = []
          siteDataTemp[name].push(value)
        }


      } else {
        siteData[name] = value
        siteDataTemp[name] = value
      }
      setSiteData(siteData)
      setSiteDataTemp(siteDataTemp)
    }
  }

  const updateSiteLink = async (e: any) => {

    siteDataTemp.id = webSiteId
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.UPDATE_LINKS,
      value: {
        ...siteDataTemp
      },
    }

    await postApi(data).then(function (response) {
      console.log("update link :: ", response);
      notifyMessage(response.data.message)
    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }

  return (
    <div className="container main_wrap">
      <div className="admin-setting">
        <div className="admin-setting-inner">
          <div className='top_header'>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div><label>Select Website:</label>
                <select style={{ height: "32px", margin: "0 10px", width: "120px" }} name="cars" id="cars" onChange={(e) => getIdForWebSite(e)}>
                  <option value="">Select Website</option>
                  {siteDropDownData && siteDropDownData?.length && siteDropDownData.map((item: any) => {
                    return (
                      <option value={item?._id}>{item?.title}</option>
                      // <option value="mercedes">Mercedes</option>
                      // <option value="audi">Audi</option>
                    )
                  })}
                </select></div>
              <div className="search-btn">
                <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "100px" }} onClick={() => navigate("/AAddWebsiteSetting")}>Add Website</button>
              </div>
            </div>
          </div>
        </div>
        {array?.map((_, i: number) => {
          return (<>
            <div className="admin-setting-inner">
              <h4 className="mb-10">{_}</h4>

              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", width: "25%" }}>
                  <label style={{ marginRight: "5px" }}>Number/Links</label>
                  <input style={{ padding: "3px 5px" }} type="text" name={getName(i)} placeholder="Enter Number or Link" value={
                    i === 0 ? siteData?.telegram && siteData?.telegram?.length && siteData?.telegram[0] :
                      i === 1 ? siteData?.whatsapp && siteData?.whatsapp?.length && siteData?.whatsapp[0] :
                        i === 2 ? siteData?.email && siteData?.email?.length && siteData?.email[0] :
                          i === 3 ? siteData?.skype && siteData?.skype?.length && siteData?.skype[0] :
                            i === 4 ? siteData?.instagram && siteData?.instagram?.length && siteData?.instagram[0] :
                              i === 5 ? siteData?.facebook :
                                i === 6 ? siteData?.signup :
                                  i === 7 ? siteData?.appLink :
                                    i === 8 ? siteData?.SABALink :
                                      i === 9 ? siteData?.validationLink : ""
                  } onChange={(e) => changeFiledValue(e)} />
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", width: "15%" }}>
                  <div className="form-check flex-align">
                    <input className="form-check-input" name="hi" type="checkbox" id="hi" />
                    <label className="form-check-label" style={{ marginLeft: "5px" }} htmlFor="rolling_delay">ON (IS SHOWING)</label>
                  </div>
                </div>
                <div className="search-btn mb-10">
                  <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "100px", height: "25px" }} onClick={(e) => updateSiteLink(e)}>Update</button>
                </div>
              </div>
            </div>
          </>
          )
        })}
      </div>
    </div>
  )
}

export default AManageLinks