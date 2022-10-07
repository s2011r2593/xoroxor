const instruction = require('./instructions');
const register = require('./registers');

const regex0 = / |\[/;
const regex1 = /\]/;

class Parser {
  constructor(write, addressFloor) {
    this.write = write;
    this.floor = addressFloor;
  }

  process(programString, callback) {
    // console.log(programString);
    let state = {
      running: true,
      expect: 'op',
      curOp: [],
      argType: '',
      column: 0,
      displacement: 1,
      opIndex: this.floor,
      programIndex: this.floor,
    }

    while (state.running) {
      switch(state.expect) {
        case 'op':
          let operation = programString.substring(state.column, state.column + 3);
          if (operation === 'eof') {
            this.write[state.programIndex] = instruction.stop;
            state.running = false;
          }
          state.curOp.push(operation);
          state.programIndex++;
          state.expect = 'arg';
          state.column += 4;
          break;
        case 'arg':
          switch(programString[state.column]) {
            case '%':
              let reg = programString.substring(state.column + 1, state.column + 4);
              this.write[state.programIndex++] = register.index[reg];
              state.curOp.push('r');
              state.column += 4;
              break;
            case '$':
              let imm = '';
              while (!regex0.test(programString[state.column])) {
                imm += programString[state.column];
                state.column++;
              }
              imm = imm.substring(1).padStart(4, '0');
              this.write[state.programIndex++] = parseInt(imm.substring(0,2), 16);
              this.write[state.programIndex++] = parseInt(imm.substring(2), 16);
              if (programString[state.column] === ' ') {
                state.curOp.push('l');
                break;
              }
              state.displacement = 0;
            case '[':
              state.curOp.push('m');
              if (state.displacement) {
                this.write[state.programIndex++] = 0;
                this.write[state.programIndex++] = 0;
              }
              let i = 1;
              do {
                i++;
              } while (!regex1.test(programString[state.column + i]));
              let pointer = programString.substring(state.column, state.column + i);
              let rc = pointer.replace(/[^%]/g, '').length;
              let cc = pointer.replace(/[^,]/g, '').length * 3;
              let r0, r1, s;
              switch(rc + cc) {
                case 0: // []
                  this.write[state.programIndex++] = 0;
                  this.write[state.programIndex++] = 0;
                  this.write[state.programIndex++] = 0;
                  break;
                case 1: // [%reg]
                  r0 = programString.substring(state.column + 2, state.column + 5)
                  this.write[state.programIndex++] = register.index[r0];
                  this.write[state.programIndex++] = 0;
                  this.write[state.programIndex++] = 0;
                  break;
                case 4: // [,%reg]
                  r1 = programString.subString(state.column + 3, state.column + 6);
                  this.write[state.programIndex++] = 0;
                  this.write[state.programIndex++] = register.index[r1];
                  this.write[state.programIndex++] = 0;
                  break;
                case 5: // [%reg,%reg]
                  r0 = programString.substring(state.column + 2, state.column + 5);
                  r1 = programString.substring(state.column + 7, state.column + 10);
                  this.write[state.programIndex++] = register.index[r0];
                  this.write[state.programIndex++] = register.index[r1];
                  this.write[state.programIndex++] = 0;
                  break;
                case 7: // [,%reg,$imm]
                  r1 = programString.substring(state.column + 3, state.column + 6);
                  s = parseInt(programString.substring(state.column + 8, state.column + i), 16);
                  this.write[state.programIndex++] = 0;
                  this.write[state.programIndex++] = register.index[r1];
                  this.write[state.programIndex++] = s;
                  break;
                case 8: // [%reg,%reg,$imm]
                  r0 = programString.substring(state.column + 2, state.column + 5);
                  r1 = programString.substring(state.column + 7, state.column + 10);
                  s = parseInt(programString.substring(state.column + 12, state.column + i), 16);
                  this.write[state.programIndex++] = register.index[r0];
                  this.write[state.programIndex++] = register.index[r1];
                  this.write[state.programIndex++] = s;
                  break;
                default:
                  console.log('no');
                  break;
              }
              state.column += i;
              break;
            case ';':
              let inst = state.curOp[0];
              switch(state.curOp[0]) {
                case 'mov':
                  inst = `mv${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'psh':
                  inst += state.curOp[1];
                  break;
                case 'pop':
                  inst += state.curOp[1];
                  break;
                case 'lea':
                  inst += state.curOp[1];
                  break;
                case 'add':
                  inst = `ad${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'sub':
                  inst = `mn${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'mul':
                  inst = `im${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'div':
                  inst = `id${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'and':
                  inst = `an${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'orr':
                  inst = `or${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'xor':
                  inst = `xr${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'not':
                  inst += state.curOp[1];
                  break;
                case 'sll':
                  inst = `sl${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'slr':
                  inst = `sr${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'sar':
                  inst = `sa${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'cmp':
                  inst = `cp${state.curOp[1]}${state.curOp[2]}`;
                  break;
                case 'jmp':
                  inst = 'jump';
                  break;
                case 'jeq':
                  inst = 'jpeq';
                  break;
                case 'jne':
                  inst = 'jpne';
                  break;
                case 'jlt':
                  inst = 'jplt';
                  break;
                case 'jgt':
                  inst = 'jpgt';
                  break;
                case 'jlq':
                  inst = 'jplq';
                  break;
                case 'jgq':
                  inst = 'jpgq';
                  break;
                case 'cll':
                  inst = 'call';
                  break;
                case 'ret':
                  break;
                case 'eof':
                  inst = 'stop';
                  break;
                default:
                  inst = 'noop';
                  break;
              }
              this.write[state.opIndex] = instruction[inst];
              state.opIndex = state.programIndex;
              state.curOp = [];
              state.column++;
              state.expect = 'op';
              break;
            default:
              state.column++;
          }
          break;
      }
    }

    callback();
  }
}

// 0x0000112233 => 0x0000 + r(0x11) + r(0x22)*0x33

module.exports = Parser;
