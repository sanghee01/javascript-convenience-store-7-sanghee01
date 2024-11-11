import { Console, DateTimes } from '@woowacourse/mission-utils';
import Products from './setting/Products.js';
import Promotions from './setting/Promotions.js';

class App {
  async run() {
    const productsInstance = new Products();
    const productsMap = productsInstance.productsMap;

    const promotionsInstance = new Promotions();
    const promotionsMap = promotionsInstance.promotionsMap;

    while (true) {
      this.printWelcomeMessage(productsMap);

      let buyList;
      while (true) {
        try {
          buyList = await this.getBuyList(productsMap);
          break;
        } catch (error) {
          Console.print(error.message);
        }
      }

      while (true) {
        try {
          await this.processPromotions(buyList, promotionsMap);
          break;
        } catch (error) {
          Console.print(error.message);
          buyList = await this.getBuyList(productsMap);
        }
      }

      const applyMembershipDiscount = await this.askMembershipDiscount();

      this.printReceipt(buyList, applyMembershipDiscount);

      const continueShopping = await this.askContinueShopping();
      if (!continueShopping) break;
    }

    Console.print('감사합니다.');
  }

  printWelcomeMessage(productsMap) {
    Console.print('\n안녕하세요. W편의점입니다.');
    Console.print('현재 보유하고 있는 상품입니다.\n');

    for (const product of productsMap.values()) {
      const promotionInfo = product.promotion ? ` ${product.promotion}` : '';
      const quantityInfo = product.quantity > 0 ? `${product.quantity}개` : '재고 없음';
      Console.print(`- ${product.name} ${product.price.toLocaleString('ko-KR')}원 ${quantityInfo}${promotionInfo}`);
    }
  }

  async getBuyList(productsMap) {
    const buyList = [];

    while (true) {
      try {
        const buyInput = (
          await Console.readLineAsync('\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n')
        ).split(',');

        for (let buyProduct of buyInput) {
          this.validateInputFormat(buyProduct);

          buyProduct = buyProduct.slice(1, -1);
          const [currentProductName, currentProductQuantity] = buyProduct.split('-').map((val) => val.trim());

          const quantity = this.validateQuantity(currentProductQuantity);

          // 제품명과 프로모션을 조합하여 키를 생성하고, 해당 제품을 찾음
          const productKeys = Array.from(productsMap.keys()).filter((key) => key.startsWith(`${currentProductName}-`));
          if (productKeys.length === 0) {
            throw Error('[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.');
          }

          const productEntries = productKeys.map((key) => productsMap.get(key));
          buyList.push({ name: currentProductName, quantity, productEntries });
        }

        break;
      } catch (error) {
        Console.print(error.message);
      }
    }

    return buyList;
  }

  validateInputFormat(buyProduct) {
    if (buyProduct[0] !== '[' || buyProduct.at(-1) !== ']')
      throw Error('[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.');
    if (!buyProduct.includes('-'))
      throw Error('[ERROR] 구매할 상품명과 수량은 하이픈(-)으로 구분해서 입력해야합니다. (예: [사이다-2])');
    if (buyProduct[0] === '-' || buyProduct.at(-1) === '-')
      throw Error('[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.');
  }

