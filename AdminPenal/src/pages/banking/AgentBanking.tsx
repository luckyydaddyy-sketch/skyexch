import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ADMIN_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import { styleObjectBlackButton } from '../../common/StyleSeter';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import { getApi, notifyError, notifyMessage, postApi } from '../../service';
import SkyPopup from '../../components/SkyPopup';
import Loader from '../../components/Loader';

interface agentInterface {
    agent_level: string
    balance: number
    credit_ref: number
    exposure: number
    firstName: string
    lastName: string
    ref_pl: number
    remaining_balance: number
    user_name: string
    _id: string
    formData: UpdateFormInterface
}
interface UpdateFormInterface {
    id: string
    amount: any,
    credit_ref: any,
    Ttype: string,
    remark: string
}


function AgentBanking() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [pageData, setPageData] = useState<any>({})
    const [password, setPassword] = useState<string>('')
    const [OpenModal, setOpenModal] = useState<boolean>(false);
    const [tableFormData, setTableFormData] = useState([{
        id: '',
        amount: 0,
        credit_ref: 0,
        Ttype: '',
        remark: ''
    }])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const DD = useSelector((e: any) => e.domainDetails);
    const [editedIds, setEditedIds] = useState<any>([])
    const [isHover, setIsHover] = useState(false);
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };
    const [isLoader, setLoader] = useState(false);

    useEffect(() => {
        getPageData('agent', '1')
        return () => {

        }
    }, [])


    const getPageData = async (TYPE: string, PAGE: string, search: string = '') => {

        let data: any = {
            api: ADMIN_API.BANKING.GET_LIST,
            value: {
                type: TYPE,
                page: PAGE ? PAGE : '1',
                limit: '50'
            },
        }
        if (search !== '') {
            data.value.search = search
        }
        setLoader(true);
        await postApi(data).then(function (response) {
            console.log(response);
            response.data?.data?.agent?.results.forEach((element: agentInterface) => {
                element.formData = {
                    id: element._id,
                    amount: '',
                    credit_ref: element.credit_ref,
                    // Ttype: "deposit",
                    Ttype: "All",
                    remark: "Deposit"
                }
            });
            setPageData(response.data?.data)
            dispatch({ type: 'UPDATE_BALANCE', payload: response?.data.data.remaining_balance })
            setLoader(false);
        }).catch(err => {
            setLoader(false);
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })

    }


    const updatePageData = async (DATA: any) => {
        let dataCopy = { ...DATA }

        let newDate = DATA.usersData.filter((_: any) => _.amount !== 0 && _.amount !== '' && _.Ttype !== "All")
        debugger
        dataCopy.usersData = newDate
        if (dataCopy.usersData.length === 0) {
            notifyMessage('there is noting update')
        } else {
            let data = {
                api: ADMIN_API.BANKING.UPDATE,
                value: dataCopy
            }
            await postApi(data).then(function (response) {
                console.log(response);
                getPageData('agent', '1')
                notifyMessage(response.data.message)
                setIsSubmitted(false)
                setPassword('')
            }).catch(err => {
                setPassword('')
                notifyError(err.response.data.message)
                setIsSubmitted(false)
                if (err.response.data.statusCode === 401) {
                    Logout()
                    navigate('/login')
                }
            })
        }
    }

    const handleInputChange = (e: HTMLInputElement | any, item: agentInterface) => {
        let { value, name } = e.target
        if (name === 'amount' || name === 'credit_ref') value = Number(value)
        let CopyPageData = JSON.parse(JSON.stringify(pageData))
        CopyPageData.agent?.results.forEach((element: agentInterface) => {
            if (element._id === item._id) {
                element.formData = {
                    ...element.formData,
                    id: element._id,
                    [name]: value
                }
                if (name === "fullBtn") {
                    element.formData = {
                        ...element.formData,
                        amount: element.remaining_balance
                    }
                }
                if (name === 'Ttype') {
                    element.formData = {
                        ...element.formData,
                        id: element._id,
                        [name]: value,
                        remark: value === 'deposit' ? 'Deposit' : 'Withdraw'
                    }
                }
                let ids = [...editedIds]
                if (!ids?.includes(item._id)) {
                    ids.push(item._id)
                }
                setEditedIds(ids)
            }
        });
        console.log(CopyPageData);

        setPageData(CopyPageData)
    }
    const handlePassword = (e: any) => {
        setPassword(e.target.value)
    }
    const handleSubmit = (e: any) => {
        console.log("click bank submit");
        
        let userData: any = []
        setIsSubmitted(true)
        pageData.agent?.results.forEach((element: agentInterface) => {
            userData.push(element.formData)
        });
        e.preventDefault()
        let data = {
            "type": "agent",
            "password": password,
            "usersData": userData
        }

        console.log(data);

        updatePageData(data)
    }
    const handleSearchSubmit = (search: any) => {
        getPageData("agent", '1', search)
    }
    const handlePageClick = (e: any) => {
        console.log('page clicked', e);
        getPageData('agent', (e.selected + 1).toString())
    }
    return (<>
        {isLoader && <Loader />}
        <div className="container banking player full-wrap">
            <h2>Banking</h2>
            <div className='top_header mt-3'>

                <SearchInput searchSubmit={handleSearchSubmit} design="in" />

            </div>
            <div className='report_over-wrap' style={{ maxHeight: "calc(100% - 208px)" }}>
                <div className='banking_content'>
                    <div className='banking_content_table'>


                        <div className=' function-wrap'>
                            {/* <strong className="text-primary">Agent Banking</strong> */}
                            <span className='banking-head' style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <strong className='pr-1'>Your Balance</strong>
                                <div className='border-left-content'>
                                    <span className='pr-0-5'>{DD?.currency ? DD?.currency : 'PTH'}</span>
                                    <span className="h5" >
                                        <strong>{pageData?.remaining_balance}</strong>
                                    </span>

                                </div>

                            </span>
                        </div>

                        <div className="table-responsive">
                            <table id="resultTable" className="table01 margin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "6%", textAlign: "left", lineHeight: "30px" }}> UID </th>
                                        <th style={{ width: "7%", textAlign: "right" }} > Total Balance </th>
                                        <th style={{ width: "6%", textAlign: "right" }} > Avl DP/WD Balance</th>
                                        {/* <th style={{ width: "7%", textAlign: "right" }} > Exposure </th> */}
                                        <th style={{ width: "17%", textAlign: "center" }} className='bordered'> Deposit / Withdraw </th>
                                        <th style={{ width: "10%", textAlign: "right" }} className='bordered'> Credit Reference </th>
                                        <th style={{ width: "10%", textAlign: "right" }} >Reference P/L</th>
                                        <th style={{ width: "10%", textAlign: "center" }} className='bordered'> Remark </th>
                                        <th style={{ width: "5%", textAlign: "left" }} className='bordered'> Logs </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.agent?.results && pageData.agent?.results.length > 0 ? pageData.agent?.results.map((item: agentInterface, i: any) => {
                                        return (<>
                                            <tr key={item._id}>
                                                <td >
                                                    <div style={{ display: "flex" }}>
                                                        <span style={{ marginRight: "10px", color: "grey" }}>{i + 1}</span>
                                                        <p style={{ display: "flex", alignItems: "flex-start" }}>
                                                            <span className=" badge bg-info text-dark">{item.agent_level}</span> {item.user_name}
                                                            {/* [{item.firstName} {item.lastName}] */}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td align='right'>{item?.balance}</td>
                                                <td align='right'>{item.remaining_balance}</td>
                                                {/* <td align='right' className='text-danger'>{item.exposure} 2.2 </td> */}
                                                <td className='bordered'>
                                                    <div className="dw_wrp">
                                                        <div className="dw_wrp_dw">
                                                            <div className="btn-group credit-type" role="group" aria-label="Basic radio toggle button group" >
                                                                <input type="checkbox" className="btn-check" name="Ttype" id={'d' + item._id} value="deposit" onChange={(e) => handleInputChange(e, item)} checked={item.formData.Ttype === 'deposit'} />
                                                                <label style={{ marginBottom: 0 }} className="btn btn-outline-primary shadow-none" htmlFor={'d' + item._id}>D</label>
                                                                <input type="checkbox" className="btn-check" name="Ttype" id={'w' + item._id} value="withdraw" onChange={(e) => handleInputChange(e, item)} checked={item.formData.Ttype === 'withdraw'} />
                                                                <label style={{ marginBottom: 0 }} className="btn btn-outline-danger shadow-none" htmlFor={'w' + item._id}>W</label>
                                                            </div>
                                                        </div>
                                                        <div className="dw_wrp_am">
                                                            <span style={{ color: `${item.formData.Ttype === 'deposit' ? "#38b338" : "#d0021b"}` }}> {item.formData.Ttype === 'deposit' ? "+" : "-"}</span>
                                                            <input type="number" name="amount" step="0.01" onChange={(e) => handleInputChange(e, item)} value={item?.formData?.amount} className="form-control" placeholder="0" style={{ width: "135px" }} />
                                                        </div>
                                                        <button onClick={(e) => handleInputChange(e, item)} name="fullBtn" style={styleObjectBlackButton(DD?.colorSchema, true)} className={`full ${item.formData.Ttype === 'deposit' ? "not-allow" : ""}`}> Full </button>
                                                    </div>
                                                </td>
                                                <td className='bordered'>
                                                    <div style={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                                        <input type="number" style={{ width: "100px", marginRight: "5px" }} name="credit_ref" onChange={(e) => handleInputChange(e, item)} value={item?.formData?.credit_ref ? item?.formData?.credit_ref : ''} step="0.01" className="form-control" placeholder="Credit Ref" />
                                                        {/* <u className='text-blue' style={{ marginRight: "10px" }}> {item?.formData?.credit_ref ? item?.formData?.credit_ref : '0'}</u> */}
                                                        <button className='credit_ref_eidt' style={styleObjectBlackButton(DD?.colorSchema, true)} onClick={() => setOpenModal(true)}> Edit </button>
                                                    </div>
                                                </td>
                                                <td align='right' className={item.ref_pl > 0 ? "text-green" : "text-danger"}>({item.ref_pl})</td>
                                                <td className='bordered' align='right'>
                                                    <input
                                                        type="text"
                                                        placeholder='Remark'
                                                        name="remark"
                                                        className="form-control remark"
                                                        onChange={(e) => handleInputChange(e, item)}
                                                        value={item?.formData?.remark}
                                                    />
                                                </td>
                                                <td align='right' className='bordered'>
                                                    <button className='log' style={styleObjectBlackButton(DD?.colorSchema, true)}> Log </button>
                                                </td>
                                            </tr>
                                        </>)
                                    }) : <h3>NO DATA</h3>}
                                    {/* <tr>
                                    <td>
                                        <span className="badge bg-info text-dark">PL</span> Demo2 [Hhgggg Ttttt]
                                    </td>
                                    <td>485</td>
                                    <td>485</td>
                                    <td>
                                        <div className="dw_wrp">
                                            <div className="dw_wrp_dw">
                                                <div className="btn-group credit-type" role="group" aria-label="Basic radio toggle button group">
                                                    <input type="radio" className="btn-check" name="banking" id="d" value="D" autoComplete='off' checked />
                                                    <label className="btn btn-outline-primary shadow-none" htmlFor="d">D</label>
                                                    <input type="radio" className="btn-check" name="banking" id="w" value="W" autoComplete="off" />
                                                    <label className="btn btn-outline-danger shadow-none" htmlFor="w">W</label>
                                                </div>
                                            </div>
                                            <div className="dw_wrp_am">
                                                <input type="number" style={{ width: "150px" }} name="banking[894][amount]" step="0.01" className="form-control" placeholder="Enter Amount" />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <input type="number" style={{ width: "100px" }} name="banking[894][credit_ref]" step="0.01" className="form-control" value="0" />
                                    </td>
                                    <td className="text-danger">485</td>
                                    <td>
                                        <input type="text" style={{ width: "150px" }} name="banking[894][remark]" className="form-control" value="Deposit" />
                                    </td>
                                </tr> */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {pageData?.agent?.totalPages === 1 || pageData?.agent?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.agent?.totalPages} />}

            <div className='banking_content_footer submit-wrap'>

                <ul>
                    <li className='clearAll'>
                        <button onClick={() => { getPageData('agent', '1'); setEditedIds([]) }}> Clear All</button>
                    </li>
                    <li className='pass'>
                        <div className="input-group">
                            <input type="password" onChange={(e) => handlePassword(e)} value={password} className="form-control" placeholder="Password" name="password" />
                            <button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, isHover)} className="btn" type="submit" onClick={(e) => isSubmitted ? console.log() : handleSubmit(e)} id="basic-addon2">Submit <span className='count'>{editedIds?.length}</span> Payment</button>
                        </div>{/*  */}
                    </li>
                </ul>

            </div>
        </div >
        {OpenModal && <SkyPopup
            title={`Credit Reference Edit`}
            customClass="credit-edit"
            OpenModal={OpenModal}
            closeModel={() => setOpenModal(false)}
            maxWidth={380}
        >

            <div>
                <input type="hidden" name="_token" />
                <input type="hidden" name="user_id" id="user_id" value="133" />
                <div className="modal-body">
                    <div className="d_flex">
                        <div className="fieldset full new">
                            <div className="mb-2 flex-align content-between">
                                <span className='currenet flex-align'>Current <strong>800000</strong></span>
                                <button className='log' style={styleObjectBlackButton(DD?.colorSchema, true)}> Log </button>
                                {/* <span>
                                <input type="text" name="current_credit" maxLength={16} className="form-control" readOnly />
                            </span> */}
                            </div>
                        </div>
                        <div className="fieldset full new">
                            <div className="mb-2 flex-align content-between">
                                <span>New Current</span>
                                <span style={{ width: "70%" }}>
                                    <input type="number" name="credit_ref" maxLength={16} className="form-control" /></span>
                            </div>
                        </div>
                        <div className="fieldset full new">
                            <div className="mb-2 flex-align content-between">
                                <span> Password </span>
                                <span style={{ width: "70%" }}>
                                    <input type="password" name="password" className="form-control" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SkyPopup>
        }
    </>
    )
}

export default AgentBanking