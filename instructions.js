const movl = 0x00; // Move literal into register
const movr = 0x01; // Move register into register
const push = 0x02; // Push register onto stack
const pop  = 0x03; // Pop stack onto register

module.exports = {
  movl,
  movr,
  push,
  pop,
}
