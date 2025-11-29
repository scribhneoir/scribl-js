#!/usr/bin/env node

import { parseScriblFile } from "./parser/parser.ts";
import { Interpreter } from "./interpreter/interpreter.ts";
import { resolve } from "path";
import { Environment } from "./runtime/values.ts";

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
    console.log(`Parsing ${filePath}...`);
    const tree = await parseScriblFile(filePath);

    // Check for parse errors
    if (tree.rootNode.hasError) {
      console.error("Parse errors detected:");
      console.error(tree.rootNode.toString());
      process.exit(1);
    }

    console.log("Parse tree:");
    console.log(tree.rootNode.toString());
    console.log("");

    // Create interpreter and global environment
    const interpreter = new Interpreter();
    const env = new Environment();

    // Execute the program
    console.log("Executing...\n");
    const result = interpreter.evaluate(tree.rootNode, env);
    console.log("\nResult:", result);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
