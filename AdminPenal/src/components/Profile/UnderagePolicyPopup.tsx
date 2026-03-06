import React from 'react'
import { useSelector } from 'react-redux';

function UnderagePolicyPopup(props: any) {
    const DD = useSelector((e: any) => e.domainDetails);

    return (
        <div className="announce-wrap">
            <p>
                It is illegal for anyone under the age of 18 to open an account or gamble with <a href="https://www.{DD.domain}/" target="_blank">https://www.{DD.domain}/</a>(hereinafter
                "{DD.domain}"). We strictly prohibit
                minors from registering or gambling, and we require new members to declare that they are over 18 years
                of age.
            </p>

            <p>
                {DD.domain} takes all reasonable steps to prevent underage gamblers from accessing and using our
                services, including the use of identity verification services to ensure that all users are eligible to
                play. As a registered user, you can help us prevent underage gambling online.
            </p>

            <p>
                Especially if you access your {DD.domain} account on a shared computer, or if you have underage
                individuals in your household, it's important that you take precautions to prevent underage gambling. Do
                not use software that saves your username and password on shared devices, and consider installing
                parental control programs that can help prevent minors from accessing online gambling websites.
            </p>

            <p>
                {DD.domain} includes several mechanisms that can help you detect unauthorized use of your player
                account. Note the last login time and IP address when you log into your account, and review your game
                transactions and financial transactions in your account details to ensure that there is no suspicious
                activity.
            </p>

            <p>
                Parents with immediate concerns about underage gambling should report immediately to either email&nbsp;
                <a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a> or the support chat.
            </p>

        </div>
    )
}

export default UnderagePolicyPopup
