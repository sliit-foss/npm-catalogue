import { InternalAxiosRequestConfig, AxiosResponse, CreateAxiosDefaults, AxiosInstance } from "axios";
import { IAxiosRetryConfig } from "axios-retry";

declare module "axios" {
  interface AxiosInstance {
    /**
     * @description Proxies a request as a whole to another host
     * @param host The host to proxy the request to
     * @param req The express request object
     * @param res The express response object
     * @example
     * router.get('/users', async (req, res) => {
     *  await instance.proxy('https://example.com', req, res);
     * });
     */
    proxy: (host: string, req: any, res?: any) => any;
    /**
     * @description Extracts and returns the value at response.data.data or response.data if response.data.data is not present
     * @param response The axios response object
     * @example
     * const data = await instance.get('https://example.com/users').then(resolve);
     */
    resolve: (response: AxiosResponse) => any;
    /**
     * @description Enables request retrying. Uses `axios-retry` under the hood
     * @param config The axios retry config
     * @example
     * instance.enableRetry()
     */
    enableRetry: (config?: IAxiosRetryConfig) => AxiosInstance;
  }
}

export interface ServiceConnectorOptions extends CreateAxiosDefaults {
  /**
   * @description The name of the service. This is used to identify the service in logs
   */
  service?: string;
  headerIntercepts?: (config: InternalAxiosRequestConfig) => Record<string, string> | Promise<Record<string, string>>;
  /**
   * @description A function to decide what exactly you want logged from the axios response
   */
  loggable?: (response: AxiosResponse) => Record<string, string>;
  logs?: boolean;
  /**
   * @description The context key which contains a correlation ID for the request if present. This is used to track the request across multiple services
   * @defaultValue "correlationId"
   */
  traceKey?: string;
}
/**
 * @description Creates a wrapper around axios with extended support for logging and error handling
 * @param options The options to configure the service connector. This is an extension of the options provided by axios
 * @returns Returns an axios instance
 * @example
 * const instance = serviceConnector({
 *   baseURL: 'https://example.com',
 *   service: 'example-service',
 * });
 * instance.get('/users');
 */
export declare function serviceConnector(options: ServiceConnectorOptions): AxiosInstance;

export default serviceConnector;
