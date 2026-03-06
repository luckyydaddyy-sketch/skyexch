import { COLOR_OPTION_INTERFACE } from "../pages/Setting/interface"
import { COLOR_OPTION } from "./common"
import { getImageUrl } from "./Funcation"

export const getTheme = (THEME: string) => {
    const theme = COLOR_OPTION.find((_: COLOR_OPTION_INTERFACE) => _.value === THEME)
    return theme
    // COLOR_OPTION
}

export const styleObjectGetBG = (theme: string, isBorder: boolean = false, Color:boolean = false) => {
    let obj: any = {
        background: getTheme(theme)?.backgroundColor,
    }
    if (isBorder) {
        // obj.border= `1px solid ${getTheme(theme)?.backgroundColor}`
        obj.border= `1px solid black`
    }
    if (Color) {
        obj.color = getTheme(theme)?.color
    }
    return obj
}
export const styleObjectGetColor = (theme: string,)=>{
    let obj: any = {
        color: getTheme(theme)?.color,
    }
    return obj
}

export const styleObjectBlackButton = (theme: string, Hover: boolean, isHide: boolean = false) => {
    let obj = {
        color: Hover ? getTheme(theme)?.color : getTheme(theme)?.backgroundColor,
        // border: `1px solid ${getTheme(theme)?.backgroundColor}`,
        border: isHide ? `1px solid ${getTheme(theme)?.backgroundColor}` : `1px solid black`,
        background: Hover ? getTheme(theme)?.backgroundColor : getTheme(theme)?.color
    }
    return obj
}

export const styleObjectGetLoginImage = (path: string) => {
    let obj = {
        backgroundImage: `url(${getImageUrl(path)})`
    }
    return obj
}

export const styleObjectGetBGasColor = (theme: string, borderColor = false) => {
    let obj: any = {
        color: getTheme(theme)?.backgroundColor,
    }
    if (borderColor) {
        obj.borderColor = getTheme(theme)?.backgroundColor;
    }
    return obj
}
// export const styleObjectGetBGIMageLoginImage = (path: string) => {
//     let obj = {
//         backgroundImage: `url(${getImageUrl(path)})`
//     }
//     return obj
// }

export const loginBackGroundColor = (theme: string, isButton=false)=>{
    let obj: any = {
        background: getTheme(theme)?.login.background,
    }
    if(isButton){
        obj = {
            color: getTheme(theme)?.login.background,
        }   
    }
    // if (isBorder) {
    //     obj.border = `1px solid ${getTheme(theme)?.backgroundColor}`
    // }
    // if (Color) {
    //     obj.color = getTheme(theme)?.color
    // }
    return obj
}

export const loginPolicyTextColor = (theme: string)=>{
    let obj: any = {
        color: getTheme(theme)?.login.color,
    }
   
    return obj
}