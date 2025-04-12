/* eslint-disable turbo/no-undeclared-env-vars */

const supportedDrivers = ["mysql", "postgres", "postgresql"];

export const getDriverFromConnectionStringOrDefault = () => {
  const connectionStr =
    process.env.DB_CONNECTION_STRING ||
    process.env.DATABASE_URL ||
    process.env.MYSQL_CONNECTION_STRING ||
    process.env.POSTGRES_CONNECTION_STRING ||
    process.env.DB_URL ||
    process.env.MYSQL_URL ||
    process.env.POSTGRES_URL ||
    process.env.DB_CONNECTION ||
    process.env.MYSQL_CONNECTION ||
    process.env.POSTGRES_CONNECTION;

  if (!connectionStr) return "mysql";

  const url = new URL(connectionStr);
  const driver = url.protocol.replace(":", "");
  if (supportedDrivers.includes(driver)) {
    return driver;
  }
  throw new Error(
    `Unsupported driver in connection string: ${driver}. Supported drivers are: ${supportedDrivers.join(", ")}`
  );
};

export let driver = getDriverFromConnectionStringOrDefault();

export const configureDriver = (newDriver) => {
  if (supportedDrivers.includes(newDriver)) {
    driver = newDriver;
  } else {
    throw new Error(`Unsupported driver: ${newDriver}. Supported drivers are: ${supportedDrivers.join(", ")}`);
  }
};
