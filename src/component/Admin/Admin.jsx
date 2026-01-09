'use client'
import { React, useState, useEffect } from 'react'
import api from '@/lib/app.js';
import { useRouter } from 'next/navigation';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrderItems, setSelectedOrderItems] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    // 1. Move handleViewDetails OUTSIDE useEffect so it is accessible to the buttons
    const handleViewDetails = async (orderId) => {
        try {
            const res = await api.get(`/order-details/${orderId}`);
            setSelectedOrderItems(res.data);
            setShowModal(true);
        } catch (err) {
            console.error(err);
            alert("Could not load items");
        }
    };

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                const [usersRes, ordersRes] = await Promise.all([
                    api.get('/getallusers'),
                    api.get('/getallorders')
                ]);
                setUsers(usersRes.data);
                setOrders(ordersRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        if (!user || user.role !== 'admin') {
            router.push('/');
        } else {
            fetchAdminData();
        }
    }, [router]);

    if (loading) return <div className="p-10 text-center font-bold">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6 text-black">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
                    <h1 className="text-3xl font-extrabold text-blue-900">Admin Control Center</h1>
                    <button
                        onClick={() => { localStorage.clear(); router.push('/'); }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-full font-semibold transition ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
                    >
                        Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2 rounded-full font-semibold transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
                    >
                        All Orders ({orders.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {activeTab === 'users' ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-bold">ID</th>
                                    <th className="p-4 font-bold">Name</th>
                                    <th className="p-4 font-bold">Role</th>
                                    <th className="p-4 font-bold">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-500">#{u.id}</td>
                                        <td className="p-4 font-medium">{u.name}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">{new Date(u.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-bold">Order ID</th>
                                    <th className="p-4 font-bold">Customer</th>
                                    <th className="p-4 font-bold">Subtotal</th>
                                    <th className="p-4 font-bold">Coupon</th>
                                    <th className="p-4 font-bold">Final Payable</th>
                                    <th className="p-4 font-bold">Date</th>
                                    <th className="p-4 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
    {orders.length > 0 ? (
        orders.map(o => (
            <tr key={o.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-blue-600">ORD-{o.id}</td>
                <td className="p-4 font-medium">{o.user_name}</td>
                {/* Use parseFloat to handle string decimals from DB */}
                <td className="p-4 text-gray-500">₹{parseFloat(o.subtotal).toFixed(2)}</td>
                <td className="p-4">
                    {o.coupon_applied ? (
                        <span className="text-orange-600 font-mono text-xs font-bold bg-orange-50 border border-orange-200 px-2 py-1 rounded">
                            {o.coupon_applied}
                        </span>
                    ) : (
                        <span className="text-gray-400 italic text-sm">No Coupon</span>
                    )}
                </td>
                <td className="p-4 font-bold text-green-700">₹{parseFloat(o.final_payable).toFixed(2)}</td>
                <td className="p-4 text-gray-600 text-sm">
                    {new Date(o.created_at).toLocaleDateString()} <br/>
                    <span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </td>
                <td className="p-4">
                    <button
                        onClick={() => handleViewDetails(o.id)}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md border border-blue-200 hover:bg-blue-600 hover:text-white font-bold transition text-xs"
                    >
                        View Items
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="7" className="p-10 text-center text-gray-400">No orders found in the database.</td>
        </tr>
    )}
</tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 2. THE MODAL UI - Add this here */}
            {showModal && selectedOrderItems && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-xl font-bold text-blue-900">Order Contents</h2>
                            <button onClick={() => setShowModal(false)} className="text-2xl text-gray-500 hover:text-black">&times;</button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {selectedOrderItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-bold text-gray-800">{item.product_name}</p>
                                        <p className="text-xs text-blue-600 font-semibold uppercase">{item.category_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Qty: {item.quantity}</p>
                                        <p className="text-sm font-bold text-green-600">₹{item.price_at_purchase}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Admin;