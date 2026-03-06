import { useState } from "react";
import { Logout } from "../../common/Funcation";
import { ADMIN_API } from "../../common/common";
import SearchInput from "../../components/SearchInput"
import { postApi } from "../../service";
import { useNavigate } from "react-router-dom";

function AupdateFancyStatus() {
    const navigate = useNavigate()
    const [pageData, setPageData] = useState<any>({})

    const getPageData = async (id: string) => {
        let data: any = {
            api: ADMIN_API.SETTING.MANAGE_FANCY.LIST_OF_BET,
            value: {
                gameId: id
            },
        }

        await postApi(data).then(function (response) {
            console.log(response);
            setPageData(response.data.data)
        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    const handleSubmit = (search: any) => {
        getPageData(search)
    }
    return (
        <div className="container  settings full-wrap" >
            <div className='top_header'>
                <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
                    <h5>Update Fancy Status</h5>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <SearchInput outsideBtn placeholder="Enter Event Id..." style={{ display: "inline-block" }} searchSubmit={handleSubmit} />
                    {/* <div className="search-btn"><button style={{width: "80px"}}>Search</button></div> */}
                </div>
            </div>
            <table className="table01 margin-table">
                <thead>
                    <tr className="light-grey-bg">
                        <th> Fancy Id </th>
                        <th> Fancy Name </th>
                        <th> Match Name	</th>
                        <th> Action	</th>
                    </tr>
                </thead>
                <tbody id="matches-table">
                    {
                        pageData && pageData?.betUnique && pageData?.betUnique?.length ? pageData?.betUnique?.map((item: any) => {
                            return (
                                <tr>
                                    <td>{pageData?.sportInfo?.type}</td>
                                    <td>{item}</td>
                                    <td>{pageData?.sportInfo?.name}</td>
                                    <td>-</td>
                                </tr>
                            )
                        }) :
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>


                    }

                </tbody>
            </table>
        </div>
    )
}

export default AupdateFancyStatus