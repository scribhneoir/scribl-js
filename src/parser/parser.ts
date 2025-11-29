import Parser from "tree-sitter";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let scriblLanguage: any = null;

/**
 * Load the Scribl language parser
 */
export async function loadScriblLanguage(): Promise<any> {
  if (scriblLanguage) {
    return scriblLanguage;
  }

  try {
    // Try to load the compiled parser from the tree-sitter-scribl submodule
    // The parser should be built with: cd tree-sitter-scribl && pnpm install && pnpm run build
    const parserPath = join(__dirname, "../../tree-sitter-scribl");
    scriblLanguage = require(parserPath);
    return scriblLanguage;
  } catch (error) {
    throw new Error(
      'Failed to load Scribl parser. Did you run "pnpm run build:parser"?\n' +
        "Run: cd tree-sitter-scribl && pnpm install && pnpm run build\n" +
        `Error: ${error}`
    );
  }
}

/**
 * Parse Scribl source code and return the syntax tree
 */
export async function parseScribl(sourceCode: string): Promise<Parser.Tree> {
  const parser = new Parser();
  const language = await loadScriblLanguage();
  parser.setLanguage(language);

  const tree = parser.parse(sourceCode);
  return tree;
}

/**
 * Parse a Scribl file and return the syntax tree
 */
export async function parseScriblFile(filePath: string): Promise<Parser.Tree> {
  const sourceCode = readFileSync(filePath, "utf-8");
  return parseScribl(sourceCode);
}

export { Parser };
