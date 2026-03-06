import React, { useDebugValue, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ADMIN_API } from "../../common/common";
import { Logout } from "../../common/Funcation";
import Pagination from "../../components/Pagination";
import { postApi } from "../../service";
import { Data, dataInterface } from "../Setting/interface";
import arrowImage from "../../assets/images/arrow-right2.png";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import moment from "moment";

function MatchProfitLoss() {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 2)));
  const [endDate, setEndDate] = useState(new Date());
  const DD = useSelector((e: any) => e.domainDetails);
  const HeaderData = useSelector((e: any) => e.Header);
  const [tab, setTab] = useState('all')

  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  useEffect(() => {
    getPageData('', startDate.toString(), endDate.toString(), '', tab, '1')
    return () => { };
  }, []);
 
  const getPageData = async (ID: string = '', FROM: string = '', TO: string = '', FILTER: string = '', TYPE: string = '', PAGE: string = '1',) => {
    let data: any = {
      api: ADMIN_API.REPORT.NEW_MARKET_REPORT,
      value: {
        // type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '1000'
      },
    }
    if (ID !== '') { data.value.id = ID }
    if (TO !== '') { data.value.to = TO }
    if (FROM !== '') { data.value.from = FROM }
    if (FILTER !== '') { data.value.filter = FILTER }
    if (TYPE !== '') { data.value.type = TYPE }

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
  const handlePageClick = (e: any) => {
    console.log("page clicked", e);
    getPageData();
  };

  const filterButtonClick = (TYPE: string) => {
    getPageData("", "", "", TYPE);
  };
  const getFilterButtonClick = () => {
    getPageData("", new Date(startDate).toString(), new Date(endDate).toString(), "", tab);
  };

  const userClick = (USER: any) => {
    if (USER.agent_level && USER.agent_level !== "PL") {
      getPageData(USER._id, new Date(startDate).toString(), new Date(endDate).toString(), "all", tab);
    }
  };
  const getAdminClick = () => {
    getPageData("", "", "", "all");
  };

  const clearFilter = () => {
    const newStartDate = new Date(new Date().setDate(new Date().getDate() - 2));
    const newEndDate = new Date();
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    getPageData("", newStartDate.toString(), newEndDate.toString(), "", tab);
  };

  const selectMatchtype = (type: string) =>{
    setTab(type);
    getPageData("", new Date(startDate).toString(), new Date(endDate).toString(), "", type);
  }

  return (
    <>
      <div className="container full-wrap">
        <div className="top_header">
          <div className="top_header_title">
            <h5>Match Profit Loss</h5>
          </div>
        </div>
        {/* <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <p style={{ fontSize: "14px" }}> Data source : </p>

          <select style={{ height: "22px", margin: "0 10px" }} name="cars" id="cars">
            <option value="volvo">All</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </div> */}

        <section className="my-account-section">
          <div className="my-account-section_header" style={{ padding: "10px 10px 0px 5px", background: "#E0E6E6" }}>
            <ul className="input-list">
              <li><label>Period</label></li>
              <li>
                <input id="betsstartDate" className="cal-input" value={`${moment(startDate).format('YYYY-MM-DD hh:mm')}`} type="datetime-local" placeholder="YYYY-MM-DD" onChange={(e:any)=> setStartDate(e?.target?.value)}/>
                to
                <input id="betsendDate" className="cal-input" value={`${moment(endDate).format('YYYY-MM-DD hh:mm')}`} type="datetime-local" placeholder="YYYY-MM-DD" onChange={(e:any)=> setEndDate(e?.target?.value)}/>
              </li>
              <li><a className="btn-send" style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "90px" }} onClick={()=> getFilterButtonClick()}>Apply</a></li>
              <li><a className="btn" style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "90px" }} onClick={()=> clearFilter()}>Clear</a></li>
            </ul>



          </div>
          <div className="my-account-section-content">
            <div className="d_flex">
              <ul className="input-list">
                <li><a className="btn-send" style={{ background: "#ffb80c", width: "56px", height: "27px" }} onClick={()=> selectMatchtype('cricket')}>Cricket</a></li>
                <li><a className="btn-send" style={{ background: "#ffb80c", width: "56px", height: "27px" }} onClick={()=> selectMatchtype('soccer')}>Soccer</a></li>
                <li><a className="btn-send" style={{ background: "#ffb80c", width: "56px", height: "27px" }} onClick={()=> selectMatchtype('tennis')}>Tennis</a></li>
              </ul>

            </div>
          </div>
          <div className="my-account-section-content-table">
            <table id="resultTable" className="table01 margin-table old-res table-s">
              <thead>
                <tr>
                  <th style={{ width: "4%" }} className="align-L blk">S.No.</th>
                  <th style={{ width: "4%" }} className="align-L blk">Sport Name</th>
                  <th style={{ width: "10%" }} className="align-L blk">Match Name</th>
                  <th style={{ width: "5%" }} className="align-L blk">Match Date</th>
                  <th style={{ width: "5%" }} className="align-L blk">Pnl+</th>
                  <th style={{ width: "7%" }} className="align-L blk">Pnl-</th>
                  <th style={{ width: "7%" }} className="align-L blk">Commission</th>
                  <th style={{ width: "4%" }} className="align-L blk">Final P&amp;L</th>
                </tr>
              </thead>
              <tbody style={{fontWeight:"bold"}}>
                {
                  pageData?.report && pageData?.report?.results.length > 0 && <>
                    <tr>
                      <td></td>
                      <td></td>
                      <td>Total</td>
                      <td></td>
                      <td className={pageData?.total?.pnlPlush >= 0 ? "text-green" : 'text-danger'}>{pageData?.total?.pnlPlush}</td>
                      <td className={pageData?.total?.pnl >= 0 ? "text-green" : 'text-danger'}>{pageData?.total?.pnl}</td>
                      <td className={pageData?.total?.commission >= 0 ? "text-green" : 'text-danger'}>{pageData?.total?.commission}</td>
                      <td className={pageData?.total?.finalPnl >= 0 ? "text-green" : 'text-danger'}>{pageData?.total?.finalPnl}</td>
                    </tr>
                  </>
                }
                {
                  pageData?.report && pageData?.report?.results.length > 0 && pageData?.report?.results.map((item: any, i: any) => {
                    return (
                      <>
                        <tr>
                          <td>{i + 1}</td>
                          <td>{item?.type}</td>
                          <td>{item?.name}</td>
                          <td>{item?.openDate}</td>
                          <td className={item?.pnl > 0  ? "text-green" : ''} >{item?.pnl > 0 ? item?.pnl : 0}</td>
                          <td className={item?.pnl > 0  ? "" : 'text-danger'} >{item?.pnl < 0 ? item?.pnl : 0}</td>
                          <td className={item?.commission >= 0 ? "text-green" : 'text-danger'} >{item?.commission}</td>
                          <td className={item?.finalPnl >= 0 ? "text-green" : 'text-danger'} >{item?.finalPnl}</td>
                        </tr>
                      </>
                    )
                  })
                }

              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default MatchProfitLoss;
