import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  async response => {
    const { success, msg } = response.data;
    if (!success) {
      return Promise.reject(new Error(msg));
    }
    return response.data;
  },
  error => {
    if (!error.response) {
      return Promise.reject(new Error("network error"));
    }
    return Promise.reject(new Error(error.response.data.error));
  },
);

export default request;