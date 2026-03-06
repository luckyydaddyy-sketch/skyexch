import { useNavigate } from "react-router-dom"
import SearchInput from "../../components/SearchInput"
import SkyPopup from "../../components/SkyPopup"
import { useState, useEffect } from "react";
import { ADMIN_API } from "../../common/common";
import { getApi, notifyError, notifyMessage, postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import { WebSiteList } from "../Setting/interface";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import { useSelector } from "react-redux";

function AAddWebsiteSetting() {
    const navigate = useNavigate()
    const DD = useSelector((e: any) => e.domainDetails);
    const [open, setOpen] = useState(false);
    const [pageData, setPageData] = useState<any>({})
    const [userData, setUserData] = useState<any>({})
    const [inActiveSite, setInActiveSiteData] = useState<any>({})
    useEffect(() => {
        getPageData('All', '1')
        return () => {
        }
    }, [])

    const getPageData = async (TYPE: string, PAGE: string) => {
        let data = {
            api: ADMIN_API.SETTING.WEBSITE.LIST,
            // value: {
            //   type: TYPE,
            //   page: PAGE ? PAGE : '1',
            //   limit: '10'
            // },
        }

        await getApi(data).then(function (response) {
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

    const openUserListPopUp = async (e: any, item: WebSiteList) => {
        e.preventDefault();
        setOpen(true)

        let data: any = {
            api: ADMIN_API.SETTING.USERS.GET_USER_COUNT,
            value: {
                id: item?._id
            }
        }

        await postApi(data).then(function (response) {
            console.log("openUserListPopUp :: ", response);
            setUserData(response.data.data)

        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    const inActiveSiteListPopUp = async (e: any) => {
        e.preventDefault();
        // setOpen(true)

        let data: any = {
            api: ADMIN_API.SETTING.WEBSITE.IN_ACTIVE_LIST,

        }
        await getApi(data).then(function (response) {
            console.log("openUserListPopUp :: ", response);
            setInActiveSiteData(response.data.data)

        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    const handleSubmit = async (title: string) => {
        // api: id && MODE === "EDIT" ? ADMIN_API.SETTING.WEBSITE.UPDATE : ADMIN_API.SETTING.WEBSITE.CREATE,
        let data: any = {
            api: ADMIN_API.SETTING.WEBSITE.ADD,
            value: {
                title: title,
            },
        }

        await postApi(data).then(function (response) {
            console.log(response)
            // setPageData(response.data.data)
            notifyMessage(response.data.message)
            // getDomainDetails()
            getPageData('All', '1');
        }).catch(err => {
            notifyError(err.response.data.message)
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    const webSiteActiveDeActive = async (id: string) => {
        // api: id && MODE === "EDIT" ? ADMIN_API.SETTING.WEBSITE.UPDATE : ADMIN_API.SETTING.WEBSITE.CREATE,
        let data: any = {
            api: ADMIN_API.SETTING.WEBSITE.ACTIVE,
            value: {
                id
            },
        }

        await postApi(data).then(function (response) {
            console.log(response)
            // setPageData(response.data.data)
            notifyMessage(response.data.message)
            // getDomainDetails()
            getPageData('All', '1');
        }).catch(err => {
            notifyError(err.response.data.message)
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    return (<>
        <div className="container settings full-wrap">
            <div className='top_header'>
                <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
                    <h5>Add Website</h5>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <SearchInput outsideBtn searchSubmit={handleSubmit} className="add-web" placeholder="Enter Website Name" btnName="Add" style={{ display: "inline-block" }} />
                </div>
            </div>
            <div className='flex-align justify-end' style={{ marginBottom: "10px" }}>
                <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "115px" }}>User Message</button></div>
                <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "115px" }}>Mgmt. Message</button></div>
                <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "115px" }}>Website Links</button></div>
                <div className="search-btn"><button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "115px" }}>Inactive Domains</button></div>
            </div>
            <table className="table01 margin-table">
                <thead>
                    <tr className="light-grey-bg">
                        <th> Website Name </th>
                        <th> Is Used	</th>
                        <th> Used For </th>
                        <th> Alter Domains </th>
                        <th> Set Theme	</th>
                        <th> Add Alter Domain	</th>
                        <th> Action	</th>
                    </tr>
                </thead>
                <tbody id="matches-table">
                    {pageData && pageData?.length > 0 ? pageData.map((item: WebSiteList, i: any) => {
                        return (
                            <tr key={`index`}>
                                <td>{item?.title}</td>
                                <td>true</td>
                                <td>
                                    <div className="search-btn">
                                        <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "80px" }} onClick={(e) => openUserListPopUp(e, item)}>Show Users</button>
                                    </div>
                                </td>
                                <td>{item?.domain}</td>
                                <td>
                                    <div className="search-btn">
                                        <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "80px" }}>Set theme</button>
                                    </div>
                                </td>
                                <td>
                                    <div className="search-btn">
                                        <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "80px" }}>Add Domain</button>
                                    </div>
                                </td>
                                <td>
                                    <div className="search-btn">
                                        <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "80px" }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        )
                    }) :
                        <tr>
                            <td>-</td>
                            <td>-</td>
                            <td>
                                -
                            </td>
                            <td>-</td>
                            <td>
                                -
                            </td>
                            <td>
                                -
                            </td>
                            <td>
                                -
                            </td>
                        </tr>
                    }
                    {/* // <tr>
                    //     <td>3wickets.live</td>
                    //     <td>true</td>
                    //     <td>
                    //         <div className="search-btn">
                    //             <button style={{width: "125px"}} onClick={() => setOpen(true)}>Show Users</button>
                    //         </div>
                    //     </td>
                    //     <td>,9x.live,localhost,ninex.live</td>
                    //     <td>
                    //         <div className="search-btn">
                    //             <button style={{width: "125px"}}>Set theme</button>
                    //         </div>
                    //     </td>
                    //     <td>
                    //         <div className="search-btn">
                    //             <button style={{width: "125px"}}>Add Domain</button>
                    //         </div>
                    //     </td>
                    //     <td>
                    //         <div className="search-btn">
                    //             <button style={{width: "125px"}}>Delete</button>
                    //         </div>
                    //     </td>
                    // </tr> */}
                </tbody>
            </table>
        </div>
        {open && <SkyPopup
            title={`List of ${userData && userData?.websiteList?.length ? userData?.websiteList[0]?.name : ""} Used By`}
            OpenModal={true}
            closeModel={() => setOpen(false)}
            btnName="Close"
            submit={() => setOpen(false)}
        >
            <div>
                <div className="light-grey-bg div-table-row" style={{ textAlign: "right" }}>
                    USERS
                </div>
                <div className="div-table-body">
                    {userData && userData?.websiteList?.length ? userData?.websiteList[0]?.users : ""}
                </div>
            </div>

        </SkyPopup>}
    </>
    )
}

export default AAddWebsiteSetting