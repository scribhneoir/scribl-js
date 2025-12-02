#!/usr/bin/env node
import { styleText } from "node:util";
import { parseScriblFile } from "./parser/parser.ts";
import { Interpreter } from "./interpreter/interpreter.ts";
import { resolve } from "path";
import type { BlockValue } from "./runtime/values.ts";
import { Environment } from "./runtime/environment.ts";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: scribl-js <file.scribl>");
    console.error("");
    console.error("Example:");
    console.error("  pnpm run dev examples/hello.scribl");
    process.exit(1);
  }

  const filePath = resolve(args[0]);

  try {
    // Parse the source file
    console.log(
      styleText(["bgYellow", "black", "bold"], `Parsing:`) +
        styleText(["yellow", "italic"], ` ${filePath}...\n`),
    );
    const tree = await parseScriblFile(filePath);

    // Check for parse errors
    if (tree.rootNode.hasError) {
      console.error(styleText(["red", "bold"], "Parse errors detected:"));
      console.error(styleText(["red", "italic"], tree.rootNode.toString()));
      process.exit(1);
    }

    console.log(styleText(["bgYellow", "black", "bold"], "Parse tree:"));
    console.log(styleText(["yellow", "italic"], tree.rootNode.toString()));
    console.log("");

    // Create interpreter and global environment
    const interpreter = new Interpreter();
    const env = new Environment();

    // Execute the program
    const result = interpreter.evaluate(tree.rootNode, env) as BlockValue;
    console.log(styleText(["bgGreen", "black", "bold"], "Result:"));
    console.log(
      styleText(
        ["green", "italic"],
        JSON.stringify(result.environment.getAssignments(), null, 2),
      ),
    );
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
