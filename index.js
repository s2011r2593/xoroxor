const processor = require('./processor');
const instruction = require('./instructions')

const ram = 65536; // 64 KiB
// const space = 8388608; // 8 MiB
// const storage = processor.createMemory(space);
const memory = processor.createMemory(ram);
const cpu = new processor.CPU(memory, ram);

cpu.debug('./sandbox/simple.xrsm');
