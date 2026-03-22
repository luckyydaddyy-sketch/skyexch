export interface Result {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  betCount: number;
  settlementType?: string;
  settledBy?: any;
}

export interface Data {
  results?: Result[];
  page?: string;
  limit?: string;
  totalPages?: number;
  totalResults?: number;
  userList?: any
}

export interface COLOR_OPTION_INTERFACE {
  backgroundColor: string;
  color: string;
  label: string;
  value: string;
}
export interface WebSiteList {
  _id: string;
  title: string;
  domain: string;
  favicon: string;
  logo: string;
  loginImage: string;
  mobileLoginImage: string;
  agentListUrl: string;
  email: string[];
  whatsapp: string[];
  telegram: string[];
  instagram: string[];
  skype: string[];
  maintenanceMessage?: string;
  agentMessage?: string;
  userMessage?: string;
  adminStatus: boolean;
  currency: string;
  theme: string;
  colorSchema: string;
  status: boolean;
  isMaintenance: boolean;
  change_password_on_first_login: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  cricket: Cricket;
  soccer: Soccer;
  tennis: Tennis;
}
export interface LimitInterface {
  min: number;
  max: number;
}

export interface Cricket {
  oddsLimit: LimitInterface;
  bet_odds_limit: LimitInterface;
  bet_bookmaker_limit: LimitInterface;
  bet_fancy_limit: LimitInterface;
  bet_premium_limit: LimitInterface;
}


export interface Soccer {
  oddsLimit: LimitInterface;
  bet_odds_limit: LimitInterface;
  bet_bookmaker_limit: LimitInterface;
  bet_fancy_limit: LimitInterface;
}


export interface Tennis {
  oddsLimit: LimitInterface;
  bet_odds_limit: LimitInterface;
  bet_bookmaker_limit: LimitInterface;
  bet_fancy_limit: LimitInterface;
}

export interface historyInterface {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  betCount: number;
  settlementType?: string;
  settledBy?: any;
}

export interface dataInterface {
  api: string,
  value: {
    type?: string,
    page: string,
    limit: string,
    search?: string,
    domain?: string
  }
}

export interface addBanner {
  name: string
  image: string
  active?: boolean
}

export interface AddDashBoardImage {
  title: string
  image: string
  link: string
  Width: string
  gameCode: string
  gameName: string
  gameType: string
  platform: string
  gameLimit: string
  id?: string,
  catalog?: string,
    isLatest?: boolean,
}



export interface manageBetList {
  name: string;
  winnerSelection: string[];
}
export interface managehistoryPre {
  selection: string
  winner: string
  _id: string
  settlementType?: string;
  settledBy?: any;
}

export interface SportInfoDetails {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  type: string;
}

export interface managePremiumInterface {
  betList?: manageBetList[];
  history?: managehistoryPre[];
  sportInfo: SportInfoDetails;
}