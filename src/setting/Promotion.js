class Promotion {
  constructor(name, buy, get, startDate, endDate) {
    this.name = name;
    this.buy = buy;
    this.get = get;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  isActive(currentDate) {
    return currentDate >= this.startDate && currentDate <= this.endDate;
  }
}

export default Promotion;
