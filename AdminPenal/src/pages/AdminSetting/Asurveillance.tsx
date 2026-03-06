import { useNavigate } from "react-router-dom"
import SearchInput from "../../components/SearchInput"

function Asurveillance() {
    const navigate = useNavigate()
    return (
        <div className="container main_wrap">
            <div className="admin-setting">
                <div className="admin-setting-inner">
                    <h2>General Settings</h2>
                    <ul>
                        <li onClick={() => navigate("/AliveMatchbets")}><a className="but_suspend alivematchbet"></a></li>
                        <li onClick={() => navigate("/AbetLockUsers")}><a className="but_suspend abetlockuser"></a></li>
                        <li onClick={() => navigate("/AbetCount")}><a className="but_suspend abetcount"></a></li>
                        <li onClick={() => navigate("/monitorUserPnL")}><a className="but_suspend userpl"></a></li>
                        <li onClick={() => navigate("/Prematchpl")}><a className="but_suspend prematchpl"></a></li>
                        <li onClick={() => navigate("/AsameIpUsers")}><a className="but_suspend duplicateip"></a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Asurveillance