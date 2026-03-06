import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"

function AsameIpUsers() {
    const DD = useSelector((e: any) => e.domainDetails);
    return (
        <>
            <div className="container full-wrap">
                <div className="top_header">
                    <div className="top_header_title mt-3">
                        <h5>Multi login Ips</h5>
                    </div>
                    <div className="flex-align">
                        <div className="search-btn">
                            <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "80px", marginLeft: "0" }}>Cheater IP</button>
                        </div>
                    </div>
                </div>
                <div className='my-account-section-content'>
                    <div className='my-account-section-content-table'>
                        <table id="resultTable" className="table01 margin-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Id</th>
                                    <th>Count</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ width: "25%" }}>1</td>
                                    <td style={{ width: "25%" }}>104.28.208.84</td>
                                    <td style={{ width: "25%" }}>33</td>
                                    <td style={{ width: "25%" }}>
                                        <div className="search-btn s_mb-3">
                                            <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "125px" }}>Show Users</button>
                                        </div>
                                        <div className="search-btn">
                                            <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "125px" }}>Block Ip</button>
                                        </div>
                                    </td>
                                </tr>

                            </tbody>
                        </table>

                    </div>
                </div>
            </div >
        </>
    )
}

export default AsameIpUsers