import { useEffect, useState } from "react";

export interface SportDetailsInterface {
  back1: number;
  back2: number;
  back3: number;
  eid: number;
  eventName: string;
  f: boolean;
  gameId: number;
  ifb: boolean;
  inPlay: boolean;
  lay1: number;
  lay2: number;
  lay3: number;
  m1: boolean;
  marketId: string;
  openDate: string;
  p: boolean;
  pin: boolean;
  _id: string;
  type: string;
}

function OddsDammyData(props: any) {
  const [sportDetail, setSportDetail] = useState<SportDetailsInterface>(
    {
      back1: 0,
      back2: 0,
      back3: 0,
      eid: 0,
      eventName: "hi v hello",
      f: false,
      gameId: 0,
      ifb: true,
      inPlay: false,
      lay1: 0,
      lay2: 0,
      lay3: 0,
      m1: true,
      marketId: "",
      openDate: "",
      p: false,
      pin: true,
      _id: "",
      type: ""
  }
  );
  const { detailSport, setoddMinMaxpopup, oddMinMaxpopup, setMarketPopup } = props;
  let sportName = localStorage.getItem("sportsName");
  let sportsData = localStorage.getItem("sportsData");

  useEffect(()=>{
    if(sportsData){
      console.log("sportsData :: ", JSON.parse(sportsData));
      console.log("sportsData :sportName: ", sportName);
      const sportsDataTemp = JSON.parse(sportsData)
      setSportDetail(sportsDataTemp)
    }
  },[])

  
  

  return (
    <>
      {!detailSport?.page && (
        <>
          <div id="app">
            <div className="d-block match-detail">
              <div className="inplay-tableblock odds-table-section table-responsive first">
                <div id="marketBetsWrap" className="bets-wrap asiahadicap">
                  <a
                    id="minMaxButton"
                    className="bet-limit"
                    onClick={() => setoddMinMaxpopup(!oddMinMaxpopup)}
                  >
                    <div
                      className={` odds_info-popup ${
                        oddMinMaxpopup ? "active" : ""
                      }`}
                      id="fancy_popup_LUNCH_FAVOURITE"
                    >
                      <dl>
                        <dt>Min / Max</dt>
                        <dd id="minMax">
                          {" "}
                          1 /{" "}
                          100
                        </dd>
                      </dl>
                      <a
                        id="close-odds_info"
                        className="close 11"
                        onClick={() => setoddMinMaxpopup(false)}
                      >
                        Close
                      </a>
                    </div>
                  </a>

                  <dl id="betsHead" className="bets-selections-head">
                    <dt>
                      <a
                        className="a-depth"
                        onClick={() => setMarketPopup(true)}
                        id="marketDepthBtn"
                      >
                        Markets Depth
                      </a>
                      <p>
                        <span>Matched 2</span>
                        <strong id="totalMatched">
                          PKU 1111111
                        </strong>
                      </p>
                    </dt>
                    <dd>Back </dd>
                    <dd>Lay </dd>
                  </dl>
                </div>

                <table className="table custom-table inplay-table w1-table" style={{lineHeight:2}}>
                  <tbody>
                    <tr className="betstr">
                      <td className="text-color-grey opacity-1">
                        <span className="totselection seldisplay">
                          2 Selections
                        </span>
                      </td>
                      <td colSpan={2}>101.7%</td>
                      <td>
                        <span>Back</span>
                      </td>{" "}
                      <td>
                        <span>Lay</span>
                      </td>
                      <td colSpan={2}>97.9%</td>
                    </tr>

                    {
                      // stableSort(detailSport.page?.data?.t1, getComparator('asc', 'sortPriority'))
                      [0,1].map((item: any, i:number) => {
                          return (
                            <>
                              <tr className="bg-white tr-odds tr_team1">
                                <td>
                                  {/* <img src="../../../images/bars.png" /> */}
                                  <b className="team1">{sportName?.split(' v ')[i]}</b>
                                  {/* <div>
                                    {item.betProfit && (
                                      <span
                                        className={` ${
                                          item.betProfit < 0
                                            ? "to-lose"
                                            : "to-win"
                                        } team_bet_count_old `}
                                      >
                                        <span
                                          className={` ${
                                            item.betProfit < 0
                                              ? "text-danger"
                                              : "text-green"
                                          } team_total`}
                                        >
                                          (
                                          {item?.betProfit &&
                                          cookies.get("skyTokenFront")
                                            ? parseFloat(
                                                item.betProfit
                                              )?.toFixed(2)
                                            : 0}
                                          )
                                        </span>
                                      </span>
                                    )}
                                  </div> */}
                                </td>
                                <td
                                //   onClick={() => BetClick(item, "b3", "t1")}
                                  className="table-active light-blue-bg-2 opnForm ODDSBack td_team1_back_2"
                                >
                                  <a className="back1btn text-color-black">
                                    {" "}
                                    {sportDetail?.back3} <br />
                                    <span>0</span>
                                  </a>
                                </td>
                                <td
                                //   onClick={() => BetClick(item, "b2", "t1")}
                                  className="table-active light-blue-bg-3 ODDSBack td_team1_back_1"
                                >
                                  <a className="back1btn text-color-black">
                                    {" "}
                                    {sportDetail?.back2} <br />
                                    <span>0</span>
                                  </a>
                                </td>
                                <td
                                //   onClick={() => BetClick(item, "b1", "t1")}
                                // className = "table-active disable cyan-bg ODDSBack td_team1_back_0"
                                className = "table-active cyan-bg ODDSBack td_team1_back_0"
                                  // style={{ paddingTop: "20px" }}
                                  style={{ lineHeight:1.3 }}
                                >
                                  <a className="back1btn text-color-black">
                                    {" "}
                                    {i === 0 ? sportDetail?.back1 : sportDetail?.back2} <br />
                                    <span>0</span>
                                  </a>
                                </td>
                                <td
                                //   onClick={() => BetClick(item, "l1", "t1")}
                                // className = "table-active-red disable pink-bg ODDSLay td_team1_lay_0"
                                className = "table-active-red pink-bg ODDSLay td_team1_lay_0"
                                  
                                  // style={{ paddingTop: "20px" }}
                                  style={{ lineHeight:1.3 }}
                                >
                                  <a className="lay1btn text-color-black">
                                    {" "}
                                    {i === 0 ? sportDetail?.lay1 : sportDetail?.lay2} <br />
                                    <span>0</span>
                                  </a>
                                </td>
                                <td
                                //   onClick={() => BetClick(item, "l2", "t1")}
                                  className="table-active-red light-pink-bg-2 ODDSLay td_team1_lay_1"
                                >
                                  <a className="lay1btn text-color-black">
                                    {" "}
                                    {sportDetail?.lay2} <br />
                                    <span>0</span>
                                  </a>
                                </td>
                                <td
                                //   onClick={() => BetClick(item, "l3", "t1")}
                                  className="table-active-red light-pink-bg-3 ODDSLay td_team1_lay_2"
                                >
                                  <a className="lay1btn text-color-black">
                                    {" "}
                                    {sportDetail?.lay3} <br />
                                    <span>0</span>
                                  </a>
                                </td>
                              </tr>
                              {/* {true && ( */}
                              {/* {item.status === "SUSPEND" && (
                                <tr className="fancy-suspend-tr collapse">
                                  <th colSpan={0}> </th>
                                  <td colSpan={6} className="fancy-suspend-td">
                                    <div className="suspend-white">
                                      <span>Suspend</span>
                                    </div>
                                  </td>
                                </tr>
                              )} */}
                              
                            </>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default OddsDammyData;
