let Caf = require("caffeine-script-runtime");
Caf.defMod(module, () => {
  let StandardImport = require("../StandardImport"),
    BabelBridge = require("babel-bridge"),
    getPropertySetters,
    Extensions,
    Error;
  ({ Extensions, Error } = Caf.import(["Extensions", "Error"], [
    StandardImport,
    BabelBridge,
    global
  ]));
  getPropertySetters = function(node, list = []) {
    let prop;
    if (node) {
      if (prop = Caf.isF(node.shouldSetProperty) && node.shouldSetProperty()) {
        list.push(prop);
      } else {
        Caf.each(node.matches, undefined, (match, k, into) => {
          getPropertySetters(match, list);
        });
      }
    }
    return list;
  };
  return function() {
    this.rule(
      {
        functionDefinition: {
          pattern: "args:argsDefinition? _arrow_ body:functionDefinitionBodyBlock?"
        }
      },
      {
        stnFactory: "FunctionDefinitionStn",
        stnProps: function() {
          return {
            bound: (() => {
              switch (this._arrow_.text.match(/(=>|~>|->)/)[0]) {
                case "=>":
                  return true;
                case "~>":
                  return false;
                case "->":
                  return "auto";
                default:
                  return (() => {
                    throw new Error();
                  })();
              }
            })()
          };
        }
      }
    );
    this.rule({
      functionDefinitionBodyBlock: Extensions.IndentBlocks.getPropsToSubparseToEolAndBlock()
    });
    this.rule({ argsDefinition: "openParen_ argDefList? _closeParen" }, {
      stnFactory: "FunctionDefinitionArgsStn"
    });
    this.rule({
      argDefList: ["argDef _comma_ argDefList", "argDef _ argDefList", "argDef"]
    });
    this.rule(
      {
        argDef: [
          "at:/@/? target:identifier argIdentifierExtension?",
          "target:destructuringTarget argIdentifierExtension?"
        ]
      },
      {
        stnFactory: "FunctionDefinitionArgStn",
        stnProps: function() {
          let cafBase;
          return {
            rest: !!(Caf.exists(cafBase = this.argIdentifierExtension) &&
              cafBase.ellipsis),
            assignThisProperty: !!this.at
          };
        }
      }
    );
    this.rule({
      argIdentifierExtension: ["defaultValue", "ellipsis"],
      defaultValue: { pattern: "_equals_ expression" }
    });
    this.rule({
      superFunctionInvocation: [
        "openParen_ valueList? _closeParen",
        "_? implicitArrayOrExpression",
        "_? valueListBlock"
      ]
    });
    return this.rule(
      {
        functionInvocation: [
          "existanceTest:questionMark? openParen_ values:valueList? _closeParen",
          "existanceTest:questionMark? !/[-+]/ _? values:valueList",
          "existanceTest:questionMark? _? values:valueListBlock"
        ]
      },
      {
        stnFactory: "FunctionInvocationStn",
        stnExtension: true,
        stnProps: function() {
          return { existanceTest: !!this.existanceTest };
        },
        stnChildren: function() {
          let cafBase;
          return Caf.exists(cafBase = this.values) && cafBase.getStn();
        }
      }
    );
  };
});
