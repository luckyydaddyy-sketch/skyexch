import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { getImageUrl, Logout } from '../../common/Funcation'
import { styleObjectBlackButton } from '../../common/StyleSeter'
import Pagination from '../../components/Pagination'
import { getApi, postApi } from '../../service'
import { WebSiteList } from './interface'



function ManageWebsites() {

  const dispatch = useDispatch()

  const DD = useSelector((e: any) => e.domainDetails);
  const HeaderData = useSelector((e: any) => e.Header);
  const [headerOptions, setHeaderOptions] = useState(HeaderData)
  const [isHover, setIsHover] = useState(false);
  const [hoverId, setHoverId] = useState({ isHover: '' })
  const handleMouseEnter = (id: string = '') => {
    if (id) { setHoverId({ isHover: id }) }
    else { setIsHover(true); }
  };
  const handleMouseLeave = (id: string = '') => {
    if (id) { setHoverId({ isHover: '' }) }
    else { setIsHover(false); }
  };
  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  useEffect(() => {
    getPageData('All', '1')
    return () => {
    }
  }, [])

  const getPageData = async (TYPE: string, PAGE: string) => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.LIST,
      // value: {
      //   type: TYPE,
      //   page: PAGE ? PAGE : '1',
      //   limit: '10'
      // },
    }

    await getApi(data).then(function (response) {
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

  const updateMaintenance = async (ID: string) => {
    let data = {
      api: ADMIN_API.SETTING.WEBSITE.MAINTENANCE,
      value: {
        id: ID,
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);
      getPageData('All', '1')
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }

  const handlePageClick = (e: any) => {
    console.log('page clicked', e);
    getPageData('All', (e.selected + 1).toString())
  }
  const editClick = (e: any) => {
    dispatch({ type: 'EDIT_WEBSITE', payload: e })
    navigate("/edit-website/" + e._id)
  }

  return (
    <div className="container settings full-wrap">
      <div className='top_header'>
        <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
          <h5>Manage Websites</h5>
          {headerOptions?.name === "O" && 
            <a href="/add-website" onMouseEnter={() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()} style={styleObjectBlackButton(DD?.colorSchema, isHover)} className="btn_black d_flex d_flex_align_center">Add New</a>
          }
        </div>
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            <th> Title </th>
            <th> Domain </th>
            <th> Favicon </th>
            <th> Logo </th>
            <th> Login Image </th>
            <th> Mobile Login Image	</th>
            <th> Status </th>
            <th> Toggle </th>
            <th> Action </th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {pageData && pageData?.length > 0 ? pageData.map((item: WebSiteList, i: any) => {
            return (
              <tr>

                <td > {item.title} </td>
                <td style={{ width: "15%" }}>
                  <span className="text-primary"><a href={item.domain} style={{ textDecoration: "underline" }}>{item.domain}</a></span>
                </td>
                <td style={{ width: "15%" }}>
                  <a href={getImageUrl(item.favicon)} target="_blank"><img src={getImageUrl(item.favicon)} alt="Image" /></a>
                </td>
                <td style={{ width: "15%" }}>
                  <a href={getImageUrl(item.logo)} target="_blank"><img src={getImageUrl(item.logo)} alt="Image" /></a>
                </td>
                <td style={{ width: "15%" }}>
                  <a href={getImageUrl(item.loginImage)} target="_blank"><img src={getImageUrl(item.loginImage)} alt="Image" /></a>
                </td>
                <td style={{ width: "10%" }}>
                  <a href={getImageUrl(item.mobileLoginImage)} target="_blank"><img src={getImageUrl(item.mobileLoginImage)} alt="Image" /></a>
                </td>
                <td style={{ width: "10%" }}>
                  <button type="button" className="btn btn-success btn-sm">{item.status ? 'On' : 'Off'}</button>
                </td>
                <td style={{ width: "10%" }}>
                  <div className="form-check form-switch">
                    <input onClick={() => updateMaintenance(item._id)} className="form-check-input" type="checkbox" role="switch" checked={item?.isMaintenance ? true : false} id="flexSwitchCheckDefault" />
                    {/* {item?.isMaintenance ? 'true' : 'false'} */}
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked0"></label>
                    {/* {active ? true : false} */}
                  </div>

                </td>
                <td>
                  <button onMouseEnter={() => handleMouseEnter(item._id)} onMouseLeave={() => handleMouseLeave(item._id)} style={styleObjectBlackButton(DD?.colorSchema, hoverId.isHover === item._id)} onClick={() => editClick(item)} className="btn_black">Edit</button>
                </td>
              </tr>
            )
          }) : <h2>No Data Found</h2>}
        </tbody>
      </table>
      {/* {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />} */}

    </div>
  )
}

export default ManageWebsites