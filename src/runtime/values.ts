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
  name: string;
  parameters: string[];
  body: any; // AST node
  closure: Environment;
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
  name: string,
  parameters: string[],
  body: any,
  closure: Environment,
): FunctionValue {
  return {
    type: ValueType.Function,
    value: null,
    name,
    parameters,
    body,
    closure,
  };
}

/**
 * Environment for variable storage and scoping
 */
export class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;

  constructor(parent?: Environment) {
    this.parent = parent;
    this.variables = new Map();
  }

  /**
   * Declare a new variable in the current scope
   */
  declare(name: string, value: RuntimeValue): RuntimeValue {
    if (this.variables.has(name)) {
      throw new Error(`Variable '${name}' already declared in this scope`);
    }
    this.variables.set(name, value);
    return value;
  }

  /**
   * Assign a value to an existing variable
   */
  assign(name: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolve(name);
    env.variables.set(name, value);
    return value;
  }

  /**
   * Look up a variable value
   */
  lookup(name: string): RuntimeValue {
    const env = this.resolve(name);
    return env.variables.get(name)!;
  }

  /**
   * Resolve the environment containing the variable
   */
  resolve(name: string): Environment {
    if (this.variables.has(name)) {
      return this;
    }

    if (this.parent) {
      return this.parent.resolve(name);
    }

    throw new Error(`Undefined variable '${name}'`);
  }

  /**
   * Create a new child environment
   */
  extend(): Environment {
    return new Environment(this);
  }
}
