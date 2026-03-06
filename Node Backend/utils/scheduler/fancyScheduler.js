class FancyScheduler {
  keys = [];
  constructor() {}

  addToScheduler(key) {
    if (this.keys.includes(key)) {
      return true;
    }
    this.keys.push(key);
    this.removeSchedulerAfter8min(key);
    return true;
  }

  removeFromScheduler(key) {
    if (this.keys.includes(key)) {
      const newKeys = this.keys.filter((_key) => _key !== key);
      this.keys = newKeys;
    }
    return true;
  }

  checkScheduler(key) {
    if (this.keys.includes(key)) {
      return true;
    }
    return false;
  }

  removeSchedulerAfter8min(key) {
    setTimeout(() => {
      this.removeFromScheduler(key);
    }, 480000);
  }
}

module.exports = {
  fancyScheduler: new FancyScheduler(),
};
