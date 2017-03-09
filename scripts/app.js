
(function() {
  "use strict";

  // set up hangManModule as Revealing Module
  const hangManModule = function() {
    const wordDisplay = document.querySelector('.word');
    const guessForm = document.querySelector('.guess-form');
    const userGuess = document.querySelector('.user-guess');
    const turnsDisplay = document.querySelector('.turns');
    const newGame = document.querySelector('.new-game');
    const gameResult = document.querySelector('.game-result');
    const currStatus = document.querySelector('.game-status');

    let turns;
    let currentWord;
    let guesses= [];

    // local storage setup
    const storage = {
      set() {
        localStorage.setItem('word', currentWord);
        localStorage.setItem('guesses', JSON.stringify(guesses));
        localStorage.setItem('turns', JSON.stringify(turns));
      },
      get() {
        return JSON.parse(localStorage.word);
        return JSON.parse(localStorage.guesses);
        return JSON.parse(localStorage.turns);
      },
      clear() {
        localStorage.removeItem('guesses');
        localStorage.removeItem('turns');
        localStorage.removeItem('currentWord');
      }
    }

    // evaluate user guess against currentWord
    function checkGuess(guess) {
      // prevent user from making same guess more than once
      if (guesses.indexOf(guess) === -1) {

        const chars = document.querySelectorAll('.char');
        let guessStatus = '';
        // check whether guess is part of current word
        if (currentWord.includes(guess)) {
          for (let index = 0; index < chars.length; index++) {
            if (currentWord.charAt(index) === guess) {
              chars[index].innerHTML = guess;
              chars[index].classList.add('descend');
            }
            guessStatus += chars[index].innerHTML;
          }
        } else {
          // decrement turns
          turns--;
          turnUpdate();
        }

        // if loss
        if (turns === 0 && guessStatus !== currentWord) {
          gameEnd(false);
        } else if (guessStatus === currentWord) {
          gameEnd(true);
        }
      }

      // store guess
      guesses.push(guess);
      storage.set();
      currStatus.innerHTML = guesses.toString();
    }

    function turnUpdate() {
      turnsDisplay.innerHTML = '';
      // add a list item for the number of turns
      for (let index = 0; index < turns; index++) {
        const turn = document.createElement('li');
        turn.classList = 'turn';
        turnsDisplay.appendChild(turn);

        const turnSprite = document.createElement('img');
        turnSprite.src = 'http://bit.ly/2ktXofQ';
        turnSprite.alt = 'potion';
        turn.appendChild(turnSprite);
      }
    }

    function gameEnd(won) {
      let msgImgs = [
        {
          win: 'yes', src: 'https://media.giphy.com/media/CE5MnZFgbVZmg/giphy-downsized-large.gif', alt: 'Rustic Man Approving'
        },
        {
          win: 'no', src: 'https://admin.mashable.com/wp-content/uploads/2013/07/Dr.-Who.gif', alt: 'Sad Dr Who'
        }];

      wordDisplay.innerHTML = currentWord;
      const resultMsg = document.createElement('img');
      resultMsg.classList = 'result-msg';
      if (won === true) {
        resultMsg.src = msgImgs[0].src;
        resultMsg.alt = msgImgs[0].alt;
      } else if (won === false) {
        resultMsg.src = msgImgs[1].src;
        resultMsg.alt = msgImgs[1].alt;
      }
      gameResult.appendChild(resultMsg);
      gameResult.classList.add('game-over');
      currStatus.classList.add('game-over');
      guessForm.classList.add('game-over');
    }

    // set up game display for current word
    function newWord(word) {
      resetGame();

      // make a new list item for each character
      for (let index = 0; index < word.length; index++) {
        const char = document.createElement('li');
        char.className = 'char';
        char.innerHTML = '_';
        wordDisplay.appendChild(char);
      }
    }

    // reset game
    function resetGame() {
      turns = 8;
      turnUpdate();
      guesses = [];

      wordDisplay.innerHTML = '';
      currStatus.innerHTML = '';
      gameResult.innerHTML = '';
      gameResult.classList.remove('game-over');
      currStatus.classList.remove('game-over');
      guessForm.classList.remove('game-over');
    }

    // pick a random available word with 3 or more characters
    function wordPicker(words) {
      let wordList = [];

      // only pick from words with 3+ characters
      for (let index = 0; index < words.length; index++) {
        if (words[index].content.length >= 3) {
          wordList.push(words[index].content);
        }
      }

      // pick random word from wordList
      currentWord = wordList[Math.floor(Math.random() * wordList.length)];
      console.log(currentWord);
      newWord(currentWord);
    }

    // request word data
    function getWordData() {
      let http = new XMLHttpRequest();
      http.onreadystatechange = function() {
        if (http.readyState === 4 && http.status === 200) {
          const wordData = JSON.parse(http.response);

          // send data to word picker function
          wordPicker(wordData);
        }
      }

      http.open('GET', 'data/words.json', true);
      http.send();
    }

    // evaluate guess on form submit
    guessForm.addEventListener('submit', () => {
      event.preventDefault();
      checkGuess(userGuess.value);
      guessForm.reset();
    });

    // start a new game on new word click
    newGame.addEventListener('click', () => {
      event.preventDefault();
      getWordData();
    });

    return {
      getWordData: getWordData
    };
  };

  // put this in event handler for new word button
  const hangmanApp = hangManModule();
  hangmanApp.getWordData();
})();
