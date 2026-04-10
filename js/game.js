const Game = {
  words: [],
  state: null,

  async loadWords() {
    if (this.words.length > 0) return;
    var resp = await fetch('data/words.json');
    this.words = await resp.json();
  },

  startNew(playerNames) {
    var whitemanIndex = Math.floor(Math.random() * playerNames.length);
    var wordPair = this._pickWord([]);
    var scores = {};
    playerNames.forEach(function(name) { scores[name] = 0; });

    this.state = {
      players: playerNames,
      whitemanIndex: whitemanIndex,
      normalWord: wordPair.normal,
      whitemanWord: wordPair.whiteman,
      round: 1,
      eliminated: [],
      usedWordIndices: [this.words.indexOf(wordPair)],
      scores: scores,
      dealOrder: this._shuffleOrder(playerNames.length)
    };

    Storage.saveCurrentGame(this.state);
    Storage.addRecentPlayers(playerNames);
    return this.state;
  },

  resume() {
    this.state = Storage.getCurrentGame();
    return this.state;
  },

  getActivePlayers() {
    var eliminated = this.state.eliminated;
    return this.state.players.filter(function(_, i) {
      return eliminated.indexOf(i) === -1;
    });
  },

  getActivePlayerIndices() {
    var eliminated = this.state.eliminated;
    return this.state.players.map(function(_, i) { return i; }).filter(function(i) {
      return eliminated.indexOf(i) === -1;
    });
  },

  getWordForPlayer(playerIndex) {
    var lang = I18n.lang;
    if (playerIndex === this.state.whitemanIndex) {
      return this.state.whitemanWord[lang];
    }
    return this.state.normalWord[lang];
  },

  getDealOrder() {
    var active = this.getActivePlayerIndices();
    return this.state.dealOrder.filter(function(i) {
      return active.indexOf(i) !== -1;
    });
  },

  eliminate(playerIndex) {
    var isWhiteman = playerIndex === this.state.whitemanIndex;
    var self = this;

    if (isWhiteman) {
      this.getActivePlayerIndices().forEach(function(i) {
        if (i !== self.state.whitemanIndex) {
          self.state.scores[self.state.players[i]] += 1;
        }
      });
    } else {
      this.state.scores[this.state.players[this.state.whitemanIndex]] += 1;
      this.state.eliminated.push(playerIndex);
    }

    Storage.saveCurrentGame(this.state);

    var whitemanWins = !isWhiteman && this._checkWhitemanWins();

    return {
      correct: isWhiteman,
      eliminatedPlayer: this.state.players[playerIndex],
      whitemanName: this.state.players[this.state.whitemanIndex],
      gameOver: isWhiteman || whitemanWins
    };
  },

  _checkWhitemanWins() {
    var active = this.getActivePlayerIndices();
    if (active.length <= 2) {
      this.state.scores[this.state.players[this.state.whitemanIndex]] += 1;
      Storage.saveCurrentGame(this.state);
      return true;
    }
    return false;
  },

  isWhitemanWinner() {
    var active = this.getActivePlayerIndices();
    return active.length <= 2 && active.indexOf(this.state.whitemanIndex) !== -1;
  },

  nextRound() {
    this.state.round += 1;
    this.state.dealOrder = this._shuffleOrder(this.state.players.length);
    Storage.saveCurrentGame(this.state);
  },

  endGame() {
    Storage.updateLeaderboard(this.state.scores);
    Storage.clearCurrentGame();
  },

  _pickWord(usedIndices) {
    var available = this.words.filter(function(_, i) {
      return usedIndices.indexOf(i) === -1;
    });
    if (available.length === 0) {
      return this.words[Math.floor(Math.random() * this.words.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  },

  _shuffleOrder(count) {
    var arr = [];
    for (var i = 0; i < count; i++) arr.push(i);
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }
};
