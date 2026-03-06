import { useNavigate } from "react-router-dom"

function AWebsiteSetting() {
    const nevigate = useNavigate()
    return (
        <div className="container main_wrap">
            <div className="admin-setting">
                <div className="admin-setting-inner">
                    <h2>Manage Website Settings</h2>
                    <ul>
                        <li onClick={() => nevigate("/AAddWebsiteSetting")}><a className="but_suspend addweb"></a></li>
                        <li onClick={() => nevigate("/AManageLinks")}><a className="but_suspend managelinks"></a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AWebsiteSetting