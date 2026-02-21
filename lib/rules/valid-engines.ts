import { createRule } from "../utils/index.ts";
import compatEngines from "./compat-engines.ts";

export default createRule("valid-engines", {
  meta: {
    ...compatEngines.meta,
    docs: {
      ...compatEngines.meta.docs,
    },
    deprecated: true,
    replacedBy: ["compat-engines"],
  },
  create: compatEngines.create,
});
