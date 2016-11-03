Foundation = require 'art-foundation'

{log, a, w, m, defineModule, compactFlatten, present, escapeJavascriptString, BaseObject} = Foundation

defineModule module, class DestructuringIdentifierStn extends require './BaseStn'

  updateScope: (@scope) ->
    @scope.addIdentifierAssigned @labeledChildren.identifier.toJs()
    super


  toJs: ->
    @childrenToJs()