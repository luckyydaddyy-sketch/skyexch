
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import { postApi } from '../../service'
import { dataInterface } from './interface'



function ManageCasino() {


  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  useEffect(() => {
    getPageData('1')
    return () => {
    }
  }, [])



  const getPageData = async (PAGE: string) => {
    let data: dataInterface = {
      api: ADMIN_API.SETTING.BANNER.GET_LIST,
      value: {
        page: PAGE ? PAGE : '1',
        limit: '50'
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
    <div className="container settings ">
      <div className='top_header'>
        <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
          <h5>Casino</h5>
        </div>
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            <th> Image </th>
            <th> Title </th>
            <th> Name </th>
            <th> Status </th>
            <th> Odds Min/Max </th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {pageData.results && pageData.results?.length > 0 ? pageData.results.map((item: any, i: any) => {
            return (<>
              <tr>
                <td style={{ width: "10%" }}>
                  <img src="https://ag.mysky247.xyz/uploads/casino/1664357421.jpg" alt="" />
                </td>
                <td style={{ width: "30%" }}>
                  Table32
                </td>
                <td style={{ width: "20%" }}>
                  5032
                </td>
                <td style={{ width: "10%" }}>
                  <button type="button" className="btn btn-success btn-sm">On</button>
                </td>
                <td style={{ width: "10%" }}>
                  <div className="row d_flex">
                    <div>
                      <span className="input-group-text0" id="basic-addon1">Min</span>
                      <input type="number" className="form-control input-change" name="min" value="1" />
                    </div>
                    <div>
                      <span className="input-group-text0" id="basic-addon1">Max</span>
                      <input type="number" className="form-control input-change" name="max" value="150" />
                    </div>
                  </div>
                </td>
              </tr>

            </>)
          }) : <h2>No data Found</h2>}

          {/* <tr>
            <td colSpan={5}>
            </td>
          </tr> */}
        </tbody>


      </table>
      {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />}


    </div>
  )
}

export default ManageCasino