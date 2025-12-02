import Parser from "tree-sitter";
import {
  type RuntimeValue,
  type BlockValue,
  makeVoid,
  ValueType,
  makeBlock,
} from "../runtime/values.ts";

import { Environment } from "../runtime/environment.ts";

export class Interpreter {
  /**
   * Evaluate a syntax tree node
   */
  evaluate(node: Parser.SyntaxNode, env: Environment): RuntimeValue {
    switch (node.type) {
      case "block":
        return this.evaluateBlock(node, env);

      case "statement":
        return this.evaluateStatement(node, env);

      case "unary_expression":
        return this.evaluateUnaryExpression(node, env);

      case "binary_expression":
        return this.evaluateBinaryExpression(node, env);

      case "assignment_expression":
        return this.evaluateAssignmentExpression(node, env);

      case "member_expression":
        return this.evaluateMemberExpression(node, env);

      case "number":
        return this.evaluateNumberLiteral(node, env);

      case "string":
        return this.evaluateStringLiteral(node, env);

      case "boolean":
        return this.evaluateBooleanLiteral(node, env);

      case "identifier":
        return this.evaluateIdentifier(node, env);

      case "comment":
        return makeVoid();

      default:
        console.warn(`Unhandled node type: ${node.type}`);
        console.warn(`Node text: ${node.text}`);
        return makeVoid();
    }
  }

  private evaluateMemberExpression(
    node: Parser.SyntaxNode,
    env: Environment,
  ): RuntimeValue {
    const [lhe, _, rhe] = node.children;
    const lhValue = this.evaluate(lhe, env);
    if (lhValue.type !== ValueType.Block) {
      console.warn(
        `Left hand side of member expression is not a block: ${lhValue.type}}`,
      );
      return makeVoid();
    }
    return (lhValue as BlockValue).environment.lookup(rhe.text);
  }

  private evaluateBlock(
    node: Parser.SyntaxNode,
    env: Environment,
  ): RuntimeValue {
    let result = makeBlock(env.extend());
    for (const statement of node.children.filter(
      (child) => child.type === "statement",
    )) {
      this.evaluate(statement, result.environment);
    }

    return result;
  }

  private evaluateStatement(
    node: Parser.SyntaxNode,
    env: Environment,
  ): RuntimeValue {
    const expression = node.firstChild;
    if (expression) {
      return this.evaluate(expression, env);
    }
    return makeVoid();
  }

  private evaluateUnaryExpression(
    node: Parser.SyntaxNode,
    env: Environment,
  ): RuntimeValue {
    const [op, rhe] = node.children;
    if (!op || !rhe) {
      console.warn(`Missing children in unary expression: [${op}${rhe}]}`);
      return makeVoid();
    }
    const value = this.evaluate(rhe, env);

    switch (op.text) {
      case "!":
        return this.evaluateLogicalNotOp(value);
      case "~":
        return this.evaluateBitwiseNotOp(value);
      case "-":
        return this.evaluateNegationOp(value);

      default:
        console.warn(`Unhandled op in unary expression: ${op}}`);
        console.warn(`Node text: ${node.text}`);
        return makeVoid();
    }
  }

  private evaluateLogicalNotOp(value: RuntimeValue): RuntimeValue {
    if (value.type !== ValueType.Boolean) {
      console.warn(`Non boolean type in logical not op: ${value.type}`);
      return makeVoid();
    }
    return {
      ...value,
      value: !value.value,
    };
  }

  private evaluateNegationOp(value: RuntimeValue): RuntimeValue {
    if (value.type !== ValueType.Number) {
      console.warn(`Non number type in negation op: ${value.type}`);
      return makeVoid();
    }
    return {
      ...value,
      value: -value.value,
    };
  }

  private evaluateBitwiseNotOp(value: RuntimeValue): RuntimeValue {
    if (value.type !== ValueType.Number) {
      console.warn(`Non number type in bitwise not op: ${value.type}`);
      return makeVoid();
    }
    return {
      ...value,
      value: ~value.value,
    };
  }

  private evaluateBinaryExpression(
    node: Parser.SyntaxNode,
    env: Environment,
  ): RuntimeValue {
    const [lhe, op, rhe] = node.children;
    if (!lhe || !op || !rhe) {
      console.warn(
        `Missing children in binary expression: [${lhe},${op},${rhe}]}`,
      );
      return makeVoid();
    }
    const lhValue = this.evaluate(lhe, env);
    const rhValue = this.evaluate(rhe, env);

    switch (op.text) {
      case "&&":
        return this.evaluateLogicalAndOp(lhValue, rhValue);
      case "||":
        return this.evaluateLogicalOrOp(lhValue, rhValue);
      case ">>":
        return this.evaluateArithmeticShiftRightOp(lhValue, rhValue);
      case ">>>":
        return this.evaluateLogicalShiftRightOp(lhValue, rhValue);
      case "<<":
        return this.evaluateShiftLeftOp(lhValue, rhValue);
      case "&":
        return this.evaluateBitwiseAndOp(lhValue, rhValue);
      case "^":
        return this.evaluateBitwiseXorOp(lhValue, rhValue);
      case "|":
        return this.evaluateBitwiseOrOp(lhValue, rhValue);
      case "+":
        return this.evaluateAdditionOp(lhValue, rhValue);
      case "-":
        return this.evaluateSubtractionOp(lhValue, rhValue);
      case "*":
        return this.evaluateMultiplicationOp(lhValue, rhValue);
      case "/":
        return this.evaluateDivisionOp(lhValue, rhValue);
      case "%":
        return this.evaluateModulusOp(lhValue, rhValue);
      case "**":
        return this.evaluateExponentOp(lhValue, rhValue);
      case "<":
        return this.evaluateLessThanOp(lhValue, rhValue);
      case "<=":
        return this.evaluateLogicalOrOp(
          this.evaluateLessThanOp(lhValue, rhValue),
          this.evaluateEquivilanceOp(lhValue, rhValue),
        );
      case "==":
        return this.evaluateEquivilanceOp(lhValue, rhValue);
      case "!=":
        return this.evaluateLogicalNotOp(
          this.evaluateEquivilanceOp(lhValue, rhValue),
        );
      case ">=":
        return this.evaluateLogicalOrOp(
          this.evaluateGreaterThanOp(lhValue, rhValue),
          this.evaluateEquivilanceOp(lhValue, rhValue),
        );
      case ">":
        return this.evaluateGreaterThanOp(lhValue, rhValue);
      case "??":
        this.evaluateTernaryOp(lhValue, rhValue);

      default:
        console.warn(`Unhandled op in binary expression: ${op}}`);
        console.warn(`Node text: ${node.text}`);
        return makeVoid();
    }
  }

