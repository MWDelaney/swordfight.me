class SwordFight extends HTMLElement {

  constructor() {
    super();
    this.attrs = {};

    // Load my character
    this.myCharacter = require("../../../data/humanFighter.json");

    // Load the opponent's character
    this.opponentsCharacter = require("../../../data/evilHumanFighter.json");
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
    if(e.target.classList.contains("button-move")) {
      let move = e.target;
      let myMove = move.getAttribute("data-id");

              /**
               * Random opponent move
               */

              // Get my character's result from the previous round, since that's what will restrict the opponent's moves
              let lastResult = this.getAttribute("data-result");

              // Look up the results table for the current result
              let result = this.opponentsCharacter.results.find(result => result.id == lastResult);

              // Get the opponent's available moves
              let moves = this.filterMoves(this.opponentsCharacter.moves, result);

              // Get a random move from the opponent's moves
              let opponentMove = moves[Math.floor(Math.random() * moves.length)].id;

      // Set up the game with the new moves
      this.setUpGame(myMove, opponentMove);
    }
  }

  /**
   * setUpGame
   *
   */
  setUpGame = (myMove = "62", opponentMove = "62") => {

    // Log the characters
    console.log("My Character: ", this.myCharacter.name);
    console.log("Opponent's Character: ", this.opponentsCharacter.name);

    // Log the moves
    console.log("My Move: ", myMove);
    console.log("Opponent's Move: ", opponentMove);

    /**
     * Set up your character and results
     *
     * In this game, your moves are come from your character's data, and your outcomes and results come from your opponent's character's data.
     */


    // Get the results of this round
    let myOutcome = this.getOutcome(myMove, opponentMove, this.opponentsCharacter.tables);
    let myResult = this.getResult(myOutcome, this.opponentsCharacter.results);

    // Get the opponent's result of this round
    let opponentsOutcome = this.getOutcome(opponentMove, myMove, this.myCharacter.tables);
    let opponentsResult = this.getResult(opponentsOutcome, this.myCharacter.results);

    // Set an attribute on the sword-fight element with the current result's ID for reference next round
    this.setAttribute("data-result", myResult.id);

    // Set an attribute on the sword-fight element with the opponent's result for the next round
    this.setAttribute("data-opponent-result", myResult.id);

    /**
     * Log the last round
     */
    //this.logRound(myMove, opponentMove, this.myCharacter.tables, this.opponentsCharacter.tables, myResult, opponentsResult);


    /**
     * Set up the view
     */

    // Populate #theLastOutcome with the name of the outcome
    let viewName = document.getElementById("viewName");
    viewName.innerHTML = myResult.name;


    /**
     * Set up what happened to you
     */
    let whatHappened = document.getElementById("whatHappened");
    whatHappened.innerHTML = opponentsResult.name;



    /**
     * Set up the moves list
     */

    // Get all my character's moves
    let myMoves = this.myCharacter.moves;

    // Get the moves filtered by the result of the last round
    let myFilteredMoves = this.filterMoves(this.myCharacter.moves, opponentsResult);

    // Get the character's moves and create buttons in #characterSheetMovesList with data-attributes for tag, range, type, and id
    let characterSheetMovesList = document.getElementById("characterSheetMovesList");
    characterSheetMovesList.innerHTML = "";
    myMoves.forEach(move => {
      let button = document.createElement("button");
      // If this move is available, add all the data-attributes
      if(myFilteredMoves.find(filteredMove => filteredMove.id == move.id)) {
        button.setAttribute("data-tag", move.tag);
        button.setAttribute("data-range", move.range);
        button.setAttribute("data-type", move.type);
        button.setAttribute("data-id", move.id);
        button.classList.add("button-move");

      } else {
        // If this move is not available, add a disabled attribute
        button.setAttribute("disabled", "disabled");
      }

      // Set the button's innerHTML to the move's tag and name
      button.innerHTML = move.tag + " - " + move.name;

      button.innerHTML += `<span class="badge badge-primary badge-pill">` + move.id + `</span>`;

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

      // Log the array of restricted move types

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

    // Concatenate myResult.restrict into <strong> tags
    let myRestrictions = "";
    myResult.restrict.forEach(restriction => {
      myRestrictions += "<strong>" + restriction + "</strong> ";
    });

    // Concatenate opponentResult.restrict into <strong> tags
    let opponentRestrictions = "";
    opponentResult.restrict.forEach(restriction => {
      opponentRestrictions += "<strong>" + restriction + "</strong> ";
    });

    // Create a list item in the log
    let log = document.getElementById("gameLogList");
    let li = document.createElement("li");

    li.innerHTML += `<div class="alert alert-primary">You did a ` + myMoveName + ` and your opponent was ` + myResultName + `<p>Your oponenent cannot do any ` + myRestrictions + `</div>`;
    li.innerHTML += `<div class="alert alert-warning">Your opponent did a ` + opponentMoveName + ` and you were ` + opponentResultName + `<p>You cannot do any ` + opponentRestrictions + `</div>`;

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
  getOutcome = (myMove, opponentsMove, tables) => {
    // Get the outcome array for the current moves
    let table = tables.find(table => table.id == myMove).outcomes[0];

    // Look the opponent's move in my move's outcome table
    let outcome = table[opponentsMove];

    // Log the outcome
    console.log("Outcome: ", outcome);

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
    let result = results.find(result => result.id == outcome);

    // Log the result
    console.log("Result: ", result);

    return result;
  }
}

if("customElements" in window) {
  window.customElements.define("sword-fight", SwordFight);
}
