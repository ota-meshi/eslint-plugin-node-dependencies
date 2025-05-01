import packageJson from "package-json";
import { runAsWorker } from "synckit";

import { bootstrap } from "global-agent";
import { ProxyAgent, setGlobalDispatcher } from "undici";

let proxySet = false;

// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/53669#issuecomment-875285179
declare global {
  const GLOBAL_AGENT: {
    HTTP_PROXY: string | null;
    HTTPS_PROXY: string | null;
    NO_PROXY: string | null;
  };
}

const PROXY_ENV = [
  "https_proxy",
  "HTTPS_PROXY",
  "http_proxy",
  "HTTP_PROXY",
  "npm_config_https_proxy",
  "npm_config_http_proxy",
] as const;

const PROXY_PROPS = ["http_proxy", "https_proxy", "no_proxy"] as const;

/**
 * If users are using a proxy for their npm preferences, set the option to use that proxy.
 */
export function setupProxy(): void {
  if (proxySet) {
    return;
  }
  proxySet = true;
  const proxyStr: string | undefined =
    // eslint-disable-next-line no-process-env -- ignore
    PROXY_ENV.map((k) => process.env[k]).find((v) => v);
  if (proxyStr) {
    setGlobalDispatcher(new ProxyAgent(proxyStr));
  }
  bootstrap();
  for (const prop of PROXY_PROPS) {
    const upperProp = prop.toUpperCase() as keyof typeof GLOBAL_AGENT;
    // eslint-disable-next-line no-process-env -- ignore
    const value = process.env[prop] || process.env[upperProp];
    if (value) {
      GLOBAL_AGENT[upperProp] = value;
    }
  }
}

runAsWorker((packageName: string) => {
  setupProxy();
  return packageJson(packageName, { allVersions: true });
});
