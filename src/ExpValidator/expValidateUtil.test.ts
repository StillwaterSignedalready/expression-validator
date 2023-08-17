import type { Token, ExpNode } from './expValidateUtil'
import { buildAst, calculateExp, calculateAst, parseTokens, inflateTokenList, expressionReduce } from './expValidateUtil'

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
  const tokenList = parseTokens(`11 + (22 - (33 + 9) * 44)`);
  const inflatedTokenList = inflateTokenList(tokenList)
  expect(inflatedTokenList.length).toBe(3);
});

test('lexical analysis: inflate parentheses ast', () => {
  const tokenList = parseTokens(`11 + (22 - (33 + 9) * 44)`);
  const inflatedTokenList = inflateTokenList(tokenList)
  const ast = expressionReduce(inflatedTokenList)

  expect(ast.children.length).toBe(3);
  const result = calculateAst(ast)
  expect(result).toBe(-1815);
});

test('calculate: calculate expression', () => {
  expect(calculateExp(' 1+1 ')).toBe(2);
  expect(calculateExp('2-1')).toBe(1);
  expect(calculateExp('9 - 8 * 11 /2 + 2')).toBe(-33);
  expect(calculateExp(' 5 * (100 + 99 / 3) ')).toBe(665);
  expect(calculateExp('(1+1)')).toBe(2);
  expect(calculateExp('(9 - 8 / 2 - 1 + ( 5 * (100 + 99 / 3) ) )')).toBe(669);
  
  expect(calculateExp('22')).toBe(22);
  expect(calculateExp('(1 + 1)*2')).toBe(4);
  expect(calculateExp('(9 - 1) * 11 * 1')).toBe(88);
  expect(calculateExp('(9 - 8 / 2 - 1 + ( 5 * (100 + 99 / 3) ) ) * 11 /2 + 2')).toBe(3681.5);
})

test('calculate: invalid expression', () => {
  expect(() => buildAst('1 +')).toThrowError('expect');
  expect(() => buildAst('1 ++')).toThrowError('after');
  expect(() => buildAst('1 **')).toThrowError('after');
  expect(() => buildAst('1 *-')).toThrowError('after');
  expect(() => buildAst('+ 99')).toThrowError('expect');
  expect(() => buildAst('+ 99')).toThrowError('expect');
  expect(() => buildAst('(((')).toThrowError('unexpected');
  expect(() => buildAst('1+1)')).toThrowError('unexpected');
  expect(() => buildAst('(9 - 8 / 2 - 1 + ( 5 * (100 + 99 / 3) ) )) * 11 /2 + 2')).toThrowError('unexpected');
  expect(() => buildAst('1+()')).toThrowError('unexpected');
  expect(() => buildAst('1+1(3-2)')).toThrowError('unexpected');
  expect(() => buildAst('11 22')).toThrowError('expect');
  // TODO: (2-3)3
})
// TODO: var
// TODO: test ast build by tokenList: complex