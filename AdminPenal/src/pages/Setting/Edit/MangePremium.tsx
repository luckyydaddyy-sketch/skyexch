
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ADMIN_API } from '../../../common/common';
import { Logout } from '../../../common/Funcation';
import { styleObjectBlackButton } from '../../../common/StyleSeter';
import SkyPopup from '../../../components/SkyPopup'
import { postApi } from '../../../service';
import { manageBetList, managehistoryPre, managePremiumInterface } from '../interface';

const MangePremium = () => {
  const { id, type } = useParams()
  const [OpenModal, setOpenModal] = useState<boolean>(false);
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const [hoverId, setHoverId] = useState({ isHover: '' })
  const [declaredWinner, setDeclaredWinner] = useState<string[]>([])
  const [clickedWinner, setClickedWinner] = useState<manageBetList>()
  const handleMouseEnter = (id: string = '') => {
    if (id) { setHoverId({ isHover: id }) }
    setIsHover(true);
  };
  const handleMouseLeave = (id: string = '') => {
    if (id) { setHoverId({ isHover: '' }) }
    setIsHover(false);
  };
  const showAlert = async (item: managehistoryPre) => {
    if (window.confirm("Are you sure you want to rollback result?") === true) {
      let data: any = {
        api: ADMIN_API.SETTING.PREMIUM_HISTORY.ROLL_BACK_WINNER,
        value: {
          id: id,
          selection: item?.selection,
        },
      }
      await postApi(data).then(function (response) {
        console.log(response);
        getPageData()

      }).catch(err => {
        if (err.response.data.statusCode === 401) {
          Logout()
          navigate('/login')
        }
      })
    }
  }
  const [pageData, setPageData] = useState<managePremiumInterface>()
  const navigate = useNavigate()
  useEffect(() => {
    getPageData()
    return () => {
    }
  }, [])

  const getPageData = async () => {
    let data: any = {
      api: type === 'manage' ? ADMIN_API.SETTING.MANAGE_PREMIUM.LIST_OF_BET : ADMIN_API.SETTING.PREMIUM_HISTORY.LIST_OF_BET,
      value: {
        id: id
      },
    }


    await postApi(data).then(function (response) {
      console.log(response);
      setPageData(response.data.data)

    }).catch(err => {
      debugger
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }
  const declareResultClick = (item: manageBetList) => {
    setOpenModal(true)
    setClickedWinner(item)
  }
  const onRadioChange = (name: string) => {
    console.log("declaredWinner:: befor:: ", declaredWinner);
    if(name === 'cancel'){
      if(declaredWinner?.includes(name)){
        setDeclaredWinner([])
      }else{
        setDeclaredWinner(['cancel'])
      }
    }else{
      if(declaredWinner?.includes(name)){
        setDeclaredWinner((pres)=>pres?.filter((p)=> p !== name));
      }else{
        setDeclaredWinner((pres)=>[...pres, name]);
      }
    }
    console.log("declaredWinner:: ", declaredWinner);
    
  }
  const submitWinnerPopup = async (e: any) => {
    e.preventDefault()
    let data: any = {
      api: ADMIN_API.SETTING.MANAGE_PREMIUM.DECLARE_WINNER,
      value: {
        id: id,
        selection: clickedWinner?.name,
        winner: declaredWinner
      },
    }


    await postApi(data).then(function (response) {
      console.log(response);
      setOpenModal(false)
      getPageData()


    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })
  }
  return (
    <>
      <div className="container banking website edit main_wrap" >
        <div className='top_header'>
          <div className='top_header_title align-items-center mt-3'>
            <h5 className="font-weight-bold">Manage <strong>{pageData?.sportInfo.name} [{pageData?.sportInfo.openDate}]</strong> Premium Bets <strong>Declare</strong></h5>
          </div>
        </div>

        <div className='edit_body'>
          <table className="table01 margin-table">
            <thead>
              <tr className="light-grey-bg">
                <th>No.</th>
                <th>Match Name</th>
                {type !== 'manage' ? <th>Winner </th> : <></>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="matches-table">
              {type === 'manage' ?
                pageData?.betList && pageData?.betList.length > 0 ? pageData.betList.map((item: manageBetList, i: any) => {
                  return (
                    <tr>
                      <td style={{ width: "5%" }}>
                        {i + 1}
                      </td>
                      <td>
                        <span className="text-primary">{item.name}</span>
                      </td>

                      <td style={{ width: "20%" }}>

                        {type === 'manage' ? <>

                          <button onMouseEnter={() => handleMouseEnter(item.name)} onMouseLeave={() => handleMouseLeave(item.name)} style={styleObjectBlackButton(DD?.colorSchema, hoverId.isHover === item.name)} type="button" className="btn btn-warning btn-sm shadow-none btn_black match_view" onClick={() => declareResultClick(item)}>Declare Result</button>
                        </> : <></>}
                      </td>
                    </tr>

                  )
                }) : <h2>No Data</h2>
                :
                pageData?.history && pageData?.history.length > 0 ? pageData.history.map((item: managehistoryPre, i: any) => {
                  return (
                    <tr>
                      <td style={{ width: "5%" }}>
                        {i + 1}
                      </td>
                      <td>
                        <span className="text-primary">{item.selection}</span>
                      </td>
                      <td>{item?.winner}</td>
                      <td style={{ width: "20%" }}>

                        {type === 'rollback' ? <>
                          <button onMouseEnter={() => handleMouseEnter(item.selection)} onMouseLeave={() => handleMouseLeave(item.selection)} style={styleObjectBlackButton(DD?.colorSchema, hoverId.isHover === item.selection)} type="button" className="btn btn-warning btn-sm shadow-none btn_black match_view" onClick={() => showAlert(item)}>Rollback Result</button>
                        </> : <></>}
                      </td>
                    </tr>

                  )
                }) : <h2>No Data</h2>
              }
            </tbody>
          </table>
        </div >
      </div>

      <UpdateModal
        title={`Winner (incl. super over)`}
        OpenModal={OpenModal}
        closeModel={() => setOpenModal(false)}
        type='status'
        clickedWinner={clickedWinner}
        radioChange={onRadioChange}
        declaredWinner={declaredWinner}
        submitForm={submitWinnerPopup}
      // onPasswordChange={onPasswordChang}
      // addDataFrom={statusUpdate}
      // Validator={Validator}
      />

    </>

  )
}

export default MangePremium




export const UpdateModal = (props: any) => {
  const { title, OpenModal, closeModel, submitForm, radioChange, addDataFrom, clickedWinner, declaredWinner } = props
  console.log('::::;', addDataFrom);

  return (
    <>
      <SkyPopup
        title={title}
        OpenModal={OpenModal}
        closeModel={closeModel}
        closebtn={true}
        submit={submitForm} >
        <div className='view_winner'>
          <div className="modal-body pl_15 pr_15 pb_0 pt_0" >
            {clickedWinner?.winnerSelection.map((item: string) => (

              <div key={item} className="form-check d_flex d_flex_align_center mb_10" >
                {/* <input onClick={() => radioChange(item)} className="form-check-input mr_10" type="checkbox" id={item} name={item} value={item} checked={declaredWinner.includes(item)} /> */}
                <input style={{appearance:"auto"}} onChange={() => radioChange(item)} className="form-check-input mr_10" type="checkbox" id={item} name={item} value={declaredWinner.includes(item)}  />
                <label onChange={() => radioChange(item)} htmlFor={item} className="form-check-label">{item}</label>
              </div>
            ))
            }
            <div className="form-check d_flex d_flex_align_center " >
              <input style={{appearance:"auto"}} onChange={() => radioChange('cancel')} className="form-check-input mr_10" type="checkbox" id="cancel" name="team_winner" value={declaredWinner.includes('cancel')} />
              <label onChange={() => radioChange('cancel')} htmlFor="cancel" className="form-check-label">Cancel</label>
            </div>

          </div>
        </div>
      </SkyPopup>
    </>
  )
}