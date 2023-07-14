import type packageJson from "package-json";
import type { Options } from "package-json";
import { runAsWorker } from "synckit";
// @ts-expect-error -- no types
import tunnel from "tunnel-agent";
type PackageJson = typeof packageJson;

const dynamicImport = new Function("m", "return import(m)");
runAsWorker(async (packageName: string, options: Options) => {
  const m = await dynamicImport("package-json");
  const packageJson: PackageJson = m?.default || m;
  return packageJson(packageName, withAutoProxy(options));
});

/**
 * If users are using a proxy for their npm preferences, set the option to use that proxy.
 */
function withAutoProxy(options: Options): Options {
  const PROXY_ENV = [
    "https_proxy",
    "HTTPS_PROXY",
    "http_proxy",
    "HTTP_PROXY",
    "npm_config_https_proxy",
    "npm_config_http_proxy",
  ];

  const proxyStr: string | undefined =
    // eslint-disable-next-line no-process-env -- ignore
    PROXY_ENV.map((k) => process.env[k]).find((v) => v);
  if (proxyStr) {
    const proxyUrl = new URL(proxyStr);
    const tunnelOption = {
      proxy: {
        host: proxyUrl.hostname,
        port: Number(proxyUrl.port),
        proxyAuth:
          proxyUrl.username || proxyUrl.password
            ? `${proxyUrl.username}:${proxyUrl.password}`
            : undefined,
      },
    };
    const httpAgent =
      tunnel[`httpOverHttp${proxyUrl.protocol === "https:" ? "s" : ""}`](
        tunnelOption,
      );
    const httpsAgent =
      tunnel[`httpsOverHttp${proxyUrl.protocol === "https:" ? "s" : ""}`](
        tunnelOption,
      );
    return {
      agent: { http: httpAgent, https: httpsAgent },
      ...options,
    };
  }
  return options;
}
