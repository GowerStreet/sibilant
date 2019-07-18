# Compiling process
The REPL takes input in the form of a string e.g. `"(var x)"`.

It calls `node/sibilant.entry` via an include in `src/sibilant.sibilant`, providing
this string.

It converts this source string into an AST (abstract syntax tree) by piping through
`parser/parse` and `restructurer/restructure` (also via includes in `src/sibilant.sibilant`)..

This AST is then converted to output via a call to `transpiler/transpile`.

This output is then converted to JS via a call to `output-formatter/output-formatter`.

## parser/parse
Initialises a `context` object:
```
{ position: 0, stack: [], line: 1, lastNewline: 0, col: 0 }
```

Works through the source string, finding matches by calling `.exec` on the
these regexes:
```
[
  /^(;.*)/ { name: 'comment' },
  /^("(([^"]|(\\"))*[^\\])?")/ { name: 'string' },
  /^(-?[0-9][0-9.,]*)/ { name: 'number' },
  /^[`']/ { name: 'tick' },
  /^(\^)/ { name: 'hat' },
  /^@/ { name: 'at' },
  /^([&'])/ { name: 'special' },
  /^(\.*[*$a-zA-Z_\|><=\+\/\*-]+[\/*.a-zA-Z0-9-_\|><=\+\/\*-]*(\?|!)?\()/ {
    name: 'head'
  },
  /^(\.+)/ { name: 'dots' },
  /^(-?[*.$a-zA-Z_][\/*.a-zA-Z0-9-_]*(\?|!)?)/ { name: 'literal' },
  /^(#[0-9]+)/ { name: 'argPlaceholder' },
  /^([\|#><=!\+\/\*-]+)/ { name: 'otherChar' },
  /^(\(|\{|\[)/ { name: 'openExpression' },
  /^(\)|\}|\])/ { name: 'closeExpression' },
  /^\n/ { name: 'newline' },
  /^\s+/ { name: 'whitespace' },
  /^./ { name: 'ignored' }
]
```

Each time there is a match, the context object is updated. For the source string
`(var x)` these are the stages:

```
{
  position: 1,
  stack: [
    {
      file: 'eval.sibilant',
      token: '(',
      type: 'openExpression',
      line: 1,
      col: 0,
      contents: []
    }
  ],
  line: 1,
  lastNewline: 0,
  col: 1
}
```

```
{
  position: 4,
  stack: [
    {
      file: 'eval.sibilant',
      token: '(',
      type: 'openExpression',
      line: 1,
      col: 0,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: 'var',
      type: 'literal',
      line: 1,
      col: 1,
      contents: []
    }
  ],
  line: 1,
  lastNewline: 0,
  col: 4
}
```

```
{
  position: 5,
  stack: [
    {
      file: 'eval.sibilant',
      token: '(',
      type: 'openExpression',
      line: 1,
      col: 0,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: 'var',
      type: 'literal',
      line: 1,
      col: 1,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: ' ',
      type: 'whitespace',
      line: 1,
      col: 4,
      contents: []
    }
  ],
  line: 1,
  lastNewline: 0,
  col: 5
}
```

```
{
  position: 6,
  stack: [
    {
      file: 'eval.sibilant',
      token: '(',
      type: 'openExpression',
      line: 1,
      col: 0,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: 'var',
      type: 'literal',
      line: 1,
      col: 1,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: ' ',
      type: 'whitespace',
      line: 1,
      col: 4,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: 'x',
      type: 'literal',
      line: 1,
      col: 5,
      contents: []
    }
  ],
  line: 1,
  lastNewline: 0,
  col: 6
}
```

```
{
  position: 7,
  stack: [
    {
      file: 'eval.sibilant',
      token: '(',
      type: 'openExpression',
      line: 1,
      col: 0,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: 'var',
      type: 'literal',
      line: 1,
      col: 1,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: ' ',
      type: 'whitespace',
      line: 1,
      col: 4,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: 'x',
      type: 'literal',
      line: 1,
      col: 5,
      contents: []
    },
    {
      file: 'eval.sibilant',
      token: ')',
      type: 'closeExpression',
      line: 1,
      col: 6,
      contents: []
    }
  ],
  line: 1,
  lastNewline: 0,
  col: 7
}
```

When there are no more matches, the `context.stack` is returned.

## restructurer/restructure
The restructure function then converts this stack to a nested structure:

Sets up a new context object:
```
{ parse-stack [context.stack]
  output output
  input input
  ignored-nodes []
  specials 0 }
```

Builds up the following output:
```
{
  type: 'root',
  contents: [
    {
      file: 'eval.sibilant',
      token: '(',
      type: 'expression',
      line: 1,
      col: 0,
      contents: [
        {
          file: 'eval.sibilant',
          token: 'var',
          type: 'literal',
          line: 1,
          col: 1,
          contents: [],
          specials: 0,
          precedingIgnored: []
        },
        {
          file: 'eval.sibilant',
          token: 'x',
          type: 'literal',
          line: 1,
          col: 5,
          contents: [],
          specials: 0,
          precedingIgnored: [
            {
              file: 'eval.sibilant',
              token: ' ',
              type: 'whitespace',
              line: 1,
              col: 4,
              contents: []
            }
          ]
        }
      ],
      precedingIgnored: [],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }
  ],
  file: 'eval.sibilant',
  col: 0,
  line: 1
}
```

## transpiler/transpile

Receives the following node for `(var x)`:
```
{
  type: 'root',
  contents: [
    {
      file: 'eval.sibilant',
      token: '(',
      type: 'expression',
      line: 1,
      col: 0,
      contents: [
        {
          file: 'eval.sibilant',
          token: 'var',
          type: 'literal',
          line: 1,
          col: 1,
          contents: [],
          specials: 0,
          precedingIgnored: []
        },
        {
          file: 'eval.sibilant',
          token: 'x',
          type: 'literal',
          line: 1,
          col: 5,
          contents: [],
          specials: 0,
          precedingIgnored: [Array]
        }
      ],
      precedingIgnored: [],
      specials: 0,
      end: undefined,
      closed: true,
      closingIgnored: []
    }
  ],
  file: 'eval.sibilant',
  col: 0,
  line: 1
}
```

Looks up the specific transpiler needed for the node according to the node's `type`
which is in this case is `root`.

The `transpiler/transpile.root` transpiler checks the length of the node's contents
and if 1 makes a recursive call to `transpiler/transpile` with the single element:
```
(def transpile.root (node)
     (if (= 1 node.contents.length)
         (transpile (first node.contents))
         (pipe node.contents
               (map as-statement)
               (compact)
               (interleave "\n"))))
```

This recursive call then receives a node with `type` = `expression`. The
`transpiler/transpile.expression` transpiler takes the first element of the contents
and makes a further recursive call to `transpiler/transpile` with it. `type` is
then `literal`.

The `transpiler/transpile.literal` transpiler takes the node's `token` (which in
this case is `var`), and makes conversions required for valid JS:
```
example? --> example__QUERY
example! --> example__BANG
ex******ample --> ex______ample
example-0 --> example0
example-zero --> exampleZero
example-Zero --> example_Zero
EXAMPLE-ZERO --> EXAMPLE_ZERO
```

It also sets the node's `type` to `output`.

Back in `transpiler/transpile.expression` This converted node is then piped through
`output-formatter/output-formatter` which takes the node's contents (in this case a list
with 1 element of "var") and recursively calls itself on each element. The call to
`output-formatter/output-formatter` with the string "var" returns it unmodified. This
is then piped through `sibilant.resolve-macro` which resolves the `var` macro:

```
(macro var (...pairs)
       (as-statement
        ["var " (|> pairs
                    destructure
                    (map (#(pair) [(first pair) " = " (second pair)]))
                    (interleave ",\n    ")) ]))
```

This macro (which is a function) then has `.apply` called on it, providing the original
node that `transpile.expression` was called with as the first argument, and the
`rest` of the node's contents as the second argument.

The result of this `.apply` is returned from `transpile.expression`:
```
[
  [
    'var ',
    [
      [
        {
          contents: [ 'x' ],
          type: 'output',
          source: {
            file: 'eval.sibilant',
            token: 'x',
            type: 'literal',
            line: 1,
            col: 5,
            contents: [],
            specials: 0,
            precedingIgnored: [
              {
                file: 'eval.sibilant',
                token: ' ',
                type: 'whitespace',
                line: 1,
                col: 4,
                contents: []
              }
            ]
          }
        },
        ' = ',
        'undefined'
      ]
    ]
  ],
  ';'
]
```

This is returned to our original recursive call to `transpiler/transpile` which,
seeing that the node is now a list, returns it unmodified to `transpiler/transpile.root`,
and back up again to the original call to `transpiler/transpile`.

With this transpiled result (from the `transpile.root` via the `transpile.expression`
via the `var` macro), a further recursive transpile is performed until no list nodes
remain with a call to `transpiler/recurse-transpile`. Before this, the transpiled
result is nested in an object of the format ```{ contents result, type 'output }```.

As a node with type `output`, the `contents` node is modified in place with a recursive
call to `recurse-transpile`. The contents node is a list containing two elements, another list and a ';' string. As a
list it is mapped over with recursive calls to `transpiler/recurse-transpile` for
each element. The ';' string is neither a list nor a node and so is returned unmodified.
The list is itself mapped over with `recurse-transpile`. This list has two elements,
a 'var ' string and another list node. As for the ';' string, the 'var ' string
is returned unmodified. The list node only contains a single element being another
list which in turn contains 3 elements, an `output` node, a ' = ' string and a
'undefined' string. The `output` node has its contents `recurse-transpiled` in place.
Because the contents are nothing but a list containing a single `x` string element
nothing is changed.

This means that `recurse-transpile` actually does nothing to the output in this
instance.

The `result-node` then has its contents flattened with a call to `functional/flat-compact`:
```
{
  contents: [
    'var ',
    {
      contents: [ 'x' ],
      type: 'output',
      source: {
        file: 'eval.sibilant',
        token: 'x',
        type: 'literal',
        line: 1,
        col: 5,
        contents: [],
        specials: 0,
        precedingIgnored: [
          {
            file: 'eval.sibilant',
            token: ' ',
            type: 'whitespace',
            line: 1,
            col: 4,
            contents: []
          }
        ]
      }
    },
    ' = ',
    'undefined',
    ';'
  ],
  type: 'output',
  source: {
    ...
  }
}
```

## output-formatter/output-formatter

The converted output is passed through this function to produce JS. Since the output
is a node with type `output`, a recursive call to the formatter is made with it's
contents. These contents are a list, and so the recursive call maps over it making
further recursive calls and then joining.

The 'var ' element is a string and so is returned unmodified.

The second element is an output node and so further recursive calls return the string
'x'.

The remaining elements are all strings and so returned unmodified.

After the join, the return value is 'var x = undefined;'
