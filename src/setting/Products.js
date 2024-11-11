import FileLoader from './FileLoader.js';
import Product from './Product.js';

class Products {
  constructor() {
    this.productsMap = new Map();
    this.loadProducts();
  }

  loadProducts() {
    const fileLoader = new FileLoader();
    const products = fileLoader.loadFile('public/products.md');

    const productHeaders = products.shift().split(',');
    products.forEach((product) => {
      this.addProduct(product, productHeaders);
    });
  }

  addProduct(product, productHeaders) {
    const [PRODUCT_NAME, PRICE, QUANTITY, PROMOTION] = productHeaders;
    const productInfo = product.split(',');

    const name = productInfo[0].trim();
    const price = Number(productInfo[1]);
    const quantity = Number(productInfo[2]);
    const promotion = productInfo[3] === 'null' ? '' : productInfo[3].trim();

    const key = `${name}-${promotion}`;

    if (this.productsMap.has(key)) {
      const existingProduct = this.productsMap.get(key);
      existingProduct.quantity += quantity;
    } else {
      const newProduct = new Product(name, price, quantity, promotion);
      this.productsMap.set(key, newProduct);
    }
  }
}

export default Products;
