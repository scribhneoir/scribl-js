# Scribl-JS

An interpreter for the Scribl toy language, built with TypeScript and Tree-sitter.

## Setup

```bash
# Clone with submodules
git clone --recurse-submodules <your-repo-url>

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Install dependencies
pnpm install

# Build the tree-sitter parser (required before running)
pnpm run build:parser

# Build the interpreter
pnpm run build
```

Or use the convenience script:
```bash
pnpm run setup
```

## Usage

```bash
# Run in development mode
pnpm run dev examples/hello.scribl

# Run compiled version
pnpm run build
pnpm start examples/hello.scribl
```

## Development

### Parser Development

When working on the grammar (`tree-sitter-scribl/grammar.js`):

```bash
# After grammar changes - clean rebuild (recommended)
pnpm run build:parser:clean

# Regular rebuild (minor changes)
pnpm run build:parser

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
│   └── cli.ts               # CLI utilities
├── tree-sitter-scribl/      # Git submodule with Scribl grammar
├── examples/                # Example Scribl programs
│   └── hello.scribl         # Simple example
├── binding.gyp              # Node.js native binding config
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
- Unary: `!`, `~`, `-`
- Assignment: `=`, `:`
- Spread: `...`

### Advanced Features
- Member access: `obj.property`
- Subscript access: `arr[index]`
- Destructuring: `{a, b} = obj`, `[x, y] = arr`

### Syntax Notes
- Statements must end with semicolons (`;`)
- Comments: `// single line` and `/* multi-line */`

## Parser Build Troubleshooting

If you encounter issues with the parser not recognizing new grammar features:

1. **Clean rebuild**: `pnpm run build:parser:clean`
2. **Verify tests**: `pnpm run parser:test`
3. **Check generated files**: Ensure `tree-sitter-scribl/src/parser.c` exists and is recent

The key difference between build commands:
- `build:parser`: Regular rebuild, faster but may not catch all changes
- `build:parser:clean`: Removes all generated files and rebuilds from scratch (use after grammar changes)

## Implementing the Interpreter

The scaffold provides:

1. **Parser Integration** (`src/parser/`): Ready-to-use tree-sitter parser
2. **Runtime Values** (`src/runtime/values.ts`): Type system for runtime values
3. **Environment** (`src/runtime/environment.ts`): Variable scoping and built-ins
4. **Interpreter Skeleton** (`src/interpreter/interpreter.ts`): Evaluation framework

To implement the interpreter, add evaluation logic in `src/interpreter/interpreter.ts` for each node type from the grammar. The main `evaluate()` method dispatches based on `node.type`.

## License

MIT

