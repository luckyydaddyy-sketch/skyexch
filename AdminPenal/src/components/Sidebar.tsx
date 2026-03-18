import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getImageUrl, Logout } from "../common/Funcation";
import { styleObjectGetBG, styleObjectGetColor } from "../common/StyleSeter";
import logoutArrow from "../assets/images/logout-arrow.svg";

const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const HeaderData = useSelector((e: any) => e.Header);
    const DD = useSelector((e: any) => e.domainDetails);

    const [domainDetails, setDomainDetails] = useState(DD);
    const [headerOptions, setHeaderOptions] = useState(HeaderData);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        setHeaderOptions(HeaderData);
    }, [HeaderData]);

    useEffect(() => {
        setDomainDetails(DD);
    }, [DD]);

    const checkResultOption = () =>
        headerOptions?.sports_main_market || headerOptions?.manage_fancy;

    const checkSettingOption = () => {
        if (
            headerOptions?.sports_main_market ||
            headerOptions?.match_history ||
            headerOptions?.manage_fancy ||
            headerOptions?.fancy_history ||
            headerOptions?.manage_premium ||
            headerOptions?.premium_history ||
            headerOptions?.manage_website ||
            headerOptions?.casino_manage ||
            headerOptions?.manage_dashboard_images ||
            headerOptions?.b2c_contact_seting ||
            headerOptions?.banner
        )
            return true;
        else return false;
    };

    const checkSelected = (link: string) => {
        if (window.location.pathname.includes(link)) return true;
        else return false;
    };

    const checkSelectedMulti = (links: any) => {
        if (links.includes(window.location.pathname)) return true;
        else return false;
    };

    const headerOption = [
        {
            name: "Downline List",
            hasAccess: headerOptions?.downline_list,
            link: "/",
            subOption: [],
        },
        {
            name: "My Account",
            selected: checkSelected("/profile"),
            hasAccess: headerOptions?.my_account,
            link: "/profile",
            subOption: [],
        },
        {
            name: "My Report",
            selected: checkSelectedMulti([
                "/loss/down-line",
                "/loss/market",
                "/account/statement",
                "report/DW",
                "report/DWDaily",
            ]),
            hasAccess: true,
            link: "",
            subOption: [
                {
                    name: "Profit/Loss Report by Down line",
                    hasAccess: headerOptions?.downline_report,
                    link: "/loss/down-line",
                },
                {
                    name: "Profit/Loss Report by Market",
                    hasAccess: headerOptions?.market_report,
                    link: "/loss/market",
                },
                {
                    name: "Account Statement",
                    hasAccess: headerOptions?.account_statement,
                    link: "/account/statement",
                },
                {
                    name: "Online Deposit and withdraw",
                    hasAccess: headerOptions?.onlinePaymentWithdrawals_report,
                    link: "/report/DWDaily",
                },
                { name: "Match Profit Loss", hasAccess: 1, link: "/loss/match" },
                {
                    name: "Profit/Loss Report by Casino",
                    hasAccess:
                        headerOptions?.casinoReport || headerOptions?.casinoReport !== 0,
                    link: "/loss/casino",
                },
                { name: "SABA P/L Downline Monthly", hasAccess: 1, link: "/loss/saba" },
            ],
        },
        {
            name: "Bet ListLive",
            hasAccess: headerOptions?.bet_list_live,
            link: "/bet-live",
            subOption: [],
        },
        {
            name: "Bet List",
            hasAccess: headerOptions?.bet_list,
            link: "/betList",
            subOption: [],
        },
        {
            name: "Risk Management",
            hasAccess: headerOptions?.risk_management,
            link: "/risk-management",
            subOption: [],
        },
        {
            name: "Banking",
            hasAccess: headerOptions?.agent_banking || headerOptions?.player_banking,
            link: headerOptions?.agent_banking ? "/agent/banking" : "/player/banking",
            subOption: [],
        },
        {
            name: "Banking Method",
            hasAccess:
                headerOptions?.bankingMethod ||
                headerOptions?.bankingMethod === undefined,
            link: "/bankingMethod",
            subOption: [],
        },
        {
            name: "Block Market",
            hasAccess: headerOptions?.marketBlock,
            link: "/block-market",
            subOption: [],
        },
        {
            name: "Add Match",
            hasAccess: headerOptions?.sports_leage,
            link: "/add-match",
            subOption: [],
        },
        {
            name: "Admin Setting",
            hasAccess: checkSettingOption(),
            link: "/AdminSetting",
            subOption: [],
        },
        {
            name: "Company Payments",
            hasAccess: checkSettingOption(),
            link: "/ComPayments",
            subOption: [],
        },
        {
            name: "Result",
            hasAccess: checkResultOption(),
            link: "/AsetResult",
            subOption: [],
        },
        {
            name: "Old Res.",
            hasAccess: headerOptions?.match_history,
            link: "/Achecksportwiseresult",
            subOption: [],
        },
        {
            name: "deposit-req",
            hasAccess:
                headerOptions?.onlinePaymentWithdrawals ||
                headerOptions?.onlinePaymentDeposite ||
                headerOptions?.onlinePaymentWithdrawals !== 0 ||
                headerOptions?.onlinePaymentDeposite !== 0,
            link: "/Atransactionlist",
            subOption: [],
            isShowCount: "deposit",
        },
        {
            name: "withdrawl-req",
            hasAccess:
                headerOptions?.onlinePaymentWithdrawals ||
                headerOptions?.onlinePaymentDeposite ||
                headerOptions?.onlinePaymentWithdrawals !== 0 ||
                headerOptions?.onlinePaymentDeposite !== 0,
            link: "/AtransactionlistWithdrawl",
            subOption: [],
            isShowCount: "withdrawl",
        },
        {
            name: "Privileges",
            hasAccess: headerOptions?.privileges,
            link: "/Privileges",
            subOption: [],
        },
    ];

    const HandleNavigation = (path: string) => {
        if (path !== "") {
            navigate(path);
        }
    };

    const handleDropdown = (name: string) => {
        if (openDropdown === name) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(name);
        }
    };

    const HandleLogOut = async (e: any) => {
        e.preventDefault();
        await Logout(e);
        dispatch({
            type: "AUTHENTICATION",
            payload: { isLogin: false, token: "" },
        });
        navigate("/login");
    };

    return (
        <div className="admin-sidebar" style={{ backgroundColor: "#000" }}>
            <div className="sidebar-logo" onClick={() => (window.location.href = "/")}>
                <img
                    src={
                        domainDetails?.adminLogo && domainDetails?.adminLogo !== ""
                            ? getImageUrl(domainDetails?.adminLogo)
                            : getImageUrl(domainDetails?.logo)
                    }
                    alt="logo"
                />
            </div>

            <div className="sidebar-menu-wrap">
                <ul className="sidebar-menu">
                    {headerOption.map((item, i) => {
                        if (!item.hasAccess) return null;

                        const hasSubmenu = item.subOption.length > 0;
                        const isSelected = window.location.pathname === item.link || item.selected;
                        const isDropdownOpen = openDropdown === item.name;

                        return (
                            <li key={i} className={`sidebar-item ${isSelected ? "selected" : ""}`}>
                                <a
                                    href={item.link ? item.link : "javascript:void(0)"}
                                    className={`sidebar-link ${hasSubmenu ? "has-submenu" : ""}`}
                                    onClick={(e) => {
                                        if (hasSubmenu) {
                                            e.preventDefault();
                                            handleDropdown(item.name);
                                        } else if (item.link) {
                                            e.preventDefault();
                                            HandleNavigation(item.link);
                                        }
                                    }}
                                >
                                    {item.name}
                                    {item.name === "Casino live" && (
                                        <img style={{ width: "20px", marginLeft: "8px" }} src="/images/card-game.svg" alt="casino" />
                                    )}
                                    {hasSubmenu && (
                                        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                                    )}
                                </a>

                                {hasSubmenu && isDropdownOpen && (
                                    <ul className="sidebar-submenu">
                                        {item.subOption.map((subItem, j) => {
                                            if (!subItem.hasAccess) return null;
                                            return (
                                                <li
                                                    key={j}
                                                    className={`sidebar-sub-item ${window.location.pathname === subItem.link ? "active" : ""}`}
                                                >
                                                    <a
                                                        href={subItem.link}
                                                        className="sidebar-sub-link"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            HandleNavigation(subItem.link);
                                                        }}
                                                    >
                                                        {subItem.name}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}

                    <li className="sidebar-item time_zone_item">
                        <span className="sidebar-link time_zone_text">Time Zone : GMT+05:30</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