  private evaluateLogicalAndOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Boolean ||
      rhValue.type !== ValueType.Boolean
    ) {
      console.warn(
        `Missmatching types in logical and op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value && rhValue.value,
      type: ValueType.Boolean,
    };
  }

  private evaluateLogicalOrOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Boolean ||
      rhValue.type !== ValueType.Boolean
    ) {
      console.warn(
        `Missmatching types in logical and op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value || rhValue.value,
      type: ValueType.Boolean,
    };
  }

  private evaluateArithmeticShiftRightOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in arithmetic shift right op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value >> rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateLogicalShiftRightOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in logical shift right op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value >>> rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateShiftLeftOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in shift left op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value << rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateBitwiseAndOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in bitwise and op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value & rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateBitwiseXorOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in bitwise xor op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value ^ rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateBitwiseOrOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in bitwise or op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value | rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateAdditionOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (lhValue.type !== rhValue.type) {
      console.warn(
        `Missmatching types in binary addition: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    switch (lhValue.type) {
      case ValueType.Number:
        return {
          value: lhValue.value + rhValue.value,
          type: ValueType.Number,
        };
      case ValueType.String:
        return {
          value: `${lhValue.value}${rhValue.value}`,
          type: ValueType.String,
        };
      default:
        console.warn(`Unhandled type in binary addition: ${lhValue.type}}`);
        return makeVoid();
    }
  }

  private evaluateSubtractionOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in subtraction op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value - rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateMultiplicationOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in multiplication op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value * rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateDivisionOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in division op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value / rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateModulusOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in modulus op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value % rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateExponentOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (
      lhValue.type !== ValueType.Number ||
      rhValue.type !== ValueType.Number
    ) {
      console.warn(
        `Missmatching types in exponent op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }

    return {
      value: lhValue.value ** rhValue.value,
      type: ValueType.Number,
    };
  }

  private evaluateLessThanOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (lhValue.type !== rhValue.type) {
      console.warn(
        `Missmatching types in less than op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }
    return {
      value: lhValue.value < rhValue.value,
      type: ValueType.Boolean,
    };
  }

  private evaluateGreaterThanOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (lhValue.type !== rhValue.type) {
      console.warn(
        `Missmatching types in less than op: [${lhValue.type},${rhValue.type}]}`,
      );
      return makeVoid();
    }
    return {
      value: lhValue.value > rhValue.value,
      type: ValueType.Boolean,
    };
  }

  private evaluateEquivilanceOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (lhValue.type !== rhValue.type) {
      return {
        value: false,
        type: ValueType.Boolean,
      };
    }
    return {
      value: lhValue.value === rhValue.value,
      type: ValueType.Boolean,
    };
  }

  private evaluateTernaryOp(
    lhValue: RuntimeValue,
    rhValue: RuntimeValue,
  ): RuntimeValue {
    if (lhValue.type === ValueType.Void || lhValue.value === false) {
      return rhValue;
    }
    return lhValue;
  }

  private evaluateAssignmentExpression(
    node: Parser.SyntaxNode,
    env: Environment,
  ): RuntimeValue {
    const [lhNode, op, rhe] = node.children;
    if (!lhNode || !op || !rhe) {
      console.warn(
        `Missing children in assignment expression: [${lhNode},${op},${rhe}]}`,
      );
      return makeVoid();
    }

    const constantAssignment = op.text.includes("=");

    //TODO: handle binary op assignments (ie +=)

    const rhValue = this.evaluate(rhe, env);

    //TODO: destructure from block
    // TODO: destructure from itterator
    switch (lhNode.type) {
      case "identifier":
        return env.assign(lhNode.text, { ...rhValue }, constantAssignment);
      case "member_expression":
        const path = lhNode.text.split(".");
        const nestedEnv = env.resolveMemberPath(path);
        return nestedEnv?.assign(path.at(-1) ?? "", rhValue).value;
      default:
        return makeVoid();
    }
  }

  private evaluateNumberLiteral(
    node: Parser.SyntaxNode,
    _: Environment,
  ): RuntimeValue {
    const value = Number(node.text);
    if (isNaN(value)) {
      //error
    }
    return { type: ValueType.Number, value };
  }

  private evaluateStringLiteral(
    node: Parser.SyntaxNode,
    _: Environment,
  ): RuntimeValue {
    const value = String(node.text);
    return { type: ValueType.String, value };
  }

  private evaluateIdentifier(
    node: Parser.SyntaxNode,
    env: Environment,
  ): RuntimeValue {
    const id = node.text;
    return env.lookup(id).value;
  }

  private evaluateBooleanLiteral(
    node: Parser.SyntaxNode,
    _: Environment,
  ): RuntimeValue {
    const value = node.text == "true";
    return { type: ValueType.Boolean, value };
  }
}
