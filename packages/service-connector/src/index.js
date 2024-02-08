import axios from "axios";
import chalk from "chalk";
import context from "express-http-context";
import createError from "http-errors";
import { moduleLogger } from "@sliit-foss/module-logger";
import { formatLogs, coloredString } from "./helpers";

const serviceConnector = ({ service, headerIntercepts, loggable, logs = true, ...axiosOptions } = {}) => {
  const logger = moduleLogger(chalk.bold(service ?? "Service-Connector"));
  const instance = axios.create(axiosOptions);
  instance.interceptors.request.use(async (config) => {
    logs &&
      logger.info(
        `Request initiated - ${coloredString("method")}: ${coloredString(config.method)} - ${coloredString(
          "url"
        )}: ${coloredString(`${config.baseURL ?? ""}${config.url}`, "url-value")}`,
        formatLogs(loggable, config)
      );
    config.headers["x-correlation-id"] = context.get("correlationId");
    if (headerIntercepts) {
      let intercepts = headerIntercepts(config);
      if (intercepts instanceof Promise)
        intercepts = await intercepts.catch((e) => logger.error("Failed to intercept headers", e));
      config.headers = {
        ...config.headers,
        ...intercepts
      };
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => {
      logs &&
        logger.info(
          `Request completed - ${coloredString("method")}: ${coloredString(response.config.method)} - ${coloredString(
            "url"
          )}: ${coloredString(`${response.config.baseURL ?? ""}${response.config.url}`, "url-value")}`,
          formatLogs(loggable, response.config, response)
        );
      return response;
    },
    (error) => {
      const errorMessage = error.response?.data?.message ?? error.message;
      logs &&
        logger.error(
          `Request failed - ${coloredString("method")}: ${coloredString(error.config.method)} - ${coloredString(
            "url"
          )}: ${coloredString(`${error.config.baseURL ?? ""}${error.config.url}`, "url-value")} - ${coloredString(
            "message"
          )}: ${errorMessage}`,
          formatLogs(loggable, error.config, error.response, true)
        );
      const customError = createError(error.response?.status ?? 500, errorMessage, { response: error.response });
      customError.response = error.response;
      return Promise.reject(customError);
    }
  );
  instance.resolve = (response) => response?.data?.data ?? response?.data;
  instance.proxy = async (host, req, res) => {
    delete req.headers["content-length"];
    const response = await instance({
      baseURL: host,
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      params: req.params,
      data: req.body
    });
    if (!res) return response;
    return res.status(response.status).json(response.data);
  };
  return instance;
};

export default serviceConnector;
