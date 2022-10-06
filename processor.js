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
    this.registerCount = 10;
    this.registerLabels = [
      'r00', 'r01', 'r02',
      'r03', 'r04', 'r05',
      'rip', 'rsp', 'rbp',
      'rcd',
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

  peek(addr) {
    console.log(`0x${this.memory.getUint16(addr).toString(16).padStart(4, '0')}`);
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
      // Move <reg_0> into <reg_1>
      case instruction.mvrr:
        let r0_mvrr = this.getByte() * 2;
        let r1_mvrr = this.getByte() * 2;
        this.registers.setUint16(r1_mvrr, this.registers.getUint16(r0_mvrr));
        return;

      // Move <reg> into [mem]
      case instruction.mvrm:
        let r_mvrm = this.getByte() * 2;
        let a_mvrm = this.getShort();
        this.memory.setUint16(a_mvrm, this.registers.getUint16(r_mvrm));
        return;

      // Move [mem] into <reg>
      case instruction.mvmr:
        let a_mvmr = this.getShort();
        let r_mvmr = this.getByte() * 2;
        this.registers.setUint16(r_mvmr, this.memory.getUint16(a_mvmr));
        return;

      // Move $imm into <reg>
      case instruction.mvlr:
        let v_mvlr = this.getShort();
        let r_mvlr = this.getByte() * 2;
        this.registers.setUint16(r_mvlr, v_mvlr);
        return;

      // Move $imm into [mem]
      case instruction.mvlm:
        let v_mvlm = this.getShort();
        let a_mvlm = this.getShort();
        this.memory(a_mvlm, v_mvlm);
        return;

      // Push <reg> onto stack
      case instruction.pshr:
        let r_pshr = this.getByte() * 2;
        let s_pshr = this.getRegister('rsp') - 2;
        this.memory.setUint16(s_pshr, this.registers.getUint16(r_pshr));
        this.setRegister('rsp', s_pshr);
        return;

      // Push [mem] onto stack
      case instruction.pshm:
        let a_pshm = this.getShort();
        let s_pshm = this.getRegister('rsp') - 2;
        this.memory.setUint16(s_pshm, this.memory.getUint16(a_pshm));
        this.setRegister('rsp', s_pshm);
        return;

      // Push $imm onto stack
      case instruction.pshl:
        let v_pshl = this.getShort();
        let s_pshl = this.getRegister('rsp') - 2;
        this.memory.setUint16(s_pshl, v_pshl);
        this.setRegister('rsp', s_pshl);
        return;

      // Pop stack into <reg>
      case instruction.popr:
        let r_popr = this.getByte() * 2;
        let s_popr = this.getRegister('rsp');
        this.registers.setUint16(r_popr, this.memory.getUint16(s_popr));
        this.setRegister('rsp', s_popr + 2);
        return;

      // Pop stack into mem
      case instruction.popm:
        let a_popm = this.getShort();
        let s_popm = this.getRegister('rsp');
        this.memory.setUint16(a_popm, this.memory.getUint16(s_popm));
        this.setRegister('rsp', s_popm + 2);
        return;

      // Load Effective Address into <reg>
      case instruction.lea:
        let r_lea = this.getByte() * 2;
        let v_lea = this.getShort();
        this.registers.setUint16(r_lea, v_lea);
        return;

      // Add <reg_1> to <reg_0>
      case instruction.adrr:
        let r0_adrr = this.getByte() * 2;
        let r1_adrr = this.getByte() * 2;
        let v_adrr = this.registers.getUint16(r0_adrr) + this.registers.getUint16(r1_adrr);
        this.registers.setUint16(r0_adrr, v_adrr);
        return;

      // Add [mem] to <reg>
      case instruction.adrm:
        let r_adrm = this.getByte() * 2;
        let a_adrm = this.getShort();
        let v_adrm = this.registers.getUint16(r_adrm) + this.memory.getUint16(a_adrm);
        this.registers.setUint16(r_adrm, v_adrm);
        return;

      // add <reg> to [mem]
      case instruction.admr:
        let a_admr = this.getShort();
        let r_admr = this.getByte() * 2;
        let v_admr = this.memory.getUint16(a_admr) + this.registers.getUint16(r_admr);
        this.memory.setUint16(a_admr, v_admr);
        return;

      // add $imm to <reg>
      case instruction.adrl:
        let r_adrl = this.getByte() * 2;
        let l_adrl = this.getShort();
        let v_adrl = this.registers.getUint16(r_adrl) + l_adrl;
        this.registers.setUint16(r_adrl, v_adrl);
        return;

      // add $imm to [mem]
      case instruction.adml:
        let a_adml = this.getShort();
        let l_adml = this.getShort();
        let v_adml = this.memory.getUint16(a_adml) + l_adml;
        this.memory.setUint16(a_adml, v_adml);
        return;

      // subtract <reg_1> from <reg_0>
      case instruction.mnrr:
        let r0_mnrr = this.getByte() * 2;
        let r1_mnrr = this.getByte() * 2;
        let v_mnrr = this.registers.getUint16(r0_mnrr) - this.registers.getUint16(r1_mnrr);
        this.registers.setUint16(r0_mnrr, v_mnrr);
        return;

      // subtract [mem] from <reg>
      case instruction.mnrm:
        let r_mnrm = this.getByte() * 2;
        let a_mnrm = this.getShort();
        let v_mnrm = this.registers.getUint16(r_mnrm) - this.memory.getUint16(a_mnrm);
        this.registers.setUint16(r_mnrm, v_mnrm);
        return;

      // subtract <reg> from [mem]
      case instruction.mnmr:
        let a_mnmr = this.getShort();
        let r_mnmr = this.getByte() * 2;
        let v_mnmr = this.memory.getUint16(a_mnmr) - this.registers.getUint16(r_mnmr);
        this.memory.setUint16(a_mnmr, v_mnmr);
        return;

      // subtract $imm from <reg>
      case instruction.mnrl:
        let r_mnrl = this.getByte() * 2;
        let l_mnrl = this.getShort();
        let v_mnrl = this.registers.getUint16(r_mnrl) - l_mnrl;
        this.registers.setUint16(r_mnrl, v_mnrl);
        return;

      // subtract $imm from [mem]
      case instruction.mnml:
        let a_mnml = this.getShort();
        let l_mnml = this.getShort();
        let v_mnml = this.memory.getUint16(a_mnml) - l_mnml;
        this.memory.setUint16(a_mnml, v_mnml);
        return;

      // <reg_0> *= <reg_1>
      case instruction.imrr:
        let r0_imrr = this.getByte() * 2;
        let r1_imrr = this.getByte() * 2;
        let v_imrr = this.registers.getUint16(r0_imrr) * this.registers.getUint16(r1_imrr);
        this.registers.setUint16(r0_imrr, v_imrr);
        return;
      
      // <reg> *= [mem]
      case instruction.imrm:
        let r_imrm = this.getByte() * 2;
        let a_imrm = this.getShort();
        let v_imrm = this.registers.getUint16(r_imrm) * this.memory.getUint16(a_imrm);
        this.registers.setUint16(r_imrm, v_imrm);
        return;

      // <r00>U<r01> / <reg>. <r00> = Q ; <r01> = R
      case instruction.idvr:
        let reg_idvr = this.getByte() * 2;
        let q_idvr = Math.floor(this.registers.getUint32(0) / this.registers.getUint16(reg_idvr));
        let r_idvr = this.registers.getUint32(0) % this.registers.getUint16(reg_idvr);
        this.registers.setUint16(0, q_idvr);
        this.registers.setUint16(2, r_idvr);
        return;

      // <r00>U<r01> /= [mem]. <r00> = Q ; <r01> = R
      case instruction.idvm:
        let a_idvm = this.getShort();
        let q_idvm = Math.floor(this.registers.getUint32(0) / this.memory.getUint16(a_idvm));
        let r_idvm = this.registers.getUint32(0) % this.memory.getUint16(a_idvm);
        this.registers.setUint16(0, q_idvm);
        this.registers.setUint16(2, r_idvm);
        return;

      // <reg_0> &= <reg_1>
      case instruction.anrr:
        let r0_anrr = this.getByte() * 2;
        let r1_anrr = this.getByte() * 2;
        let v_anrr = this.registers.getUint16(r0_anrr) & this.registers.getUint16(r1_anrr);
        this.registers.setUint16(r0_anrr, v_anrr);
        return;

      // <reg> &= [mem]
      case instruction.anrm:
        let r_anrm = this.getByte() * 2;
        let a_anrm = this.getShort();
        let v_anrm = this.registers.getUint16(r_anrm) & this.memory.getUint16(a_anrm);
        this.registers.setUint16(r_anrm, v_anrm);
        return;

      // [mem] &= <reg>
      case instruction.anmr:
        let a_anmr = this.getShort();
        let r_anmr = this.getByte() * 2;
        let v_anmr = this.memory.getUint16(a_anmr) & this.registers.getUint16(r_anmr);
        this.memory.setUint16(a_anmr, v_anmr);
        return;

      // <reg> &= $imm
      case instruction.anrl:
        let r_anrl = this.getByte() * 2;
        let l_anrl = this.getShort();
        let v_anrl = this.registers.getUint16(r_anrl) & l_anrl;
        this.registers.setUint16(r_anrl, v_anrl);
        return;

      // [mem] &= $imm
      case instruction.anml:
        let a_anml = this.getShort();
        let l_anml = this.getShort();
        let v_anml = this.memory.getUint16(a_anml) & l_anml;
        this.memory.setUint16(a_anml, v_anml);
        return;

      // <reg_0> |= <reg_1>
      case instruction.orrr:
        let r0_orrr = this.getByte() * 2;
        let r1_orrr = this.getByte() * 2;
        let v_orrr = this.registers.getUint16(r0_orrr) | this.registers.getUint16(r1_orrr);
        this.registers.setUint16(r0_orrr, v_orrr);
        return;

      // <reg> |= [mem]
      case instruction.orrm:
        let r_orrm = this.getByte() * 2;
        let a_orrm = this.getShort();
        let v_orrm = this.registers.getUint16(r_orrm) | this.memory.getUint16(a_orrm);
        this.registers.setUint16(r_orrm, v_orrm);
        return;

      // [mem] |= <reg>
      case instruction.ormr:
        let a_ormr = this.getShort();
        let r_ormr = this.getByte() * 2;
        let v_ormr = this.memory.getUint16(a_ormr) | this.registers.getUint16(r_ormr);
        this.memory.setUint16(a_ormr, v_ormr);
        return;

      // <reg |= $imm
      case instruction.orrl:
        let r_orrl = this.getByte() * 2;
        let l_orrl = this.getShort();
        let v_orrl = this.registers.getUint16(r_orrl) | l_orrl;
        this.registers.setUint16(r_orrl, v_orrl);
        return;

      // [mem] |= $imm
      case instruction.orml:
        let a_orml = this.getShort();
        let l_orml = this.getShort();
        let v_orml = this.memory.getUint16(a_orml) | l_orml;
        this.memory.setUint16(a_orml, v_orml);
        return;

      // <reg_0> ^= <reg_1>
      case instruction.xrrr:
        let r0_xrrr = this.getByte() * 2;
        let r1_xrrr = this.getByte() * 2;
        let v_xrrr = this.registers.getUint16(r0_xrrr) ^ this.registers.getUint16(r1_xrrr);
        this.registers.setUint16(r0_xrrr, v_xrrr);
        return;

      // <reg> ^= [mem]
      case instruction.xrrm:
        let r_xrrm = this.getByte() * 2;
        let a_xrrm = this.getShort();
        let v_xrrm = this.registers.getUint16(r_xrrm) ^ this.memory.getUint16(a_xrrm);
        this.registers.setUint16(r_xrrm, v_xrrm);
        return;

      // [mem] ^= <reg>
      case instruction.xrmr:
        let a_xrmr = this.getShort();
        let r_xrmr = this.getByte() * 2;
        let v_xrmr = this.memory.getUint16(a_xrmr) ^ this.registers.getUint16(r_xrmr);
        this.memory.setUint16(a_xrmr, v_xrmr);
        return;

      // <reg> ^= $imm
      case instruction.xrrl:
        let r_xrrl = this.getByte() * 2;
        let l_xrrl = this.getShort();
        let v_xrrl = this.registers.getUint16(r_xrrl) ^ l_xrrl;
        this.registers.setUint16(r_xrrl, v_xrrl);
        return;

      // [mem] ^= $imm
      case instruction.xrml:
        let a_xrml = this.getShort();
        let l_xrml = this.getShort();
        let v_xrml = this.memory.getUint16(a_xrml) ^ l_xrml;
        this.memory.setUint16(a_xrml, v_xrml);
        return;

      // <reg> ~= <reg>
      case instruction.notr:
        let r_notr = this.getByte() * 2;
        let v_notr = ~this.registers.getUint16(r_notr);
        this.registers.setUint16(r_notr, v_notr);
        return;

      // [mem] ~= [mem]
      case instruction.notm:
        let a_notm = this.getShort();
        let v_notm = ~this.memory.getUint16(a_notm);
        this.memory.setUint16(a_notm, v_notm);
        return;

      // <reg> << $imm
      case instruction.slrl:
        let r_slrl = this.getByte() * 2;
        let l_slrl = this.getShort();
        let v_slrl = this.registers.getUint16(r_slrl) << l_slrl;
        this.registers.setUint16(r_slrl, v_slrl);
        return;

      // <reg_0> << <reg_1>
      case instruction.slrr:
        let r0_slrr = this.getByte() * 2;
        let r1_slrr = this.getByte() * 2;
        let v_slrr = this.registers.getUint16(r0_slrr) << this.registers.getUint16(r1_slrr);
        this.registers.setUint16(r0_slrr, v_slrr);
        return;

      // [mem] << $imm
      case instruction.slml:
        let a_slml = this.getShort();
        let l_slml = this.getShort();
        let v_slml = this.memory.getUint16(a_slml) << l_slml;
        this.memory.setUint16(a_slml, v_slml);
        return;

      // [mem] << <reg>
      case instruction.slmr:
        let a_slmr = this.getShort();
        let r_slmr = this.getByte() * 2;
        let v_slmr = this.memory.getUint16(a_slmr) << this.registers.getUint16(r_slmr);
        this.memory.setUint16(a_slmr, v_slmr);
        return;

      // <reg> >> $imm logical
      case instruction.srrl:
        let r_srrl = this.getByte() * 2;
        let l_srrl = this.getShort();
        let v_srrl = this.registers.getUint16(r_srrl) >> l_srrl;
        this.registers.setUint16(r_srrl, v_srrl);
        return;

      // <reg_0> >> <reg_1> logical
      case instruction.srrr:
        let r0_srrr = this.getByte() * 2;
        let r1_srrr = this.getByte() * 2;
        let v_srrr = this.registers.getUint16(r0_srrr) >> this.registers.getUint16(r1_srrr);
        this.registers.setUint16(r0_srrr, v_srrr);
        return;

      // [mem] >> $imm logical
      case instruction.srml:
        let a_srml = this.getShort();
        let l_srml = this.getShort();
        let v_srml = this.memory.getUint16(a_srml) >> l_srml;
        this.memory.setUint16(a_srml, v_srml);
        return;

      // [mem] >> <reg> logical
      case instruction.srmr:
        let a_srmr = this.getShort();
        let r_srmr = this.getByte() * 2;
        let v_srmr = this.memory.getUint16(a_srmr) >> this.registers.getUint16(r_srmr);
        this.memory.setUint16(a_srmr, v_srmr);
        return;

      // <reg> >> $imm arithmetic
      case instruction.sarl:
        let r_sarl = this.getByte() * 2;
        let l_sarl = this.getShort();
        let v_sarl = this.registers.getInt16(r_sarl) >> l_sarl;
        this.registers.setUint16(r_sarl, v_sarl);
        return;

      // <reg_0> >> <reg_1> arithmetic
      case instruction.sarr:
        let r0_sarr = this.getByte() * 2;
        let r1_sarr = this.getByte() * 2;
        let v_sarr = this.registers.getInt16(r0_sarr) >> this.registers.getUint16(r1_sarr);
        this.registers.setUint16(r0_sarr, v_sarr);
        return;

      // [mem] >> $imm arithmetic
      case instruction.saml:
        let a_saml = this.getShort();
        let l_saml = this.getShort();
        let v_saml = this.memory.getInt16(a_saml) >> l_saml;
        this.memory.setUint16(a_saml, v_saml);
        return;

      // [mem] >> <reg> arithmetic
      case instruction.samr:
        let a_samr = this.getShort();
        let r_samr = this.getByte() * 2;
        let v_samr = this.memory.getInt16(a_samr) >> this.registers.getUint16(r_samr);
        this.memory.setUint16(a_samr, v_samr);
        return;

      // <rcd> = <reg_0> - <reg_1>
      case instruction.cprr:
        let r0_cprr = this.getByte() * 2;
        let r1_cprr = this.getByte() * 2;
        this.setRegister('rcd', this.registers.getUint16(r0_cprr) - this.registers.getUint16(r1_cprr));
        return;

      // <rcd> = <reg> - [mem]
      case instruction.cprm:
        let r_cprm = this.getByte() * 2;
        let a_cprm = this.getShort();
        this.setRegister('rcd', this.registers.getUint16(r_cprm) - this.memory.getUint16(a_cprm));
        return;

      // <rcd> = [mem] - <reg>
      case instruction.cpmr:
        let a_cprm = this.getShort();
        let r_cprm = this.getByte() * 2;
        this.setRegister('rcd', this.memory.getUint16(a_cprm) - this.registers.getUint16(r_cprm));
        return;

      // <rcd> = <reg> - $imm
      case instruction.cprl:
        let r_cprl = this.getByte() * 2;
        let l_cprl = this.getShort();
        this.setRegister('rcd', this.registers.getUint16(r_cprl) - l_cprl);
        return;

      // <rcd> = [mem] - $imm
      case instruction.cpml:
        let a_cpml = this.getShort();
        let l_cpml = this.getShort();
        this.setRegister('rcd', this.memory.getUint16(a_cpml) - l_cpml);
        return;

      // jump to address
      case instruction.jump:
        let a_jump = this.getShort();
        this.setRegister('rip', a_jump);
        return;

      // jump if <rcd> === 0
      case instruction.jpeq:
        let a_jpeq = this.getShort();
        if (this.getRegister('rcd') === 0) {
          this.setRegister('rip', a_jpeq);
        }
        return;

      // jump if <rcd> !== 0
      case instruction.jpne:
        let a_jpne = this.getShort();
        if (this.getRegister('rcd') !== 0) {
          this.setRegister('rip', a_jpne);
        }
        return;

      // jump if <rcd> < 0
      case instruction.jplt:
        let a_jplt = this.getShort();
        if (this.getRegister('rcd') < 0) {
          this.setRegister('rip', a_jplt);
        }
        return;

      // jump if <rcd> > 0
      case instruction.jpgt:
        let a_jpgt = this.getShort();
        if (this.getRegister('rcd') > 0) {
          this.setRegister('rip', a_jpgt);
        }
        return;

      // jump if <rcd> <= 0
      case instruction.jleq:
        let a_jleq = this.getShort();
        if (this.getRegister('rcd') <= 0) {
          this.setRegister('rip', a_jleq);
        }
        return;

      // jump if <rcd> >= 0
      case instruction.jgeq:
        let a_jgeq = this.getShort();
        if (this.getRegister('rcd') >= 0) {
          this.setRegister('rip', a_jgeq);
        }
        return;

      // Function Call
      case instruction.call:
        let a_call = this.getShort();
        let ret_call = this.getRegister('rip') + 1;
        let s_call = this.getRegister('rsp') - 2;
        this.memory.setUint16(s_call, ret_call);
        this.setRegister('rsp', s_call);
        this.setRegister('rip', a_call);
        return;

      // Return
      case instruction.ret:
        let s_ret = this.getRegister('rsp');
        let a_ret = this.memory.getUint16(s_ret);
        this.setRegister('rsp', s_ret + 2);
        this.setRegister('rip', a_ret);
        return;

      // No op
      case noop:
      default:
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
