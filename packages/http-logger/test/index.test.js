import { req, res } from "./__mocks";

const mockLogger = {
  info: jest.fn(),
  error: jest.fn()
};

jest.mock("@sliit-foss/module-logger", () => ({
  moduleLogger: () => mockLogger
}));

const httpLogger = require("../src").default;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("test http-logger", () => {
  beforeAll(() => {
    process.env.HTTP_LOGGER_IS_TEST = "true";
  });
  test("test-successfull request", async () => {
    httpLogger()(req, res, () => {});
    expect(mockLogger.info).toBeCalledTimes(2);
    expect(mockLogger.error).toBeCalledTimes(0);
  });
  test("test-failed request", async () => {
    httpLogger()(req, { ...res, statusCode: 500 }, () => {});
    expect(mockLogger.info).toBeCalledTimes(1);
    expect(mockLogger.error).toBeCalledTimes(1);
  });
  test("test-whitelist", async () => {
    httpLogger({ whitelists: ["/users/*"] })(req, res, () => {});
    expect(mockLogger.info).toBeCalledTimes(0);
    expect(mockLogger.error).toBeCalledTimes(0);
  });
  test("test-loggable-function", async () => {
    const loggable = jest.fn().mockImplementation(({ headers }) => ({ "x-user-email": headers["x-user-email"] }));
    httpLogger({ loggable })(req, res, () => {});
    expect(loggable).toBeCalledTimes(1);
    expect(mockLogger.info).toBeCalledTimes(2);
    expect(mockLogger.error).toBeCalledTimes(0);
  });
});
