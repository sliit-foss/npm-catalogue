export const mockLogger = {
  info: jest.fn().mockImplementation((msg) => console.info(msg)),
  error: jest.fn().mockImplementation((msg) => console.error(msg)),
  warn: jest.fn().mockImplementation((msg) => console.warn(msg)),
  debug: jest.fn().mockImplementation((msg) => console.debug(msg)),
  trace: jest.fn().mockImplementation((msg) => console.trace(msg)),
  log: jest.fn().mockImplementation((msg) => console.log(msg))
};

jest.mock("@sliit-foss/module-logger", () => ({
  moduleLogger: () => mockLogger
}));
