import type { JSONProperty } from "jsonc-eslint-parser/lib/parser/ast"
import { createRule, defineJsonVisitor } from "../utils"
import { getKeyFromJSONProperty } from "../utils/ast-utils"

type DepsName =
    | "dependencies"
    | "peerDependencies"
    | "optionalDependencies"
    | "devDependencies"

const DEPS = [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
    "devDependencies",
] as const
class AllowDuplicates {
    private readonly edges: [DepsName, DepsName][] = []

    public add(d1: DepsName, d2: DepsName) {
        this.edges.push([d1, d2])
    }

    public isAllowedDuplicate(dep1: string, dep2: string) {
        return this.edges.some(
            ([d1, d2]) =>
                (d1 === dep1 && d2 === dep2) || (d2 === dep1 && d1 === dep2),
        )
    }
}

export default createRule("no-dupe-deps", {
    meta: {
        docs: {
            description: "disallow duplicate dependencies.",
            category: "Possible Errors",
            // TODO Switch to recommended in the major version.
            // recommended: true,
            recommended: false,
        },
        schema: [],
        messages: {
            duplicated: "Duplicated dependency '{{name}}'.",
        },
        type: "problem",
    },
    create(context) {
        const allowDuplicates = new AllowDuplicates()
        allowDuplicates.add("devDependencies", "peerDependencies")
        allowDuplicates.add("devDependencies", "optionalDependencies")
        const maps = {
            dependencies: new Map<string, JSONProperty>(),
            peerDependencies: new Map<string, JSONProperty>(),
            optionalDependencies: new Map<string, JSONProperty>(),
            devDependencies: new Map<string, JSONProperty>(),
        }

        const reported = new Set<JSONProperty>()

        /** Report */
        function report(name: string, node: JSONProperty) {
            if (reported.has(node)) {
                return
            }
            reported.add(node)

            context.report({
                loc: node.key.loc,
                messageId: "duplicated",
                data: {
                    name,
                },
            })
        }

        /** Verify */
        function verify(depsName: DepsName, name: string, node: JSONProperty) {
            for (const dep of DEPS) {
                if (allowDuplicates.isAllowedDuplicate(dep, depsName)) {
                    continue
                }
                const dupeNode = maps[dep].get(name)
                if (dupeNode) {
                    report(name, dupeNode)
                    report(name, node)
                }
            }
        }

        /** Define dependency visitor */
        function defineVisitor(depsName: DepsName) {
            return (node: JSONProperty) => {
                const name = String(getKeyFromJSONProperty(node))
                verify(depsName, name, node)
                maps[depsName].set(name, node)
            }
        }

        return defineJsonVisitor({
            dependencies: defineVisitor("dependencies"),
            peerDependencies: defineVisitor("peerDependencies"),
            optionalDependencies: defineVisitor("optionalDependencies"),
            devDependencies: defineVisitor("devDependencies"),
        })
    },
})
