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
    fetch(url, { method: method })
        .then(res => {
            return res.json();
        })
        .then(data => {
            productListItems.productList = data;
            productListItems.appendList(data);
        })
};

const apiPath = "https://decorizer.herokuapp.com";

(function () {
    let url = apiPath + "/products";
    getData(url, "GET");
})();

(function () {
    let userName = htmlElements.userName.innerText;
    if (userName !== "") {
        let url = `${apiPath}/getUser?name=${userName}`;
        fetch(url, { method: "GET" })
            .then(res => {
                return res.json();
            })
            .then(data => {
                userElements.user = data[0];
                htmlElements.email.value = userElements.user.email;
                htmlElements.business.value = userElements.user.name;
                shipElements.address[1] = userElements.user.name;
                shipElements.address[8] = userElements.user.email;
                if (data[0].balance != 0.00) {
                    userElements.processBalance()
                }
            })
    };
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
}

const createHtml = (tagName, className, idName, innerContent, insertTo) => {
    const htmlListItem = document.createElement(tagName);
    if (className) { htmlListItem.classList.add(className) };
    if (idName) { htmlListItem.id = idName };
    const textNode = (innerContent);
    htmlListItem.innerHTML = textNode;
    insertTo.insertAdjacentElement('beforeend', htmlListItem);
};

var productListItems = {
    productList: [],
    appendList: function (list) {
        list.forEach((item, i) => {
            const innerString = `<img src="/assets/${item.img}" alt="${item.name}" title="${item.name}"><h5>${item.sku}</h5><span class="price-wrapper">Price <span class="price">$${item.price.toFixed(2)}</span>
            <b>$${item.sale.toFixed(2)}</b></span><div class="add-wrapper"><input class="item-qty" type="number" placeholder="0" max="${item.qty}"><button class="add-btn" onclick="cartElements.addItem(this, ${i}, this.previousElementSibling)">Add To Cart</button></div>`;
            createHtml('div', 'item', '', innerString, htmlElements.section[item.num]);
        });
        htmlElements.itemQty = document.querySelectorAll('.item-qty');
    }
};

class Item {
    constructor(_sku, _name, _sale, _weight, _qty, _OrigQty, _img) {
        this.sku = _sku;
        this.name = _name;
        this.sale = _sale;
        this.weight = _weight;
        this.qty = _qty;
        this.origQty = _OrigQty;
        this.img = _img;
    }
};

const cartElements = {
    cart: [],
    weights: [0.45, 0.6, 1, 2, 0.1],
    addItem: function (btn, i, input) {
        if (input.value > parseInt(input.max)) {
            alert(`only ${input.max} available. \n Please lower the quantity`);
        } else {
            qty = input.value;
            let listItem = productListItems.productList[i]
            let newItem = new Item(listItem.sku, listItem.name, listItem.sale, this.weights[listItem.num], qty, listItem.qty, listItem.img);
            if (qty > 0) {
                if (this.cart.filter(item => item.sku === newItem.sku).length === 0) {
                    this.cart.push(newItem);
                }
                else {
                    this.cart.filter(item => item.sku === newItem.sku)[0].qty = qty;
                    this.calcTotal();
                    this.updateCart();
                }
                btn.classList.add('added');
                this.calcTotal();
                this.updateCart();
                setTimeout(() => {
                    btn.classList.remove('added');
                }, 1000);
            }
        }
    },
    remove: function (element, sku) {
        element.parentElement.remove();
        i = this.cart.findIndex(item => item.id === sku);
        this.cart.splice(i);
        this.calcTotal();
    },
    updateCart: function () {
        htmlElements.cartList.innerHTML = '';
        this.cart.forEach(item => {
            let newElement = document.createElement('tr');
            newElement.id = item.sku + '-row';
            let textNode = (`<td>${item.sku}</td><td>${item.name}</td><td>$${item.sale.toFixed(2)}</td><td>${item.qty}</td><td>$${(item.sale * item.qty).toFixed(2)}</td><td id="remove" title="remove from cart" onclick="cartElements.remove(this, '${item.sku}')">&#8855;</td>`);
            newElement.innerHTML = textNode;
            htmlElements.cartList.appendChild(newElement);
        });
    },
    calcTotal: function () {
        total = 0
        this.cart.forEach(item => {
            total += (item.sale * item.qty);
        });
        if (userElements.hasBalance) { total += userElements.balance }
        htmlElements.total.innerHTML = total.toFixed(2);
        this.total = total;
    },
    getWeight: function () {
        weight = 0
        this.cart.forEach(item => {
            weight += (item.weight * item.qty);
        });
        return weight;
    },
    total: 0,
    payment: function (btn) {
        let itemTotal = getItemTotal();
        let valid = validAddress()
        if (valid > 1) { alert('Please enter valid shipping address') } else if (itemTotal < 150) {
            alert("minimum order is $150");
        } else {
            {
                weight = cartElements.getWeight();
                if (!shipElements.calculated || shipElements.weight !== weight) {
                    shipElements.calcShip(btn);
                }
                htmlElements.paypal.style.display = 'block';
            }
        }
    }
};

function validAddress() {
    let count = 0;
    for (let i = 0; i < shipElements.address.length; i++) {
        if (shipElements.address[i] === "") {
            count++;
        }
    }
    return count;
};

function getItemTotal() {
    total = 0
    cartElements.cart.forEach(item => {
        total += (item.sale * item.qty);
    });
    return total;
};

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
        if (itenTotal < 150) {
            alert("minimum order is $150");
        } else {
            let weight = cartElements.getWeight();
            this.calculatedWeight = weight
            if (weight > 150) { weight = 150 }
            let zip = htmlElements.zip.value;
            let valid = validAddress();
            if (valid > 1) { alert('Please enter valid shipping address') } else {
                htmlElements.processing.style.display = 'flex';
                let url = `${apiPath}/products/shipcost?zip=${zip}&weight=${weight}`;
                fetch(url, { method: 'GET' })
                    .then(res => {
                        return res.json();
                    })
                    .then(data => {
                        if (this.calculated) {
                            document.getElementById('ship-row').remove();
                            cartElements.total -= this.cost;
                        }
                        let newElement = document.createElement('tr');
                        newElement.id = "ship-row";
                        let textNode = (`<td>&nbsp;</td><td colspan="3"> Shipping </td><td colspan="2">$${data.toFixed(2)}</td>`);
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
                    })
            }
        }
    }
};

paypal.Buttons({
    style: {
        shape: 'pill',
        color: 'gold',
        layout: 'horizontal',
        label: 'paypal',

    },
    createOrder: function (data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: cartElements.total
                }
            }]
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
            htmlElements.processing.style.display = 'flex';
            processOrder();
        });
    }
}).render('#paypal-button-container');

function processOrder() {
    let order = new Object;
    order.items = cartElements.cart;
    order.shipping = shipElements.cost;
    order.user = userElements.user;
    order.address = shipElements.address;
    order.itemTotal = getItemTotal();
    order.total = cartElements.total;
    let url = apiPath + "/orders"
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            if (data.message === "success") {
                alert('We received your order. \n Thank you.');
                htmlElements.processing.style.display = 'none';
                window.location.replace("https://decorizerstore.com/");
            }
        })
};