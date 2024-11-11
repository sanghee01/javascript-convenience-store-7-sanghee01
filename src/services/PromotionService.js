import { Console, DateTimes } from '@woowacourse/mission-utils';
import InputValidator from '../validator/InputValidator.js';

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
    this.checkStockAvailability(buyItem);
    this.setPromotion(buyItem, currentDate);

    if (buyItem.promotion) {
      await this.handlePromotion(buyItem);
      return;
    }

    await this.deductQuantityFromProducts(buyItem.quantity, buyItem.productEntries);
  }

  checkStockAvailability(buyItem) {
    const totalAvailableQuantity = buyItem.productEntries.reduce((sum, product) => sum + product.quantity, 0);
    if (buyItem.quantity > totalAvailableQuantity) {
      throw Error('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.');
    }
  }

  setPromotion(buyItem, currentDate) {
    const promotableProducts = this.findPromotableProducts(buyItem.productEntries, currentDate);
    if (promotableProducts.length > 0) {
      buyItem.promotionProduct = promotableProducts[0];
      buyItem.promotion = this.promotionsMap.get(buyItem.promotionProduct.promotion);
    } else {
      buyItem.promotionProduct = null;
      buyItem.promotion = null;
    }
    buyItem.freeQuantity = 0;
  }

  findPromotableProducts(productEntries, currentDate) {
    return productEntries.filter((product) => {
      if (!product.promotion) return false;
      const promotion = this.promotionsMap.get(product.promotion);
      return promotion && promotion.isActive(currentDate);
    });
  }

  async handlePromotion(buyItem) {
    const requiredQuantity = buyItem.promotion.buy + buyItem.promotion.get;

    // 최소 프로모션 적용 수량보다 적게 구매 시 추가 안내 없이 바로 차감
    if (buyItem.quantity < buyItem.promotion.buy) {
      await this.deductQuantityFromProducts(buyItem.quantity, buyItem.productEntries);
      return;
    }

    // 프로모션 조건 충족 시 프로모션 적용
    if (buyItem.quantity >= requiredQuantity) {
      await this.applyPromotion(buyItem);
      return;
    }

    await this.offerAdditionalPurchase(buyItem, requiredQuantity);
  }

  async offerAdditionalPurchase(buyItem, requiredQuantity) {
    const additionalQuantity = requiredQuantity - buyItem.quantity;
    const message = `\n현재 ${buyItem.name}은(는) ${buyItem.promotion.get}개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`;
    const answer = await Console.readLineAsync(message);
    const validAnswer = InputValidator.validateYesNoAnswer(answer);

    if (validAnswer) {
      buyItem.quantity = requiredQuantity;
      await this.applyPromotion(buyItem);
      return;
    }

    // 추가 구매 거부 시 기존 수량만 차감
    await this.deductQuantityFromProducts(buyItem.quantity, buyItem.productEntries);
  }

  async applyPromotion(buyItem) {
    const { promotionProduct, promotion } = buyItem;
    const promotionSetSize = promotion.buy + promotion.get;

    const maxPromotionSets = Math.floor(promotionProduct.quantity / promotionSetSize);
    const desiredSets = Math.floor(buyItem.quantity / promotionSetSize);
    const applicableSets = Math.min(maxPromotionSets, desiredSets);

    const promotableQuantity = applicableSets * promotion.buy;
    const freeQuantity = applicableSets * promotion.get;
    buyItem.freeQuantity = freeQuantity;

    // 프로모션 재고에서 차감
    promotionProduct.quantity -= promotableQuantity + freeQuantity;

    const remainingQuantity = buyItem.quantity - promotableQuantity;
    if (remainingQuantity > 0) {
      await this.handleNonPromotionalQuantity(buyItem, remainingQuantity);
      return;
    }

    await this.deductQuantityFromProducts(promotableQuantity, [promotionProduct]);
  }

  async handleNonPromotionalQuantity(buyItem, remainingQuantity) {
    const message = `\n현재 ${buyItem.name} ${remainingQuantity}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`;
    const answer = await Console.readLineAsync(message);
    const validAnswer = InputValidator.validateYesNoAnswer(answer);

    if (validAnswer) {
      await this.deductQuantityFromProducts(remainingQuantity, buyItem.productEntries);
      return;
    }

    buyItem.quantity -= remainingQuantity;
  }

  async deductQuantityFromProducts(quantity, products) {
    let remainingQuantity = quantity;
    for (const product of products) {
      if (product.quantity >= remainingQuantity) {
        product.quantity -= remainingQuantity;
        remainingQuantity = 0;
        break;
      }
      remainingQuantity -= product.quantity;
      product.quantity = 0;
    }
    if (remainingQuantity > 0) {
      throw Error('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.');
    }
  }
}

export default PromotionService;
