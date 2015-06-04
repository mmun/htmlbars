/**
  # Expression Nodes:

  These nodes are not directly responsible for any part of the DOM, but are
  eventually passed to a Statement Node.

  * get
  * subexpr
  * concat
*/

export function acceptParams(nodes, env, scope) {
  let array = new Array(nodes.length);

  for (let i = 0, l = nodes.length; i < l; i++) {
    array[i] = acceptExpression(nodes[i], env, scope).value;
  }

  return array;
}

export function acceptHash(pairs, env, scope) {
  let object = {};

  for (let i = 0, l = pairs.length; i < l; i += 2) {
    let key = pairs[i];
    let value = pairs[i+1];

    object[key] = acceptExpression(value, env, scope).value;
  }

  return object;
}

function acceptExpression(node, env, scope) {
  // Primitive literals are unambiguously non-array representations of
  // themselves.
  if (typeof node !== 'object' || node === null) {
    return { value: node };
  } else {
    return { value: evaluateNode(node, env, scope) };
  }
}

function evaluateNode(node, env, scope) {
  switch (node[0]) {
    // can be used by manualElement
    case 'value': return node[1];
    case 'get': return get(node, env, scope);
    case 'subexpr': return subexpr(node, env, scope);
    case 'concat': return concat(node, env, scope);
  }
}

function get(node, env, scope) {
  let path = node[1];

  return env.hooks.exprs.get(env, scope, path);
}

function subexpr(node, env, scope) {
  let [, path, rawParams, rawHash] = node;
  let params = acceptParams(rawParams, env, scope);
  let hash = acceptHash(rawHash, env, scope);

  return env.hooks.exprs.subexpr(env, scope, path, params, hash);
}

function concat(node, env, scope) {
  let rawParts = node[1];
  let parts = acceptParams(rawParts, env, scope);

  return env.hooks.exprs.concat(env, parts);
}
