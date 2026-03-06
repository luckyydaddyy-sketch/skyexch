import React from 'react'

const Footer = () => {
    return (

        <div className="dashboard_footer footer_info">
            <div className="main_wrap">
                <ul className="action">
                    <li className="block_market">
                        <p>Block Market</p>
                    </li>
                    {/* <li className="bank">
                            <p>Bank</p>
                        </li> */}
                    <li className="p_l">
                        <p>Betting Profit &amp; Loss</p>
                    </li>
                    <li className="betting_history">
                        <p>Betting History</p>
                    </li>
                    <li className="profile">
                        <p>Profile</p>
                    </li>
                    <li className="status">
                        <p>Change Status</p>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Footer