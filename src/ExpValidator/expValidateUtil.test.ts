import { validateExp, parseTokens } from './expValidateUtil'

test('lexical analysis', () => {
  console.log('first test');
  const tokenList = parseTokens('1+2');
  console.log('tokenList', tokenList)
  const [t0, t1, t2] = tokenList
  expect(t0.type).toBe('number');
  expect(t1.type).toBe('operator');
  expect(t2.type).toBe('number');
  expect(tokenList.length).toBe(3);
});