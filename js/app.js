// js/app.js

// === Screen Modules ===

var WelcomeScreen = {
  render: function() {
    document.querySelectorAll('#screen-welcome [data-i18n]').forEach(function(el) {
      el.textContent = I18n.t(el.dataset.i18n);
    });
  },
  init: function() {
    document.getElementById('btn-new-game').addEventListener('click', function() {
      Sounds.play('tap');
      App.showScreen('setup');
      SetupScreen.render();
    });
    document.getElementById('btn-leaderboard').addEventListener('click', function() {
      Sounds.play('tap');
      App.showScreen('leaderboard');
      LeaderboardScreen.render();
    });
  }
};

var SetupScreen = {
  count: 4,
  MIN: 3,
  MAX: 10,

  render: function() {
    document.querySelectorAll('#screen-setup [data-i18n]').forEach(function(el) {
      el.textContent = I18n.t(el.dataset.i18n);
    });
    this._renderInputs();
    this._renderRecent();
    this._validateForm();
  },

  init: function() {
    var self = this;
    document.getElementById('btn-count-minus').addEventListener('click', function() {
      if (self.count > self.MIN) { self.count--; Sounds.play('tap'); self._updateCount(); }
    });
    document.getElementById('btn-count-plus').addEventListener('click', function() {
      if (self.count < self.MAX) { self.count++; Sounds.play('tap'); self._updateCount(); }
    });
    document.getElementById('btn-clear-recent').addEventListener('click', function() {
      if (confirm(I18n.t('confirm'))) { Storage.clearRecentPlayers(); self._renderRecent(); }
    });
    document.getElementById('btn-start-game').addEventListener('click', function() {
      Sounds.play('confirm');
      self._startGame();
    });
  },

  _updateCount: function() {
    document.getElementById('player-count').textContent = this.count;
    this._renderInputs();
    this._renderRecent();
    this._validateForm();
  },

  _renderInputs: function() {
    var container = document.getElementById('player-inputs');
    var existing = container.querySelectorAll('input');
    var existingValues = Array.from(existing).map(function(inp) { return inp.value; });
    var self = this;

    container.textContent = '';
    for (var i = 0; i < this.count; i++) {
      var row = document.createElement('div');
      row.className = 'player-input-row';
      var span = document.createElement('span');
      span.textContent = '\uD83D\uDC64';
      var input = document.createElement('input');
      input.type = 'text';
      input.dataset.index = i;
      input.placeholder = I18n.t('enterName');
      input.maxLength = 20;
      input.autocomplete = 'off';
      if (existingValues[i]) input.value = existingValues[i];
      input.addEventListener('input', function() { self._validateForm(); });
      row.appendChild(span);
      row.appendChild(input);
      container.appendChild(row);
    }
  },

  _renderRecent: function() {
    var recent = Storage.getRecentPlayers();
    var section = document.getElementById('recent-players-section');
    var list = document.getElementById('recent-players-list');
    var self = this;

    if (recent.length === 0) { section.style.display = 'none'; return; }

    section.style.display = 'block';
    list.textContent = '';
    recent.forEach(function(name) {
      var chip = document.createElement('span');
      chip.className = 'recent-chip';
      chip.textContent = name;
      chip.addEventListener('click', function() {
        Sounds.play('tap');
        self._fillNextEmpty(name);
      });
      list.appendChild(chip);
    });
  },

  _fillNextEmpty: function(name) {
    var inputs = document.querySelectorAll('#player-inputs input');
    for (var i = 0; i < inputs.length; i++) {
      if (!inputs[i].value.trim()) {
        inputs[i].value = name;
        this._validateForm();
        return;
      }
    }
  },

  _validateForm: function() {
    var inputs = document.querySelectorAll('#player-inputs input');
    var names = Array.from(inputs).map(function(i) { return i.value.trim(); });
    var allFilled = names.every(function(n) { return n.length > 0; });
    var allUnique = new Set(names).size === names.length;
    document.getElementById('btn-start-game').disabled = !(allFilled && allUnique);
  },

  _startGame: function() {
    var inputs = document.querySelectorAll('#player-inputs input');
    var names = Array.from(inputs).map(function(i) { return i.value.trim(); });

    Game.loadWords().then(function() {
      Game.startNew(names);
      App.showScreen('deal');
      DealScreen.start();
    });
  }
};
var DealScreen = {
  dealQueue: [],
  currentIndex: 0,
  revealed: false,

  render: function() {
    document.querySelectorAll('#screen-deal [data-i18n]').forEach(function(el) {
      el.textContent = I18n.t(el.dataset.i18n);
    });
    if (this.dealQueue.length > 0) {
      var playerIdx = this.dealQueue[this.currentIndex];
      document.getElementById('deal-player-name').textContent = Game.state.players[playerIdx];
      document.getElementById('deal-word').textContent = Game.getWordForPlayer(playerIdx);
    }
  },

  init: function() {
    var self = this;
    document.getElementById('deal-card').addEventListener('click', function() {
      self._toggleReveal();
    });
    document.getElementById('btn-got-it').addEventListener('click', function() {
      Sounds.play('confirm');
      self._next();
    });
  },

  start: function() {
    this.dealQueue = Game.getDealOrder();
    this.currentIndex = 0;
    this._showCurrentPlayer();
  },

  _showCurrentPlayer: function() {
    this.revealed = false;
    document.getElementById('deal-card-front').style.display = 'flex';
    document.getElementById('deal-card-back').style.display = 'none';
    document.getElementById('btn-got-it').disabled = true;

    var playerIdx = this.dealQueue[this.currentIndex];
    document.getElementById('deal-player-name').textContent = Game.state.players[playerIdx];
    document.getElementById('deal-word').textContent = Game.getWordForPlayer(playerIdx);
    this.render();
  },

  _toggleReveal: function() {
    if (!this.revealed) {
      this.revealed = true;
      document.getElementById('deal-card-front').style.display = 'none';
      document.getElementById('deal-card-back').style.display = 'flex';
      Sounds.play('reveal');
    } else {
      this.revealed = false;
      document.getElementById('deal-card-front').style.display = 'flex';
      document.getElementById('deal-card-back').style.display = 'none';
      document.getElementById('btn-got-it').disabled = false;
      Sounds.play('hide');
    }
  },

  _next: function() {
    this.currentIndex++;
    if (this.currentIndex >= this.dealQueue.length) {
      App.showScreen('discuss');
      DiscussScreen.render();
    } else {
      this._showCurrentPlayer();
    }
  }
};
var DiscussScreen = {
  render: function() {
    document.querySelectorAll('#screen-discuss [data-i18n]').forEach(function(el) {
      el.textContent = I18n.t(el.dataset.i18n);
    });
    var container = document.getElementById('discuss-players');
    container.textContent = '';
    Game.getActivePlayers().forEach(function(name) {
      var chip = document.createElement('span');
      chip.className = 'discuss-chip';
      chip.textContent = name;
      container.appendChild(chip);
    });
  },

  init: function() {
    document.getElementById('btn-done-discuss').addEventListener('click', function() {
      Sounds.play('tap');
      App.showScreen('vote');
      VoteScreen.render();
    });
  }
};
var VoteScreen = {
  selectedIndex: null,
  emojis: ['\uD83D\uDE00', '\uD83D\uDE0E', '\uD83E\uDD20', '\uD83D\uDE0A', '\uD83E\uDD29', '\uD83D\uDE04', '\uD83E\uDD73', '\uD83D\uDE42', '\uD83D\uDE3A', '\uD83E\uDD17'],

  render: function() {
    document.querySelectorAll('#screen-vote [data-i18n]').forEach(function(el) {
      el.textContent = I18n.t(el.dataset.i18n);
    });
    this.selectedIndex = null;
    document.getElementById('btn-eliminate').disabled = true;

    var grid = document.getElementById('vote-grid');
    grid.textContent = '';
    var self = this;
    var activeIndices = Game.getActivePlayerIndices();
    activeIndices.forEach(function(playerIdx) {
      var card = document.createElement('div');
      card.className = 'vote-card';
      card.dataset.playerIndex = playerIdx;

      var emojiDiv = document.createElement('div');
      emojiDiv.className = 'vote-card-emoji';
      emojiDiv.textContent = self.emojis[playerIdx % self.emojis.length];

      var nameDiv = document.createElement('div');
      nameDiv.className = 'vote-card-name';
      nameDiv.textContent = Game.state.players[playerIdx];

      card.appendChild(emojiDiv);
      card.appendChild(nameDiv);

      card.addEventListener('click', function() {
        Sounds.play('tap');
        self._select(playerIdx);
      });
      grid.appendChild(card);
    });
  },

  init: function() {
    var self = this;
    document.getElementById('btn-eliminate').addEventListener('click', function() {
      if (self.selectedIndex === null) return;
      Sounds.play('vote');
      self._eliminate();
    });
  },

  _select: function(playerIndex) {
    this.selectedIndex = playerIndex;
    document.querySelectorAll('.vote-card').forEach(function(c) { c.classList.remove('selected'); });
    var selected = document.querySelector('.vote-card[data-player-index="' + playerIndex + '"]');
    if (selected) selected.classList.add('selected');
    document.getElementById('btn-eliminate').disabled = false;
  },

  _eliminate: function() {
    var result = Game.eliminate(this.selectedIndex);
    App.showScreen('result');
    ResultScreen.show(result);
  }
};
var ResultScreen = {
  render: function() {},

  init: function() {
    document.getElementById('btn-next-round').addEventListener('click', function() {
      Sounds.play('tap');
      Game.nextRound();
      App.showScreen('deal');
      DealScreen.start();
    });
    document.getElementById('btn-to-gameover').addEventListener('click', function() {
      Sounds.play('tap');
      App.showScreen('gameover');
      GameOverScreen.render();
    });
  },

  show: function(result) {
    var screen = document.getElementById('screen-result');
    screen.classList.remove('result-correct', 'result-wrong', 'result-whiteman-wins');

    var emoji = document.getElementById('result-emoji');
    var title = document.getElementById('result-title');
    var subtitle = document.getElementById('result-subtitle');
    var btnNext = document.getElementById('btn-next-round');
    var btnGameOver = document.getElementById('btn-to-gameover');

    if (result.correct) {
      screen.classList.add('result-correct');
      emoji.textContent = '\uD83C\uDF89';
      title.textContent = I18n.t('foundWhiteman');
      subtitle.textContent = result.whitemanName + ' ' + I18n.t('wasWhiteman');
      btnNext.style.display = 'none';
      btnGameOver.style.display = 'block';
      btnGameOver.textContent = I18n.t('mainMenu');
      Sounds.play('victory');
      Confetti.fire(3000);
    } else if (result.gameOver) {
      screen.classList.add('result-whiteman-wins');
      emoji.textContent = '\uD83D\uDE08';
      title.textContent = I18n.t('whitemanWins');
      subtitle.textContent = result.whitemanName + ' ' + I18n.t('wasWhiteman');
      btnNext.style.display = 'none';
      btnGameOver.style.display = 'block';
      btnGameOver.textContent = I18n.t('mainMenu');
      Sounds.play('evil');
    } else {
      screen.classList.add('result-wrong');
      screen.classList.add('animate-shake');
      setTimeout(function() { screen.classList.remove('animate-shake'); }, 600);
      emoji.textContent = '\uD83D\uDE22';
      title.textContent = I18n.t('wrongGuess');
      subtitle.textContent = result.eliminatedPlayer + ' ' + I18n.t('wasInnocent');
      btnNext.style.display = 'block';
      btnNext.textContent = I18n.t('nextRound');
      btnGameOver.style.display = 'none';
      Sounds.play('wrong');
    }
  }
};
var GameOverScreen = {
  lastPlayers: [],

  render: function() {
    document.querySelectorAll('#screen-gameover [data-i18n]').forEach(function(el) {
      el.textContent = I18n.t(el.dataset.i18n);
    });

    var isTeamWin = !Game.isWhitemanWinner();
    var emoji = document.getElementById('gameover-emoji');
    var title = document.getElementById('gameover-title');
    var subtitle = document.getElementById('gameover-subtitle');

    if (isTeamWin) {
      emoji.textContent = '\uD83C\uDFC6';
      title.textContent = I18n.t('teamWins');
    } else {
      emoji.textContent = '\uD83D\uDE08';
      title.textContent = I18n.t('whitemanWins');
    }
    subtitle.textContent = I18n.t('theWhitemanWas') + ' ' + Game.state.players[Game.state.whitemanIndex];

    var scoresDiv = document.getElementById('gameover-scores');
    scoresDiv.textContent = '';
    var whitemanName = Game.state.players[Game.state.whitemanIndex];
    var sortedPlayers = Object.entries(Game.state.scores).sort(function(a, b) { return b[1] - a[1]; });
    sortedPlayers.forEach(function(entry) {
      var name = entry[0];
      var score = entry[1];
      var row = document.createElement('div');
      var isWM = name === whitemanName;
      row.className = 'score-row' + (isWM ? ' whiteman-row' : '');

      var nameSpan = document.createElement('span');
      nameSpan.className = 'score-row-name';
      nameSpan.textContent = name;

      var scoreSpan = document.createElement('span');
      scoreSpan.className = 'score-row-points';
      scoreSpan.textContent = score + ' ' + I18n.t('points');

      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      scoresDiv.appendChild(row);
    });

    this.lastPlayers = Game.state.players.slice();
    Game.endGame();
  },

  init: function() {
    var self = this;
    document.getElementById('btn-play-again').addEventListener('click', function() {
      Sounds.play('tap');
      if (self.lastPlayers.length > 0) {
        Game.loadWords().then(function() {
          Game.startNew(self.lastPlayers);
          App.showScreen('deal');
          DealScreen.start();
        });
      }
    });
    document.getElementById('btn-new-game-go').addEventListener('click', function() {
      Sounds.play('tap');
      App.showScreen('setup');
      SetupScreen.render();
    });
    document.getElementById('btn-main-menu').addEventListener('click', function() {
      Sounds.play('tap');
      App.showScreen('welcome');
      WelcomeScreen.render();
    });
  }
};
var LeaderboardScreen = {
  render: function() {
    document.querySelectorAll('#screen-leaderboard [data-i18n]').forEach(function(el) {
      el.textContent = I18n.t(el.dataset.i18n);
    });

    var list = document.getElementById('leaderboard-list');
    var board = Storage.getLeaderboard();

    if (board.length === 0) {
      list.textContent = '';
      var empty = document.createElement('p');
      empty.className = 'lb-empty';
      empty.textContent = I18n.t('noScoresYet');
      list.appendChild(empty);
      return;
    }

    list.textContent = '';
    board.forEach(function(entry, i) {
      var row = document.createElement('div');
      row.className = 'lb-row';

      var rank = document.createElement('span');
      rank.className = 'lb-rank';
      rank.textContent = i + 1;

      var name = document.createElement('span');
      name.className = 'lb-name';
      name.textContent = entry.name;

      var score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = entry.score + ' ' + I18n.t('points');

      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(score);
      list.appendChild(row);
    });
  },

  init: function() {
    var self = this;
    document.getElementById('btn-clear-leaderboard').addEventListener('click', function() {
      if (confirm(I18n.t('confirm'))) {
        Storage.clearLeaderboard();
        self.render();
      }
    });
    document.getElementById('btn-lb-back').addEventListener('click', function() {
      Sounds.play('tap');
      App.showScreen('welcome');
      WelcomeScreen.render();
    });
  }
};

