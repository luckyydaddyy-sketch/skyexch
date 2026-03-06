import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import { useNavigate } from "react-router-dom";
import NewPagination from "../../components/new-pagination";

function ACheatIps() {
    const nevigate = useNavigate()
    const DD = useSelector((e: any) => e.domainDetails);
    return (
        <>
            <div className='container '>
                <div className="top_header">
                    <div className="top_header_title mt-3">
                        <h5>Cheat Ips</h5>
                    </div>
                    <div className="flex-align justify-end">
                        <div className="search-btn">
                            <button onClick={() => nevigate("/Prematchuserbet")} style={{...styleObjectBlackButton(DD?.colorSchema, true), width: "100px"}}>Blocked Ips</button>
                        </div>
                    </div>
                </div>
                <div className='my-account-section-content'>
                    <div className='my-account-section-content-table'>
                        <table id="resultTable" className="table01 margin-table padding-6">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>
                                        <div className="search-btn">
                                            <button onClick={() => nevigate("/Prematchuserbet")} style={{...styleObjectBlackButton(DD?.colorSchema, true), width: "80px"}}>Block</button>
                                        </div>
                                    </th>
                                    <th>Ip Address</th>
                                    <th>
                                        <div className="search-btn">
                                            <button onClick={() => nevigate("/Prematchuserbet")} style={{...styleObjectBlackButton(DD?.colorSchema, true), width: "80px"}}>Show</button>
                                        </div>
                                    </th>
                                    <th>User Id</th>
                                    <th>Show Bets</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                </tr>
                            </tbody>
                        </table>
                        {/* <NewPagination /> */}
                    </div>
                </div>
            </div >
        </>
    )
}

export default ACheatIps