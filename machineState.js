const stateMap = [
  'idle', 'executing', 'waiting'
]
const stateEnum = stateMap.reduce((map, name, i) => {
  map[name] = i;
  return map;
}, {});

module.exports = {
  stateMap,
  stateEnum,
}
