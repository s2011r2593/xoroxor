const registerLabels = [
  'r00', 'r01', 'r02',
  'r03', 'r04', 'r05',
  'rip', 'rsp', 'rbp',
  'rcd',
];
const registerCount = registerLabels.length;

const rIndex = registerLabels.reduce((map, name, i) => {
  map[name] = i;
  return map;
}, {});

const rInd = registerLabels.reduce((map, name, i) => {
  map[name] = i * 2;
  return map;
}, {});

module.exports = {
  registerLabels,
  registerCount,
  rIndex,
  rInd,
}
