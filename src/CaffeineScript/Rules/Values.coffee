{a, m, w, compactFlatten, log} = require "art-foundation"
{Parser, Nodes, Extensions} = require 'babel-bridge'

module.exports = ->
  @rule
    value: "simpleValue valueExtension*"

  @rule
    valueExtension: w "dotAccessor bracketAccessor functionInvocation"
    simpleValue: w "this thisProperty literal unqualifiedIdentifier"

  @rule
    unqualifiedIdentifier:
      pattern: "!reservedWord identifier assignmentExtension?"

  @rule
    this:         "/@/ !identifier"
    thisProperty: "/@/ identifier assignmentExtension?"
  ,
    stnFactory: "ThisStn"

  @rule
    dotAccessor:
      pattern: "dot_ identifier assignmentExtension?"
      stnFactory: "DotAccessorStn"
      stnExtension: true

    bracketAccessor:
      pattern: "openBracket_ expression _closeBracket"
      stnFactory: "BracketAccessorStn"
      stnExtension: true

  @rule
    functionInvocation: a
      pattern: "openParen_ valueList? _closeParen"
      m pattern: "_? complexExpression"
      m pattern: "commentOrSpace* valueListBlock"
  ,
    stnExtension: true
    stnFactory: "FunctionInvocationStn"

  @rule
    assignmentExtension: "assignmentExtensionFoo"

  @rule
    assignmentExtensionFoo: a
      pattern: "_assignmentOperator_ complexExpression"
      m pattern: "_assignmentOperator_ rValueBlock"
  ,
    stnFactory: "AssignmentStn"
    stnExtension: true
