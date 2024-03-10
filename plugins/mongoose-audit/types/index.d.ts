import mongoose from "mongoose";

type auditType = "add" | "edit" | "delete";

interface Audit {
  entity_id: any;
  entity: string;
  changes: { [key: string]: any };
  user: any;
  created_at: string;
}

export interface Options {
  /**  The user extractor function to use. This probably will be fetching the current user from a context or something similar. */
  getUser?: () => any;
  /**  The types of audit to record. */
  types?: auditType[];
  /**  The fields to exclude from the audit. Cannot be used along with include. */
  exclude?: string[];
  /**  The fields to consider for the audit. Cannot be used along with exclude. */
  include?: string[];
  /**  Called before persisting the audit is saved. Use this to use your own audit model instead of the default one. */
  onAudit?: (audit: Audit) => Promise<any>;
  /**  By default audit logs are persisted asynchronously in the background. Change this to false if you want it to be synchronous" */
  background?: boolean;
}

/** Registers the plugin with the provided options. */
export declare function plugin(schema: mongoose.Schema, options: Options): void;

/**
 * The Audit model.
 */
export const Audit: mongoose.Model<Audit>;

/**
 * The audit type enum.
 */
export const AuditType: Record<auditType, auditType>;
