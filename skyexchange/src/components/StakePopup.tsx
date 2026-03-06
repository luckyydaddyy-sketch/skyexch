import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Cookies from 'universal-cookie'
import { USER_API } from '../common/common'
import { Logout } from '../common/Funcation'
import { getApi, notifyError, notifyMessage, postApi } from '../service'

const cookies = new Cookies()

const StakePopup = (props: any) => {
    const { setOpenSetting, OpenSetting } = props
    const [manageStack, setManageStack] = useState<any>()
    const [loading, setLoading] = useState(true)
    const isAuthenticated = useSelector((e: any) => e.isAuthenticated);
    const [selectedStack, setSelectedStack] = useState<any>([])

    const [edit, setEdit] = useState(false)

    useEffect(() => {
        getStack(isAuthenticated?.token)
        return () => {
        }
    }, [])

    const updateSetting = async () => {


        let data = {
            api: USER_API.UPDATE_STACK,
            value: {
                "defaultStack": manageStack.defaultStack,
                "stack": manageStack.stack,
                "highLightsOdds": manageStack.highLightsOdds,
                "acceptFancyOdds": manageStack.acceptFancyOdds,
                "acceptBookmakerOdds": manageStack.acceptBookmakerOdds
            },
        }

        await postApi(data).then(function (response) {
            setOpenSetting(false)
            notifyMessage('update stack success')
            // setSearchData(response.data.data)

        }).catch(err => {
            
            notifyError(err.response.data.message)
            setOpenSetting(false)
            if (err.response.data.statusCode === 401) {

                // Logout()
                // navigate('/login')
            }
        })
        // setOpenModal(true)
    }

    const getStack = async (token: string) => {

        let data = {
            api: USER_API.GET_STACK,
            value: {},
            token: token ? token : undefined
        }

        await getApi(data).then(function (response) {
            let resData = response.data?.data?.stackInfo
            if (response.data?.data?.stackInfo?.stack?.length > 0) {
                setManageStack(resData)
                setSelectedStack(resData.stack)
            } else {
                resData.stack = [10, 20, 30, 40, 50, 60, 70, 80]
                setManageStack(resData)
            }

            // setOpenSetting(!OpenSetting)
            // setSearchData(response.data.data)
            setLoading(false)

        }).catch(err => {
            
            notifyError(err.response.data.message)
            if (err.response.data.statusCode === 401) {
                Logout()
                // navigate('/login')
            }
        })
    }
    const editClick = () => {
        setEdit(!edit)
    }
    const handleCheckBoxChange = (e: any) => {

        const { name, checked } = e.target
        
        setManageStack({
            ...manageStack,
            [name]: checked
        })
    }
    const handleStackChange = (e: any, id: any) => {
        
        const { name, value } = e.target
        let stackCopy = manageStack.stack
        stackCopy[name] = parseInt(value) ? parseInt(value) : 0

        setManageStack({
            ...manageStack,
            stack: stackCopy
        })
        const finalSelectedStack = selectedStack.filter((value: any) => stackCopy.includes(value));
        setSelectedStack(finalSelectedStack)

    }

    const manageDefault = (e: any) => {
        const { name, value } = e.target
        setManageStack({
            ...manageStack,
            [name]: value
        })
    }




    const handleSelecrtedStack = (id: any) => {
        setSelectedStack((prevStack: any) => prevStack.includes(id) ? prevStack.filter((_: any) => _ !== id) : [...prevStack, id]);

    };

    return (
        <div id="set_pop" className={`slip_set-pop ${OpenSetting ? 'active' : ''}`} style={{ display: `${OpenSetting ? 'block' : 'none'}` }} >
            {window.innerWidth < 992 &&
                <div className="side-head">
                    <h3 className="a-setting"><span />Setting </h3>
                    <a className="close ui-link" href="#" onClick={() => setOpenSetting(false)}></a>
                </div>
            }

            <div id="coinList" className="set-content">
                {loading ? <div>loading....</div> :
                    <>
                        {window.innerWidth < 992 && <h3>Stake </h3>}
                        <dl className="odds-set">
                            <dd className="col-defult">
                                <label htmlFor="defult_stake">
                                    <strong>Default stake </strong>
                                </label>
                                <input name="defaultStack" className="stake-input" type="text" onChange={(e) => manageDefault(e)} maxLength={7} value={manageStack?.defaultStack} />
                            </dd>
                        </dl>

                        <dl id="stakeSet" className="stake-set" style={!edit ? {} : { display: "none" }}>
                            <dt>Quick Stakes </dt>
                            {
                                manageStack?.stack.length > 0 && manageStack?.stack.map((item: any) => <dd><a id="coin_1" className={`btn ${selectedStack.includes(item) ? 'select' : ''}`} onClick={() => handleSelecrtedStack(item)}>{item}</a></dd>)
                            }
                            {/* <dd><a id="coin_1" className="btn select">10</a></dd>
                        <dd><a id="coin_2" className="btn select">30</a></dd>
                        <dd><a id="coin_3" className="btn select">50</a></dd>
                        <dd><a id="coin_4" className="btn">100</a></dd>
                        <dd><a id="coin_5" className="btn select">200</a></dd>
                        <dd><a id="coin_6" className="btn">300</a></dd>
                        <dd><a id="coin_7" className="btn select">500</a></dd>
                        <dd><a id="coin_8" className="btn select">1000</a></dd> */}
                            <dd className="col-edit"><a id="edit" className="btn-edit" onClick={() => editClick()}> Edit Stakes <span /></a></dd>
                        </dl>
                        <dl id="editCustomizeStakeList" className="stake-set" style={edit ? {} : { display: "none" }}>
                            <dt>Quick Stakes </dt>
                            {
                                manageStack?.stack.length > 0 && manageStack?.stack.map((item: any, i: any) =>
                                    <dd key={i}><input style={{ maxWidth: 50 }} key={i} className="stake_edit-input" type="text" onChange={(e) => handleStackChange(e, i)} name={i} value={item} maxLength={7} /></dd>)
                            }

                            <dd className="col-edit"><a id="ok" className="btn-edit" onClick={() => editClick()}>OK</a></dd>
                        </dl>


                        {window.innerWidth > 992 ?
                            <>
                                <dl className='odds-set'>
                                    <dt>Odds </dt>
                                    {/* <h3>Odds </h3> */}
                                    <dd>
                                        <input id="enableSparkCheck" type="checkbox" name='highLightsOdds' checked={manageStack?.highLightsOdds} onChange={(e) => handleCheckBoxChange(e)} />
                                        <label htmlFor="enableSparkCheck" >
                                            Highlight when odds change
                                        </label>
                                    </dd>
                                </dl>

                                <dl className='odds-set'>
                                    <dt>FancyBet </dt>
                                    {/* <h3>FancyBet </h3> */}
                                    <dd>
                                        <input id="fancy_odd" type="checkbox" name='acceptFancyOdds' checked={manageStack?.acceptFancyOdds} onChange={(e) => handleCheckBoxChange(e)} />
                                        <label htmlFor="fancy_odd">Accept Any Odds
                                        </label>
                                    </dd>
                                </dl>

                                <dl className='odds-set'>
                                    <dt>SportsBook </dt>
                                    {/* <h3>SportsBook </h3> */}
                                    <dd>
                                        <input id="accept_odd" type="checkbox" name='acceptBookmakerOdds' checked={manageStack?.acceptBookmakerOdds} onChange={(e) => handleCheckBoxChange(e)} />
                                        <label htmlFor="accept_odd">Accept Any Odds
                                        </label>
                                    </dd>
                                </dl>
                            </>

                            :
                            <>
                                <h3>Odds </h3>
                                <dl className='setting-block'>
                                    <dt> Highlight when odds change </dt>

                                    <dd>
                                        <label htmlFor={'enableSparkCheck'} className={`${manageStack?.highLightsOdds === true ? 'switch_on' : 'switch_off'}`}>
                                            <input id="enableSparkCheck" type="checkbox" name='highLightsOdds' checked={manageStack?.highLightsOdds} onChange={(e) => handleCheckBoxChange(e)} />
                                            <span />
                                        </label>

                                    </dd>
                                </dl>

                                <h3>FancyBet </h3>
                                <dl className='setting-block'>
                                    <dt> Accept Any Odds </dt>
                                    <dd>
                                        <label htmlFor={'fancy_odd'} className={`${manageStack?.acceptFancyOdds === true ? 'switch_on' : 'switch_off'}`}>
                                            <input id="fancy_odd" type="checkbox" name='acceptFancyOdds' checked={manageStack?.acceptFancyOdds} onChange={(e) => handleCheckBoxChange(e)} />
                                            <span />
                                        </label>

                                    </dd>
                                </dl>

                                <h3>SportsBook </h3>
                                <dl className='setting-block'>
                                    <dt> Accept Any Odds </dt>
                                    <dd>
                                        <label htmlFor={'accept_odd'} className={`${manageStack?.acceptBookmakerOdds === true ? 'switch_on' : 'switch_off'}`}>
                                            <input id="accept_odd" type="checkbox" name='acceptBookmakerOdds' checked={manageStack?.acceptBookmakerOdds} onChange={(e) => handleCheckBoxChange(e)} />
                                            <span />
                                        </label>

                                    </dd>
                                </dl>
                            </>

                        }
                        {/* <dl className="odds-set">
                    <dt>Binary
                    </dt>
                    <dd>
                        <input id="accept_price" type="checkbox" />
                        <label htmlFor="accept_price">Accept Any Price </label>
                    </dd>
                </dl> */}
                        <ul className="btn-wrap">
                            <li><a id="closeSet" className="btn" onClick={() => setOpenSetting(false)}>Cancel
                            </a></li>
                            <li className="col-send" onClick={() => updateSetting()}><a id="coinSave" className="btn-send btn" >Save
                            </a></li>
                        </ul>
                    </>}
            </div>
        </div>)
}

export default StakePopup
