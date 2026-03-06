import { useNavigate } from "react-router-dom"
import SearchInput from "../../components/SearchInput"
import ConfirmationPopup from "../../components/confirmationPopup"
import { useEffect, useState } from "react"
import { ADMIN_API } from "../../common/common"
import { postApi } from "../../service"
import { Logout } from "../../common/Funcation"

function AsuspendedmarketResult() {
  const [open, setOpen] = useState<boolean>(false)

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  const [matchData, setMatchData] = useState<any>({})

  useEffect(() => {
    getPageData("")
    return () => {
    }
  }, [])
  const getPageData = async (search: string) => {
    let data: any = {
      api: ADMIN_API.SETTING.MATCH_HISTORY.LIST_OF_CANCEL_MATCH,
      value: {
        search
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
  const rollBackMatch = async () => {
    let data: any = {
      api: ADMIN_API.SETTING.MATCH_HISTORY.ROLL_BACK_WINNER,
      value: {
        id: matchData._id,
      },
    }
    await postApi(data).then(function (response) {
      console.log(response);
      setOpen(false)
      getPageData('')
    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }
  const handleSubmit = (search: any) => {
    getPageData(search)
  }

  const rollbackPopUp = (data: any) => {
    setMatchData(data);
    setOpen(true);
  }

  return (<>
    <div className="container settings full-wrap">
      <div className='top_header'>
        <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
          <h5>Suspended Market Results</h5>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <SearchInput hide placeholder="Search..." style={{ display: "inline-block" }} searchSubmit={handleSubmit} />
        </div>
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            <th> Sport </th>
            <th> Match Id	</th>
            <th> Market Id	</th>
            <th> Match Name	</th>
            <th> Market </th>
            <th> Date	</th>
            <th> IP	</th>
            <th> Action	</th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {
            pageData && pageData?.length && pageData?.map((item: any) => {
              return (
                <tr>
                  <td>{item?.type}</td>
                  <td>{item?.gameId}</td>
                  <td>{item?.marketId}</td>
                  <td>{item?.name}</td>
                  <td>Match Odds</td>
                  <td>{item?.startDate}</td>
                  <td>-</td>
                  <td>
                    <div className="search-btn">
                      <button onClick={() => rollbackPopUp(item)} style={{ width: "125px" }}>Rollback</button>
                    </div>
                  </td>
                </tr>
              )
            })
          }
          {/* <tr>
                        <td>Tennis</td>
                        <td>32975963</td>
                        <td>32975963-24.FY</td>
                        <td>Desert Vipers v MI Emirates</td>
                        <td>Match Odds</td>
                        <td>Central Panel</td>
                        <td>Tue Jan 30 22:08:02 IST 2024</td>
                        <td>
                            <div className="search-btn">
                                <button onClick={() => setOpen(true)} style={{width: "125px"}}>Rollback</button>
                            </div>
                        </td>
                    </tr> */}
        </tbody>
      </table>
    </div>
    {open && <ConfirmationPopup
      title={`Suspend Rollback - ${matchData?.name} (${matchData?.gameId})`}
      description={`Are you sure you want to Suspend Rollback ${matchData?.name} (${matchData?.gameId}) ?`}
      OpenModal={open}
      closeModel={() => setOpen(false)}
      submit={rollBackMatch}
    />}</>
  )
}

export default AsuspendedmarketResult