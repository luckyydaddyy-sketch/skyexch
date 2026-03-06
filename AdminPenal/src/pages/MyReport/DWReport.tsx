import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ADMIN_API } from '../../common/common';
import { Logout } from '../../common/Funcation';
import { styleObjectBlackButton } from '../../common/StyleSeter';
import Pagination from '../../components/Pagination';
import { postApi } from '../../service';
import arrowImage from '../../assets/images/arrow-right2.png'
import moment from 'moment';
import NewPagination from '../../components/new-pagination';


interface Report {
  results: any[];
  page: string;
  limit: string;
  totalPages: number;
  totalResults: number;
}

interface Total {
  matchPl: number;
  matchStack: number;
  bookMakerStack: number;
  bookMakerPl: number;
  fancyStack: number;
  fancyPl: number;
  premPl: number;
  premStack: number;
  total: number;
}

function DWReport() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [userList, setUserList] = useState<any>({})
  const DD = useSelector((e: any) => e.domainDetails);
  const [isHover, setIsHover] = useState(false);
  const handleMouseEnter = () => { setIsHover(true); };
  const handleMouseLeave = () => { setIsHover(false); };

  const [filterForm, setFilterForm] = useState({
    id: '',
    from: '',
    to: '',
    filter: '',
  })


  const [selectedOption, setSelectedOption] = useState(null);


  const [tab, setTab] = useState('deposit')

  useEffect(() => {
    getPageData('', '', '', tab, '1')
    return () => {
    }
  }, [tab])


  const navigate = useNavigate()
  const [pageData, setPageData] = useState<any>({})
  useEffect(() => {
    // getPageData('', '', '', 'deposit', '1')
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
  const getPageData = async (FROM: string = '', TO: string = '', FILTER: string = '', TYPE: string = 'deposit', PAGE: string,) => {
    let data: any = {
      api: ADMIN_API.REPORT.DW,
      value: {
        // type: TYPE,
        // page: PAGE ? PAGE : '1',
        // limit: '10'
      },
    }
    if (TO !== '') { data.value.to = TO }
    if (FROM !== '') { data.value.from = FROM }
    if (FILTER !== '') { data.value.filter = FILTER }
    if (TYPE !== '') { data.value.type = TYPE }

    await postApi(data).then(function (response) {
      console.log(response);
      setPageData(response.data.data)

      console.log(response.data.data, ":::::");

    }).catch(err => {
      if (err.response.data.statusCode === 401) {
        Logout()
        navigate('/login')
      }
    })

  }
  const filterButtonClick = (TYPE: string) => {
    getPageData('', '', TYPE, '', '')
  }
  const handlePageClick = (e: any) => {
    console.log('page clicked', e);
    getPageData('', '', '', '', (e.selected + 1).toString())
  }

  const userSelectChange = (e: any) => {
    setFilterForm({ ...filterForm, id: e.value })
  }
  const filterSubmit = () => {
    getPageData(startDate.toString(), endDate.toString(), '', tab, '1')
  }
  return (
    <>
      <div className="container full-wrap">
        <div className="top_header">
          <div className="top_header_title">
            <h5>DEPOSIT / WITHDRAWL REQUEST</h5>
          </div>
        </div>

        <section className='my-account-section'>
          <div className='my-account-section_header'>
            <ul className="input-list">


              <li><label>Period</label></li>
              <li>
                <input style={{ width: "150px", padding: "6px !important" }} value={`${moment(startDate).format('YYYY-MM-DD hh:mm')}`} id="betsstartDate" className="cal-input" type="datetime-local" placeholder="YYYY-MM-DD" onChange={(e:any)=> setStartDate(e?.target?.value)}/>
                &nbsp; to &nbsp;
                <input style={{ width: "150px", padding: "6px !important" }} id="betsendDate" value={`${moment(endDate).format('YYYY-MM-DD hh:mm')}`} className="cal-input" type="datetime-local" placeholder="YYYY-MM-DD" onChange={(e:any)=> setEndDate(e?.target?.value)}/>
              </li>
              <li><a id="" className="btn-send" style={styleObjectBlackButton(DD?.colorSchema, true)}>Search</a></li>
            </ul>

            {/* <div className="account_tabs_filter d_flex" style={{ margin: "0 5px 5px 0" }}>
              <div className='s_mx-10'>
                <input style={styleObjectBlackButton(DD?.colorSchema, true)} type="button" onClick={() => filterButtonClick('today')} value="Just For Today" name="today" id="today" className="btn btn-default-customize" />
              </div>
              <div className='s_mr-10'>
                <input style={styleObjectBlackButton(DD?.colorSchema, true)} type="button" onClick={() => filterButtonClick('yesterday')} value="From Yesterday" name="yesterday" id="yesterday" className="btn btn-default-customize" />
              </div>
              <div>
                <input onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={styleObjectBlackButton(DD?.colorSchema, true)} type="button" value="Submit" name="getPL" id="getPL" className="submit-btn btn_black" onClick={() => filterSubmit()} />
              </div>
            </div> */}
          </div>

          <div className='my-account-section-content'>
            {/* <div>
            <ul className="agentlist" ><li>
              <a href="javascript:void(0)" className="agent-bread-cum sub-agent" data-id="1">
                <span className="blue-bg text-white">COM</span>
                <strong id="1">galaxy</strong>
              </a>
              <img src={arrowImage} />
            </li></ul>
          </div> */}
            <div className='my-account-section-content-table'>
              <table id="resultTable" className="table01 margin-table">
                <thead>
                  {tab === "withdrawal" ? <tr>
                    <th className="light-grey-bg">Account No</th>
                    <th className="light-grey-bg">User Name</th>
                    <th className="light-grey-bg">Amount	</th>
                    <th className="light-grey-bg">Bank Name</th>
                    <th className="light-grey-bg">Descriptions</th>
                    <th className="light-grey-bg">Holder Name</th>
                    <th className="light-grey-bg">IFSC Code</th>
                    <th className="light-grey-bg">Mobile No</th>
                    <th className="light-grey-bg">type</th>
                    <th className="light-grey-bg">Created At</th>
                  </tr> : <tr>
                    <th className="light-grey-bg">User Name</th>
                    <th className="light-grey-bg">Amount	</th>
                    <th className="light-grey-bg">Mobile No</th>
                    <th className="light-grey-bg">Transaction Id</th>
                    {/* <th className="light-grey-bg">Descriptions</th>
                  <th className="light-grey-bg">Holder Name</th>
                  <th className="light-grey-bg">IFSC Code</th>
                  <th className="light-grey-bg">type</th> */}
                    <th className="light-grey-bg">Created At</th>
                  </tr>
                  }
                </thead>
                <tbody>
                  {
                    pageData?.amountInfo && pageData?.amountInfo?.length > 0 ? pageData?.amountInfo?.map((item: any, i: any) => {
                      return (
                        <>
                          {tab === "withdrawal" ? <tr>
                            <td className="">{item?.accountNo}</td>
                            <td className="">{item?.userName}</td>
                            <td className="">{item?.amount}</td>
                            <td className="">{item?.bankName}</td>
                            <td className="">{item?.descrpitions}</td>
                            <td className="">{item?.holderName}</td>
                            <td className="">{item?.ifscCode}</td>
                            <td className="">{item?.mobileNo}</td>
                            <td className="">{item?.type}</td>
                            <td className="">{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                          </tr>
                            : <tr>
                              <td className="">{item?.userName}</td>
                              <td className="">{item?.amount}</td>
                              <td className="">{item?.mobileNo}</td>
                              <td className="">{item?.transactionId}</td>
                              <td className="">{moment(item.createdAt).format('DD-MM-YYYY hh:mm A')}</td>
                            </tr>}


                        </>
                      )
                    }) : <><h2>No data</h2></>
                  }

                </tbody>
                <tfoot>
                  <tr>
                    {/* <th>
                    <strong>Total</strong>
                  </th> */}
                    {/* <th className="">{pageData?.total?.matchPl}</th>
                  <th className="text-green">{pageData?.total?.fancyStack}</th>
                  <th className="text-green">{pageData?.total?.bookMakerPl}</th>
                  <th className="text-green">{pageData?.total?.bookMakerStack}</th>
                  <th className="text-green">{pageData?.total?.fancyPl}</th>
                  <th className="text-green">{pageData?.total?.fancyStack}</th>
                  <th className="text-green">{pageData?.total?.premPl}</th>
                  <th className="text-green">{pageData?.total?.premStack}</th>
                  <th className="text-danger">{pageData?.total?.total}</th> */}
                  </tr>
                </tfoot>
              </table>
              {/* {pageData?.report?.totalPages === 1 || pageData?.report?.totalPages === 0 ? '' : <Pagination handlePageClick={handlePageClick} totalPages={pageData?.report?.totalPages} />} */}
              <NewPagination />

            </div>
          </div>

        </section>
      </div>
    </>
  )
}

export default DWReport