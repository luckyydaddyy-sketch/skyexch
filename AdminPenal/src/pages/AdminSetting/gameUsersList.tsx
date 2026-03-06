import { useNavigate } from "react-router-dom"
import { Logout } from "../../common/Funcation"
import { ADMIN_API } from "../../common/common"
import SearchInput from "../../components/SearchInput"
import { postApi } from "../../service"
import { useEffect, useState } from "react"

interface websiteList {
    name: string;
    users: string;
    count: number;
}
interface Data {
    totalUsers?: number;
    yesterdayTotalUsers?: number;
    websiteList?: Array<websiteList>
    totalUsersForList?: number;
}
function GameUsersList() {
    const navigate = useNavigate()
    const [pageData, setPageData] = useState<Data>({})
    useEffect(() => {
        getPageData()
        return () => {
        }
    }, [])

    const getPageData = async () => {
        let data: any = {
            api: ADMIN_API.SETTING.USERS.GET_USER_COUNT,
        }

        await postApi(data).then(function (response) {
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
        <div className="container settings main_wrap">
            <div className='top_header'>
                <div className='top_header_title mt-3 d_flex d_flex_justify_spacebt' >
                    <h5>Concurrent Users Details</h5>
                </div>
            </div>
            <p className="userDet-title">Total Users - <span>{pageData?.totalUsers}</span></p>
            <p className="userDet-title">Yesterday's Created Users - <span>{pageData?.yesterdayTotalUsers}</span></p>
            <table className="table01 margin-table">
                <thead>
                    <tr className="light-grey-bg">
                        <th> Name </th>
                        <th> SubAdmin </th>
                        <th style={{ textAlign:"right"}}> Count - {pageData?.totalUsersForList} </th>
                    </tr>
                </thead>
                <tbody id="matches-table">
                    {pageData?.websiteList && pageData?.websiteList.length ? pageData?.websiteList.map((item: websiteList, i: number) => {
                        return (
                            <tr>
                                <td style={{ width: "20%" }}>{item?.name}</td>
                                <td style={{ width: "100%", wordBreak:"break-all" }}>{item?.users}</td>
                                <td style={{ width: "20%", textAlign:"right"}}>{item?.count}</td>
                            </tr>
                        )
                    }) : <><h2>No data</h2></>}
                    {/* <tr>
                        <td style={{ width: "20%" }}>3wickets.live</td>
                        <td style={{ width: "20%" }}>test1(Test), devraj7(Dev), admalik101(Arjun), adadnan102(Nok), tuhin67(Ab), tipu67(Tp), zunaiyed(Ab), munna3wicket(Munna), joybhai(Joy ), adsohel103(Somrat), admin247(Ab), admsarfaraz104(Sarfaran), adefaz105(Mehrab), adasif106(Asif), adkapali106(Irfan), adtepu107(Tepu), sanahidkhan(T), snahidkhan(T), badmin(Ab),7wickets(Arjun), 7admin102(atif), raaz7(7wicket), tuhin7(Ab), tipu7(Ab), rockybhai(R), adriyan108(Riyan), adbijoy109(Azizul ), admehedi109(Mehedi), advicky110(Vicky), riyansheikh(Ab), robinbhai(Robin), addavid110(David), admin112(h), adprince115(Prince ), adjason113(jason), olivadmin(Oliv), adjosim115(josim), kajol3w(Admin), rafasn90(Ab), rafsan90(Ab), rokatkhan3(Admin), adminmashik116(hh), adariyan117(ashikuzzaman), akashbonik(Ab), adrjrocky007(Rj), admunna104(Mhnna), adwalker118(Alan ), adawalker118(Ala), admin990(Ab), admin220(Ab), adminpr(Ab), babu1x(Babu), sultanbd(Ab), adtamim120(Tamim), mehedi786(Mahek), adminnaim120(Naim), adminrsadnan(Rs), adminrakib(Rakib), riyan135(Riyan), sobuj3585(Sobuj), admindk420(Dk), adxnahid120(x), adsanto119(Santo ad), habib679(Admin ), armaan6464(R), adkomol109(komol), riyad290(Ab), adminrofiq(Rofiq), admint20(Ab), admint21(Ab), salman3(Admin ), tipunew(Admin ), adminadnan(Adnan), sarah(Ab), munnavai2(Munna), dhoni365(Zyan), agun471(Ab), adrobin777(Robin ), adamir555(Aki), adminbp247(Bp), adminfarhan5(F), testingsua(Test), admintarek9x(K), adayman9x(Ayman), adnil112(Ad), skbet(Ab), rahulsharma(Ab), sarfaraz9x(A), rxratul(Rx), adminmh9x(Mh), rishad9x(Rishad), 9xnahid(Nahid)</td>
                        <td style={{ width: "20%", textAlign: "right" }}>4604</td>
                    </tr>
                    <tr>
                        <td style={{ width: "20%" }}>winx365.live</td>
                        <td style={{ width: "20%" }}>sadmin(R), sadminzahidbd(T), sadminronok365(T), ariyanbd(T), ssnahidkhan(T), sabkhan(T), snoyon77777(Tt), adkapali107(Alok), srabon01(R), tadmin(A), admoeen111(Moeen ), robi99(T), 10admin(BP ), farhan365(T), rsbet247(T), aymansadik(T), winxroaktkhan(WinxRoaktkhan), akshwinx(T), joniwinx(T), alkowinx(Ripin), adminwinx2(T), anam555(T), malik1(T), rasel24711(R), armaan6363(R), hridoybd2(T), mdmunnajan(munnajan), w00mir(T), adrobin888(Robin), khanbai01(T), sabbir652(T), winx22(T), badmen7(T), sifat6655(T), akash121212(T), ratu7733(T), wxkhan(xc), fahim889977(T), adminbb1(Admin), thafez(Ab), bpshishir(Shishir), rocky445566(Zxcv9988 ), abirvhai247(Abir), adminraju(Raju), farhan4567(T), nahid97819(T), akash668899(Abcd1234), devraj10(Dev), skingkhan(t), rumana778899(t)</td>
                    </tr> */}
                </tbody>
            </table>
        </div>
    )
}

export default GameUsersList