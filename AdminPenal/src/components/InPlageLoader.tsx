import React, { useEffect } from 'react';
// import loaderSvg from '..//images/miniloadder.svg'
import loaderSvg from '../assets/images/miniloadder.svg'
const InPageLoader = () => {

    // useEffect(() => {
    //     document.querySelector('body')!.classList.add('no-scroll');
    //     return () => {
    //         document.querySelector('body')!.classList.remove('no-scroll');
    //     }
    // }, [])


    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={loaderSvg} alt="" />
        </div>
    )

}
export default InPageLoader;