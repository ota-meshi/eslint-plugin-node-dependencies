import { createRule } from "../utils"
import compatEngines from "./compat-engines"

export default createRule("valid-engines", {
    meta: {
        ...compatEngines.meta,
        docs: {
            ...compatEngines.meta.docs,
            replacedBy: ["compat-engines"],
        },
        deprecated: true,
    },
    create: compatEngines.create,
})
