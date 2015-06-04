/**
  # Expression Nodes:

  These nodes are not directly responsible for any part of the DOM, but are
  eventually passed to a Statement Node.

  * get
  * subexpr
  * concat
*/

export function acceptParams(nodes, env, scope) {
  var arr = new Array(nodes.length);

  for (var i=0, l=nodes.length; i<l; i++) {
    arr[i] = acceptExpression(nodes[i], env, scope).value;
  }

  return arr;
}

export function acceptHash(pairs, env, scope) {
  var object = {};

  for (var i=0, l=pairs.length; i<l; i += 2) {
    object[pairs[i]] = acceptExpression(pairs[i+1], env, scope).value;
  }

  return object;
}

function acceptExpression(node, env, scope) {
  var ret = { value: null };

  // Primitive literals are unambiguously non-array representations of
  // themselves.
  if (typeof node !== 'object' || node === null) {
    ret.value = node;
    return ret;
  }

  switch(node[0]) {
    // can be used by manualElement
    case 'value': ret.value = node[1]; break;
    case 'get': ret.value = get(node, env, scope); break;
    case 'subexpr': ret.value = subexpr(node, env, scope); break;
    case 'concat': ret.value = concat(node, env, scope); break;
  }

  return ret;
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
