import ReactDatePicker from "react-datepicker"
import NewPagination from "../../components/new-pagination"
import { useState } from "react";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import { useSelector } from "react-redux";
import { ADMIN_API } from "../../common/common";
import { postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import { useNavigate } from "react-router-dom";


function MonitorUserPnL() {
    const navigate = useNavigate()
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [sort, setSort] = useState("top");
    const [type, setType] = useState("");
    const [betType, setBetType] = useState("");
    const [limit, setLimit] = useState(10);
    const [matchData, setMatchData] = useState();

    const DD = useSelector((e: any) => e.domainDetails);

    const getSiteData = async () => {
        let data = {
            api: ADMIN_API.REPORT.CASINO_PROFIT_LOST,
            value: {
                // type : sportName,
                page: '1',
                limit: '100'
            }
        };

        await postApi(data)
            .then(function (response) {
                console.log("getSiteData :: ", response);
                // if (response.data.data) {
                console.log(
                    "response.data.data?.siteInfo :: ",
                    response.data.data
                );
                //   setSportMatchName(response.data.data);
                // }
            })
            .catch((err) => {
                if (err.response.data.statusCode === 401) {
                    Logout();
                    navigate("/login");
                }
            });
    };

    return (
        <>
            <div className="container full-wrap">
                <div className="top_header">
                    <div className="top_header_title mt-3">
                        <h5>Monitoring</h5>
                    </div>
                </div>
                <div className='my-account-section-content'>
                    <div className='my-account-section_header'>
                        <div className="account_tabs_filter flex-align content-between">
                            <div className="flex-align">

                                <label> From: </label>
                                <div className="input_group from-to">
                                    <div className=''>
                                        <ReactDatePicker selected={startDate} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />
                                    </div>
                                </div>

                                <label> To: </label>
                                <div className="input_group from-to">
                                    <div className=''>
                                        <ReactDatePicker selected={endDate} className='form-control hasDatepicker' onChange={(date: Date) => setEndDate(date)} />
                                    </div>
                                </div>
                                <div className="input_group s_ml-10">
                                    <select name="report_type" id="report_type" className="form-control" value={type} onChange={(e) => { setType(e.target.value) }}>
                                        <option value="aws"> AWS Casino</option>
                                        <option value="inter"> Inter Casino</option>
                                    </select>
                                </div>
                                <div className="input_group s_ml-10">

                                    <select name="report_type" id="report_type" className="form-control" value={sort} onChange={(e) => { setSort(e.target.value) }}>
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                    </select>
                                </div>
                                <div className="input_group s_ml-10">

                                    <select name="report_type" id="report_type" className="form-control" value={limit} onChange={(e) => { setLimit(Number(e.target.value)) }}>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                                <input style={{ ...styleObjectBlackButton(DD?.colorSchema, true), padding: "4px 20px" }} type="button" value="Apply" name="acntbtn" className="submit-btn btn_black p-2 s_ml-10" />
                                <input style={{ ...styleObjectBlackButton(DD?.colorSchema, true), padding: "4px 20px" }} type="button" value="Clear" name="acntbtn" className="submit-btn btn_black p-2 s_ml-10" />
                            </div>
                            <div className="flex-aling">
                                <input style={styleObjectBlackButton(DD?.colorSchema, true)} type="button" value="C.Det User PL" name="acntbtn" className="submit-btn btn_black p-2 s_ml-10" />
                                <input style={styleObjectBlackButton(DD?.colorSchema, true)} type="button" value="Sports UserPL" name="acntbtn" className="submit-btn btn_black p-2 s_ml-10" />
                            </div>
                        </div>
                    </div>
                    <div className='my-account-section-content-table'>
                        <p className="s_mb-10">Showing 1 to 10 of Entries 3668</p>
                        <table id="resultTable" className="table01 margin-table" style={{ textAlign: "right" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "right" }}>S.No.</th>
                                    <th style={{ textAlign: "right" }}>Username	</th>
                                    <th style={{ textAlign: "right" }}>Cricket</th>
                                    <th style={{ textAlign: "right" }}>Tennis</th>
                                    <th style={{ textAlign: "right" }}>Soccer</th>
                                    <th style={{ textAlign: "right" }}>Fancy</th>
                                    <th style={{ textAlign: "right" }}>Live Casino</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>shoponmama(Shopon)</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>6408.55</td>
                                </tr>

                            </tbody>
                        </table>
                        <NewPagination />
                    </div>
                </div>
            </div >
        </>
    )
}

export default MonitorUserPnL