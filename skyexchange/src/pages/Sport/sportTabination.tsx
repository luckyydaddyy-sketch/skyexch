import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { styleObjectGetBG } from '../../common/StyleSeter';
import { Logout } from '../../common/Funcation';
import { notifyError, postApi } from '../../service';
import Cookies from 'universal-cookie';
import { isMobile } from 'react-device-detect';
import { USER_API } from '../../common/common';
const cookies = new Cookies()

const SportTabination = (props: any) => {
    const { activeClass } = props
    const matchCount = useSelector((e: any) => e.matchCount);
    const DD = useSelector((e: any) => e.domainDetails);
    const homeData = useSelector((e: any) => e.homeData);

    const navigate = useNavigate()

    const getCasinoLink = async (fromMobile: boolean = false) => {
        if (cookies.get('skyTokenFront')) {
            let data = {
                api: USER_API.CASINO_LOGIN,
                value: {
                    id: 'loginType',
                    isMobileLogin: isMobile ? true : false,
                    domain: window.location.hostname === "localhost" ? 'taka365.win' : window.location.hostname
                },
                token: cookies.get('skyTokenFront') ? cookies.get('skyTokenFront') : '',
            }

            await postApi(data).then(function (response) {
                window.open(response?.data?.data?.url, '_blank');
            }).catch(err => {
                console.log(err);
                notifyError(err?.response?.data?.message)

                if (err.response.data.statusCode === 401) {
                    Logout()
                    // notifyError('Pin unsuccess')
                    // navigate('/login')
                }
            })
        } else {

            if (fromMobile) { window.location.pathname = '/login' }
            notifyError('please login first')
        }
    }



    return (
        <ul id="label" >

            {window.innerWidth < 992 &&
                <li id="highlightTab4" className='icon-casino' onClick={() => getCasinoLink()} >
                    <span className="tag-new">New</span>
                    <a style={activeClass === 'cricket' ? styleObjectGetBG(DD?.colorSchema) : {}}> <img src="/images/card-game.svg" alt="casio" /> Casino</a>
                </li>
            }
            <li id="highlightTab4" onClick={() => navigate('/Cricket')} className={activeClass === 'cricket' ? "select" : ''}><span id="tagLive" className="tag-live"><strong></strong>{matchCount?.cricket}</span>
                <a style={activeClass === 'cricket' ? styleObjectGetBG(DD?.colorSchema) : {}}> <img src="/images/transparent.gif" alt="Cricket" className="icon-cricket" />Cricket</a>
            </li>
            <li id="highlightTab1" onClick={() => navigate('/Soccer')} className={activeClass === 'soccer' ? "select" : ''}><span id="tagLive" className="tag-live"><strong></strong>{matchCount?.soccer}</span>
                <a style={activeClass === 'soccer' ? styleObjectGetBG(DD?.colorSchema) : {}}> <img src="/images/transparent.gif" alt="Soccer" className="icon-soccer" />Soccer</a>
            </li>
            <li id="highlightTab2" onClick={() => navigate('/Tennis')} className={activeClass === 'tennis' ? "select" : ''}><span id="tagLive" className="tag-live"><strong></strong>{matchCount?.tennis}</span>
                <a style={activeClass === 'tennis' ? styleObjectGetBG(DD?.colorSchema) : {}}>  <img src="/images/transparent.gif" alt="Tennis" className="icon-tennis" />Tennis</a>
            </li>
            { homeData?.eSoccer === true && 
            <li id="highlightTab3" onClick={() => navigate('/Esoccer')} className={activeClass === 'esoccer' ? "select" : ''}><span id="tagLive" className="tag-live"><strong></strong>{matchCount?.eSoccer}</span>
                <a style={activeClass === 'esoccer' ? styleObjectGetBG(DD?.colorSchema) : {}}><img src="/images/transparent.gif" alt="E-Soccer" className="icon-esoccer" />E-Soccer</a>
            </li>
            }
            { homeData?.basketBall === true && 
            <li id="highlightTab3" onClick={() => navigate('/basketBall')} className={activeClass === 'basketball' ? "select" : ''}><span id="tagLive" className="tag-live"><strong></strong>{matchCount?.basketBall}</span>
                <a style={activeClass === 'basketball' ? styleObjectGetBG(DD?.colorSchema) : {}}><img src="/images/transparent.gif" alt="E-Soccer" className="icon-esoccer" />basket Ball</a>
            </li>
            }
            {
                homeData?.eSoccer &&
                <li id="highlightTab3"><span id="tagLive" className="tag-live"><strong></strong>0</span>
                <a href="#"><img src="/images/transparent.gif" alt="E-Soccer" className="icon-esoccer" />E-Soccer</a>
            </li>  
            }
            
            {/* <li id="highlightTab5"><span id="tagLive" className="tag-live"><strong></strong>0</span>
                <a href="#"><img src="/images/transparent.gif" alt="Kabaddi" className="icon-kabaddi" />Kabaddi</a>
            </li>
            <li id="highlightTab6">
                <a href="#"><img src="/images/transparent.gif" alt="Sky Trader" className="icon-skytrader" />Sky Trader</a>
            </li> */}
            {/* <li id="highlightTab5"><span id="tagLive" className="tag-live"><strong></strong>0</span><a>
        <img src="/images/transparent.gif" alt="Rugby Union" className="icon-rugby union" />Rugby Union</a>
    </li>
    <li id="highlightTab6"><span id="tagLive" className="tag-live"><strong></strong>0</span><a>
        <img src="/images/transparent.gif" alt="Boxing" className="icon-boxing" />Boxing</a>
    </li>
    <li id="highlightTab3503"><span id="tagLive" className="tag-live"><strong></strong>0</span><a>
        <img src="/images/transparent.gif" alt="Darts" className="icon-darts" />Darts</a>
    </li>
    <li id="highlightTab6423"><span id="tagLive" className="tag-live"><strong></strong>0</span><a>
        <img src="/images/transparent.gif" alt="American Football" className="football icon-american" />American Football</a>
    </li>
    <li id="highlightTab7522"><span id="tagLive" className="tag-live"><strong></strong>7</span><a>
        <img src="/images/transparent.gif" alt="Basketball" className="icon-basketball" />Basketball</a>
    </li>
    <li id="highlightTab7"><a href="/m/login">
        <img src="/images/transparent.gif" alt="Horse Racing" className="icon-HR" /> Horse Racing</a>
    </li>
    <li id="highlightTab4339"><a href="/m/login">
        <img src="/images/transparent.gif" alt="GreyHound Racing" className="icon-dog" /> GreyHound Racing</a>
    </li>
    <li id="highlightTab_IPL"><a href="/m/Other-Games">
        <img src="assets/images/mobile/othersport.svg" className="icon-Games" />Other Games</a>
    </li> */}
        </ul>
    )
}

export default SportTabination