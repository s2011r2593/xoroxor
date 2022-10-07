const instruction = require('./instructions');

class Parser {
  constructor(write) {
    this.write = write;
  }

  process(programString) {
    console.log(programString);
  }
}

// 0x0000112233 => 0x0000 + r(0x11) + r(0x22)*0x33

module.exports = Parser;
