import React from 'react'
import { useSelector } from 'react-redux';

function AboutPopup(props: any) {
    const DD = useSelector((e: any) => e.domainDetails);

    return (
        <div className="announce-wrap">
            <ul>
                <li>Sky Infotech Group is one of the upcoming providers for online gaming entertainment across Sports Betting, Online and Live Casino
                    operating in the emerging and the regulated markets.
                </li>

                <li>We aim to utilize the latest technologies to provide innovative and interactive gaming experiences in a secure environment.</li>

                <li><strong>We have dedicated ourselves to offering our customers a seamless and thrilling gaming experience while you are on the go. We
                    aim to provide an exceptional and fully customizable online betting experience.</strong></li>

                <li><strong>We are innovative, ambitious and passionate about what we do. We do it in a credible and responsible way, always aiming for
                    the top.</strong></li>

                <li>We only operate in regulated markets where we hold the appropriate licenses. We take our responsibilities to customers and our other
                    stakeholders seriously and place great emphasis on working to a ‘compliance first’ model across the business.
                </li>

                <li><strong>Dedicated Customer Service Team:</strong> We are here for you every step of the way with dedicated customer service managers
                    standing by to provide you with a 24/7 top notch customer care service, handling any issues quickly and efficiently.
                </li>

                <li>When customers bet on our site they can rest assured that they are getting a wide variety of betting options, up to date information
                    and the best odds available.
                </li>

                <li>Our customers also have peace of mind, knowing that when it’s time to collect, they are betting with a well-known reputable company.
                </li>

                <li>We have integrated best and secured payment methods on our site and a transaction process that is quick, easy enabling our players to
                    cash out their winnings quickly and securely.
                </li>
            </ul>

            <h2>BUSINESS ADDRESS</h2>

            <address>Name- Sky Infotech N.V.<br />
                Address- Abraham de Veerstraat 9 , Curacao P.O Box 3421
            </address>


            <address>Name- Sky Technology Limited<br />
                Address- 71-75 Shelton Street Covent Garden London WC2H 9JQ
            </address>

        </div>
    )
}

export default AboutPopup
