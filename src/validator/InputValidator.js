class InputValidator {
  static validateInputFormat(buyProduct) {
    if (buyProduct[0] !== '[' || buyProduct.at(-1) !== ']') {
      throw Error('[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.');
    }
    if (!buyProduct.includes('-')) {
      throw Error('[ERROR] 구매할 상품명과 수량은 하이픈(-)으로 구분해서 입력해야합니다. (예: [사이다-2])');
    }
    if (buyProduct[0] === '-' || buyProduct.at(-1) === '-') {
      throw Error('[ERROR] 올바르지 않은 형식으로 입력했습니다. 다시 입력해 주세요.');
    }
  }

  static validateQuantity(quantityStr) {
    const quantity = Number(quantityStr);
    if (isNaN(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
      throw Error('[ERROR] 수량은 1 이상의 정수로 입력해 주세요.');
    }
    return quantity;
  }

  static validateYesNoAnswer(answer) {
    const trimmedAnswer = answer.trim().toUpperCase();
    if (trimmedAnswer === 'Y') return true;
    if (trimmedAnswer === 'N') return false;
    throw Error('[ERROR] 잘못된 입력입니다. 다시 입력해 주세요.');
  }
}

export default InputValidator;
