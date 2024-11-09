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

    // 환영 인사 및 제품 목록, 안내 출력
    Console.print('안녕하세요. W편의점입니다.');
    Console.print('현재 보유하고 있는 상품입니다.\n');
    productsList.forEach((product) => {
      let nowQuantity = '';
      if (product.get(QUANTITY) !== 0)
        nowQuantity = `${product.get(QUANTITY)}개`;
      else nowQuantity = '재고 없음';

      Console.print(
        `- ${product.get(PRODUCT_NAME)} ${product.get(PRICE).toLocaleString('ko-KR')} ${nowQuantity} ${product.get(PROMOTION)}`,
      );
    });
    const buyInput = await Console.readLineAsync(
      '\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1]\n',
    );
  }
}

export default App;
