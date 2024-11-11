import Products from './setting/Products.js';
import Promotions from './setting/Promotions.js';
import ProductService from './services/ProductService.js';
import PromotionService from './services/PromotionService.js';
import MembershipService from './services/MembershipService.js';
import InputHandler from './handlers/InputHandler.js';
import OutputHandler from './handlers/OutputHandler.js';

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
    while (true) {
      this.outputHandler.printWelcomeMessage(this.productService.productsMap);

      const buyList = await this.inputHandler.getBuyListWithPromotions(this.productService, this.promotionService);

      const applyMembershipDiscount = await this.inputHandler.askMembershipDiscount();

      const { totalAmount, promotionDiscount } = this.calculateTotals(buyList);

      let membershipDiscount = 0;
      if (applyMembershipDiscount) {
        membershipDiscount = this.membershipService.calculateMembershipDiscount(totalAmount, promotionDiscount);
      }

      const finalAmount = totalAmount - promotionDiscount - membershipDiscount;

      this.outputHandler.printReceipt(buyList, totalAmount, promotionDiscount, membershipDiscount, finalAmount);

      const continueShopping = await this.inputHandler.askContinueShopping();
      if (!continueShopping) break;
    }
    this.outputHandler.printThankYouMessage();
  }

  calculateTotals(buyList) {
    let totalAmount = 0;
    let promotionDiscount = 0;

    buyList.forEach((buyItem) => {
      const amount = buyItem.productEntries[0].price * buyItem.quantity;
      totalAmount += amount;
      if (buyItem.freeQuantity) {
        promotionDiscount += buyItem.productEntries[0].price * buyItem.freeQuantity;
      }
    });

    return { totalAmount, promotionDiscount };
  }
}

export default App;
