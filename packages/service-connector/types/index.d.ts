import { InternalAxiosRequestConfig, AxiosResponse, CreateAxiosDefaults, AxiosInstance } from "axios";

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
  }
}

interface ServiceConnectorOptions extends CreateAxiosDefaults {
  service?: string;
  headerIntercepts?: (config: InternalAxiosRequestConfig) => Record<string, string>;
  loggable?: (response: AxiosResponse) => Record<string, string>;
  logs?: boolean;
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
function serviceConnector(options: ServiceConnectorOptions): AxiosInstance;

export default serviceConnector;
