import Products from './setting/Products.js';
import Promotions from './setting/Promotions.js';
import ProductService from './services/ProductService.js';
import PromotionService from './services/PromotionService.js';
import MembershipService from './services/MembershipService.js';
import InputHandler from './io/InputHandler.js';
import OutputHandler from './io/OutputHandler.js';

class App {
  constructor() {
    const productsInstance = new Products();
    const promotionsInstance = new Promotions();

    this.productService = new ProductService(productsInstance.productsMap);
    this.promotionService = new PromotionService(promotionsInstance.promotionsMap);
    this.membershipService = new MembershipService();
    this.outputHandler = new OutputHandler();
    this.inputHandler = new InputHandler(this.outputHandler);
  }

  async run() {
    while (await this.processPurchase()) {
      // 계속 구매를 진행
    }
    this.outputHandler.printThankYouMessage();
  }

  async processPurchase() {
    this.outputHandler.printWelcomeMessage(this.productService.productsMap);

    const buyList = await this.inputHandler.getBuyListWithPromotions(this.productService, this.promotionService);

    const applyMembershipDiscount = await this.inputHandler.askMembershipDiscount();

    const { totalAmount, promotionDiscount } = this.calculateTotals(buyList);

    const { membershipDiscount, finalAmount } = this.calculateFinalAmount(
      applyMembershipDiscount,
      totalAmount,
      promotionDiscount,
    );

    this.outputHandler.printReceipt(buyList, totalAmount, promotionDiscount, membershipDiscount, finalAmount);

    const continueShopping = await this.inputHandler.askContinueShopping();
    return continueShopping;
  }

  calculateFinalAmount(applyMembershipDiscount, totalAmount, promotionDiscount) {
    let membershipDiscount = 0;
    if (applyMembershipDiscount) {
      membershipDiscount = this.membershipService.calculateMembershipDiscount(totalAmount, promotionDiscount);
    }
    const finalAmount = totalAmount - promotionDiscount - membershipDiscount;
    return { membershipDiscount, finalAmount };
  }

  calculateTotals(buyList) {
    let totalAmount = 0;
    let promotionDiscount = 0;

    buyList.forEach((buyItem) => {
      const amount = buyItem.productEntries[0].price * buyItem.quantity;
      totalAmount += amount;
      let freeQuantity = 0;
      if (buyItem.freeQuantity) {
        freeQuantity = buyItem.freeQuantity;
        promotionDiscount += buyItem.productEntries[0].price * freeQuantity;
      }
    });

    return { totalAmount, promotionDiscount };
  }
}

export default App;
