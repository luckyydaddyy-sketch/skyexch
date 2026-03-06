import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Cookies from 'universal-cookie'
import { USER_API } from '../common/common'
import { Logout } from '../common/Funcation'
import { getApi, notifyError, notifyMessage, postApi } from '../service'

const cookies = new Cookies()

const MarketDepthPopup = (props: any) => {
    const { setOpenSetting, OpenSetting, data } = props
    const [manageStack, setManageStack] = useState<any>()
    const [loading, setLoading] = useState(true)
    console.log("data", data);

    const [dropdown, setDropdown] = useState(false)
    const [selectedDD, setSelectedDD] = useState(data?.matchInfo?.name.split(' v ')[0])

    return (
        <div id="set_pop" className={`marketdepth slip_set-pop ${OpenSetting ? 'active' : ''}`} style={{ display: `${OpenSetting ? 'block' : 'none'}` }} >

            <div className="side-head">
                <h3 className="a-setting"><span />MarketDepthPopup </h3>
                <a className="close ui-link" href="#" onClick={() => setOpenSetting(false)}></a>
            </div>

            <div className="side-content">
                <div className="path-wrap">
                    <ul>
                        <li>{data.matchInfo.name} - Match Odds
                        </li>
                    </ul>
                </div>
                <div className="function-wrap">
                    <a className="form-select" id="runnerSelected" onClick={() => setDropdown(!dropdown)}>{selectedDD}</a>
                    <ul className="select-list" id="menuList" style={{ display: `${dropdown ? 'block' : 'none'}` }}>
                        {data?.matchInfo?.name.split(' v ').filter((_: any) => _ !== selectedDD).map((item: any, i: any) => {
                            return (
                                <li key={i}>
                                    <a onClick={() => {
                                        setSelectedDD(item)
                                        setDropdown(false)
                                    }}>
                                        {item}</a>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="chart-wrap">
                    <h3>Price over time
                    </h3>
                    <div className="chart">
                        <img src="https://xtsd.betfair.com/LoadRunnerInfoChartAction/?marketId=223445905&amp;selectionId=64778410&amp;handicap=0" alt="" id="chartImg" /></div>
                    <ul className="check-list">
                        <li><a className="checked" href="javascript:MobileMarketDepthHandler.inverseAxis(1);" id="chart1">Price</a></li>
                        <li><a className="" href="javascript:MobileMarketDepthHandler.inverseAxis(2);" id="chart2">%Chance</a></li>
                    </ul>
                </div>
                <div className="matched-wrap">
                    <dl className="info-matched">
                        <dd>
                            <span>Total matched</span>
                            <strong id="marketMatched">9,891</strong>
                        </dd>
                        <dd>
                            <span>Selection Volume</span>
                            <strong id="selectionMatched">9,560</strong>
                        </dd>
                        <dd>
                            <span>Last price</span>
                            <strong id="lastPrice">1.39</strong>
                        </dd>
                    </dl>
                    <h3>Traded and Available
                    </h3>
                    <ul className="to-BackLay">
                        <li>To back
                        </li>
                        <li>To lay
                        </li>
                    </ul>
                    <div className="trade-wrap" id="reportArticle">
                        <dl className="trade" id="backLay">
                            <dd className="back-3">
                                <p>1.01<span>752</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.02<span>36</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.04<span>5</span></p>
                            </dd>
                            <dd>
                                <p>1.09<span>0</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.12<span>413</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.13<span>413</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.14<span>413</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.18<span>23</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.2<span>108</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.22<span>48</span></p>
                            </dd>
                            <dd>
                                <p>1.23<span>9</span></p>
                            </dd>
                            <dd>
                                <p>1.24<span>0</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.25<span>33</span></p>
                            </dd>
                            <dd>
                                <p>1.26<span>24</span></p>
                            </dd>
                            <dd className="back-3">
                                <p>1.27<span>325</span></p>
                            </dd>
                            <dd>
                                <p>1.29<span>2,503</span></p>
                            </dd>
                            <dd>
                                <p>1.3<span>928</span></p>
                            </dd>
                            <dd>
                                <p>1.31<span>111</span></p>
                            </dd>
                            <dd>
                                <p>1.32<span>120</span></p>
                            </dd>
                            <dd>
                                <p>1.34<span>364</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.35<span>35</span></p>
                            </dd>
                            <dd>
                                <p>1.36<span>45</span></p>
                            </dd>
                            <dd>
                                <p>1.37<span>65</span></p>
                            </dd>
                            <dd>
                                <p>1.38<span>9</span></p>
                            </dd>
                            <dd>
                                <p>1.39<span>1,563</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.4<span>1,269</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.41<span>10</span></p>
                            </dd>
                            <dd>
                                <p>1.42<span>5</span></p>
                            </dd>
                            <dd>
                                <p>1.43<span>651</span></p>
                            </dd>
                            <dd>
                                <p>1.44<span>56</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.45<span>11</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.5<span>11</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.51<span>0</span></p>
                            </dd>
                            <dd>
                                <p>1.52<span>0</span></p>
                            </dd>
                            <dd>
                                <p>1.53<span>1,040</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.54<span>1</span></p>
                            </dd>
                            <dd>
                                <p>1.55<span>2</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.56<span>108</span></p>
                            </dd>
                            <dd>
                                <p>1.57<span>20</span></p>
                            </dd>
                            <dd>
                                <p>1.58<span>20</span></p>
                            </dd>
                            <dd>
                                <p>1.59<span>16</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.6<span>94</span></p>
                            </dd>
                            <dd>
                                <p>1.61<span>30</span></p>
                            </dd>
                            <dd>
                                <p>1.62<span>10</span></p>
                            </dd>
                            <dd>
                                <p>1.63<span>19</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.65<span>0</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1.7<span>190</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.12<span>17</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.2<span>7</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.28<span>0</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.5<span>13</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.54<span>268</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.64<span>252</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.7<span>243</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.76<span>235</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.8<span>230</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.86<span>222</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>2.94<span>214</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>3<span>408</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>3.5<span>0</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>4<span>10</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>4.9<span>0</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>16<span>0</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>20<span>6</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>26<span>0</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>55<span>0</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>90<span>1</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>110<span>7</span></p>
                            </dd>
                            <dd className="lay-3">
                                <p>1000<span>0</span></p>
                            </dd>
                        </dl>
                        <dl className="trade-2" id="traded">
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p>0</p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p>1,594</p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p>135</p>
                            </dd>
                            <dd>
                                <p>0</p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p>143</p>
                            </dd>
                            <dd>
                                <p>28</p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p>30</p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p>4</p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                            <dd>
                                <p></p>
                            </dd>
                        </dl>
                    </div>

                </div>
                <p className="info-other">The information on this page may be slightly delayed.
                </p>
            </div>

        </div>


    )
}

export default MarketDepthPopup
