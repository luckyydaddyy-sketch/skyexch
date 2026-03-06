import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../../common/StyleSeter"
import ReactDatePicker from "react-datepicker";
import { useState } from "react";
import SearchInput from "../../components/SearchInput";

function AImpMessage() {
    const DD = useSelector((e: any) => e.domainDetails);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    return (
        <>
            <div className="container main_wrap">
                <div className='my-account-section-content'>
                    <div className='my-account-section_header'>
                        <h4 className="s_mb-8"> Set Important Message</h4>
                        <div style={{ width: "30%" }}>
                            <textarea style={{ width: "100%", minHeight: "100px" }} />
                        </div>
                        <h2 className="flex-align" style={{ color: "red", fontSize: "20px", fontWeight: 400 }}>Is Important:
                            <div className="form-check flex-align w-20 s_ml-5">
                                <input className="form-check-input" checked={false} name="rolling_delay" type="checkbox" role="switch" id="rolling_delay" />
                            </div>
                        </h2>
                        <div className="search-btn s_my-10">
                            <button style={{ ...styleObjectBlackButton(DD?.colorSchema, true), width: "95px", marginLeft: "0" }}>Set Message</button>
                        </div>
                        <p><strong>Current Message</strong></p>
                        <p>Current Message :নোটিশ একবার জালিয়াতি টিকিট সহ প্লেয়ার অ্যাকাউন্ট পাওয়া গেলে, সংশ্লিষ্ট বাজার বাতিল হয়ে যাবে এবং প্লেয়ার অ্যাকাউন্ট লক করা হবে, জড়িত এডমিন, সাব এডমিন, সুপার এজেন্ট, মাস্টার সকলের আইডি সাসপেন্ড করা হবে।</p>
                    </div>
                </div>
            </div >
        </>
    )
}

export default AImpMessage