import React, { useEffect, useState } from 'react';
import { USER_API } from '../common/common';
import { getImageUrl, Logout } from '../common/Funcation';
import { getApi, notifyError, postApi } from '../service';
import Slider from "react-slick";
import Footer from '../components/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { styleObjectGetBG, styleObjectGetBorderColor } from '../common/StyleSeter';
import NewsLine from '../components/NewsLine';
import Cookies from 'universal-cookie';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';
import LoaderImage from "../assets/images/loaderajaxbet1.gif"
import Loader from '../components/Loader';


const cookies = new Cookies()
const Home = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const DD = useSelector((e: any) => e.domainDetails);
    const homeData = useSelector((e: any) => e.homeData);
    
    const matchCount = useSelector((e: any) => e.matchCount);
    const [pageData, setPageData] = useState<any>(homeData)
    const SliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,

    };
    const [loadingImages, setLoadingImages] = useState<any>([]);
    useEffect(() => {
        getPageData()
        return () => {

        }
    }, [])

    useEffect(() => {
       
        if(DD?.isMaintenance === true){
            window.location.href = '/Maintenance';
        }
     }, [DD])

    const handleImageLoad = (imageId: string) => {
        setLoadingImages((prevLoadingImages: any[]) =>
            prevLoadingImages.filter((id: string) => id !== imageId)
        );
    };

    const handleImageError = (imageId: string) => {
        setLoadingImages((prevLoadingImages: any[]) =>
            prevLoadingImages.filter((id: string) => id !== imageId)
        );
    };
    const [isLoaderFlow, setLoaderFlow] = useState<any>(false);
    useEffect(()=>{
        if (loadingImages.length === 0 && isLoaderFlow) {
            dispatch({ type: 'MAIN_LOADER', payload: false })
        }else{
            dispatch({ type: 'MAIN_LOADER', payload: true })
        }
        setLoaderFlow(true);
    },[loadingImages, isLoaderFlow])


    const getPageData = async () => {
        let data = {
            api: `${USER_API.HOME}?domain=${window.location.hostname}`,
            value :{
                domain: window.location.hostname
            }
        }

        await getApi(data).then(function (response) {
            console.log("getPageData", response);
            if (!pageData) {
                setLoadingImages(response.data.data.dashboardImagesInfo.map((item: any) => item.id));    
            }
            setPageData(response.data.data)
            dispatch({ type: 'SET_HOME_DATA', payload: response.data.data })
            // setLoadingImages(response.data.data.dashboardImagesInfo.map((item: any) => item.id));    
        }).catch(err => {
            dispatch({ type: 'MAIN_LOADER', payload: false })
            if (err?.response?.data?.statusCode === 401) {
                // Logout()
                // navigate('/login')
            }
        })
    }

    const getCasinoLink = async (item: any) => {
        if (cookies.get('skyTokenFront')) {
            let data = {
                api: USER_API.CASINO_LOGIN,
                value: {
                    id: item._id,
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
            // if (isMobile) { navigate('/login') }
            if (isMobile) { window.location.pathname = '/login' }
            notifyError('please login first')
        }
    }

    return (

        <>
            {/* {loadingImages.length > 0 &&
                <div className='loader_top loader_overlay'>
                    <div className=''>
                        <Loader />
                    </div>
                </div>
            } */}
            <div className="container home">
                <div className='home_wrp'>

                    {/* news section  */}

                    <NewsLine />

                    <div className='home_wrp_promobanner'>
                        <Slider dots={false} infinite={false} autoplay={true} autoplaySpeed={4000} speed={500} arrows={false} slidesToShow={1} slidesToScroll={1} >
                            {
                                pageData?.bannersInfo.map((item: any) => {
                                    return (
                                        <div>
                                            <img src={getImageUrl(item.image)} alt='promobanner' />
                                        </div>
                                    )
                                })
                            }
                        </Slider>
                    </div>

                    <div className='gamehall-wrap-simple'>
                        {
                            pageData?.dashboardImagesInfo.map((item: any, i: any) => {
                                return (
                                    <a onClick={(item.type === 'casino' && item.gameCode) || item.type === "platform" ? (e) => { e.stopPropagation(); getCasinoLink(item) } : () => navigate(item.link)} className={item.Width === "squareSize" ? 'entrance-half' : ''} >
                                        {i === 0 && <dl id="onLiveBoard" className="on_live">
                                            <dt>
                                                <p className="live_icon"><span></span> LIVE</p>
                                            </dt>
                                            <dd id="onLiveCount_CRICKET"><p>Cricket
                                            </p><span id="count">{matchCount?.cricket}</span></dd>

                                            <dd id="onLiveCount_SOCCER"><p>Soccer
                                            </p><span id="count">{matchCount?.soccer}</span></dd>

                                            {/* <dd id="onLiveCount_E_SOCCER"><p>E-Soccer
                                            </p><span id="count">0</span></dd> */}

                                            <dd id="onLiveCount_TENNIS"><p>Tennis
                                            </p><span id="count">{matchCount?.tennis}</span></dd>

                                            {/* <dd id="onLiveCount_KABADDI"><p>Kabaddi
                                            </p><span id="count">0</span></dd> */}

                                        </dl>}
                                        <dl style={styleObjectGetBorderColor(DD?.colorSchema)} onClick={(item.type === 'casino' && item.gameCode) || item.type === "platform" ? (e) => { e.stopPropagation(); getCasinoLink(item) } : () => console.log()} className="entrance-title">
                                            <dt >{item.title}</dt>
                                            <dd style={{ backgroundImage: `url("./images/themeImage/${DD?.colorSchema}.svg")` }}>
                                                <span className='playnow_button playnow_button-spark' style={styleObjectGetBG(DD?.colorSchema)}> Play Now </span></dd>
                                        </dl>
                                        {/* {loadingImages.includes(item.id) &&
                                            <img style={{ width: '50%' }} src={LoaderImage} alt={item.title} />
                                        } */}
                                        <img src={getImageUrl(item.image)} alt={item.title}
                                            onLoad={() => handleImageLoad(item.id)}
                                            onError={() => handleImageError(item.id)}
                                        />
                                    </a>
                                )
                            })
                        }
                    </div>






                    <Footer />
                </div>
            </div>
        </>
    )
}

export default Home