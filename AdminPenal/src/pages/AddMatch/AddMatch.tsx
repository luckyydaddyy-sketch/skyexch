import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ADMIN_API } from "../../common/common";
import { notifyMessage, postApi } from "../../service";
import { Logout } from "../../common/Funcation";
import AddMatchTable from "../../components/AddMatch";
import { styleObjectBlackButton } from "../../common/StyleSeter";
import { useSelector } from "react-redux";

interface sportsInterface {
  marketId: string;
  gameId: number;
  name: string;
  openDate: string;
  startDate: string;
  status: boolean;
  _id: string;
  activeStatus: {
    bookmaker: boolean;
    fancy: boolean;
    premium: boolean;
    status: boolean;
  };
}

interface dataInterface {
  api: string;
  value: {
    type?: string;
    page?: string;
    limit?: string;
    search?: string;
    id?: string;
  };
}

function AddMatch() {
  const isEsoccer = process.env.REACT_APP_E_SOCCER;
  const isBasketBall = process.env.REACT_APP_BASKET_BALL;
  const navigate = useNavigate();
  const DD = useSelector((e: any) => e.domainDetails);
  const [isLoaderCricket, setIsLoaderCricket] = useState(false);
  const [isLoaderSoccer, setIsLoaderSoccer] = useState(false);
  const [isLoaderTennis, setIsLoaderTennis] = useState(false);
  const [isLoaderEsoccer, setIsLoaderEsoccer] = useState(false);
  const [isLoaderBasketBall, setIsLoaderBasketBall] = useState(false);
  const [cricketData, setCricketData] = useState<any>({});
  const [tennisData, setTennisData] = useState<any>({});
  const [soccerData, setSoccerData] = useState<any>({});
  const [eSoccerData, setESoccerData] = useState<any>({});
  const [basketBallData, setBasketBallData] = useState<any>({});

  useEffect(() => {
    console.log("isBasketBall ::: ", isBasketBall, process.env.REACT_APP_BASKET_BALL)
    getPageData("cricket", "1");
    getPageData("soccer", "1");
    getPageData("tennis", "1");
    if (isEsoccer && isEsoccer === "true") getPageData("esoccer", "1");

    if (isBasketBall && isBasketBall === "true") getPageData("basketball", "1");
    return () => { };
  }, []);

  const getPageData = async (
    TYPE: string,
    PAGE: string,
    SEARCH: string = ""
  ) => {
    let data: dataInterface = {
      api: ADMIN_API.SPORTS.LIST,
      value: {
        type: TYPE,
        page: PAGE,
        limit: "50",
      },
    };
    if (TYPE === "cricket") setIsLoaderCricket(true);
    else if (TYPE === "soccer") setIsLoaderSoccer(true);
    else if (TYPE === "tennis") setIsLoaderTennis(true);
    else if (TYPE === "esoccer") setIsLoaderEsoccer(true);
    else if (TYPE === "basketball") setIsLoaderBasketBall(true);
    await postApi(data)
      .then(function (response) {
        console.log(response);
        if (TYPE === "cricket") {
          setCricketData(response.data.data);
          setIsLoaderCricket(false);
        } else if (TYPE === "soccer") {
          setSoccerData(response.data.data);
          setIsLoaderSoccer(false);
        } else if (TYPE === "tennis") {
          setTennisData(response.data.data);
          setIsLoaderTennis(false);
        } else if (TYPE === "esoccer") {
          setESoccerData(response.data.data);
          setIsLoaderEsoccer(false);
        } else if (TYPE === "basketball") {
          setBasketBallData(response.data.data);
          setIsLoaderBasketBall(false);
        }
      })
      .catch((err) => {
        if (TYPE === "cricket") setIsLoaderCricket(false);
        else if (TYPE === "soccer") setIsLoaderSoccer(false);
        else if (TYPE === "tennis") setIsLoaderTennis(false);
        else if (TYPE === "esoccer") setIsLoaderEsoccer(false);
        else if (TYPE === "basketball") setIsLoaderBasketBall(false);
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });

    // let dataForSoccer: dataInterface = {
    //     api: ADMIN_API.SPORTS.LIST,
    //     value: {
    //       type: 'soccer',
    //       page: PAGE,
    //       limit: '30',
    //     },
    //   }
    // await postApi(dataForSoccer).then(function (response) {
    //     console.log(response);
    //     setSoccerData(response.data.data)
    //     setIsLoaderSoccer(false)
    //   }).catch(err => {
    //     setIsLoaderSoccer(false)
    //     if (err.response.data.statusCode === 401) {
    //       Logout()
    //       navigate('/login')
    //     }
    //   })
    //   let dataForTennis: dataInterface = {
    //     api: ADMIN_API.SPORTS.LIST,
    //     value: {
    //       type: 'tennis',
    //       page: PAGE,
    //       limit: '30',
    //     },
    //   }
    //   await postApi(dataForTennis).then(function (response) {
    //     console.log(response);
    //     setTennisData(response.data.data)
    //     setIsLoaderTennis(false)
    //   }).catch(err => {
    //     setIsLoaderTennis(false)
    //     if (err.response.data.statusCode === 401) {
    //       Logout()
    //       navigate('/login')
    //     }
    //   })
  };

  const handleStatusChange = async (item: any, tab: string) => {
    console.log("click Add match :: ", item, tab);

    let data: dataInterface = {
      api: ADMIN_API.SPORTS.ACTIVE_SPORT,
      value: {
        id: item === "All" ? item : item._id,
        type: tab,
      },
    };

    await postApi(data)
      .then(function (response) {
        console.log(response);
        notifyMessage("Update");
        getPageData(tab, "1");
      })
      .catch((err) => {
        if (err.response.data.statusCode === 401) {
          Logout();
          navigate("/login");
        }
      });
  };

  return (
    <div className="container betlive full-wrap">
      <section className="my-account-section">
        <div
          className="my-account-section_header"
          style={{ padding: "10px 10px 0", background: "#E0E6E6" }}
        >
          <div className="account_tabs_filter d_flex">
            <input
              type="button"
              value="Default & Add Setting"
              name="apply"
              id="apply"
              className="btn btn-default-customize"
              style={styleObjectBlackButton(DD?.colorSchema, true)}
              onClick={() => navigate("/ADeafultSetting")}
            />
          </div>
        </div>
        <AddMatchTable
          isLoader={isLoaderCricket}
          data={cricketData}
          handleStatusChange={handleStatusChange}
          type="Cricket"
          tab="cricket"
        />
        <AddMatchTable
          isLoader={isLoaderTennis}
          data={tennisData}
          handleStatusChange={handleStatusChange}
          type="Tennis"
          tab="tennis"
        />
        <AddMatchTable
          isLoader={isLoaderSoccer}
          data={soccerData}
          handleStatusChange={handleStatusChange}
          type="Soccer"
          tab="soccer"
        />
        {isEsoccer === "true" && <AddMatchTable
          isLoader={isLoaderEsoccer}
          data={eSoccerData}
          handleStatusChange={handleStatusChange}
          type="E-Soccer"
          tab="esoccer"
        />}
        {isBasketBall === "true" && <AddMatchTable
          isLoader={isLoaderBasketBall}
          data={basketBallData}
          handleStatusChange={handleStatusChange}
          type="Basket Ball"
          tab="basketball"
        />}
        {/* <div className='tabs_content mt-10'>
                    <table className="table01 margin-table">
                        <thead>
                            <tr><th style={{ background: "#3b5160", color: "white" }} colSpan={15}>Cricket</th></tr>
                            <tr>
                                <th>Event Id</th>
                                <th>Market Id</th>
                                <th>Match Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        {isLoaderCricket ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="./images/miniloadder.svg" alt="" /></div> :
                        <tbody>
                            <tr style={{fontWeight: "600"}}>
                                <td>27993622</td>
                                <td>1.223718205</td>
                                <td><>
                                    <p>Sat, 20 Jan 2024 19:30:00</p>
                                    <span style={{color: "#4083a9"}}>Bangladesh Premier League</span>
                                </></td>
                                <td>
                                    <input
                                        type="button"
                                        value="Add Match"
                                        name="apply"
                                        id="apply"
                                        className="btn btn-default-customize"
                                        style={{ width: "95px", background: "#ffb80c", fontSize: "12px", fontWeight: "600", borderWidth: "1px", borderColor: "black", marginRight: "5px" }} />
                                </td>
                            </tr>
                        </tbody>
                        }
                    </table>
                </div>
                <div className='tabs_content mt-10'>
                    <table className="table01 margin-table">
                        <thead>
                            <tr><th style={{ background: "#3b5160", color: "white" }} colSpan={15}>Tennis</th></tr>
                            <tr>
                                <th>Event Id</th>
                                <th>Market Id</th>
                                <th>Match Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        {isLoaderTennis && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="./images/miniloadder.svg" alt="" /></div> }
                        <tbody>
                            <tr style={{fontWeight: "600"}}>
                                <td>27993622</td>
                                <td>1.223718205</td>
                                <td><>
                                    <p>Sat, 20 Jan 2024 19:30:00</p>
                                    <span style={{color: "#4083a9"}}>Bangladesh Premier League</span>
                                </></td>
                                <td>
                                    <input
                                        type="button"
                                        value="Add Match"
                                        name="apply"
                                        id="apply"
                                        className="btn btn-default-customize"
                                        style={{ width: "95px", background: "#ffb80c", fontSize: "12px", fontWeight: "600", borderWidth: "1px", borderColor: "black", marginRight: "5px" }} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='tabs_content mt-10'>
                    <table className="table01 margin-table">
                        <thead>
                            <tr><th style={{ background: "#3b5160", color: "white" }} colSpan={15}>Soccer</th></tr>
                            <tr>
                                <th>Event Id</th>
                                <th>Market Id</th>
                                <th>Match Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        {isLoaderSoccer && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="./images/miniloadder.svg" alt="" /></div> }
                        <tbody>
                            <tr style={{fontWeight: "600"}}>
                                <td>27993622</td>
                                <td>1.223718205</td>
                                <td><>
                                    <p>Sat, 20 Jan 2024 19:30:00</p>
                                    <span style={{color: "#4083a9"}}>Bangladesh Premier League</span>
                                </></td>
                                <td>
                                    <input
                                        type="button"
                                        value="Add Match"
                                        name="apply"
                                        id="apply"
                                        className="btn btn-default-customize"
                                        style={{ width: "95px", background: "#ffb80c", fontSize: "12px", fontWeight: "600", borderWidth: "1px", borderColor: "black", marginRight: "5px" }} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div> */}
      </section>
    </div>
  );
}

export default AddMatch;
