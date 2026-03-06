import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { SportDetailsInterface } from '../pages/MultiMarket/interface';
import { sendEvent } from '../service';
import { styleObjectGetBGasColor } from '../common/StyleSeter';

const QuickSport = (props: any) => {
        const DD = useSelector((e: any) => e.domainDetails);
        const homeData = useSelector((e: any) => e.homeData);

    const getSport = useSelector((e: any) => e.getSport);
    const [sportDetails, setSportDetails] = useState(getSport)
    const [clickedData, setClickedData] = useState<string>('')

    useEffect(() => { setSportDetails(getSport); return () => { } }, [getSport])



    const clickSportHandle = (SPORT: string) => {
        sendEvent('GET_SPORTS', { "type": SPORT })
        setClickedData(SPORT)
    }

    const backToList = () => {
        setClickedData('')
    }

    return (
        <>
            <div className='multimarket_left'>
                <div className='left-menu'>
                    <div className='topmenu-left'>
                        <div className="barsicon">
                            <a href="#">
                                <img src="/images/leftmenu-arrow1.png" />
                                <img className="hover-img" src="/images/leftmenu-arrow2.png" />
                            </a>
                        </div>
                        <div style={styleObjectGetBGasColor(DD?.colorSchema)}  className="soprts-link" onClick={() => backToList()} >
                            <a>Sports</a>
                        </div>
                    </div>
                    <ul className='leftul'>
                        <li>
                            <a className="text-color-black2" data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" onClick={() => clickSportHandle('cricket')}>Cricket</a>
                            <a data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" className=""  onClick={() => clickSportHandle('cricket')}>
                                <img src="/images/leftmenu-arrow3.png" className="hoverleft" />
                                <img className="hover-img" src="/images/leftmenu-arrow4.png" />
                            </a>

                            {/* add show class in dropuil to show submenu  */}
                            {/* {sportDetails?.res.length > 0} */}
                            <ul className={`dropul bg-white list-unstyled collapse ${sportDetails?.res?.length > 0 && clickedData === 'cricket' ? 'show' : ''}`} id="homeSubmenuCricket" >
                                {
                                    sportDetails?.res?.length > 0 && sportDetails?.res?.map((item: SportDetailsInterface, i: any) => {
                                        
                                        return (<>
                                            <li><a href={`/multimarket/${item.gameId}/${item.marketId}`} className="text-color-black2">{item.eventName}</a></li>
                                        </>)
                                    })
                                }
                            </ul>
                        </li>
                        <li>
                            <a className="text-color-black2" data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" onClick={() => clickSportHandle('tennis')}>Tennis</a>
                            <a data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" className="" onClick={() => clickSportHandle('tennis')}>
                                <img src="/images/leftmenu-arrow3.png" className="hoverleft" />
                                <img className="hover-img" src="/images/leftmenu-arrow4.png" />
                            </a>

                            {/* add show class in dropuil to show submenu  */}
                            {/* {sportDetails?.res.length > 0} */}
                            <ul className={`dropul bg-white list-unstyled collapse ${sportDetails?.res?.length > 0 && clickedData === 'tennis' ? 'show' : ''}`} id="homeSubmenuCricket" >
                                {
                                    sportDetails?.res?.length > 0 && sportDetails?.res?.map((item: SportDetailsInterface, i: any) => {
                                        return (<>
                                            <li><a href={`/multimarket/${item.gameId}/${item.marketId}`} className="text-color-black2">{item.eventName}</a></li>
                                        </>)
                                    })
                                }
                            </ul>
                        </li>
                        <li>
                            <a className="text-color-black2" data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" onClick={() => clickSportHandle('soccer')} >Soccer</a>
                            <a data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" className="" onClick={() => clickSportHandle('soccer')}>
                                <img src="/images/leftmenu-arrow3.png" className="hoverleft" />
                                <img className="hover-img" src="/images/leftmenu-arrow4.png" />
                            </a>

                            {/* add show class in dropuil to show submenu  */}
                            {/* {sportDetails?.res.length > 0} */}
                            <ul className={`dropul bg-white list-unstyled collapse ${sportDetails?.res?.length > 0 && clickedData === 'soccer' ? 'show' : ''}`} id="homeSubmenuCricket" >
                                {
                                    sportDetails?.res?.length > 0 && sportDetails?.res?.map((item: SportDetailsInterface, i: any) => {
                                        return (<>
                                            <li><a href={`/multimarket/${item.gameId}/${item.marketId}`} className="text-color-black2">{item.eventName}</a></li>
                                        </>)
                                    })
                                }
                            </ul>
                        </li>
                       {homeData?.eSoccer &&  
                       <li>
                            <a className="text-color-black2" data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" onClick={() => clickSportHandle('eSoccer')} >E-Soccer</a>
                            <a data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" className="" onClick={() => clickSportHandle('eSoccer')}>
                                <img src="/images/leftmenu-arrow3.png" className="hoverleft" />
                                <img className="hover-img" src="/images/leftmenu-arrow4.png" />
                            </a>

                            {/* add show class in dropuil to show submenu  */}
                            {/* {sportDetails?.res.length > 0} */}
                            <ul className={`dropul bg-white list-unstyled collapse ${sportDetails?.res?.length > 0 && clickedData === 'eSoccer' ? 'show' : ''}`} id="homeSubmenuCricket" >
                                {
                                    sportDetails?.res?.length > 0 && sportDetails?.res?.map((item: SportDetailsInterface, i: any) => {
                                        return (<>
                                            <li><a href={`/multimarket/${item.gameId}/${item.marketId}`} className="text-color-black2">{item.eventName}</a></li>
                                        </>)
                                    })
                                }
                            </ul>
                        </li>
                        }
                       {homeData?.basketBall &&  
                       <li>
                            <a className="text-color-black2" data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" onClick={() => clickSportHandle('basketBall')} >basketBall</a>
                            <a data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" className="" onClick={() => clickSportHandle('basketBall')}>
                                <img src="/images/leftmenu-arrow3.png" className="hoverleft" />
                                <img className="hover-img" src="/images/leftmenu-arrow4.png" />
                            </a>

                            {/* add show class in dropuil to show submenu  */}
                            {/* {sportDetails?.res.length > 0} */}
                            <ul className={`dropul bg-white list-unstyled collapse ${sportDetails?.res?.length > 0 && clickedData === 'basketBall' ? 'show' : ''}`} id="homeSubmenuCricket" >
                                {
                                    sportDetails?.res?.length > 0 && sportDetails?.res?.map((item: SportDetailsInterface, i: any) => {
                                        return (<>
                                            <li><a href={`/multimarket/${item.gameId}/${item.marketId}`} className="text-color-black2">{item.eventName}</a></li>
                                        </>)
                                    })
                                }
                            </ul>
                        </li>
                        }
                        <li>
                            <a className="text-color-black2" data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true">Casino</a>
                            <a data-bs-toggle="collapse" data-bs-target="#homeSubmenuCricket" aria-expanded="true" className="">
                                <img src="/images/leftmenu-arrow3.png" className="hoverleft" />
                                <img className="hover-img" src="/images/leftmenu-arrow4.png" />
                            </a>

                            {/* add show class in dropuil to show submenu  */}
                            {/* {sportDetails?.res.length > 0} */}
                            <ul className={`dropul bg-white list-unstyled collapse ${sportDetails?.res?.length > 0 ? '' : ''}`} id="homeSubmenuCricket" >
                                {
                                    sportDetails?.res?.length > 0 && sportDetails?.res.map((item: SportDetailsInterface, i: any) => {
                                        return (<>
                                            <li><a href={`/multimarket/${item.gameId}/${item.marketId}`} className="text-color-black2">{item.eventName}</a></li>
                                        </>)
                                    })
                                }
                            </ul>
                        </li>
                    </ul>

                </div>

            </div>
        </>
    )
}

export default QuickSport