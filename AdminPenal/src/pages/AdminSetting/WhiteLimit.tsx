import { useEffect, useState } from "react"
import SearchInput from "../../components/SearchInput"
import { ADMIN_API } from "../../common/common"
import { getApi, notifyError, notifyMessage, postApi } from "../../service"
import { Logout } from "../../common/Funcation"
import { useNavigate } from "react-router-dom"

function WhiteLimit() {
  const navigate = useNavigate()
  const [siteDropDownData, setSiteDropDownData] = useState<any>({})
  const [webSiteId, setWebSiteIdData] = useState<string>("")
  const [limitData, setLimitData] = useState<any>([])

  useEffect(() => {
    getSiteDropDownData()
    return () => {
    }
  }, [])

  //   useEffect(() => {
  //     if(webSiteId !== "")
  //     getlimitData(webSiteId)
  //     else
  //     setLimitData({})
  //     return () => {
  //     }
  //   }, [webSiteId])

  const getLimitDataByClick = () => {
    if (webSiteId !== "")
      getlimitData(webSiteId)
    else
      setLimitData([])
  }

  const getlimitData = async (id: string) => {
    let data = {
      api: ADMIN_API.SETTING.WHITELABLELIMIT.GET,
      value: {
        id
      },
    }

    await postApi(data).then(function (response) {
      console.log("getSiteData :: ", response);
      setLimitData(response.data.data)
    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }
  const updatelimitData = async (id: string) => {
    if (webSiteId === "")
      return false;

    const { _id, ...tempLimit } = limitData?.find((value: any) => value._id === id)
    let data = {
      api: ADMIN_API.SETTING.WHITELABLELIMIT.UPDATE,
      value: {
        id,
        ...tempLimit
      },
    }

    await postApi(data).then(function (response) {
      //   console.log("getSiteData :: ",response);
      //   setLimitData(response.data.data)
      notifyMessage(response.data.message);
      getlimitData(id);
    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }
  const resetlimitData = async (id: string) => {
    if (webSiteId === "")
      return false;

    let data = {
      api: ADMIN_API.SETTING.WHITELABLELIMIT.RESET,
      value: {
        id
      },
    }

    await postApi(data).then(function (response) {
      //   console.log("getSiteData :: ",response);
      //   setLimitData(response.data.data)
      notifyMessage(response.data.message);
      getlimitData(id);
    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }
  const getSiteDropDownData = async () => {
    let data = {
      api: ADMIN_API.SETTING.WHITELABLELIMIT.GET_AGENT_LIST,
    }

    await getApi(data).then(function (response) {
      console.log("getSiteDropDownDataData :: ", response);
      setSiteDropDownData(response.data.data)

    }).catch(err => {
      notifyError(err.response.data.message)
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
  const changeLimit = (e: any, id: string) => {
    const { value, name } = e.target

    setLimitData(limitData.map((values: any) => {
      if (values._id === id) {
        values[name] = value
      }
      return values;
    }))
  }

  return (
    <div className="container  settings full-wrap" >
      <div className='top_header'>
        <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
          <h5>Set WhiteLabels Limit</h5>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label>Select Agent:</label>
          <select style={{ height: "32px", margin: "0 10px", width: "120px" }} name="cars" id="cars" onChange={(e) => getIdForWebSite(e)}>
            <option value="">Select Agent</option>
            {siteDropDownData && siteDropDownData?.length && siteDropDownData.map((item: any) => {
              return (
                <option value={item?._id}>{item?.user_name}</option>
              )
            })}
          </select>
          {/* <label>Order of display:</label>
                    <select style={{height: "32px", margin: "0 10px", width: "120px"}} name="cars" id="cars">
                        <option value="volvo">Select Type</option>
                        <option value="saab">Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </select> */}
          <div className="search-btn"><button style={{ width: "100px" }} onClick={getLimitDataByClick}>Get PL</button></div>
        </div>
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            <th> Current Limit </th>
            <th> Min Profit Limit </th>
            <th> Max Profit Limit	</th>
            {/* <th> User Balance Limit	 </th> */}
            <th> Casino Limit </th>
            <th> Action </th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {
            limitData && limitData.length && limitData.map((item: any) => {
              return (
                <tr>
                  <td style={{ width: "20%" }}>
                    <label>{item && item?.casinoWinings}</label>
                    <div className="search-btn">
                      <button style={{ width: "100px" }} onClick={() => resetlimitData(item?._id)}>Reset</button>
                    </div>
                  </td>
                  <td style={{ width: "20%" }}><input style={{ padding: "3px 5px" }} value={item && item?.casinoWinLimitMin} onChange={(e) => changeLimit(e, item?._id)} type="text" name="casinoWinLimitMin" placeholder="Min Profit Limit" /></td>
                  <td style={{ width: "20%" }}><input style={{ padding: "3px 5px" }} value={item && item?.casinoWinLimit} onChange={(e) => changeLimit(e, item?._id)} type="text" name="casinoWinLimit" placeholder="Max Profit Limit" /></td>
                  <td style={{ width: "20%" }}><input style={{ padding: "3px 5px" }} value={item && item?.casinoUserBalance} onChange={(e) => changeLimit(e, item?._id)} type="text" name="casinoUserBalance" placeholder="Casino Limit" /></td>
                  <td style={{ width: "20%" }}>
                    <div className="search-btn">
                      <button style={{ width: "100px" }} onClick={() => updatelimitData(item?._id)}>Update Limit</button>
                    </div>
                  </td>
                </tr>
              )
            })
          }
          {/* <tr>
                        <td style={{ width: "20%" }}>
                            <label>{limitData && limitData?.casinoWinings}</label>
                            <div className="search-btn">
                                <button style={{width: "100px"}} onClick={resetlimitData}>Reset</button>
                            </div>
                        </td>
                        <td style={{ width: "20%" }}><input style={{padding: "3px 5px"}} value={limitData && limitData?.casinoWinLimitMin} onChange={(e)=> changeLimit(e)} type="text" name="casinoWinLimitMin" placeholder="Min Profit Limit" /></td>
                        <td style={{ width: "20%" }}><input style={{padding: "3px 5px"}} value={limitData && limitData?.casinoWinLimit} onChange={(e)=> changeLimit(e)} type="text" name="casinoWinLimit" placeholder="Max Profit Limit" /></td>
                        <td style={{ width: "20%" }}><input style={{padding: "3px 5px"}} value={limitData && limitData?.casinoUserBalance} onChange={(e)=> changeLimit(e)} type="text" name="casinoUserBalance" placeholder="Casino Limit" /></td>
                        <td style={{ width: "20%" }}>
                            <div className="search-btn">
                                <button style={{width: "100px"}} onClick={updatelimitData}>Update Limit</button>
                            </div>
                        </td>
                    </tr> */}
        </tbody>
      </table>
    </div >
  )
}

export default WhiteLimit