import { Console } from '@woowacourse/mission-utils';

class ReceiptService {
  printReceipt(buyList, applyMembershipDiscount, membershipService) {
    const { totalAmount, promotionDiscount, totalQuantity } = this.calculateTotals(buyList);

    let membershipDiscount = 0;
    if (applyMembershipDiscount) {
      membershipDiscount = membershipService.calculateMembershipDiscount(totalAmount, promotionDiscount);
    }

    const finalAmount = totalAmount - promotionDiscount - membershipDiscount;

    Console.print('\n==============W 편의점================');
    Console.print('상품명 수량 금액');
    this.printPurchaseItems(buyList);
    if (promotionDiscount > 0) this.printFreeItems(buyList);
    this.printTotals(totalQuantity, totalAmount, promotionDiscount, membershipDiscount, finalAmount);
  }

  calculateTotals(buyList) {
    let totalAmount = 0;
    let promotionDiscount = 0;
    let totalQuantity = 0;

    buyList.forEach((buyItem) => {
      const amount = buyItem.productEntries[0].price * buyItem.quantity;
      totalAmount += amount;
      totalQuantity += buyItem.quantity + (buyItem.freeQuantity || 0);
      if (buyItem.freeQuantity) {
        promotionDiscount += buyItem.productEntries[0].price * buyItem.freeQuantity;
      }
    });
    return { totalAmount, promotionDiscount, totalQuantity };
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

  printTotals(totalQuantity, totalAmount, promotionDiscount, membershipDiscount, finalAmount) {
    Console.print('====================================');
    Console.print(`총구매액 ${totalQuantity} ${totalAmount.toLocaleString('ko-KR')}`);
    Console.print(`행사할인 -${promotionDiscount.toLocaleString('ko-KR')}`);
    Console.print(`멤버십할인 -${membershipDiscount.toLocaleString('ko-KR')}`);
    Console.print(`내실돈 ${finalAmount.toLocaleString('ko-KR')}`);
  }
}

export default ReceiptService;
