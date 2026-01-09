'use client'
import { React, useState, useEffect } from 'react'
import api from '@/lib/app.js'
import {useRouter} from 'next/navigation';

const Shop = () => {
  // 1. Changed products to an empty array initially
  const [products, setProducts] = useState([]);
  const [cartData, setCartData] = useState({ cart: [], subtotal: 0 });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 2. Function to fetch products from your backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/getproducts'); // Your GET request
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
      setMsg({ type: 'error', text: 'Could not load menu items.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/');
      setCartData(res.data);
    } catch (error) {
      console.error("Cart error", error);
    }
  };

  const handleAddToCart = async (productId) => {
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

const handlePlaceOrder = async () => {
  try {
    const res = await api.post('/checkout', { couponCode: coupon });
    
    // 1. Get the ID from the backend response
    const newId = res.data.orderId; 
    
    if (newId) {
      alert(`Order Placed! ID: ${newId}`);
      // 2. You MUST include the ?id= part here!
      router.push(`/vieworder?id=${newId}`); 
    } else {
      console.error("Backend did not return an orderId");
    }
  } catch (err) {
    alert(err.response?.data?.message || "Failed to place order");
  }
};

  // 3. Updated useEffect to load both Products and Cart on mount
  useEffect(() => {
    const loadAllData = async () => {
      await fetchProducts();
      await fetchCart();
    };
    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-bold animate-pulse">Loading Menu...</p>
      </div>
    );
  }

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
            {products.length > 0 ? products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {/* Showing category name if your join query provides it */}
                  <p className="text-xs text-gray-500 uppercase">{p.category_name}</p>
                  <p className="text-blue-600 font-bold">₹{p.price}</p>
                </div>
                <button 
                  onClick={() => handleAddToCart(p.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Add +
                </button>
              </div>
            )) : (
              <p className="text-gray-500">No products available.</p>
            )}
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

            {/* Coupon Selection */}
            <div className="mt-6 border-t pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Available Offers</label>
              <div className="flex items-center gap-2 w-full">
                <select 
                  className="flex-1 border p-2 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-blue-500"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setDiscount(0);
                  }}
                >
                  <option value="">-- Choose a Coupon --</option>
                  <option value="WELCOME">WELCOME (20% Off - First Order)</option>
                  <option value="DRINK200">DRINK200 (₹200 Off Drinks - Min ₹1000)</option>
                  <option value="SAVE10">SAVE10 (10% Off Food - Min ₹5000)</option>
                </select>
                
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
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

export default Shop;