  validateQuantity(quantityStr) {
    const quantity = Number(quantityStr);
    if (isNaN(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
      throw Error('[ERROR] 수량은 1 이상의 정수로 입력해 주세요.');
    }
    return quantity;
  }

  async processPromotions(buyList, promotionsMap) {
    const currentDate = new Date(DateTimes.now());

    for (const buyItem of buyList) {
      const { productEntries, quantity } = buyItem;
      let totalAvailableQuantity = productEntries.reduce((sum, product) => sum + product.quantity, 0);

      if (quantity > totalAvailableQuantity) {
        throw Error('[ERROR] 재고 수량을 초과하여 구매할 수 없습니다. 다시 입력해 주세요.');
      }

      // 프로모션 적용 가능한 제품 찾기
      const promotableProducts = productEntries.filter((product) => {
        if (!product.promotion) return false;
        const promotion = promotionsMap.get(product.promotion);
        return promotion && promotion.isActive(currentDate);
      });

      let promotion = null;
      if (promotableProducts.length > 0) {
        promotion = promotionsMap.get(promotableProducts[0].promotion);
        buyItem.promotion = promotion;
      }

      buyItem.freeQuantity = 0; // 무료 증정 수량 초기화

      if (promotion) {
        const requiredBuyQuantity = promotion.buy;

        // 프로모션 혜택을 받을 수 있는 최소 수량보다 적게 구매한 경우
        if (quantity < requiredBuyQuantity) {
          const additionalQuantityNeeded = requiredBuyQuantity - quantity;
          const answer = await Console.readLineAsync(
            `현재 ${buyItem.name}은(는) ${additionalQuantityNeeded}개를 추가로 구매하면 프로모션 혜택을 받을 수 있습니다. 추가하시겠습니까? (Y/N)`,
          );

          if (answer.toUpperCase() === 'Y') {
            buyItem.quantity += additionalQuantityNeeded;
          }
        }

        // 적용 가능한 프로모션 세트 수 계산
        const desiredPromotionSets = Math.floor(buyItem.quantity / promotion.buy);

        // 총 프로모션에 필요한 수량
        const totalPromotionUnitsNeeded = desiredPromotionSets * promotion.buy;

        // 프로모션 재고가 충분한지 확인
        const promotableProduct = promotableProducts[0];
        if (promotableProduct.quantity >= totalPromotionUnitsNeeded) {
          // 프로모션을 전체 적용할 수 있는 경우
          buyItem.freeQuantity = desiredPromotionSets * promotion.get;
          promotableProduct.quantity -= totalPromotionUnitsNeeded;

          // 남은 구매 수량은 일반 재고에서 차감
          const remainingPurchaseUnits = buyItem.quantity - totalPromotionUnitsNeeded;
          await this.deductQuantityFromProducts(
            remainingPurchaseUnits,
            productEntries.filter((p) => !p.promotion),
          );
        } else {
          // 프로모션 재고가 부족한 경우
          const maxPromotionSets = Math.floor(promotableProduct.quantity / promotion.buy);

          if (maxPromotionSets > 0) {
            const promotionUnits = maxPromotionSets * promotion.buy;
            const freeUnits = maxPromotionSets * promotion.get;
            const remainingUnits = buyItem.quantity - promotionUnits;

            const answer = await Console.readLineAsync(
              `현재 ${buyItem.name}의 프로모션 재고가 부족하여 일부 수량에 프로모션 혜택을 적용할 수 없습니다. 프로모션 없이 ${remainingUnits}개를 정가로 구매하시겠습니까? (Y/N)`,
            );

            if (answer.toUpperCase() === 'Y') {
              // 프로모션 적용 가능한 부분 적용
              buyItem.freeQuantity = freeUnits;
              promotableProduct.quantity -= promotionUnits;

              await this.deductQuantityFromProducts(
                remainingUnits,
                productEntries.filter((p) => !p.promotion),
              );
            } else {
              // 구매 수량 조정
              buyItem.quantity = promotionUnits;
              buyItem.freeQuantity = freeUnits;
              promotableProduct.quantity -= promotionUnits;
            }
          } else {
            // 프로모션 혜택을 적용할 수 없는 경우
            const answer = await Console.readLineAsync(
              `현재 ${buyItem.name}의 프로모션 재고가 부족하여 프로모션 혜택을 적용할 수 없습니다. 프로모션 없이 구매하시겠습니까? (Y/N)`,
            );

            if (answer.toUpperCase() === 'Y') {
              await this.deductQuantityFromProducts(
                buyItem.quantity,
                productEntries.filter((p) => !p.promotion),
              );
            } else {
              // 구매 취소
              throw Error('[ERROR] 구매를 취소하셨습니다. 다시 입력해 주세요.');
            }
          }
        }
      } else {
        // 프로모션이 없는 경우
        await this.deductQuantityFromProducts(buyItem.quantity, productEntries);
      }
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

  async askMembershipDiscount() {
    while (true) {
      const answer = await Console.readLineAsync('\n멤버십 할인을 받으시겠습니까? (Y/N)\n');
      if (answer.toUpperCase() === 'Y') return true;
      if (answer.toUpperCase() === 'N') return false;
      Console.print('[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.');
    }
  }

  printReceipt(buyList, applyMembershipDiscount) {
    let totalAmount = 0;
    let promotionDiscount = 0;
    let membershipDiscount = 0;
    let totalQuantity = 0;

    Console.print('\n==============W 편의점================');
    Console.print('상품명 수량 금액');

    buyList.forEach((buyItem) => {
      const amount = buyItem.productEntries[0].price * buyItem.quantity;
      totalAmount += amount;
      totalQuantity += buyItem.quantity + (buyItem.freeQuantity || 0);
      Console.print(`${buyItem.name} ${buyItem.quantity} ${amount.toLocaleString('ko-KR')}`);

      if (buyItem.freeQuantity) {
        promotionDiscount += buyItem.productEntries[0].price * buyItem.freeQuantity;
      }
    });

    if (promotionDiscount > 0) {
      Console.print('=============증 정===============');
      buyList.forEach((buyItem) => {
        if (buyItem.freeQuantity) {
          Console.print(`${buyItem.name} ${buyItem.freeQuantity}`);
        }
      });
    }

    if (applyMembershipDiscount) {
      const amountAfterPromotion = totalAmount - promotionDiscount;
      membershipDiscount = Math.min(Math.floor((amountAfterPromotion * 0.3) / 10) * 10, 8000); // 10원 단위 절사
    }

    const finalAmount = totalAmount - promotionDiscount - membershipDiscount;

    Console.print('====================================');
    Console.print(`총구매액 ${totalQuantity} ${totalAmount.toLocaleString('ko-KR')}`);
    Console.print(`행사할인 -${promotionDiscount.toLocaleString('ko-KR')}`);
    Console.print(`멤버십할인 -${membershipDiscount.toLocaleString('ko-KR')}`);
    Console.print(`내실돈 ${finalAmount.toLocaleString('ko-KR')}`);
  }

  async askContinueShopping() {
    while (true) {
      const answer = await Console.readLineAsync('\n감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n');
      if (answer.toUpperCase() === 'Y') return true;
      if (answer.toUpperCase() === 'N') return false;
      Console.print('[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.');
    }
  }
}

export default App;
