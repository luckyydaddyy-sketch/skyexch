import React from 'react'
import { useSelector } from 'react-redux';

function TermsPopup() {
    const DD = useSelector((e: any) => e.domainDetails);

    return (
        <div className="announce-wrap">
            <h2>Description: Initial Terms and Conditions replacing general rules</h2>

            <h3>Introduction</h3>

            <p>
                These terms and conditions and the documents referred and linked to below (the “Terms”) set out the
                basis upon which the website
                operated under the URL <a href={`https://${DD.domain}/`} target="_blank">https://{DD.domain}/</a> &nbsp;(the
                “Website”) and its
                related or connected services
                (collectively, the “Service”) will be
                provided to you.
            </p>

            <p>
                Please read these terms very carefully as they form a binding legal agreement between you - our customer
                (the “Customer”) - and
                us. By opening an account (the “Account”) and using the Service you agree to be bound by these terms,
                together with any amendment
                which may be published from time to time.
            </p>

            <p>If anything is not clear to you please contact us using the contact details below.</p>

            <p>The Service is supplied by Sky Infotech N.V.</p>

            <p>
                Transactions and payment services are operated by Sky Infotech N.V a limited liability company
                registered in Curacao, with company registration number 152377 and holding a license no. 365/JAZ
                Sub-License GLH- OCCHKTW0707072017.
            </p>

            <p>
                {DD.domain} will only communicate with Customers by email to their registered email address (the
                “Registered
                Email Address”) as
                provided when opening your Sky Exchange account: Communication from {DD.domain} will be issued through
                the
                following:
            </p>

            <p>mail only:&nbsp;<a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a></p>

            <h3>General Terms</h3>

            <p>
                We reserve the right to amend the terms (including to any documents referred and linked to below) at any
                time. When such amendment
                is not substantial, we may not provide you with prior notice. You will be notified in advance for
                material changes to the terms
                and may require you to re-confirm acceptance to the updated terms before the changes come into effect.
                If you object to any such
                changes, you must immediately stop using the service and the termination provisions below will apply.
                Continued use of the service
                indicates your agreement to be bound by such changes. Any bets not settled prior to the changed terms
                taking effect will be
                subject to the pre-existing terms.
            </p>

            <p>
                If at any time you are in any doubt about how to place bets or otherwise use the service you should
                refer back to these terms or
                contact our customer service department (Customer Service Department) at
                <a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a>
            </p>

            <h3>1. Your Obligations</h3>

            <p>You agree that at all times when using the Service:</p>

            <p>
                You are over 18 years of age (or over the age of majority as stipulated in the laws of the jurisdiction
                applicable to you) and can
                enter into a binding legal agreement with us.
            </p>

            <p>
                It is the User’s responsibility to check and enter this site only if the user is in a country where it
                is lawful to place bets on
                the service (if in doubt, you should seek local legal advice). It is your responsibility to ensure that
                your use of the service is
                legal.
            </p>

            <p>
                When sending money to us you are authorised to do so e.g. you are the authorised user of the
                debit/credit card or other payment
                method you use.
            </p>

            <p>
                You will not, by participating in the Services and/or placing bets be placed in a position of actual,
                potential or perceived
                conflict of interest in any manner.
            </p>

            <p>You have never failed to pay, or attempted to fail to pay a liability on a bet.</p>

            <p>
                You are acting solely on your own behalf as a private individual in a personal capacity and not on
                behalf of another party or for
                any commercial purposes.
            </p>

            <p>
                By placing bets you may lose some or all of your money lodged with us in accordance with these terms and
                you will be fully
                responsible for that loss.
            </p>

            <p>
                You must use the service for legitimate betting purposes only and must not nor attempt to manipulate any
                market or element within
                the service in bad faith or in a manner that adversely affects the integrity of the Service or us.
            </p>

            <p>
                When placing bets on the service you must not use any information obtained in breach of any legislation
                in force in the country in
                which you were when the bet was placed.
            </p>

            <p>
                You must make all payments to us in good faith and not attempt to reverse a payment made or take any
                action which will cause such
                payment to be reversed by a third party in order to avoid a liability legitimately incurred.
            </p>

            <p>
                You must otherwise generally act in good faith in relation to us of the service at all times and for all
                bets made through the
                service.
            </p>

            <h3>2. Registration</h3>

            <p>You agree that at all times when using the service:</p>

            <p>
                In order to protect the integrity of the service and for other operational reasons we reserve the right
                to refuse to accept a
                registration application from any applicant at our sole discretion and without any obligation to
                communicate a specific reason.
            </p>

            <p>
                Before using the service, you must personally complete the registration form and read and accept these
                terms. In order to start
                betting on the service, we will require you to become a verified Customer which includes passing certain
                checks. You may be
                required to provide a valid proof of identification and any other document as it may be deemed
                necessary.
            </p>

            <p>
                This includes but is not limited to, a picture ID (copy of passport, driver’s licence or national ID
                card) and a recent utility
                bill listing your name and address as proof of residence to the minimum. We reserve the right to suspend
                wagering or restrict
                Account options on any Account until the required information is received. This procedure is a statutory
                requirement and is done
                in accordance with the applicable gaming regulation and the anti-money laundering legal requirements.
                Additionally, you will need
                to fund your {DD.domain} Account using the payment methods set out on the payment section of our
                Website.
            </p>

            <p>
                You must provide complete and accurate information about yourself, inclusive of a valid name, surname,
                address and email address,
                and update such information in the future to keep it complete and accurate. It is your responsibility to
                keep your contact details
                up to date on your account. Failure to do so may result in you failing to receive important account
                related notifications and
                information from us, including changes we make to these terms. We identify and communicate with our
                Customers via their Registered
                Email Address. It is the responsibility of the Customer to maintain an active and unique email account,
                to provide us with the
                correct email address and to advise {DD.domain} of any changes in their email address. Each Customer is
                wholly responsible for
                maintaining the security of his Registered Email Address to prevent the use of his Registered Email
                Address by any third party.
                {DD.domain} shall not be responsible for any damages or losses deemed or alleged to have resulted from
                communications between {DD.domain}
                and the Customer using the Registered Email Address. Any Customer not having an email address reachable
                by {DD.domain} will have his
                Account suspended until such an address is provided to us. We will immediately suspend your Account upon
                written notice to you to
                this effect if you intentionally provide false or inaccurate personal information. We may also take
                legal action against you for
                doing so in certain circumstances and/or contact the relevant authorities who may also take action
                against you.
            </p>

            <p>
                You are only allowed to register one Account with the service. Accounts are subject to immediate closure
                if it is found that you
                have multiple Accounts registered with us.
            </p>

            <p>
                This includes the use of representatives, relatives, associates, affiliates, related parties, connected
                persons and/ or third
                parties operating on your behalf.
            </p>

            <p>
                In order to ensure your financial worthiness and to confirm your identity, we may use any third party
                information providers we
                consider necessary.
            </p>

            <p>
                You must keep your password for the service confidential. Provided that the Account information
                requested has been correctly
                supplied, we are entitled to assume that bets, deposits and withdrawals have been made by you. We advise
                you to change your
                password on a regular basis and never disclose it to any third party. Passwords must contain at least
                one letter, one number and
                one special character and must be at least eight characters long. It is your responsibility to protect
                your password and any
                failure to do so shall be at your sole risk and expense. You must log out of the Service at the end of
                each session. If you
                believe any of your Account information is being misused by a third party, or your Account has been
                hacked into, or your password
                has been discovered by a third party, you must notify us immediately by email using your registered
                Email Address to
                <a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a>
            </p>

            <p>
                You must notify us if your registered email Address has been hacked into, we may, however, require you
                to provide additional
                information/ documentation so that we can verify your identity. We will immediately suspend your Account
                once we are aware of such
                an incident. In the meantime you are responsible for all activity on your Account including third party
                access, regardless of
                whether or not their access was authorised by you.
            </p>

            <p>
                You must not at any time transmit any content or other information on the service to another Customer or
                any other party by way of
                a screen capture (or other similar method), nor display any such information or content in a frame or in
                any other manner that is
                different from how it would appear if such Customer or third party had typed the URL for the service
                into the browser line;
            </p>

            <p>
                When registering, you will be required to choose the currency in which you will operate your account.
                This will be the currency of
                your deposits, withdrawals and bets placed and matched into the service as set out in these terms. Some
                payment methods do not
                process in all currencies. In such cases a processing currency will be displayed, along with a
                conversion calculator available on
                the page.
            </p>

            <p>
                We are under no obligation to open an account for you and our website sign-up page is merely an
                invitation to treat. It is
                entirely within our sole discretion whether or not to proceed with the opening of an account for you
                and, should we refuse to open
                an Account for you, we are under no obligation to provide you with a reason for the refusal.
            </p>

            <p>
                Upon receipt of your application, we may be in touch to request further information and/ or
                documentation from you in order for us
                to comply with our regulatory and legal obligations.
            </p>

            <h3>3. Restricted Use</h3>

            <p>3.1 You must not use the Service:</p>

            <p>
                if you are under the age of 18 years (or below the age of majority as stipulated in the laws of the
                jurisdiction applicable to
                you) or if you are not legally able to enter into a binding legal agreement with us;
            </p>

            <p>
                to collect nicknames, e-mail addresses and/or other information of other Customers by any means (for
                example, by sending spam,
                other types of unsolicited e-mails or the unauthorised framing of, or linking to, the Service);
            </p>

            <p>to disrupt or unduly affect or influence the activities of other Customers or the operation of the
                Service generally;.</p>

            <p>
                to promote unsolicited commercial advertisements, affiliate links, and other forms of solicitation which
                may be removed from the
                Service without notice;
            </p>

            <p>
                in any way which, in our reasonable opinion, could be considered as an attempt to: (i) cheat the Service
                or another Customer using
                the Service; or (ii) collude with any other Customer using the Service in order to obtain a dishonest
                advantage;
            </p>

            <p>to scrape our odds or violate any of our Intellectual Property Rights; or</p>

            <p>for any unlawful activity whatsoever.</p>

            <p>3.2 You cannot sell or transfer your account to third parties, nor can you acquire a player account from
                a third party.</p>

            <p>3.3 You may not, in any manner, transfer funds between player accounts.</p>

            <p>
                3.4 We may immediately terminate your Account upon written notice to you if you use the Service for
                unauthorised purposes. We may
                also take legal action against you for doing so in certain circumstances.
            </p>

            <h3>4. Privacy</h3>

            <p>
                Any information provided to us by you will be protected and processed in strict accordance with these
                Terms and our Privacy
                Policy.
            </p>

            <p>
                We will not reveal the identity of any person who places bets using the service unless the information
                is lawfully required by
                competent authorities such as Regulators, the Police (e.g. to investigate fraud, money laundering or
                sports integrity issues), or
                by Financial Entities such as banks or payment suppliers or as permitted from time to time pursuant to
                the Privacy Policy.
            </p>

            <p>
                Upon registration, your information will be stored in our database. This means that your personal
                information may be transferred
                outside the European Economic Area (EEA) to jurisdictions that may not provide the same level of
                protection and security as
                applied within the EU or EEA. By agreeing to these Terms you agree to the transfer of your personal
                information for the purpose of
                the provision of the Service object of this agreement and as further detailed in our&nbsp;Privacy Policy.
            </p>

            <h3>5. Your Account</h3>

            <p>We accept Accounts in multiple currencies, please refer to:</p>

            <p>
                <a href="https://{DD.domain}/currency">https://{DD.domain}/currency</a> account balances and
                transactions appear in the currency
                selected when the account was originally opened.
            </p>

            <p>We do not give credit for the use of the service.</p>

            <p>
                We may close or suspend an Account and refund any monies held if you are not or we reasonably believe
                that you are not complying
                with these Terms, or to ensure the integrity or fairness of the Service or if we have other reasonable
                grounds to do so. We may
                not always be able to give you prior notice.
            </p>

            <p>
                We reserve the right to suspend an account without prior notice and return all funds. Contractual
                obligations already matured will
                however be honoured.
            </p>

            <p>
                We reserve the right to refuse, restrict, cancel or limit any wager at any time for whatever reason,
                including any bet perceived
                to be placed in a fraudulent manner in order to circumvent our betting limits and/ or our system
                regulations.
            </p>

            <p>If we close or suspend your account due to you not complying with these terms, we may cancel and/or void
                any of your bets.</p>

            <p>
                If any amount is mistakenly credited to your account it remains our property and when we become aware of
                any such mistake, we
                shall notify you and the amount will be withdrawn from your Account.
            </p>

            <p>If, for any reason, your account goes overdrawn, you shall be in debt to us for the amount overdrawn.</p>

            <p>You must inform us as soon as you become aware of any errors with respect to your Account.</p>

            <p>
                Customers have the right to self-exclude themselves from&nbsp;bertbarter.com.. These requests have to be
                received from the Customer’s
                Registered Email Address and have to be sent to <a href={`mailto:support@${DD.domain}`}>support@{DD.domain}</a>.
            </p>

            <p>
                Customers may set limitations on the amount they may wager and lose. Such request has to be sent from
                the Customer’s Registered
                Email Address to&nbsp;<a href={`mailto:support@${DD.domain}`}>support@{DD.domain}</a>. Implementation and
                increasing of limits shall be
                processed diligently, however, any request for removing or reducing limitations shall be done after a
                cooling-off period of seven
                days following your request.
            </p>

            <p>
                Should you wish to close your account with us, please send an email from your Registered Email Address
                to&nbsp;<a href={`mailto:support@${DD.domain}`}>support@{DD.domain}</a>.
            </p>

            <h3>6. Deposit of Funds</h3>

            <p>
                You may deposit funds into your Account by any of the methods set out on our Website. All deposits
                should be made in the same currency as your Account and any deposits made in any other currency will be
                converted using the daily exchange rate obtained from&nbsp;www.oanda.com, or at our own bank’s prevailing
                rate of exchange following which your Account will be deposited accordingly.
            </p>

            <p>
                Fees and charges may apply to customer’s deposits and withdrawals. Fee and charge details can be found
                here:https://{DD.domain}/ payment-options. Any deposit made to an account which is not
                rolled over
                (risked) three times will
                incur a 3% processing fee and any applicable withdrawal fee. You are responsible for your own bank
                charges that you may incur due
                to depositing funds with us. Exceptions to this rule are outlined in our “Payment Options” pages.
            </p>

            <p>
                {DD.domain} is not a financial institution and uses a third party electronic payment processors to
                process
                credit and debit card
                deposits; they are not processed directly by us. If you deposit funds by either a credit card or a debit
                card, your Account will
                only be credited if we receive an approval and authorisation code from the payment issuing institution.
                If your card’s issuer
                gives no such authorisation, your account will not be credited with those funds.
            </p>

            <p>Your funds are deposited and held in the respective client account based on the currency of your account.
            </p>

            <p>
                We are not a financial institution and you will not be entitled to any interest on any outstanding
                account balances and any
                interest accrued on the client accounts will be paid to us.
            </p>

            <p>Funds originating from ill-gotten means must not be deposited with us.</p>

            <h3>7. Withdrawal of Funds</h3>

            <p>
                You may withdraw any or all of your account Balance within the transaction maximums as shown on the
                Website
                here:&nbsp; https://{DD.domain}/payment-options. Note that fees may apply as outlined in section
                7.b.
            </p>

            <p>All withdrawals must be made in the currency of your account, unless otherwise stipulated by us.</p>

            <p>
                We reserve the right to request documentation for the purpose of identity verification prior to granting
                any withdrawals from your
                Account. We also reserve our rights to request this documentation at any time during the lifetime of
                your relationship with us.
            </p>

            <p>
                All withdrawals must be made to the original debit, credit card, bank account, method of payment used to
                make the payment to your
                {DD.domain} Account. We may, and always at our own discretion, allow you to withdraw to a payment method
                from which your original
                deposit did not originate. This will always be subject to additional security checks.
            </p>

            <p>
                Should you wish to withdraw funds but your account is either inaccessible, dormant, locked or closed,
                please contact our Customer
                Service Department at <a href={`mailto:support@${DD.domain}`}>support@{DD.domain}</a>
            </p>

            <h3>8. Payment Transactions and Processors</h3>

            <p>
                You are fully responsible for paying all monies owed to us. You must make all payments to us in good
                faith and not attempt to
                reverse a payment made or take any action which will cause such payment to be reversed by a third party
                in order to avoid a
                liability legitimately incurred. You will reimburse us for any charge-backs, denial or reversal of
                payment you make and any loss
                suffered by us as a consequence thereof. We reserve the right to also impose an administration fee of
                €60, or currency equivalent
                per charge-back, denial or reversal of payment you make.
            </p>

            <p>
                We reserve the right to use third party electronic payment processors and or merchant banks to process
                payments made by you and
                you agree to be bound by their terms and conditions providing they are made aware to you and those terms
                do not conflict with
                these Terms.
            </p>

            <p>
                All transactions made on our site might be checked to prevent money laundering or terrorism financing
                activity. Suspicious
                transactions will be reported to the relevant authority depending on the jurisdiction governing the
                transaction.
            </p>

            <h3>9. Errors</h3>

            <p>
                In the event of an error or malfunction of our system or processes, all bets are rendered void. You are
                under an obligation to
                inform us immediately as soon as you become aware of any error with the service. In the event of
                communication or system errors or
                bugs or viruses occurring in connection with the service and/or payments made to you as a result of a
                defect or effort in the
                Service, we will not be liable to you or to any third party for any direct or indirect costs, expenses,
                losses or claims arising
                or resulting from such errors, and we reserve the right to void all games/bets in question and take any
                other action to correct
                such errors.
            </p>

            <p>
                In the event of a casino system malfunction, or disconnection issues, all bets are rendered void. In the
                event of such error or
                any system failure or game error that results in an error in any odds calculation, charges, fees, rake,
                bonuses or payout, or any
                currency conversion as applicable, or other casino system malfunction (the “Casino Error”), we reserve
                the right to declare null
                and void any wagers or bets that were the subject of such Casino Error and to take any money from your
                Account relating to the
                relevant bets or wagers.
            </p>

            <p>
                We make every effort to ensure that we do not make errors in posting lines. However, if as a result of
                human error or system
                problems a bet is accepted at an odd that is: materially different from those available in the general
                market at the time the bet
                was made; or clearly incorrect given the chance of the event occurring at the time the bet was made then
                we reserve the right to
                cancel or void that wager, or to cancel or void a wager made after an event has started.
            </p>

            <p>
                We have the right to recover from you any amount overpaid and to adjust your account to rectify any
                mistake. An example of such a
                mistake might be where a price is incorrect or where we enter a result of an event incorrectly. If there
                are insufficient funds in
                your Account, we may demand that you pay us the relevant outstanding amount relating to any erroneous
                bets or wagers. Accordingly,
                we reserve the right to cancel, reduce or delete any pending plays, whether placed with funds resulting
                from the error or not.
            </p>

            <h3>10. General Rules</h3>

            <p>If a sport-specific rule contradicts a general rule, then the general rule will not apply.</p>

            <p>
                The winner of an event will be determined on the date of the event’s settlement; we do not recognise
                protested or overturned
                decisions for wagering purposes. The result of an event suspended after the start of competition will be
                decided according to the
                wagering rules specified for that sport by us.
            </p>

            <p>
                All results posted shall be final after 72 hours and no queries will be entertained after that period of
                time. Within 72 hours
                after results are posted, the company will only reset/correct the results due to human error, system
                error or mistakes made by the
                referring results source.
            </p>

            <p>
                Minimum and maximum wager amounts on all sporting events will be determined by us and are subject to
                change without prior written
                notice. We also reserve the right to adjust limits on individual Accounts as well.
            </p>

            <p>
                Customers are solely responsible for their own account transactions. Please be sure to review your
                wagers for any mistakes before
                sending them in. Once a transaction is complete, it cannot be changed. We do not take responsibility for
                missing or duplicate
                wagers made by the Customer and will not entertain discrepancy requests because a play is missing or
                duplicated. Customers may
                review their transactions in the My Account section of the site after each session to ensure all
                requested wagers were accepted.
            </p>

            <p>For a wager to have action on any named contestant in a Yes/No Proposition, the contestant must enter and
                compete in the event.</p>

            <p>
                We attempt to follow the normal conventions to indicate home and away teams by indicating the home and
                away team by means of
                vertical placement on the desktop site version. This means in American Sports we would place the home
                team on the bottom. For
                Non-US sports, we would indicate the home team on top. In the case of a neutral venue, we attempt to
                include the letter “N” next
                to the team names to indicate this. For the Asian and mobile versions, we do not distinguish between
                European and American Sports.
                On the Asian and mobile versions of the site, the home team is always listed first. However, we do not
                guarantee the accuracy of
                this information and unless there is an official venue change subsequent to bets being placed, all
                wagers have action.
            </p>

            <p>
                A game/match will have action regardless of the League heading that is associated with the matchup. For
                example, two teams from
                the same League are playing in a Cup competition. If the matchup is mistakenly placed in the League
                offering, the game/match will
                still have action, as long as the matchup is correct. In other words, a matchup will have action as long
                as the two teams are
                correct, and regardless of the League header in which it is placed on our Website.
            </p>

            <p>
                If an event is not played on the same date as announced by the governing body, then all wagers on the
                event have no action. If an
                event is posted by us, with an incorrect date, all wagers have action based on the date announced by the
                governing body.
            </p>

            <p>{DD.domain} reserves the right to remove events, markets and any other product from the website.</p>

            <p>{DD.domain} eserves the right to restrict the casino access of any player without prior notice.</p>

            <p>
                In all futures wagering (for example, total season wins, Super Bowl winner, etc.), the winner as
                determined by the Governing Body
                will also be declared the winner for betting purposes except when the minimum number of games required
                for the future to have
                “action” has not been completed.
            </p>

            <h3>11. Communications and Notices</h3>

            <p>
                All communications and notices to be given under these terms by you to us shall be sent to&nbsp;<a href={`mailto:support@${DD.domain}`}>support@{DD.domain}</a>
            </p>

            <p>
                All communications and notices to be given under these terms by us to you shall, unless otherwise
                specified in these terms, be
                either posted on the Website and/or sent to the Registered Email Address we hold on our system for the
                relevant Customer. The
                method of such communication shall be in our sole and exclusive discretion.
            </p>

            <p>
                All communications and notices to be given under these terms by either you or us shall be in writing in
                the English language when
                the service is not operated by {DD.domain} , and must be given to and from the Registered Email Address
                in
                your Account.
            </p>

            <h3>12. Matters Beyond Our Control</h3>

            <p>
                We cannot be held liable for any failure or delay in providing the service due to an event of Force
                Majeure which could reasonably
                be considered to be outside our control despite our execution of reasonable preventative measures such
                as: an act of God; trade or
                labour dispute; power cut; act, failure or omission of any government or authority; obstruction or
                failure of telecommunication
                services; or any other delay or failure caused by a third party, and we will not be liable for any
                resulting loss or damage that
                you may suffer. In such an event, we reserve the right to cancel or suspend the Service without
                incurring any liability.
            </p>

            <h3>13. Liability</h3>

            <p>
                TO THE EXTENT PERMITTED BY APPLICABLE LAW, WE WILL NOT COMPENSATE YOU FOR ANY REASONABLY FORESEEABLE
                LOSS OR DAMAGE (EITHER DIRECT
                OR INDIRECT) YOU MAY SUFFER IF WE FAIL TO CARRY OUT OUR OBLIGATIONS UNDER THESE TERMS UNLESS WE BREACH
                ANY DUTIES IMPOSED ON US BY
                LAW (INCLUDING IF WE CAUSE DEATH OR PERSONAL INJURY BY OUR NEGLIGENCE) IN WHICH CASE WE SHALL NOT BE
                LIABLE TO YOU IF THAT FAILURE
                IS ATTRIBUTED TO
            </p>

            <p>(I) YOUR OWN FAULT;</p>

            <p>
                (II) A THIRD PARTY UNCONNECTED WITH OUR PERFORMANCE OF THESE TERMS (FOR INSTANCE PROBLEMS DUE TO
                COMMUNICATIONS NETWORK
                PERFORMANCE, CONGESTION, AND CONNECTIVITY OR THE PERFORMANCE OF YOUR COMPUTER EQUIPMENT); OR(III) ANY
                OTHER EVENTS WHICH NEITHER
                WE NOR OUR SUPPLIERS COULD HAVE FORESEEN OR FORESTALLED EVEN IF WE OR THEY HAD TAKEN REASONABLE CARE. AS
                THIS SERVICE IS FOR
                CONSUMER USE ONLY WE WILL NOT BE LIABLE FOR ANY BUSINESS LOSSES OF ANY KIND.
            </p>

            <p>
                IN THE EVENT THAT WE ARE HELD LIABLE FOR ANY EVENT UNDER THESE TERMS, OUR TOTAL AGGREGATE LIABILITY TO
                YOU UNDER OR IN CONNECTION
                WITH THESE TERMS SHALL NOT EXCEED
            </p>

            <p>
                (A) THE VALUE OF THE BETS AND OR WAGERS YOU PLACED VIA YOUR ACCOUNT IN RESPECT OF THE RELEVANT BET/WAGER
                OR PRODUCT THAT GAVE RISE
                TO THE RELEVANT LIABILITY, OR
            </p>

            <p>(B) EUR €500 IN AGGREGATE, WHICHEVER IS LOWER.</p>

            <p>
                WE STRONGLY RECOMMEND THAT YOU (I) TAKE CARE TO VERIFY THE SUITABILITY AND COMPATIBILITY OF THE SERVICE
                WITH YOUR OWN COMPUTER
                EQUIPMENT PRIOR TO USE; AND(II) TAKE REASONABLE PRECAUTIONS TO PROTECT YOURSELF AGAINST HARMFUL PROGRAMS
                OR DEVICES INCLUDING
                THROUGH INSTALLATION OF ANTI-VIRUS SOFTWARE.
            </p>

            <h3>14. Gambling By Those Under Age</h3>

            <p>
                If we suspect that you are or receive notification that you are currently under 18 years or were under
                18 years (or below the age
                of majority as stipulated in the laws of the jurisdiction applicable to you) when you placed any bets
                through the service your
                account will be suspended to prevent you placing any further bets or making any withdrawals from your
                account. We will then
                investigate the matter, including whether you have been betting as an agent for, or otherwise on behalf,
                of a person under 18
                years (or below the age of majority as stipulated in the laws of the jurisdiction applicable to you). If
                having found that you:
                (a) are currently; (b) were under 18 years or below the majority age which applies to you at the
                relevant time; or © have been
                betting as an agent for or at the behest of a person under 18 years or below the majority age which
                applies:
            </p>

            <p>i. all winnings currently or due to be credited to your account will be retained;</p>

            <p>
                ii. all winnings gained from betting through the service whilst under age must be paid to us on demand
                (if you fail to comply with
                this provision we will seek to recover all costs associated with recovery of such sums); and/or
            </p>

            <p>iii. any monies deposited in your {DD.domain} account which are not winnings will be returned to you.</p>

            <p>
                This condition also applies to you if you are over the age of 18 years but you are placing your bets
                within a jurisdiction which
                specifies a higher age than 18 years for legal betting and you are below that legal minimum age in that
                jurisdiction.
            </p>

            <p>
                In the event we suspect you are in breach of the provisions of this Clause 15 or are attempting to rely
                on them for a fraudulent
                purpose, we reserve the right to take any action necessary in order to investigate the matter, including
                informing the relevant
                law enforcement agencies.
            </p>

            <h3>15. Fraud</h3>

            <p>
                We will seek criminal and contractual sanctions against any Customer involved in fraud, dishonesty or
                criminal acts. We will withhold payment to any Customer where any of these are suspected. The Customer
                shall indemnify and shall be liable to pay to us on demand, all costs, charges or losses sustained or
                incurred by us (including any direct, indirect or consequential losses, loss of profit, loss of business
                and loss of reputation) arising directly or indirectly from the Customer’s fraud, dishonesty or criminal
                act.
            </p>

            <h3>16. Intellectual Property</h3>

            <p>We trade as {DD.domain} and the {DD.domain} name and logo are registered trademarks. Any unauthorised use
                of our trademark and logo may result in legal action being taken against you.
            </p>

            <p>
                The <a href="mailto:https://{DD.domain}/">https://{DD.domain}/</a> uniform resource locator (URL)
                is owned by us and no unauthorised use of the
                URL is permitted on another website or digital platform without our prior written consent.
            </p>

            <p>
                As between us and you, we are the sole owners of the rights in and to the Service, our technology,
                software and business systems (the “Systems”) as well as our odds.
            </p>

            <ul>
                <li>you must not use your personal profile for your own commercial gain (such as selling your status
                    update to an advertiser); and</li>
                <li>when selecting a nickname for your Account we reserve the right to remove or reclaim it if we
                    believe it appropriate.
                </li>
            </ul>
            <p>
                You may not use our URL, trademarks, trade names and/or trade dress, logos (the “Marks”) and/or our odds
                in connection with any product or service that is not ours, that in any manner is likely to cause
                confusion among Customers or in the public or that in any manner disparages us.
            </p>
            <p>
                Except as expressly provided in these Terms, we and our licensors do not grant you any express or
                implied rights, licence, title or interest in or to the Systems or the Marks and all such rights,
                licence, title and interest specifically retained by us and our licensors. You agree not to use any
                automatic or manual device to monitor or copy web pages or content within the Service. Any unauthorised
                use or reproduction may result in legal action being taken against you.
            </p>

            <h3>17. Your Licence</h3>

            <p>
                Subject to these terms and your compliance with them, we grant to you a non-exclusive, limited, non
                transferable and non sub-licensable licence to access and use the Service for your personal
                non-commercial purposes only. Our licence to you terminates if our agreement with you under these Terms
                ends.
            </p>

            <p>
                Save in respect of your own content, you may not under any circumstances modify, publish, transmit,
                transfer, sell, reproduce, upload, post, distribute, perform, display, create derivative works from, or
                in any other manner exploit, the service and/or any of the content thereon or the software contained
                therein, except as we expressly permit in these terms or otherwise on the website. No information or
                content on the service or made available to you in connection with the Service may be modified or
                altered, merged with other data or published in any form including for example screen or database
                scraping and any other activity intended to collect, store, reorganise or manipulate such information or
                content.
            </p>

            <p>
                Any non-compliance by you with this Clause may also be a violation of our or third parties’ intellectual
                property and other proprietary rights which may subject you to civil liability and/or criminal
                prosecution.
            </p>

            <h3>18. Your Conduct and Safety</h3>

            <p>
                We would like you to enjoy the Service. However, for your protection and that of all Customers, the
                posting of any content on the service, as well as conduct in connection therewith and/or the service,
                which is in any way unlawful, inappropriate or undesirable is strictly prohibited - it is Prohibited
                Behaviour. If you engage in Prohibited Behaviour, or we determine in our sole discretion that you are
                engaging in Prohibited Behaviour, your {DD.domain} Account and/or your access to or use of the Service
                may be terminated immediately without notice to you.
            </p>

            <p>
                Legal action may be taken against you by another Customer, other third party, enforcement authorities
                and/or us with respect to you having engaged in Prohibited Behaviour.
            </p>

            <p>
                Prohibited Behaviour includes, but is not limited to, accessing or using the Service to:
            </p>
            <ul>
                <li>i. promote or share information that you know is false, misleading or unlawful;</li>
                <li>ii. conduct any unlawful or illegal activity, such as, but not limited to, any activity that
                    furthers or promotes any criminal activity or enterprise, provides instructional information about
                    making or buying weapons, violates another Customer’s or any other third party’s privacy or other
                    rights or that creates or spreads computer viruses;</li>
                <li>iii. harm minors in any way;</li>
                <li>iv. transmit or make available any content that is unlawful, harmful, threatening, abusive,
                    tortuous, defamatory, vulgar, obscene, lewd, violent, hateful, or racially or ethnically or
                    otherwise objectionable;</li>
                <li>v. transmit or make available any content that the user does not have a right to make available
                    under any law or contractual or fiduciary relationship, including without limitation, any content
                    that infringes a third party’s copyright, trademark or other intellectual property and proprietary
                    rights;</li>
                <li>vi. transmit or make available any content or material that contains any software virus or other
                    computer or programming code (including HTML) designed to interrupt, destroy or alter the
                    functionality of the Service, its presentation or any other website, computer software or hardware;
                </li>
                <li>vii. interfere with, disrupt or reverse engineer the Service in any manner, including, without
                    limitation, intercepting, emulating or redirecting the communication protocols used by us, creating
                    or using cheats, mods or hacks or any other software designed to modify the Service, or using any
                    software that intercepts or collects information from or through the Service;</li>
                <li>viii. retrieve or index any information from the Service using any robot, spider or other automated
                    mechanism;</li>
                <li>ix. participate in any activity or action that, in the sole and entire unfettered discretion of us
                    results or may result in another Customer being defrauded or scammed;</li>
                <li>x. transmit or make available any unsolicited or unauthorised advertising or mass mailing such as,
                    but not limited to, junk mail, instant messaging, "spim", "spam", chain letters, pyramid schemes or
                    other forms of solicitations;</li>
                <li>xi. create {DD.domain} Accounts by automated means or under false or fraudulent pretences;</li>
                <li>xii. impersonate another Customer or any other third party, or</li>
                <li>xiii. any other act or thing done that we reasonably consider to be contrary to our business
                    principles.</li>
            </ul>

            <p>The above list of Prohibited Behaviour is not exhaustive and may be modified by us at any time or from
                time to time. If you become aware of the misuse of the service by another Customer or any other person,
                please contact us through the “Contact Us” section of the Website. We reserve the right to investigate
                and to take all such actions as we in our sole discretion deems appropriate or necessary under the
                circumstances, including without limitation, deleting the Customer’s posting(s) from the Service and/or
                terminating their account, and take any action against any Customer or third party who directly or
                indirectly in, or knowingly permits any third party to directly or indirectly engage in, Prohibited
                Behaviour, with or without notice to such Customer or third party.</p>

            <h3>19. Links to Other Websites</h3>

            <p>
                The Service may contain links to third party websites that are not maintained by, or related to, us, and
                over which we have no control. Links to such websites are provided solely as a convenience to Customers,
                and are in no way investigated, monitored or checked for accuracy or completeness by us. Links to such
                websites do not imply any endorsement by us of, and/or any affiliation with, the linked websites or
                their content or their owner(s). We have no control over or responsibility for the availability nor
                their accuracy, completeness, accessibility and usefulness. Accordingly when accessing such websites we
                recommend that you should take the usual precautions when visiting a new website including reviewing
                their privacy policy and terms of use.
            </p>

            <h3>20. Complaints</h3>

            <p>
                If you have any concerns or questions regarding these terms you should contact our Customer Service
                Department via email at <a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a>.
            </p>

            <p>NOTWITHSTANDING THE FOREGOING, WE TAKE NO LIABILITY WHATSOEVER TO YOU OR TO ANY THIRD PARTY WHEN
                RESPONDING TO ANY COMPLAINT THAT WE RECEIVED OR TOOK ACTION IN CONNECTION THEREWITH.</p>

            <p>
                Any Customer of the Service who has any concerns or questions regarding these Terms regarding the
                settlement of any {DD.domain} market should contact our Customer Service Department at <a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a> using their Registered Email Address.
            </p>

            <p>If a Customer is not satisfied with how a bet has been settled then the Customer should provide details
                of their grievance to our Customer Service Department via email at&nbsp;<a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a> We shall use our reasonable endeavours to
                respond to queries of this nature within a few days (and in any event we intend to respond to all such
                queries within 28 days of receipt).</p>

            <p>Disputes must be lodged within three (3) days from the date the wager in question has been decided. No
                claims will be honored after this period. The Customer is solely responsible for their Account
                transactions. Complaints/disputes have to be sent to&nbsp;support@{DD.domain} and must be sent from the
                Customer’s Registered Email Address.</p>

            <p>In the event of a dispute arising between you and us our Customer Service Department will attempt to
                reach an agreed solution. Should our Customer Service Department be unable to reach an agreed solution
                with you, the matter will be escalated to our management in accordance with our Complaints Procedure
                (available upon request).</p>

            <p>The Customer has the right to lodge a complaint with one of our licensing bodies should all efforts to
                resolve a dispute to the Customer’s satisfaction have failed. </p>

            <h3>21. Registration and Account Security</h3>

            <p>
                Customers of the service must provide their real names and information and, in order to comply with
                this, all Customers must commit to the following rules when registering &amp; maintaining your Account:
            </p>

            <ul>
                <li>
                    you must not provide any false personal information on the Service, or create an Account for anyone
                    other than yourself;
                </li>
                <li>
                    you must not use your personal profile for your own commercial gain (such as selling your status
                    update to an advertiser); and
                </li>
                <li>when selecting a nickname for your Account we reserve the right to remove or reclaim it if we
                    believe appropriate.</li>
            </ul>

            <h3>
                22. Assignment
            </h3>

            <p>Neither these terms nor any of the rights or obligations hereunder may be assigned by you without the
                prior written consent of us, which consent will not be unreasonably withheld. We may, without your
                consent, assign all or any portion of our rights and obligations hereunder to any third party provided
                such third party is able to provide a service of substantially similar quality to the Service by posting
                written notice to this effect on the Service.</p>

            <h3>
                23. Severability
            </h3>
            <p>In the event that any provision of these terms is deemed by any competent authority to be unenforceable
                or invalid, the relevant provision shall be modified to allow it to be enforced in line with the
                intention of the original text to the fullest extent permitted by applicable law. The validity and
                enforceability of the remaining provisions of these terms shall not be affected.</p>

            <h3>24. Breach of These Terms</h3>
            <p>Without limiting our other remedies, we may suspend or terminate your account and refuse to continue to
                provide you with the service, in either case without giving you prior notice, if, in our reasonable
                opinion, you breach any material term of these Terms. Notice of any such action taken will, however, be
                promptly provided to you.</p>

            <h3>25. Governing Law and Jurisdiction</h3>
            <p>This Agreement shall in all respects be governed, interpreted by, and construed in accordance with the
                laws of Curacao. All disputes, differences, complaints etc., shall be subject to Arbitration under the
                Curacao. The arbitrator will be appointed by the company after due consent from the company and the
                user. The place of arbitration shall be Curacao. </p>

            <h3>26. General Provisions</h3>
            <p>Term of agreement. These terms shall remain in full force and effect while you access or use the service
                or are a Customer of {DD.domain}. These terms will survive the termination of your {DD.domain} Account
                for any reason.</p>
            <p>Gender. Words importing the singular number shall include the plural and vice versa, words importing the
                masculine gender shall include the feminine and neuter genders and vice versa and words importing
                persons shall include individuals, partnerships, associations, trusts, unincorporated organisations and
                corporations.</p>
            <p>Waiver. No waiver by us, whether by conduct or otherwise, of a breach or threatened breach by you of any
                term or condition of these Terms shall be effective against, or binding upon, us unless made in writing
                and duly signed by us, and, unless otherwise provided in the written waiver, shall be limited to the
                specific breach waived. The failure of us to enforce at any time any term or condition of these Terms
                shall not be construed to be a waiver of such provision or of the right of us to enforce such provision
                at any other time.</p>
            <p>Headings. The division of these Terms into paragraphs and sub-paragraphs and the insertion of headings
                are for convenience of reference only, and shall not affect or be utilised in the construction or
                interpretation of these Terms agreement. The terms "these Terms", "hereof", “hereunder” and similar
                expressions refer to these Terms and not to any particular paragraph or sub-paragraph or other portion
                hereof and include any agreement supplemental hereto. Unless the subject matter or context is
                inconsistent therewith, references herein to paragraphs and sub-paragraphs are to paragraphs and
                sub-paragraphs of these Terms.</p>
            <p>Acknowledgement. By hereafter accessing or using the Service, you acknowledge having read, understood and
                agreed to each and every paragraph of these Terms. As a result, you hereby irrevocably waive any future
                argument, claim, demand or proceeding to the contrary of anything contained in these Terms.</p>
            <p>Language. In the event of there being a discrepancy between the English language version of these rules
                and any other language version, the English language version will be deemed to be correct.
            </p>
            <p>Entire agreement. These Terms constitute the entire agreement between you and us with respect to your
                access to and use of the Service, and supersedes all other prior agreements and communications, whether
                oral or written with respect to the subject matter hereof.</p>
            <p>Betting Rules</p>
            <p>Any dispute related to the sports betting product shall be emailed to: <a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a></p>
            <p>Casino Rules</p>
            <p>Any dispute related to the casino product shall be emailed to: <a href={`mailto:support@${DD.domain}`} >support@{DD.domain}</a></p>
            <p>Complete casino rules can be accessed from within the casino games.</p>
            <p>ACCEPTING THE TERMS AND CONDITIONS </p>
            <p>You hereby accept the fact that you have read, understood and are willing to abide by the above Terms and
                Conditions. </p>

            <h3>Casino Payout restrictions</h3>

            <ul>
                <li>Restriction of payout is applicable for <strong>all Casino games</strong></li>
                <li>
                    In Single round, User is eligible for a <strong>max payout of 100 times his bet amount</strong>, example if the bet is 100 then max
                    payout shall be 100 X 100 = 10000, any winning above this multiplier shall not be paid out by the company.
                </li>
                <li>
                    Another restriction is <strong>max payout amount is capped at 2,00,00,000 (2 Crore points) </strong>, if net winning amount is beyond
                    this amount then user shall be paid only this amount as max winning in Casino games.
                </li>
            </ul>
        </div >
    )
}

export default TermsPopup