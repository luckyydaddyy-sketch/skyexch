import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { styleObjectBlackButton } from '../../common/StyleSeter';
import { useState } from 'react';

function Ariskmanagement() {
    const DD = useSelector((e: any) => e.domainDetails);
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { label: "Top 20 Matched Amount Player" },
        { label: "Top 20 Exposure Player" }
    ]
    const tabChanges = (index: any) => {
        setActiveTab(index);
    }
    return (
        <>
            <div className="container settings main_wrap" >
                <h2 className="mb-10" style={{ padding: "15px 15px 0 15px", color: "#243a48" }}>Risk Management Summary</h2>

                <div className="container">
                    <div className="admin-setting">
                        <div className="admin-setting-inner flex-align s_pb-10">
                            <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true, true), width: "100px" }}>Cricket</button></div>
                            <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true, true), width: "100px" }}>Tennis</button></div>
                            <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true, true), width: "100px" }}>Soccer</button></div>
                            <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true, true), width: "100px" }}>All</button></div>
                            <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true, true), width: "100px" }}>Cas. Risk Mgmt</button></div>
                        </div>
                    </div>
                </div>
                <div className="tab-container">
                    <div className="tabs">
                        <ul className="button-container flex-align">
                            {tabs.map((tab, index) => (
                                <li
                                    key={index}
                                    className={`tablink exposure-button ${activeTab === index ? "active active-class" : ""}`}
                                    onClick={() => tabChanges(index)}
                                >
                                    {tab.label}
                                </li>
                            ))}
                        </ul>
                        <div className="flex-align risk-table">
                            <table className="table01 margin-table s_mb-0">
                                <thead>
                                    <tr>
                                        <th> UID </th>
                                        <th> Exposure </th>
                                        <th> Matched Amount	</th>
                                    </tr>
                                </thead>
                                <tbody id="matches-table">
                                    <tr>
                                        <td><span className="spann-order">1</span>fuuuuu</td>
                                        <td>fuuuuu</td>
                                        <td>fuuuuu</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="table01 margin-table s_mb-0">
                                <thead>
                                    <tr>
                                        <th> UID </th>
                                        <th> Exposure </th>
                                        <th> Matched Amount	</th>
                                    </tr>
                                </thead>
                                <tbody id="matches-table">
                                    <tr>
                                        <td><span className="spann-order">1</span>fuuuuu</td>
                                        <td>fuuuuu</td>
                                        <td>fuuuuu</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Ariskmanagement