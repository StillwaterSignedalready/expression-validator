import { validateExp, parseTokens } from './expValidateUtil'

test('lexical analysis: simple plus', () => {
  const [v1, v2] = [1611, 32]
  const tokenList = parseTokens(`${v1} + ${v2}`);
  const [t0, t1, t2] = tokenList
  expect(t0.type).toBe('number');
  expect(t0.value).toBe(`${v1}`);
  expect(t1.type).toBe('operator');
  expect(t2.type).toBe('number');
  expect(t2.value).toBe(`${v2}`);
  expect(tokenList.length).toBe(3);
});

test('lexical analysis: bracket', () => {
  const tokenList = parseTokens(`11 + ( 22 + 33 )`);
  const [, , t2, , , , t6] = tokenList

  expect(t2.type).toBe('(');
  expect(t6.type).toBe(')');
});

test('lexical analysis: var', () => {
  const tokenList = parseTokens(`a + b`);
  const [t0, t1, t2] = tokenList
  expect(t0.type).toBe('var');
  expect(t0.value).toBe('a');
  expect(t1.type).toBe('operator');
  expect(t2.type).toBe('var');
  expect(t2.value).toBe('b');
});