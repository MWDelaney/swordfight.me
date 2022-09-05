class SwordFight extends HTMLElement {

  constructor() {
    super();
    this.attrs = {};
  }

  connectedCallback() {
    this.init();
  }


  init = async () => {

    /**
     * Test data
     */
    let myMove = "54";
    let currentRound = "1";

    // Get the character data
    const character = await require("../../../data/humanFighter.json");

    // Get the current path which contains the fight data for the opponent's current move
    let pathSplit = window.location.pathname.split("/").filter(entry => !!entry);

    // Split up the path and get the round and opponent's current move
    const [round, opponentsMove] = pathSplit;

    // Get the outcome tables from the character data
    let outcomes = character.tables;
    let results = character.results;

    // Get the results of this round
    let outcome = this.getOutcome(myMove, opponentsMove, outcomes);
    let result = this.getResult(outcome, results);

    console.log(result);
  }

  /**
   * getOutcome
   * Get the outcome of the current pair of moves
   * @param {string} myMove - The move my character made
   * @param {string} opponentMove - The move the opponent made
   * @param {object} table - The outcome tables for my move
   * @returns {string} - The outcome of the current round
   */
  getOutcome = (myMove, opponentsMove, outcomes) => {
    // Initialize the outcome variable
    let outcome = "";

    // Get the outcome table for the current move
    let table = outcomes.find(outcome => outcome.id == myMove).outcomes[0];

    // Look the opponent's move in my move's outcome table
    outcome = table[opponentsMove];

    // Return the outcome (number) as a string
    return outcome;
  }

  /**
   * getResult
   * Get the result of the current round
   * @param {string} outcome - The outcome of the current pair of moves
   * @returns {obj} - The result of the current round
   */
  getResult = (outcome, results) => {
    // Initialize the result variable
    let result = {};
    result = results.find(result => result.id == outcome);

    return result;
  }
}

if("customElements" in window) {
  window.customElements.define("sword-fight", SwordFight);
}
