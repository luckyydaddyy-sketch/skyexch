// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import SkyPopup from '../../components/SkyPopup';
import BetHistory from '../../components/Profile/BetHistory';
import MyBet from '../../components/Profile/MyBet';
import ReactDatePicker from 'react-datepicker';
import { styleObjectBlackButton } from '../../common/StyleSeter';

const MyAccount = () => {
    const [startDate, setStartDate] = useState(new Date());

    const getDate = () => {
        const today = new Date();
        let endDate = new Date();
        endDate.setDate(today.getDate() - 7);

        return {
            today, endDate
        }
    }

    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const DD = useSelector((e: any) => e.domainDetails);
    const [isHover, setIsHover] = useState(false);
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };
    const [didLoad, setDidLoad] = useState<boolean>(false);
    const [OpenModal, setOpenModal] = useState<boolean>(false);
    const ShowPopUp = (item: object, type: string) => {
        setOpenModal(true);
    }
    const [activeTab, setActiveTab] = useState('mybet')

    return (
        <>
            <div className="container account">
                <div className='top_header'>
                    <div className='top_header_title mt-3'>
                        <h5><strong className="">galaxy [Galaxy ]</strong> Manage Profile</h5>
                    </div>
                </div>

                <div className="account_tabs">
                    <div className='account_tabs_l'>
                        <ul className="account_tabs_l_list">
                            <li className={`${activeTab === 'profile' ? "active" : ""} account_tabs_l_list_item`}>
                                <a onClick={() => setActiveTab('profile')}> Profile </a></li>
                            <li className={`${activeTab === 'statement' ? "active" : ""} account_tabs_l_list_item`}><a onClick={() => setActiveTab('statement')}> Account Statement </a></li>
                            <li className={`${activeTab === 'mybet' ? "active" : ""} account_tabs_l_list_item`}><a onClick={() => setActiveTab('mybet')}> My Bet </a></li>
                            <li className={`${activeTab === 'bethistory' ? "active" : ""} account_tabs_l_list_item`}><a onClick={() => setActiveTab('bethistory')}> Bet History </a></li>
                            <li className={`${activeTab === 'activitylog' ? "active" : ""} account_tabs_l_list_item`}><a onClick={() => setActiveTab('activitylog')}> Activity Log </a></li>
                        </ul>
                    </div>
                    {activeTab === 'profile' &&
                        <div className='account_tabs_r'>
                            <div className='account_tabs_r_title'>
                                <strong>Account Summary</strong>
                            </div>
                            <div className='table-responsive'>
                                <table className="table01 margin-table">
                                    <tbody>
                                        <tr>
                                            <th className="light-grey-bg">Wallet</th>
                                            <th className="light-grey-bg">Funds available to withdraw</th>
                                        </tr>
                                        <tr>
                                            <td> Main wallet</td>
                                            <td className="text-success"> 98220306.71 </td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>

                            <div className='d_flex account_tabs_r_d'>
                                <div className='account_tabs_r_d_l'>
                                    <div className='d_flex account_tabs_r_d_l_item_wrp'>
                                        <div className='account_tabs_r_d_l_item'>
                                            <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>About You</h5>
                                            <div>
                                                <table className="w-100 table">
                                                    <tbody><tr>
                                                        <td width="50%">First Name</td>
                                                        <td>Galaxy</td>
                                                    </tr>
                                                        <tr>
                                                            <td width="50%">Last Name</td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Username</td>
                                                            <td>galaxy</td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Password</td>
                                                            <td>******
                                                                <a onClick={(e) => ShowPopUp(e, 'addplayer')}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z" /></svg></a>
                                                            </td>
                                                        </tr>
                                                    </tbody></table>
                                            </div>
                                        </div>
                                        <div className='account_tabs_r_d_l_item'>
                                            <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Address</h5>
                                            <div>
                                                <table className="w-100 table">
                                                    <tbody>
                                                        <tr>
                                                            <td width="50%">Address</td>
                                                            <td>-</td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Town/City</td>
                                                            <td>-</td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Country</td>
                                                            <td>-</td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Country/State</td>
                                                            <td>-</td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Postcode</td>
                                                            <td>-</td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Timezone</td>
                                                            <td>IST</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='account_tabs_r_d_l right'>
                                    <div className='d_flex account_tabs_r_d_l_item_wrp'>
                                        <div className='account_tabs_r_d_l_item'>
                                            <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Contact Details</h5>
                                            <div>
                                                <table className="w-100 table">
                                                    <tbody><tr>
                                                        <td width="50%">Primary number</td>
                                                        <td>-</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className='account_tabs_r_d_l_item'>
                                            <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Address</h5>
                                            <div>
                                                <table className="w-100 table">
                                                    <tbody>
                                                        <tr>
                                                            <td width="50%">Currency</td>
                                                            <td>PTH</td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%">Odds Format	</td>
                                                            <td>-</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className='account_tabs_r_d_l_item'>
                                            <h5 className='account_tabs_r_d_l_item-header bg-card-header text-white'>Commission</h5>
                                            <div>
                                                <table className="w-100 table">
                                                    <tbody>
                                                        <tr>
                                                            <td width="50%">Commission</td>
                                                            <td>0%</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {(activeTab === 'mybet' || activeTab === 'bethistory') &&
                        <>
                            <div className='account_tabs_r'>
                                <div className='account_tabs_r_title'>
                                    <strong>Account Summary</strong>
                                </div>
                                <div className='account_tabs_r_bet d_flex'>
                                    <ul className="btn-group">
                                        <li className={`${activeTab === 'mybet' ? "active" : ""} btn btn btn-outline-secondary gray`} onClick={() => setActiveTab('mybet')}> Current Bets </li>
                                        <li className={`${activeTab === 'bethistory' ? "active" : ""} btn btn btn-outline-secondary gray`} onClick={() => setActiveTab('bethistory')}> Bets History </li>
                                    </ul>
                                </div>
                                <MyBet activeTab={activeTab} />
                            </div>
                        </>
                    }

                    {activeTab === 'statement' &&
                        <div className='account_tabs_r'>
                            <div className='account_tabs_r_title mb-15'>
                                <strong>Account Statement</strong>
                            </div>

                            <div className='account_tabs_filter d_flex'>
                                <div className="account_tabs_filter_item">
                                    <label> From: </label>
                                    <div className='input_group'>
                                        <div className='w_80'>
                                            <ReactDatePicker selected={getDate().today} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />
                                        </div>
                                        {/* <input type="date" name="from_date" className="form-control hasDatepicker" placeholder="08-09-2022" value="" /> */}
                                        <span className='input-group-text p-0 ps-3 pe-3'> 09:00 </span>
                                    </div>
                                </div>

                                <div className="account_tabs_filter_item">
                                    <label> To: </label>
                                    <div className='input_group'>
                                        <div className='w_80'>
                                            <ReactDatePicker selected={getDate().endDate} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />
                                        </div>
                                        {/* <input type="date" name="from_date" className="form-control hasDatepicker" placeholder="08-09-2022" value="" /> */}
                                        <span className='input-group-text p-0 ps-3 pe-3'> 09:00 </span>
                                    </div>
                                </div>

                                <div className="account_tabs_filter_item">
                                    <label> Report Type:  </label>
                                    <select name="report_type" id="report_type" className="form-control">
                                        <option value="0"> All</option>
                                        <option value="1"> Deposit/Withdraw Report</option>
                                        <option value="2"> Game Report</option>
                                    </select>
                                </div>

                                <div className="account_tabs_filter_item">
                                    <label> &nbsp; </label>
                                    <input onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, isHover)} type="button" value="Submit" name="acntbtn" className="submit-btn btn_black p-2" />
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table id="resultTable" className="table01 margin-table account-statement">
                                    <thead>
                                        <tr>
                                            <th className="light-grey-bg">Sr no</th>
                                            <th className="light-grey-bg">Date/Time</th>
                                            <th className="light-grey-bg">Credit</th>
                                            <th className="light-grey-bg">Debit</th>
                                            <th className="light-grey-bg">Balance</th>
                                            <th className="light-grey-bg">Remark</th>
                                            <th className="light-grey-bg">From/To</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbdata"><tr>
                                        <td style={{ width: "110px" }} >0</td>
                                        <td style={{ width: "150px" }} >26-08-22 14:45</td>
                                        <td style={{ width: "110px" }} className="text-success">0</td>
                                        <td style={{ width: "110px" }} className="text-danger">0</td>
                                        <td>98220806.71</td>
                                        <td>Opening Balance</td>
                                        <td>-</td>
                                    </tr>

                                        <tr> <td colSpan={7}> </td> </tr>


                                    </tbody>
                                </table><nav>
                                    <ul className="pagination">
                                        <li className="page-item disabled" aria-disabled="true" aria-label="« Previous">
                                            <span className="page-link" aria-hidden="true">‹</span>
                                        </li>
                                        <li className="page-item active" aria-current="page"><span className="page-link">1</span></li>
                                        <li className="page-item"><a className="page-link" href="">2</a></li>
                                        <li className="page-item"><a className="page-link" href="">3</a></li>
                                        <li className="page-item"><a className="page-link" href="">4</a></li>
                                        <li className="page-item"><a className="page-link" href="">5</a></li>
                                        <li className="page-item"><a className="page-link" href="">6</a></li>
                                        <li className="page-item"><a className="page-link" href="">7</a></li>
                                        <li className="page-item"><a className="page-link" href="">8</a></li>
                                        <li className="page-item">
                                            <a className="page-link" href="" rel="next" aria-label="Next »">›</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    }

                    {activeTab === 'activitylog' &&
                        <div className='account_tabs_r'>
                            <h2 className='mb-15'>
                                <strong>Activity Log</strong>
                            </h2>
                            <div className='table-responsive'>
                                <table id="resultTable" className="table01 margin-table">
                                    <thead>
                                        <tr>
                                            <th>Sr no</th>
                                            <th>Date/Time</th>
                                            <th>Action</th>
                                            <th>IP Address</th>
                                            <th>Browser</th>
                                            <th>OS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>07-09-2022 11:03 PM</td>
                                            <td>Login</td>
                                            <td>1.38.164.66</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-105.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>07-09-2022 09:33 PM</td>
                                            <td>Login</td>
                                            <td>49.36.91.62</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-106.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>06-09-2022 11:07 PM</td>
                                            <td>Login</td>
                                            <td>1.38.164.29</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-105.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>4</td>
                                            <td>06-09-2022 09:34 PM</td>
                                            <td>Login</td>
                                            <td>49.36.93.188</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-106.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>5</td>
                                            <td>06-09-2022 03:20 PM</td>
                                            <td>Login</td>
                                            <td>122.169.113.25</td>
                                            <td>Google Chrome</td>
                                            <td>mac V-104.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>6</td>
                                            <td>06-09-2022 12:17 PM</td>
                                            <td>Login</td>
                                            <td>110.226.124.32</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-105.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>7</td>
                                            <td>06-09-2022 11:08 AM</td>
                                            <td>Login</td>
                                            <td>122.169.113.25</td>
                                            <td>Google Chrome</td>
                                            <td>mac V-104.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>8</td>
                                            <td>05-09-2022 10:31 PM</td>
                                            <td>Login</td>
                                            <td>49.36.93.88</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-106.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>9</td>
                                            <td>05-09-2022 10:31 PM</td>
                                            <td>Login</td>
                                            <td>1.38.166.149</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-105.0.0.0</td>
                                        </tr>
                                        <tr>
                                            <td>10</td>
                                            <td>05-09-2022 05:28 PM</td>
                                            <td>Login</td>
                                            <td>110.226.124.32</td>
                                            <td>Google Chrome</td>
                                            <td>windows V-105.0.0.0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <nav>
                                <ul className="pagination">
                                    <li className="page-item disabled" aria-disabled="true" aria-label="« Previous">
                                        <span className="page-link" aria-hidden="true">‹</span>
                                    </li>
                                    <li className="page-item active" aria-current="page"><span className="page-link">1</span></li>
                                    <li className="page-item"><a className="page-link" href="">2</a></li>
                                    <li className="page-item"><a className="page-link" href="">3</a></li>
                                    <li className="page-item"><a className="page-link" href="">4</a></li>
                                    <li className="page-item"><a className="page-link" href="">5</a></li>
                                    <li className="page-item"><a className="page-link" href="">6</a></li>
                                    <li className="page-item"><a className="page-link" href="">7</a></li>
                                    <li className="page-item"><a className="page-link" href="">8</a></li>
                                    <li className="page-item">
                                        <a className="page-link" href="" rel="next" aria-label="Next »">›</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    }

                </div>
            </div >

            <SkyPopup
                title={`Update Password`}
                OpenModal={OpenModal}
                closeModel={() => setOpenModal(false)} >

                <div>
                    <input type="hidden" name="_token" />
                    <input type="hidden" name="user_id" id="user_id" value="133" />
                    <div className="modal-body">
                        <div className="d_flex">
                            <div className="fieldset">
                                <div className="mb-2">
                                    <span>New Password</span>
                                    <span>
                                        <input type="password" name="new_passwordt" maxLength={16} className="form-control" />
                                    </span>
                                </div>
                            </div>
                            <div className="fieldset">
                                <div className="mb-2">
                                    <span>Confirm Password</span>
                                    <span>
                                        <input type="password" name="confirm_password" maxLength={16} className="form-control" /></span>
                                </div>
                            </div>
                            <div className="fieldset full">
                                <div className="mb-2">
                                    <span> Password (Your Current Password) </span>
                                    <span>
                                        <input type="password" name="password" className="form-control" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </SkyPopup>

        </>

    )
}

export default MyAccount