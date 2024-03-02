export const generateSecrets = (content, service) => {
  const services = content
    .split("---")
    ?.filter((service) => !service.split("\n")?.every((svc) => ["\r", "", " "].includes(svc)))
    .map((service) => {
      const lines = service.split("\n");
      const keyStartIndex = lines.indexOf(lines.find((l) => l.includes("stringData:")));
      const keys = lines.reduce((acc, line, index) => {
        if (index > keyStartIndex && !line.trim()?.startsWith("#") && line.includes(":") && line.split(":")?.[1]) {
          let key = line.split(":").splice(1).join(":").trim();
          if (key.startsWith('"') && key.endsWith('"')) {
            key = key.substring(1, key.length - 1);
          }
          acc[line.split(":")[0]?.trim()] = key;
        }
        return acc;
      }, {});
      return {
        name: lines
          .find((l) => l.includes("name:"))
          ?.split(":")[1]
          .trim(),
        keys
      };
    });
  const serviceKeys = services.find((s) => s.name === `${service}-secret`)?.keys;
  return Object.keys(serviceKeys)
    .map((key) => `${key}=${serviceKeys[key]}`)
    ?.join("\n");
};
