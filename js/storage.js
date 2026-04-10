const Storage = {
  KEYS: {
    LANG: 'whiteman_lang',
    RECENT_PLAYERS: 'whiteman_recent_players',
    LEADERBOARD: 'whiteman_leaderboard',
    CURRENT_GAME: 'whiteman_current_game',
  },
  MAX_RECENT: 30,

  getLang() {
    return localStorage.getItem(this.KEYS.LANG) || 'en';
  },
  setLang(lang) {
    localStorage.setItem(this.KEYS.LANG, lang);
  },

  getRecentPlayers() {
    return JSON.parse(localStorage.getItem(this.KEYS.RECENT_PLAYERS) || '[]');
  },
  addRecentPlayers(names) {
    const existing = this.getRecentPlayers();
    const merged = [...new Set([...names, ...existing])].slice(0, this.MAX_RECENT);
    localStorage.setItem(this.KEYS.RECENT_PLAYERS, JSON.stringify(merged));
  },
  clearRecentPlayers() {
    localStorage.removeItem(this.KEYS.RECENT_PLAYERS);
  },

  getLeaderboard() {
    return JSON.parse(localStorage.getItem(this.KEYS.LEADERBOARD) || '[]');
  },
  updateLeaderboard(scores) {
    const board = this.getLeaderboard();
    for (const [name, points] of Object.entries(scores)) {
      const entry = board.find(e => e.name === name);
      if (entry) {
        entry.score += points;
      } else {
        board.push({ name, score: points });
      }
    }
    board.sort((a, b) => b.score - a.score);
    localStorage.setItem(this.KEYS.LEADERBOARD, JSON.stringify(board));
  },
  clearLeaderboard() {
    localStorage.removeItem(this.KEYS.LEADERBOARD);
  },

  getCurrentGame() {
    return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_GAME) || 'null');
  },
  saveCurrentGame(game) {
    localStorage.setItem(this.KEYS.CURRENT_GAME, JSON.stringify(game));
  },
  clearCurrentGame() {
    localStorage.removeItem(this.KEYS.CURRENT_GAME);
  }
};
