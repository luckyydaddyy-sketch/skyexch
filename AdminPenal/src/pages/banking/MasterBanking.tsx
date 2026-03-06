import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ADMIN_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import { styleObjectBlackButton } from '../../common/StyleSeter';
import { getApi, postApi } from '../../service';

function MasterBanking() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [pageData, setPageData] = useState<any>({})
    const [newAmount, setNewAmount] = useState<string>('')
    const DD = useSelector((e: any) => e.domainDetails);
    const [isHover, setIsHover] = useState(false);
    const handleMouseEnter = () => { setIsHover(true); };
    const handleMouseLeave = () => { setIsHover(false); };
    useEffect(() => {
        getPageData('get')
        return () => {

        }
    }, [])


    const getPageData = async (API: string) => {
        
        if (API === 'get') {
            let data = {
                api: ADMIN_API.BANKING.GET_BALANCE,
                value: {
                },
            }
            await getApi(data).then(function (response) {
                console.log(response);
                setPageData(response.data.data)
            dispatch({ type: 'UPDATE_BALANCE', payload: response.data.data.remaining_balance })


            }).catch(err => {
                if (err.response.data.statusCode === 401) {
                    Logout()
                    navigate('/login')
                }
            })
        }
        else {
            let data = {
                api: ADMIN_API.BANKING.ADD_BALANCE,
                value: {
                    amount: newAmount
                },
            }
            if(newAmount !== "")
                await postApi(data).then(function (response) {
                console.log(response);
                getPageData('get')
                setNewAmount('')

                }).catch(err => {
                    if (err.response.data.statusCode === 401) {
                        Logout()
                        navigate('/login')
                    }
                })
        }
    }
    const handleInputChange = (e: HTMLInputElement | any) => {
        const { value } = e.target
        setNewAmount(value)
    }
    const handleSubmit = (e: any) => {
        e.preventDefault()
        getPageData('update')
    }
    return (
        <div className="container banking">
            <div className='top_header'>
                <div className='top_header_title  mt-3'>
                    <h5 className="font-weight-bold">Manage your balance</h5>
                </div>
            </div>
            <div className='banking_content'>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className='card'>
                        <div className="card_header ">
                            Update Balance
                        </div>
                        <div className="card_body">
                            <div className="row">
                                <div className="mb-3 col-sm-12">
                                    <label htmlFor="available_balance">Current Available Balance:</label>
                                    <input className="form-control" readOnly name="available_balance" type="text" value={pageData?.remaining_balance || 0} id="available_balance" />
                                </div>
                                <div className="mb-3 col-sm-12">
                                    <label htmlFor="deposit">Deposit more fund:</label>
                                    <input className="form-control" name="deposit" value={newAmount} onChange={(e) => handleInputChange(e)} type="text" id="deposit" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card_footer">
                        <button onMouseEnter={handleMouseEnter}  onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, isHover)} className="btn_black" type="submit" value="Save" onClick={(e) => handleSubmit(e)}>submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default MasterBanking