import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import SimpleReactValidator from 'simple-react-validator';
import { USER_API } from '../common/common';
import { styleObjectWhiteButton } from '../common/StyleSeter'
import copyIcon from '../assets/images/copy.png'
// import ImageUpload from '../components/ImageUpload';
import { getApi, notifyError, notifyMessage, postApi } from '../service';
import moment from 'moment';

const DepositWithdraw = () => {
    const DD = useSelector((e: any) => e.domainDetails);
    const [pageData, setPageData] = useState<any>({})

    const [, updateState] = React.useState({});
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const [firstTabSelected, setFirstTabSelected] = React.useState('deposit')
    const [secondTabSelected, setSecondTabSelected] = React.useState('bank')

    const [methods, setMethods] = useState<any>([])

    const [depositForm, setDepositForm] = useState({
        userName: '',
        mobileNo: '',
        transactionId: '',
        amount: '',
        image: '',
    })

    const [withdrawForm, setWithdrawForm] = useState({
        accountNo: '',
        holderName: '',
        ifscCode: '',
        bankName: '',
        mobileNo: '',
        amount: '',
        userName: '',
        descrpitions: '',

    })
    const balanceData = useSelector((e: any) => e.balance);
    const [balance, setBalance] = useState(balanceData)
    useEffect(() => {
        setBalance(balanceData)

        return () => { }
    }, [balanceData])

    useEffect(() => {
        getMethods()
        tableData()
        return () => { }
    }, [])
    const Validator = useRef(new SimpleReactValidator({
        autoForceUpdate: this,
    }))
    const BankValidator = useRef(new SimpleReactValidator({
        autoForceUpdate: this,
    }))
    const UpiValidator = useRef(new SimpleReactValidator({
        autoForceUpdate: this,
    }))
    
    useEffect(() => {
        tableData()
        return () => { }
    }, [firstTabSelected])


    const tableData = () => {
        const data = {
            api: firstTabSelected === "deposit" ? USER_API.GET_DEPOSIT_REQUEST : USER_API.GET_WITHDRAWAL_REQUEST,
            value: '',
        }
        getApi(data).then(function (response: any) {
            console.log(response.data.data, 'methods')
            setPageData(response.data.data)
        }).catch((err: any) => {
            debugger
            console.log(err);
            notifyError(err.response.data.message)
            if (err.response.data.statusCode === 401) {

            }
        })
    }

    useEffect(() => {
        Validator.current.purgeFields();
    }, [firstTabSelected, secondTabSelected])


    const getMethods = async () => {
        const finalData = {
            api: USER_API.GET_METHOD,
            value: '',
        }
        await getApi(finalData).then(function (response: any) {
            console.log(response.data.data, 'methods')

            setMethods(response.data.data)

        }).catch((err: any) => {
            debugger
            console.log(err);
            notifyError(err.response.data.message)
            if (err.response.data.statusCode === 401) {

            }
        })
    }

    const onDepositSubmit = async (e: any) => {
        e.preventDefault();
        if (Validator.current.allValid()) {

            const data = new FormData()
            data.append('userName', depositForm.userName)
            data.append('mobileNo', depositForm.mobileNo)
            data.append('transactionId', depositForm.transactionId)
            data.append('amount', depositForm.amount)
            data.append('image', depositForm.image)

            const finalData = {
                api: USER_API.ADD_DEPOSIT,
                value: data,
            }
            await postApi(finalData).then(function (response: any) {
                console.log(response)
                notifyMessage(response.data.message)
                setDepositForm({
                    userName: '',
                    mobileNo: '',
                    transactionId: '',
                    amount: '',
                    image: '',
                })

            }).catch((err: any) => {
                debugger
                console.log(err);
                notifyError(err.response.data.message)
                if (err.response.data.statusCode === 401) {

                }
            })


        } else {
            Validator.current.showMessages();
            forceUpdate();
        }
    }

    const onWithdrawSubmit = async (e: any) => {
        e.preventDefault();
        if (secondTabSelected === 'bank' && BankValidator.current.allValid()) {
            const data = {
                type: secondTabSelected,
                accountNo: withdrawForm.accountNo,
                holderName: withdrawForm.holderName,
                userName: withdrawForm.holderName,
                ifscCode: withdrawForm.ifscCode,
                bankName: withdrawForm.bankName,
                mobileNo: withdrawForm.mobileNo,
                amount: withdrawForm.amount,
                descrpitions: withdrawForm.descrpitions,
            }
            const finalData = {
                api: USER_API.ADD_WITHDRAW,
                value: data,
            }
            await postApi(finalData).then(function (response: any) {
                console.log(response)
                notifyMessage(response.data.message)

            }).catch((err: any) => {
                debugger
                console.log(err);
                notifyError(err.response.data.message)
                if (err.response.data.statusCode === 401) {

                }
            })
        } else if ((secondTabSelected === 'upi' || secondTabSelected === 'google pay' || secondTabSelected === 'phone pay') && UpiValidator.current.allValid()) {
            const data = {
                type: secondTabSelected,
                userName: withdrawForm.userName,
                mobileNo: withdrawForm.mobileNo,
                accountNo: withdrawForm.accountNo,
                amount: withdrawForm.amount,
            }
            const finalData = {
                api: USER_API.ADD_WITHDRAW,
                value: data,
            }
            await postApi(finalData).then(function (response: any) {
                console.log(response)
                notifyMessage(response.data.message)
            }).catch((err: any) => {
                debugger
                console.log(err);
                notifyError(err.response.data.message)
                if (err.response.data.statusCode === 401) {

                }
            })
        }
        else {
            if (secondTabSelected === 'bank') {
                BankValidator.current.showMessages();
            } else {
                UpiValidator.current.showMessages();
            }
            forceUpdate();
        }
    }

    const handleDepositForm = (e: any) => {
        setDepositForm({ ...depositForm, [e.target.name]: e.target.value })
    }
    const handleWithdrawForm = (e: any) => {
        setWithdrawForm({ ...withdrawForm, [e.target.name]: e.target.value })
    }


    const handleImageUpload = (value: any, name: string) => {
        const file = value.target.files[0]
        setDepositForm({ ...depositForm, [name]: file })
    }


    return (
        <div className="container home">
            <div className='home_wrp'>
                <div className='topTabs'>
                    <div className='first_tabs'>
                        <button style={firstTabSelected === "deposit" ? styleObjectWhiteButton(DD?.colorSchema, true) : {}} onClick={() => setFirstTabSelected('deposit')}>Deposit</button>
                        <button style={firstTabSelected === "withdraw" ? styleObjectWhiteButton(DD?.colorSchema, true) : {}} onClick={() => setFirstTabSelected('withdraw')}>Withdraw</button>
                    </div>

                    <div className='second_tabs'>
                        <button onClick={() => setSecondTabSelected('bank')} style={secondTabSelected === 'bank' ? styleObjectWhiteButton(DD?.colorSchema, true) : {}}>Bank Transfer</button>
                        <button onClick={() => setSecondTabSelected('upi')} style={secondTabSelected === 'upi' ? styleObjectWhiteButton(DD?.colorSchema, true) : {}}>UPI</button>
                        <button onClick={() => setSecondTabSelected('google pay')} style={secondTabSelected === 'google pay' ? styleObjectWhiteButton(DD?.colorSchema, true) : {}}>Google Pay</button>
                        <button onClick={() => setSecondTabSelected('phone pay')} style={secondTabSelected === 'phone pay' ? styleObjectWhiteButton(DD?.colorSchema, true) : {}}>Phone Pay</button>
                    </div>

                    {firstTabSelected === "deposit" ?
                        <div className='first_tab_content'>
                            <div className='tab_view'>
                                <form action="" className='tab_form'>
                                    <InputGroup type='text' placeholder='User/Login ID' name='userName' value={depositForm.userName} onChange={(e: any) => handleDepositForm(e)} errorValidation={Validator.current.message('userName', depositForm.userName, 'required')} />
                                    <InputGroup type='number' placeholder='Mobile' name='mobileNo' value={depositForm.mobileNo} onChange={(e: any) => handleDepositForm(e)} errorValidation={Validator.current.message('mobileNo', depositForm.mobileNo, 'required|phone')} />
                                    <InputGroup type='text' placeholder='Transaction Id' name='transactionId' value={depositForm.transactionId} onChange={(e: any) => handleDepositForm(e)} errorValidation={Validator.current.message('transactionId', depositForm.transactionId, 'required')} />
                                    <InputGroup type='text' placeholder='Amount' name='amount' value={depositForm.amount} onChange={(e: any) => handleDepositForm(e)} errorValidation={Validator.current.message('amount', depositForm.amount, 'required|numeric')} />

                                    {/* <div className='document_view'>
                                        Upload Payment Screenshot
                                        <input type="file" name="file" id="file" className="inputfile" />
                                    </div> */}
                                    <ImageUpload label='NO_LABEL' filename={depositForm.image} name='image' setFileName={handleImageUpload} />
                                    <div className='form_button'>
                                        <button className='cancel_btn form_btn' onClick={(e) => window.location.reload()}>Cancel</button>
                                        <button className='submit_btn form_btn' onClick={(e) => onDepositSubmit(e)}>Submit</button>
                                    </div>
                                </form>
                            </div>
                            <div className='tab_view'>
                                <div className='tab_item'>
                                    {
                                        methods && methods?.data?.length > 0 && methods?.data?.map((item: any, index: number) => {
                                            if (item.type !== secondTabSelected) {
                                                return null
                                            }
                                            return (
                                                <div key={index} className='tab_item_inner'>
                                                    <div className='tab_item_inner_left'>
                                                        <span> Name : <b>{item.name}</b> </span>
                                                        <button onClick={(e) => { navigator.clipboard.writeText(item.name); notifyMessage('Copy successfully') }}>
                                                            <img src={copyIcon} alt="" width={20} height={20} />
                                                        </button>
                                                    </div>
                                                    <div className='tab_item_inner_left'>
                                                        <span> Account No : <b>{item.accountNo}</b> </span>
                                                        <button onClick={(e) => { navigator.clipboard.writeText(item.accountNo); notifyMessage('Copy successfully') }}>
                                                            <img src={copyIcon} alt="" width={20} height={20} />
                                                        </button>
                                                    </div>
                                                    <div className='tab_item_inner_left'>
                                                        <span> Holder Name : <b>{item.holderName}</b> </span>
                                                        <button onClick={(e) => { navigator.clipboard.writeText(item.holderName); notifyMessage('Copy successfully') }}>
                                                            <img src={copyIcon} alt="" width={20} height={20} />
                                                        </button>
                                                    </div>
                                                    <div className='tab_item_inner_left'>
                                                        <span> IFSC Code : <b>{item.ifscCode}</b> </span>
                                                        <button onClick={(e) => { navigator.clipboard.writeText(item.ifscCode); notifyMessage('Copy successfully') }}>
                                                            <img src={copyIcon} alt="" width={20} height={20} />
                                                        </button>
                                                    </div>
                                                    {/* <div className='tab_item_inner_right'>
                                                        <button onClick={(e) => { navigator.clipboard.writeText(item.accountNo); notifyMessage('Copy successfully') }}>
                                                            <img src={copyIcon} alt="" width={20} height={20} />
                                                        </button>
                                                    </div> */}
                                                </div>
                                            )
                                        })
                                    }
                                    {/* <span>text</span>
                                    <button onClick={(e) => { navigator.clipboard.writeText('fu'); notifyMessage('Copy successfully') }}>icon</button> */}
                                </div>
                            </div>
                        </div>
                        :
                        <div className='second_tab_content'>
                            <div className='tab_view'>
                                {secondTabSelected === 'bank' ?
                                    <form action="" className='tab_form'>
                                        <div className='side_by_side'>
                                            <InputGroup type='text' placeholder='Please Enter Bank Account No*' label='Bank Account No. :' name='accountNo' value={withdrawForm.accountNo} onChange={(e: any) => handleWithdrawForm(e)} errorValidation={
                                                BankValidator.current.message('accountNo', withdrawForm.accountNo, 'required')
                                            } />
                                            <InputGroup type='text' placeholder='Please Enter Beneficiary Name *' label="Beneficiary Name." name='holderName' value={withdrawForm.holderName} onChange={(e: any) => handleWithdrawForm(e)} errorValidation='' />
                                            <InputGroup type='text' placeholder='Please Enter Branch IFSC *' label="Branch IFSC Code" name='ifscCode' value={withdrawForm.ifscCode} onChange={(e: any) => handleWithdrawForm(e)} errorValidation='' />
                                            <InputGroup type='text' placeholder='Please Enter Bank Name *' label="Bank Name" name='bankName' value={withdrawForm.bankName} onChange={(e: any) => handleWithdrawForm(e)} errorValidation='' />
                                            <InputGroup type='number' placeholder='Please Enter Mobile No *' label='Mobile No' name='mobileNo' value={withdrawForm.mobileNo} onChange={(e: any) => handleWithdrawForm(e)} errorValidation={
                                                BankValidator.current.message('mobileNo', withdrawForm.mobileNo, 'required')
                                            } />
                                            <InputGroup type='number' placeholder='Please Enter Withdrawal Amount *' label='Amount' amount={balance} name='amount' value={withdrawForm.amount} onChange={(e: any) => handleWithdrawForm(e)} errorValidation={
                                                BankValidator.current.message('amount', withdrawForm.amount, 'required|numeric')
                                            } />
                                        </div>
                                        <div className='text_area'>
                                            <label htmlFor="description">Description</label>
                                            <textarea name="descrpitions" value={withdrawForm.descrpitions} onChange={(e) => handleWithdrawForm(e)} id="description" placeholder='Description'></textarea>
                                        </div>
                                        <div className='form_button'>
                                            <button className='cancel_btn form_btn' onClick={(e) => window.location.reload()}>Cancel</button>
                                            <button className='submit_btn form_btn' onClick={(e) => onWithdrawSubmit(e)}>Submit</button>
                                        </div>
                                    </form>
                                    :
                                    <form action="" className='tab_form'>
                                        <div className='side_by_side'>
                                            <InputGroup type='text' placeholder='Please Enter User Name *' label="User Name" name='userName' value={withdrawForm.userName} onChange={(e: any) => handleWithdrawForm(e)} errorValidation={
                                                UpiValidator.current.message('userName', withdrawForm.userName, 'required')
                                            } />
                                            <InputGroup type='number' placeholder='Please Enter Mobile No *' label='Mobile No' name='mobileNo' value={withdrawForm.mobileNo} onChange={(e: any) => handleWithdrawForm(e)} errorValidation={
                                                UpiValidator.current.message('mobileNo', withdrawForm.mobileNo, 'required')
                                            } />
                                            <InputGroup type='text' placeholder='Please Enter UPI ID *' label="Or UPI ID" name='accountNo' value={withdrawForm.accountNo} onChange={(e: any) => handleWithdrawForm(e)} errorValidation={
                                                UpiValidator.current.message('accountNo', withdrawForm.accountNo, 'required')
                                            } />
                                            <InputGroup type='number' placeholder='Please Enter Withdrawal Amount *' label='Amount' amount={balance} name='amount' value={withdrawForm.amount} onChange={(e: any) => handleWithdrawForm(e)} errorValidation={
                                                UpiValidator.current.message('amount', withdrawForm.amount, 'required|numeric')
                                            } />
                                        </div>
                                        <div className='form_button'>
                                            <button className='cancel_btn form_btn' onClick={(e) => window.location.reload()}>Cancel</button>
                                            <button className='submit_btn form_btn' onClick={(e) => onWithdrawSubmit(e)}>Submit</button>
                                        </div>
                                    </form>}

                            </div>
                        </div>
                    }

                </div>
                
                <div className="depositTable" style={{marginTop:10, marginBottom:20}}>
        
                <div className="table-responsive">
                    <table id="resultTable" className="table01 margin-table account-statement">
                        <thead>
                           {firstTabSelected ==="withdraw" ? <tr>
                                <th className="light-grey-bg">User Name</th>
                                <th className="light-grey-bg">Holder Name</th>
                                <th className="light-grey-bg">Bank Name</th>
                                <th className="light-grey-bg">Account No</th>
                                <th className="light-grey-bg">IFSC Code</th>
                                <th className="light-grey-bg">Descriptions</th>
                                <th className="light-grey-bg">Mobile No</th>
                                <th className="light-grey-bg">amount</th>
                                <th className="light-grey-bg">Created At</th>
                                <th className="light-grey-bg">Is Approve</th>
                                
                            </tr> : <tr>
                                <th className="light-grey-bg">User Name</th>
                                <th className="light-grey-bg">Transaction Id</th>
                                <th className="light-grey-bg">Mobile No</th>
                                <th className="light-grey-bg">Created At</th>
                                <th className="light-grey-bg">Is Approve</th>
                                
                                </tr>
                                }
                        </thead>
                        <tbody id="tbdata">
                            {pageData?.data && pageData?.data?.length > 0 ? pageData.data.map((item: any, i: any) => {
                                return (
                                    <>
                                       {firstTabSelected ==="withdraw" ? <tr>
                                           <td>{item.userName || '-'}</td>
                                           <td>{item.holderName || '-'}</td>
                                           <td>{item.bankName || '-'}</td>
                                           <td>{item.accountNo || '-'}</td>
                                           <td>{item.ifscCode || '-'}</td>
                                           <td>{item.descrpitions || '-'}</td>
                                           <td>{item.amount || '-'}</td>
                                           <td>{item.mobileNo || '-'}</td>
                                           <td>{moment(item.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                                           <td>{item.approvalBy === null && item.isApprove === false ? 'Panging' : item.approvalBy !== null && item.isApprove === false ? 'Reject' : 'Approve'}</td>
                                        </tr> : <tr>
                                        <td>{item.userName || '-'}</td>
                                           <td>{item.transactionId || '-'}</td>
                                           <td>{item.mobileNo || '-'}</td>
                                           <td>{moment(item.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                                           <td>{item.approvalBy === null && item.isApprove === false ? 'Panging' : item.approvalBy !== null && item.isApprove === false ? 'Reject' : 'Approve'}</td>
                                
                                </tr>
                                }
                                    </>
                                )
                            }) : <h2>No Record</h2>}
                            <tr> <td colSpan={7}> </td> </tr>


                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>

    )
}

export default DepositWithdraw

export const InputGroup = (props: any) => {
    const { type, placeholder, name, value, onChange, errorValidation, label, amount } = props
    return (<div className='input_group_money'>
        {label
            && <div className='label_with_amount'>
                <label htmlFor="">{label}</label>
                {amount !== undefined && <div><span>Current Balance: {amount}</span></div>}
            </div>
        }
        <input type={type} name={name} value={value} onChange={(e) => onChange(e)} placeholder={placeholder} />
        {errorValidation ? <span className="error" style={{ color: 'red' }} >{errorValidation}</span> : ""}

    </div>)
}

export const ImageUpload = (props: any) => {
    const { label, filename, setFileName, name, topClass } = props

    const [file, setFile] = useState<any>({ name: '' })
    const handleShowPrivew = (e: any) => {
        setFile(URL.createObjectURL(e.target.files[0]));
    }
    return (
        // <div className='document_view'>
        //     Upload Payment Screenshot
        //     <input type="file" name="file" id="file" className="inputfile" />
        // </div>
        <div className={topClass ? topClass : `mb-3 `}>
            <div>
                <label className="form-label">{label ? label === 'NO_LABEL' ? '' : 'Image' : "Image"}</label>
                <div className="input-group custom-file-button">
                    <label className="input-group-text" htmlFor={name}>Choose File</label>
                    <input name={name} className="form-control form-control-lg" onChange={(e) => { setFileName(e, name); handleShowPrivew(e) }} id={name} type="file" />
                </div>
                {filename && <a href={"#"} target="_blank">
                    <img className="mt-3" style={{ maxWidth: "300px" }} src={file} alt="Image" />
                </a>}
            </div>
        </div>
    )
}