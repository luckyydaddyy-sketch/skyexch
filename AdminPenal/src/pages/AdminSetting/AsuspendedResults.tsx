import { useNavigate } from "react-router-dom"

function AsuspendedResults() {
    const navigate = useNavigate()
    return (
        <div className="container main_wrap">
            <div className="admin-setting">
                <div className="admin-setting-inner">
                    <h2>Suspended Result</h2>
                    <ul>
                        <li onClick={() => navigate("/AsuspendedfancyResult")}><a className="but_suspend asusfancyres"></a></li>
                        <li onClick={() => navigate("/AsuspendedmarketResult")}><a className="but_suspend asusmarketres"></a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AsuspendedResults