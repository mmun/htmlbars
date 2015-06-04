import { merge, createObject } from "../htmlbars-util/object-utils";
import { validateChildMorphs, linkParams } from "../htmlbars-util/morph-utils";
import { acceptParams, acceptHash } from "./expression-visitor";

/**
  Node classification:

  # Primary Statement Nodes:

  These nodes are responsible for a render node that represents a morph-range.

  * block
  * inline
  * content
  * element
  * component

  # Leaf Statement Nodes:

  This node is responsible for a render node that represents a morph-attr.

  * attribute

*/

var base = {
  linkParamsAndHash: function(env, scope, morph, path, params, hash) {
    if (morph.linkedParams) {
      params = morph.linkedParams.params;
      hash = morph.linkedParams.hash;
    } else {
      params = params && acceptParams(params, env, scope);
      hash = hash && acceptHash(hash, env, scope);
    }

    linkParams(env, scope, morph, path, params, hash);
    return [params, hash];
  }
};

export var AlwaysDirtyVisitor = merge(createObject(base), {
  // [ 'block', path, params, hash, templateId, inverseId ]
  block: function(node, morph, env, scope, template, visitor) {
    var path = node[1], params = node[2], hash = node[3], templateId = node[4], inverseId = node[5];
    var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, params, hash);

    morph.isDirty = morph.isSubtreeDirty = false;
    env.hooks.nodes.block(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1],
                           templateId === null ? null : template.templates[templateId],
                           inverseId === null ? null : template.templates[inverseId],
                           visitor);
  },

  // [ 'inline', path, params, hash ]
  inline: function(node, morph, env, scope, visitor) {
    var path = node[1], params = node[2], hash = node[3];
    var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, params, hash);

    morph.isDirty = morph.isSubtreeDirty = false;
    env.hooks.nodes.inline(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1], visitor);
  },

  // [ 'content', path ]
  content: function(node, morph, env, scope, visitor) {
    var path = node[1];

    morph.isDirty = morph.isSubtreeDirty = false;

    if (isHelper(env, scope, path)) {
      env.hooks.nodes.inline(morph, env, scope, path, [], {}, visitor);
      return;
    }

    var params;
    if (morph.linkedParams) {
      params = morph.linkedParams.params;
    } else {
      params = [env.hooks.exprs.get(env, scope, path)];
    }

    linkParams(env, scope, morph, '@range', params, null);
    env.hooks.nodes.range(morph, env, scope, path, params[0], visitor);
  },

  // [ 'element', path, params, hash ]
  element: function(node, morph, env, scope, visitor) {
    var path = node[1], params = node[2], hash = node[3];
    var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, params, hash);

    morph.isDirty = morph.isSubtreeDirty = false;
    env.hooks.nodes.element(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1], visitor);
  },

  // [ 'attribute', name, value ]
  attribute: function(node, morph, env, scope) {
    var name = node[1], value = node[2];
    var paramsAndHash = this.linkParamsAndHash(env, scope, morph, '@attribute', [value], null);

    morph.isDirty = morph.isSubtreeDirty = false;
    env.hooks.nodes.attribute(morph, env, scope, name, paramsAndHash[0][0]);
  },

  // [ 'component', path, attrs, templateId, inverseId ]
  component: function(node, morph, env, scope, template, visitor) {
    var path = node[1], attrs = node[2], templateId = node[3], inverseId = node[4];
    var paramsAndHash = this.linkParamsAndHash(env, scope, morph, path, [], attrs);
    var templates = {
      default: template.templates[templateId],
      inverse: template.templates[inverseId]
    };

    morph.isDirty = morph.isSubtreeDirty = false;
    env.hooks.nodes.component(morph, env, scope, path, paramsAndHash[0], paramsAndHash[1],
                        templates, visitor);
  },

  // [ 'attributes', template ]
  attributes: function(node, morph, env, scope, parentMorph, visitor) {
    let template = node[1];
    env.hooks.nodes.attributes(morph, env, scope, template, parentMorph, visitor);
  }
});

export default merge(createObject(base), {
  // [ 'block', path, params, hash, templateId, inverseId ]
  block: function(node, morph, env, scope, template, visitor) {
    dirtyCheck(env, morph, visitor, function(visitor) {
      AlwaysDirtyVisitor.block(node, morph, env, scope, template, visitor);
    });
  },

  // [ 'inline', path, params, hash ]
  inline: function(node, morph, env, scope, visitor) {
    dirtyCheck(env, morph, visitor, function(visitor) {
      AlwaysDirtyVisitor.inline(node, morph, env, scope, visitor);
    });
  },

  // [ 'content', path ]
  content: function(node, morph, env, scope, visitor) {
    dirtyCheck(env, morph, visitor, function(visitor) {
      AlwaysDirtyVisitor.content(node, morph, env, scope, visitor);
    });
  },

  // [ 'element', path, params, hash ]
  element: function(node, morph, env, scope, template, visitor) {
    dirtyCheck(env, morph, visitor, function(visitor) {
      AlwaysDirtyVisitor.element(node, morph, env, scope, template, visitor);
    });
  },

  // [ 'attribute', name, value ]
  attribute: function(node, morph, env, scope, template) {
    dirtyCheck(env, morph, null, function() {
      AlwaysDirtyVisitor.attribute(node, morph, env, scope, template);
    });
  },

  // [ 'component', path, attrs, templateId ]
  component: function(node, morph, env, scope, template, visitor) {
    dirtyCheck(env, morph, visitor, function(visitor) {
      AlwaysDirtyVisitor.component(node, morph, env, scope, template, visitor);
    });
  },

  // [ 'attributes', template ]
  attributes: function(node, morph, env, scope, parentMorph, visitor) {
    AlwaysDirtyVisitor.attributes(node, morph, env, scope, parentMorph, visitor);
  }
});

function dirtyCheck(_env, morph, visitor, callback) {
  var isDirty = morph.isDirty;
  var isSubtreeDirty = morph.isSubtreeDirty;
  var env = _env;

  if (isSubtreeDirty) {
    visitor = AlwaysDirtyVisitor;
  }

  if (isDirty || isSubtreeDirty) {
    callback(visitor);
  } else {
    if (morph.buildChildEnv) {
      env = morph.buildChildEnv(morph.state, env);
    }
    validateChildMorphs(env, morph, visitor);
  }
}

function isHelper(env, scope, path) {
  return (env.hooks.keywords[path] !== undefined) || env.hooks.hasHelper(env, scope, path);
}
