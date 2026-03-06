import { useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import SearchInput from '../../components/SearchInput';
import { styleObjectGetBG } from '../../common/StyleSeter'
import { useSelector } from 'react-redux';
import { dataInterface } from '../Setting/interface';
import { ADMIN_API } from '../../common/common';
import { postApi } from '../../service';
import { Logout } from '../../common/Funcation';

function Achecksportwiseresult() {
    const navigate = useNavigate()
    const DD = useSelector((e: any) => e.domainDetails);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [sportList, setSportList] = useState<any>({})

    const [tab, setTab] = useState('cricket')
    useEffect(() => {
        matchListData(tab)
        return () => { };
    }, []);
    const switchTab = (tab: string) => {
        setTab(tab)
        matchListData(tab)
        // "cricket", "soccer", "tennis",
    }
    const handleSearchSubmit = (search: any) => {
        matchListData(tab, search)
    }
    const matchListData = async (TYPE: string, SEARCH: string = '') => {
        let data: dataInterface = {
            api: ADMIN_API.SETTING.MATCH_HISTORY.GET_LIST,
            value: {
                type: TYPE,
                page: '1',
                limit: '100'
            },
        }
        if (SEARCH !== '') {
            data.value.search = SEARCH
        }

        await postApi(data).then(function (response) {
            console.log(response);
            setSportList(response.data.data)

        }).catch(err => {
            if (err.response.data.statusCode === 401) {
                Logout()
                navigate('/login')
            }
        })

    }
    return (
        <>
            <div className="container full-wrap">
                <div className="top_header">
                    <div className="top_header_title">
                        <h5>Check Result</h5>
                    </div>
                </div>

                <section className="my-account-section">
                    <div className="my-account-section_header" style={{ padding: "15px", display: "flex", alignItems: "center", marginBottom: "10px", background: "#E0E6E6" }}>
                        <div style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                            <label style={{ flexShrink: 0, paddingRight: "5px" }}> Period: </label>
                            <ReactDatePicker
                                selected={startDate}
                                className="form-control hasDatepicker"
                                onChange={(date: Date) => setStartDate(date)}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <label style={{ flexShrink: 0, paddingRight: "5px" }}> to : </label>
                            <ReactDatePicker
                                selected={endDate}
                                className="form-control hasDatepicker"
                                onChange={(date: Date) => setEndDate(date)}
                            />
                        </div>
                        <div className="search-btn"><button style={{ ...styleObjectGetBG(DD?.colorSchema, true), width: "100px" }} onClick={() => switchTab('cricket')} >Cricket</button></div>
                        <div className="search-btn"><button style={{ ...styleObjectGetBG(DD?.colorSchema, true), width: "100px" }} onClick={() => switchTab('soccer')}>Soccer</button></div>
                        <div className="search-btn"><button style={{ ...styleObjectGetBG(DD?.colorSchema, true), width: "100px" }} onClick={() => switchTab('tennis')}>Tennis</button></div>
                        <div className="search-btn"><button style={{ ...styleObjectGetBG(DD?.colorSchema, true), width: "100px" }}>Virtual T10</button></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "10px" }}>
                        <SearchInput hide placeholder="Search..." style={{ display: "inline-block" }} searchSubmit={handleSearchSubmit} />
                    </div>
                    <table className="table01 margin-table old-res">
                        <thead>
                            <tr className="black-bg">
                                <th> S.No. </th>
                                <th> Sport </th>
                                <th> Match Date	</th>
                                <th> Match Name	 </th>
                                <th> Winner </th>
                            </tr>
                        </thead>
                        <tbody id="matches-table">

                            {
                                sportList && sportList?.results?.length && sportList?.results?.map((item: any, i: number) => {
                                    return (
                                        <tr>
                                            <td style={{ width: "20%" }}>{i + 1}</td>
                                            <td style={{ width: "20%" }}>{item?.type}</td>
                                            <td style={{ width: "20%" }}>{item?.openDate}</td>
                                            <td style={{ width: "20%" }}>{item?.name} - ({item?.gameId})</td>
                                            <td style={{ width: "20%" }}>{item?.winner}</td>
                                        </tr>
                                    )
                                })
                            }
                            {/* <tr>
                                <td style={{ width: "20%" }}>1</td>
                                <td style={{ width: "20%" }}>Soccer</td>
                                <td style={{ width: "20%" }}>2024-02-02 09:12:26</td>
                                <td style={{ width: "20%" }}>Canterbury Kings v Otago Volts - (32978491)</td>
                                <td style={{ width: "20%" }}>Canterbury Kings</td>
                            </tr>
                            <tr>
                                <td style={{ width: "20%" }}>2</td>
                                <td style={{ width: "20%" }}>Cricket</td>
                                <td style={{ width: "20%" }}>2024-02-02 09:12:26</td>
                                <td style={{ width: "20%" }}>Canterbury Kings v Otago Volts - (32978491)</td>
                                <td style={{ width: "20%" }}>Canterbury Kings</td>
                            </tr>
                            <tr>
                                <td style={{ width: "20%" }}>3</td>
                                <td style={{ width: "20%" }}>Soccer</td>
                                <td style={{ width: "20%" }}>2024-02-02 09:12:26</td>
                                <td style={{ width: "20%" }}>Canterbury Kings v Otago Volts - (32978491)</td>
                                <td style={{ width: "20%" }}>Canterbury Kings</td>
                            </tr>
                            <tr>
                                <td style={{ width: "20%" }}>4</td>
                                <td style={{ width: "20%" }}>Cricket</td>
                                <td style={{ width: "20%" }}>2024-02-02 09:12:26</td>
                                <td style={{ width: "20%" }}>Canterbury Kings v Otago Volts - (32978491)</td>
                                <td style={{ width: "20%" }}>Canterbury Kings</td>
                            </tr> */}
                        </tbody>
                    </table>
                </section>
            </div>
        </>
    )
}
export default Achecksportwiseresult