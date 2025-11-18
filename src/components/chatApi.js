import axios from "axios";
import { BASE_URL } from "../constant/base";

export const openChat = (userId) =>
  axios.post(`${BASE_URL}/chat/open`, { userId }, { withCredentials: true });

export const getChats = () =>
  axios.get(`${BASE_URL}/chat`, { withCredentials: true });

export const getMessages = (chatId) =>
  axios.get(`${BASE_URL}/chat/message/${chatId}`, { withCredentials: true });

export const sendMessageApi = (data) =>
  axios.post(`${BASE_URL}/chat/message`, data, { withCredentials: true });
