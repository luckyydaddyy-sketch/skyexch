import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { styleObjectBlackButton, styleObjectGetBG } from '../../common/StyleSeter';
import SearchInput from '../../components/SearchInput';

function ACasRiskMgmt() {
    const DD = useSelector((e: any) => e.domainDetails);

    return (
        <>
            <div className="container settings full-wrap" >
                <div className='top_header'>
                    <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
                        <h5>Casino Risk Management</h5>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                        <SearchInput hide placeholder="Enter UserId..." style={{ display: "inline-block" }} />
                        <input type="number" name="amount" step="0.01" value="" style={{
                            backgroundColor: "#fff",
                            width: "280px",
                            paddingLeft: "10px",
                            margin: "0 0 0 10px",
                            height: "32px",
                            border: "1px solid #aaa",
                            boxShadow: "inset 0 2px 0 rgba(0, 0, 0, 0.1019607843)",
                            borderRadius: "4px"
                        }} placeholder="0" />
                        <div className="search-btn"><button style={{ ...styleObjectGetBG(DD?.colorSchema, true), height: "30px" }}>Search</button></div>
                        <div className="search-btn"><button style={{ background: "teal", color: "white", height: "30px", width: "90px" }}>Export Excel</button></div>
                    </div>
                </div>
                <table className="table01 margin-table">
                    <thead>
                        <tr className="light-grey-bg">
                            <th> S No. </th>
                            <th> UserId </th>
                            <th> UserName </th>
                            <th> SourceId </th>
                            <th> Time </th>
                            <th> Game Code </th>
                            <th> Game Name </th>
                            <th> Market Name </th>
                            <th> Transaction Id </th>
                            <th> Stake </th>
                            <th> PL </th>
                        </tr>
                    </thead>
                    <tbody id="matches-table">
                        <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default ACasRiskMgmt