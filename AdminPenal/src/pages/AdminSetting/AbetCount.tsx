import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import { useEffect, useState } from "react";
import { ADMIN_API } from "../../common/common";
import { postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import { useNavigate } from "react-router-dom";

interface sportUser {
    _id: string;
    name: string;
    type: string;
    createdAt: string;
    count: number;
}
interface sportUserCount {
    sportDetail: Array<sportUser>
}

interface whoAdd {
    _id: string;
    agent_level: string;
    user_name: string;

}
interface betsUser {
    _id: string;
    user_name: string;
    whoAdd: Array<whoAdd>;
    bunchCount: string;
    count: number;
}
interface sportUserBetsCount {
    userDetail: Array<betsUser>
}

interface userBets {
    _id: string;
    userId: whoAdd;
    matchId: string;
    type: string;
    betType: string;
    betSide: string;
    selection: string;
    subSelection: string;
    betId: number;
    stake: number;
    oddsUp: number;
    oddsDown: number;
    profit: number;
    exposure: number;
    tType: string;
    createdAt: string;
    name: string;

}
function AbetCount() {
    const navigate = useNavigate()
    const DD = useSelector((e: any) => e.domainDetails);
    const [open, setOpen] = useState<boolean>(false)
    const [details, setDetails] = useState<boolean>(false)

    const [sportId, setSportId] = useState<string>("")
    const [UserId, setUserId] = useState<string>("")
    const [sportsUserCountPageData, setSportsUserCountPageData] = useState<sportUserCount>()
    const [sportsUserBetsCountPageData, setSportsUserBetsCountPageData] = useState<sportUserBetsCount>()
    const [sportsUserBetsPageData, setSportsUserBetsPageData] = useState<userBets[]>()

    useEffect(() => {
        getSportsUserCountPageData()
        return () => {
        }
    }, [])
    useEffect(() => {
        if (sportId !== "")
            getSportsUserBetsCountPageData(sportId)
        return () => {
        }
    }, [sportId])
    useEffect(() => {
        console.log("get bet list ::: ");
        
        if (UserId !== "" && sportId !== "")
            getUserBetsData(UserId, sportId)
        return () => {
        }
    }, [UserId])

    const getSportsUserCountPageData = async () => {
        let data: any = {
            api: ADMIN_API.SETTING.SPORT_MARKET.GET_SPORT_USERS_COUNT,
            //   value: {
            //     gameId: id
            //   },
        }

        await postApi(data).then(function (response) {
            console.log(response);
            setSportsUserCountPageData(response.data.data)
        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }
    const getSportsUserBetsCountPageData = async (id: string) => {
        let data: any = {
            api: ADMIN_API.SETTING.SPORT_MARKET.GET_SPORT_BETS_COUNT,
            value: {
                id
            },
        }

        await postApi(data).then(function (response) {
            console.log(response);
            setSportsUserBetsCountPageData(response.data.data)
        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })
    }

    const getUserBetsData = async (id: string, sportId: string) => {
        let data: any = {
            api: ADMIN_API.PLAYER_BET_LIST_CHEATS,
            value: {
                id: sportId,
                userid: id,
            },
        };

        await postApi(data)
            .then(function (response) {
                console.log("getUserBetsData", response);
                setSportsUserBetsPageData(response.data.data);
            })
            .catch((err) => {
                if (err.response.data.statusCode === 401) {
                    Logout();
                    navigate("/login");
                }
            });
    };

    const openUserBetCount = (id: string) => {
        setOpen(true);
        setSportId(id);
    }
    const openBetsCount = (id: string) => {
        setDetails(true);
        setOpen(false);
        setUserId(id)
    }

    const getAdminName = (whoAdd: whoAdd[], role: string) =>
        whoAdd.find((value) => value.agent_level === role)?.user_name

    return (
        <>
            <div className="container full-wrap">
                <div className="top_header">
                    <div className="top_header_title mt-3">
                        <h5>Cheat Bets</h5>
                    </div>
                    {open && <div className="flex-align justify-end">
                        <input onClick={() => setOpen(false)} type="button" style={styleObjectBlackButton(DD?.colorSchema, true, true)} value="Back" name="Bets" id="Bets" className="submit-btn btn_black" />
                    </div>}
                </div>
                {!open ? !details && <div className='my-account-section-content'>
                    <div className='my-account-section-content-table'>
                        <table id="resultTable" className="table01 margin-table" style={{ textAlign: "right" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "right" }}>SNo</th>
                                    <th style={{ textAlign: "right" }}>Match Name	</th>
                                    <th style={{ textAlign: "right" }}>Sport</th>
                                    <th style={{ textAlign: "right" }}>Match Date</th>
                                    <th style={{ textAlign: "right" }}>User Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    sportsUserCountPageData && sportsUserCountPageData?.sportDetail?.length && sportsUserCountPageData?.sportDetail?.map((item: sportUser, i: number) => {
                                        return (
                                            <tr>
                                                <td>{i + 1}</td>
                                                <td><a onClick={() => openUserBetCount(item?._id)}>{item?.name}</a></td>
                                                <td>{item?.type}</td>
                                                <td>{item?.createdAt}</td>
                                                <td>{item?.count}</td>
                                            </tr>
                                        )
                                    })
                                }
                                {/* <tr>
                                    <td>1</td>
                                    <td><a onClick={() => setOpen(true)}>Tomas Martin Etcheverry v Bernabe Zapata Miralles</a></td>
                                    <td>Tennis</td>
                                    <td>2024-02-08 05:40:00</td>
                                    <td>1</td>
                                </tr> */}

                            </tbody>
                        </table>
                    </div>
                </div> :
                    !details && <div className='my-account-section-content'>
                        <div className='my-account-section-content-table'>
                            <table id="resultTable" className="table01 margin-table" style={{ textAlign: "right" }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "right" }}>SNo.</th>
                                        <th style={{ textAlign: "right" }}>User Id</th>
                                        <th style={{ textAlign: "right" }}>Dealer</th>
                                        <th style={{ textAlign: "right" }}>Master</th>
                                        <th style={{ textAlign: "right" }}>SST</th>
                                        <th style={{ textAlign: "right" }}>Bet Count</th>
                                        <th style={{ textAlign: "right" }}>Bunch Count</th>
                                        <th style={{ textAlign: "right" }}>Show Bets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        sportsUserBetsCountPageData && sportsUserBetsCountPageData?.userDetail?.length && sportsUserBetsCountPageData?.userDetail?.map((item: betsUser, i: number) => {
                                            return (
                                                <tr>
                                                    <td>{i + 1}</td>
                                                    <td>{item?.user_name}</td>
                                                    <td>{getAdminName(item.whoAdd, "SS")}</td>
                                                    <td>{getAdminName(item.whoAdd, "M")}</td>
                                                    <td>{getAdminName(item.whoAdd, "S")}</td>
                                                    <td>{item?.count}</td>
                                                    <td>{item?.bunchCount}</td>
                                                    <td>
                                                        <input onClick={() => {
                                                            openBetsCount(item?._id)
                                                        }} type="button" style={styleObjectBlackButton(DD?.colorSchema, true, true)} value="Bets" name="Bets" id="Bets" className="submit-btn btn_black" />
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>

                        </div>
                    </div>}

                {details && !open && <><div className="flex-align">
                    <input onClick={() => {
                        setDetails(false)
                        setOpen(true)
                    }} type="button" style={styleObjectBlackButton(DD?.colorSchema, true, true)} value="Back" name="Bets" id="Bets" className="submit-btn btn_black" />
                </div>
                    <div className='my-account-section-content'>
                        <div className='my-account-section-content-table'>
                            <table id="resultTable" className="table01 margin-table" style={{ textAlign: "right" }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "right" }}>S No.</th>
                                        <th style={{ textAlign: "right" }}>Member</th>
                                        <th style={{ textAlign: "right" }}>Market</th>
                                        <th style={{ textAlign: "right" }}>Selection</th>
                                        <th style={{ textAlign: "right" }}>Back / Lay</th>
                                        <th style={{ textAlign: "right" }}>Odds</th>
                                        <th style={{ textAlign: "right" }}>Stake</th>
                                        <th style={{ textAlign: "right" }}>Pnl</th>
                                        <th style={{ textAlign: "right" }}>Date</th>
                                        <th style={{ textAlign: "right" }}>PlaceTime</th>
                                        <th style={{ textAlign: "right" }}>MatchedTime</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        sportsUserBetsPageData && sportsUserBetsPageData?.length && sportsUserBetsPageData?.map((item: userBets, i: number) => {
                                            return (
                                                <tr>
                                                    <td>{i + 1}</td>
                                                    <td>{item.userId?.user_name}</td>
                                                    <td>Match {item?.betType}</td>
                                                    <td>{item?.selection}</td>
                                                    <td>{item?.betSide}</td>
                                                    <td>{item?.oddsUp}</td>
                                                    <td>{item?.stake}</td>
                                                    <td>{item?.profit}</td>
                                                    <td>{item?.createdAt}</td>
                                                    <td>{item?.createdAt}</td>
                                                    <td>{item?.createdAt}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    {/* <tr>
                                        <td>1</td>
                                        <td>jahir998</td>
                                        <td>Match odds</td>
                                        <td>Jacopo Berrettini</td>
                                        <td>Back</td>
                                        <td>2</td>
                                        <td>1</td>
                                        <td>2</td>
                                        <td>2024-02-11</td>
                                        <td>Sun Feb 11 16: 29:05 IST 2024</td>
                                        <td>Sun Feb 11 16: 29: 10 IST 2024</td>
                                    </tr> */}
                                </tbody>
                            </table>

                        </div>
                    </div></>}
            </div>
        </>
    )
}

export default AbetCount