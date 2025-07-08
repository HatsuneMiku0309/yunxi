import axios, { type AxiosRequestConfig } from 'axios';
import { errorMsgParse } from './utils';

interface IAnyObject {
    [key: string]: any
}

const instance = axios.create({
  baseURL: `http://${window.location.hostname}:3000/api`,
  // baseURL: `http://192.168.1.216:5173/api`,
  withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/json'
  // }
});

async function get (url: string, config: AxiosRequestConfig = {}) {
  try {
    let res = await instance.get(url, config);
    return res;
  } catch (err: any) {
    err.c_message = errorMsgParse(err);
    throw err;
  }
}

async function post (url: string, data: IAnyObject, config: AxiosRequestConfig = {}) {
  try {
    let res = await instance.post(url, data, config);
    return res;
  } catch (err: any) {
    err.c_message = errorMsgParse(err);
    throw err;
  }
}

async function put (url: string, data: IAnyObject, config: AxiosRequestConfig = {}) {
  try {
    let res = await instance.put(url, data, config);
    return res;
  } catch (err: any) {
    err.c_message = errorMsgParse(err);
    throw err;
  }
}

async function del (url: string, data: IAnyObject, config: AxiosRequestConfig = {}) {
  try {
    let res = await instance.delete(url, {
      data: data,
      ...config
    });
    return res;
  } catch (err: any) {
    err.c_message = errorMsgParse(err);
    throw err;
  }
}

export {
  get,
  post,
  put,
  del
}