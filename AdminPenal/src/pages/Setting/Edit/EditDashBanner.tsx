
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ADMIN_API } from '../../../common/common'
import { Logout } from '../../../common/Funcation'
import { styleObjectBlackButton } from '../../../common/StyleSeter'
import ImageUpload from '../../../components/ImageUpload'
import { postApi, notifyError, notifyMessage } from '../../../service'
import { addBanner } from '../interface'

function EditDashBanner() {

  const navigate = useNavigate()
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => { setIsHover(true); };
  const handleMouseLeave = () => { setIsHover(false); };
  const [formData, setFormData] = useState<addBanner>({
    name: '',
    image: '',
    active: true,
  })
  const { id } = useParams()
  const MODE = window.location.pathname.includes('edit-banner') && id ? 'EDIT' : 'ADD'


  useEffect(() => {

    if (id && MODE === "EDIT") {
      getEditData()
      setFormData({
        ...formData,
      })
    } else if (MODE === "EDIT" && !id) {
      navigate('/banner')
    }
    return () => {
    }
  }, [id])

  const getEditData = async () => {
    let data: any = {
      api: ADMIN_API.SETTING.BANNER.GET_ONE,
      value: {
        id: id
      }
    }
    await postApi(data).then(function (response) {
      console.log(response)
      setFormData({
        name: response.data.data.name,
        image: response.data.data.image,
        active: response.data.data.active
      })
      // setPageData(response.data.data)
      // notifyMessage(response.data.message)
      // navigate('/dashboard-images')

    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }


  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target
    if (type === 'radio') {
      setFormData({
        ...formData,
        [name]: JSON.parse(value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleImageUpload = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value })
  }


  const getPageData = async () => {
    let data: any = {
      api: id && MODE === "EDIT" ? ADMIN_API.SETTING.BANNER.UPDATE : ADMIN_API.SETTING.BANNER.CREATE,
      value: formData
    }
    if (id && MODE === 'EDIT') {
      data.value.id = id
    } else {
      data.value.domain = id
    }


    await postApi(data).then(function (response) {
      console.log(response)
      // setPageData(response.data.data)
      notifyMessage(response.data.message)
      navigate('/banner')

    }).catch(err => {
      notifyError(err.response.data.message)
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }


  const handleSubmitClick = (e: any) => {
    e.preventDefault()
    console.log(formData);

    getPageData()
  }

  const handleCancelClick = (e: any) => {
    e.preventDefault()
    navigate('/banner')
  }
  return (
    <div className="container banking website edit main_wrap" >

      <div className='top_header'>
        <div className='top_header_title align-items-center mt-3'>
          <h5 className="font-weight-bold">Update Dashboard Image</h5>
        </div>
      </div>

      <div className='edit_body'>
        <div className='card 5 '>
          <div className='row '>
            <div className='col-6 p_15'>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="domain" className='mb_5 d_block'>Name:</label>
                <input className="form-control" name="name" type="text" onChange={(e) => handleInputChange(e)} value={formData.name} />
              </div>

              <ImageUpload label='Image' topClass='mb-3 p_0 col-12' filename={formData.image} name='image' setFileName={handleImageUpload} />

              <div className="mb-3 col-3 card_body_item">
                <label htmlFor="active">Status:</label> <br />
                <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                  <div className="btn-group credit-type" role="group" aria-label="Basic radio toggle button group" onChange={(e) => handleInputChange(e)}>
                    <input className="btn-check" type="radio" name='active' value={JSON.parse('true')} id="on" checked={formData.active === true} />
                    <label className="btn btn-outline-primary shadow-none" htmlFor="on">On</label>
                    <input className="btn-check" id="off" type="radio" name='active' value={JSON.parse('false')} checked={formData.active === false} />
                    <label className="btn btn-outline-primary shadow-none" htmlFor="off">Off</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="card_footer">
              <input onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, isHover)} className="btn_black" type="submit" value="Save" onClick={(e) => handleSubmitClick(e)} />
              <button type='button' onClick={(e) => handleCancelClick(e)} className="btn btn-sm btn-default">Cancel</button>
            </div>
          </div>


        </div>
      </div >
    </div>
  )
}

export default EditDashBanner