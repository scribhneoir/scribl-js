import {
  type RuntimeValue,
  ValueType,
  type BlockValue,
  type FunctionValue,
  makeVoid,
  makeBlock,
} from "./values.ts";
/**
 * Environment for variable storage and scoping
 */
export class Environment {
  private parent?: Environment;
  private variables: Map<string, { value: RuntimeValue; constant: boolean }>;

  constructor(parent?: Environment) {
    this.parent = parent;
    this.variables = new Map();
  }

  /**
   * Assign a variable
   */
  assign(name: string, value: RuntimeValue, constant = true): RuntimeValue {
    const env = this.resolve(name);
    if (env !== null) {
      const existing = env.variables.get(name)!;
      if (existing.constant) {
        throw new Error(`Variable '${name}' already declared in this scope`);
      }
      env.variables.set(name, { value, constant });
      return value;
    }
    this.variables.set(name, { value, constant });
    return value;
  }

  /**
   * Look up a variable value
   */
  lookup(name: string): { value: RuntimeValue; constant: boolean } {
    const env = this.resolve(name);
    if (env === null) {
      return { value: makeVoid(), constant: true };
    }
    return env.variables.get(name)!;
  }

  /**
   * Resolve the environment containing the variable
   */
  resolve(name: string): Environment | null {
    if (this.variables.has(name)) {
      return this;
    }

    if (this.parent) {
      return this.parent.resolve(name);
    }

    return null;
  }

  /**
   *
   */
  resolveMemberPath(path: string[], constant = true): Environment | null {
    if (path.length > 1) {
      const [_, ...nextPath] = path;
      const block = this.lookup(path[0]);
      if (block.value.type === ValueType.Void) {
        if (constant) {
          console.warn(
            `Attempting to to assign to nonexistant property ${path[0]} on constant shape`,
          );
          return null;
        } else {
          const newBlock = makeBlock(this.extend());
          this.assign(path[0], newBlock, false);
          return newBlock.environment.resolveMemberPath(nextPath, false);
        }
      }
      if (block.value.type !== ValueType.Block) {
        console.warn(
          `Attempting to assign to path that is not of type Block: ${path[0]}`,
        );
        return null;
      }
      return (block.value as BlockValue).environment.resolveMemberPath(
        nextPath,
        block.constant,
      );
    }
    const lookupRes = this.lookup(path[0]);
    if (lookupRes.value.type === ValueType.Void) {
      if (constant) {
        console.warn(
          `Attempting to assign to nonexistant property ${path[0]} on constant shape`,
        );
        return null;
      } else {
        return this;
      }
    }
    return this;
  }

  /**
   * Create a new child environment
   */
  extend(): Environment {
    return new Environment(this);
  }

  getAssignments() {
    let res: any = {};
    for (const [id, val] of this.variables.entries()) {
      const constant = val.constant;
      const rValue = val.value;

      switch (rValue.type) {
        case ValueType.Block:
          res[id] = (rValue as BlockValue).environment.getAssignments();
          break;
        case ValueType.Function:
          res[id] = {
            params: (rValue as FunctionValue).parameters.map((p) =>
              p.text.trim(),
            ),
            body: (rValue as FunctionValue).body.text.replace(/\s+/g, " "),
            constant,
          };
          break;
        default:
          res[id] = { value: rValue.value, constant };
      }
    }
    return res;
  }
}
