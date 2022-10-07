const fs = require('fs');
const readline = require('readline');

const inst = require('./instructions');
const register = require('./registers');
const Parser = require('./parser');
const ms = require('./machineState');

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
    this.memory.setUint16(0, ms.stateEnum.idle);
  }

  // Register Getter and Setter
  getRegister(r) {
    return this.registers.getUint16(register.labelMap[r]);
  }

  setRegister(r, val) {
    return this.registers.setUint16(register.labelMap[r], val);
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
    let byte = this.memory.getUint8(rip);
    this.setRegister('rip', rip + 1);
    return byte;
  }

  // Retrieve short at $rip
  getShort() {
    let rip = this.getRegister('rip');
    let short = this.memory.getUint16(rip);
    this.setRegister('rip', rip + 2);
    return short;
  }

  // Converts d[rb, ri, s] into an address
  getPointer() {
    let offset = this.getShort();
    let rb = this.getByte();
    let ri = this.getByte();
    let scale = this.getByte();
    
    rb = (rb === 0xff ? 0 : this.registers.getUint16(rb * 2));
    ri = (ri === 0xff ? 0 : this.registers.getUint16(ri * 2));
    return offset + rb + (ri * scale);
  }

  // Run the next instruction
  tick() {
    let instruction = this.getByte();
    return this.run(instruction);
  }

  load(fpath, callback) {
    fs.readFile(fpath, 'utf8', (err, res) => {
      if (err) throw err;
      this.memory.setUint16(0, ms.stateEnum.executing);
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
        while (this.memory.getUint16(0) === ms.stateEnum.executing) {
          this.tick();
          this.viewRegisters();
        }
      }
    )
  }

  debug(fpath) {
    this.load(
      fpath,
      () => {
        
      }
    )
  }
  
  // Runs an instruction
  // For help, see docs or instructions.js
  run(instruction) {
    let r, r0, r1, a, i, v, stack;
    switch (instruction) {
      case inst.xoxISA.movrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        this.registers.setUint16(r1, this.registers.getUint16(r0));
        break;

      case inst.xoxISA.movra:
        r = this.getByte() * 2;
        a = this.getPointer();
        this.memory.setUint16(a, this.registers.getUint16(r));
        break;

      case inst.xoxISA.movar:
        a = this.getPointer();
        r = this.getByte() * 2;
        this.registers.setUint16(r, this.memory.getUint16(a));
        break;

      case inst.xoxISA.movir:
        i = this.getShort();
        r = this.getByte() * 2;
        this.registers.setUint16(r, i);        
        break;

      case inst.xoxISA.movia:
        i = this.getShort();
        a = this.getPointer();
        this.memory.setUint16(a, i);
        break;

      case inst.xoxISA.pshr:
        r = this.getByte() * 2;
        stack = this.getRegister('rsp') - 2;
        this.memory.setUint16(stack, this.registers.getUint16(r));
        this.setRegister('rsp', stack);
        break;

      case inst.xoxISA.psha:
        a = this.getPointer();
        stack = this.getRegister('rsp') - 2;
        this.memory.setUint16(stack, this.memory.getUint16(a));
        this.setRegister('rsp', stack);
        break;

      case inst.xoxISA.pshi:
        i = this.getShort();
        stack = this.getRegister('rsp') - 2;
        this.memory.setUint16(stack, i);
        this.setRegister('rsp', stack);
        break;

      case inst.xoxISA.popr:
        r = this.getByte() * 2;
        stack = this.getRegister('rsp');
        this.registers.setUint16(r, this.memory.getUint16(stack));
        this.setRegister('rsp', stack + 2);
        break;

      case inst.xoxISA.popa:
        a = this.getPointer();
        stack = this.getRegister('rsp');
        this.memory.setUint16(a, this.memory.getUint16(stack));
        this.setRegister('rsp', stack + 2);
        break;

      case inst.xoxISA.lea:
        a = this.getPointer();
        r = this.getByte() * 2;
        this.registers.setUint16(r, a);
        break;

      case inst.xoxISA.addrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) + this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.addra:
        r = this.getByte() * 2;
        a = this.getPointer();
        v = this.registers.getUint16(r) + this.memory.getUint16(a);
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.addar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getUint16(a) + this.registers.getUint16(r);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.addri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getUint16(r) + i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.addai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getUint16(a) + i;
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.subrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) - this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.subra:
        r = this.getByte() * 2;
        a = this.getPointer();
        v = this.registers.getUint16(r) - this.memory.getUint16(a);
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.subar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getUint16(a) - this.registers.getUint16(r);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.subri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getUint16(r) - i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.subai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getUint16(a) - i;
        this.memory.setUint16(a);
        break;

      case inst.xoxISA.mulrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) * this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.mulra:
        r = this.getByte() * 2;
        a = this.getPointer();
        v = this.registers.getUint16(r) * this.memory.getUint16(a);
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.divr:
        r = this.getByte() * 2;
        let qr = Math.floor(this.registers.getUint32(0) / this.registers.getUint16(r));
        let rr = this.registers.getUint32(0) % this.registers.getUint16(r);
        this.setRegister('r00', qr);
        this.setRegister('r01', rr);
        break;

      case inst.xoxISA.diva:
        a = this.getPointer();
        let qa = Math.floor(this.registers.getUint32(0) / this.memory.getUint16(a));
        let ra = this.registers.getUint32(0) % this.memory.getUint16(a);
        this.setRegister('r00', qa);
        this.setRegister('r01', ra);
        break;

      case inst.xoxISA.andrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) & this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.andra:
        r = this.getByte() * 2;
        a = this.getPointer();
        v = this.registers.getUint16(r) & this.memory.getUint16(a);
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.andar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getUint16(a) & this.registers.getUint16(r);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.andri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getUint16(r) & i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.andai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getUint16(a) & i;
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.orrrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) | this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.orrra:
        r = this.getByte() * 2;
        a = this.getPointer();
        v = this.registers.getUint16(r) | this.memory.getUint16(a);
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.orrar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getUint16(a) | this.registers.getUint16(r);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.orrri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getUint16(r) | i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.orrai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getUint16(a) | i;
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.xorrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) ^ this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.xorra:
        r = this.getByte() * 2;
        a = this.getPointer();
        v = this.registers.getUint16(r) ^ this.memory.getUint16(a);
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.xorar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getUint16(a) ^ this.registers.getUint16(r);
        this.memory.setUint16(a, v);        
        break;

      case inst.xoxISA.xorri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getUint16(r) ^ i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.xorai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getUint16(a) ^ i;
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.notr:
        r = this.getByte() * 2;
        v = ~this.registers.getUint16(r);
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.nota:
        a = this.getPointer();
        v = ~this.memory.getUint16(a);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.sllri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getUint16(r) << i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.sllrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) << this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.sllai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getUint16(a) << i;
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.sllar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getUint16(a) << this.registers.getUint16(r);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.slrri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getUint16(r) >> i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.slrrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getUint16(r0) >> this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.slrai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getUint16(a) >> i;
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.slrar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getUint16(a) >> this.registers.getUint16(r);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.sarri:
        r = this.getByte() * 2;
        i = this.getShort();
        v = this.registers.getInt16(r) >> i;
        this.registers.setUint16(r, v);
        break;

      case inst.xoxISA.sarrr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        v = this.registers.getInt16(r0) >> this.registers.getUint16(r1);
        this.registers.setUint16(r0, v);
        break;

      case inst.xoxISA.sarai:
        a = this.getPointer();
        i = this.getShort();
        v = this.memory.getInt16(a) >> i;
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.sarar:
        a = this.getPointer();
        r = this.getByte() * 2;
        v = this.memory.getInt16(a) >> this.registers.getUint16(r);
        this.memory.setUint16(a, v);
        break;

      case inst.xoxISA.cmprr:
        r0 = this.getByte() * 2;
        r1 = this.getByte() * 2;
        this.setRegister('rcd', this.registers.getUint16(r0) - this.registers.getUint16(r1));
        break;

      case inst.xoxISA.cmpra:
        r = this.getByte() * 2;
        a = this.getPointer();
        this.setRegister('rcd', this.registers.getUint16(r) - this.memory.getUint16(a));
        break;

      case inst.xoxISA.cmpar:
        a = this.getPointer();
        r = this.getByte() * 2;
        this.setRegister('rcd', this.memory.getUint16(a) - this.registers.getUint16(r));
        break;

      case inst.xoxISA.cmpri:
        r = this.getByte() * 2;
        i = this.getShort();
        this.setRegister('rcd', this.registers.getUint16(r) - i);
        break;

      case inst.xoxISA.cmpai:
        a = this.getPointer();
        i = this.getShort();
        this.setRegister('rcd', this.memory.getUint16(a) - i);
        break;

      case inst.xoxISA.jmp:
        a = this.getPointer();
        this.setRegister('rip', a);
        break;

      case inst.xoxISA.jeq:
        a = this.getPointer();
        if (this.getRegister('rcd') === 0) {
          this.setRegister('rip', a);
        }
        break;

      case inst.xoxISA.jne:
        a = this.getPointer();
        if (this.getRegister('rcd') !== 0) {
          this.setRegister('rip', a);
        }
        break;

      case inst.xoxISA.jlt:
        a = this.getPointer();
        if (this.getRegister('rcd') < 0) {
          this.setRegister('rip', a);
        }
        break;

      case inst.xoxISA.jlq:
        a = this.getPointer();
        if (this.getRegister('rcd') <= 0) {
          this.setRegister('rip', a);
        }
        break;

      case inst.xoxISA.jgt:
        a = this.getPointer();
        if (this.getRegister('rcd') > 0) {
          this.setRegister('rip', a);
        }
        break;

      case inst.xoxISA.jgq:
        a = this.getPointer();
        if (this.getRegister('rcd') >= 0) {
          this.setRegister('rip', a);
        }
        break;

      case inst.xoxISA.cll:
        a = this.getPointer();
        let retCall = this.getRegister('rip') + 1;
        stack = this.getRegister('rsp') - 2;
        this.memory.setUint16(stack, retCall);
        this.setRegister('rsp', stack);
        this.setRegister('rip', a);
        break;

      case inst.xoxISA.ret:
        stack = this.getRegister('rsp');
        a = this.memory.getUint16(stack);
        this.setRegister('rsp', stack + 2);
        this.setRegister('rip', a);
        break;

      case inst.xoxISA.stp:
        this.memory.setUint16(0, ms.stateEnum.idle);
        break;

      case inst.xoxISA.nop:
        break;

      default:
        console.log('no such operation');
        break;
    }    
  }
}

module.exports = {
  createMemory,
  CPU,
};
