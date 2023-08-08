
interface ValidateExpResult {
  isValid: boolean;
  message: string;
}

type TokenType = 'var' | 'operator' | 'number';
interface Token {
  type: TokenType;
  value: string;
}

type StateMachine = (char: string | Symbol) => StateMachine;

const numberReg = /^\d$/;
const operators = ['+', '-', '*', '/'];
const spaces = [' ', '\t', '\n'];

// lexical analysis: string -> tokens

export function parseTokens(inputExp: string): Token[] {
  let chars: string[] = [];
  const tokens: Token[] = [];

  // TODO: restart
  const start: StateMachine = (char) => {
    if (typeof char !== 'string') return start;
    if (numberReg.test(char)) {
      chars.push(char);
      return inNumber;
    } else if (operators.includes(char)) {
      emitToken('operator', char);
      return start;
    } else if (spaces.includes(char)) {
      return start;
    } else {
      // TODO:
      return start;
    }
  }
  
  const inNumber: StateMachine = (char) => {
    if (typeof char !== 'string') {
      emitToken('number', chars.join(''));
      return start;
    }
    if (numberReg.test(char)) {
      chars.push(char);
      return inNumber;
    } else if (operators.includes(char)) {
      emitToken('number', chars.join(''));
      return start(char);
    } else { // TODO: throw error if char is alpha
      emitToken('number', chars.join(''));
      return start;
    }
  }

  // TODO: add more states
  
  function emitToken(type: TokenType, value: string) {
    console.log('\n emmit: ', value);
    tokens.push({ type, value });
    chars = [];
  }
  let state: StateMachine = start;
  for (let i = 0; i < inputExp.length; i++) {
    const char = inputExp[i];
    console.log('char', char)
    state = state(char);
  }
  state(Symbol('EOF'));
  return tokens;
}


export const validateExp = (exp: string): ValidateExpResult => {

  return {
    isValid: false,
    message: 'column name is not valid'
  };
}