// === App Controller ===

var App = {
  currentScreen: 'welcome',

  init: function() {
    var savedLang = Storage.getLang();
    I18n.setLang(savedLang);
    var activeBtn = document.querySelector('.lang-btn[data-lang="' + savedLang + '"]');
    document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.remove('active'); });
    if (activeBtn) activeBtn.classList.add('active');

    this.bindLangSwitcher();
    WelcomeScreen.init();
    SetupScreen.init();
    DealScreen.init();
    DiscussScreen.init();
    VoteScreen.init();
    ResultScreen.init();
    GameOverScreen.init();
    LeaderboardScreen.init();

    WelcomeScreen.render();
    this.showScreen('welcome');
  },

  showScreen: function(name) {
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    var screen = document.getElementById('screen-' + name);
    if (screen) {
      screen.classList.add('active');
      screen.classList.add('animate-in');
      this.currentScreen = name;
    }
  },

  bindLangSwitcher: function() {
    var self = this;
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = btn.dataset.lang;
        document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        Storage.setLang(lang);
        I18n.setLang(lang);
        self.renderCurrentScreen();
      });
    });
  },

  renderCurrentScreen: function() {
    switch (this.currentScreen) {
      case 'welcome': WelcomeScreen.render(); break;
      case 'setup': SetupScreen.render(); break;
      case 'deal': DealScreen.render(); break;
      case 'discuss': DiscussScreen.render(); break;
      case 'vote': VoteScreen.render(); break;
      case 'result': ResultScreen.render(); break;
      case 'gameover': GameOverScreen.render(); break;
      case 'leaderboard': LeaderboardScreen.render(); break;
    }
  }
};

document.addEventListener('DOMContentLoaded', function() { App.init(); });
