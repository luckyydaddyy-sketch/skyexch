
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ADMIN_API } from '../../../common/common'
import { Logout } from '../../../common/Funcation'
import { styleObjectBlackButton } from '../../../common/StyleSeter'
import ImageUpload from '../../../components/ImageUpload'
import { postApi, notifyMessage, notifyError } from '../../../service'
import { AddDashBoardImage } from '../interface'

function EditDashBoard() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<AddDashBoardImage>({
    title: '',
    image: '',
    link: '',
    Width: '',
    gameCode: '',
    gameName: '',
    gameType: '',
    platform: '',
    gameLimit: '',
    catalog: '',
    isLatest: false,
  })
  const { id } = useParams()
  const MODE = window.location.pathname.includes('edit-dashboard') && id ? 'EDIT' : 'ADD'

  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => { setIsHover(true); };
  const handleMouseLeave = () => { setIsHover(false); };
  useEffect(() => {

    if (id && MODE === "EDIT") {
      getEditData()
      setFormData({
        ...formData,
      })
    } else if (MODE === "EDIT" && !id) {
      navigate('/dashboard-images')
    }
    return () => {
    }
  }, [id])

  const getEditData = async () => {
    let data: any = {
      api: ADMIN_API.SETTING.DASHBOARD.GET_ONE,
      value: {
        id: id
      }
    }
    await postApi(data).then(function (response) {
      console.log(response)
      setFormData({
        title: response.data.data.title,
        link: response.data.data.link,
        image: response.data.data.image,
        Width: response.data.data.Width,
        gameCode: response.data.data.gameCode,
        gameName: response.data.data.gameName,
        gameType: response.data.data.gameType,
        platform: response.data.data.platform,
        gameLimit: response.data.data.gameLimit,
        catalog: response.data.data?.catalog,
        isLatest: response.data.data?.isLatest
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
    const { name, value } = e.target
    if (name === 'isLatest') {
      setFormData({
        ...formData,
        [name]: !formData.isLatest
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
      api: id && MODE === "EDIT" ? ADMIN_API.SETTING.DASHBOARD.UPDATE : ADMIN_API.SETTING.DASHBOARD.CREATE,
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
      navigate('/dashboard-images')

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
    navigate('/dashboard-images')
  }

  return (
    <div className="container banking website edit main_wrap">
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
                <label htmlFor="domain" className='mb_5 d_block'>Title:</label>
                <input className="form-control" onChange={(e) => handleInputChange(e)} name="title" type="text" value={formData.title} />
              </div>

              <div className="mb-3 p_0 col-12">
                <label htmlFor="theme" className='mb_5 d_block'>Link:</label>
                <input className="form-control" onChange={(e) => handleInputChange(e)} name="link" type="text" value={formData.link} />
              </div>

              <div className="mb-3 p_0 col-12">
                <label htmlFor="theme" className='mb_5 d_block'>Size:</label>
                <select className="form-control" onChange={(e) => handleInputChange(e)} id="Width" name="Width" value={formData.Width}>
                  <option value="fullSize">Full Size</option>
                  <option value="halfWidth" >Half Width</option>
                  <option value="squareSize">Square Size</option>
                </select>
              </div>

              <div className="mb-3 p_0 col-12">
                <label htmlFor="theme" className='mb_5 d_block'>Catalog:</label>
                <select className="form-control" onChange={(e) => handleInputChange(e)} id="catalog" name="catalog" value={formData?.catalog}>
                  <option value="">none</option>
                  <option value="Game Shows">Game Shows</option>
                  <option value="Baccarat" >Baccarat</option>
                  <option value="Roulette">Roulette</option>
                  <option value="Dice">Dice</option>
                  <option value="Traditional Games">Traditional Games</option>
                  <option value="Card Games">Card Games</option>
                  <option value="Others">Others</option>
                  <option value="Table">Table</option>
                  <option value="Slot">Slot</option>
                  <option value="Fishing">Fishing</option>
                  <option value="Egame">Egame</option>
                </select>
              </div>

              <div className="mb-3 p_0 col-12 form-check form-switch large-switch">
                <input className="form-check-input" style={{ marginLeft: "80px", width: "75px", height: '33px' }} type="checkbox" id="isLatest" onChange={(e) => handleInputChange(e)} checked={formData?.isLatest} name="isLatest" />
                <label className="mb_5 d_block form-check-label" htmlFor="domain">isLatest:</label>
              </div>
              {/* gameCode, gameName, gameType, platform, and gameLimit */}
              <div className="mb-3 p_0 col-12">
                <label htmlFor="domain" className='mb_5 d_block'>Game Code:</label>
                <input className="form-control" onChange={(e) => handleInputChange(e)} name="gameCode" type="text" value={formData.gameCode} />
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="domain" className='mb_5 d_block'>Game Name:</label>
                <input className="form-control" onChange={(e) => handleInputChange(e)} name="gameName" type="text" value={formData.gameName} />
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="domain" className='mb_5 d_block'>Game Type:</label>
                <input className="form-control" onChange={(e) => handleInputChange(e)} name="gameType" type="text" value={formData.gameType} />
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="domain" className='mb_5 d_block'>Platform:</label>
                <input className="form-control" onChange={(e) => handleInputChange(e)} name="platform" type="text" value={formData.platform} />
              </div>
              <div className="mb-3 p_0 col-12">
                <label htmlFor="domain" className='mb_5 d_block'>Game Limit:</label>
                <input className="form-control" onChange={(e) => handleInputChange(e)} name="gameLimit" type="text" value={formData.gameLimit} />
              </div>

              <ImageUpload label='Image' topClass='mb-3 p_0 col-12' filename={formData.image} name='image' setFileName={handleImageUpload} />

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

export default EditDashBoard