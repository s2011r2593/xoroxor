# ^o^
xoroxor (stylized as ^o^) is a 16-bit virtual machine.

## ISA
- `0x01` // `mvrr register register`
  - e.g. `movrr %r00 %r01` will set `%r01` to `%r00`
- `0x02` // `mvrm register memory`
  - e.g. `mvrm %r00 [0xabba]` will set the value at `0xabba` to `%r00`
- `0x03` // `mvmr memory register`
  - e.g. `mvmr [0xabba] %r00` will set `%r00` to the value at `0xabba`
- `0x04` // `mvlr literal register`
  - e.g. `mvlr 0xface %r00` will set `%r00` to `0xface`
- `0x05` // `mvlm literal memory`
  - e.g. `mvlm 0xdead [0xbeef]` will set the value at `0xbeef` to `0xdead`

## Special Thanks
[Low Level JavaScript](https://www.youtube.com/c/LowLevelJavaScript) directly inspired this project and I borrowed a shitton of code from him.
