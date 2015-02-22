# Status [![Build Status](https://travis-ci.org/tildeio/htmlbars.png)](https://travis-ci.org/tildeio/htmlbars)

[![Join the chat at https://gitter.im/mmun/htmlbars](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mmun/htmlbars?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

HTMLBars is a layer built on top of the Handlebars template compiler.

# Goals

The goal of HTMLBars is to have a compiler for Handlebars that
builds a DOM rather than a String.

This means that helpers can have special behavior based on their
context (they know if they are inside an `<a>` tag, inside an
attribute, etc.)

Ultimately, the goal is to have a good data binding setup for
Handlebars that can work directly against DOM nodes and doesn't
need special tags in the String for the data binding code to work
(a major limitation in Ember).

There are also many performance gains in HTMLBars' approach to building
DOM vs the HTML-unaware string building approach of Handlebars.

# Usage

TODO: much change. This section will be updated shortly.

Until then, check out [ARCHITECTURE.md](ARCHITECTURE.md) for
info on how HTMLBars is structured and its approach to efficiently building / emitting DOM.

# Building HTMLBars

1. Ensure that [Node.js](http://nodejs.org/) is installed.
2. Run `npm install` to ensure the required dependencies are installed.
3. Run `npm run-script build` to build HTMLBars. The builds will be placed in the `dist/` directory.

# How to Run Tests

## In Node

1. Run `npm test`.

## In the browser

1. Run `npm start`.
2. Visit <http://localhost:4200/test>.