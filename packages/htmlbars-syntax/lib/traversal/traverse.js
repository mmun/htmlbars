import visitorKeys from '../types/visitor-keys';
import {
  cannotRemoveNode,
  cannotReplaceNode,
} from './errors';

function visitNode(node, visitor) {
  let handler = visitor[node.type];
  let result;

  if (handler && handler.enter) {
    result = handler.enter.call(null, node);
  }

  if (result === undefined) {
    visitChildNodes(node, visitor);

    if (handler && handler.exit) {
      result = handler.exit.call(null, node);
    }
  }

  return result;
}

function visitChildNodes(node, visitor) {
  let keys = visitorKeys[node.type];

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let child = node[key];
    if (child) {
      if (Array.isArray(child)) {
        visitArrayOfNodes(child, visitor);
      } else {
        let result = visitNode(child, visitor);
        if (result === undefined) {
          // Do nothing.
        } else if (result === null) {
          throw cannotRemoveNode(child, node, key);
        } else if (Array.isArray(result)) {
          if (result.length === 1) {
            node[key] = result[0];
          } else {
            if (result.length === 0) {
              throw cannotRemoveNode(child, node, key);
            } else {
              throw cannotReplaceNode(child, node, key);
            }
          }
        } else {
          node[key] = result;
        }
      }
    }
  }
}

function visitArrayOfNodes(nodes, visitor) {
  for (let i = 0; i < nodes.length; i++) {
    let result = visitNode(nodes[i], visitor);
    
    if (result === undefined) {
      continue;
    } else if (result === null) {
      nodes.splice(i, 1);
      i--;
    } else if (Array.isArray(result)) {
      nodes.splice(i, 1, ...result);
      i += result.length - 1;
    } else {
      nodes.splice(i, 1, result);
    }
  }
}

export default function traverse(node, visitor) {
  visitNode(node, normalizeVisitor(visitor));
}

export function normalizeVisitor(visitor) {
  let normalizedVisitor = {};

  for (let type in visitor) {
    let handler = visitor[type] || visitor.All;

    if (typeof handler === 'object') {
      normalizedVisitor[type] = {
        enter: (typeof handler.enter === 'function') ? handler.enter : null,
        exit: (typeof handler.exit === 'function') ? handler.exit : null
      };
    } else if (typeof handler === 'function') {
      normalizedVisitor[type] = {
        enter: handler,
        exit: null
      };
    }
  }

  return normalizedVisitor;
}
