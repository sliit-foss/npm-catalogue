import axios from "axios";
import context from "express-http-context";
import createError from "http-errors";
import { moduleLogger } from "@sliit-foss/module-logger";
import { formatLogs } from "./helpers";

const serviceConnector = ({
  service,
  headerIntercepts,
  loggable,
  logs = true,
  ...axiosOptions
}) => {
  const logger = moduleLogger(service ?? "Service-Connector");
  const instance = axios.create(axiosOptions);
  instance.interceptors.request.use((config) => {
    logs &&
      logger.info(
        `Request initiated - method: ${config.method} - url: ${config.baseURL}${config.url}`,
        formatLogs(loggable, config)
      );
    config.headers["x-correlation-id"] = context.get("correlationId");
    if (headerIntercepts) {
      config.headers = {
        ...config.headers,
        ...headerIntercepts(config.headers),
      };
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => {
      logs &&
        logger.info(
          `Request completed - method: ${response.config.method} - url: ${response.config.baseURL}${response.config.url}`,
          formatLogs(loggable, response.config, response)
        );
      return response;
    },
    (error) => {
      const errorMessage = error.response?.data?.message ?? error.message;
      logs &&
        logger.error(
          `Request failed - method: ${error.config.method} - url: ${error.config.baseURL}${error.config.url} - message: ${errorMessage}`,
          formatLogs(loggable, error.config, error.response, true)
        );
      const customError = createError(
        error.response?.status ?? 500,
        errorMessage,
        { response: error.response }
      );
      customError.response = error.response;
      return Promise.reject(customError);
    }
  );
  instance.resolve = (response) => response?.data?.data ?? response?.data;
  return instance;
};

export default serviceConnector;
