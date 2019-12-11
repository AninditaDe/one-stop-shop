var carBtn = document.querySelector('.cart-btn')
var closeCartBtn = document.querySelector('.close-cart')
var clearCartBtn = document.querySelector('.clear-cart')
var cartDOM = document.querySelector('.cart')
var cartOverlay = document.querySelector('.cart-overlay')
var cartItems = document.querySelector('.cart-items')
var cartTotal = document.querySelector('.cart-total')
var cartContent = document.querySelector('.cart-content')
var productsDOM = document.querySelector('.products-center')

//API
const API_ENDPOINT = "http://localhost:3000"
const PRODUCT_URL = `${API_ENDPOINT}/items/`
//cart
let cart = []
//buttons
let buttonsDOM = []

//getting the products
class Products{
    async getProducts()
    {
        try{
            let result = await fetch(PRODUCT_URL)
            let data = await result.json()
            let products = data.map(item=>{
                    const {title, price} = item.fields 
                    const {id} = item.sys
                    const image = item.fields.image.fields.file.url
                    return {title, price, id, image}
            })
            return products
        }
        catch(error)
        {
            console.log(error)
        }
    }

}

//Display products
class UI
{
    displayProducts(products)
    {
        let result =''
        products.forEach(product => {
            result += ` <article class="product">
            <div class="img-container">
                    <img src=${product.image} alt="product" 
                    class="product-img"/>
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fa fa-shopping-cart"></i>
                        Add to cart
                    </button>
            </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
    </article>`
        });
        productsDOM.innerHTML = result
    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons
        buttons.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id)
            if(inCart)
            {
                btn.innerText ='In Cart'
                btn.disabled = true
            }
                btn.addEventListener('click',event =>{
                    event.target.innerText = 'In Cart'
                    event.target.disabled = true
                    //get the item from the products
                    let cartItem = {...Storage.getProduct(id), amount: 1}
                    console.log(cartItem)
                    //add the item into the cart
                    cart = [...cart, cartItem]
                    //save the cart into the local storage
                    Storage.saveCart(cart)
                    //set the cart 
                    this.setCartValue(cart)
                    //display cart items
                    this.addCartItem(cartItem)
                    //show the cart
                    this.showCart()
                })
        })
       
    }
    setCartValue(cart)
    {
        let tempTotal = 0
        let itemsTotal = 0
        cart.map(item => {
            tempTotal += item.price * item.amount
            //console.log(parseFloat(tempTotal.toFixed(2)))
            itemsTotal += item.amount
        })
        cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2)) 
        cartItems.innerText = itemsTotal
    }
    addCartItem(cartItem)
    {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `<div class="cart-item">
                <img src=${cartItem.image} alt="product" />
                <div>
                    <h4>${cartItem.title}</h4>
                    <h5>${cartItem.price}</h5>
                    <span class="remove-item" data-id =${cartItem.id}>remove</span>
                </div>
                <div>
                    <i class="fa fa-chevron-up" data-id = ${cartItem.id}></i>
                    <p class="item-amount">1</p>
                    <i class="fa fa-chevron-down" data-id = ${cartItem.id}></i>
                </div>
        </div>`
        cartContent.appendChild(div)
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    hideCart()
    {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    setupAPP()
    {
        cart = Storage.getCart()
        this.setCartValue(cart)
        this.populate(cart)
        carBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click',this.hideCart)
    }
    populate(cart)
    {
        cart.forEach(item => this.addCartItem(item))
    }
    cartLogic()
    {
        //clear cart button
        clearCartBtn.addEventListener('click', () => this.clearCart())
        //cart functionality
        cartContent.addEventListener('click', event=> {
            if(event.target.classList.contains("remove-item"))
            {
                let removeItem = event.target
                let id = removeItem.dataset.id
                //console.log(cartContent.childNodes[0])
                //console.log(id - 1)
                cartContent.removeChild(cartContent.childNodes[id - 1])
                this.removeItem(id)
            }
            else if(event.target.classList.contains("fa-chevron-up"))
            {
                let addAmount = event.target
                let id = addAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount + 1
                Storage.saveCart(cart)
                this.setCartValue(cart)
                addAmount.nextElementSibling.innerText = tempItem.amount
            }
            else if(event.target.classList.contains("fa-chevron-down"))
            {
                let lowerAmt = event.target
                let id = lowerAmt.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1
                if(tempItem.amount > 0)
                {   
                    Storage.saveCart(cart)
                    this.setCartValue(cart)
                }
                else{
                    cartContent.removeChild(lowerAmt.parentElement.parentElement)
                    this.removeItem(id)
                    lowerAmt.previousElementSibling.innerText = tempItem.amount
                }
            }
        })
    }
    clearCart()
    {
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        console.log(cartContent.children);
        
        while(cartContent.children.length > 0)
        {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id)
    {
        cart = cart.filter(item => item.id !== id)
        this.setCartValue(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`
    }
    getSingleButton(id)
    {
        return buttonsDOM.find(btn=> btn.dataset.id === id)
    }
}
//local storage
class Storage
{   
    static saveProduct(products)
    {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id)
    {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart)
    {
        localStorage.setItem("cart", JSON.stringify(cart))
    }
    static getCart()
    {
        return localStorage.getItem('cart') ? 
        JSON.parse(localStorage.getItem('cart')) : []
    }
}
document.addEventListener("DOMContentLoaded", ()=>
{
    const ui = new UI()
    const products = new Products()
    ui.setupAPP()
    products.getProducts().then(products =>{ 
        ui.displayProducts(products);
        Storage.saveProduct(products);
        }).then(() =>{
        ui.getBagButtons()
        ui.cartLogic()
        })
})