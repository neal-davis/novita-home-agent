export const TEST_PUBLIC_BASE_URL = "https://dev-api-server.novita.ai";
export const TEST_PUBLIC_API_URL = "https://dev-api.novita.ai";
export const TEST_SERVICE_BASE_URL = "https://service.example.test";
export const TEST_API_BASE_URL = "https://api.example.test";
export const TEST_SANDBOX_DEV_BASE_URL = "https://api.sandbox-dev.novita.ai";
export const TEST_SANDBOX_PROD_BASE_URL = "https://api.sandbox.novita.ai";

type EnvOverrides = Record<string, string | undefined>;

export async function withEnv<T>(
  overrides: EnvOverrides,
  callback: () => T | Promise<T>,
): Promise<T> {
  const previousValues = new Map<string, string | undefined>();

  for (const key of Object.keys(overrides)) {
    previousValues.set(key, process.env[key]);
    const value = overrides[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await callback();
  } finally {
    for (const [key, value] of previousValues) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

export async function loadWithEnv<T>(
  overrides: EnvOverrides,
  importFn: () => T | Promise<T>,
): Promise<T> {
  let result: T | undefined;

  await withEnv(overrides, async () => {
    jest.resetModules();
    await jest.isolateModulesAsync(async () => {
      result = await importFn();
    });
  });

  return result as T;
}
