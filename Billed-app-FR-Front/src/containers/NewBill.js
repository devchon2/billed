import { formatDateToStore } from "../app/format.js";
import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    this.formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    this.formNewBill.addEventListener("submit", this.handleSubmit.bind(this));

    this.fileInput = this.document.querySelector(`input[data-testid="file"]`);
    this.fileInput.addEventListener("change", this.handleChangeFile.bind(this));
    this.fileName = null;
    this.billId = null;
    this.grantedMimeType = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/gif",
    ];

    this.user = JSON.parse(localStorage.getItem("user"));
    this.email = `${this.user.email}`;
    this.token = localStorage.getItem("jwt");

    new Logout({ document, localStorage, onNavigate });

    this.fileButton = this.formNewBill.querySelector(`input#file`);
    this.submitButton = this.formNewBill.querySelector(`button#btn-send-bill`);
    this.document.addEventListener("change", () => {
      this.checkInputs([
        this.formNewBill.querySelector(`select[data-testid="expense-type"]`),
        this.formNewBill.querySelector(`input[data-testid="expense-name"]`),
        this.formNewBill.querySelector(`input[data-testid="amount"]`),
        this.formNewBill.querySelector(`input[data-testid="datepicker"]`),
        this.formNewBill.querySelector(`input[data-testid="vat"]`),
        this.formNewBill.querySelector(`input[data-testid="pct"]`),
        this.formNewBill.querySelector(`textarea[data-testid="commentary"]`),
      ]);
    });
  }

  checkInputs = (arrayFromFormElements) => {
    const enableValidate = arrayFromFormElements.every(
      (e) => e.value !== "" && e.value !== null
    );
    this.fileButton.disabled = !enableValidate;
    if (this.fileButton.files[0] !== undefined) {
      this.submitButton.disabled = !enableValidate;
    }
  };

  handleChangeFile = (e) => {
    e.preventDefault();
    this.file = this.fileInput.files[0];
    this.mimetype = this.file.type;
  
    if (!this.grantedMimeType.includes(this.mimetype)) {
      this.fileInput.value = null;
      this.file = null;
      alert("Mauvais format de fichier! \n Seuls les fichiers .jpg, .jpeg, .png et .gif sont acceptés");
      return;
    }

    const expanseType = `${this.formNewBill.querySelector(
      `select[data-testid="expense-type"]`
    ).value}`;
    const expenseName = `${this.formNewBill.querySelector(
      'input[data-testid="expense-name"]'
    ).value}`;

    const amount =
      parseInt(this.formNewBill.querySelector(`input[data-testid="amount"]`).value) ||
      0;
    const date = formatDateToStore(
      this.formNewBill.querySelector(`input[data-testid="datepicker"]`).value);
    const vat = `${this.formNewBill.querySelector(`input[data-testid="vat"]`).value.toString() || '0'}`;
    const pct =
      parseInt(this.formNewBill.querySelector(`input[data-testid="pct"]`).value) || 20;
    const commentary = `${this.formNewBill.querySelector(
      `textarea[data-testid="commentary"]`
    ).value}`;
  
    const formData = new FormData();
    formData.append("name", expenseName);
    formData.append('type', expanseType),
    formData.append('email', this.email),
    formData.append('date', date),
    formData.append('vat', vat),
    formData.append('pct', pct),
    formData.append('commentary', commentary),
    formData.append('status', "pending"),
    formData.append('commentAdmin', ""),
    formData.append('amount', amount),
    formData.append("file", this.file, this.fileName);
    
  
    this.store.bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        }})
    .then(({ filePath, key, id }) => {
      this.billId = id;
      this.key = key;
      this.path = filePath.replace('public\\', 'public/');
      console.log("this.path", this.path);
    })
    .catch((error) => console.error(error));
  };

  handleSubmit = (e) => {
    debugger;
    e.preventDefault();
    const expanseType = `${this.formNewBill.querySelector(
      `select[data-testid="expense-type"]`
    ).value}`;
    const expenseName = `${this.formNewBill.querySelector(
      'input[data-testid="expense-name"]'
    ).value}`;

    const amount =
      parseInt(this.formNewBill.querySelector(`input[data-testid="amount"]`).value) ||
      0;
    const date = formatDateToStore(
      this.formNewBill.querySelector(`input[data-testid="datepicker"]`).value);
    const vat = `${this.formNewBill.querySelector(`input[data-testid="vat"]`).value.toString() || '0'}`;
    const pct =
      parseInt(this.formNewBill.querySelector(`input[data-testid="pct"]`).value) || 20;
    const commentary = `${this.formNewBill.querySelector(
      `textarea[data-testid="commentary"]`
    ).value}`;
    

    
    const bill = {
      name: expenseName,
      type: expanseType,
      email: this.email,
      date: date,
      vat: vat,
      pct: pct,
      commentary: commentary,
      status: "pending",
      commentAdmin: "",
      amount: amount,
    };

    this.updateBill(bill);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({
          data: JSON.stringify(bill),
          headers: {
            noContentType: true,
          },
          selector: this.key,
        })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
