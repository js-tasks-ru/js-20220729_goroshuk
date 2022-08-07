/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    if (Object.entries(obj).length === 0) {
      return undefined;
    }

    const way = path.split(".");

    let value;

    way.forEach((item, index) => {
      if (index > 0) {
        value = value[item];
      }

      if (index === 0) {
        value = obj[item];
      }
    });

    return value;
  };
}
