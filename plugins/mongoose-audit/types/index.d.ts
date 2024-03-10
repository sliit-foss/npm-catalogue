import mongoose from "mongoose";

type auditType = "add" | "edit" | "delete";

interface Audit {
  entity_id: any;
  entity: string;
  collection: string;
  changes: any;
  user: any;
  created_at: string;
}

interface PluginOptions {
  /**  The user extractor function to use. This probably will be fetching the current user from a context or something similar. */
  getUser?: () => any;
  /**  The types of audit to record. */
  types?: auditType[];
  /**  The fields to exclude from the audit. */
  exclude?: string[];
  /**  Called before persisting the audit is saved. Use this to use your own audit model instead of the default one. */
  onAudit?: (audit: Audit) => Promise<any>;
}

/** Registers the plugin with the provided options. */
export declare function plugin(schema: mongoose.Schema, options: PluginOptions): void;

/**
 * The Audit model.
 */
export const Audit: mongoose.Model<Audit>;

/**
 * The audit type enum.
 */
export const AuditType: Record<auditType, auditType>;
