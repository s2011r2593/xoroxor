const processor = require('./processor');
const instruction = require('./instructions')

const size = 65536;
const memory = processor.createMemory(size);
const cpu = new processor.CPU(memory, size);

const program = new Uint8Array(memory.buffer);
program[0] = instruction.mvlr;
program[1] = 0xde;
program[2] = 0xad;
program[3] = 0x00;
program[4] = instruction.mvlr;
program[5] = 0xbe;
program[6] = 0xef;
program[7] = 0x01;
program[8] = instruction.mvrr;
program[9] = 0x01;
program[10] = 0x02;
program[11] = instruction.mvrm;
program[12] = 0x2;
program[13] = 0xfa;
program[14] = 0xce;
program[15] = instruction.push;
program[16] = 0x00;
program[17] = instruction.pop;
program[18] = 0x2;

cpu.tick();
cpu.tick();
cpu.tick();
cpu.tick();
cpu.tick();
cpu.tick();
cpu.peek(0xfffc);
cpu.peek(0xface);
cpu.viewRegisters();
