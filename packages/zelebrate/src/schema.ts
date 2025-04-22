import { z } from "zod";
import { Segments, Modes } from "./constants";

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
