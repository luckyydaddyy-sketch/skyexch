import React, { useEffect } from 'react'

function PageNotFound() {


    useEffect(() => {
        document.body.className += ' pagenotfound';
    }, [])



    return (
        <div className='pagenotfound_container'>

            <h2>
                Page Not Found
            </h2>
        </div>
    )
}

export default PageNotFound