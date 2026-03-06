import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
interface UserStatementInterFace {
    Remark: string,
    balance: number,
    createdAt: string,
    credit: number,
    debit: number,
    from: any,
    fromModel: string,
    to: any,
    toModel: string,
    type: string,
    updatedAt: string,
    userId: string,
    __v: number,
    _id: string,
}

const AccountSummary = (props: any) => {
    const balanceData = useSelector((e: any) => e.balance);
    const DD = useSelector((e: any) => e.domainDetails);
    const [domainDetails, setDomainDetails] = useState(DD)

    useEffect(() => {
        setDomainDetails(DD)
        return () => { }
      }, [DD])
    return (
        <>
            <div className='account_tabs_r'>
                <div className='mb-15'>
                    <strong style={{ fontSize: "16px" }}>Account Summary</strong>
                </div>
                <div style={{background: "#FFFFFF", width: "100%", padding: "10px"}}>
                    <p style={{fontSize: "15px", fontWeight: "bold", marginBottom: "7px"}}>Your Balances</p>
                    <h3 style={{fontSize: "30px", lineHeight: "36px", fontWeight: "bold", color: "#2789ce"}}> {balanceData} <span style={{fontSize: "12px", color: "#7e97a7", fontWeight: "normal"}}>{domainDetails?.currency ? domainDetails?.currency : 'PBU'}</span></h3>
                </div>
            </div>
        </>
    )
}

export default AccountSummary