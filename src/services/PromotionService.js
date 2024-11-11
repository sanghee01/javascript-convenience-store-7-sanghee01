import { Console, DateTimes } from '@woowacourse/mission-utils';

class PromotionService {
  constructor(promotionsMap) {
    this.promotionsMap = promotionsMap;
  }

  async applyPromotions(buyList) {
    const currentDate = new Date(DateTimes.now());
    for (const buyItem of buyList) {
      await this.processBuyItem(buyItem, currentDate);
    }
  }

  async processBuyItem(buyItem, currentDate) {
    const { productEntries } = buyItem;
    let quantity = buyItem.quantity;
    this.checkStockAvailability(quantity, productEntries);

    const promotableProducts = this.findPromotableProducts(productEntries, currentDate);
    let promotion = promotableProducts.length > 0 ? this.promotionsMap.get(promotableProducts[0].promotion) : null;
    buyItem.promotion = promotion;
    buyItem.freeQuantity = 0;

    if (promotion) {
      await this.applyPromotion(buyItem, promotableProducts, promotion);
    } else {
      await this.deductQuantityFromProducts(quantity, productEntries);
    }
  }

  checkStockAvailability(quantity, productEntries) {
    const totalAvailableQuantity = productEntries.reduce((sum, product) => sum + product.quantity, 0);
    if (quantity > totalAvailableQuantity) {
      throw Error('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.');
    }
  }

  findPromotableProducts(productEntries, currentDate) {
    return productEntries.filter((product) => {
      if (!product.promotion) return false;
      const promotion = this.promotionsMap.get(product.promotion);
      return promotion && promotion.isActive(currentDate);
    });
  }

  async applyPromotion(buyItem, promotableProducts, promotion) {
    const { quantity } = buyItem;
    const requiredBuyQuantity = promotion.buy;
    if (quantity < requiredBuyQuantity) {
      await this.deductQuantityFromProducts(quantity, buyItem.productEntries);
      return;
    }
    await this.processPromotion(buyItem, promotableProducts[0], promotion);
  }

  async processPromotion(buyItem, promotableProduct, promotion) {
    const { quantity } = buyItem;
    const desiredPromotionSets = Math.floor(quantity / promotion.buy);
    const totalPromotionUnitsNeeded = desiredPromotionSets * promotion.buy;

    if (promotableProduct.quantity >= totalPromotionUnitsNeeded) {
      await this.applyFullPromotion(buyItem, promotableProduct, promotion, totalPromotionUnitsNeeded);
    } else {
      await this.handleInsufficientPromotionStock(buyItem, promotableProduct, promotion);
    }
  }

  async applyFullPromotion(buyItem, promotableProduct, promotion, unitsNeeded) {
    buyItem.freeQuantity = promotion.get * Math.floor(unitsNeeded / promotion.buy);
    promotableProduct.quantity -= unitsNeeded;
    const remainingUnits = buyItem.quantity - unitsNeeded;
    await this.deductQuantityFromProducts(
      remainingUnits,
      buyItem.productEntries.filter((p) => !p.promotion),
    );
  }

  async handleInsufficientPromotionStock(buyItem, promotableProduct, promotion) {
    const maxPromotionSets = Math.floor(promotableProduct.quantity / promotion.buy);
    if (maxPromotionSets > 0) {
      await this.partialPromotion(buyItem, promotableProduct, promotion, maxPromotionSets);
    } else {
      await this.noPromotionAvailable(buyItem, promotableProduct);
    }
  }

  async partialPromotion(buyItem, promotableProduct, promotion, maxSets) {
    const promotionUnits = maxSets * promotion.buy;
    const freeUnits = maxSets * promotion.get;
    const remainingUnits = buyItem.quantity - promotionUnits;

    const answer = await Console.readLineAsync(
      `\n현재 ${buyItem.name}의 프로모션 재고가 부족하여 일부 수량에 프로모션 혜택을 적용할 수 없습니다. 프로모션 없이 ${remainingUnits}개를 정가로 구매하시겠습니까? (Y/N)\n`,
    );

    if (answer.toUpperCase() === 'Y') {
      buyItem.freeQuantity = freeUnits;
      promotableProduct.quantity -= promotionUnits;
      await this.deductQuantityFromProducts(
        remainingUnits,
        buyItem.productEntries.filter((p) => !p.promotion),
      );
    } else {
      buyItem.quantity = promotionUnits;
      buyItem.freeQuantity = freeUnits;
      promotableProduct.quantity -= promotionUnits;
    }
  }

  async noPromotionAvailable(buyItem, promotableProduct) {
    const answer = await Console.readLineAsync(
      `\n현재 ${buyItem.name}의 프로모션 재고가 부족하여 프로모션 혜택을 적용할 수 없습니다. 프로모션 없이 구매하시겠습니까? (Y/N)\n`,
    );

    if (answer.toUpperCase() === 'Y') {
      await this.deductQuantityFromProducts(
        buyItem.quantity,
        buyItem.productEntries.filter((p) => !p.promotion),
      );
    } else {
      throw Error('[ERROR] 구매를 취소하셨습니다. 다시 입력해 주세요.');
    }
  }

  async deductQuantityFromProducts(quantity, products) {
    let remainingQuantity = quantity;
    for (const product of products) {
      if (product.quantity >= remainingQuantity) {
        product.quantity -= remainingQuantity;
        remainingQuantity = 0;
        break;
      } else {
        remainingQuantity -= product.quantity;
        product.quantity = 0;
      }
    }
    if (remainingQuantity > 0) {
      throw Error('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.');
    }
  }
}

export default PromotionService;
