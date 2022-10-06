let i = 0x00;

// nop 0
const noop = i++;

// mv 1~5
const mvrr = i++; const mvrm = i++; const mvmr = i++; const mvlr = i++; const mvlm = i++; // move

// stack 6~10
const pshr = i++; const pshm = i++; const pshl = i++;                                     // push
const popr = i++; const popm = i++;                                                       // pop

const lea = i++;                                                                          // load effective address

// add 12~16 ; subtract 17~21
const adrr = i++; const adrm = i++; const admr = i++; const adrl = i++; const adml = i++; // add
const mnrr = i++; const mnrm = i++; const mnmr = i++; const mnrl = i++; const mnml = i++; //subtract

// integer mult/div 22~25
const imrr = i++; const imrm = i++;                                                       // multiply
const idvr = i++; const idvm = i++;                                                       // divide

// bitwise 26~42
const anrr = i++; const anrm = i++; const anmr = i++; const anrl = i++; const anml = i++; // and
const orrr = i++; const orrm = i++; const ormr = i++; const orrl = i++; const orml = i++; // or
const xrrr = i++; const xrrm = i++; const xrmr = i++; const xrrl = i++; const xrml = i++; // xor
const notr = i++; const notm = i++;                                                       // not

// shift 43~54
const slrl = i++; const slrr = i++; const slml = i++;  const slmr = i++;                   // shift left
const srrl = i++; const srrr = i++; const srml = i++;  const srmr = i++;                   // shift logical right
const sarl = i++; const sarr = i++; const saml = i++;  const samr = i++;                   // shift arithmetic right

// Control 55~68
const cprr = i++; const cprm = i++; const cpmr = i++; const cprl = i++; const cpml = i++; // compare
const jump = i++;                                                                         // jump
const jpeq = i++; const jpne = i++;                                                       //  ===  !==
const jplt = i++; const jpgt = i++;                                                       //    <  >
const jleq = i++; const jgeq = i++;                                                       //   <=  >=
const call = i++; const ret  = i++;                                                       // call  return

module.exports = {
  noop, mvrr, mvrm,
  mvmr, mvlr, mvlm,
  pshr, pshm, pshl,
  popr, popm,  lea,
  adrr, adrm, admr,
  adrl, adml, mnrr,
  mnrm, mnmr, mnrl,
  mnml, imrr, imrm,
  idvr, idvm, anrr,
  anrm, anmr, anrl,
  anml, orrr, orrm,
  ormr, orrl, orml,
  xrrr, xrrm, xrmr,
  xrrl, xrml, notr,
  notm, slrl, slrr,
  slml, slmr, srrl,
  srrr, srml, srmr,
  sarl, sarr, saml,
  samr, cprr, cprm,
  cpmr, cprl, cpml,
  jump, jpeq, jpne,
  jplt, jpgt, jleq,
  jgeq, call, ret
}
