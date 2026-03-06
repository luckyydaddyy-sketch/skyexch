import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SimpleReactValidator from 'simple-react-validator'
import Cookies from 'universal-cookie'
import { ADMIN_API, USER_API } from '../common/common'
import { getImageUrl } from '../common/Funcation'
import { styleObjectBlackButton, styleObjectGetBG, styleObjectGetBGasColor } from '../common/StyleSeter'
import { getApiLink, notifyError, notifyMessage, postApi } from '../service'
import instagram from './../assets/icons/instagram.svg'
import mail from './../assets/icons/mail.svg'
import skype from './../assets/icons/skype.svg'
import telegram from './../assets/icons/telegram.svg'
import whatsapp from './../assets/icons/whatsapp.svg'
const cookies = new Cookies()
const ChangePassword = () => {
    const [, updateState] = React.useState({});
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const [formData, setFormData] = useState({
        newPassword: '',
        conformPassword: '',
        currentPassword: '',
    })
    const SocialIcon = [
        { iconStatus: true, link: '', image: mail, name: 'mail' },
        { iconStatus: true, link: '', image: whatsapp, name: 'whatsapp' },
        { iconStatus: true, link: '', image: telegram, name: 'telegram' },
        { iconStatus: true, link: '', image: skype, name: 'skype' },
        { iconStatus: true, link: '', image: instagram, name: 'instagram' }
    ]
    const SocialContact = ['+918888899999', '+918888897779', '+91888884399']
    const [confirmationCode,] = useState(Math.floor(1000 + Math.random() * 9000))
    const [isValidationWrong, setIsValidationWrong] = useState(false)
    const DD = useSelector((e: any) => e.domainDetails);

    const [isHover, setIsHover] = useState(false);
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };
    const handelInputChange = (e: any) => {
        const { name, value } = e.target
        setIsValidationWrong(false)
        setFormData({ ...formData, [name]: value })
    }
    const handelSubmit = async (e: any) => {
        e.preventDefault()
        if (Validator.current.allValid() && formData.newPassword === formData.conformPassword) {
            setIsValidationWrong(false)
            // const ipDetails = await getApiLink({
            //     api: "https://ipapi.co/json/?key=wfzfdfQ4cUsaTVURUkj2oF6L51Y4jNE0IM2yE0V2xMyMkxjTsr",
            // });
            // console.log("call ip:  ipDetails :", ipDetails);

            let data = {
                api: USER_API.CHANGE_PASSWORD,
                value: {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    conformPassword: formData.conformPassword,
                    // city: ipDetails?.data?.city,
                    // state: ipDetails?.data?.region,
                    // country: ipDetails?.data?.country_name,
                    // ISP: ipDetails?.data?.org
                },
                token: cookies.get('skyTokenFront')
            }
            await postApi(data).then(function (response) {

                cookies.set('skyTokenFront', response.data.data.token, { domain: process.env.REACT_APP_COOKIE_DOMAIN, path: '/' })

                notifyMessage('change password successfully')
                setTimeout(() => {
                    window.location.href = '/'
                }, 500);
                // navigate('/')


            }).catch(err => {
                notifyError(err.response.data.message)

                if (err.response.data.statusCode === 401) {
                    // Logout()
                    // navigate('/login')
                }
            })
            // if (loginData) {

            //     // dispatch({ type: 'HEADER_DETAILS', payload: HeaderData })
            //     // cookies.set('skyTokenFront', loginData.data.data.token, { domain: process.env.REACT_APP_COOKIE_DOMAIN, path: '/' })
            //     // dispatch({ type: 'AUTHENTICATION', payload: { isLogin: true, token: loginData.data.data.token } })
            // }

        } else {
            if (formData.newPassword !== formData.conformPassword) {
                notifyError('password not match')
            }
            Validator.current.showMessages();
            forceUpdate();
        }
    }
    const Validator = useRef(new SimpleReactValidator({
        autoForceUpdate: this,
    }))

    return (
        <div className='login_main changepass'>
            <div className='login_main_popup '
            // style={styleObjectGetBG(DD?.colorSchema)}
            >
                <div className='login_main_popup_wrp'>

                    <div className='login_main_popup_left '
                    // style={styleObjectGetBG(DD?.colorSchema)}
                    >
                        <ul>
                            <li>Password must have 8 to 15 alphanumeric without white space</li>
                            <li>Password cannot be the same as username/nickname</li>
                            <li>Must contain at least 1 capital letter, 1 small letter and 1 number</li>
                            <li>Password must not contain any special characters (!,@,#,etc..)</li>
                        </ul>
                    </div>
                    <div className='login_form_main'>
                        <h3 className="form_title"> Change Password </h3>
                        <form className='login_form' onSubmit={(e) => handelSubmit(e)}>
                            <InputGroup name='newPassword' value={formData.newPassword} type='password' onChange={handelInputChange} placeholder='New Password' errorValidation={Validator.current.message('newPassword', formData.newPassword, 'required')} />
                            <InputGroup name='conformPassword' value={formData.conformPassword} type="password" onChange={handelInputChange} placeholder='New Password Confirm' errorValidation={Validator.current.message('conformPassword', formData.conformPassword, 'required')} />
                            <InputGroup name='currentPassword' value={formData.currentPassword} type="password" onChange={handelInputChange} placeholder='Old Password' errorValidation={Validator.current.message('currentPassword', formData.currentPassword, 'required')} />

                            {isValidationWrong ? <span className="error" style={{ color: 'red' }}>invalid verification code</span> : ''}
                            <button type='submit' style={styleObjectGetBGasColor(DD?.colorSchema)} className='w-100 btn_black hover-border' onSubmit={(e) => handelSubmit(e)}>Change</button>
                        </form>
                    </div>
                </div>
                <div className="maintain-footer">
                    <img src={getImageUrl(DD?.logo)} alt="logo" />
                </div>
            </div>


            {/* <div className='login_footer'>
                <div className='login_footer_social'>
                    {SocialIcon.map((item) => <div className="social_icon">
                        <img src={item.image} alt={item.name} />
                    </div>)}
                </div>
                <div className="login_footer_contact">
                    {SocialContact.map((item) => (
                        <span>{item}</span>
                    ))}
                </div>
            </div> */}
        </div>
    )
}

export default ChangePassword

export const InputGroup = (props: any) => {
    const { type, placeholder, name, value, onChange, errorValidation } = props
    return (<div className='input_group'>
        <input type={type} name={name} value={value} onChange={(e) => onChange(e)} placeholder={placeholder} />
        {errorValidation ? <span className="error" style={{ color: 'red' }} >{errorValidation}</span> : ""}

    </div>)
}