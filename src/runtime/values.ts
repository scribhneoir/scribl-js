import type { Environment } from "./environment";
import Parser from "tree-sitter";

/**
 * Runtime value types for the Scribl interpreter
 */

export const ValueType = {
  Void: "void",
  Number: "number",
  String: "string",
  Boolean: "boolean",
  Function: "function",
  Block: "block",
} as const;
export type ValueType = (typeof ValueType)[keyof typeof ValueType];

export interface RuntimeValue {
  type: ValueType;
  value: any;
}

export interface VoidValue extends RuntimeValue {
  type: typeof ValueType.Void;
  value: null;
}

export interface NumberValue extends RuntimeValue {
  type: typeof ValueType.Number;
  value: number;
}

export interface StringValue extends RuntimeValue {
  type: typeof ValueType.String;
  value: string;
}

export interface BooleanValue extends RuntimeValue {
  type: typeof ValueType.Boolean;
  value: boolean;
}

export interface BlockValue extends RuntimeValue {
  type: typeof ValueType.Block;
  environment: Environment;
}

export type FunctionCall = (
  args: RuntimeValue[],
  env: Environment,
) => RuntimeValue;

export interface FunctionValue extends RuntimeValue {
  type: typeof ValueType.Function;
  parameters: Parser.SyntaxNode[];
  body: Parser.SyntaxNode; // AST node
  environment: Environment;
}

// Helper functions to create runtime values
export function makeVoid(): VoidValue {
  return { type: ValueType.Void, value: null };
}

export function makeNumber(value: number): NumberValue {
  return { type: ValueType.Number, value };
}

export function makeString(value: string): StringValue {
  return { type: ValueType.String, value };
}

export function makeBoolean(value: boolean): BooleanValue {
  return { type: ValueType.Boolean, value };
}

export function makeBlock(environment: Environment): BlockValue {
  return { type: ValueType.Block, value: null, environment };
}

export function makeFunction(
  parameters: Parser.SyntaxNode[],
  body: Parser.SyntaxNode,
  environment: Environment,
): FunctionValue {
  return {
    type: ValueType.Function,
    value: null,
    parameters,
    body,
    environment,
  };
}
