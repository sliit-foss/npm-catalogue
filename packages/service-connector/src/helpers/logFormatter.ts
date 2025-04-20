/* eslint-disable camelcase */

import { AxiosRequestConfig, AxiosResponse } from "axios";
import { type ServiceConnectorOptions } from "../../types";

const formatLogs = (
  loggable: ServiceConnectorOptions["loggable"],
  config: AxiosRequestConfig,
  response?: AxiosResponse,
  isError = false
) => {
  let data: Record<string, any> = { params: config.params };
  if (isError) {
    data.status = response?.status;
    data.response_data = response?.data;
    data.request_headers = response?.headers;
  }
  if (loggable) data = { ...data, ...loggable(response) };
  return data;
};

export default formatLogs;
