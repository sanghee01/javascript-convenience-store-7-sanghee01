import { Console } from '@woowacourse/mission-utils';

class MembershipService {
  async askMembershipDiscount() {
    while (true) {
      const answer = await Console.readLineAsync('\n멤버십 할인을 받으시겠습니까? (Y/N)\n');
      if (answer.toUpperCase() === 'Y') return true;
      if (answer.toUpperCase() === 'N') return false;
      Console.print('[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.');
    }
  }

  calculateMembershipDiscount(totalAmount, promotionDiscount) {
    const amountAfterPromotion = totalAmount - promotionDiscount;
    const discount = Math.min(Math.floor((amountAfterPromotion * 0.3) / 10) * 10, 8000);
    return discount;
  }
}

export default MembershipService;
