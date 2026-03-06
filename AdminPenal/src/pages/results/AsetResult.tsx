import { useNavigate } from 'react-router-dom';

function AsetResult() {
    const navigate = useNavigate()

    return (
        <>
            <div className="container main_wrap">
                <div className="admin-setting">
                    <div className="admin-setting-inner">
                        <h2>Set Result</h2>
                        <ul>
                            <li onClick={() => navigate("/ASetFancyResult")}><a className="but_suspend asetfancyres"></a></li>
                            <li onClick={() => navigate("/ASetMarketResult")}><a className="but_suspend asetmarketres"></a></li>
                        </ul>
                    </div>
                    <div className="admin-setting-inner">
                        <h2>Set Result Premium</h2>
                        <ul>
                            <li onClick={() => navigate("/cricket/premium/declare")}><a className="but_suspend aactivematch"></a></li>
                            <li onClick={() => navigate("/cricket/premium/history")}><a className="but_suspend aupdatePremiumstatus"></a></li>
                        </ul>
                    </div>
                    <div className="admin-setting-inner">
                        <h2>Fancy Result</h2>
                        <ul>
                            <li onClick={() => navigate("/session/cricket/history")}><a className="but_suspend aupdatestatus"></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
export default AsetResult