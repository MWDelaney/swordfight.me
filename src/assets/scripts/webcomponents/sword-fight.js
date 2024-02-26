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

  async connectedCallback() {

    // Create a shadow root
    const shadowRoot = this.attachShadow({ mode: 'open' });

    // Add the template to the shadow root
    const template = this.querySelector('#swordFightTemplate');
    const clone = document.importNode(template.content, true);
    shadowRoot.appendChild(clone);

    // Fetch the styles
    const response = await fetch('/assets/styles/styles.css');
    const styles = await response.text();

    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;

    // Append the style element to the shadow root
    this.shadowRoot.appendChild(styleElement);

    // Initialize the game
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
    let characterSheetMovesList = this.shadowRoot.getElementById("myMoves");
    characterSheetMovesList.addEventListener("click", this.handleMoveClick);
  }


  /**
   * handleMoveClick
   */
  handleMoveClick = (e) => {
    if (e.target.classList.contains("button-move") || e.target.parentElement.classList.contains("button-move")) {
      let move = e.target;
      let myMove = move.getAttribute("data-id");

      // Get the opponent's move
      let opponentsMove = this.randomOpponentsMove(this.getAttribute("data-result"))

      // Set up the game with the new moves
      this.setUpGame(myMove, opponentsMove);
    }
  }


  /**
   * setUpGame
   *
   * @param {string} myMove - The move my character made (default: "62" "jumping back")
   * @param {string} opponentsMove - The move the opponent made (default: "62" "jumping back")
   * @returns {void}
   */
  setUpGame = (myMove = "62", opponentsMove = "62") => {

    // Scroll to the top of the page
    window.scrollTo(0, 0);

    // Log the characters
    console.log("My Character: ", this.myCharacter.name);
    console.log("Opponent's Character: ", this.opponentsCharacter.name);

    // Log the moves
    console.log("My Move: ", myMove);
    console.log("Opponent's Move: ", opponentsMove);

    // Insert the characters' names into the view
    let opponentsNameHeading = this.shadowRoot.getElementById("opponentsName");
    opponentsNameHeading.innerHTML = this.opponentsCharacter.name;

    let myNameHeading = this.shadowRoot.getElementById("myName");
    myNameHeading.innerHTML = this.myCharacter.name;


    /**
     * Set up my character and results
     *
     * In this game, my moves are come from my character's data, and my
     * outcomes and results come from my opponent's character's data.
     */

    // Get my results of this round
    let myOutcome = this.getOutcome(myMove, opponentsMove, this.opponentsCharacter.tables);
    let myResult = this.getResult(myOutcome, this.opponentsCharacter.results);
    // If there's a modifier, get it and its value
    let myModifier = myResult.mod;

    // Get the opponent's result of this round
    let opponentsOutcome = this.getOutcome(opponentsMove, myMove, this.myCharacter.tables);
    let opponentsResult = this.getResult(opponentsOutcome, this.myCharacter.results);
    // If there's a modifier, get it and its value
    let opponentsModifier = opponentsResult.mod;

    // Set an attribute on the sword-fight element with the current result's ID for reference next round
    this.setAttribute("data-result", myResult.id);

    // Set an attribute on the sword-fight element with the opponent's result for the next round
    this.setAttribute("data-opponent-result", myResult.id);


    /**
     * Update the characters' health
     */
    // If the opponent's score is greater than 0, subtract the opponent's result's score from my character's health
    if(opponentsResult.score > 0) {
      console.log("Hit: ", opponentsResult.score);
      this.myHealth -= opponentsResult.score;
      console.log("My Health: ", (this.myHealth));
    }

    // If my score is greater than 0, subtract my result's score from the opponent's character's health
    if(myResult.score > 0) {
      console.log("Hit: ", myResult.score);
      this.opponentsHealth -= myResult.score;
      console.log("Opponent's Health: ", (this.opponentsHealth));
    }


    /**
     * Set up the view
     *
     * Now that the math is done, we can update the view with the new data
     */

    // Insert the characters' health into the view
    let myHealthElement = this.shadowRoot.getElementById("myHealth");
    myHealthElement.innerHTML = this.myHealth;

    let opponentsHealthElement = this.shadowRoot.getElementById("opponentsHealth");
    opponentsHealthElement.innerHTML = this.opponentsHealth;


    // Populate #theLastOutcome with the name of the outcome
    let myView = this.shadowRoot.getElementById("myView");
    myView.innerHTML = myResult.name;


    /**
     * Recap the previous round
     *
     * Show the moves and results from the previous round
     */
    // Get the recap element
    let recap = this.shadowRoot.getElementById("recapList");
    let recapText = "";

    // Write my recap
    let myRecap = `You did a ` + this.myCharacter.moves.find(move => move.id == myMove).tag + ` ` + this.myCharacter.moves.find(move => move.id == myMove).name + ` and now you see your opponent ` + myResult.name + `.`;

    // Stringify the result's restrict array with commas
    let myRestrictions = "";
    myResult.restrict.forEach((restriction, index) => {
      if(myResult.restrict.length > 1 && index == myResult.restrict.length - 1) {
        // Make a strong element for the last item in the array
        myRestrictions += "or <strong>" + restriction + "</strong> ";
      } else if(myResult.restrict.length > 1) {
        myRestrictions += "<strong>" + restriction + "</strong>, ";
      } else {
        myRestrictions += "<strong>" + restriction + "</strong> ";
      }
    });

    // If the result's restrict array is not empty, add it to the recap
    if(myResult.restrict.length > 0) {
      myRecap += `<div class="card bg-stext-econdary"><div class="card-body">Your opponent cannot do any ` + myRestrictions + ` this round</div></div>`;
    }

    // Write the opponent's recap
    let opponentRecap = `Your opponent did a ` + this.opponentsCharacter.moves.find(move => move.id == opponentsMove).tag + ` ` + this.opponentsCharacter.moves.find(move => move.id == opponentsMove).name + ` they see you ` + opponentsResult.name + `.`;

    // Stringify the result's restrict array with commas and an "or" if necessary
    let opponentRestrictions = "";
    opponentsResult.restrict.forEach((restriction, index) => {
      if(opponentsResult.restrict.length > 1 && index == opponentsResult.restrict.length - 1) {
        // Make a strong element for the last item in the array
        opponentRestrictions += "or <strong>" + restriction + "</strong> ";
      } else if(opponentsResult.restrict.length > 1) {
        opponentRestrictions += "<strong>" + restriction + "</strong>, ";
      }
      else {
        opponentRestrictions += "<strong>" + restriction + "</strong> ";
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
     *
     * Get all the move my character can do, then filter them with the restrictions from the last round
     *
     * Then, create buttons for each move in the list.
     */
    // Get all my character's moves
    let myMoves = this.myCharacter.moves;

    // Get the moves filtered by the result of the last round
    let myFilteredMoves = this.filterMoves(this.myCharacter.moves, opponentsResult);

    // Get the character's moves and create buttons in #myMoves with data-attributes for tag, range, type, and id
    let myMovesList = this.shadowRoot.getElementById("myMoves");

    // Clear the myMovesList
    myMovesList.innerHTML = "";

    // Arrange the moves in the list by tag, insert headers for each tag
    let tags = [];
    myMoves.forEach(move => {
      if(!tags.includes(move.tag)) {
        tags.push(move.tag);
      }
    });

    // Create a header and a list for each tag
    tags.forEach(tag => {
      let container = document.createElement("div");
      container.classList.add("moves-tag");

      let h3 = document.createElement("h3");
      h3.innerHTML = tag;
      container.appendChild(h3);

      let ul = document.createElement("ul");
      container.appendChild(ul);
      myMovesList.appendChild(container);

      myMoves.forEach(move => {
        if(move.tag == tag) {
          let li = document.createElement("li");
          let button = document.createElement("button");
          button.classList.add("button-move");

          // If this move is in the array of filtered moves, add a data-attribute for tag, range, type, and id
          if(myFilteredMoves.includes(move)) {
            button.setAttribute("data-tag", move.tag);
            button.setAttribute("data-range", move.range);
            button.setAttribute("data-type", move.type);
            button.setAttribute("data-id", move.id);

          } else {
            // If this move is not available, add a disabled attribute
            button.setAttribute("disabled", "disabled");
          }

          let modClass = "";

          // Test whether the move's "mod" value is positive or negative
          if(move.mod > 0) {
            modClass = "positive";
          } else {
            modClass = "negative";
          }

          // Check if this move gets a modifier due to the last round's results
          let modifier = this.applyModifiers(move, myModifier);

          // If the move's modifier is not false, add a data-attribute for the modifier
          button.setAttribute("data-modifier", modifier);


          // Set the button's innerHTML to the move's tag and name
          button.innerHTML = `<span class="move-tag">` + move.tag + `</span> ` + move.name;
          button.innerHTML += ` <span class="move-modifier ` + modClass + `">` + move.mod + `</span>`;
          if(modifier > 0 && modifier != "false") {
            button.innerHTML += ` <span class="round-modifier">` + modifier + `</span>`;
          }
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
   * applyModifiers
   *
   * Apply damage modifiers from the previous round
   */
  applyModifiers = (move, modifier) => {
    // If the move's modifier is 0, return false
    if(modifier == 0) {
      return false;
    }

    // If the move's modifier is not an array, and is greater than 0, return the modifier
    if(!Array.isArray(modifier) && modifier > 0) {
      return modifier;
    }

    // If the move's modifier is an array, and the move's type is in the array, return the modifier from the type key
    if(Array.isArray(modifier)) {
      if(modifier.includes(move.type)) {
        return modifier[move.type];
      }
    }

    // If the move's modifier is an array, and the move's tag is in the array, return the modifier from the tag key
    if(Array.isArray(modifier)) {
      if(modifier.includes(move.tag)) {
        return modifier[move.tag];
      }
    }
  }


  /**
   * getOutcome
   * Get the outcome of the current pair of moves
   * @param {string} myMove - The move my character made
   * @param {string} opponentsMove - The move the opponent made
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


  /**
   * randomOpponentsMove
   * Get a random move for the opponent
   * @param {string} result - The result of the last round
   * @returns {string} - The move the opponent made
   */
  randomOpponentsMove = (lastResult) => {
    // Look up the results table for the current result
    let result = this.opponentsCharacter.results.find(result => result.id == lastResult);

    // Get the opponent's available moves
    let moves = this.filterMoves(this.opponentsCharacter.moves, result);

    // Get a random move from the opponent's moves
    return moves[Math.floor(Math.random() * moves.length)].id;
  }
}

if("customElements" in window) {
  window.customElements.define("sword-fight", SwordFight);
}
