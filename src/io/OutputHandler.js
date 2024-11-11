import { Console } from '@woowacourse/mission-utils';

class OutputHandler {
  printWelcomeMessage(productsMap) {
    Console.print('\n안녕하세요. W편의점입니다.');
    Console.print('현재 보유하고 있는 상품입니다.\n');
    for (const product of productsMap.values()) {
      let promotionInfo = '';
      if (product.promotion) {
        promotionInfo = ` ${product.promotion}`;
      }

      let quantityInfo = '재고 없음';
      if (product.quantity > 0) {
        quantityInfo = `${product.quantity}개`;
      }

      Console.print(`- ${product.name} ${product.price.toLocaleString('ko-KR')}원 ${quantityInfo}${promotionInfo}`);
    }
  }

  printReceipt(buyList, totalAmount, promotionDiscount, membershipDiscount, finalAmount) {
    Console.print('\n==============W 편의점================');
    Console.print('상품명 수량 금액');
    this.printPurchaseItems(buyList);
    if (promotionDiscount > 0) {
      this.printFreeItems(buyList);
    }
    this.printTotals(buyList, totalAmount, promotionDiscount, membershipDiscount, finalAmount);
  }

  printPurchaseItems(buyList) {
    buyList.forEach((buyItem) => {
      const amount = buyItem.productEntries[0].price * buyItem.quantity;
      Console.print(`${buyItem.name} ${buyItem.quantity} ${amount.toLocaleString('ko-KR')}`);
    });
  }

  printFreeItems(buyList) {
    Console.print('=============증 정===============');
    buyList.forEach((buyItem) => {
      if (buyItem.freeQuantity) {
        Console.print(`${buyItem.name} ${buyItem.freeQuantity}`);
      }
    });
  }

  printTotals(buyList, totalAmount, promotionDiscount, membershipDiscount, finalAmount) {
    const totalQuantity = buyList.reduce((sum, item) => sum + item.quantity, 0);
    Console.print('====================================');
    Console.print(`총구매액 ${totalQuantity} ${totalAmount.toLocaleString('ko-KR')}`);
    Console.print(`행사할인 -${promotionDiscount.toLocaleString('ko-KR')}`);
    Console.print(`멤버십할인 -${membershipDiscount.toLocaleString('ko-KR')}`);
    Console.print(`내실돈 ${finalAmount.toLocaleString('ko-KR')}`);
  }

  printErrorMessage(message) {
    Console.print(message);
  }

  printThankYouMessage() {
    Console.print('감사합니다.');
  }
}

export default OutputHandler;
