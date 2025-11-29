import { describe, it, expect } from "vitest";
import { Interpreter } from "./interpreter.ts";
import { createGlobalEnvironment } from "../runtime/environment.ts";
import { parseScribl } from "../parser/parser.ts";

describe("Interpreter", () => {
  const interpreter = new Interpreter();

  it("should parse and evaluate simple literals", async () => {
    const env = createGlobalEnvironment();

    // TODO: Uncomment and implement as you add features
    // const tree = await parseScribl('42;');
    // const result = interpreter.evaluate(tree.rootNode, env);
    // expect(result.type).toBe('number');
    // expect(result.value).toBe(42);
  });

  it("should handle arithmetic expressions", async () => {
    const env = createGlobalEnvironment();

    // TODO: Implement
    // const tree = await parseScribl('1 + 2;');
    // const result = interpreter.evaluate(tree.rootNode, env);
    // expect(result.value).toBe(3);
  });

  it("should handle string literals", async () => {
    const env = createGlobalEnvironment();

    // TODO: Implement
    // const tree = await parseScribl("'hello';");
    // const result = interpreter.evaluate(tree.rootNode, env);
    // expect(result.value).toBe('hello');
  });

  // TODO: Add more tests as you implement features
});
