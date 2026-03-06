import moment from 'moment'
import React from 'react'

function NewsLinePopup(props: any) {
    return (
        <>
            <div className="announce-wrap" id="announcementContent">
                <div id="announcementTemplate" className="article-wrap">
                    <dl className="article-date">
                        <dt id="date_0">{moment().date()}</dt>
                        <dd id="month_0">{moment().format('MMM')}</dd>
                        <dd id="year_0">{moment().year()}</dd>
                    </dl>
                    <p id="textByLanguageType_0">Event :- {props?.eventData}</p>
                </div>
                <div id="announcementTemplate" className="article-wrap">
                    <dl className="article-date">
                        <dt id="date_1">{moment().date()}</dt>
                        <dd id="month_1">{moment().format('MMM')}</dd>
                        <dd id="year_1">{moment().year()}</dd>
                    </dl>
                    <p id="textByLanguageType_1">Event :- {props?.eventData} </p>
                </div>
                <div id="announcementTemplate" className="article-wrap">
                    <dl className="article-date">
                        <dt id="date_2">{moment().date()}</dt>
                        <dd id="month_2">{moment().format('MMM')}</dd>
                        <dd id="year_2">{moment().year()}</dd>
                    </dl>
                    <p id="textByLanguageType_2">Event :- {props?.eventData}</p>
                </div>
            </div>


            
        </>

    )
}

export default NewsLinePopup