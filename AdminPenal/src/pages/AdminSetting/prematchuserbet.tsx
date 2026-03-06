import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import { useNavigate, useParams } from "react-router-dom";
import NewPagination from "../../components/new-pagination";
import { ADMIN_API } from "../../common/common";
import { postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import { useEffect, useState } from "react";

function Prematchuserbet() {
    const navigate = useNavigate()
    const DD = useSelector((e: any) => e.domainDetails);
    const { id } = useParams();
    const [pageData, setPageData] = useState<any>({})

    useEffect(() => {
        if(id) getPageData(id)
        return () => {
        }
      }, [id])

    const getPageData = async (sportId: string) => {
        let data: any = {
          api: ADMIN_API.RISK_ADMIN_BOOK_LIST,
          value: {
            id: sportId
          },
        }
    
        await postApi(data).then(function (response) {
          console.log(response, "response");
          setPageData(response.data.data)
    
        }).catch(err => {
          debugger
          if (err.response.data.statusCode === 401) {
            Logout()
            navigate('/login')
          }
        })
      }
    return (
        <>
            <div className='container '>
                <div className="top_header">
                    <div className="top_header_title mt-3">
                        <h5>Pre Match User Bet</h5>
                    </div>
                </div>
                <div className='my-account-section-content'>
                    <div className='my-account-section-content-table'>
                        <table id="resultTable" className="table01 margin-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>User Name</th>
                                    {
                                        pageData && pageData?.sportInfo && pageData?.sportInfo?.winnerSelection?.length > 0 ? pageData?.sportInfo?.winnerSelection?.map((value: string)=>{
                                            return( <th>{value}</th> )
                                        }) : pageData?.sportInfo?.name?.split(" v ").map((value:string)=>{
                                            return( <th>{value}</th> )
                                        })
                                    }
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    pageData && pageData?.adminBook && pageData?.adminBook?.length ? pageData?.adminBook?.map((item:any, i:number)=>{
                                        return(
                                            <tr>
                                                <td>{i + 1}</td>
                                                <td>{item?.userName}</td>
                                                <td>{item?.left}</td>
                                                <td>{item?.right}</td>
                                               {pageData && pageData?.sportInfo && pageData?.sportInfo?.winnerSelection?.length > 2 && <td>{item?.draw}</td> }
                                                <td>--</td>
                                            </tr>
                                        )
                                    }) : <>No Data</>
                                }
                              
                            </tbody>
                        </table>
                        <NewPagination />
                    </div>
                </div>
            </div >
        </>
    )
}

export default Prematchuserbet