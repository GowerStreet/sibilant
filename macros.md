Before we understand macros we need to understand how the parser, restructurer,
transpiler and output-formatter treat the ` and @ symbols.

For the expression `'(var x "foo")` the following happens:

The parser produces the following output:
```
[
  {
    file: 'eval.sibilant',
    token: "'",
    type: 'tick',
    line: 1,
    col: 0,
    contents: []
  },
  {
    file: 'eval.sibilant',
    token: '(',
    type: 'openExpression',
    line: 1,
    col: 1,
    contents: []
  },
  {
    file: 'eval.sibilant',
    token: 'var',
    type: 'literal',
    line: 1,
    col: 2,
    contents: []
  },
  {
    file: 'eval.sibilant',
    token: ' ',
    type: 'whitespace',
    line: 1,
    col: 5,
    contents: []
  },
  {
    file: 'eval.sibilant',
    token: 'x',
    type: 'literal',
    line: 1,
    col: 6,
    contents: []
  },
  {
    file: 'eval.sibilant',
    token: ' ',
    type: 'whitespace',
    line: 1,
    col: 7,
    contents: []
  },
  {
    file: 'eval.sibilant',
    token: '"foo"',
    type: 'string',
    line: 1,
    col: 8,
    contents: []
  },
  {
    file: 'eval.sibilant',
    token: ')',
    type: 'closeExpression',
    line: 1,
    col: 13,
    contents: []
  }
]
```

The restructurer transforms this into:
```
{
  type: 'root',
  contents: [
    {
      file: 'eval.sibilant',
      token: "'",
      type: 'tick',
      line: 1,
      col: 0,
      contents: [
        {
          file: 'eval.sibilant',
          token: '(',
          type: 'expression',
          line: 1,
          col: 1,
          contents: [
            {
              file: 'eval.sibilant',
              token: 'var',
              type: 'literal',
              line: 1,
              col: 2,
              contents: [],
              specials: 0,
              precedingIgnored: [],
              hint: 'macro'
            },
            {
              file: 'eval.sibilant',
              token: 'x',
              type: 'literal',
              line: 1,
              col: 6,
              contents: [],
              specials: 0,
              precedingIgnored: [
                ...
              ]
            },
            {
              file: 'eval.sibilant',
              token: '"foo"',
              type: 'string',
              line: 1,
              col: 8,
              contents: [],
              specials: 0,
              precedingIgnored: [
                ...
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
      precedingIgnored: []
    }
  ],
  file: 'eval.sibilant',
  col: 0,
  line: 1
}
```

The transpiler takes this AST and does the following:
- The root node has a single element contents and so it makes a recursive call to
`transpiler/transpile` with the single element.
- The recursive call receives a node with `type` = `tick` and so provides it in a call to
`transpiler/transpile.tick` which delegates to the `quote` macro, invoking it with
`.apply()` passing in the `tick` node's contents (so an array containing a single
`expression` node element).
- `.apply()` expands the array and gives it as arguments to the applied function,
so in this case the `quote` macro receives a single argument, being the `expression`
node.
- The `quote` macro is only set up to receive a single argument, which makes sense
since the quote should only apply to a single expression.
- The `quote` macro detects that the node provided is an `expression` node and returns
the following array: `["\"" (map-node (transpile content) qescape) "\""]`, that is,
the results of transpiling the `expression` node's content and passing that to `map-node` with
the `qescape` function.
- The transpiled expression node is as follows:
```
{
  contents: [
    'var ',
    {
      contents: [ 'x' ],
      type: 'output',
      source: {
        ...
      }
    },
    ' = ',
    {
      contents: [ '"foo"' ],
      type: 'output',
      source: {
        ...
      }
    },
    ';'
  ],
  type: 'output',
  source: {
    ...
  }
}
```
- `map-node` applies the provided function (`qescape` in this case) to the node,
then recursively calls itself on the result's contents if the result is still a node
(which it would be since `qescape` returns its argument unmodified if it is not a
string). When presented with an array like the contents `map-node` maps over it
with a recursive call.
- When the `qescape` function encounters a string it returns it after escaping any
double quote characters. In our example it converts the `'"foo"'` string to
`'\\"foo\\"'`
- The result returned from the `quote` macro is therefore:
```
[
  '"',
  {
    contents: [
      'var ',
      {
        contents: [ 'x' ],
        type: 'output',
        source: { ... }
      },
      ' = ',
      {
        contents: [ '\\"foo\\"' ],
        type: 'output',
        source: { ... }
      },
      ';'
    ],
    type: 'output',
    source: { ... }
  },
  '"'
]
```
- Back in `transpiler/transpile` (via the call to `transpiler/transpile.tick`) this
result is wrapped in an `output` node (the result set as its contents) and then
passed to `transpiler/recurse-transpile`.
- Recurse transpile acts as follows:
  - For `output` nodes, it replaces the contents in place with the result of a
    recursive call on them.
  - For lists, it maps over the elements with a recursive call.
  - For strings it returns them unmodified.
- Therefore it does nothing to our wrapped node:
```
{
  contents: [
    '"',
    {
      contents: [
        'var ',
        {
          contents: [ 'x' ],
          type: 'output',
          source: { ... }
        },
        ' = ',
        {
          contents: [ '\\"foo\\"' ],
          type: 'output',
          source: { ... }
        },
        ';'
      ],
      type: 'output',
      source: { ... }
    },
    '"'
  ],
  type: 'output',
  source: { ... }
}
```
- The contents are then modified by `functional/flat-compact` which takes the contents
list and flattens any elements which are also lists. In our case we have no list elements
so nothing is changed.
- This output node is then returned from `transpiler/transpile.root` and then undergoes
one further pass through `transpiler/recurse-transpile`, which has no modifications
to perform, and the same for `functional/flat-compact`.

The `output-formatter` then flattens the node into a single string:
```
"var x = \"foo\";"
```

In the REPL this is then evaluated using `vm.runInContext`:
https://nodejs.org/api/vm.html#vm_vm_runincontext_code_contextifiedsandbox_options

Since it is just a JS string, evaluation just returns the string.
