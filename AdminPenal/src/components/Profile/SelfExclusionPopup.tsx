import React from 'react'
import { useSelector } from 'react-redux';

function SelfExclusionPopup(props: any) {
    const DD = useSelector((e: any) => e.domainDetails);

    return (
        <div className="announce-wrap">
            <p>If you feel you are at risk of developing a gambling problem or believe you currently have a gambling problem, please consider using Self-Exclusion
                which prevents you gambling with {DD.domain} for a specified period of 6 months, 1 year, 2 years, 5 years or permanently.</p>
            <p>If you want to stop playing for other reasons, please consider a Time-Out or using Account Closure.</p>
            <h3>What happens when you self-exclude?</h3>
            <p>During a period of Self-Exclusion you will not be able to use your account for betting, although you will still be able to login and withdraw any
                remaining balance. It will not be possible to re-open your account for any reason, and {DD.domain} will do all it can to detect and close
                any new accounts you may open.</p>
            <h3>Next steps</h3>
            <p>Whilst we will remove you from our marketing databases, we also suggest that you remove {DD.domain} from your notifications and
                delete/uninstall all {DD.domain} apps, downloads and social media links. You may also wish to consider installing software that blocks
                access to gambling websites, click here for more information.</p>
            <p>We recommend that you seek support from a problem gambling support service to help you deal with your problem.</p>
            <p>You can self-exclude your account in the My Gambling Controls section of Members by choosing Self-Exclusion.</p>
            <p>Alternatively you can contact our customer care team for assistance and further information.</p>
            <h3> Self-Exclusion Notice</h3>
            <p>Should you opt to self-exclude from {DD.domain}, we strongly recommend that you seek exclusion from all other gambling operators you have
                an account with.</p>
            <p>You can self-exclude by contacting other gambling operators directly or you can exclude from other licensed operators by completing a
                Self-Exclusion Notice form.</p>
            <p>Once completed the Self-Exclusion Notice form should be submitted to the nominated site, sports bookmaker or betting exchange operator.</p>

        </div>
    )
}

export default SelfExclusionPopup

