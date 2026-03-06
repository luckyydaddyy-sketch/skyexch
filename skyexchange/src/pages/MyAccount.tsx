import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AccountStatement from '../components/Profile/AccountStatement';
import ActivityLog from '../components/Profile/ActivityLog';
import Profile from '../components/Profile/Profile';
import SkyPopup from '../components/SkyPopup';
import MyBet from '../components/Profile/MyBet';
import SimpleReactValidator from 'simple-react-validator';
import Input from '../components/Input';
import { ADMIN_API } from '../common/common';
import { postApi, notifyMessage, notifyError } from '../service';
import { styleObjectGetBG } from '../common/StyleSeter';

interface changePassInterface {
    password: string
    id: string
    status?: string
    newPassword: string
    confirmPassword: string
}

const MyAccount = () => {

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const DD = useSelector((e: any) => e.domainDetails);
    const HeaderData = useSelector((e: any) => e.Header);

    console.log('::::::;;', HeaderData);

    const Validator = useRef(new SimpleReactValidator({
        autoForceUpdate: this,
    }))
    const TYPE = 'player'
    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const navigate = useNavigate()
    let { tab } = useParams();
    const userId = HeaderData?._id
    const [changePassword, setChangePassword] = useState<changePassInterface>({
        password: '',
        id: userId ? userId : '',
        newPassword: '',
        confirmPassword: '',
    })

    const handleChangePasswordInput = (e: any) => {
        const { name, value } = e.target
        setChangePassword({
            ...changePassword,
            [name]: value
        })
    }

    const [OpenModal, setOpenModal] = useState<boolean>(false);
    const ShowPopUp = (item: any, type: string) => {
        setChangePassword({
            ...changePassword,
            id: item._id
        })
        setOpenModal(true);
    }

    const closePopup = () => {
        setOpenModal(false)
        setChangePassword({
            password: '', id: userId ? userId : '', newPassword: '', confirmPassword: '',
        })
        Validator.current.hideMessages()
    }

    const switchTab = (newTab: string, tab2: string) => {
        if (userId && TYPE) {
            navigate(`/user/${tab2}/`, { replace: true })
        } else {
            navigate(newTab)
        }
    }

    const submitChangePasswordForm = async (e: any) => {
        e.preventDefault()
        if (Validator.current.allValid()) {
            let data = {
                api: ADMIN_API.PLAYER_UPDATE_INFO,
                value: changePassword
            }
            await postApi(data).then(function (response) {
                setOpenModal(false)
                notifyMessage(response.data.message)
                closePopup()
            }).catch(err => {
                notifyError(err.response.data.message)
            })
        } else {
            Validator.current.showMessages();
            forceUpdate()
        }
    }

    return (
        <>
            <div className="container account">
                <div className='top_header'>
                    <div className='top_header_title align-items-center mt-3'>
                        <h5>Manage Profile</h5>
                    </div>
                </div>

                <div className="account_tabs">
                    <div className='account_tabs_l'>
                        <ul className="account_tabs_l_list">
                            <li className={`${tab === 'profile' || window.location.pathname === '/profile' ? "active" : ""} account_tabs_l_list_item`}>
                                <a style={tab === 'profile' || window.location.pathname === '/profile' ? styleObjectGetBG(DD?.colorSchema, true, true) : {}} onClick={() => switchTab('/profile', 'profile')}> Profile </a></li>
                            <li className={`${tab === 'account-statement' ? "active" : ""} account_tabs_l_list_item`}><a style={tab === 'account-statement' ? styleObjectGetBG(DD?.colorSchema, true, true) : {}} onClick={() => switchTab('/profile/account-statement', 'account-statement')}> Account Statement </a></li>
                            {userId && TYPE === 'player' && <>
                                <li className={`${tab === 'mybet' ? "active" : ""} account_tabs_l_list_item`}><a style={tab === 'mybet' ? styleObjectGetBG(DD?.colorSchema, true, true) : {}} onClick={() => switchTab('/profile/mybet', 'mybet')}> My Bet </a></li>
                                <li className={`${tab === 'bethistory' ? "active" : ""} account_tabs_l_list_item`}><a style={tab === 'bethistory' ? styleObjectGetBG(DD?.colorSchema, true, true) : {}} onClick={() => switchTab('/profile/bethistory', 'bethistory')}> Bet History </a></li>
                                <li className={`${tab === 'profitloss' ? "active" : ""} account_tabs_l_list_item`}><a style={tab === 'profitloss' ? styleObjectGetBG(DD?.colorSchema, true, true) : {}} onClick={() => switchTab('/profile/profitloss', 'profitloss')}> Profit Loss </a></li>
                            </>

                            }
                            <li className={`${tab === 'activity-log' ? "active" : ""} account_tabs_l_list_item `}><a style={tab === 'activity-log' ? styleObjectGetBG(DD?.colorSchema, true, true) : {}} onClick={() => switchTab('/profile/activity-log', 'activity-log')}> Activity Log </a></li>
                        </ul>
                    </div>
                    {(tab === 'profile' || window.location.pathname === '/profile') &&
                        <Profile TYPE={TYPE} ShowPopUp={ShowPopUp} userId={userId} />
                    }
                    {(tab === 'mybet' || tab === 'bethistory' || tab === 'profitloss') &&
                        <>
                            <div className='account_tabs_r'>
                            {/* <div className=''> */}
                                <div className='account_tabs_r_title'>
                                    <strong>Account Summary</strong>
                                </div>
                                <div className='account_tabs_r_bet d_flex'>
                                    <ul className="btn-group">
                                        <li className={`${tab === 'mybet' ? "active" : ""} btn btn btn-outline-secondary gray`} onClick={() => switchTab('/profile/mybet', 'mybet')}> Current Bets </li>
                                        <li className={`${tab === 'bethistory' ? "active" : ""} btn btn btn-outline-secondary gray`} onClick={() => switchTab('/profile/bethistory', 'bethistory')}> Bets History </li>
                                        <li className={`${tab === 'profitloss' ? "active" : ""} btn btn btn-outline-secondary gray`}
                                            onClick={() => switchTab('/profile/profitloss', 'profitloss')}
                                        > Profit & Loss </li>
                                    </ul>
                                </div>
                                <MyBet activeTab={tab} userId={userId} />
                            </div>
                        </>
                    }

                    {tab === 'account-statement' &&
                        <AccountStatement userId={userId} TYPE={TYPE} />
                    }

                    {tab === 'activity-log' &&
                        <ActivityLog userId={userId} TYPE={TYPE} />
                    }

                </div >
            </div >

            <SkyPopup
                title={`Update Password`}
                OpenModal={OpenModal}
                closeModel={closePopup}
                submit={submitChangePasswordForm}>

                <div>
                    <div className="modal-body">
                        <div className="d_flex">
                            <div className="fieldset">
                                <Input divClass='mb-2'
                                    label='New Password'
                                    value={changePassword.newPassword}
                                    errorValidation={Validator.current.message('New Password', changePassword.newPassword, 'required')}
                                    onChange={handleChangePasswordInput}
                                    type="password"
                                    name="newPassword"
                                    maxLength={16}
                                    className="form-control" />
                            </div>
                            <div className="fieldset">
                                <Input divClass='mb-2'
                                    label='Confirm Password'
                                    value={changePassword.confirmPassword}
                                    errorValidation={Validator.current.message('Confirm Password', changePassword.confirmPassword, `required|in:${changePassword.newPassword}`, { messages: { in: 'Passwords need to match!' } })}
                                    onChange={handleChangePasswordInput}
                                    type="password"
                                    name="confirmPassword"
                                    maxLength={16}
                                    className="form-control" />
                            </div>
                            <div className="fieldset full">
                                <Input divClass='mb-2'
                                    label='Password (Your Current Password)' errorValidation={Validator.current.message('Password', changePassword.password, 'required')}
                                    value={changePassword.password}
                                    onChange={handleChangePasswordInput}
                                    type="password"
                                    name="password"
                                    className="form-control" />
                            </div>
                        </div>
                    </div>
                </div>

            </SkyPopup>

        </>

    )
}

export default MyAccount