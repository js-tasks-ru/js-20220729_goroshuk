export default class ColumnChart {
  chartHeight = 50;

  constructor(data) {
    this.data = data;
    this.render();
    this.elementFilling();
  }

  getTemplate() {
    return `
    <div class="column-chart" style="--chart-height: 50">
    <div class="column-chart__title">

    </div>
    <div class="column-chart__container">
      <div data-element="header" class="column-chart__header"></div>
      <div data-element="body" class="column-chart__chart">
        <div style="--value: 1" data-tooltip="3%"></div>
      </div>
    </div>
  </div>
          `;
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
  }

  elementFilling() {
    if (!this.data) {
      this.element.classList.add("column-chart_loading");
      return;
    }

    const elementWithValue = this.element.querySelector(
      ".column-chart__header"
    );

    const chartTitle = this.element.querySelector(".column-chart__title");

    if (this.checkLink()) {
      const link = this.data.link;
      const anchor = document.createElement("a");

      anchor.className = "column-chart__link";
      anchor.href = link;
      anchor.textContent = "View all";

      chartTitle.append(anchor);
    }

    if (this.data.label) {
      let labelToChange = this.data.label;
      labelToChange = labelToChange[0].toUpperCase() + labelToChange.slice(1);
      chartTitle.prepend(labelToChange);
    }

    if (this.data.value) {
      if (this.data.formatHeading) {
        elementWithValue.innerHTML = this.data.formatHeading(this.data.value);
      } else {
        elementWithValue.innerHTML = this.data.value;
      }
    }

    if (this.data.data && this.data.data.length !== 0) {
      this.update(this.data.data);
    } else {
      this.element.classList.add("column-chart_loading");
    }
  }

  initEventListeners() {}

  checkLink() {
    if (this.data) {
      return Object.hasOwn(this.data, "link");
    }
  }

  remove() {
    this.element.remove();
  }

  update(data) {
    const chartsContainer = this.element.querySelector(".column-chart__chart");

    const arrFromData = data;
    const maxValue = Math.max(...arrFromData);
    const scale = this.chartHeight / maxValue;

    chartsContainer.innerHTML = arrFromData
      .map((value) => {
        return `<div style="--value: ${Math.floor(
          value * scale
        )}" data-tooltip="${
          ((value / maxValue) * 100).toFixed(0) + "%"
        }"></div>`;
      })
      .join("");
  }

  destroy() {
    this.remove();
  }
}
