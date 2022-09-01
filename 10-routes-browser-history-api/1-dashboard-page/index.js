import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element = "";
  arrayWithCharts = [];
  subElements = {};
  range = {
    from: new Date(),
    to: new Date(),
  };

  onDateSelectFunction = async (event) => {
    this.range.from = event.detail.from;
    this.range.to = event.detail.to;

    this.arrayWithCharts.forEach((object) => this.chartsFill(object));
    await this.addBestSellers();
  };

  constructor() {
    this.getDatesForRange();
    this.makeURL();

    this.initEventListeners();
    this.chartArrayFill();
  }

  chartArrayFill() {
    const charts = {
      orders: {
        label: "orders",
        link: "/sales",
      },
      sales: {
        label: "sales",
        formatHeading: (data) => `$${data}`,
      },
      customers: {
        label: "customers",
      },
    };

    this.arrayWithCharts = Object.values(charts);
  }

  initEventListeners() {
    document.addEventListener("date-select", this.onDateSelectFunction);
  }

  makeURL(
    path,
    from = this.range.from.toISOString(),
    to = this.range.to.toISOString()
  ) {
    const url = new URL(`/api/dashboard/${path}`, BACKEND_URL);

    url.searchParams.set("from", from);
    url.searchParams.set("to", to);

    return url.pathname + url.search;
  }

  getDatesForRange() {
    this.range.from = new Date();
    this.range.to = new Date();

    this.range.from.setMonth(this.range.from.getMonth() - 1);
  }

  makeTemplate() {
    const elem = document.createElement("div");

    elem.innerHTML = `    
    <div class="dashboard">
        <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
        <!-- sortable-table component -->
        </div>
    </div>`;

    this.element = elem.firstElementChild;

    this.getSubElements();
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll("[data-element]");

    for (const element of subElements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  addRangePicker() {
    const rangePicker = new RangePicker(this.range);

    return rangePicker.element;
  }

  async addBestSellers() {
    const path = "bestsellers";
    const urlBestSellers = this.makeURL(path);

    const bestSellersTable = new SortableTable(header, {
      url: urlBestSellers,
      isSortLocally: true,
    });

    this.subElements.sortableTable.innerHTML = "";
    this.subElements.sortableTable.append(bestSellersTable.element);
  }

  async chartsFill({
    label = "",
    link = "",
    range = this.range,
    formatHeading = (data) => data,
  }) {
    const url = this.makeURL(label);

    const columnChart = new ColumnChart({
      label,
      range,
      url,
      link,
      formatHeading,
    });

    let elementName = label + "Chart";

    this.subElements[elementName].innerHTML = "";
    this.subElements[elementName].append(columnChart.element);
  }

  render = async () => {
    this.makeTemplate();

    const rangePicker = this.addRangePicker();
    this.subElements.rangePicker.append(rangePicker);

    await this.addBestSellers();

    this.arrayWithCharts.forEach((object) => this.chartsFill(object));

    return this.element;
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
