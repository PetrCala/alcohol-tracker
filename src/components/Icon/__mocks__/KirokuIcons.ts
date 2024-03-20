const KirokuIcons = jest.requireActual('../KirokuIcons');

module.exports = Object.keys(KirokuIcons).reduce((prev, curr) => {
  // We set the name of the anonymous mock function here so we can dynamically build the list of mocks and access the
  // "name" property to use in accessibility hints for element querying
  const fn = () => '';
  Object.defineProperty(fn, 'name', {value: curr});
  return {...prev, [curr]: fn};
}, {});
