import packageJson from "package-json";
import { runAsWorker } from "synckit";
import { ProxyAgent, setGlobalDispatcher } from "undici";

let proxySet = false;

const PROXY_ENV = [
  "https_proxy",
  "HTTPS_PROXY",
  "http_proxy",
  "HTTP_PROXY",
  "npm_config_https_proxy",
  "npm_config_http_proxy",
] as const;

/**
 * If users are using a proxy for their npm preferences, set the option to use that proxy.
 */
export function setupProxy(): void {
  if (proxySet) {
    return;
  }
  proxySet = true;
  const proxy =
    // eslint-disable-next-line no-process-env -- ignore
    PROXY_ENV.map((k) => process.env[k]).find((v) => v);
  if (proxy) {
    setGlobalDispatcher(new ProxyAgent(proxy));
  }
}

runAsWorker((packageName: string) => {
  setupProxy();
  return packageJson(packageName, { allVersions: true });
});
