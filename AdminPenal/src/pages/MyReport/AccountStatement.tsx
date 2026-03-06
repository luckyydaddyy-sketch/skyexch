import moment from 'moment';
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ADMIN_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import { styleObjectBlackButton } from '../../common/StyleSeter';
import Pagination from '../../components/Pagination';
import SkyPopup from '../../components/SkyPopup';
import { postApi } from '../../service';

function AccountStatement() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => { setIsHover(true); };
  const handleMouseLeave = () => { setIsHover(false); };
  const [selectedOption, setSelectedOption] = useState(null);
  const [betView, setBetView] = useState<any>()
  const [OpenModal, setOpenModal] = useState<boolean>(false);

  const [User, setUser] = useState<any>({})
  const [filterForm, setFilterForm] = useState({
    id: '',
    from: '',
    to: '',
    reportType: '',
    report: '',
  })

  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  const [userList, setUserList] = useState<any>({})
  useEffect(() => {
    getPageData()
    getUserList()
    return () => {
    }
  }, [])


  const getUserList = async () => {
    let data: any = {
      api: ADMIN_API.REPORT.USER_LIST,
      value: {
      },
    }


    await postApi(data).then(function (response) {
      console.log(response);
      let options: any[] = [{ value: '', label: 'all' }]
      response.data.data.userInfo.forEach((item: any) => {
        const option: any = { value: item._id, label: item.user_name }
        options.push(option)
      })
      setUserList(options)

    }).catch(err => {
      debugger
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }


  const getPageData = async (ID: string = '', FROM: string = '', TO: string = '', FILTER: any = { reportType: '', report: '' }, PAGE: string = '1',) => {
    //TYPE: string, PAGE: string, SEARCH: string = ''
    let data: any = {
      api: ADMIN_API.REPORT.ACCOUNT_STATEMENT,
      value: {
        // type: TYPE,
        page: PAGE ? PAGE : '1',
        limit: '50'
      },
    }
    //reportType
    //report

    if (ID !== '') { data.value.id = ID }
    if (TO !== '') { data.value.to = TO }
    if (FROM !== '') { data.value.from = FROM }
    if (FILTER.reportType !== '' && FILTER.report !== '') {
      data.value.reportType = FILTER.reportType
      data.value.report = FILTER.report
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
  const handlePageClick = (e: any) => {
    getPageData('', '', '', undefined, (e.selected + 1).toString())
  }



  const userClick = (USER: any) => {
    if (USER.agent_level && USER.agent_level !== 'PL') {
      setUser(USER)
      getPageData(USER._id, startDate.toString(), endDate.toString(), undefined)

    }
  }
  const getAdminClick = () => {
    setUser({})
    getPageData('', '', '', undefined)
  }


  const remarkClick = async (item: any) => {
    if (item.matchId && !!item?.openSportBetUserId) {

      console.log('click', item);
      let data: any = {
        api: ADMIN_API.REPORT.STATEMENT_BET_VIEW,
        value: {
          id: item?.openSportBetUserId,
          matchId: item.matchId,
          betType: item.betType
        },
      }
      if ((item.betType === "session" || item.betType === "premium") && item.selection !== '') {
        data.value.selection = item.selection;
      }
      await postApi(data).then(function (response) {
        console.log(response);
        setBetView(response.data.data)

      }).catch(err => {
        debugger
        setBetView({})
        if (err.response.data.statusCode === 401) {
          Logout()
          navigate('/login')
        }
      })
      setOpenModal(true)
    } else {
      console.log('nothing')
    }

  }
  const userSelectChange = (e: any) => {
    setFilterForm({ ...filterForm, id: e.value })
  }
  const filterSubmit = () => {
    getPageData(filterForm.id, startDate.toString(), endDate.toString(), { reportType: filterForm.reportType, report: filterForm.report })
  }

  return (
    <>
      <div className="container main_wrap">
        <div className="top_header">
          <div className="top_header_title  mt-3">
            <h5>Account Statement</h5>
          </div>
        </div>

        <section className='my-account-section'>
          <div className='my-account-section_header'>
            <div className="account_tabs_filter flex-align s_mb-10">
              <label> Search by client: </label>
              <div className="input_group">
                <Select
                  defaultValue={selectedOption}
                  options={userList}
                  isSearchable
                  onChange={(e) => userSelectChange(e)}
                  className='select-height'
                />
              </div>

              <label> From: </label>
              <div className="input_group from-to">
                {/* <input type="date" name="from_date" className="form-control hasDatepicker" placeholder="08-09-2022" value="" /> */}
                <div className=''>
                  <ReactDatePicker selected={startDate} className='form-control hasDatepicker' onChange={(date: Date) => setStartDate(date)} />
                </div>
              </div>

              <label> To: </label>
              <div className="input_group from-to">
                {/* <input type="date" name="from_date" className="form-control hasDatepicker" placeholder="08-09-2022" value="" /> */}
                <div className=''>
                  <ReactDatePicker selected={endDate} className='form-control hasDatepicker' onChange={(date: Date) => setEndDate(date)} />
                </div>
              </div>

              <label> Report Type:  </label>
              <div className="input_group">
                <select name="report_type" id="report_type" className="form-control" onChange={(e) => {
                  setFilterForm({ ...filterForm, reportType: e.target.value })
                }}>
                  <option value=""> All</option>
                  <option value="deposit"> Deposit/Withdraw Report</option>
                  <option value="game"> Game Report</option>
                </select>
              </div>

              <label> Report For:  </label>
              <div className="input_group">

                <select name="report_type" id="report_type" className="form-control" disabled={filterForm.reportType === 'deposit' || filterForm.reportType === ''} onChange={(e) => {
                  setFilterForm({ ...filterForm, report: e.target.value })
                }}>
                  <option value="up/down">Upline/Downline</option>
                  <option value="up">Upline</option>
                  <option value="down">Downline</option>
                </select>
              </div>
              <input onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, true)} onClick={() => filterSubmit()} type="button" value="Submit" name="acntbtn" className="submit-btn btn_black p-2 s_ml-10" />
            </div>
          </div>

          <div className="table-responsive1">
            <table id="resultTable" className="table01 margin-table account-statement">
              <thead>
                <tr>
                  <th className="light-grey-bg">Sr no</th>
                  <th className="light-grey-bg">Date/Time</th>
                  <th className="light-grey-bg">Credit</th>
                  <th className="light-grey-bg">Debit</th>
                  <th className="light-grey-bg">Balance</th>
                  <th className="light-grey-bg">Remark</th>
                  <th className="light-grey-bg">From/To</th>
                </tr>
              </thead>
              <tbody id="tbdata">
                <tr> <td colSpan={7}> </td> </tr>
                {pageData.userStatement && pageData.userStatement?.results?.length > 0 ? pageData.userStatement.results.map((item: any, i: any) => {
                  return (
                    <>
                      <tr>
                        <td style={{ width: "110px" }} >{i + 1}</td>
                        <td style={{ width: "150px" }} >{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')} </td>
                        <td style={{ width: "110px" }} className="text-green">{item.credit}</td>
                        <td style={{ width: "110px" }} className="text-danger">{item.debit}</td>
                        <td>{item.balance}</td>
                        <td><span onClick={() => remarkClick(item)} style={{ cursor: "pointer" }}> <u>{item.Remark ? item.Remark : '-'} </u> </span>
                        </td>
                        <td>{item.from?.user_name}/{item.to?.user_name}</td>
                      </tr>
                    </>
                  )

                }) : <h2>No Record</h2>}


                <tr> <td colSpan={7}> </td> </tr>


              </tbody>
            </table>
            {pageData?.userStatement?.totalPages === 1 || pageData?.userStatement?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.userStatement?.totalPages} />}

          </div>
          <SkyPopup
            title={`Bet Report`}
            OpenModal={OpenModal}
            closeModel={() => setOpenModal(false)}
            closebtn={true}
          >

            <div>
              <table role="table" className="table b-table table-bordered">
                <tbody><tr role="row" className="pink-bg">
                  <th className="text-left">No</th>
                  <th className="text-center">Nation</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Side</th>
                  <th className="text-left">Rate</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Win/Loss</th>
                  <th className="text-center">Place Date</th>
                </tr>
                  {betView && betView.betInfo?.length > 0 ?
                    <>
                      {
                        betView.betInfo?.map((item: any, i: any) => {
                          return (
                            <tr className="cyan-bg">
                              <td>{i + 1}</td>
                              <td align="center"> {item.selection} </td>
                              <td align="center">{item.betType}</td>
                              <td align="center"> {item.betSide} </td>
                              <td> {item.oddsUp} </td>
                              <td>{item.stake}</td>
                              <td className={item.tType === "lost" ? 'text-color-red' : "text-color-green"}>{item.profit}</td>
                              <td align="center">{moment(item.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                            </tr>
                          )
                        })
                      }
                      <tr>
                        <td colSpan={6} align="right"><strong>Total</strong></td>
                        <td colSpan={2} className={betView?.total > 0 ? "text-color-green" : "text-color-red"}>{betView?.total}</td>
                      </tr>
                    </> : <h3>No Data</h3>}
                </tbody>
              </table>
            </div>
          </SkyPopup>
        </section>
      </div>
    </>
  )
}

export default AccountStatement