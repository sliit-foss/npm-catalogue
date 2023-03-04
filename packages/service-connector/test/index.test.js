const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock("@sliit-foss/module-logger", () => ({
  moduleLogger: () => mockLogger,
}));

const serviceConnector = require("../src").default;

const connector = serviceConnector({
  baseURL: "https://google.com",
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("service-connector", () => {
  test("successful request", async () => {
    const response = await connector.get("/");
    expect(response.status).toEqual(200);
    expect(mockLogger.info).toBeCalledWith(
      "Request initiated - method: get - url: https://google.com/",
      { params: undefined }
    );
    expect(mockLogger.info).toBeCalledWith(
      "Request completed - method: get - url: https://google.com/",
      { params: undefined }
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
      request_headers: error.response?.headers,
    };
    expect(mockLogger.info).toBeCalledWith(
      "Request initiated - method: get - url: https://google.com/non-existant-route/1/2/3",
      { params: undefined }
    );
    expect(mockLogger.error).toBeCalledWith(
      "Request failed - method: get - url: https://google.com/non-existant-route/1/2/3 - message: Request failed with status code 404",
      loggable
    );
  });
});
