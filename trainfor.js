function sortStrings(arr, param = "asc") {
  let sortedArr = [...arr];

  if (param === "asc") {
    return sortedArr.sort((a, b) => {
      return a.localeCompare(b, undefined, {
        sensitivity: "case",
        caseFirst: "upper",
      });
    });
  }

  if (param === "desc") {
    return sortedArr.sort((a, b) => {
      return b.localeCompare(a, undefined, {
        sensitivity: "case",
        caseFirst: "upper",
      });
    });
  }
}

data = [
  "Соска (пустышка) NUK 10729357",
  "ТВ тюнер D-COLOR  DC1301HD",
  "Детский велосипед Lexus Trike Racer Trike",
  "Соска (пустышка) Philips SCF182/12",
  "Powerbank аккумулятор Hiper SP20000",
];

console.log(sortStrings(data, "desc"));
