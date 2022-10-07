const fs = require('fs');
const readline = require('readline');

const inst = require('./instructions');
const register = require('./registers');
const Parser = require('./parser');

/*
 * Allocates memory for vm
 * size: # of bytes
 */
const createMemory = (size) => {
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  return view;
}

class CPU {
  constructor(memory, memSize) {
    this.memory = memory;
    this.stateSize = 2;
    let write = new Uint8Array(memory.buffer);
    this.parser = new Parser(write, this.stateSize);

    // Register Initialization
    this.registers = createMemory(register.count * 2);
    
    this.setRegister('rsp', memSize - 2);
    this.setRegister('rip', this.stateSize);

    // Machine State
    this.memory.setUint16(0, 0x1);
  }

  // Register Getter and Setter
  getRegister(r) {
    return this.registers.getUint16(register.ind[r]);
  }

  setRegister(r, val) {
    return this.registers.setUint16(register.ind[r], val);
  }

  // Prints out register contents to console
  viewRegisters() {
    let x = {};
    for (let i = 0; i < register.count; i++) {
      x[register.labels[i]] = `0x${this.getRegister(register.labels[i]).toString(16).padStart(4, '0')}`;
    }
    console.table(x);
  }

  peek(addr) {
    console.log(`0x${this.memory.getUint16(addr).toString(16).padStart(4, '0')}`);
  }

  // Retrieve byte at $rip
  getByte() {
    let rip = this.getRegister('rip');
    let instruction = this.memory.getUint8(rip);
    this.setRegister('rip', rip + 1);
    return instruction;
  }

  // Retrieve short at $rip
  getShort() {
    let rip = this.getRegister('rip');
    let instruction = this.memory.getUint16(rip);
    this.setRegister('rip', rip + 2);
    return instruction;
  }

  // Runs an instruction
  // For help, see docs or instructions.js
  run(instruction) {
    switch (inst.xoxCodes[instruction]) {
      
    }    
  }

  // Run the next instruction
  tick() {
    let instruction = this.getByte();
    return this.run(instruction);
  }

  load(fpath, callback) {
    fs.readFile(fpath, 'utf8', (err, res) => {
      if (err) throw err;
      this.parser.process(
        res.replace(/(\r\n|\n|\r)/gm, '')
           .replace(/\s\s+/g, '')
           .replace(/, /g, ',')
           .replace(/;/g, ' ;'),
        callback,
      );
    });
  }

  execute(fpath) {
    this.load(
      fpath,
      () => {
        this.viewRegisters();
      }
    )
  }

  debug(fpath) {
    this.load(
      fpath,
      () => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        this.viewRegisters();
        // console.log(`next operation: ${this.memory.getUint8(this.getRegister('rip'))}`);
        console.log(`next operation: ${Object.keys(instruction)[this.memory.getUint8(this.getRegister('rip'))]}`);

        rl.on('line', () => {
          this.tick();
          this.viewRegisters();
          console.log(`next operation: ${Object.keys(instruction)[this.memory.getUint8(this.getRegister('rip'))]}`);
          if (this.memory.getUint16(0) !== 0x1) {
            rl.close();
          }
        });
      }
    )
  }
}

module.exports = {
  createMemory,
  CPU,
};
