export default class SortableTable {
  subElements = {};
  elementWithArrow;

  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }

  getTemplateOfTable() {
    return `
      <div class="sortable-table"></div>
      `;
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
      const { id } = cell.dataset;

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

    header.innerHTML = this.headersConfig
      .map((item) => {
        return `
        <div class="sortable-table__cell" ${
          item.sortType ? `data-sorttype=${item.sortType}` : ""
        } data-id="${item.id}" data-sortable="${item.sortable}">
              <span>${item.title}</span>
             </div>`;
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

    this.subElements.body.innerHTML = this.bodyRowFill(this.data);

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
    const cells = this.headersConfig.map(({ id, template }) => {
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

    this.subElements.body.innerHTML = this.bodyRowFill(sortedArr);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
