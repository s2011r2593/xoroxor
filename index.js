const processor = require('./processor');
const instruction = require('./instructions')

const size = 65536;
const memory = processor.createMemory(size);
const cpu = new processor.CPU(memory, size);

cpu.execute('./sandbox/test.xrsm');
