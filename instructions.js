let i = 0x00;
const xoxISA = {
  'nop': i++,     //0
  'movrr': i++,
  'movra': i++,
  'movar': i++,
  'movir': i++,
  'movia': i++,   // 5
  'pshr': i++,
  'psha': i++,
  'pshi': i++,
  'popr': i++,
  'popa': i++,    // 10
  'lea': i++,
  'addrr': i++,
  'addra': i++,
  'addar': i++,
  'addri': i++,   // 15
  'addai': i++,
  'subrr': i++,
  'subra': i++,
  'subar': i++,
  'subri': i++,   // 20
  'subai': i++,
  'mulrr': i++,
  'mulra': i++,
  'divr': i++,
  'diva': i++,    // 25
  'andrr': i++,
  'andra': i++,
  'andar': i++,
  'andri': i++,
  'andai': i++,   // 30
  'orrrr': i++,
  'orrra': i++,
  'orrar': i++,
  'orrri': i++,
  'orrai': i++,   // 35
  'xorrr': i++,
  'xorra': i++,
  'xorar': i++,
  'xorri': i++,
  'xorai': i++,   // 40
  'notr': i++,
  'nota': i++,
  'sllri': i++,
  'sllrr': i++,
  'sllai': i++,   // 45
  'sllar': i++,
  'slrri': i++,
  'slrrr': i++,
  'slrai': i++,
  'slrar': i++,   // 50
  'sarri': i++,
  'sarrr': i++,
  'sarai': i++,
  'sarar': i++,
  'cmprr': i++,   // 55
  'cmpra': i++,
  'cmpar': i++,
  'cmpri': i++,
  'cmpai': i++,
  'jmp': i++,     // 60
  'jeq': i++,
  'jne': i++,
  'jlt': i++,
  'jlq': i++,
  'jgt': i++,     // 65
  'jgq': i++,
  'cll': i++,
  'ret': i++,
  'stp': i++,
}

const xoxCodes = Object.keys(xoxISA).map((e) => {
  return e;
});

module.exports = {
  xoxISA,
  xoxCodes,
}
