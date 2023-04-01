// eslint-disable-next-line eslint-comments/disable-enable-pair -- DEMO
/* eslint-disable node/no-unsupported-features/es-syntax -- DEMO */
import * as all from "../../../../node_modules/eslint-visitor-keys/lib/index";

const evk = all.default || all;
export const { KEYS, getKeys, unionWith } = evk;
export default evk;
