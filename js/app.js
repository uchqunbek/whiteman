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
var DiscussScreen = { render: function() {}, init: function() {} };
var VoteScreen = { render: function() {}, init: function() {} };
var ResultScreen = { render: function() {}, init: function() {} };
var GameOverScreen = { render: function() {}, init: function() {} };
var LeaderboardScreen = { render: function() {}, init: function() {} };

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
