
interface ValidateExpResult {
  isValid: boolean;
  message: string;
}

type TokenType = 'var' | 'number' | '(' | ')' | '+' | '-' | '*' | '/';
export interface Token {
  type: TokenType;
  value: string;
}
type ExpType = 'AdditiveExpression' | 'MultiplicativeExpression';
export interface ExpNode {
  type: ExpType;
  children: (ExpNode | Token)[];
}

type StateMachine = (char: string | Symbol) => StateMachine;

const numberReg = /^\d$/;
const alphaReg = /^([a-z]|[A-Z])+$/;
const additiveOperators = ['+', '-'];
const multiplicativeOperators = ['*', '/'];
const operators = [...additiveOperators, ...multiplicativeOperators];
const spaces = [' ', '\t', '\n'];

// lexical analysis: string -> tokens

export function parseTokens(inputExp: string): Token[] {
  let chars: string[] = [];
  const tokens: Token[] = [];

  const restart: StateMachine = (char) => {
    if (typeof char !== 'string') return restart;
    if (numberReg.test(char)) {
      chars.push(char);
      return inNumber;
    } else if (additiveOperators.includes(char)) {
      emitToken(char as ('+'|'-'), char);
      return restart;
    } else if (multiplicativeOperators.includes(char)) {
      emitToken(char as ('*'|'/'), char);
      return restart;
    } else if (spaces.includes(char)) {
      return restart;
    } else if (char === '(') {
      emitToken('(', '');
      return restart;
    } else if (char === ')') {
      emitToken(')', '');
      return restart;
    } else if (alphaReg.test(char)) {
      chars.push(char);
      return inVar;
    } else {
      throw new Error(`invalid char: ${char}`);
    }
  }

  const inVar: StateMachine = (char) => {
    if (typeof char !== 'string') {
      emitToken('var', chars.join(''));
      return restart;
    }
    if (alphaReg.test(char) || numberReg.test(char)) {
      chars.push(char);
      return inVar;
    } else if (operators.includes(char)) {
      emitToken('var', chars.join(''));
      return restart(char);
    } else if (spaces.includes(char)) {
      emitToken('var', chars.join(''));
      return restart;
    } else { // TODO: index
      throw new Error(`invalid char: ${char}`);
    }
  }
  const inNumber: StateMachine = (char) => {
    if (typeof char !== 'string') {
      emitToken('number', chars.join(''));
      return restart;
    }
    if (numberReg.test(char)) {
      chars.push(char);
      return inNumber;
    } else if (operators.includes(char)) {
      emitToken('number', chars.join(''));
      return restart(char);
    } else if (char === '(') {
      emitToken('(', '');
      return restart;
    } else if (char === ')') {
      emitToken('number', chars.join(''));
      emitToken(')', '');
      return restart;
    } else { // TODO: throw error if char is alpha
      emitToken('number', chars.join(''));
      return restart;
    }
  }

  // TODO: add more states

  function emitToken(type: TokenType, value: string) {
    tokens.push({ type, value });
    chars = [];
  }
  let state: StateMachine = restart;
  for (let i = 0; i < inputExp.length; i++) {
    const char = inputExp[i];
    state = state(char);
  }
  state(Symbol('EOF'));

  return tokens;
}

type InflatedTokenList = (Token | InflatedTokenList)[];

export function inflateTokenList(tokens: Token[]): InflatedTokenList {
  const stacks: InflatedTokenList[] = [[]];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === '(') {
      const newTopStack: Token[] = [];
      stacks.push(newTopStack);
    } else if (token.type === ')') {
      const topStack = stacks.pop();
      if (!topStack) throw new Error('invalid token list');
      stacks[stacks.length - 1]?.push(topStack as InflatedTokenList);
    } else {
      stacks[stacks.length - 1]?.push(token);
    }
  }
  if(stacks.length !== 1) throw new Error('invalid token list')
  return stacks[0];
}

/*
 * <Expression> ::= 
 *  <AdditiveExpression><EOF>
 * <AdditiveExpression> ::= 
 *   <MultiplicativeExpression>
 *   |
 *   <AdditiveExpression><+><MultiplicativeExpression>
 *   |
 *   <AdditiveExpression><-><MultiplicativeExpression>
 * <MultiplicativeExpression> ::= 
 *  <Number>
 *  |
 *  <MultiplicativeExpression><*><Number>
 *  |
 *  <MultiplicativeExpression></><Number>
 */
// TODO: parentheses
export function expressionReduce(source: (Token | ExpNode | InflatedTokenList)[]): ExpNode {
  if (Array.isArray(source[0])) {
    source[0] = expressionReduce(source[0]);
    return expressionReduce(source);
  }
  // final
  if (source[0].type === 'AdditiveExpression' && !source[1]) {
    return source[0];
  }
  additiveExpressionReduce(source);
  return expressionReduce(source);

}
// greedy reduce to AdditiveExpression
function additiveExpressionReduce(source: (Token | ExpNode | InflatedTokenList)[]): ExpNode {
  if (Array.isArray(source[0])) {
    const node: ExpNode = {
      type: "AdditiveExpression",
      children: [expressionReduce(source[0])]
    }
    source[0] = node
    return additiveExpressionReduce(source);
  }
  if (source[0].type === "MultiplicativeExpression") { // 这时 source[1] 一定不是*/
    const node: ExpNode = {
      type: "AdditiveExpression",
      children: [source[0]]
    }
    source[0] = node;
    return additiveExpressionReduce(source);
  }

  if (source[0].type === "AdditiveExpression" && additiveOperators.includes((source[1] as any)?.type)) {
    const node: ExpNode = {
      type: "AdditiveExpression",
      // operator: "+",
      children: []
    }
    node.children.push(source.shift() as ExpNode); // AdditiveExpression
    // TODO: check if source[0] is a valid operator
    node.children.push(source.shift() as Token); // operator
    multiplicativeExpressionReduce(source);
    node.children.push(source.shift() as ExpNode); // MultiplicativeExpression, because multiplicativeExpression will push a MultiplicativeExpression node to source
    source.unshift(node);
    return additiveExpressionReduce(source);
  }

  if (source[0].type === "AdditiveExpression") // right end of this AdditiveExpression
    return source[0];

  multiplicativeExpressionReduce(source);
  return additiveExpressionReduce(source);
}

// greedy reduce to MultiplicativeExpression
function multiplicativeExpressionReduce(source: (Token | ExpNode | InflatedTokenList)[]): ExpNode {
  if (Array.isArray(source[0])) {
    const node: ExpNode = {
      type: "MultiplicativeExpression",
      children: [expressionReduce(source[0])]
    }
    source[0] = node
    return multiplicativeExpressionReduce(source);
  }
  if (source[0].type === 'number') { // 起点
    let node: ExpNode = {
      type: "MultiplicativeExpression",
      children: [source[0]]
    }
    source[0] = node;
    return multiplicativeExpressionReduce(source);
  }
  if (source[0].type === "MultiplicativeExpression" && multiplicativeOperators.includes((source[1] as any)?.type)) {
    let node: ExpNode = {
      type: "MultiplicativeExpression",
      // operator: "*",
      children: []
    }
    node.children.push(source.shift() as ExpNode);
    node.children.push(source.shift() as Token);
    node.children.push(source.shift() as ExpNode | Token);
    source.unshift(node);
    return multiplicativeExpressionReduce(source);
  }
  if (source[0].type === "MultiplicativeExpression")
    return source[0];

  return multiplicativeExpressionReduce(source);
}


export const validateExp = (exp: string): ValidateExpResult => {

  return {
    isValid: false,
    message: 'column name is not valid'
  };
}
