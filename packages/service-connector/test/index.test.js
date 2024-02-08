import { coloredString } from "../src/helpers";

jest.setTimeout(30000);

const mockLogger = {
  info: jest.fn(),
  error: jest.fn()
};

jest.mock("@sliit-foss/module-logger", () => ({
  moduleLogger: () => mockLogger
}));

const serviceConnector = require("../src").default;

const connector = serviceConnector({
  baseURL: "https://google.com"
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("service-connector", () => {
  test("successful request", async () => {
    const response = await connector.get("/");
    expect(response.status).toEqual(200);
    expect(mockLogger.info).toBeCalledWith(
      `Request initiated - ${coloredString("method")}: ${coloredString("get")} - ${coloredString(
        "url"
      )}: ${coloredString("https://google.com/", "url-value")}`,
      {
        params: undefined
      }
    );
    expect(mockLogger.info).toBeCalledWith(
      `Request completed - ${coloredString("method")}: ${coloredString("get")} - ${coloredString(
        "url"
      )}: ${coloredString("https://google.com/", "url-value")}`,
      {
        params: undefined
      }
    );
  });
  test("failed request", async () => {
    let error;
    await connector.get("/non-existant-route/1/2/3").catch((e) => (error = e));
    expect(error?.message).toEqual("Request failed with status code 404");
    const loggable = {
      params: undefined,
      status: error.response?.status,
      response_data: error.response?.data,
      request_headers: error.response?.headers
    };
    expect(mockLogger.info).toBeCalledWith(
      `Request initiated - ${coloredString("method")}: ${coloredString("get")} - ${coloredString(
        "url"
      )}: ${coloredString("https://google.com/non-existant-route/1/2/3", "url-value")}`,
      { params: undefined }
    );
    expect(mockLogger.error).toBeCalledWith(
      `Request failed - ${coloredString("method")}: ${coloredString("get")} - ${coloredString("url")}: ${coloredString(
        "https://google.com/non-existant-route/1/2/3",
        "url-value"
      )} - ${coloredString("message")}: Request failed with status code 404`,
      loggable
    );
  });
  test("successful request with header interceptor", async () => {
    const interceptedConnector = serviceConnector({
      baseURL: "https://google.com",
      headerIntercepts: () => ({
        "x-api-key": "123456"
      })
    });
    const response = await interceptedConnector.get("/");
    expect(response.status).toEqual(200);
  });
  test("successful request with async header interceptor", async () => {
    const asyncInterceptedConnector = serviceConnector({
      baseURL: "https://google.com",
      headerIntercepts: async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return;
      }
    });
    const response = await asyncInterceptedConnector.get("/");
    expect(response.status).toEqual(200);
  });
  test("successful request ignoring error in async header interceptor", async () => {
    const asyncInterceptedConnector = serviceConnector({
      baseURL: "https://google.com",
      headerIntercepts: async () => {
        await new Promise((_, reject) => setTimeout(reject, 50));
        return;
      }
    });
    const response = await asyncInterceptedConnector.get("/");
    expect(response.status).toEqual(200);
    expect(mockLogger.error).toBeCalledWith(
      `Failed to intercept headers - ${coloredString("method")}: ${coloredString("get")} - ${coloredString(
        "url"
      )}: ${coloredString("https://google.com/", "url-value")}`,
      undefined
    );
  });
});

describe("service-connector resolver", () => {
  test("successful request", async () => {
    const mockData = {
      data: {
        name: "John Doe"
      },
      message: "Successfully fetched data from the server"
    };
    connector.get = jest.fn().mockResolvedValue({
      status: 200,
      data: mockData
    });
    const response = await connector.get("/").then(connector.resolve);
    expect(response).toStrictEqual(mockData.data);
  });
});
