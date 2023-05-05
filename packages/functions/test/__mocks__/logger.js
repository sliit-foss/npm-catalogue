export const mockLogger = {
  info: jest.fn().mockImplementation((msg) => console.info(msg)),
  error: jest.fn().mockImplementation((msg) => console.error(msg))
};

jest.mock("@sliit-foss/module-logger", () => ({
  moduleLogger: () => mockLogger
}));
