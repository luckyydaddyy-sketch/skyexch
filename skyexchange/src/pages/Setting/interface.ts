export interface Result {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  betCount: number;
}

export interface Data {
  results?: Result[];
  page?: string;
  limit?: string;
  totalPages?: number;
  totalResults?: number;
  userList?:any
}

export interface COLOR_OPTION_INTERFACE {
  headerTextColor: string;
  backgroundColor: string;
  color: string;
  label: string;
  value: string;
}
export interface WebSiteList {
  _id?: string;
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
  change_password_on_first_login: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface historyInterface {
  _id: string;
  name: string;
  openDate: string;
  startDate: Date;
  betCount: number;
}

export interface dataInterface {
  api: string,
  value: {
    type?: string,
    page: string,
    limit: string,
    search?: string
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
  id?:string
}
