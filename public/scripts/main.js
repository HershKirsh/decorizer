const htmlElements = {
  userName: document.getElementById('user-name'),
  section: document.querySelectorAll('section'),
  orderList: document.getElementById('order-list'),
  balanceRow: document.getElementById('balance-row'),
  balance: document.getElementById('balance'),
  cart: document.getElementById('cart'),
  cartList: document.getElementById('cart-list'),
  total: document.getElementById('total'),
  zip: document.getElementById('zip'),
  email: document.getElementById('email'),
  business: document.getElementById('business'),
  calcShipWrap: document.getElementById('ship-cost-btn'),
  calcShip: document.getElementById('calc-ship'),
  paypal: document.getElementById('paypal-button-container'),
  processing: document.getElementById('processing')
};

function getData(url, method) {
  fetch(url, {method: method})
    .then(res => {
      return res.json();
    })
    .then(data => {
      productListItems.productList = data;
      productListItems.appendList(data);
    });
}

const apiPath = 'https://decorizer.herokuapp.com';
// const apiPath = 'http://localhost:3000';

(function () {
  let url = apiPath + '/products';
  getData(url, 'GET');
})();

(function () {
  let userName = htmlElements.userName.innerText;
  if (userName !== '') {
    let url = `${apiPath}/getUser?name=${userName}`;
    fetch(url, {method: 'GET'})
      .then(res => {
        return res.json();
      })
      .then(data => {
        userElements.user = data[0];
        htmlElements.email.value = userElements.user.email;
        htmlElements.business.value = userElements.user.name;
        shipElements.address[1] = userElements.user.name;
        shipElements.address[8] = userElements.user.email;
        if (data[0].balance != 0.0) {
          userElements.processBalance();
        }
        if (data[0].exception) {
          userElements.user.exception = true;
        }
      });
  }
})();

const userElements = {
  user: {},
  hasBalance: false,
  balance: 0,
  processBalance: function () {
    this.hasBalance = true;
    this.balance = Number(this.user.balance);
    htmlElements.balanceRow.style.display = 'table-row';
    htmlElements.balance.innerHTML = '$' + this.user.balance;
    htmlElements.total.innerHTML = this.user.balance;
  }
};

const createHtml = (tagName, classNames, idName, innerContent, insertTo) => {
  const htmlListItem = document.createElement(tagName);
  if (classNames) htmlListItem.classList.add(...classNames);
  if (idName) htmlListItem.id = idName;
  const textNode = innerContent;
  htmlListItem.innerHTML = textNode;
  insertTo.insertAdjacentElement('beforeend', htmlListItem);
};

const productListItems = {
  productList: [],
  increments: [3, 1, 6, 4, 3, 3, 6],
  appendList: function (list) {
    list
      .sort((a, b) => a.order > b.order)
      .forEach((item, i) => {
        const innerString = `<h5 class="item-title">${item.name}</h5><img src="/assets/${item.img}" alt="${item.name}" title="Click to expand"><h5>${item.sku}</h5><span class="price-wrapper">Price <b>$${item.price.toFixed(2)}</b></span>
        <div class="add-wrapper">
          <button class="dec-qty-btn" onclick="decQty(this.nextElementSibling);cartElements.addItem(this, ${i}, this.parentElement)" data-inc="${this.increments[item.num]}">-</button>
          <output class="item-qty" data-max="${item.qty}" data-inc="${this.increments[item.num]}">0</output>
          <button class="inc-qty-btn" onclick="incQty(this.previousElementSibling);cartElements.addItem(this, ${i}, this.parentElement)" data-sku="">+</button>
        </div>`;
        createHtml('div', ['item', `${item.qty ? 'in-stock' : 'out-of-stock'}`], '', innerString, document.getElementById(item.section));
      });
    document.querySelectorAll('.item img').forEach(x => x.addEventListener('click', () => x.classList.toggle('show')));
  }
};

