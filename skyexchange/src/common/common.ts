
export const USER_API = {
    LOGIN: 'auth/login',
    CHANGE_PASSWORD: 'auth/changePassword',
    HOME: 'home',
    IN_PLAY: 'inPlay',
    MULTI_LIST: 'multi',
    PIN: 'multi/pin',
    PLACE_BET: 'sports/placeBet',
    BET_LIST: 'sports/betList',
    SEARCH : 'sports/search',
    GET_CHANNEL_ID : 'sports/getChannelId',
    GET_STACK : 'getStack',
    UPDATE_STACK : 'updateStack',
    GET_BLOCK :'sports/getBlockMatch',
    GET_PROFILE : 'auth/getProfile',
    MARKET_LIST :'home/marketList',
    CASINO_LOGIN : 'casino/login',
    ADD_DEPOSIT : 'onlinePayment/addDeposit',
    ADD_WITHDRAW : 'onlinePayment/addWithdrawal',
    GET_METHOD : 'onlinePayment/getMethod',
    GET_WITHDRAWAL_REQUEST : 'onlinePayment/getWithdrawalRequest',
    GET_DEPOSIT_REQUEST : 'onlinePayment/getDepositRequest',
}

export const ADMIN_API = {
    LOGIN: 'login',
    GET_ROLE: 'getRole',
    DOWN_LINE_LIST: 'downLineList',
    PLAYER_CREATE: 'downLineList/player/create',
    PLAYER_GET_PROFILE: 'downLineList/player/getProfile',
    PLAYER_BET_HISTORY: 'downLineList/player/betHistory',
    PLAYER_CASINO_BET_HISTORY: 'downLineList/player/casinoHistory',

    AGENT_CREATE: 'downLineList/agent/create',
    AGENT_UPDATE_INFO: 'downLineList/agent/updateInfo',
    PLAYER_UPDATE_INFO: 'downLineList/player/updateInfo',
    AGENT_GET_LIST: 'downLineList/agent/getList',
    BET_HISTORY: 'downLineList/player/betHistory',
    REPORT: {
        DOWN_LINE: 'report/downline',
        ACCOUNT_STATEMENT: 'report/accountStatment',
        STATEMENT_BET_VIEW :'myAccount/statementBetView'
    },
    MY_ACCOUNT: {
        GET_PROFILE: 'myAccount/getProfile',
        GET_ACTIVITIES: 'myAccount/getActivities',
        GET_STATEMENTS: 'myAccount/getStatements',
    },
    BET_LIST: {
        LIST_LIVE: 'betList/liveList',
        LIST: 'betList/list'
    },
    RISK: 'risk',
    BANKING: {
        GET_BALANCE: 'banking/master/getBalance',
        ADD_BALANCE: 'banking/master/addBalance',
        GET_LIST: 'banking/getList',
        UPDATE: 'banking/update'
    },
    SPORTS: {
        LIST: 'sports/getList'
    },
    SETTING: {
        BANNER: {
            GET_LIST: 'setting/banner',
            GET_ONE: 'setting/banner/getOne',
            CREATE: 'setting/banner/create',
            UPDATE: 'setting/banner/update',
        },
        DASHBOARD: {
            GET_LIST: 'setting/dashboard',
            GET_ONE: 'setting/dashboard/getOne',
            CREATE: 'setting/dashboard/create',
            UPDATE: 'setting/dashboard/update',
        },
        MANAGE_CASINO: {
            GET_LIST: 'setting/manageCasino',
            CREATE: 'setting/manageCasino/create'
        },
        PREMIUM_HISTORY: {
            GET_LIST: 'setting/premiumHistory',
            LIST_OF_BET: 'setting/premiumHistory/listOfBet',
            ROLL_BACK_WINNER: 'setting/premiumHistory/rollBackWinner',
        },
        FANCY_HISTORY: {
            GET_LIST: 'setting/fancyHistory',
            LIST_OF_BET: 'setting/fancyHistory/listOfBet',
            ROLL_BACK_WINNER: 'setting/fancyHistory/rollBackWinner'
        },
        MANAGE_PREMIUM: {
            GET_LIST: 'setting/managePremium',
            LIST_OF_BET: 'setting/managePremium/listOfBet',
            DECLARE_WINNER: 'setting/managePremium/declareWinner',
        },
        MANAGE_FANCY: {
            GET_LIST: 'setting/manageFancy',
            LIST_OF_BET: 'setting/manageFancy/listOfBet',
            DECLARE_WINNER: 'setting/manageFancy/declareWinner'
        },
        MATCH_HISTORY: {
            GET_LIST: 'setting/matchHistory'
        },
        SPORT_MARKET: {
            GET_LIST: 'sports/sportMarket',
            DECLARE_WINNER: 'sports/declareWinner',
            UPDATE: 'sports/updare',
        },
        WEBSITE: {
            CREATE: 'setting/website',
            UPDATE: 'setting/website/update',
            GET_SITE: 'setting/website/getSite',
            LIST: 'setting/website/list',
            GET_DOMAIN: 'setting/website/getDomain',
        },
        FILE_UPLOAD: 'setting/fileUpload'
    }
}

