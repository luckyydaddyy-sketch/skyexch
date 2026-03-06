import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import SearchInput from "../../components/SearchInput"
import { ADMIN_API } from '../../common/common'
import { postApi } from '../../service';
import { Logout } from '../../common/Funcation';
import ConfirmationPopup from '../../components/confirmationPopup';
import ReactDatePicker from 'react-datepicker';

interface ActiveStatus {
  bookmaker: boolean;
  fancy: boolean;
  premium: boolean;
  status: boolean;
}
interface Suspend {
  bookmaker: boolean;
  fancy: boolean;
  premium: boolean;
  odds: boolean;
}
interface Limit {
  min: number;
  max: number;
}
interface Result {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  activeStatus: ActiveStatus;
  suspend: Suspend;
  oddsLimit: Limit;
  bet_odds_limit: Limit;
  bet_bookmaker_limit: Limit;
  bet_fancy_limit: Limit;
  bet_premium_limit: Limit;
  winner: string;
  winnerSelection: any;
  type: string;
  marketId: string;
  gameId: number;
}
interface Data {
  results?: Result[];
  page?: string;
  limit?: string;
  totalPages?: number;
  totalResults?: number;
}


function AactiveMatch() {

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<Data>({})
  const [open, setOpen] = useState<string>("")
  const [startDate, setStartDate] = useState(new Date());
  const [popUpText, setPopUpText] = useState<string>("")
  const [popUpTitle, setPopUpTitle] = useState<string>("")
  const [sportItem, setSportItem] = useState<any>()

  const getDate = () => {
    const today = new Date();
    let endDate = new Date();
    endDate.setDate(today.getDate() - 7);

    return {
      today, endDate
    }
  }
  useEffect(() => {
    getPageData("cricket", '1')
    return () => {
    }
  }, [])

  const getPageData = async (TYPE: string, PAGE: string, SEARCH: string = '') => {
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.GET_LIST,
      value: {
        type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '100'
      },
    }
    if (SEARCH !== '') {
      data.value.search = SEARCH
    }

    await postApi(data).then(function (response) {
      console.log(response, "response");
      setPageData(response.data.data)

    }).catch(err => {
      debugger
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }

  const updateTableData = async (e: any, ITEM: Result) => {
    e.preventDefault();
    setOpen("");
    let data: any = {
      api: ADMIN_API.SETTING.SPORT_MARKET.UPDATE,
      value: {
        id: ITEM._id,
        status: false,
        activeStatus: ITEM.activeStatus,
        oddsLimit: ITEM.oddsLimit,
        bet_odds_limit: ITEM.bet_odds_limit,
        bet_bookmaker_limit: ITEM.bet_bookmaker_limit,
        bet_fancy_limit: ITEM.bet_fancy_limit,
        bet_premium_limit: ITEM.bet_premium_limit,
        suspend: ITEM.suspend,
        startDate: ITEM.startDate,
      },
    }

    await postApi(data).then(function (response) {
      console.log(response);
      // setPageData(response.data.data)

    }).catch(err => {

      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }
  const onSportDateChange = (e: any) => {
    sportItem.startDate = startDate;
    updateTableData(e, sportItem);
  }
  const setOpenTab = (tabName: string, item: Result) => {
    let titleText = "";
    if (tabName === "markInActive") {
      titleText = `Inactive - ${item?.name} (${item?.gameId})`;
      item.activeStatus.status = false;
    } else if (tabName === "updateDate") {
      titleText = `Update Date - ${item?.name} (${item?.gameId})`;
    } else if (tabName === "suspendMatch") {
      item.suspend.odds = true;
      titleText = `Suspend - ${item?.name} (${item?.gameId})`;
    }
    setPopUpTitle(`${titleText}.`)
    setPopUpText(`Are you sure you want to ${titleText} ?`);

    setOpen(tabName);
    setSportItem(item)
  }
  const handleSearchSubmit = (search: any) => {
    console.log("search :: ", search);

    getPageData("cricket", '1', search)
  }
  return (<React.Fragment>
    <div className="container  settings full-wrap">
      <div className='top_header'>
        <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
          <h5>Active Matches</h5>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <SearchInput hide searchSubmit={handleSearchSubmit} placeholder="Search..." style={{ display: "inline-block" }} />
        </div>
      </div>
      <table className="table01 margin-table">
        <thead>
          <tr className="light-grey-bg">
            <th> Sport </th>
            <th> Event Id </th>
            <th> Market Id	</th>
            <th> Match </th>
            <th> Date </th>
            <th> Status </th>
            <th> Action </th>
          </tr>
        </thead>
        <tbody id="matches-table">
          {
            pageData.results && pageData.results?.length > 0 ? pageData.results.map((item: Result, i: any) => {
              return (
                <tr>
                  <td style={{ width: "20%" }}>{item?.type}</td>
                  <td style={{ width: "20%" }}>{item?.gameId}</td>
                  <td style={{ width: "20%" }}>{item?.marketId}</td>
                  <td style={{ width: "20%" }}>{item?.name}</td>
                  <td style={{ width: "20%" }}>{item.openDate}	</td>
                  <td style={{ width: "20%" }}>{item?.activeStatus?.status}</td>
                  <td style={{ width: "20%", display: "flex", alignItems: "center" }}>
                    <div className="search-btn">
                      <button onClick={() => setOpenTab("markInActive", item)} style={{ width: "100px" }}>Mark Inactive</button>
                    </div>
                    <div className="search-btn">
                      <button onClick={() => setOpenTab("suspendMatch", item)} style={{ width: "120px" }}>Suspend Match</button>
                    </div>
                    <div className="search-btn">
                      <button onClick={() => setOpenTab("updateDate", item)} style={{ width: "100px" }}>Update Date</button>
                    </div>
                  </td>
                </tr>
              )
            }) : <><h2>No data</h2></>}
          {/* <tr>
                        <td style={{ width: "20%" }}>Cricket</td>
                        <td style={{ width: "20%" }}>32975952</td>
                        <td style={{ width: "20%" }}>1.224125101</td>
                        <td style={{ width: "20%" }}>Pretoria Capitals v MI Cape Town</td>
                        <td style={{ width: "20%" }}>2024-02-01 21:00:00	</td>
                        <td style={{ width: "20%" }}>true</td>
                        <td style={{ width: "20%", display: "flex", alignItems: "center" }}>
                            <div className="search-btn">
                                <button style={{width: "100px"}}>Reset</button>
                            </div>
                            <div className="search-btn">
                                <button style={{width: "100px"}}>Reset</button>
                            </div>
                            <div className="search-btn">
                                <button style={{width: "100px"}}>Reset</button>
                            </div>
                        </td>
                    </tr> */}
        </tbody>
      </table>
    </div>

    {open !== "" && <ConfirmationPopup
      title={popUpTitle}
      description={open === "updateDate" ? <ReactDatePicker selected={getDate().today} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} /> : popUpText}
      OpenModal={open !== ""}
      closeModel={() => setOpen("")}
      submit={(e: any) => open === "updateDate" ? onSportDateChange(e) : updateTableData(e, sportItem)}
    />}

    {/* {open === "markInActive" && <ConfirmationPopup
          title={`Inactive - Multan Sultans v Karachi Kings (33011518)`}
          description={`Are you sure you want to Inactive Multan Sultans v Karachi Kings (33011518) ?`}
          OpenModal={open === "markInActive"}
          closeModel={() => setOpen("")}
        />} 
        {open === "updateDate" && <ConfirmationPopup
          title={`Update Date - Multan Sultans v Karachi Kings (33011518)`}
          description={<ReactDatePicker selected={getDate().today} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />}
          OpenModal={open === "updateDate"}
          closeModel={() => setOpen("")}
        />} 
        {open === "suspendMatch" && <ConfirmationPopup
          title={`Suspend - Multan Sultans v Karachi Kings (33011518)`}
          description={`Are you sure you want to Inactive Multan Sultans v Karachi Kings (33011518) ?`}
          OpenModal={open === "suspendMatch"}
          closeModel={() => setOpen("")}
        />} */}
  </React.Fragment>
  )
}

export default AactiveMatch