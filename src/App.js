import { Console } from '@woowacourse/mission-utils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class App {
  async run() {
    // 파일 불러오기
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const productsFilePath = path.join(__dirname, '../public/products.md');
    const promotionsFilePath = path.join(__dirname, '../public/promotions.md');
    const products = fs
      .readFileSync(productsFilePath, 'utf-8')
      .trim()
      .split('\n');
    const promotions = fs
      .readFileSync(promotionsFilePath, 'utf-8')
      .trim()
      .split('\n');

    // 제품 목록 세팅
    const productsList = [];
    const [PRODUCT_NAME, PRICE, QUANTITY, PROMOTION] = products
      .shift()
      .split(',');
    products.forEach((product) => {
      const productInfo = product.split(',');
      const productMap = new Map();
      productMap.set(PRODUCT_NAME, productInfo[0]);
      productMap.set(PRICE, Number(productInfo[1]));
      productMap.set(QUANTITY, Number(productInfo[2]));
      productMap.set(PROMOTION, productInfo[3]);
      if (productInfo[3] === 'null') {
        productMap.set(PROMOTION, '');
      }

      productsList.push(productMap);
    });

    // 프로모션 목록 세팅
    const promotionsList = [];
    const [PROMOTION_NAME, BUT, GET, START_DATE, END_DATE] = promotions
      .shift()
      .split(',');
    promotions.forEach((promotion) => {
      const promotionInfo = promotion.split(',');
      const promotionMap = new Map();
      promotionMap.set(PROMOTION_NAME, promotionInfo[0]);
      promotionMap.set(BUT, Number(promotionInfo[1]));
      promotionMap.set(GET, Number(promotionInfo[2]));
      promotionMap.set(START_DATE, promotionInfo[3]);
      promotionMap.set(END_DATE, promotionInfo[4]);
      promotionsList.push(promotionMap);
    });
  }
}

export default App;