function decQty(output) {
  const qty = parseInt(output.innerText);
  output.innerText = Math.max(0, qty - output.dataset.inc);
}

function incQty(output) {
  const qty = parseInt(output.innerText);
  output.innerText = Math.min(qty + parseInt(output.dataset.inc), parseInt(output.dataset.max));
}

const cartElements = {
  cart: [],
  weights: [3, 5, 0.45, 0.6, 1, 2, 0.1],
  cubicSizes: [774, 785, 83, 110, 59, 326, 0.5],
  addItem: function (btn, i, qtyWrapper) {
    const qty = parseInt(qtyWrapper.querySelector('output').innerText);
    // if (qty > parseInt(qty.max)) return alert(`only ${qty.max} available. \n Please reduce the quantity`);
    let listItem = productListItems.productList[i];
    let newItem = {...listItem, origQty: listItem.qty, qty: qty, weight: this.weights[listItem.num], cubicSize: this.cubicSizes[listItem.num]};
    const existingCartItem = this.cart.find(item => item.sku === newItem.sku);
    if (!qty) {
      if (!existingCartItem) return;
      this.remove(cart.querySelector(`[id="${existingCartItem.sku}-row"]>td`), existingCartItem.sku);
    } else {
      existingCartItem ? (existingCartItem.qty = qty) : this.cart.push(newItem);
    }
    this.calcTotal();
    this.updateCart();
  },
  remove: function (element, sku) {
    element.parentElement.remove();
    const i = this.cart.findIndex(item => item.sku === sku);
    this.cart.splice(i, 1);
    this.calcTotal();
  },
  updateCart: function () {
    htmlElements.cartList.innerHTML = '';
    shipElements.calculated = false;
    this.cart.forEach(item => {
      const newElement = document.createElement('tr');
      newElement.id = item.sku + '-row';
      const textNode = `<td>${item.sku}</td><td>${item.name}</td><td>$${item.price.toFixed(2)}</td><td>${item.qty}</td><td>$${(item.price * item.qty).toFixed(2)}</td><td id="remove" title="remove from cart" onclick="cartElements.remove(this, '${item.sku}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg></td>`;
      newElement.innerHTML = textNode;
      htmlElements.cartList.appendChild(newElement);
    });
  },
  calcTotal: function () {
    let total = this.cart.map(x => x.price * x.qty).reduce((a, b) => a + b, 0);
    const itemTotal = total;
    if (userElements.hasBalance) total += userElements.balance;
    htmlElements.total.innerHTML = total.toFixed(2);
    this.total = total;
    if (this.discountAdded) {
      document.getElementById('discount-row')?.remove();
      this.discountAdded = false;
      this.discountAmount = 0;
    }
    const discountEligibleTotal = this.cart
      .filter(item => !item.discountExcluded)
      .map(x => x.price * x.qty)
      .reduce((a, b) => a + b, 0);
    if (discountEligibleTotal >= 500) this.addDiscount();
  },
  discountName: '15% Discount',
  addDiscount: function () {
    this.discountAmount =
      this.cart
        .filter(item => !item.discountExcluded)
        .map(x => x.price * x.qty)
        .reduce((a, b) => a + b, 0) * 0.15;
    setTimeout(() => {
      htmlElements.cartList.insertAdjacentHTML('beforeend', `<tr id="discount-row"><td>&nbsp;</td><td colspan="3">${this.discountName}</td><td colspan="2">-$${cartElements.discountAmount.toFixed(2)}</td></tr>`);
    }, 10);
    this.discountAdded = true;
    this.total -= this.discountAmount;
    htmlElements.total.innerHTML = this.total.toFixed(2);
  },
  getWeight: function () {
    return this.cart.map(x => x.weight * x.qty).reduce((a, b) => a + b, 0);
  },
  getSize: function () {
    return this.cart.map(x => x.cubicSize * x.qty).reduce((a, b) => a + b, 0);
  },
  total: 0,
  payment: function (btn) {
    let itemTotal = getItemTotal();
    let valid = validAddress();
    if (valid > 1) {
      alert('Please enter valid shipping address');
    } else if (itemTotal < 150 && userElements.user.exception !== true) {
      alert('minimum order is $150');
    } else {
      {
        const weight = cartElements.getWeight();
        const Size = cartElements.getSize();
        if (!shipElements.calculated || shipElements.weight !== weight || shipElements.size !== size) {
          shipElements.calcShip(btn);
        }
        htmlElements.paypal.style.display = 'block';
        htmlElements.paypal.scrollIntoView({behavior: 'smooth'});
      }
    }
  }
};

