import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  subElements = {};
  data = [];
  loading = false;
  elementWithArrow;
  BACKEND_URL = "https://course-js.javascript.ru";
  start = 0;
  end = 30;

  onClick = async (event) => {
    const cell = event.target.closest(".sortable-table__cell");

    if (cell.dataset.sortable === "true") {
      const { id } = cell.dataset;

      const orders = {
        asc: "desc",
        desc: "asc",
      };

      this.subElements.body.innerHTML = "";
      this.subElements.body.append(this.loadingElement);

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

        if (this.isSortLocally) {
          this.sortOnClient(id, "desc");
        } else {
          this.start = 0;
          this.end = 30;

          this.data = [];

          this.sortOnServer(id, "desc");
        }
      } else {
        const presentOrder = cell.dataset.order;

        cell.setAttribute("data-order", orders[presentOrder]);

        if (this.isSortLocally) {
          this.sortOnClient(id, orders[presentOrder]);
        } else {
          this.start = 0;
          this.end = 30;

          this.data = [];

          this.sortOnServer(id, orders[presentOrder]);
        }
      }
    }
  };

  onScroll = async (event) => {
    const lastChild = this.subElements.body.lastElementChild;
    const bottom = lastChild.getBoundingClientRect().bottom;
    const screenHeight = document.documentElement.clientHeight;

    if (bottom < screenHeight && !this.loading) {
      const order = this.elementWithArrow.dataset.order;
      const id = this.elementWithArrow.dataset.id;
      const range = 30;

      this.loading = true;

      this.start += range;
      this.end += range;

      await this.sortOnServer(id, order);

      this.loading = false;
    }
  };

  constructor(
    headersConfig,
    { data = [], sorted = {}, url = "", isSortLocally = false } = {}
  ) {
    this.data = data;
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, this.BACKEND_URL);

    this.render();
  }

  async startSortPosition() {
    if (Object.entries(this.sorted).length === 0) {
      this.defaultSorting();
      return;
    }

    this.elementWithArrow = this.subElements.header.querySelector(
      `[data-id="${this.sorted.id}"]`
    );

    this.elementWithArrow.setAttribute("data-order", this.sorted.order);

    this.elementWithArrow.innerHTML += `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;

    this.data = await this.loadData(
      this.sorted.id,
      this.sorted.order,
      this.start,
      this.end
    );

    this.bodyReFilling();
  }

  emptyData() {
    const div = document.createElement("div");

    div.innerHTML = `
    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
      </div>
    </div>`;

    div.firstElementChild.style.display = "flex";

    this.subElements.body.innerHTML = "";

    this.subElements.body.append(div.firstElementChild);
  }

  async loadData(
    id = "title",
    order = "asc",
    start = this.start,
    end = this.end
  ) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);

    const response = await fetchJson(this.url);

    return response;
  }

  async defaultSorting() {
    this.elementWithArrow =
      this.subElements.header.querySelector(`[data-id="title"]`);

    this.elementWithArrow.setAttribute("data-order", "asc");

    this.elementWithArrow.innerHTML += `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;
  }

  bodyReFilling() {
    if (this.data.length === 0) {
      this.emptyData();
    } else {
      this.subElements.body.innerHTML = this.bodyRowFill(this.data);
    }
  }

  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplateOfTable();

    this.element = element.firstElementChild;

    this.makeHeader();

    this.data = await this.loadData();

    this.makeBody();

    this.startSortPosition();
    this.initEventListener();
  }

  initEventListener() {
    const header = this.subElements.header;

    header.addEventListener("pointerdown", this.onClick);
    document.addEventListener("scroll", this.onScroll);
  }

  getTemplateOfTable() {
    return `
      <div class="sortable-table"></div>
      `;
  }

  makeHeader() {
    const header = document.createElement("div");

    header.classList += "sortable-table__header sortable-table__row";

    header.setAttribute("data-element", "header");

    header.innerHTML = this.headersConfig
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

    const div = document.createElement("div");

    div.innerHTML = `<div
    data-element="loading"
    class="loading-line sortable-table__loading-line"
  ></div>`;

    const loading = div.firstElementChild;

    this.subElements.loading = loading;

    this.subElements.body = body;

    if (this.data.length === 0) {
      this.emptyData();
    } else {
      this.subElements.body.innerHTML = this.bodyRowFill(this.data);
    }

    this.element.append(body);
    this.element.append(loading);
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

  sortOnClient(whatSort, typeSort) {
    if (this.data.length === 0) {
      return;
    }

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

  async sortOnServer(id, order) {
    const response = await this.loadData(id, order, this.start, this.end);

    if (response.length > 0) {
      this.subElements.loading.style.display = "block";

      this.data = [...this.data, ...response];

      this.bodyReFilling();
    } else {
      this.subElements.loading.style.display = "";
      return;
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener("scroll", this.onScroll);
    this.remove();
  }
}
