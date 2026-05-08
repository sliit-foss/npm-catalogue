import { EnvSchema } from "../validators/base-validator";

const stringify = (value: unknown): string => {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
};

export const generateEnvExample = (schema: EnvSchema): string => {
  return Object.entries(schema)
    .map(([key, validator]) => {
      const meta = validator.getMeta();
      const lines: string[] = [];

      if (meta.description) lines.push(`# ${meta.description}`);
      if (meta.hasDefault) lines.push(`# Default: ${stringify(meta.defaultValue)}`);
      if (meta.example !== undefined) lines.push(`# Example: ${stringify(meta.example)}`);
      if (meta.typeName === "secret") {
        lines.push(meta.typeDescription ? `# Secret value. ${meta.typeDescription}` : "# Secret value");
      }

      const value = meta.hasDefault ? stringify(meta.defaultValue) : "";
      lines.push(`${key}=${value}`);

      return lines.join("\n");
    })
    .join("\n\n");
};