function validAddress() {
  let count = 0;
  for (let i = 0; i < shipElements.address.length; i++) {
    if (shipElements.address[i] === '') {
      count++;
    }
  }
  return count;
}

function getItemTotal() {
  total = 0;
  cartElements.cart.forEach(item => {
    total += item.price * item.qty;
  });
  return total;
}

const shipElements = {
  address: ['', '', '', '', '', '', '', '', ''],
  updateAddress: function (inputValue, num) {
    this.address[num] = inputValue;
  },
  calculated: false,
  calculatedWeight: 0,
  cost: 0,
  calcShip: function (btn) {
    let itenTotal = getItemTotal();
    if (itenTotal < 150 && userElements.user.exception !== true) {
      alert('minimum order is $150');
    } else {
      let weight = cartElements.getWeight();
      let size = cartElements.getSize();
      this.calculatedWeight = weight;
      if (weight > 150) weight = 150;
      let zip = htmlElements.zip.value;
      let valid = validAddress();
      if (valid > 1) return alert('Please enter valid shipping address');
      htmlElements.processing.style.display = 'flex';
      let url = `${apiPath}/products/shipcost?zip=${zip}&weight=${weight}&size=${size}`;
      fetch(url, {method: 'GET'})
        .then(res => {
          return res.json();
        })
        .then(data => {
          if (this.calculated) {
            document.getElementById('ship-row').remove();
            cartElements.total -= this.cost;
          }
          let newElement = document.createElement('tr');
          newElement.id = 'ship-row';
          let textNode = `<td>&nbsp;</td><td colspan="3"> Shipping </td><td colspan="2">$${data.toFixed(2)}</td>`;
          newElement.innerHTML = textNode;
          htmlElements.cartList.appendChild(newElement);
          this.calculated = true;
          cartElements.total += data;
          htmlElements.total.innerHTML = cartElements.total.toFixed(2);
          htmlElements.processing.style.display = 'none';
          btn.classList.add('added');
          this.cost = data;
          setTimeout(() => {
            btn.classList.remove('added');
          }, 1000);
        });
    }
  }
};

paypal
  .Buttons({
    style: {
      shape: 'pill',
      color: 'gold',
      layout: 'horizontal',
      label: 'paypal'
    },
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: cartElements.total.toFixed(2)
            }
          }
        ]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        htmlElements.processing.style.display = 'flex';
        processOrder();
      });
    }
  })
  .render('#paypal-button-container');

function processOrder() {
  const order = {
    items: cartElements.cart,
    shipping: shipElements.cost,
    user: userElements.user,
    address: shipElements.address,
    itemTotal: getItemTotal(),
    total: cartElements.total,
    discount: cartElements.discountAmount,
    discountName: cartElements.discountName
  };
  const url = apiPath + '/orders';
  fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({order})
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      if (data.message === 'success') {
        document.body.innerHTML = '<h4 id="order-submitted-msg">We received your order and sent you a confirmation email with your invoice. <br> Thank you!</h4><a id="return-btn" href="/">Back to login page</a>';
      }
      if (data.error === 'email was not sent') {
        document.body.innerHTML = '<h4 id="order-submitted-msg">We received your order. <br> Thank you!</h4><a id="return-btn" href="/">Back to login page</a>';
      }
      document.body.style = `box-sizing:border-box;max-height:100vh;overflow:hidden;padding:5%`;
    });
}
