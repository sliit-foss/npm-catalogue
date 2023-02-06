import axios from "axios";

export const instance = axios.create({
  baseURL: "https://api.github.com/graphql",
});

export const setHeaders = (headers) => {
  instance.defaults.headers = headers;
};