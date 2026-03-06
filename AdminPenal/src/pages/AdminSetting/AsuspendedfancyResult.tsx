import { useNavigate } from "react-router-dom"
import SearchInput from "../../components/SearchInput"
import { useEffect, useState } from "react"
import ConfirmationPopup from "../../components/confirmationPopup"
import { ADMIN_API } from "../../common/common"
import { postApi } from "../../service"
import { Logout } from "../../common/Funcation"

function AsuspendedfancyResult() {
  const [open, setOpen] = useState<boolean>(false)

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  const [popUpText, setPopUpText] = useState<string>("")
  const [matchData, setMatchData] = useState<any>({})

  useEffect(() => {
    getPageData("")
    return () => {
    }
  }, [])
  const getPageData = async (search: string) => {
    let data: any = {
      api: ADMIN_API.SETTING.FANCY_HISTORY.LIST_OF_BET_CANCEL,
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

  const rollbackWinner = async () => {

    let data: any = {
      api: ADMIN_API.SETTING.FANCY_HISTORY.ROLL_BACK_WINNER,
      value: {
        id: matchData?._id,
        selection: matchData?.selection,
      },
    }
    await postApi(data).then(function (response) {
      console.log(response);
      setOpen(false)
      getPageData("")

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

  const setOpenForRolleback = (flag: boolean, value: any) => {
    setOpen(flag);
    setPopUpText(`Suspend Rollback - ${value?.matchId?.name} (${value?.matchId?.gameId})`)
    // setSelectionText(value?.selection)
    // setMatchIdText(value?.matchId?._id)
    setMatchData(value)
  }

  return (<>
    <div className="container settings full-wrap" >
      <div className='top_header'>
        <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
          <h5>Suspended Fancy Results</h5>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <SearchInput hide placeholder="Search..." style={{ display: "inline-block" }} searchSubmit={handleSubmit} />
        </div>
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            <th> Event Id </th>
            <th> Match Name	</th>
            <th> Fancy Id </th>
            <th> Fancy Name </th>
            <th> Date	</th>
            <th> IP	</th>
            <th> Action	</th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {
            pageData && pageData?.history?.length ? pageData?.history?.map((item: any, i: number) => {
              return (
                <tr>
                  <td>{item?.matchId?.gameId}</td>
                  <td>{item?.matchId?.name}</td>
                  {/* <td>Desert Vipers v MI Emirates</td> */}
                  <td>{i}</td>
                  <td>{item?.selection}</td>
                  <td>{item?.createdAt}</td>
                  <td>Central Panel</td>
                  <td>
                    <div className="search-btn">
                      <button onClick={() => setOpenForRolleback(true, item)} style={{ width: "125px" }}>Rollback</button>
                    </div>
                  </td>
                </tr>
              )
            }) : <>No Data</>

          }
          {/* <tr>
                        <td>32975963</td>
                        <td>Desert Vipers v MI Emirates</td>
                        <td>32975963-24.FY</td>
                        <td>How many balls face by C Munro(DV vs MIE)adv</td>
                        <td>Tue Jan 30 22:08:02 IST 2024</td>
                        <td>Central Panel</td>
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
      title={`${popUpText}`}
      description={`Are you sure you want to ${popUpText} ?`}
      OpenModal={open}
      closeModel={() => setOpen(false)}
      submit={rollbackWinner}
    />}</>
  )
}

export default AsuspendedfancyResult