import { astEqual } from '../support';
import {
  parse,
  traverse,
  builders as b
} from '../../htmlbars-syntax';
import {
  cannotRemoveNode,
  cannotReplaceNode,
} from '../../htmlbars-syntax/traversal/errors';

QUnit.module('[htmlbars-syntax] Traversal - manipulating');

QUnit.test('Replacing self in a key (returning null)', assert => {
  let ast = parse(`<x y={{z}} />`);
  let attr = ast.body[0].attributes[0];

  assert.throws(() => {
    traverse(ast, {
      MustacheStatement(node) {
        if (node.path.parts[0] === 'z') {
          return null;
        }
      }
    });
  }, cannotRemoveNode(attr.value, attr, 'value'));
});

QUnit.test('Replacing self in a key (returning an empty array)', assert => {
  let ast = parse(`<x y={{z}} />`);
  let attr = ast.body[0].attributes[0];

  assert.throws(() => {
    traverse(ast, {
      MustacheStatement(node) {
        if (node.path.parts[0] === 'z') {
          return [];
        }
      }
    });
  }, cannotRemoveNode(attr.value, attr, 'value'));
});

QUnit.test('Replacing self in a key (returning a node)', () => {
  let ast = parse(`<x y={{z}} />`);

  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.parts[0] === 'z') {
        return b.mustache('a');
      }
    }
  });

  astEqual(ast, `<x y={{a}} />`);
});

QUnit.test('Replacing self in a key (returning an array with a single node)', () => {
  let ast = parse(`<x y={{z}} />`);

  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.parts[0] === 'z') {
        return [b.mustache('a')];
      }
    }
  });

  astEqual(ast, `<x y={{a}} />`);
});

QUnit.test('Replacing self in a key (returning an array with multiple nodes)', assert => {
  let ast = parse(`<x y={{z}} />`);
  let attr = ast.body[0].attributes[0];

  assert.throws(() => {
    traverse(ast, {
      MustacheStatement(node) {
        if (node.path.parts[0] === 'z') {
          return [
            b.mustache('a'),
            b.mustache('b'),
            b.mustache('c')
          ];
        }
      }
    });
  }, cannotReplaceNode(attr.value, attr, 'value'));
});


QUnit.test('Replacing self in an array (returning null)', () => {
  let ast = parse(`{{x}}{{y}}{{z}}`);

  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.parts[0] === 'y') {
        return null;
      }
    }
  });

  astEqual(ast, `{{x}}{{z}}`);
});

QUnit.test('Replacing self in an array (returning an empty array)', () => {
  let ast = parse(`{{x}}{{y}}{{z}}`);

  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.parts[0] === 'y') {
        return [];
      }
    }
  });

  astEqual(ast, `{{x}}{{z}}`);
});

QUnit.test('Replacing self in an array (returning a node)', () => {
  let ast = parse(`{{x}}{{y}}{{z}}`);

  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.parts[0] === 'y') {
        return b.mustache('a');
      }
    }
  });

  astEqual(ast, `{{x}}{{a}}{{z}}`);
});

QUnit.test('Replacing self in an array (returning an array with a single node)', () => {
  let ast = parse(`{{x}}{{y}}{{z}}`);

  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.parts[0] === 'y') {
        return [b.mustache('a')];
      }
    }
  });

  astEqual(ast, `{{x}}{{a}}{{z}}`);
});

QUnit.test('Replacing self in an array (returning an array with multiple nodes)', () => {
  let ast = parse(`{{x}}{{y}}{{z}}`);

  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.parts[0] === 'y') {
        return [
          b.mustache('a'),
          b.mustache('b'),
          b.mustache('c')
        ];
      }
    }
  });

  astEqual(ast, `{{x}}{{a}}{{b}}{{c}}{{z}}`);
});
