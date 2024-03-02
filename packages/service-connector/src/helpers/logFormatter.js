/* eslint-disable camelcase */

const formatLogs = (loggable, config, response, isError = false) => {
  let data = { params: config.params };
  if (isError) {
    data.status = response?.status;
    data.response_data = response?.data;
    data.request_headers = response?.headers;
  }
  if (loggable) data = { ...data, ...loggable(response) };
  return data;
};

export default formatLogs;
