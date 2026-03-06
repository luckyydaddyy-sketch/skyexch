import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { json } from 'stream/consumers';
import { ADMIN_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import { styleObjectBlackButton } from '../../common/StyleSeter';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import { notifyError, notifyMessage, postApi } from '../../service';
import Loader from '../../components/Loader';

interface playerInterface {
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

function PlayerBanking() {
    const navigate = useNavigate()
    const [pageData, setPageData] = useState<any>({})
    const [password, setPassword] = useState<string>('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const dispatch = useDispatch()
    const DD = useSelector((e: any) => e.domainDetails);
    const [isHover, setIsHover] = useState(false);
    const [editedIds, setEditedIds] = useState<any>([])
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };
    const [isLoader, setLoader] = useState(false);

    useEffect(() => {
        getPageData('player', '1')
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
            response.data?.data?.player?.results.forEach((element: playerInterface) => {
                element.formData = {
                    id: element._id,
                    amount: '',
                    credit_ref: element.credit_ref,
                    Ttype: "",
                    remark: ""
                }
            });
            setPageData(response.data?.data)
            dispatch({ type: 'UPDATE_BALANCE', payload: response.data?.data.remaining_balance })
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

        let newDate = DATA.usersData.filter((_: any) => _.amount !== 0 && _.amount !== '')
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
                getPageData('player', '1')
                notifyMessage(response.data.message)
                setIsSubmitted(false)
                setPassword('')
            }).catch(err => {
                setIsSubmitted(false)
                setPassword('')
                notifyError(err.response.data.message)
                if (err.response.data.statusCode === 401) {
                    Logout()
                    navigate('/login')
                }
            })
        }
    }

    const handleInputChange = (e: HTMLInputElement | any, item: playerInterface) => {
        let { value, name } = e.target
        if (name === 'amount' || name === 'credit_ref') value = Number(value)
        let CopyPageData = JSON.parse(JSON.stringify(pageData))
        CopyPageData.player?.results.forEach((element: playerInterface) => {
            if (element._id === item._id) {
                element.formData = {
                    ...element.formData,
                    id: element._id,
                    [name]: value
                }
                if (name === "fullBtn") {
                    element.formData = {
                        ...element.formData,
                        amount: element.balance
                    }
                }
                if (name === 'Ttype') {
                    element.formData = {
                        ...element.formData,
                        id: element._id,
                        [name]: value,
                        remark: value === 'deposit' ? 'deposit' : 'Withdraw'
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
        let userData: any = []
        pageData.player?.results.forEach((element: playerInterface) => {
            userData.push(element.formData)
        });
        e.preventDefault()
        let data = {
            "type": "player",
            "password": password,
            "usersData": userData
        }

        console.log(data);

        updatePageData(data)
    }
    const handleSearchSubmit = (search: any) => {
        getPageData('player', '1', search)
    }
    const handlePageClick = (e: any) => {
        console.log('page clicked', e);
        getPageData('player', (e.selected + 1).toString())
    }
    return (
        <>
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
                                <table id="resultTable" className="tab-transfer tab-banking table01 margin-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "15%", textAlign: "left" }}> Account(Player) </th>
                                            <th style={{ width: "6%", textAlign: "right" }} > Total Balance</th>
                                            <th style={{ width: "7%", textAlign: "right" }} > Available D/W Balance</th>
                                            <th style={{ width: "7%", textAlign: "right" }} > Exposure </th>
                                            <th style={{ width: "17%", textAlign: "center" }} className='bordered'> Deposit / Withdraw </th>
                                            <th style={{ width: "10%", textAlign: "right" }} className='bordered'> Credit Reference </th>
                                            <th style={{ width: "10%", textAlign: "right" }} >Reference P/L</th>
                                            <th style={{ width: "10%", textAlign: "center" }} className='bordered'> Remark </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageData.player?.results && pageData.player?.results.length > 0 ? pageData.player?.results.map((item: playerInterface, i: any) => {
                                            return (<>
                                                <tr key={item._id}>
                                                    <td>
                                                        <div style={{ display: "flex" }}>
                                                            <span style={{ marginRight: "10px", color: "grey" }}>{i + 1}</span>
                                                            <p style={{ display: "flex", alignItems: "flex-start" }}>
                                                                <span className=" badge bg-warning">{item.agent_level}</span> {item.user_name}
                                                                {/* [{item.firstName} {item.lastName}] */}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td align='right'>{item.remaining_balance}</td>
                                                    <td align='right'>{item?.balance}</td>
                                                    <td align='right' className='text-danger'>{item.exposure}</td>
                                                    <td className='bordered'>
                                                        <div className="dw_wrp">
                                                            <div className="dw_wrp_dw" >
                                                                <div className="btn-group credit-type" role="group" aria-label="Basic radio toggle button group" >
                                                                    <input type="checkbox" className="btn-check" name="Ttype" id={'d' + item._id} value="deposit" onChange={(e) => handleInputChange(e, item)} checked={item.formData.Ttype === 'deposit'} />
                                                                    <label className="btn btn-outline-primary shadow-none" htmlFor={'d' + item._id} style={{ marginRight: "2px", marginBottom: "0px" }}>D</label>
                                                                    <input type="checkbox" className="btn-check" name="Ttype" id={'w' + item._id} value="withdraw" onChange={(e) => handleInputChange(e, item)} checked={item.formData.Ttype === 'withdraw'} />
                                                                    <label className="btn btn-outline-danger shadow-none" htmlFor={'w' + item._id} style={{ marginBottom: "0px" }}>W</label>
                                                                </div>
                                                            </div>
                                                            <input type="number" name="amount" step="0.01" onChange={(e) => handleInputChange(e, item)} value={item?.formData?.amount} className="form-control" placeholder="0" style={{ width: "130px" }} />
                                                            <div className="dw_wrp_am">
                                                                {/* <span style={{ color: `${item.formData.Ttype === 'deposit' ? "#38b338" : "#d0021b"}` }}> {item.formData.Ttype === 'deposit' ? "+" : "-"}</span> */}
                                                            </div>
                                                            <button onClick={(e) => handleInputChange(e, item)} name="fullBtn" style={{ ...styleObjectBlackButton(DD?.colorSchema, true), marginLeft: "2px" }} className={`full ${item.formData.Ttype === 'deposit' ? "not-allow" : ""}`} > Full </button>
                                                        </div>
                                                    </td>
                                                    <td className='bordered'>
                                                        {/* <input type="number" style={{ width: "100px" }} name="credit_ref" onChange={(e) => handleInputChange(e, item)} value={item?.formData?.credit_ref} step="0.01" className="form-control" /> */}
                                                        <div style={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                                            <input type="number" style={{ width: "100px", marginRight: "5px" }} name="credit_ref" onChange={(e) => handleInputChange(e, item)} value={item?.formData?.credit_ref ? item?.formData?.credit_ref : ''} step="0.01" className="form-control" placeholder="Credit Ref" />
                                                            {/* <u className='text-blue' style={{ marginRight: "10px" }}> {item?.formData?.credit_ref ? item?.formData?.credit_ref : '0'}</u> */}
                                                            {/* <button className='credit_ref_eidt'> Edit </button> */}
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
                                                    {/* <td align='right' className='bordered'>
                                                    <button className='log'> Log </button>
                                                </td> */}
                                                </tr>
                                            </>)
                                        }) : <></>}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {pageData?.player?.totalPages === 1 || pageData?.player?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.player?.totalPages} />}


                <div className="banking_content_footer submit-wrap"><ul><li className="clearAll" ><button> Clear All</button></li>
                    <li className="pass"><div className="input-group">
                        <input type="password" onChange={(e) => handlePassword(e)} value={password} className="form-control" placeholder="Password" name="password" />
                        <button className="btn" type="submit" id="basic-addon2" style={styleObjectBlackButton(DD?.colorSchema, isHover)} onClick={(e) => isSubmitted ? console.log() : handleSubmit(e)}>Submit <span className="count">{editedIds?.length}</span> Payment</button></div></li></ul></div>

            </div>
        </>
    )
}

export default PlayerBanking