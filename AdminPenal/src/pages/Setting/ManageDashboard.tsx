

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ADMIN_API } from '../../common/common';
import { getImageUrl, Logout } from '../../common/Funcation';
import { styleObjectBlackButton } from '../../common/StyleSeter';
import Pagination from '../../components/Pagination'
import { getApi, postApi } from '../../service';
import { dataInterface } from './interface';



function ManageDashboard() {
  const showAlert = async (id: string) => {
    if (window.confirm('are you sure you wont to delete this item') === true) {
      let data: any = {
        api: ADMIN_API.SETTING.DASHBOARD.DELETE,
        value: {
          id
        },
      }

      await postApi(data).then(function (response) {
        console.log(response);
        getPageData('1')

      }).catch(err => {
        debugger
        if (err.response.data.statusCode === 401) {
          Logout()
          navigate('/login')
        }
      })
    };
  }

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const [hoverId, setHoverId] = useState({ isHover: '' })
  const [siteDropDownData, setSiteDropDownData] = useState<any>({})
  const [webSiteId, setWebSiteIdData] = useState<string>("")

  const handleMouseEnter = (id: string = '') => {
    if (id) { setHoverId({ isHover: id }) }
    else { setIsHover(true); }
  };

  const handleMouseLeave = (id: string = '') => {
    if (id) { setHoverId({ isHover: '' }) }
    else { setIsHover(false); }
  };

  useEffect(() => {
    getSiteDropDownData()
    return () => {
    }
  }, [])
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

  const getIdForWebSite = (e: any) => {
    const { value } = e.target
    console.log("value ::: ", value);
    setWebSiteIdData(value)
  }

  useEffect(() => {
    if (webSiteId !== "")
      getPageData('1')
    else
      setPageData({})
    return () => {
    }
  }, [webSiteId])

  const getImageSize = (key: string) => {
    switch (key) {
      case 'fullSize':
        return 'Full Size'
      case 'halfWidth':
        return 'Half Width'
      case 'squareSize':
        return 'Square Size'
      default:
        break;
    }
  }


  const editClick = (e: any) => {
    navigate("/edit-dashboard/" + e._id)
  }

  const getPageData = async (PAGE: string) => {
    let data: dataInterface = {
      api: ADMIN_API.SETTING.DASHBOARD.GET_LIST,
      value: {
        page: PAGE ? PAGE : '1',
        limit: '50',
        domain: webSiteId
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);
      setPageData(response.data.data)

    }).catch(err => {
      debugger
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }
  const handlePageClick = (e: any) => {
    console.log('page clicked', e);
    getPageData((e.selected + 1).toString())
  }

  return (
    <div className="container settings main_wrap">
      <div className='top_header'>
        <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
          <h5>Manage Dashboard Images</h5>
          {webSiteId && <a href={'/add-dashboard/' + webSiteId} onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()} style={styleObjectBlackButton(DD?.colorSchema, isHover)} className="btn_black d_flex d_flex_align_center">Add New</a>}
        </div>
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
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            <th> Image </th>
            <th> Title </th>
            <th> Link </th>
            <th> Width </th>
            <th> Action </th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {pageData.results && pageData.results?.length > 0 ? pageData.results.map((item: any, i: any) => {
            return (<>
              <tr>
                <td style={{ width: "20%" }}>
                  <a href={getImageUrl(item.image)} target="_blank">
                    <img src={getImageUrl(item.image)} alt="" />
                  </a>
                </td>
                <td> {item.title} </td>
                <td> {item.link} </td>
                <td> {getImageSize(item.Width)} </td>
                <td>
                  <button onClick={() => editClick(item)} onMouseEnter={() => handleMouseEnter(item._id)} onMouseLeave={() => handleMouseLeave(item._id)} style={styleObjectBlackButton(DD?.colorSchema, hoverId.isHover === item._id)} className="btn_black">Edit</button>

                  <button type="submit" className="btn_red" onClick={() => showAlert(item._id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: "11px" }}><path fill="#ffffff" d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" /></svg>
                  </button>
                </td>
              </tr>
            </>)
          }) : <h2>No data Found</h2>}
        </tbody>
      </table>

      <div className='d_flex d_flex_align_center w_100 d_flex_justify_center'>

        {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}


      </div>
    </div>
  )
}

export default ManageDashboard