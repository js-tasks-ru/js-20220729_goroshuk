/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  let sortedArr = [...arr];

  if (param === "asc") {
    return sortedArr.sort((a, b) => {
      return a.localeCompare(b, "ru-en", {
        sensitivity: "case",
        caseFirst: "upper",
      });
    });
  }

  if (param === "desc") {
    return sortedArr.sort((a, b) => {
      return b.localeCompare(a, "ru-en", {
        sensitivity: "case",
        caseFirst: "upper",
      });
    });
  }
}
