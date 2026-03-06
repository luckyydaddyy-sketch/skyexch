import React from 'react'
const NotFound = () => {
  return (
    <div className="container dashboard_main">
        <div style={{
            display:'flex',
            width:'100%',
            justifyContent:'center',
            alignItems:'center'
        }}>
            <img style={{width:'40%'}} 
             src="/images/notFound.svg" alt="not Found" />
        </div>
    </div>
  )
}

export default NotFound