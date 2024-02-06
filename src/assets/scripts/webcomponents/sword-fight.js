class SwordFight extends HTMLElement {

  constructor() {
    super();
    this.attrs = {};

    // Load my character
    this.myCharacter = require("../../../data/humanFighter.json");

    // Load the opponent's character
    this.opponentsCharacter = require("../../../data/evilHumanFighter.json");

    // Set my character's health from the data
    this.myHealth = this.myCharacter.health;

    // Set the opponent's character's health from the data
    this.opponentsHealth = this.opponentsCharacter.health;
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

    // Scroll to the top of the page
    window.scrollTo(0, 0);

    // Log the characters
    console.log("My Character: ", this.myCharacter.name);
    console.log("Opponent's Character: ", this.opponentsCharacter.name);

    // Log the moves
    console.log("My Move: ", myMove);
    console.log("Opponent's Move: ", opponentMove);

    // Insert the characters' names into the view
    let opponentsNameHeading = document.getElementById("opponentsCharactersName");
    opponentsNameHeading.innerHTML = this.opponentsCharacter.name;

    let myNameHeading = document.getElementById("myCharactersName");
    myNameHeading.innerHTML = this.myCharacter.name;


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
     * Update the characters' health
     */
    // If the opponent's score is greater than 0, subtract the opponent's result's score from my character's health
    if(opponentsResult.score > 0) {
      this.myHealth -= myResult.score;
    }

    // If my score is greater than 0, subtract my result's score from the opponent's character's health
    if(myResult.score > 0) {
      this.opponentsHealth -= opponentsResult.score;
    }


    /**
     * Log the last round
     */
    //this.logRound(myMove, opponentMove, this.myCharacter.tables, this.opponentsCharacter.tables, myResult, opponentsResult);


    /**
     * Set up the view
     */

    // Insert the characters' health into the view
    let myHealthElement = document.getElementById("myCharactersHealth");
    myHealthElement.innerHTML = this.myHealth;

    let opponentsHealthElement = document.getElementById("opponentsCharactersHealth");
    opponentsHealthElement.innerHTML = this.opponentsHealth;


    // Populate #theLastOutcome with the name of the outcome
    let viewName = document.getElementById("viewName");
    viewName.innerHTML = myResult.name;

    /**
     * Do the recap of the previous round
     */
    // Get the recap element
    let recap = document.getElementById("recapText");
    let recapText = "";

    // Write my recap

    let myRecap = `You did a ` + this.myCharacter.moves.find(move => move.id == myMove).tag + ` ` + this.myCharacter.moves.find(move => move.id == myMove).name + ` and now you see your opponent ` + myResult.name + `.`;

    // Stringify the result's restrict array with commas and an "or" if necessary
    let myRestrictions = "";
    myResult.restrict.forEach((restriction, index) => {
      if(index == myResult.restrict.length - 1) {
        myRestrictions += "or <strong>" + restriction + "</strong> ";
      } else {
        myRestrictions += "<strong>" + restriction + "</strong>, ";
      }
    });

    // If the result's restrict array is not empty, add it to the recap
    if(myResult.restrict.length > 0) {
      myRecap += `<div class="card bg-secondary text-white"><div class="card-body">Your opponent cannot do any ` + myRestrictions + ` this round</div></div>`;
    }

    // Write the opponent's recap
    let opponentRecap = `Your opponent did a ` + this.opponentsCharacter.moves.find(move => move.id == opponentMove).tag + ` ` + this.opponentsCharacter.moves.find(move => move.id == opponentMove).name + ` they see you ` + opponentsResult.name + `.`;

    // Stringify the result's restrict array with commas and an "or" if necessary
    let opponentRestrictions = "";
    opponentsResult.restrict.forEach((restriction, index) => {
      if(index == opponentsResult.restrict.length - 1) {
        opponentRestrictions += "or <strong>" + restriction + "</strong> ";
      } else {
        opponentRestrictions += "<strong>" + restriction + "</strong>, ";
      }
    });

    // If the result's restrict array is not empty, add it to the recap
    if(opponentsResult.restrict.length > 0) {
      opponentRecap += `<div class="card bg-primary text-white"><div class="card-body">You cannot do any ` + opponentRestrictions + ` this round</div></div>`;
    }

    recapText = `<div class="alert alert-primary">` + myRecap + `</div>`
    recapText += `<div class="alert alert-secondary">` + opponentRecap + `</div>`;

    // If my result has a score, add it to the recap
    if(myResult.score) {
      recapText += `<div class="alert alert-primary">Your score: ` + myResult.score + `</div>`;
    }

    // If the opponent's result has a score, add it to the recap
    if(opponentsResult.score) {
      recapText += `<div class="alert alert-secondary">Your opponent's score: ` + opponentsResult.score + `</div>`;
    }
    recap.innerHTML = recapText;

    /**
     * Set up the moves list
     */

    // Get all my character's moves
    let myMoves = this.myCharacter.moves;

    // Get the moves filtered by the result of the last round
    let myFilteredMoves = this.filterMoves(this.myCharacter.moves, opponentsResult);

    // Get the character's moves and create buttons in #characterSheetMovesList with data-attributes for tag, range, type, and id
    let characterSheetMovesList = document.getElementById("characterSheetMovesList");

    // Clear the characterSheetMovesList
    characterSheetMovesList.innerHTML = "";

    // Arrange the moves in the list by tag, insert headers for each tag
    let tags = [];
    myMoves.forEach(move => {
      if(!tags.includes(move.tag)) {
        tags.push(move.tag);
      }
    });

    // Create a header and a list for each tag
    tags.forEach(tag => {
      let h3 = document.createElement("h3");
      h3.innerHTML = tag;
      characterSheetMovesList.appendChild(h3);

      let ul = document.createElement("ul");
      characterSheetMovesList.appendChild(ul);

      myMoves.forEach(move => {
        if(move.tag == tag) {
          let li = document.createElement("li");
          let button = document.createElement("button");

          // If this move is in the array of filtered moves, add a data-attribute for tag, range, type, and id
          if(myFilteredMoves.includes(move)) {
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
          button.innerHTML += ` <span class="badge bg-light badge-pill">` + move.mod + `</span>`;
          li.appendChild(button);
          ul.appendChild(li);
        }
      });



    });
  }

  /**
   * filterMoves
   */
  filterMoves = (moves, result) => {
    // Filter the moves to only include the moves that are available to the character
    moves = moves.filter(move => {

      // If the result's allowOnly array is not empty, filter out any moves that have tags that, when converted to lowercase, are not in the allowOnly array
      if(result.allowOnly) {
        if(!result.allowOnly.includes(move.tag)) {
          return false;
        }
      }

      // If the move's range is not the same as the result's range, filter it out
      if(move.range != result.range) {
        return false;
      }

      // If the move's type is in the result's restrict array, filter it out
      if(result.restrict.includes(move.type)) {
        return false;
      }

      // If the move's tag is in the result's restrict array, filter it out
      if(result.restrict.includes(move.tag)) {
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
  // logRound = (myMove, opponentMove, character, opponentsCharacter, myResult, opponentResult) => {
  //   // Get the name of the move my character made
  //   let myMoveName = character.moves.find(move => move.id == myMove).tag + " " + character.moves.find(move => move.id == myMove).name;

  //   // Get the name of the result of my move
  //   let myResultName = myResult.name;

  //   // Get the name of the move the opponent made
  //   let opponentMoveName = opponentsCharacter.moves.find(move => move.id == opponentMove).tag + " " + opponentsCharacter.moves.find(move => move.id == opponentMove).name;

  //   // Get the name of the result of the opponent's moves
  //   let opponentResultName = opponentResult.name;

  //   // Concatenate myResult.restrict into <strong> tags
  //   let myRestrictions = "";
  //   myResult.restrict.forEach(restriction => {
  //     myRestrictions += "<strong>" + restriction + "</strong> ";
  //   });

  //   // Concatenate opponentResult.restrict into <strong> tags
  //   let opponentRestrictions = "";
  //   opponentResult.restrict.forEach(restriction => {
  //     opponentRestrictions += "<strong>" + restriction + "</strong> ";
  //   });

  //   // Create a list item in the log
  //   let log = document.getElementById("gameLogList");
  //   let li = document.createElement("li");

  //   li.innerHTML += `<div class="alert alert-primary">You did a ` + myMoveName + ` and your opponent was ` + myResultName + `<p>Your oponenent cannot do any ` + myRestrictions + `</div>`;
  //   li.innerHTML += `<div class="alert alert-warning">Your opponent did a ` + opponentMoveName + ` and you were ` + opponentResultName + `<p>You cannot do any ` + opponentRestrictions + `</div>`;

  //   // Append the LI to the log
  //   log.appendChild(li);
  // }



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
