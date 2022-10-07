const labels = [
  'r00', 'r01', 'r02',
  'r03', 'r04', 'r05',
  'rip', 'rsp', 'rbp',
  'rcd',
];
const count = labels.length;

const index = labels.reduce((map, name, i) => {
  map[name] = i;
  return map;
}, {});

const ind = labels.reduce((map, name, i) => {
  map[name] = i * 2;
  return map;
}, {});

module.exports = {
  labels,
  count,
  index,
  ind,
}
