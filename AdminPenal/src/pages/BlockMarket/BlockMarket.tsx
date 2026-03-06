
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_API } from '../../common/common'
import { Logout } from '../../common/Funcation'
import Pagination from '../../components/Pagination'
import SearchInput from '../../components/SearchInput'
import { getApi, notifyMessage, postApi } from '../../service'


function BlockMarket() {


  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  const [isLoader, setIsLoader] = useState(false)

  useEffect(() => {
    getPageData()
    return () => {
    }
  }, [])



  const getPageData = async (SEARCH: string = '') => {
    let data: any = {
      api: ADMIN_API.MARKET.LIST,
      value: {

      },
    }
    if (SEARCH !== '') {
      data.value.search = SEARCH
    }

    setIsLoader(true)
    await getApi(data).then(function (response) {
      console.log(response);
      setPageData(response.data.data)
      setIsLoader(false)
    }).catch(err => {
      setIsLoader(false)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }


  const handleStatusChange = async (item: any) => {
    let data: any = {
      api: ADMIN_API.MARKET.BLOCK,
      value: {
        marketId: item._id,
        isBlock: !item?.isBlock
      },
    }


    await postApi(data).then(function (response) {
      console.log(response);
      notifyMessage('Update')
      getPageData()
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }

  return (
    <div className="container main_wrap" >
      <div className="top_header">
        <div className="top_header_title">
          <h5>Sport Listing</h5>
        </div>
      </div>

      <div className="tabs b-0">
        <div className='tabs_content mt-10'>
          <table className="table01 margin-table align-right">
            <thead>
              {/* PL	Bet ID	Bet taken	Market	Selection	Type	Odds req.	Stake	Profit/Loss */}
              <tr>
                <th className='align-left' > S.No. </th>
                <th className='align-right'> Betfair ID </th>
                <th className='align-right'> Name	</th>
                <th className='align-right'> Status </th>
                <th className='align-right flex-end' style={{ height: "31.5px" }}> Action </th>
              </tr>
            </thead>
            {isLoader ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="./images/miniloadder.svg" alt="" /></div> : <tbody id="matches-table">
              {pageData && pageData?.data?.length > 0 ? pageData?.data?.map((item: any, i: any) => {
                return (
                  <tr key={i}>
                    <td className='align-left'> {i + 1} </td>
                    <td> {item.betFairId}  </td>
                    <td> {item.name} </td>
                    <td> {item.name} is {!item.isBlock ? 'ON' : 'OFF'}</td>
                    <td align="right">
                      <div className="form-check form-switch large-switch flex-end">
                        <input style={{ position: "unset", left: "unset" }} className="form-check-input" type="checkbox" id="flexSwitchCheckChecked0" onChange={() => handleStatusChange(item)} checked={!item.isBlock} disabled={!item.isAbleToTakeAction} name="sport-league" />
                        <label className="form-check-label" htmlFor="flexSwitchCheckChecked0"></label>
                      </div>
                    </td>
                  </tr>
                )
              }) : <><h2>No Record Found</h2></>}
            </tbody>}
          </table>
        </div>
      </div>
    </div>
  )
}

export default BlockMarket