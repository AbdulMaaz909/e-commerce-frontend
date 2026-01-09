'use client'
import { React, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link';
import api from '@/lib/app.js';

const OrderDetails = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id'); // Looks for ?id= in URL
    
    const [items, setItems] = useState([]);
    const [loading, setLoadings] = useState(true);

    useEffect(() => {
        // If the ID isn't in the URL yet, don't do anything
        if (!orderId) return;

        const fetchOrderdetails = async () => {
            try {
                // Fetch data from backend
                const res = await api.get(`/order-details/${orderId}`);
                setItems(res.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                // STOP the "Generating..." screen no matter what
                setLoadings(false);
            }
        };

        fetchOrderdetails();
    }, [orderId]); // Runs as soon as orderId is found

    // While waiting for the ID or the API
    if (loading) {
        return (
            <div className='text-center p-20'>
                <p className='font-bold animate-bounce'>Generating your receipt...</p>
                <p className='text-sm text-gray-400 mt-2'>If this takes too long, check if the URL has ?id=</p>
            </div>
        );
    }

    // If we stopped loading but have no items
    if (items.length === 0) {
        return (
            <div className='text-center p-20'>
                <p className='text-red-500 font-bold'>Order not found or ID is missing.</p>
                <Link href="/" className="underline text-blue-500">Go back to Shop</Link>
            </div>
        );
    }

    const totalPaid = items.reduce((sum, item) => sum + (Number(item.price_at_purchase) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 text-black ">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-green-500 p-8 text-center text-white">
                    <h1 className="text-3xl font-bold italic">Order Confirmed!</h1>
                    <p className="opacity-90">Order ID: #ORD-{orderId}</p>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-bold mb-6 border-b pb-2 text-gray-800">Order Summary</h2>
                    <div className="space-y-4 mb-8">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.product_name}</p>
                                    <p className="text-xs text-gray-400 uppercase">{item.category_name}</p>
                                </div>
                                <p className="font-bold">₹{(Number(item.price_at_purchase) * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="flex justify-between items-center text-xl font-extrabold text-blue-900">
                            <span>Total Paid</span>
                            <span>₹{totalPaid.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <Link href="/shop" className="block w-full mt-10 bg-blue-600 text-white text-center py-4 rounded-xl font-bold hover:bg-blue-700">
                        Order More Food
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ViewOrder() {
    return (
        <Suspense fallback={<div className="text-center p-20">Loading...</div>}>
            <OrderDetails />
        </Suspense>
    );
}