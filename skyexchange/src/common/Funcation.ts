import Cookies from 'universal-cookie';
// import { useQuery } from 'react-query';
const cookies = new Cookies()

export const Logout = (e: any = null) => {
    if (e) e.preventDefault()
    document.cookie = "skyTokenFront" + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    cookies.remove("skyTokenFront", { domain: process.env.REACT_APP_COOKIE_DOMAIN, path: "/", });
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload()
}

export const getImageUrl = (path: String) => {
    // Use the backend base URL from env — works for both localhost and production
    const baseUrl = process.env.REACT_APP_BASE_POINT
        ? process.env.REACT_APP_BASE_POINT.replace(/\/$/, '') // strip trailing slash
        : `${window.location.protocol}//${window.location.hostname}`;

    const link = `${baseUrl}/uploads/${path}`;
    return link;
}
export const getBetTable = (TABLE: string) => {
    switch (TABLE) {
        case 'odds':
            return 't1';
        case 'bookMark':
            return 't2';
        case 'session':
            return 't3';
        case 'premium':
            return 't4';
        default:
            break;
    }
}


export function descendingComparator(a: { [x: string]: number; }, b: { [x: string]: number; }, orderBy: string | number) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export function getComparator(order: string, orderBy: any) {
    return order === 'desc'
        ? (a: any, b: any) => descendingComparator(a, b, orderBy)
        : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array: any[], comparator: (arg0: any, arg1: any) => any) {
    const stabilizedThis = array.map((el: any, index: any) => [el, index]);
    stabilizedThis.sort((a: number[], b: number[]) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el: any[]) => el[0]);
}