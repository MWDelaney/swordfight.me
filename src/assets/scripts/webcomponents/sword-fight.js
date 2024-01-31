class SwordFight extends HTMLElement {

  constructor() {
    super();
    this.attrs = {};
  }

  connectedCallback() {
    this.init();
  }


  init = async () => {

    // Set up the game
    this.setUpGame();

    // Add event listeners
    this.addEventListeners();
  }

  /**
   * addEventListeners
   */
  addEventListeners = () => {
    // Add event listeners for the characterSheetMovesList buttons
    let characterSheetMovesList = document.getElementById("characterSheetMovesList");
    characterSheetMovesList.addEventListener("click", this.handleMoveClick);
  }

  /**
   * handleMoveClick
   */
  handleMoveClick = (e) => {
    let move = e.target;
    let myMove = move.getAttribute("data-id");

            /**
             * Random opponent move
             */
            let opponentsCharacter = require("../../../data/humanFighter.json");
            let results = opponentsCharacter.results;

            // Get the result id from the #sword-fight element
            let lastResult = this.getAttribute("data-result");

            // Look up the results table for the current result
            let result = results.find(result => result.id == lastResult);

            // Get the opponent's available moves
            let moves = this.filterMoves(opponentsCharacter.moves, result);

            // Get a random move from the opponent's moves
            let randomMove = moves[Math.floor(Math.random() * moves.length)];

            // Set the opponent's move to the random move's id
            let opponentMove = randomMove.id

    // Set up the game with the new moves
    this.setUpGame(myMove, opponentMove);
  }

  /**
   * setUpGame
   *
   */
  setUpGame = (myMove = "62", opponentMove = "62") => {

    /**
     * Set up your character and results
     */
    // Get the character data
    const character = require("../../../data/humanFighter.json");
    // Get the opponent's character data
    let opponentsCharacter = require("../../../data/humanFighter.json");

    // Get the outcome tables from the character data
    let outcomes = character.tables;
    let results = character.results;

    // Get the results of this round
    let outcome = this.getOutcome(myMove, opponentMove, outcomes);
    let result = this.getResult(outcome, results);

    // Get the opponent's outcome tables from the character data
    let opponentsOutcomes = opponentsCharacter.tables;
    let opponentsResults = opponentsCharacter.results;

    // Get the opponent's result of this round
    let opponentsOutcome = this.getOutcome(opponentMove, myMove, opponentsOutcomes);
    let opponentsResult = this.getResult(opponentsOutcome, opponentsResults);

    // console.log("Result: ", result);
    // console.log("Opponent's Result: ", opponentsResult);

    // Set an attribute on the sword-fight element with the current result's ID for reference next round
    this.setAttribute("data-result", result.id);

    // Set an attribute on the sword-fight element with the opponent's result for the next round
    this.setAttribute("data-opponent-result", result.id);

    /**
     * Log the last round
     */
    this.logRound(myMove, opponentMove, character, opponentsCharacter, result, opponentsResult);


    /**
     * Set up the view
     */

    // Populate #theLastOutcome with the name of the outcome
    let viewName = document.getElementById("viewName");
    viewName.innerHTML = result.name;


    /**
     * Set up what happened to you
     */
    let whatHappened = document.getElementById("whatHappened");
    whatHappened.innerHTML = opponentsResult.name;



    /**
     * Set up the moves list
     */

    // Filter the moves to only include the moves that are available to the character
    let moves = this.filterMoves(character.moves, result);

    // Get the character's moves and create buttons in #characterSheetMovesList with data-attributes for tag, range, type, and id
    let characterSheetMovesList = document.getElementById("characterSheetMovesList");
    characterSheetMovesList.innerHTML = "";
    moves.forEach(move => {
      let button = document.createElement("button");
      button.setAttribute("data-tag", move.tag);
      button.setAttribute("data-range", move.range);
      button.setAttribute("data-type", move.type);
      button.setAttribute("data-id", move.id);

      // Disable this move if it's out of range
      if(move.range != result.range) {
        button.disabled = true;
      }

      // result.restrict is an array of move types that are restricted. If this move is restricted, disable it
      if(result.restrict.includes(move.type)) {
        button.disabled = true;
      }

      button.innerHTML = move.tag + " - " + move.name;

      // Wrap each button in an li
      let li = document.createElement("li");
      li.appendChild(button);

      // Append the LI to the characterSheetMovesList
      characterSheetMovesList.appendChild(li);
    });

  }

  /**
   * filterMoves
   */
  filterMoves = (moves, result) => {
    // Filter the moves to only include the moves that are available to the character
    moves = moves.filter(move => {
      // If the move's range is not the same as the result's range, filter it out
      if(move.range != result.range) {
        return false;
      }

      // If the move's type is in the result's restrict array, filter it out
      if(result.restrict.includes(move.type)) {
        return false;
      }

      return true;
    });

    // Return the filtered moves
    return moves;
  }


  /**
   * logRound
   * Log the current round
   *
   * @param {string} myMove - The move my character made
   * @param {string} opponentMove - The move the opponent made
   */
  logRound = (myMove, opponentMove, character, opponentsCharacter, myResult, opponentResult) => {
    // Get the name of the move my character made
    let myMoveName = character.moves.find(move => move.id == myMove).tag + " " + character.moves.find(move => move.id == myMove).name;

    // Get the name of the result of my move
    let myResultName = myResult.name;

    // Get the name of the move the opponent made
    let opponentMoveName = opponentsCharacter.moves.find(move => move.id == opponentMove).tag + " " + opponentsCharacter.moves.find(move => move.id == opponentMove).name;

    // Get the name of the result of the opponent's move
    let opponentResultName = opponentResult.name;

    // Create a list item in the log
    let log = document.getElementById("gameLogList");
    let li = document.createElement("li");
    li.innerHTML = `<span class="game-log-my-move">` + myMoveName + `</span> vs <span class="game-log-opponents-move">` + opponentMoveName + `</span> <p>Resulting in: <span class="game-log-opponent-sees-result">` + myResultName + `</span> <span class="game-log-my-sees-result">` + opponentResultName + `</span></p>`;

    // Append the LI to the log
    log.appendChild(li);
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
