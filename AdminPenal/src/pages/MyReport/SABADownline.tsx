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

function SABADownline() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const DD = useSelector((e: any) => e.domainDetails);
  const HeaderData = useSelector((e: any) => e.Header);

  const navigate = useNavigate();
  const [pageData, setPageData] = useState<any>({});
  useEffect(() => {
    getPageData();
    return () => { };
  }, []);

  const getPageData = async (
    ID: string = "",
    FROM: string = "",
    TO: string = "",
    FILTER: string = ""
  ) => {
    //TYPE: string, PAGE: string, SEARCH: string = ''
    let data: any = {
      api: ADMIN_API.REPORT.DOWN_LINE_CASINO,
      value: {
        // type: TYPE,
        // page: PAGE ? PAGE : '1',
        // limit: '10'
      },
    };
    if (ID !== "") {
      data.value.id = ID;
    }
    if (TO !== "") {
      data.value.to = TO;
    }
    if (FROM !== "") {
      data.value.from = FROM;
    }
    if (FILTER !== "") {
      data.value.filter = FILTER;
    }

    await postApi(data)
      .then(function (response) {
        console.log(response);
        setPageData(response.data.data);
      })
      .catch((err) => {
        debugger;
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };
  const handlePageClick = (e: any) => {
    console.log("page clicked", e);
    getPageData();
  };

  const filterButtonClick = (TYPE: string) => {
    getPageData("", "", "", TYPE);
  };
  const getFilterButtonClick = () => {
    getPageData("", startDate.toString(), endDate.toString(), "all");
  };

  const userClick = (USER: any) => {
    if (USER.agent_level && USER.agent_level !== "PL") {
      getPageData(USER._id, startDate.toString(), endDate.toString(), "all");
    }
  };
  const getAdminClick = () => {
    getPageData("", "", "", "all");
  };

  return (
    <>
      <div className="container main_wrap">
        <div className="top_header">
          <div className="top_header_title">
            <h5>SABA P/L Downline Monthly</h5>
          </div>
        </div>

        <section className="my-account-section">
          <div className="my-account-section_header" style={{ background: "#E0E6E6" }}>
            <div className="account_tabs_filter flex-align s_mb-10">
              <label style={{ marginLeft: 0 }}> Type: </label>
              <select name="sports" id="sports">
                <option value="11">SABA Sports</option>
                <option value="1">Vgaming</option>
                <option value="2">Lottery</option>
                <option value="3">RNG Keno</option>
                <option value="4">Virtual Sports 3</option>
                <option value="5">Saba Virtual Sports</option>
                <option value="6">Virtual Sports 2</option>
                <option value="7">Number Game</option>
                <option value="8">SportsBook</option>
              </select>
              <label> From: </label>
              <input style={{ width: "110px", padding: "6px !important" }} id="betsstartDate" className="cal-input" type="date" placeholder="YYYY-MM-DD" />
              <label> To: </label>
              <input style={{ width: "110px", padding: "6px !important" }} id="betsstartDate" className="cal-input" type="date" placeholder="YYYY-MM-DD" />
              {/* <label> From: </label>
              <div className="input_group from-to">
                <div className="no-wrap flex-align">
                  <div className="w_80">
                    <ReactDatePicker
                      selected={startDate}
                      className="form-control hasDatepicker"
                      onChange={(date: Date) => setStartDate(date)}
                    />
                  </div>
                  <span className="input-group-text p-0 ps-3 pe-3"> 09:00 </span>
                </div>
              </div>
              <label> To: </label>
              <div className="input_group from-to">
                <div className="no-wrap flex-align">
                  <div className="w_80">
                    <ReactDatePicker
                      selected={endDate}
                      className="form-control hasDatepicker"
                      onChange={(date: Date) => setEndDate(date)}
                    />
                  </div>
                  <span className="input-group-text p-0 ps-3 pe-3"> 09:00 </span>
                </div>
              </div> */}
            </div>
            <div className="account_tabs_filter d_flex">
              <div className='s_mr-10'>
                <input
                  type="button"
                  value="Just For Today"
                  name="today"
                  id="today"
                  className="btn btn-default-customize"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                />
              </div>
              <div className='s_mr-10'>
                <input
                  type="button"
                  value="From Yesteday"
                  name="yesteday"
                  id="yesteday"
                  className="btn btn-default-customize"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                />
              </div>
              <div className='s_mr-10'>
                <input
                  type="button"
                  value="Get P & L"
                  name="getPL"
                  id="getPL"
                  className="btn btn-default-customize"
                  style={styleObjectBlackButton(DD?.colorSchema, true)}
                />
              </div>
            </div>
          </div>

          <div className="my-account-section-content">
            <div className="my-account-section-content-table">
              <table id="resultTable" className="table01 margin-table">
                <thead>
                  <tr>
                    <th className="light-grey-bg">UID</th>
                    <th className="light-grey-bg">Casino P/L</th>
                    <th className="light-grey-bg">Comm.</th>
                    <th className="light-grey-bg">Total P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {true ? (
                    <tr>
                      <td>Dummy Test</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                  ) : (
                    <h2>No data Found</h2>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <th className="border-top"><strong>Total</strong></th>
                    <th className="light-grey-bg border-top">0</th>
                    <th className="light-grey-bg border-top">0</th>
                    <th className="light-grey-bg border-top">0</th>
                  </tr>
                </tfoot>
              </table>
              {/* {pageData?.totalPages === 1 || pageData?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.totalPages} />} */}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default SABADownline;
