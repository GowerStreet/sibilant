[![Build Status](https://travis-ci.org/jbr/sibilant.svg?branch=master)](https://travis-ci.org/jbr/sibilant)
[![Gitter](https://img.shields.io/badge/gitter-join%20chat-brightgreen.svg)](https://gitter.im/jbr/sibilant?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Sibilant

- Sibilant is a language that is parsed by javascript and compiles to
  javascript.
- Sibilant is inspired by lisp and follows many lisp conventions,
  although it is still relatively close to the underlying javascript.
- Macros can be defined in sibilant and included at compile time.
- Sibilant is entirely written in sibilant.

## Language Priorities

- Prefer verbose names to abbreviations by default.
- Avoid line noise.  Prefer established punctuation semantics from
  natural languages and common programming languages (eg commas come
  after things and mean a pause or separation).
- Prefer readable and idiomatic javascript output, which necessitates
  sticking fairly closely to javascript semantics. Switching cost from
  sibilant to directly editing the output javascript should be low.
- Prefer expressions to statements. This is the most notable exception
  to the adherance to idiomatic javascript. Self-executing functions
  are used extensively to this end.
- Allow as much of the language to be modified in-source as
  possible. This includes the ability to rename/remove/redefine all
  keywords and macros.
- Any language constructs that do not output readable javascript
  should be opt-in.
- Add language features slowly, and only when there's a real use
  case. Don't blindly implement Lisp features without reasoning
  through the need.
- Provide tools to simplify avoidance of repetition.

## Installation

For local dev:

    $ git clone git://github.com/jbr/sibilant.git
    $ npm link .
    $ sibilant src/*.sibilant -o lib
    $ sibilant -x test/test.sibilant # you're now running a sibilant you just compiled.

To have sibilant recompile on any change to its source:

    $ npx nodemon -e sibilant -w src -x sibilant src/*.sibilant -o lib

For use in our projects:

    $ npm i --save GowerStreet/sibilant # pulls from github, or local if you did npm link

## Hello world in the REPL

    $ sibilant
    sibilant> (+ 1 2)
    (1 + 2)
    result: 3
    sibilant> (console.log "hello world")
    console.log("hello world")
    hello world

## Try it before you install

[sibilant.org](http://sibilant.org) includes an in-browser
as-you-type sibilant compiler and tutorial, so you can get a sense of
the language without leaving your browser.

## Learning the language

The most up to date documentation is at
[sibilant.org](https://sibilant.org) and [docs.sibilant.org](https://docs.sibilant.org).
Also, check out [sibilant itself,
which is written 100% in
sibilant](http://github.com/jbr/sibilant/tree/master/src) to get a
sense of what's possible.

## License

Sibilant is released under the [MIT
license](http://github.com/jbr/sibilant/blob/master/LICENSE)
([wikipedia](http://en.wikipedia.org/wiki/MIT_License)).
