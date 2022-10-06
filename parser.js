const instruction = require('./instructions');

class Parser {
  constructor(write) {
    this.write = write;
    this.state = 'rInstruct'
  }

  process(programString) {
    let col = 0;
    let curOp = '';
    let reading = true;
    while (reading) {
      switch(this.state) {
        case ('rInstruct'):
          curOp = programString.substring(col, col + 4);
          col += 5;
          this.state = 'rArgs';
        case ('rArgs'):
          console.log(instruction.curOp);
          reading = false;
    }
    }
  }
}

module.exports = Parser;
