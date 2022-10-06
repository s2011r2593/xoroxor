const processor = require('./processor');
const instruction = require('./instructions')

const memory = processor.createMemory(256);
const cpu = new processor.CPU(memory);

const program = new Uint8Array(memory.buffer);
program[0] = instruction.movl;
program[1] = 0x00;
program[2] = 0xde;
program[3] = 0xad;
program[4] = instruction.movl;
program[5] = 0x01;
program[6] = 0xbe;
program[7] = 0xef;
program[8] = instruction.movr;
program[9] = 0x02;
program[10] = 0x01;

cpu.tick();
cpu.tick();
cpu.tick();
cpu.viewRegisters();