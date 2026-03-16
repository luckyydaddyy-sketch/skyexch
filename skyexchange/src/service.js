import axios from "axios";
import { toast } from "react-toastify";
import Cookies from 'universal-cookie'
import { io } from "socket.io-client";
import { Logout } from "./common/Funcation";

const cookies = new Cookies()



let socket;

export const getToken = async () => {
  try {
    const auth_token = await cookies.get('skyTokenFront');
    if (auth_token !== null) {
      return auth_token;
    }
  } catch (e) {
    return e;
  }
};

const apiURL = process.env.REACT_APP_API_USER_ENDPOINT;
export const postApi = async (data) => {
  const auth_token = await getToken()
  return axios.post(`${apiURL + data.api}`, data.value, {
    headers: data.api === 'admin/login' ? {} : {
      Authorization: data.token || auth_token,
    },
  });
};
export const postApiLink = async (data) => {
  const auth_token = await getToken()

  return axios.post(`${data.api}`, data.value, {
    headers: data.api === 'admin/login' ? {} : {
      Authorization: data.token || auth_token,
    },
  });
};

const apiURL_ADMIN = process.env.REACT_APP_API_ENDPOINT;
export const postApiAdmin = async (data) => {
  const auth_token = await getToken()

  return axios.post(`${apiURL_ADMIN + data.api}`, data.value, {
    headers: data.api === 'admin/login' ? {} : {
      Authorization: data.token || auth_token,
    },
  });
};

export const getApi = async (data) => {
  const auth_token = await getToken()
  return axios.get(`${apiURL + data.api}`, {
    headers: data.api === 'home' ? {} : {
      Authorization: data.token || auth_token,
    },
  });
};

export const getApiLink = async (data) => {
  const auth_token = await getToken()

  return axios.get(`${data.api}`, {
    maxBodyLength: "Infinity"
    // headers: data.api === 'admin/login' ? {} : {
    //   Authorization: data.token || auth_token,
    //   "Access-Control-Allow-Origin":"*"
    // },
  });
};
export const notifyMessage = (text) => toast.success(text, {
  className: 'toast-success-container toast-success-container-after',
});
export const notifyError = (text) => toast.error(text, {
  className: 'toast-error-container toast-error-container-after',
});



export const socketConnect = async (dispatch, next) => {
  const socketApi = process.env.REACT_APP_BASE_POINT;
  // const socketApi = '172.20.11.108:3002';
  socket = io(socketApi, { transports: ['websocket'] });
  socket.on("connect", (res) => {
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
        case 'GET_LIVE_MATCH_COUNT': {
          dispatch({ type: 'GET_LIVE_MATCH_COUNT', payload: response.data.data })
          break;
        }
        case 'GET_SPORTS_DETAILS': {
          dispatch({ type: 'GET_SPORTS_DETAILS', payload: response.data.data })
          break;
        }
        case 'UPDATE_USER_BALANCE': {
          dispatch({ type: 'UPDATE_USER_BALANCE', payload: response.data.data })
          break;
        }
        case 'GET_SPORTS': {
          dispatch({ type: 'GET_SPORTS', payload: response.data.data })
          break;
        }
        case 'GET_SCORE_ID': {
          dispatch({ type: 'GET_SCORE_ID', payload: response.data.data.result })
          break;
        }
        case 'VERIFY_TOKEN': {
          if (response.data?.data?.status === 401) {
            dispatch({ type: 'LOGOUT', payload: {} })
            Logout()
          }
          break;
        }
      }
    }
  });
};

export const getResponse = (data) => {
  return data
}

const requestHandler = (event, data) => {
  return { en: event, data }
}

export const sendEvent = (event, data) => {
  socket.emit("req", requestHandler(event, data))
}