import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  сategories = [];
  productInfo = {};
  productImages = [];
  subElements = {};

  deleteImageByClick = (event) => {
    if (event.target.tagName === "IMG" && !event.target.closest("span")) {
      event.target.closest("li").remove();
    }
  };

  constructor(productId) {
    this.productId = productId;
  }

  async makeTemplate() {
    const div = document.createElement("div");

    div.innerHTML = `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer"><ul class="sortable-list"></ul></div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory" id="subcategory">
            ${this.categories
              .map((object) => {
                return object.subcategories
                  .map(
                    (category) =>
                      `<option value="${category.id}">${
                        object.title
                      } ${escapeHtml(">")} ${category.title}</option>`
                  )
                  .join("");
              })
              .join("")}            
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
    `;

    this.element = div.firstElementChild;
  }

  templateFill() {
    try {
      const elementsNameAttribute = this.element.querySelectorAll(`[name]`);

      for (const element of elementsNameAttribute) {
        let attributeName = element.getAttribute("name");

        this.subElements[attributeName] = element;

        if (element.tagName !== "BUTTON") {
          element.value = this.productInfo[attributeName];
        }
      }

      this.addImage();
    } catch (error) {
      console.log(error);
    }
  }

  addImage() {
    const imagesContainer = this.element.querySelector(".sortable-list");

    imagesContainer.innerHTML = this.productImages
      .map((image) => {
        return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`;
      })
      .join("");
  }

  makeInputFile() {
    const inputFile = document.createElement("input");

    inputFile.type = "file";
    inputFile.id = "file-input";

    this.subElements.inputFile = inputFile;

    // inputFile.hidden = true;

    document.body.append(inputFile);
  }

  initEventListeners() {
    this.element.addEventListener("click", this.deleteImageByClick);

    this.subElements.inputFile.addEventListener("change", this.onChange);

    this.subElements.uploadImage.addEventListener("click", (event) => {
      const myClick = new Event("click", {
        bubbles: true,
        details: "hey",
      });

      const inputFile = document.body.querySelector("#input-file");
      console.log(this.subElements.inputFile.button);
    });
  }

  onChange = async () => {
    const [file] = this.subElements.inputFile.files;

    await this.sentImage(file);
  };

  makeNewLi(image, name) {
    // not finished
    const div = document.createElement("div");

    div.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
    <input type="hidden" name="url" value="${image.link}">
    <input type="hidden" name="source" value="${name}">
    <span>
      <img src="icon-grab.svg" data-grab-handle="" alt="grab">
      <img class="sortable-table__cell-img" alt="Image" src="${image.link}">
    <span>${name}</span>
    </span>
    <button type="button">
      <img src="icon-trash.svg" data-delete-handle="" alt="delete">
    </button>
  </li>`;

    const li = div.firstElementChild;

    const imagesContainer = this.element.querySelector(".sortable-list");

    imagesContainer.append(li);
  }

  sentImage = async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    try {
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: "",
      });

      const result = await Object.assign(response.json());

      const { data } = result;

      console.log(data);
      this.makeNewLi(data, file.name);
      // return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  async loadCategories() {
    const urlCategories = new URL("api/rest/categories", BACKEND_URL);

    urlCategories.searchParams.set("_sort", "weight");
    urlCategories.searchParams.set("_refs", "subcategory");

    const categories = await fetchJson(urlCategories);

    this.categories = categories;
  }

  async loadProductInfo() {
    try {
      const urlInfo = new URL("api/rest/products", BACKEND_URL);

      urlInfo.searchParams.set("id", this.productId);

      const productInfo = await fetchJson(urlInfo);

      [this.productInfo] = productInfo;

      this.productImages = this.productInfo.images;
    } catch (error) {
      console.log(error);
    }
  }

  async render() {
    await this.loadCategories();
    await this.loadProductInfo();

    this.makeTemplate();
    this.templateFill();
    this.makeInputFile();
    this.initEventListeners();

    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.element.removeEventListener("click", this.deleteImageByClick);
    this.remove();
    this.element = null;
  }
}
