import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import Tooltip from "../../06-events-practice/2-tooltip/index.js";

import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element = "";
  chartsInfo = [];
  chartElements = [];
  subElements = {};
  components = {};
  range = {
    from: new Date(),
    to: new Date(),
  };

  onDateSelectFunction = async (event) => {
    try {
      const { from, to } = event.detail;

      this.chartElements.forEach((chart) => chart.update(from, to));

      await this.bestSellersReFill(from, to);
    } catch (error) {
      console.log(error);
    }
  };

  constructor() {
    this.getDatesForRange();

    this.chartsInfoFill();
  }

  chartsInfoFill() {
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

    this.chartsInfo = Object.values(charts);
  }

  initEventListeners() {
    this.element.addEventListener("date-select", this.onDateSelectFunction);
  }

  makeURL(path, from = this.range.from, to = this.range.to) {
    const url = new URL(`/api/dashboard/${path}`, BACKEND_URL);

    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());

    return url.pathname + url.search;
  }

  getDatesForRange() {
    this.range.from = new Date();
    this.range.to = new Date();

    this.range.from.setMonth(this.range.from.getMonth() - 1);
  }

  makeTooltip() {
    this.tooltip = new Tooltip();

    this.tooltip.initialize();
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

    this.components.rangePicker = rangePicker;

    return rangePicker.element;
  }

  addBestSellers() {
    const path = "bestsellers";
    const urlBestSellers = this.makeURL(path);

    const bestSellersTable = new SortableTable(header, {
      url: urlBestSellers,
      isSortLocally: true,
    });

    this.subElements.sortableTable.innerHTML = "";
    this.subElements.sortableTable.append(bestSellersTable.element);

    this.components.bestSellersTable = bestSellersTable;
  }

  async bestSellersReFill(from, to) {
    try {
      const previousUrl = this.components.bestSellersTable.url;

      previousUrl.searchParams.set("from", from.toISOString());
      previousUrl.searchParams.set("to", to.toISOString());

      const data = await fetchJson(previousUrl);

      this.components.bestSellersTable.addRows(data);
    } catch (error) {
      console.log(error);
    }
  }

  chartsFill({
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

    const elementName = label + "Chart";

    this.subElements[elementName].innerHTML = "";
    this.subElements[elementName].append(columnChart.element);

    this.chartElements.push(columnChart);
  }

  render = () => {
    this.makeTemplate();

    const rangePicker = this.addRangePicker();
    this.subElements.rangePicker.append(rangePicker);

    this.addBestSellers();

    this.chartsInfo.forEach((object) => this.chartsFill(object));

    this.initEventListeners();
    this.makeTooltip();

    return this.element;
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();

    this.tooltip.destroy();

    for (const component of Object.keys(this.components)) {
      this.components[component].destroy();
    }

    for (const chart of this.chartElements) {
      chart.destroy();
    }

    this.element = null;
    this.subElements = null;
    this.chartsInfo = null;
    this.chartElements = null;
    this.range = null;

    document.removeEventListener("date-select", this.onDateSelectFunction);
  }
}
