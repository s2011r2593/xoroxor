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
  constructor(memory, memSize) {
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
    
    this.setRegister('rsp', memSize - 2);
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
        let r_movl = this.getByte();
        let v_movl = this.getShort();
        this.registers.setUint16(r_movl * 2, v_movl);
        return;
      case instruction.movr:
        let r0_movr = this.getByte();
        let r1_movr = this.getByte();
        let v_movr = this.registers.getUint16(r1_movr * 2);
        this.registers.setUint16(r0_movr * 2, v_movr);
        return;
      case instruction.push:
        let r_push = this.getByte();
        let a_push = this.getRegister('rsp') - 2;
        let v_push = this.registers.getUint16(r_push * 2);
        this.setRegister('rsp', a_push);
        this.memory.setUint16(a_push, v_push);
        return;
      case instruction.pop:
        let r_pop = this.getByte();
        let a_pop = this.getRegister('rsp');
        let v_pop = this.memory.getUint16(a_pop);
        this.registers.setUint16(r_pop * 2, v_pop);
        this.setRegister('rsp', a_pop + 2);
        return;
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
