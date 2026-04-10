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

var SetupScreen = { render: function() {}, init: function() {} };
var DealScreen = { render: function() {}, init: function() {}, start: function() {} };
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
