export default class NotificationMessage {
  constructor(message = "", { duration = 0, type = "" } = {}) {
    NotificationMessage.removeElement();

    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  static removeElement() {
    if (NotificationMessage.classElem) {
      NotificationMessage.classElem.remove();
    }
  }

  getTemplate() {
    return `
    <div class="notification" style="--value: ${this.duration * 0.001}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">${this.message}</div>
      </div>
    </div>
        `;
  }

  classAdd() {
    return this.type === "success"
      ? this.element.classList.add("success")
      : this.element.classList.add("error");
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.classAdd();

    NotificationMessage.classElem = this.element;
  }

  show(target = document.body) {
    target.append(NotificationMessage.classElem);

    if (NotificationMessage.intervalId) {
      clearTimeout(NotificationMessage.intervalId);
      NotificationMessage.intervalId = setTimeout(this.remove, this.duration);
    } else {
      NotificationMessage.intervalId = setTimeout(this.remove, this.duration);
    }
  }

  remove() {
    NotificationMessage.removeElement();
  }

  destroy() {
    this.remove();
  }
}
