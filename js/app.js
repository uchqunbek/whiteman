const App = {
  currentScreen: 'welcome',

  init() {
    this.bindLangSwitcher();
    this.showScreen('welcome');
  },

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + name);
    if (screen) {
      screen.classList.add('active');
      screen.classList.add('animate-in');
      this.currentScreen = name;
    }
  },

  bindLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Storage.setLang(lang);
        I18n.setLang(lang);
        this.renderCurrentScreen();
      });
    });
  },

  renderCurrentScreen() {
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

document.addEventListener('DOMContentLoaded', () => App.init());
