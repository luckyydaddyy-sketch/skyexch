import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import SearchInput from "../../components/SearchInput"

function P2PSetting() {
    const DD = useSelector((e: any) => e.domainDetails);
    const array = [
        "Set Auto Odds Min Max",
        "Set Other Market Min Max",
        "Set BookMaker Min Max",
        "Set Auto Fancy Min Max",
    ]
    return (
        <div className="container main_wrap" >
            <div className="admin-setting">
                <h4 style={{ background: "#000", fontSize: "16px", color: "white", padding: "10px" }}>Set P2P Settings</h4>
                <div className="admin-setting-inner" style={{ background: "lightblue" }}></div>

                <div className="admin-setting-inner">
                    <h4 className="mb-10">Set P2P Settings</h4>

                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", width: "20%" }}>
                            <label style={{ marginRight: "5px" }}>Daily Limit</label>
                            <input style={{ padding: "3px 5px" }} type="text" name="min" placeholder="0" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", width: "20%" }}>
                            <label style={{ marginRight: "5px" }}>Daily Limit </label>
                            <input style={{ padding: "3px 5px" }} type="text" name="min" placeholder="0" />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", width: "15%" }}>
                            <div className="form-check flex-align">
                                <input className="form-check-input" checked={false} name="rolling_delay" type="checkbox" role="switch" id="rolling_delay" />
                                <label className="form-check-label" style={{ marginLeft: "5px" }} htmlFor="rolling_delay">ON (P2P STATUS)</label>
                            </div>
                        </div>
                        <div className="search-btn mb-10">
                            <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "80px" }}>Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default P2PSetting