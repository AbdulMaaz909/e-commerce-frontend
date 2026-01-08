'use client'
import {React,useState,useEffect} from 'react'
import api from '@/lib/app.js'
const Shop = () => {
    const [products, setProducts] = useState([
      { id: 1, name: "Pizza", price: 500 }, // Mock data if API is not ready
      { id: 2, name: "Burger", price: 200 },
    ]);

    const [cartData, setCartData] = useState({ cart: [], subtotal: 0 });
const [coupon, setCoupon] = useState("");
const [discount, setDiscount] = useState(0);
const [msg, setMsg] = useState({ type: '', text: '' });

// 2. Define your functions
const fetchCart = async () => {
    try {
        const res = await api.get('/');
        // IMPORTANT: Don't forget to actually set the state here!
        setCartData(res.data); 
    } catch (error) {
        console.error("Cart error", error);
    }
};

const handleAddToCart = async (productId) => { // Added productId as a parameter
    try {
        await api.post('/add', { productId, quantity: 1 });
        setMsg({ type: 'success', text: 'Added to cart!' });
        fetchCart();
    } catch (err) {
        setMsg({ type: 'error', text: 'Failed to add item' });
    }
};

const handleApplyCoupon = async () => {
    try {
        const res = await api.post("/apply-coupon", { couponCode: coupon });
        setDiscount(res.data.discount);
        setMsg({ type: 'success', text: `Discount of ₹${res.data.discount} applied!` });
    } catch (err) {
        setDiscount(0);
        setMsg({ type: 'error', text: err.response?.data?.message || "Invalid Coupon" });
    }
};

// 3. Put useEffect at the bottom of the logic section
useEffect(() => {
    const loadData = async () =>{
        await fetchCart();
    };
    loadData()
}, []);

const handlePlaceOrder = async () => {
    try {
        // We send the coupon code so the backend can apply the final discount
        const res = await api.post('/checkout', { couponCode: coupon });
        
        // If successful, we show the order ID and clear the local UI
        alert(`Order Placed Successfully! Order ID: ${res.data.orderId}`);
        
        // Refresh the cart (it should now be empty)
        setCartData({ cart: [], subtotal: 0 });
        setDiscount(0);
        setCoupon("");
        
        // Optional: Redirect to a "Success" page
        // router.push(`/order-success/${res.data.orderId}`);
        
    } catch (err) {
        alert(err.response?.data?.message || "Failed to place order");
    }
};
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: Product List */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Menu</h1>
          {msg.text && (
            <div className={`p-3 mb-4 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg.text}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-blue-600 font-bold">₹{p.price}</p>
                </div>
                <button 
                  onClick={() => handleAddToCart(p.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Add +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Cart Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border h-fit sticky top-10">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Your Order</h2>
          
          <div className="space-y-3 mb-6">
            {cartData.cart.length === 0 && <p className="text-gray-400 text-sm">Cart is empty</p>}
            {cartData.cart.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.product_name || `Product #${item.product_id}`} <span className="text-gray-400">x{item.quantity}</span></span>
                <span className="font-medium">₹{item.price_at_addition * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartData.subtotal}</span>
            </div>

            {/* Coupon Input */}
            <div className="flex gap-2 mt-4">
              <input 
                type="text" 
                placeholder="Coupon Code"
                className="flex-1 border p-2 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-black"
              >
                Apply
              </button>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold pt-2">
                <span>Discount</span>
                <span>- ₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold pt-4 border-t mt-4 text-blue-900">
              <span>Total</span>
              <span>₹{cartData.subtotal - discount}</span>
            </div>
          </div>

          <button onClick={handlePlaceOrder}
          className="w-full bg-blue-600 text-white mt-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
            Place Order
          </button>
        </div>
      </div>
    </div>
  )
}

export default Shop
