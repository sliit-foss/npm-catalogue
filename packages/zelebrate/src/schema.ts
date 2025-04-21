import { z } from "zod";
import { Segments, Modes } from "./constants";

export const REQUESTSCHEMA = z
  .object({
    [Segments.HEADERS]: z.any().optional(),
    [Segments.PARAMS]: z.any().optional(),
    [Segments.QUERY]: z.any().optional(),
    [Segments.COOKIES]: z.any().optional(),
    [Segments.SIGNEDCOOKIES]: z.any().optional(),
    [Segments.BODY]: z.any().optional()
  })
  .required();

export type RequestRules = {
  [K in Segments]?: z.ZodObject<any>;
};

export interface ZelebrateOptions {
  mode?: Modes;
}

export interface ErrorOptions {
  statusCode?: number;
  message?: string;
}
