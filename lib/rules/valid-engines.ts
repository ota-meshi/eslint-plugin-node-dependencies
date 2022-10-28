import { createRule } from "../utils";
import compatEngines from "./compat-engines";

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
