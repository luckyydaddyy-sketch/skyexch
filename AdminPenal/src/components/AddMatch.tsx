import { useSelector } from "react-redux"
import { styleObjectBlackButton } from "../common/StyleSeter"

interface sportsInterface {
  marketId: string
  gameId: number
  name: string
  openDate: string
  startDate: string
  status: boolean
  _id: string,
  activeStatus: {
    bookmaker: boolean
    fancy: boolean
    premium: boolean
    status: boolean
  }
}

const getStyle = (item: any) => {
  if (item?.status) {
    return { background: 'gray' }
  } else {
    return {}
  }
}
const AddMatchTable = (props: any) => {
  const { isLoader, data, handleStatusChange, type, tab } = props
  const DD = useSelector((e: any) => e.domainDetails);
  console.log("cricketData :: ", data)
  console.log("isLoaderCricket :: ", isLoader)
  return (
    <div className='tabs_content mt-10'>
      <table className="table01 margin-table">
        <thead>
          <tr><th style={styleObjectBlackButton(DD?.colorSchema, true, true)} colSpan={15}>{type}</th></tr>
          <tr>
            <th style={{ width: "10%" }}>Event Id</th>
            <th style={{ width: "10%" }}>Market Id</th>
            <th style={{ width: "60%" }}>Match Name</th>
            <th style={{ width: "20%" }}>Action</th>
          </tr>
        </thead>
        {isLoader ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="./images/miniloadder.svg" alt="" /></div> :
          <tbody>
            {data && data?.results?.length > 0 ? data?.results?.map((item: sportsInterface, i: any) => {
              return (
                <tr key={i} style={{ fontWeight: "600" }}>
                  <td> {item.gameId}  </td>
                  <td> {item.marketId} </td>
                  <td><>
                    <p>{item.openDate}</p>
                    <span style={{ color: "#4083a9" }}>{item.name}</span>
                  </></td>
                  {/* <td>
                                  <div className="form-check form-switch large-switch">
                                    <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked0" onChange={() => handleStatusChange(item)} checked={item.status} disabled={item.status} name="sport-league" />
                                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked0"></label>
                                  </div>
                                </td> */}
                  <td>
                    <input
                      type="button"
                      value="Add Match"
                      name="apply"
                      id="apply"
                      disabled={item?.status}
                      className="btn btn-default-customize"
                      onClick={() => handleStatusChange(item, tab)}
                      style={{ ...styleObjectBlackButton(DD?.colorSchema, true), fontSize: "12px", width: "120px", padding: "3px 12px", ...getStyle(item), marginBottom: "0" }} />
                  </td>
                </tr>
              )
            }) : <><h2>No Record Found</h2></>
            }
            {/* <tr style={{fontWeight: "600"}}>
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
                            </tr> */}
          </tbody>
        }
      </table>
    </div>
  )
}

export default AddMatchTable