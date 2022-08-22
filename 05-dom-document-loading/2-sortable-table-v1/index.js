export default class SortableTable {
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.checkHeaderTemplateFunction();
    this.getConfigId();
    this.render();
  }

  getTemplateOfTable() {
    return `
    <div class="sortable-table"></div>
    `;
  }

  checkHeaderTemplateFunction() {
    if (this.headerConfig[0].template) {
      this.template = this.headerConfig[0].template;
    }
  }

  getConfigId() {
    this.arrWithId = [];

    for (const item of this.headerConfig) {
      this.arrWithId.push(item.id);
    }
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

    const arrayHTML = this.headerConfig.map((item) => {
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-sorttype="${item.sortType}">
      <span>${item.title}</span>
    </div>`;
    });

    header.innerHTML += arrayHTML.join("");

    this.subElements["header"] = header;

    this.element.append(header);
  }

  makeBody() {
    const body = document.createElement("div");

    body.classList.add("sortable-table__body");

    body.setAttribute("data-element", "body");

    this.subElements["body"] = body;

    if (this.template) {
      this.bodyFillWithImage(this.data);
    } else {
      this.bodyFillNoImage(this.data);
    }

    this.element.append(body);
  }

  bodyFillWithImage(data) {
    this.subElements.body.innerHTML = `
      ${data
        .map((good) => {
          return `
        <div class="sortable-table__row">
          ${this.template(this.data)}
          ${this.arrWithId
            .map((id, index) => {
              if (index !== 0) {
                return `<div class="sortable-table__cell">${good[id]}</div>`;
              }
            })
            .join("")}
        </div>`;
        })
        .join("")}`;
  }

  bodyFillNoImage(data) {
    this.subElements.body.innerHTML = `
      ${data
        .map((good) => {
          return `
        <div class="sortable-table__row">
          ${this.arrWithId
            .map((id) => `<div class="sortable-table__cell">${good[id]}</div>`)
            .join("")}
        </div>`;
        })
        .join("")}`;
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

    if (this.template) {
      this.bodyFillWithImage(sortedArr);
    } else {
      this.bodyFillNoImage(sortedArr);
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
