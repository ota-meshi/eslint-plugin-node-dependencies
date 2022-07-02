import type packageJson from "package-json"
import type { Options } from "package-json"
import { runAsWorker } from "synckit"
type PackageJson = typeof packageJson

const dynamicImport = new Function("m", "return import(m)")
runAsWorker(async (packageName: string, options: Options) => {
    const m = await dynamicImport("package-json")
    const packageJson: PackageJson = m?.default || m
    return packageJson(packageName, options)
})
