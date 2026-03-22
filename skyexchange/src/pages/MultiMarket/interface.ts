export interface PinInterface {
    _id: string;
    name: string;
    openDate: string;
    startDate: Date;
    type: string;
    gameId: number;
    marketId: string;
}

export interface ListInterface {
    _id: string;
    type: string;
    userId: string;
    __v: number;
    createdAt: Date;
    pin: PinInterface[];
    updatedAt: Date;
}

export interface SportDetailsInterface {
    back1: number;
    back2: number;
    back3: number;
    eid: number;
    eventName: string;
    f: boolean;
    gameId: number;
    ifb: boolean;
    inPlay: boolean;
    lay1: number;
    lay2: number;
    lay3: number;
    m1: boolean;
    marketId: string;
    openDate: string;
    p: boolean;
    pf: boolean;
    pin: boolean;
    _id: string;
    ematch: number;
    tv: boolean;
    Turnament: string;
    scores?: string;
}

export interface DetailsTableInterface {
    b1: number;
    b2: number;
    b3: number;
    bs1: number;
    bs2: number;
    bs3: number;
    gType: string;
    inPlay: boolean;
    l1: number;
    l2: number;
    l3: number;
    ls1: number;
    ls2: number;
    betProfit?: number | any
    ls3: number;
    marketId: string;
    nat: string;
    openDate: string;
    sId: number;
    sortPriority: number;
    status: string;
}

export interface MultiMarketListInterface {
    name:string;
    b1: number;
    b2: number;
    b3: number;
    bs1: number;
    bs2: number;
    bs3: number;
    gType: string;
    inPlay: boolean;
    l1: number;
    l2: number;
    l3: number;
    ls1: number;
    ls2: number;
    betProfit?: number | any
    ls3: number;
    marketId: string;
    nat: string;
    openDate: string;
    sId: number;
    sortPriority: number;
    status: string;
}


export interface PreSubInterface {
    nat: string;
    odds: number;
    sId: number;
    sortPriority: number;
    betProfit:any
}

export interface PreMainInterface {
    gType: string;
    id: string;
    marketId: string;
    marketName: string;
    sortPriority: number;
    status: string;
    sub_sb: PreSubInterface[];
}

export interface FancyInterface {
    b1: number;
    bs1: number;
    gType: string;
    l1: number;
    ls1: number;
    marketId: string;
    nat: string;
    sId: number;
    sortPriority: number;
    betProfit:any
    status: string;
    status1: number;
}

export interface betHistoryInterface {
    _id: string;
    userId: string;
    matchId: string;
    type: string;
    betType: string;
    betSide: string;
    selection: string;
    subSelection?: string;
    betId: number;
    stake: number;
    oddsUp: number;
    oddsDown: number;
    exposure: number;
    profit:number;
    deleted: boolean;
    createdAt: Date;
}