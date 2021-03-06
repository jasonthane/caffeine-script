let Caf = require("caffeine-script-runtime");
Caf.defMod(module, () => {
  let StandardImport = require("../StandardImport"),
    BaseStn = require("./BaseStn");
  return ThrowStn = Caf.defClass(class ThrowStn extends BaseStn {}, function(
    ThrowStn,
    classSuper,
    instanceSuper
  ) {
    this.prototype.toJs = function() {
      return `throw ${Caf.toString(this.childrenToJs())}`;
    };
    this.prototype.toJsExpression = function() {
      return `(()=>{${Caf.toString(this.toJs())};})()`;
    };
    this.prototype.toJsParenExpression = function() {
      return this.toJsExpression();
    };
  });
});
