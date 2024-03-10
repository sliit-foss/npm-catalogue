import { default as plugin } from "./plugin";
import { default as Audit } from "./model";
import { AuditType } from "./constants";

export { plugin, Audit, AuditType as auditType };

export default {
  plugin,
  Audit,
  auditType: AuditType
};
