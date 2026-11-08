import os from "node:os";

export function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flatMap((interfaces) => interfaces ?? [])
    .filter(
      (networkInterface) =>
        networkInterface.family === "IPv4" &&
        !networkInterface.internal &&
        !networkInterface.address.startsWith("169.254."),
    )
    .map((networkInterface) => networkInterface.address);
}
