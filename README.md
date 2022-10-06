# ^o^
xoroxor (stylized as ^o^) is a 16-bit virtual machine.

## ISA
- `0x00` // `movl register literal`
  - Move 16bit literal into register
  - e.g. `mov $r00 0xabba` will set `r00` to `0xabba`
- `0x01` // `movr register_0 register_1`
  - Moves contents of register_1 to register_0
  - e.g. `movr $r00 $r01` will set `r00` to `r01`

## Special Thanks
[Low Level JavaScript](https://www.youtube.com/c/LowLevelJavaScript) directly inspired this project and I borrowed a shitton of code from him.
