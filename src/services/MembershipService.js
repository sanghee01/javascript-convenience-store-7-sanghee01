class MembershipService {
  calculateMembershipDiscount(totalAmount, promotionDiscount) {
    const amountAfterPromotion = totalAmount - promotionDiscount;
    const discount = Math.min(Math.floor((amountAfterPromotion * 0.3) / 10) * 10, 8000);
    return discount;
  }
}

export default MembershipService;
