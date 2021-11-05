import type { AST } from "jsonc-eslint-parser"

/**
 * Get the key from given object property node
 */
export function getKeyFromJSONProperty(
    node: AST.JSONProperty,
): string | number {
    if (node.key.type === "JSONIdentifier") {
        return node.key.name
    }
    return node.key.value
}

/**
 * Get the key from given object node
 */
export function getKey(node: AST.JSONExpression): string | number | null {
    let parent = node.parent!
    while (
        parent.type === "JSONUnaryExpression" ||
        parent.type === "JSONBinaryExpression"
    ) {
        parent = parent.parent
    }
    if (parent.type === "JSONExpressionStatement") {
        return null
    }
    if (parent.type === "JSONArrayExpression") {
        return parent.elements.indexOf(node)
    }
    return getKeyFromJSONProperty(parent)
}
