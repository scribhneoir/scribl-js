# Scribl-JS

An interpreter for the Scribl toy language, built with TypeScript and Tree-sitter.

## Setup

```bash
git clone https://github.com/scribhneoir/scribl-js.git
pnpm i
```

## Usage

```bash
# Run in development mode
pnpm run dev examples/hello.scribl
```

## Development

### Parser Development

The [tree-sitter-scribl](https://github.com/scribhneoir/tree-sitter-scribl) parser is included as a git submodule: `tree-sitter-scribl/grammar.js`. There are convenience scripts in this project's root to aid in development.

```bash
# After grammar changes - clean rebuild
pnpm run parser:build

# Test the parser
pnpm run parser:test

# Generate grammar only
pnpm run parser:generate
```

### Main Project Development

```bash
# Type check
pnpm run type-check

# Run tests
pnpm test
```

## Project Structure

```
scribl-js/
├── src/                      # TypeScript source code
│   ├── parser/              # Tree-sitter parser integration
│   │   └── index.ts         # Parser loading and utilities
│   ├── interpreter/         # Interpreter implementation (scaffold)
│   │   └── interpreter.ts   # Main interpreter class
│   ├── runtime/             # Runtime environment and values
│   │   ├── values.ts        # Runtime value types
│   │   └── environment.ts   # Variable scoping
│   ├── index.ts             # Main entry point
├── tree-sitter-scribl/      # Git submodule with Scribl grammar
├── examples/                # Example Scribl programs
│   └── hello.scribl         # Simple example
├── package.json             # Project configuration
└── tsconfig.json            # TypeScript configuration
```

## Scribl Grammar Overview

Based on [tree-sitter-scribl](https://github.com/scribhneoir/tree-sitter-scribl), the language supports:

### Literals
- Numbers: `42`, `3.14`, `0xFF`, `0o77`, `0b1010`
- Strings: `'single quoted'`
- Template strings: `"Hello ${name}"`
- Booleans: `true`, `false`
- Void: `void`

### Data Structures
- Arrays (iterators): `[1, 2, 3]`
- Blocks: `{ statement1; statement2; }`

### Functions
- Anonymous functions: `(x, y) { x + y; }`
- Function calls: `func(arg1, arg2)`

### Operators
- Arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
- Comparison: `<`, `<=`, `>`, `>=`, `==`, `!=`
- Logical: `&&`, `||`
- Bitwise: `&`, `|`, `^`, `<<`, `>>`, `>>>`
- Ternary: `??`
- Unary: `!`, `~`, `-`
- Assignment: `=`, `:`
- TODO: Spread: `...`

### Advanced Features
- Member access: `obj.property`
- Subscript access: `arr[index]`
- TODO: Destructuring: `{a, b} = obj`, `[x, y] = arr`

### Syntax Notes
- Statements must end with semicolons `;`
- Comments: `// single line` and `/* multi-line */`
