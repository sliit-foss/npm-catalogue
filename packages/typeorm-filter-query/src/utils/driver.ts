/* eslint-disable turbo/no-undeclared-env-vars */

export enum SupportedDriver {
  mysql = "mysql",
  postgres = "postgres",
  postgresql = "postgresql"
}

export const getDriverFromConnectionStringOrDefault = (): SupportedDriver => {
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

  if (!connectionStr) return SupportedDriver.mysql;

  const url = new URL(connectionStr);
  const driver = url.protocol.replace(":", "");
  if (SupportedDriver[driver]) {
    return SupportedDriver[driver];
  }
  throw new Error(
    `Unsupported driver in connection string: ${driver}. Supported drivers are: ${Object.values(SupportedDriver).join(", ")}`
  );
};

export let driver = getDriverFromConnectionStringOrDefault();

export const configureDriver = (newDriver: SupportedDriver | keyof typeof SupportedDriver) => {
  driver = newDriver as SupportedDriver;
};
