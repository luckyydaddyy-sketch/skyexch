import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import ReactDatePicker from "react-datepicker";
import { useState } from "react";
import SearchInput from "../../components/SearchInput";

function AImageAdd() {
    const DD = useSelector((e: any) => e.domainDetails);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    return (
        <>
            <div className="container main_wrap">
                <div className='my-account-section-content'>
                    <div className='my-account-section_header s_px-5'>
                        <h4 className="s_mb-8"> Set Image For Users</h4>
                        <div className="account_tabs_filter" style={{ marginLeft: "0px" }}>
                            <h4> Select Website  </h4>
                            <div className="flex-align">
                                <div className="input_group s_mr-20 flex-align" style={{ width: "140px" }}>
                                    <select name="report_type" id="report_type" className="form-control">
                                        <option value=""> Select Website</option>
                                        <option value="deposit"> Cricket</option>
                                        <option value="deposit"> Soccer</option>
                                        <option value="deposit"> Tennis</option>
                                    </select>
                                </div>
                                <span className="must">＊</span>
                            </div>
                            <div className="input_group s_mt-10 s_mb-5 flex-align" style={{ width: "225px" }}>
                                <input style={{ height: "30px" }} className="form-control form-control-lg" type="file" />
                            </div>
                            <p style={{ color: "red" }}>(File size can be upto 100KB)</p>
                            <div className="flex-align s_my-10">
                                <div className="mb-2">
                                    <span>
                                        <input type="text" placeholder="Title" name="current_credit" maxLength={16} className="form-control" />
                                    </span>
                                </div>
                                <div className="input_group from-to s_ml-10">
                                    <div className="no-wrap flex-align">
                                        <div className='w_80'>
                                            <ReactDatePicker selected={startDate} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: "30%" }}>
                                <textarea style={{ width: "100%", minHeight: "100px" }} />
                            </div>
                            <div className="search-btn">
                                <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "95px", marginLeft: "0" }}>Save Message</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-align s_mt-10">
                        <p>Message List:</p>
                        <div className="input_group s_ml-10 flex-align">
                            <select name="report_type" id="report_type" className="form-control" style={{ padding: "6px 12px", height: "30px" }}>
                                <option value=""> Select Action</option>
                                <option value="deposit"> Cricket</option>
                                <option value="deposit"> Soccer</option>
                                <option value="deposit"> Tennis</option>
                            </select>
                        </div>
                        <div className="search-btn">
                            <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true) }}>Action</button>
                        </div>
                    </div>
                    <div className='my-account-section-content-table'>
                        <table id="resultTable" className="table01 margin-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Website</th>
                                    <th>Image</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>winx365.live</td>
                                    <td>657c65367045cd2527c9c341</td>
                                    <td>নোটিশ</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        </>
    )
}

export default AImageAdd