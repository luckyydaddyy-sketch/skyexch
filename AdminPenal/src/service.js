import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Cookies from 'universal-cookie'
import { Logout } from "./common/Funcation";
const cookies = new Cookies()


export const getToken = async () => {
  try {
    const auth_token = await cookies.get('skyToken');
    if (auth_token !== null) {
      return auth_token;
    }
  } catch (e) {
    return e;
  }
};

let socket;
const apiURL = process.env.REACT_APP_API_ENDPOINT;
export const postApi = async (data) => {
  const auth_token = await getToken()
  return axios.post(`${apiURL + data.api}`, data.value, {
    headers: data.api === 'admin/login' ? {} : {
      Authorization: data.token || auth_token,
    },
  });
};

export const getApi = async (data) => {
  const auth_token = await getToken()
  return axios.get(`${apiURL + data.api}`, {
    headers: data.api === 'admin/login' ? {} : {
      Authorization: data.token || auth_token,
    },
  });
};

export const getApiLink = async (data) => {
  return axios.get(`${data.api}`, {maxBodyLength:"Infinity"});
};

export const notifyMessage = (text) => toast(text);
export const notifyError = (text) => toast.error(text);


export const socketConnect = async (dispatch, next) => {
  const socketApi = process.env.REACT_APP_BASE_POINT;
  // const socketApi =`${process.env.REACT_APP_BASE_POINT}socketServer`;
  // const socketApi = '172.20.11.108:3002';
  socket = io(socketApi, { transports: ['websocket'] });
  socket.on("connect", (res) => {
    console.log(':::::::::::<<<<<', socket);
    next(socket.connected);
  });
  socket.on("res", (data) => {
    const response = getResponse(data)
    if (response) {
      switch (response.data.en) {
        case 'GET_USER_COUNT': {
          dispatch({ type: 'GET_USER_COUNT', payload: response.data.data })
          break;
        }
        case 'GET_SPORTS_DETAILS': {
          dispatch({ type: 'GET_SPORTS_DETAILS', payload: response.data.data })
          break;
        }
        case 'VERIFY_TOKEN_ADMIN': {
          if (response.data?.data?.status === 401) {
            dispatch({ type: 'LOGOUT', payload: {} })
            Logout()
          }
          break;
        }
        case 'UPDATE_USER_BALANCE':{
          dispatch({ type: 'UPDATE_BALANCE', payload: response.data.data.remaining_balance })
          break;
        }
        case 'GET_DP_WL_COUNT':{
          dispatch({ type: 'PAYMENT_COUNT', payload: response.data.data })
          break;
        }
        default:{

        }
      }
    }
  });
};

export const getResponse = (data) => {
  console.log("<<<<====", data.data.en, data.data)
  return data
}

const requestHandler = (event, data) => {
  console.log("====>>>>", event, data)
  return { en: event, data }
}

export const sendEvent = (event, data) => {
  socket.emit("req", requestHandler(event, data))
}