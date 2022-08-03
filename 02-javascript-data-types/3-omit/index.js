/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const args = [...fields];

  const object = {};

  Object.assign(object, obj);

  for (let item of args) {
    delete object[item];
  }

  return object;
};
