{a, m, w} = require "art-foundation"

module.exports =
  literal: w "boolLiteral numberLiteral stringLiteral"

  boolLiteral:   w "true false"
  numberLiteral: pattern: /-?[0-9]+/,   toJs: -> @toString()

  true:   pattern: "/(true|yes|on)(?![a-zA-Z0-9]+)/",   toJs: -> "true"
  false:  pattern: "/(false|no|off)(?![a-zA-Z0-9]+)/",  toJs: -> "false"

  stringLiteral: a
    pattern: /// ' ( [^\\'] | \\[\s\S] )* ' ///, toJs: -> @toString()
    m pattern: /// " ( [^\\"] | \\[\s\S] )* " ///, toJs: -> @toString()
    m pattern: "':' identifier", toJs: -> "'#{@identifier.toString()}'"
    # /// "( [^\\"\#] | \\[\s\S] |           \#(?!\{) )*" ///
    # /// ( [^\\']  | \\[\s\S] | '(?!'')            )* ///
    # /// ( [^\\"#] | \\[\s\S] | "(?!"") | \#(?!\{) )* ///
