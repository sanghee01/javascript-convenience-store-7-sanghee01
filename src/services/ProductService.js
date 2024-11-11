import InputValidator from '../validator/InputValidator.js';

class ProductService {
  constructor(productsMap) {
    this.productsMap = productsMap;
  }

  printWelcomeMessage() {
    Console.print('\n안녕하세요. W편의점입니다.');
    Console.print('현재 보유하고 있는 상품입니다.\n');
    for (const product of this.productsMap.values()) {
      const promotionInfo = product.promotion ? ` ${product.promotion}` : '';
      const quantityInfo = product.quantity > 0 ? `${product.quantity}개` : '재고 없음';
      Console.print(`- ${product.name} ${product.price.toLocaleString('ko-KR')}원 ${quantityInfo}${promotionInfo}`);
    }
  }

  parseBuyInput(buyInput) {
    const buyList = [];
    for (let buyProduct of buyInput) {
      InputValidator.validateInputFormat(buyProduct);
      const { name, quantity } = this.extractProductInfo(buyProduct);
      const productEntries = this.findProductEntries(name);
      buyList.push({ name, quantity, productEntries });
    }
    return buyList;
  }

  extractProductInfo(buyProduct) {
    buyProduct = buyProduct.slice(1, -1);
    const [name, quantityStr] = buyProduct.split('-').map((val) => val.trim());
    const quantity = InputValidator.validateQuantity(quantityStr);
    return { name, quantity };
  }

  findProductEntries(name) {
    const productKeys = Array.from(this.productsMap.keys()).filter((key) => key.startsWith(`${name}-`));
    if (productKeys.length === 0) {
      throw Error('[ERROR] 존재하지 않는 상품입니다. 다시 입력해 주세요.');
    }
    return productKeys.map((key) => this.productsMap.get(key));
  }
}

export default ProductService;
