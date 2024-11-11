import FileLoader from './FileLoader.js';
import Promotion from './Promotion.js';

class Promotions {
  constructor() {
    this.promotionsMap = new Map();
    this.loadPromotions();
  }

  loadPromotions() {
    const fileLoader = new FileLoader();
    const promotions = fileLoader.loadFile('public/promotions.md');

    const promotionHeaders = promotions.shift().split(',');
    promotions.forEach((promotion) => {
      const promotionObj = this.createPromotion(promotion, promotionHeaders);
      this.promotionsMap.set(promotionObj.name, promotionObj);
    });
  }

  createPromotion(promotion, promotionHeaders) {
    const [PROMOTION_NAME, BUY, GET, START_DATE, END_DATE] = promotionHeaders;
    const promotionInfo = promotion.split(',');

    return new Promotion(
      promotionInfo[0].trim(),
      Number(promotionInfo[1]),
      Number(promotionInfo[2]),
      promotionInfo[3].trim(),
      promotionInfo[4].trim(),
    );
  }
}

export default Promotions;
