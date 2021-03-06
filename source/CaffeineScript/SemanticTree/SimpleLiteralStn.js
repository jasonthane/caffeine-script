let Caf = require("caffeine-script-runtime");
Caf.defMod(module, () => {
  let BaseStn = require("./BaseStn");
  return SimpleLiteralStn = Caf.defClass(
    class SimpleLiteralStn extends BaseStn {},
    function(SimpleLiteralStn, classSuper, instanceSuper) {
      this.prototype.needsParens = false;
      this.prototype.toJs = function() {
        return this.props.value;
      };
      this.prototype.toJsExpressionWithParens = function(options) {
        let dotBase;
        ({ dotBase } = options);
        return dotBase ? `(${Caf.toString(this.toJs())})` : this.toJs();
      };
    }
  );
});