export const COLOR_OPTION = [
    { backgroundColor: "#ffcc2f", color: "#222", label: 'Yellow', value: 'yellow-Dark', headerTextColor: "#fff", headerBgFirst:"#fed403bf", headerBgSecond:"#fed403", login:{background:"linear-gradient(56deg, #3a5870 4%, #1d2c38 42%)", color:"#fff", logginButtonColor: "#000"}},
    { backgroundColor: "#ffcc2f", color: "#222", label: 'Yellow', value: 'yellow-yellow', headerTextColor: "#fff", headerBgFirst:"#fed403bf", headerBgSecond:"#fed403", login:{background:"#000", color:"#fff", logginButtonColor: "#000"}},
    { backgroundColor: "#ffcc2f", color: "#222", label: 'Yellow', value: 'yellow', headerTextColor: "#ffcc2f", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#ffcc2f", color:"#00000099", logginButtonColor: "#ffcc2f"} },
    { backgroundColor: "#67f0c2", color: "#222", label: 'Onsen', value: 'onsen', headerTextColor: "#67f0c2", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#67f0c2", color:"#00000099", logginButtonColor: "#67f0c2"} },
    { backgroundColor: "#291e39", color: "#FFF", label: 'Purple', value: 'purple', headerTextColor: "#291e39", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#291e39", color:"#00000099", logginButtonColor: "#291e39"} },
    { backgroundColor: "#DE352C", color: "#FFF", label: 'Red', value: 'red', headerTextColor: "#ffcc2f", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#DE352C", color:"#00000099", logginButtonColor: "#DE352C"} },
    { backgroundColor: "#5D6699", color: "#000", label: 'Blue', value: 'blue', headerTextColor: "#5D6699", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#5D6699", color:"#00000099", logginButtonColor: "#5D6699"} },
    { backgroundColor: "#000000", color: "#FFF", label: 'Black', value: 'black', headerTextColor: "#000000", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#000000", color:"#00000099", logginButtonColor: "#000000"} },
    { backgroundColor: "#FF3377", color: "#FFF", label: 'Pink', value: 'pink', headerTextColor: "#ffcc2f", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#FF3377", color:"#00000099", logginButtonColor: "#FF3377"} },
    { backgroundColor: "#FFFEBB", color: "#000", label: 'Light Yellow', value: 'light-yellow', headerTextColor: "#FFFEBB", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#FFFEBB", color:"#00000099", logginButtonColor: "#FFFEBB"} },
    { backgroundColor: "#FF8C00", color: "#FFF", label: 'Dark Orange', value: 'dark-orange', headerTextColor: "#FF8C00", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#FF8C00", color:"#00000099", logginButtonColor: "#FF8C00"} },
    { backgroundColor: "#FFD700", color: "#000", label: 'Gold', value: 'gold', headerTextColor: "#FFD700", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#FFD700", color:"#00000099", logginButtonColor: "#FFD700"} },
    { backgroundColor: "#0CFE09", color: "#313131", label: 'Radioactive Green', value: 'radioactive-green', headerTextColor: "#0CFE09", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#0CFE09", color:"#00000099", logginButtonColor: "#0CFE09"} },
    { backgroundColor: "#708090", color: "#000", label: 'Slategrey', value: 'slategrey', headerTextColor: "#708090", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#708090", color:"#00000099", logginButtonColor: "#708090"} },
    { backgroundColor: "#0D4F8B", color: "#FFF", label: 'Indigo Dye', value: 'indigo-dye', headerTextColor: "#0D4F8B", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#0D4F8B", color:"#00000099", logginButtonColor: "#0D4F8B"} },
    { backgroundColor: "#428139", color: "#FFF", label: 'Green', value: 'green', headerTextColor: "#428139", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#428139", color:"#00000099", logginButtonColor: "#428139"} },
    { backgroundColor: "#00A884", color: "#000", label: 'Persian Green', value: 'persian-green', headerTextColor: "#ffcc2f", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#00A884", color:"#00000099", logginButtonColor: "#00A884"} },
    { backgroundColor: "#51e2f5", color: "#000", label: 'Electric Blue', value: 'electric-blue', headerTextColor: "#51e2f5", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#51e2f5", color:"#00000099", logginButtonColor: "#51e2f5"} },
    { backgroundColor: "#0047ab", color: "#FFF", label: 'Dark Royal Blue', value: 'dark-royal-blue', headerTextColor: "#6ac2ff", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#0047ab", color:"#00000099", logginButtonColor: "#0047ab"} },
    { backgroundColor: "#ff00a9", color: "#FFF", label: 'pinkish purple', value: 'pinkish-purple', headerTextColor: "#ff00a9", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#ff00a9", color:"#00000099", logginButtonColor: "#ff00a9"} },
    { backgroundColor: "#099", color: "#FFF", label: 'Dark Cyan', value: 'Dark-Cyan', headerTextColor: "#099", headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#099", color:"#00000099", logginButtonColor: "#099"} },
    // { backgroundColor: "#0a58ca", color: "#FFF", label: 'Dark Royal Blue', value: 'dark-royal-blue', headerBgFirst:"#080808bf", headerBgSecond:"#060606", login:{background:"#000", color:"#fff"} },
]