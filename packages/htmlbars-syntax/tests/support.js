import { parse, traverse } from '../htmlbars-syntax';
import visitorKeys from '../../htmlbars-syntax/types/visitor-keys';


function normalizeNode(obj) {
  if (obj && typeof obj === 'object') {
    var newObj;
    if (obj.splice) {
      newObj = new Array(obj.length);

      for (var i = 0; i < obj.length; i++) {
        newObj[i] = normalizeNode(obj[i]);
      }
    } else {
      newObj = {};

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = normalizeNode(obj[key]);
        }
      }

      if (newObj.type) {
        newObj._type = newObj.type;
        delete newObj.type;
      }

      delete newObj.loc;
    }
    return newObj;
  } else {
    return obj;
  }
}

export function astEqual(actual, expected, message) {
  if (typeof actual === 'string') {
    actual = parse(actual);
  }
  if (typeof expected === 'string') {
    expected = parse(expected);
  }

  actual = normalizeNode(actual);
  expected = normalizeNode(expected);

  deepEqual(actual, expected, message);
}


export function traversalEqual(node, visitor, expectedTraversal) {
  let actualTraversal = [];
  let assertionVisitor = {};

  for (let key in visitorKeys) {
    assertionVisitor[key] = {
      enter(node) {
        actualTraversal.push(['enter', node]);
      },
      exit(node) {
        actualTraversal.push(['exit',  node]);
      }
    };
  }

  traverse(node, assertionVisitor);

  deepEqual(
    actualTraversal.map(a => `${a[0]}:${a[1].type}`),
    expectedTraversal.map(a => `${a[0]}:${a[1].type}`)
  );

  let nodesEqual = true;

  for (let i = 0; i < actualTraversal.length; i++) {
    if (actualTraversal[i][1] !== expectedTraversal[i][1]) {
      nodesEqual = false;
      break;
    }
  }

  ok(nodesEqual, "Actual nodes match expected nodes");

  actualTraversal = null;
}

