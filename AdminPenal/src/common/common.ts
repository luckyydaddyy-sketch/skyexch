export const ADMIN_API = {
    LOGIN: 'login',
    GET_ROLE: 'getRole',
    CHANGE_PASSWORD: 'admin/changePassword',
    DOWN_LINE_LIST: 'downLineList',
    PLAYER_CREATE: 'downLineList/player/create',
    PLAYER_GET_PROFILE: 'downLineList/player/getProfile',
    PLAYER_BET_HISTORY: 'downLineList/player/betHistory',
    PLAYER_CASINO_BET_HISTORY: 'downLineList/player/casinoHistory',
    PLAYER_BET_LIST: 'downLineList/player/getBetList',
    PLAYER_BET_LIST_CHEATS: 'sports/getCheatsBets',
    PLAYER_ACTIVE: 'downLineList/player/active',
    AGENT_CREATE: 'downLineList/agent/create',
    AGENT_UPDATE_INFO: 'downLineList/agent/updateInfo',
    PLAYER_UPDATE_INFO: 'downLineList/player/updateInfo',
    PLAYER_BLOCK: 'downLineList/player/cheatBlock',
    AGENT_GET_LIST: 'downLineList/agent/getList',
    CREDIT_REF: 'downLineList/addCreditRef',
    SPORTS_LIMIT: 'downLineList/addSportLimit',
    REPORT: {
        DOWN_LINE: 'report/downline',
        MARKET_REPORT: 'report/marketReport',
        PL_MARKET_REPORT: 'report/profitLossByMarket',
        NEW_MARKET_REPORT: 'report/marketReportNew',
        DOWN_LINE_CASINO: 'report/downlineCasino',
        ACCOUNT_STATEMENT: 'report/accountStatment',
        USER_LIST: 'report/userList',
        STATEMENT_BET_VIEW: 'myAccount/statementBetView',
        DW:"report/deposit-withdrawal",
        SPORTS_PROFIT_LOST:"report/sportsProfitLost",
        CASINO_PROFIT_LOST:"report/casinoProfitLost",
        DW_DAILY:"report/DW-Daily",
    },
    MY_ACCOUNT: {
        GET_PROFILE: 'myAccount/getProfile',
        GET_ACTIVITIES: 'myAccount/getActivities',
        GET_STATEMENTS: 'myAccount/getStatements',
    },
    BET_LIST: {
        LIST_LIVE: 'betList/liveList',
        LIST: 'betList/list',
        MATCH_LIST: 'betList/matchList'
    },
    RISK: 'risk',
    RISK_BET_LIST: 'risk/getBetList',
    RISK_DELETE_BET: 'risk/deleteBet',
    RISK_GET_BLOCK: 'risk/getBlockMatch',
    RISK_UPDATE_BLOCK: 'risk/blockMatch',
    RISK_ADMIN_BOOK_LIST: 'risk/getBetListAdminBook',
    RISK_BET_BIG_AMOUNT_LIST:'risk/getListOfBetBigAmount',
    BANKING: {
        GET_BALANCE: 'banking/master/getBalance',
        ADD_BALANCE: 'banking/master/addBalance',
        GET_LIST: 'banking/getList',
        UPDATE: 'banking/update',
        METHODS: {
            GET_ALL: 'banking/method/getAll',
            GET_ONE: 'banking/method/getOne',
            UPDATE: 'banking/method/updateMethod',
            ADD: 'banking/method/add',
            DELETE: 'banking/method/deleteMethod',
        },
    },
    PRIVILEGES:{
        GET: 'privileged/getUserRole',
        UPDATE: 'privileged/updateUserRole'
    },
    MARKET: {
        LIST: 'market/list',
        BLOCK: 'market/block'
    },
    SPORTS: {
        LIST: 'sports/getList',
        ACTIVE_SPORT: 'sports/activeSport'
    },
    ONLINE_PAYMENT : {
        // onlinePayment/deposit/getList
        DEPOSIT: {
            GET_LIST: 'onlinePayment/deposit/getList',
            APPROVE_DEPOSIT: 'onlinePayment/deposit/approveDeposit',
            APPROVE_DEPOSIT_ADMIN: 'onlinePayment/deposit/approveDepositAdmin',
        },
        WITHDRAW: {
            GET_LIST: 'onlinePayment/withdrawal/getList',
            APPROVE_WITHDRAW: 'onlinePayment/withdrawal/approveWithdrawal',
            APPROVE_WITHDRAW_ADMIN: 'onlinePayment/withdrawal/approveWithdrawalAdmin',
        },
        ADD_REQUEST:{
            ADD_DEPOSIT:"onlinePayment/addRequest/addDeposit",
            ADD_WITHDRAWAL:"onlinePayment/addRequest/addWithdrawal",
            GET_METHOD:"onlinePayment/addRequest/getMethod",
            GET_TRANSACTIONS:"onlinePayment/addRequest/getMyTransactions",
        }
    },
    SETTING: {
        USERS:{
            GET_USER_COUNT : 'totalPlayerCount',
            GET_USER_LIST_BY_DOWNLINE : 'getUserListByDownline',
        },
        BANNER: {
            GET_LIST: 'setting/banner',
            GET_ONE: 'setting/banner/getOne',
            CREATE: 'setting/banner/create',
            UPDATE: 'setting/banner/update',
            DELETE: 'setting/banner/delete',
        },
        DASHBOARD: {
            GET_LIST: 'setting/dashboard',
            GET_ONE: 'setting/dashboard/getOne',
            CREATE: 'setting/dashboard/create',
            UPDATE: 'setting/dashboard/update',
            DELETE: 'setting/dashboard/delete',
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
            ROLL_BACK_WINNER: 'setting/fancyHistory/rollBackWinner',
            LIST_OF_BET_CANCEL: 'setting/fancyHistory/listOfBetCancel',
        },
        MANAGE_PREMIUM: {
            GET_LIST: 'setting/managePremium',
            LIST_OF_BET: 'setting/managePremium/listOfBet',
            DECLARE_WINNER: 'setting/managePremium/declareWinner',
        },
        MANAGE_FANCY: {
            GET_LIST: 'setting/manageFancy',
            LIST_OF_BET: 'setting/manageFancy/listOfBet',
            DECLARE_WINNER: 'setting/manageFancy/declareWinner',
        },
        MATCH_HISTORY: {
            GET_LIST: 'setting/matchHistory',
            ROLL_BACK_WINNER: 'setting/matchHistory/rollBackWinner',
            LIST_OF_CANCEL_MATCH: 'setting/matchHistory/listOfCancel',
        },
        SPORT_MARKET: {
            GET_LIST: 'sports/sportMarket',
            GET_LIST_PLACE_BET: 'sports/sportMarketPlacedBet',
            DECLARE_WINNER: 'sports/declareWinner',
            UPDATE: 'sports/updare',
            UPDATE_PROFIT_LIMIT: 'sports/updateProfitLimit',
            GET_SPORT_USERS_COUNT: 'sports/getUserCount',
            GET_SPORT_BETS_COUNT: 'sports/getBetsCount',
        },
        WEBSITE: {
            ADD: 'setting/website/addWebSite',
            CREATE: 'setting/website',
            UPDATE: 'setting/website/update',
            UPDATE_LINKS: 'setting/website/updateLinks',
            GET_SITE: 'setting/website/getSite',
            GET_SITE_BY_ID: 'setting/website/getSiteById',
            LIST: 'setting/website/list',
            MAINTENANCE: 'setting/website/maintenance',
            GET_DOMAIN: 'setting/website/getDomain',
            ACTIVE : "setting/website/activeDeactiveSite",
            IN_ACTIVE_LIST : "setting/website/getInactiveDomain",
            GET_SPORTS_LIMIT : "setting/website/getSportsLimit",
            UPDATE_SPORTS_LIMIT : "setting/website/updateSportsLimit"
        },
        FILE_UPLOAD: 'setting/fileUpload',
        API_PROVIDER: {
            GET: 'setting/website/getApiProvider',
            UPDATE: 'setting/website/updateApiProvider'
        },
        WHITELABLELIMIT : {
            GET_AGENT_LIST: 'setting/whiteLabelsLimit/getAgentList',
            GET: 'setting/whiteLabelsLimit/getLimit',
            UPDATE: 'setting/whiteLabelsLimit/updateLimit',
            RESET: 'setting/whiteLabelsLimit/resetLimit',
        },
        CONTACT_DETAILS:{
            GET:'setting/contactDetails',
            UPDATE:'setting/contactDetails/updateDetails'
        }
    }
}


