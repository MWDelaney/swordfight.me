class SwordFight extends HTMLElement {

  constructor() {
    super();
    this.attrs = {};
  }

  connectedCallback() {
    this.init();
  }


  init = async () => {

    let pathSplit = window.location.pathname.split("/").filter(entry => !!entry);
    let [round, move] = pathSplit;
    console.log(pathSplit);
    // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
    // let value = params.some_key; // "some_value"

  }
}

if("customElements" in window) {
  window.customElements.define("sword-fight", SwordFight);
}
