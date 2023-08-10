import type { Token, ExpNode } from './expValidateUtil'
import { parseTokens, inflateTokenList, expressionReduce } from './expValidateUtil'

test('lexical analysis: simple plus', () => {
  const [v1, v2] = [1611, 32]
  const tokenList = parseTokens(`${v1} + ${v2}`);
  const [t0, t1, t2] = tokenList
  expect(t0.type).toBe('number');
  expect(t0.value).toBe(`${v1}`);
  expect(t1.type).toBe('+');
  expect(t2.type).toBe('number');
  expect(t2.value).toBe(`${v2}`);
  expect(tokenList.length).toBe(3);
});

test('lexical analysis: with parentheses', () => {
  const [v1, v2, v3] = [1611, 32, 111]
  const tokenList = parseTokens(`${v1} + (${v2} - ${v3})`);
  const [tv1, , tp1, , , , tp2] = tokenList

  expect(tokenList.length).toBe(7);
  expect(tv1.type).toBe('number');
  expect(tv1.value).toBe(`${v1}`);
  expect(tp1.type).toBe('(');
  expect(tp2.type).toBe(')');
});

test('lexical analysis: bracket', () => {
  const tokenList = parseTokens(`11 + ( 22 + 33 )`);
  const [, , t2, , , , t6] = tokenList

  expect(t2.type).toBe('(');
  expect(t6.type).toBe(')');
});

test('lexical analysis: var', () => {
  const tokenList = parseTokens(`a - b`);
  const [t0, t1, t2] = tokenList
  expect(t0.type).toBe('var');
  expect(t0.value).toBe('a');
  expect(t1.type).toBe('-');
  expect(t2.type).toBe('var');
  expect(t2.value).toBe('b');
});

function newToken(type: Token['type'], value: Token['value']): Token {
  return { type, value };
}

test('ast build by tokenList: simple', () => {
  const tokenList: Token[] = [
    newToken('number', '11'),
    newToken('+', '+'),
    newToken('number', '22'),
    newToken('*', '*'),
    newToken('number', '33'),
  ]
  const ast = expressionReduce(tokenList)
  const [item0, item1, item2] = ast.children

  expect(ast.type).toBe('AdditiveExpression');
  expect(ast.children.length).toBe(3);
  expect((item0 as ExpNode).children.length).toBe(1);
  expect((item1 as Token).type).toBe('+');
  expect((item2 as ExpNode).children.length).toBe(3);
})

test('lexical analysis: inflate parentheses exp', () => {
  const [v1, v2, v3] = [1611, 32, 111]
  const tokenList = parseTokens(`${v1} + (${v2} - ${v3})`);
  console.log('tokenList', tokenList)
  const inflatedTokenList = inflateTokenList(tokenList)
  console.log('inflatedTokenList', inflatedTokenList)
  expect(inflatedTokenList.length).toBe(3);
});

// TODO: parentheses in ast

// TODO: var
// TODO: test ast build by tokenList: complex