export const COLOR_OPTION = [
    { backgroundColor: "#ffcc2f", color: "#222", label: 'Yellow Dark', value: 'yellow-Dark', login:{background:"#000", color:"#fff"}, headerBgFirst:"#fed403bf", headerBgSecond:"#fed403"},
    { backgroundColor: "#ffcc2f", color: "#222", label: 'Yellow Yellow', value: 'yellow-yellow', login:{background:"#000", color:"#fff"}, headerBgFirst:"#fed403bf", headerBgSecond:"#fed403"},
    { backgroundColor: "#ffcc2f", color: "#222", label: 'Yellow', value: 'yellow', login:{background:"#ffcc2f", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#67f0c2", color: "#222", label: 'Onsen', value: 'onsen', login:{background:"#67f0c2", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#291e39", color: "#FFF", label: 'Purple', value: 'purple', login:{background:"#291e39", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#DE352C", color: "#FFF", label: 'Red', value: 'red', login:{background:"#DE352C", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#5D6699", color: "#000", label: 'Blue', value: 'blue', login:{background:"#5D6699", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#000000", color: "#FFF", label: 'Black', value: 'black', login:{background:"#000000", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#FF3377", color: "#FFF", label: 'Pink', value: 'pink', login:{background:"#FF3377", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#FFFEBB", color: "#000", label: 'Light Yellow', value: 'light-yellow', login:{background:"#FFFEBB", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#FF8C00", color: "#FFF", label: 'Dark Orange', value: 'dark-orange', login:{background:"#FF8C00", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#FFD700", color: "#000", label: 'Gold', value: 'gold', login:{background:"#FFD700", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#0CFE09", color: "#313131", label: 'Radioactive Green', value: 'radioactive-green', login:{background:"#0CFE09", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#708090", color: "#000", label: 'Slategrey', value: 'slategrey', login:{background:"#708090", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#0D4F8B", color: "#FFF", label: 'Indigo Dye', value: 'indigo-dye', login:{background:"#0D4F8B", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#428139", color: "#FFF", label: 'Green', value: 'green', login:{background:"#428139", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#00A884", color: "#000", label: 'Persian Green', value: 'persian-green', login:{background:"#00A884", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#51e2f5", color: "#000", label: 'Electric Blue', value: 'electric-blue', login:{background:"#51e2f5", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#0047ab", color: "#FFF", label: 'Dark Royal Blue', value: 'dark-royal-blue', login:{background:"#0047ab", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#ff00a9", color: "#FFF", label: 'pinkish purple', value: 'pinkish-purple', login:{background:"#ff00a9", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
    { backgroundColor: "#099", color: "#FFF", label: 'Dark Cyan', value: 'Dark-Cyan', login:{background:"#099", color:"#00000099"}, headerBgFirst:"#080808bf", headerBgSecond:"#060606"},
]