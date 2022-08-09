/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return "";
  }

  if (!size) {
    return string;
  }

  let count = 0;

  let helper = [];

  const arr = [...string];

  arr.forEach((item, index) => {
    if (arr[index] === arr[index - 1]) {
      count++;

      if (count < size) {
        helper.push(arr[index]);
      }

      if (count > size) {
        return;
      }
    }

    if (arr[index] !== arr[index - 1]) {
      count = 0;
      helper.push(arr[index]);
    }
  });

  return helper.join("");
}
