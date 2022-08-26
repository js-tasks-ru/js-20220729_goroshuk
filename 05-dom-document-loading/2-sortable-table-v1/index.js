export default class SortableTable {
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  getTemplateOfTable() {
    [];
    return `
    <div class="sortable-table"></div>
    `;
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplateOfTable();

    this.element = element.firstElementChild;

    this.makeHeader();
    this.makeBody();
  }

  makeHeader() {
    const header = document.createElement("div");

    header.classList += "sortable-table__header sortable-table__row";

    header.setAttribute("data-element", "header");

    header.innerHTML = this.headerConfig
      .map((item) => {
        if (item.sortType) {
          return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-sorttype="${item.sortType}">
      <span>${item.title}</span>
    </div>`;
        } else {
          return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
      </div>`;
        }
      })
      .join("");

    this.subElements.header = header;

    this.element.append(header);
  }

  makeBody() {
    const body = document.createElement("div");

    body.classList.add("sortable-table__body");

    body.setAttribute("data-element", "body");

    this.subElements.body = body;

    this.subElements.body.innerHTML += this.bodyRowFill(this.data);

    this.element.append(body);
  }

  bodyRowFill(data) {
    return data
      .map((item) => {
        return `<div class="sortable-table__row">${this.bodyCellFill(
          item
        )}</div>`;
      })
      .join("");
  }

  bodyCellFill(item) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return {
        id,
        template,
      };
    });

    return cells
      .map(({ id, template }) => {
        return template
          ? template(item[id])
          : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join("");
  }

  checkType(id) {
    const element = this.subElements.header.querySelector(`[data-id="${id}"]`);

    return element.dataset.sorttype;
  }

  sort(whatSort, typeSort) {
    const sortedArr = [...this.data];

    const type = this.checkType(whatSort);

    const sortMethods = {
      asc: 1,
      desc: -1,
    };

    sortedArr.sort((a, b) => {
      if (type === "string") {
        return (
          sortMethods[typeSort] *
          a[whatSort].localeCompare(b[whatSort], "ru-en", {
            sensitivity: "case",
            caseFirst: "upper",
          })
        );
      }

      if (type === "number") {
        return sortMethods[typeSort] * (a[whatSort] - b[whatSort]);
      }
    });

    this.subElements.body.innerHTML = this.bodyRowFill(sortedArr);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
