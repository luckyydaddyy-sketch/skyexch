import SearchInput from "../../components/SearchInput"

function AdeletedBets() {
    return (
        <div className="container  settings main_wrap">
            <div className='top_header'>
                <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
                    <h5>Rejected Bets - Due to Unmatched Values</h5>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <SearchInput hide placeholder="Search..." style={{ display: "inline-block" }} />
                    <div className="search-btn"><button style={{ width: "80px" }}>Search</button></div>
                    <a className="btn-primary banking-btn" id="search">Old Match Page</a>
                </div>
            </div>
            <table className="table01 margin-table">
                <thead>
                    <tr className="light-grey-bg">
                        <th> Date </th>
                        <th> Name </th>
                        <th> Action	</th>
                    </tr>
                </thead>
                <tbody id="matches-table">
                    <tr>
                        <td>Cricket</td>
                        <td>32975952</td>
                        <td>1.224125101</td>
                    </tr>
                </tbody>
            </table>
            <table className="table01 margin-table">
                <thead>
                    <tr className="light-grey-bg">
                        <th> Sport </th>
                        <th> Match Name </th>
                        <th> Client	</th>
                        <th> Type </th>
                        <th> Selection </th>
                        <th> Odds </th>
                        <th> Stake </th>
                        <th> Place Time </th>
                        <th> IP </th>
                        <th> Pnl </th>
                        <th> Roll. </th>
                    </tr>
                </thead>
                <tbody id="matches-table">
                    <tr>
                        <td>Cricket</td>
                        <td>32975952</td>
                        <td>1.224125101</td>
                        <td>Pretoria Capitals v MI Cape Town</td>
                        <td>2024-02-01 21:00:00	</td>
                        <td>true</td>
                        <td>1.224125101</td>
                        <td>Pretoria Capitals v MI Cape Town</td>
                        <td>2024-02-01 21:00:00	</td>
                        <td>true</td>
                        <td>true</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default AdeletedBets