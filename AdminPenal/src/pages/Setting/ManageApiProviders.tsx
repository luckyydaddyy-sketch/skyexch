import React, { useEffect, useState } from "react";
import { postApi, notifyError, notifyMessage } from "../../service";
import { ADMIN_API } from "../../common/common";
import Cookies from "universal-cookie";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import { useSelector } from "react-redux";

const cookies = new Cookies();

const ManageApiProviders = () => {
  const DD = useSelector((e: any) => e.domainDetails);
  const [activeSportsProvider, setActiveSportsProvider] = useState("FASTODDS");

  useEffect(() => {
    getProviderData();
  }, []);

  const getProviderData = async () => {
    let data = {
      api: ADMIN_API.SETTING.API_PROVIDER.GET,
      value: {},
      token: cookies.get("skyToken")
    };
    await postApi(data)
      .then((response: any) => {
        if (response.data.data.providerInfo) {
          setActiveSportsProvider(response.data.data.providerInfo.activeSportsProvider);
        }
      })
      .catch((err: any) => {
        if (err.response?.data?.statusCode === 401) {
          // handled natively by service/router
        }
      });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    let data = {
      api: ADMIN_API.SETTING.API_PROVIDER.UPDATE,
      value: {
        activeSportsProvider: activeSportsProvider,
      },
      token: cookies.get("skyToken")
    };
    await postApi(data)
      .then((response: any) => {
        notifyMessage(response.data.message || "API Provider updated successfully!");
        getProviderData();
      })
      .catch((err: any) => {
        notifyError(err.response?.data?.message || "Failed to update API Provider");
      });
  };

  return (
    <div className="container main_wrap">
      <div className="title-row">
        <h2 style={{ color: "#fff" }}>Manage Configuration (API Provider Gateway)</h2>
      </div>
      <div style={{ padding: "20px" }}>
        <form className="login_form" style={{ width: "100%", maxWidth: "800px", padding: "30px", background: "#f5f5f5", borderRadius: "10px" }} onSubmit={handleUpdate}>
          <div className="form-group" style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", marginBottom: "15px", fontWeight: "bold", fontSize: "16px" }}>Select Active Sports Data Provider</label>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>Changes take effect within seconds. Ensures high availability by allowing seamless fallback if a provider goes offline.</p>
            <div style={{ display: "flex", gap: "30px", marginBottom: "15px", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "#fff", padding: "15px 20px", borderRadius: "8px", border: activeSportsProvider === "FASTODDS" ? "2px solid #28a745" : "1px solid #ddd", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", width: "250px" }}>
                    <input 
                        type="radio" 
                        name="sportsProvider" 
                        value="FASTODDS" 
                        checked={activeSportsProvider === "FASTODDS"}
                        onChange={(e) => setActiveSportsProvider(e.target.value)}
                        style={{ transform: "scale(1.3)" }}
                    />
                    <div>
                        <div style={{ fontWeight: "bold" }}>FastOdds API</div>
                        <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>Active & Connected</div>
                    </div>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "#fefefe", padding: "15px 20px", borderRadius: "8px", border: activeSportsProvider === "NINE_WICKET" ? "2px solid #28a745" : "1px solid #ddd", width: "250px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <input 
                        type="radio" 
                        name="sportsProvider" 
                        value="NINE_WICKET"
                        checked={activeSportsProvider === "NINE_WICKET"}
                        onChange={(e) => setActiveSportsProvider(e.target.value)}
                        style={{ transform: "scale(1.3)" }}
                    />
                    <div>
                        <div style={{ fontWeight: "bold" }}>9Wicket API</div>
                        <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>Active & Connected</div>
                    </div>
                </label>
            </div>
          </div>

          <div className="account_tabs_filter d_flex justify-start">
            <input
              style={{
                ...styleObjectBlackButton(DD?.colorSchema, true),
                fontSize: "15px",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                border: "none"
              }}
              type="submit"
              value="Save Provider Gateway"
              className="btn btn-default-customize"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageApiProviders;
