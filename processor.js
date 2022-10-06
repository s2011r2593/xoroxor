const instruction = require('./instructions');

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
  constructor(memory) {
    this.memory = memory;

    // Register Initialization
    this.registerCount = 9;
    this.registerLabels = [
      'r00', 'r01', 'r02',
      'r03', 'r04', 'r05',
      'rip', 'rsp', 'rcd',
    ];
    this.rInd = this.registerLabels.reduce((map, name, i) => {
      map[name] = i * 2;
      return map;
    }, {});
    this.registers = createMemory(this.registerCount * 2);
  }

  // Register Getter and Setter
  getRegister(register) {
    return this.registers.getUint16(this.rInd[register]);
  }
  setRegister(register, val) {
    return this.registers.setUint16(this.rInd[register], val);
  }

  // Prints out register contents to console
  viewRegisters() {
    let x = {};
    for (let i = 0; i < this.registerCount; i++) {
      x[this.registerLabels[i]] = `0x${this.getRegister(this.registerLabels[i]).toString(16).padStart(4, '0')}`;
    }
    console.table(x);
  }

  // Retrieve byte at $rip
  getByte() {
    let rip = this.getRegister('rip');
    let inst = this.memory.getUint8(rip);
    this.setRegister('rip', rip + 1);
    return inst;
  }

  // Retrieve short at $rip
  getShort() {
    let rip = this.getRegister('rip');
    let inst = this.memory.getUint16(rip);
    this.setRegister('rip', rip + 2);
    return inst;
  }

  // Runs an instruction
  // For help, see docs or instructions.js
  run(inst) {
    switch(inst) {
      case instruction.movl:
        let r = this.getByte();
        let vl = this.getShort();
        this.registers.setUint16(r * 2, vl);
        return;
      case instruction.movr:
        let r0 = this.getByte();
        let r1 = this.getByte();
        let vr = this.registers.getUint16(r1 * 2);
        this.registers.setUint16(r0*2, vr);
    }
  }

  // Run the next instruction
  tick() {
    let inst = this.getByte();
    return this.run(inst);
  }
}

module.exports = {
  createMemory,
  CPU,
};
