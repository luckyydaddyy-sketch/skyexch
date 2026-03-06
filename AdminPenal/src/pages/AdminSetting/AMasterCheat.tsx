import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import { useNavigate } from "react-router-dom";
import NewPagination from "../../components/new-pagination";

function AMasterCheat() {
    const nevigate = useNavigate()
    const DD = useSelector((e: any) => e.domainDetails);
    return (
        <>
            <div className='container '>
                <div className="top_header">
                    <div className="top_header_title mt-3">
                        <h5>Cheat Bets</h5>
                    </div>
                </div>
                {/* <div className='my-account-section-content'>
                    <div className='my-account-section-content-table'>
                        <table id="resultTable" className="table01 margin-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>User Name</th>
                                    <th>Multan Sultans</th>
                                    <th>Karachi Kings</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                    <td>--</td>
                                </tr>
                            </tbody>
                        </table>
                        <NewPagination />
                    </div>
                </div> */}
            </div >
        </>
    )
}

export default AMasterCheat