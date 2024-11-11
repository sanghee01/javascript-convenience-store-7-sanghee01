import { Console } from '@woowacourse/mission-utils';
import InputValidator from '../validator/InputValidator.js';

class InputHandler {
  constructor(outputHandler) {
    this.outputHandler = outputHandler;
  }

  async getBuyListWithPromotions(productService, promotionService) {
    while (true) {
      try {
        const buyList = await this.getValidBuyList(productService);
        await promotionService.applyPromotions(buyList);
        return buyList;
      } catch (error) {
        this.outputHandler.printErrorMessage(error.message);
      }
    }
  }

  async getValidBuyList(productService) {
    while (true) {
      try {
        const buyList = await this.getBuyList(productService);
        return buyList;
      } catch (error) {
        this.outputHandler.printErrorMessage(error.message);
      }
    }
  }

  async getBuyList(productService) {
    const buyInput = await this.readBuyInput();
    return productService.parseBuyInput(buyInput);
  }

  async readBuyInput() {
    const input = await Console.readLineAsync(
      '\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n',
    );
    return input.split(',');
  }

  async askMembershipDiscount() {
    while (true) {
      const answer = await Console.readLineAsync('\n멤버십 할인을 받으시겠습니까? (Y/N)\n');
      try {
        return InputValidator.validateYesNoAnswer(answer);
      } catch (error) {
        this.outputHandler.printErrorMessage(error.message);
      }
    }
  }

  async askContinueShopping() {
    while (true) {
      const answer = await Console.readLineAsync('\n감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n');
      try {
        return InputValidator.validateYesNoAnswer(answer);
      } catch (error) {
        this.outputHandler.printErrorMessage(error.message);
      }
    }
  }
}

export default InputHandler;
