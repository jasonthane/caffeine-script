let Caf = require("caffeine-script-runtime");
Caf.defMod(module, () => {
  let StandardImport = require("../StandardImport"),
    createObjectTreeFactory,
    ArtObjectTreeFactory = require("art-object-tree-factory"),
    BaseClass,
    log,
    Object,
    Error,
    objectWithout,
    toInspectedObjects,
    objectKeyCount,
    compactFlatten,
    isString,
    noChildren;
  ({
    BaseClass,
    log,
    Object,
    Error,
    objectWithout,
    toInspectedObjects,
    objectKeyCount,
    compactFlatten,
    isString,
    noChildren
  } = Caf.i(
    [
      "BaseClass",
      "log",
      "Object",
      "Error",
      "objectWithout",
      "toInspectedObjects",
      "objectKeyCount",
      "compactFlatten",
      "isString",
      "noChildren"
    ],
    [StandardImport, global]
  ));
  ({ createObjectTreeFactory } = ArtObjectTreeFactory);
  return BaseStn = Caf.defClass(
    class BaseStn extends BaseClass {
      constructor(props, children = noChildren) {
        super(...arguments);
        this.children = children;
        this.parseTreeNode = props.parseTreeNode;
        this.props = objectWithout(props, "parseTreeNode");
        this.initLabeledChildren();
      }
    },
    function(BaseStn, classSuper, instanceSuper) {
      let CaffeineScriptRuntime = require("caffeine-script-runtime"),
        applyRequiredParens,
        applyParens;
      if (!(CaffeineScriptRuntime.getSuper(this) === BaseClass)) {
        log({
          self: this,
          selfName: this.getName(),
          "Object.getPrototypeOf@": Object.getPrototypeOf(this),
          badSuper: CaffeineScriptRuntime.getSuper(this),
          BaseClass: BaseClass,
          "selfIsBaseObject?": this === BaseClass
        });
        throw new Error("bad super");
      }
      this.abstractClass();
      noChildren = [];
      this.prototype.initLabeledChildren = function() {
        this.labeledChildren = this.children && {};
        return Caf.e(this.children, undefined, (child, k, into) => {
          let label, pluralLabel, cafBase;
          child.parent = this;
          ({ label, pluralLabel } = child);
          this.labeledChildren[label] = child;
          if (pluralLabel) {
            ((cafBase = this.labeledChildren)[pluralLabel] ||
              (cafBase[pluralLabel] = [])).push(child);
          }
        });
      };
      this.getter({
        parser: function() {
          return this.parseTreeNode.parser.rootParser;
        },
        sourceFile: function() {
          return this.parser.sourceFile;
        },
        label: function() {
          return this.props.label;
        },
        pluralLabel: function() {
          return this.props.pluralLabel;
        },
        inspectedObjects: function() {
          let label, props, name, a;
          ({ label } = this);
          props = objectWithout(this.props, "label", "pluralLabel");
          name = this.class.getName();
          if (label) {
            name = `${Caf.toString(label)}.${Caf.toString(name)}`;
          }
          return {
            [`${Caf.toString(name)}`]: this.children.length === 0
              ? toInspectedObjects(props)
              : (a = [], objectKeyCount(props) > 0
                  ? a.push(props)
                  : undefined, a.concat(
                  Caf.e(this.children, [], (c, k, into) => {
                    into.push(c.inspectedObjects);
                  })
                ))
          };
        },
        type: function() {
          return this.class.type;
        }
      });
      this.postCreate = function() {
        let s;
        s = this.getName().split(/Stn$/);
        this.type = s[0];
        return classSuper.postCreate.apply(this, arguments);
      };
      this.newInstance = function(props, children) {
        return new this(props, children);
      };
      this.postCreateConcreteClass = function(options) {
        let classModuleState, hotReloadEnabled;
        ({ classModuleState, hotReloadEnabled } = options);
        classSuper.postCreateConcreteClass.apply(this, arguments);
        return createObjectTreeFactory({ class: this }, (props, children) => {
          return this.newInstance(props, children);
        });
      };
      this.prototype.findParent = function(stnTypePattern) {
        let parent, found;
        ({ parent } = this);
        found = null;
        while (parent && !found) {
          if (parent.type.match(stnTypePattern)) {
            found = parent;
          } else {
            ({ parent } = parent);
          }
        }
        return found;
      };
      this.prototype.find = function(stnTypePattern) {
        let a;
        a = compactFlatten(
          Caf.e(this.children, [], (child, k, into) => {
            into.push(
              child.type.match(stnTypePattern)
                ? child
                : child.find(stnTypePattern)
            );
          })
        );
        return a.length === 0 ? null : a;
      };
      this.prototype.childrenToJs = function(joiner = "") {
        return Caf
          .e(this.children, [], (c, k, into) => {
            into.push(c.toJs());
          })
          .join(joiner);
      };
      this.prototype.toJs = function() {
        return (() => {
          throw new Error(
            `must override one of the toJs* functions: ${Caf.toString(
              this.className
            )}`
          );
        })();
      };
      this.prototype.toJsStatement = function() {
        return this.toJs();
      };
      this.prototype.doJs = function(args, body) {
        if (args) {
          throw "TODO";
        }
        if (!isString(body)) {
          body = body.toFunctionBodyJs();
        }
        return `(() => {${Caf.toString(body)};})()`;
      };
      this.prototype.toFunctionBodyJsArray = function(returnAction = true) {
        return returnAction
          ? [`return ${Caf.toString(this.toJsExpression())}`]
          : [this.toJs()];
      };
      this.prototype.toFunctionBodyJs = function(returnAction = true) {
        return this.toFunctionBodyJsArray(returnAction).join("");
      };
      this.prototype.transformChildren = function() {
        let ret;
        ret = null;
        Caf.e(this.children, undefined, (child, i, into) => {
          let newChild;
          if (child !== (newChild = child.transform())) {
            ret != null ? ret : ret = this.children.slice();
            ret[i] = newChild;
          }
        });
        return ret || this.children;
      };
      this.prototype.transform = function() {
        let newChildren;
        return this.children !== (newChildren = this.transformChildren())
          ? new this.class(this.props, newChildren)
          : this;
      };
      this.prototype.toJsExpression = function(returnValueIgnored = false) {
        return this.toJs();
      };
      this.prototype.toJsExpressionWithParens = function() {
        let js;
        js = this.toJsExpression();
        return this.getNeedsParens() ? `(${Caf.toString(js)})` : js;
      };
      this.prototype.toJsParenExpression = function() {
        return this.toJs();
      };
      this.prototype.toInterpolatedJsStringPart = function() {
        return `\${Caf.toString(${Caf.toString(
          this.toJsExpression({ skipParens: true })
        )})}`;
      };
      this.prototype.needsParens = true;
      this.prototype.needsParensAsStatement = false;
      this.prototype.getNeedsParens = function() {
        return this.needsParens;
      };
      this.prototype.getNeedsParensAsStatement = function() {
        return this.needsParensAsStatement;
      };
      this.applyRequiredParens = applyRequiredParens = function(expr) {
        return `(${Caf.toString(expr)})`;
      };
      this.applyParens = applyParens = function(expr) {
        return expr.match(
          /^(\([^)]*\)|\[[^\]]*\]|([!~-]*[_a-z0-9.]*)(\([^)]*\))?)$/i
        )
          ? expr
          : `(${Caf.toString(expr)})`;
      };
      this.prototype.applyRequiredParens = applyRequiredParens;
      this.prototype.applyParens = applyParens;
      this.getter({
        normalizedOperand: function() {
          let op;
          return (() => {
            switch (op = this.props.operand) {
              case "and":
                return "&&";
              case "or":
                return "||";
              case "==":
              case "is":
                return "===";
              case "!=":
              case "isnt":
                return "!==";
              case "not":
                return "!";
              default:
                return op;
            }
          })();
        }
      });
      this.prototype.updateScope = function(scope) {
        this.scope = scope;
        return Caf.e(this.children, undefined, (child, k, into) => {
          child.updateScope(this.scope);
        });
      };
    }
  );
});
