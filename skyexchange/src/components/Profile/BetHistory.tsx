import React, { useState } from 'react'


function BetHistory(props: any) {
  const { setActiveTab } = props

  const [currentTab, setCurrentTab] = useState('exchange')

  return (
    <>
      <div className='account_tabs_r_bet_content'>
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a className={`${currentTab === 'exchange' ? "active" : ""} nav-link `} onClick={() => setCurrentTab('exchange')}>Exchange</a>
          </li>
          <li className="nav-item">
            <a className={`${currentTab === 'sportsBook' ? "active" : ""} nav-link `} onClick={() => setCurrentTab('sportsBook')}>Fancy Bet</a>
          </li>
          <li className="nav-item">
            <a className={`${currentTab === 'bookMaker' ? "active" : ""} nav-link `} onClick={() => setCurrentTab('bookMaker')}>BookMaker</a>
          </li>
          <li className="nav-item">
            <a className={`${currentTab === 'binary' ? "active" : ""} nav-link `} onClick={() => setCurrentTab('binary')}>Premium Bet</a>
          </li>
          <li className="nav-item">
            {/* <a className={`${currentTab === 'casino' ? "active" : ""} nav-link `} onClick={() => setCurrentTab('casino')}>Casino</a> */}
          </li>
        </ul>

        <div className="function-wrap light-grey-bg">
          <ul className="inputlist">
            <li><label>Bet Status</label></li>
            <li>
              <select>
                <option value="">Matched</option>
              </select>
            </li>
          </ul>
        </div>

        <div className="table-responsive">
          {/* create component of table and pass currentTab and Data */}
          <table id="MatchedTable" className="table01 margin-table margin-table">
            <caption>Matched</caption>
            <thead>
              <tr>
                <th>Market</th>
                <th id="Matched_selection">Selection</th>
                <th id="Matched_type">Type</th>
                <th id="Matched_betId">Bet ID</th>
                <th id="Matched_betPlaced">Bet placed</th>
                <th id="Matched_matched">Stake</th>
                <th id="Matched_avgOdds">Odds (Volume)</th>
              </tr>
            </thead>
            <tbody id="MatchedContent"><tr>
              <td colSpan={7}>
                <p>You have no bets in this time period.</p>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

      </div>
    </>

  )
}

export default BetHistory