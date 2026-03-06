
import { COLOR_OPTION_INTERFACE } from "../pages/Setting/interface"
import { COLOR_OPTION } from "./common"
import { getImageUrl } from "./Funcation"

export const getTheme = (THEME: string) => {
    const theme = COLOR_OPTION.find((_: COLOR_OPTION_INTERFACE) => _.value === THEME)
    return theme
    // COLOR_OPTION
}

export const styleObjectGetBG = (theme: string, isBorder: boolean = false, Color: boolean = false) => {
    let obj: any = {
        background: getTheme(theme)?.backgroundColor,
    }
    if (isBorder) {
        obj.border = `1px solid ${getTheme(theme)?.backgroundColor}`
    }
    if (Color) {
        obj.color = getTheme(theme)?.color
    }
    return obj
}
export const styleObjectGetColor = (theme: string,) => {
    let obj: any = {
        color: getTheme(theme)?.color,
    }
    return obj
}

export const styleObjectBlackButton = (theme: string, Hover: boolean) => {
    let obj = {
        color: Hover ? getTheme(theme)?.color : getTheme(theme)?.backgroundColor,
        border: `1px solid ${getTheme(theme)?.backgroundColor}`,
        background: Hover ? getTheme(theme)?.backgroundColor : getTheme(theme)?.color
    }
    return obj
}

export const styleObjectWhiteButton = (theme: string, Hover: boolean) => {
    let obj = {
        color: Hover ? getTheme(theme)?.color : 'black',
        // border: `1px solid ${getTheme(theme)?.backgroundColor}`,
        background: Hover ? getTheme(theme)?.backgroundColor : 'white'
    }
    return obj
}

export const styleObjectGetBGIMageLoginImage = (path: string) => {
    let obj = {
        backgroundImage: `url(${getImageUrl(path)})`
    }
    return obj
}
export const styleObjectGetLoginImage = (path: string) => {
    let obj = {
        backgroundImage: `url(${getImageUrl(path)})`
    }
    return obj
}
export const styleObjectGetBGasColor = (theme: string, borderColor = false, headerTextColor=false) => {
    let obj: any = {
        color: getTheme(theme)?.backgroundColor,
    }
    if (borderColor) {
        obj.borderColor = getTheme(theme)?.backgroundColor;
    }
    if(headerTextColor){
        obj.color = getTheme(theme)?.headerTextColor;
    }

    return obj
}
export const styleObjectGetBorderColor = (theme: string, headerTextColor = false) => {
    let obj = {
        borderColor: getTheme(theme)?.backgroundColor,
    }
    if(headerTextColor){
        obj.borderColor = getTheme(theme)?.headerTextColor;
    }
    return obj
}

export const loginBackGroundColor = (theme: string, isButton=false)=>{
    let obj: any = {
        background: `${getTheme(theme)?.login.background}`,   
        // background: getTheme(theme)?.login.background,   
    }
    
    if(isButton){
        obj = {
            color: getTheme(theme)?.login.logginButtonColor,
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