const inst = require('./instructions');
const registers = require('./registers');

const delimiters = / |\[|,|\]|;/;
const regex1 = /\]/;

class Arg {
  constructor(type, value) {
    this.type = type; // r a i
    this.value = [value]; // [0x00, 0x11, 0x22]
  }
}

class Parser {
  constructor(write, addressFloor) {
    this.write = write;
    this.floor = addressFloor;
    this.state = {};
    this.program = '';

    this.reset();
  }

  reset() {
    this.state = {
      running: true,
      expect: 'op',
      currentOperation: '',
      currentArguments: [],
      parseIndex: 0,
      programIndex: this.floor,
    }
  }

  // Move to next non-space character
  getNext() {
    while (this.program[this.state.parseIndex] === ' ') {
      this.state.parseIndex++;
    }
  }

  readWord() {
    let i = 1;
    while (!delimiters.test(this.program[this.state.parseIndex + i])) {
      i++;
    }
    let word = this.program.substring(this.state.parseIndex, this.state.parseIndex + i);
    this.state.parseIndex += i;
    return word;
  }

  parsePointer() {
    let reg = [];
    let imm = 0;
    while (this.program[this.state.parseIndex++] !== ']') {
      switch (this.program[this.state.parseIndex]) {
        case '%':
          this.state.parseIndex++;
          reg.push(this.readWord());
          break;

        case '$':
          this.state.parseIndex++;
          imm = parseInt(this.readWord(), 16);
          break;
      }
    }

    this.state.currentArguments.at(-1).value.push(
      (reg.length !== imm)
        ? registers.index[reg[0]]
        : 0xff
    );
    this.state.currentArguments.at(-1).value.push(
      ((imm !== 0) || (reg.length === 2))
        ? registers.index[reg[1]]
        : 0xff
    );
    this.state.currentArguments.at(-1).value.push(imm);
  }

  // Write Instruction to Memory
  handleEOI() {
    let opSpec = this.state.currentArguments.map((e) => {
      return e.type;
    }).join('');
    let code = inst.xoxISA[this.state.currentOperation + opSpec];
    if (this.state.currentOperation + opSpec === 'popr') {
      console.log(code);
    }
    this.write[this.state.programIndex++] = code;
    for (let i = 0; i < this.state.currentArguments.length; i++) {
      for (let j = 0; j < this.state.currentArguments[i].value.length; j++) {
        this.write[this.state.programIndex++] = this.state.currentArguments[i].value[j];
      }
    }

    this.state.expect = 'op';
    this.state.currentArguments = [];
  }

  process(program, callback) {
    // console.log(programString);
    this.program = program;
    this.reset();

    let noOffset = true;

    while (this.state.running) {
      this.getNext();
      switch (this.state.expect) {
        case 'op':
          this.state.currentOperation = this.readWord();
          this.state.running = (this.state.currentOperation !== 'eof');
          this.state.expect = 'arg';
          break;
        
        case 'arg':
          switch (this.program[this.state.parseIndex]) {
            case '%':
              this.state.parseIndex++;
              this.state.currentArguments.push(new Arg('r', registers.index[this.readWord()]));
              break;

            case '$':
              this.state.parseIndex++;
              let imm = parseInt(this.readWord(), 16);
              if (this.program[this.state.parseIndex] !== '[') {
                this.state.currentArguments.push(new Arg('i', imm >> 8));
                this.state.currentArguments.at(-1).value.push(imm & 0xff);
                break;
              }
              noOffset = false;
              this.state.currentArguments.push(new Arg('a', imm >> 8));
              this.state.currentArguments.at(-1).value.push(imm & 0xff);
              
            case '[':
              if (noOffset) {
                this.state.currentArguments.push(new Arg('a', 0));
                this.state.currentArguments.at(-1).value.push(0);
                noOffset = true;
              }
              this.parsePointer();
              break;

            case ';':
              this.handleEOI();
              this.state.parseIndex++;
              break;

            default:
              console.log("can't parse this operation...");
              break;
          }
          break;
      }
    }

    callback();
  }
}

// 0x0000112233 => 0x0000 + r(0x11) + r(0x22)*0x33

module.exports = Parser;
