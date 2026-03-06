import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Maintenance = () => {

  const navigate = useNavigate()

  const DD = useSelector((e: any) => e.domainDetails);
  
  useEffect(() => { 
         
    if(DD?.isMaintenance === false){
      navigate('/login')
    }
  }, [DD])

  return (
    <>

    <div className='box'>
      <h2 className="">Watch this space!</h2>
      <p className="">we're currently improving our site and working to get the back for</p>
      <button type="button" className="">00:00</button>
      <p className="for">GMT</p>
      <p className="">Apologies for any inconvenience this may cause.</p>
    </div>
    

  </>
  )
}

export default Maintenance