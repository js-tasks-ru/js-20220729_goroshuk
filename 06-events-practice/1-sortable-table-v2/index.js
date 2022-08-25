export default class SortableTable {
  subElements = {};
  elementWithArrow;

  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

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
    if (this.headersConfig[0].template) {
      this.template = this.headersConfig[0].template;
    }
  }

  startSortPosition() {
    this.elementWithArrow = this.subElements.header.querySelector(
      `[data-id="${this.sorted.id}"]`
    );

    this.elementWithArrow.setAttribute("data-order", this.sorted.order);

    this.elementWithArrow.innerHTML += `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;

    this.sort(this.sorted.id, this.sorted.order);
  }

  onClick = (event) => {
    const cell = event.target.closest(".sortable-table__cell");

    if (cell.dataset.sortable === "true") {
      const id = cell.dataset.id;

      const orders = {
        asc: "desc",
        desc: "asc",
      };

      if (!cell.hasAttribute("data-order")) {
        this.elementWithArrow.removeAttribute("data-order");

        const arrow = this.elementWithArrow.querySelector(
          "[data-element='arrow']"
        );

        arrow.remove();

        this.elementWithArrow = cell;

        this.elementWithArrow.setAttribute("data-order", "desc");

        this.elementWithArrow.innerHTML += `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;

        this.sort(id, "desc");
      } else {
        const presentOrder = cell.dataset.order;

        cell.setAttribute("data-order", orders[presentOrder]);

        this.sort(id, orders[presentOrder]);
      }
    }
  };

  initEventListener() {
    const header = this.subElements.header;

    header.addEventListener("pointerdown", this.onClick);
  }

  getConfigId() {
    this.arrWithId = [];

    for (const item of this.headersConfig) {
      this.arrWithId.push(item.id);
    }
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplateOfTable();

    this.element = element.firstElementChild;

    this.makeHeader();
    this.makeBody();
    this.startSortPosition();
    this.initEventListener();
  }

  makeHeader() {
    const header = document.createElement("div");

    header.classList += "sortable-table__header sortable-table__row";

    header.setAttribute("data-element", "header");

    const arrayHTML = this.headersConfig.map((item) => {
      if (item.sortType) {
        return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-sorttype="${item.sortType}">
      <span>${item.title}</span>
    </div>`;
      } else {
        return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
      </div>`;
      }
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
              .map(
                (id) => `<div class="sortable-table__cell">${good[id]}</div>`
              )
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
          a[whatSort].localeCompare(b[whatSort], "ru", {
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
