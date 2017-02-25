let Caf = require("caffeine-script-runtime");
Caf.defMod(module, () => {
  let ArtFoundation = require("art-foundation"),
    BaseStn = require("./BaseStn"),
    Error,
    formattedInspect;
  ({ Error, formattedInspect } = Caf.i(["Error", "formattedInspect"], [
    ArtFoundation,
    global
  ]));
  return ControlOperatorStn = Caf.defClass(
    class ControlOperatorStn extends BaseStn {
      constructor(props, children) {
        super(...arguments);
        this.operand = props.operand;
        this.joiner = props.joiner;
        this.expression = children[0];
        this.body = children[1];
        this.elseBody = children[2];
        this.validate();
      }
    },
    function() {
      this.prototype.validate = function() {
        return (() => {
          switch (this.operand) {
            case "while":
            case "until":
              if (this.elseBody) {
                throw new Error(`else not expected after ${this.operand}`);
              }
              return this.joiner === "then"
                ? (() => {
                    throw new Error(`then not expected after ${this.operand}`);
                  })()
                : undefined;
            case "if":
            case "unless":
              return this.joiner === "do"
                ? (() => {
                    throw new Error(`do not expected after ${this.operand}`);
                  })()
                : undefined;
            default:
              return (() => {
                throw new Error(
                  `INTERNAL: invalid control-operator: ${formattedInspect(
                    this.operand
                  )}`
                );
              })();
          }
        })();
      };
      this.prototype.toJs = function(options = {}) {
        let returnExpression,
          returnValueIsIgnored,
          expression,
          operand,
          tempVarIdentifier;
        ({ returnExpression, returnValueIsIgnored } = options);
        expression = this.expression.toJsExpression();
        ({ operand } = this);
        operand = (() => {
          switch (operand) {
            case "until":
            case "unless":
              expression = `!${this.applyParens(expression)}`;
              return operand === "until" ? "while" : "if";
            default:
              return operand;
          }
        })();
        return returnExpression
          ? operand === "while"
              ? returnValueIsIgnored
                  ? `(() => {while ${this.applyRequiredParens(
                      expression
                    )} {${this.body.toFunctionBodyJs(false)};};})()`
                  : (tempVarIdentifier = this.scope.uniqueIdentifier, `(() => {while ${this.applyRequiredParens(
                      expression
                    )} {${this.body.toFunctionBodyJs(
                      `${tempVarIdentifier} =`
                    )};}; return ${tempVarIdentifier}})()`)
              : `${this.applyParens(
                  expression
                )} ? ${this.body.toJsParenExpression()} : ${Caf.exists(
                  this.elseBody
                ) &&
                  this.elseBody.toJsParenExpression() ||
                  "undefined"}`
          : `${operand} ${this.applyRequiredParens(
              expression
            )} {${this.body.toJs()};}${this.elseBody
              ? ` else {${Caf.exists(this.elseBody) && this.elseBody.toJs()};}`
              : ""}`;
      };
      this.prototype.toJsParenExpression = function() {
        return this.applyRequiredParens(this.toJs({ returnExpression: true }));
      };
      this.prototype.toJsExpression = function(returnValueIsIgnored) {
        return this.toJs({
          returnExpression: true,
          returnValueIsIgnored: returnValueIsIgnored
        });
      };
      return this;
    }
  );
});
