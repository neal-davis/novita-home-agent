export function isValidDockerImageAddress(
  address: string | null | undefined,
): string {
  if (!address) {
    return "The container image is not valid";
  }
  const dockerImageRegex =
    /^((?:[a-z0-9.-]+(?::[0-9]+)?)\/)?([a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*)(:[a-zA-Z0-9._-]+)?(@[a-zA-Z0-9]+:[a-fA-F0-9]{64})?$/;
  if (dockerImageRegex.test(address)) {
    return "";
  } else {
    return "The container image is not valid";
  }
}
