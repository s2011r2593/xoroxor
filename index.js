const processor = require('./processor');
const instruction = require('./instructions')

const size = 65536;
const memory = processor.createMemory(size);
const cpu = new processor.CPU(memory, size);

const program = new Uint8Array(memory.buffer);
// let i = 0;
// program[i++] = instruction.mvlr;
// program[i++] = 0xde;
// program[i++] = 0xad;
// program[i++] = 0x00;
// program[i++] = instruction.mvlr;
// program[i++] = 0xbe;
// program[i++] = 0xef;
// program[i++] = 0x01;
// program[i++] = instruction.mvrr;
// program[i++] = 0x01;
// program[i++] = 0x02;
// program[i++] = instruction.mvrm;
// program[i++] = 0x2;
// program[i++] = 0xfa;
// program[i++] = 0xce;
// program[i++] = instruction.pshr;
// program[i++] = 0x00;
// program[i++] = instruction.popr;
// program[i++] = 0x2;

cpu.tick();
cpu.tick();
cpu.tick();
cpu.tick();
cpu.tick();
cpu.tick();
cpu.viewRegisters();
cpu.execute('./sandbox/test.xrsm');
