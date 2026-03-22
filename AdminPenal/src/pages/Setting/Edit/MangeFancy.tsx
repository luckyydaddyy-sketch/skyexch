
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ADMIN_API } from '../../../common/common'
import { Logout } from '../../../common/Funcation'
import { styleObjectBlackButton } from '../../../common/StyleSeter'
import Pagination from '../../../components/Pagination'
import { notifyError, notifyMessage, postApi } from '../../../service'
import { dataInterface, historyInterface } from '../interface'




function MangeFancy() {
  const { id, type } = useParams()
  const [pageData, setPageData] = useState<any>({})
  const [hoverId, setHoverId] = useState({ isHover: '' })
  const DD = useSelector((e: any) => e.domainDetails);
  const [run, setRun] = useState<string>('')
  const handleMouseEnter = (id: string = '') => {
    if (id) { setHoverId({ isHover: id }) }
  };
  const handleMouseLeave = (id: string = '') => {
    if (id) { setHoverId({ isHover: '' }) }
  };
  const showAlert = async (item: any) => {
    if (window.confirm("Are you sure you want to rollback result?") === true) {
      let data: any = {
        api: ADMIN_API.SETTING.FANCY_HISTORY.ROLL_BACK_WINNER,
        value: {
          id: id,
          selection: item?.selection,
        },
      }
      await postApi(data).then(function (response) {
        console.log(response);
        getPageData()

      }).catch(err => {
        if (err.response.data.statusCode === 401) {
          Logout()
          navigate('/login')
        }
      })
    }
  }
  const navigate = useNavigate()
  useEffect(() => {
    getPageData()
    return () => {
    }
  }, [])


  const declareResultClick = async (item: string, cancle: string) => {
    if (run === '' && cancle !== 'cancle') {
      notifyError('plase enter run')
      return
    }
    let data: any = {
      api: ADMIN_API.SETTING.MANAGE_FANCY.DECLARE_WINNER,
      value: {
        id: id,
        selection: item,
        winner: cancle === 'cancle' ? -2 : parseInt(run)
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);
      getPageData()
      notifyMessage('success')
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }

  const getPageData = async () => {
    let data: any = {
      api: type === 'manage' ? ADMIN_API.SETTING.MANAGE_FANCY.LIST_OF_BET : ADMIN_API.SETTING.FANCY_HISTORY.LIST_OF_BET,
      value: {
        id: id
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);
      setPageData(response.data.data)
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }

  return (
    <div className="container banking website edit main_wrap">
      <div className='top_header'>
        <div className='top_header_title align-items-center mt-3'>
          <h5 className="font-weight-bold">Manage  <strong>{pageData?.sportInfo?.name} [{pageData?.sportInfo?.openDate}]</strong>  Session <strong>History</strong></h5>
        </div>
      </div>

      <div className='edit_body'>
        <table className="table01 margin-table">
          <thead>
            <tr className="light-grey-bg">
              <th>Match Name</th>
              <th style={type === 'manage' ? { textAlign: 'right' } : {}}>Run</th>
              {type !== 'manage' && (
                <>
                  <th>Status</th>
                  <th>By Source</th>
                </>
              )}
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="matches-table">
            {type === 'manage' ? <>
              {pageData && pageData.betUnique?.length > 0 ? pageData.betUnique.map((item: string) => {
                return (<>
                  {
                    <tr>
                      <td>
                        <span className="text-primary">{item}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                          <input type="number" onChange={(e) => setRun(e.target.value)} style={{ padding: 6 }} placeholder='Run' />
                          <button type="button" className="btn btn-warning btn-sm shadow-none btn_black match_view"
                            onMouseEnter={() => handleMouseEnter(item)} onMouseLeave={() => handleMouseLeave(item)} style={styleObjectBlackButton(DD?.colorSchema, hoverId.isHover === item)}
                            onClick={() => declareResultClick(item, '')}
                          >Submit</button>
                        </div>
                      </td>
                      <td>
                        <button style={{ background: '#dc3545', color: 'white', borderColor: '#dc3545' }} type="button" className="btn btn-warning btn-sm shadow-none btn_black match_view"
                          onClick={() => declareResultClick(item, 'cancle')}
                        >Cancle</button>

                      </td>
                    </tr>
                  }

                </>)
              }) : <h2>No Data</h2>
              }
            </> : <>

              {pageData && pageData.history?.length > 0 ? pageData.history.map((item: any) => {
                return (<>

                  <tr><td>
                    <span className="text-primary">{item.selection}</span>
                  </td>
                    <td>  {item.winner} </td>
                    {type !== 'manage' && (
                      <>
                        <td>
                          <span className={`badge ${item.settlementType === 'auto' ? 'badge-success text-white' : 'badge-primary text-white'}`}>
                            {item.settlementType || 'manual'}
                          </span>
                        </td>
                        <td>{item.settledBy || 'Admin'}</td>
                      </>
                    )}
                    <td>
                      {type === 'rollback' ? <>
                        <button onMouseEnter={() => handleMouseEnter(item.selection)} onMouseLeave={() => handleMouseLeave(item.selection)} style={styleObjectBlackButton(DD?.colorSchema, hoverId.isHover === item.selection)} type="button" className="btn btn-outline-danger btn-sm rollback-result shadow-none" onClick={() => showAlert(item)}>Rollback Result</button>
                      </> : <></>}

                    </td>
                  </tr>
                </>)
              }) : <h2>No Data</h2>}</>}


          </tbody>
        </table>
      </div >
    </div >
  )
}

export default MangeFancy