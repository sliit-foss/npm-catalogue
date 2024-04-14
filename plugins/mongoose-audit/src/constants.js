export const AuditType = {
  Add: "Add",
  Edit: "Edit",
  Delete: "Delete"
};

export const ChangeAuditType = {
  N: AuditType.Add,
  D: AuditType.Delete,
  E: AuditType.Edit,
  A: AuditType.Edit
};
