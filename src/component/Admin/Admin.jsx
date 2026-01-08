'use client'
import {React,useState,useEffect, use} from 'react'
import api from '@/lib/app.js';
import {useRouter} from 'next/navigation';

const Admin = () => {
    const [activeTab,setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [orders,setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

//     useEffect(()=>{
//         const user = JSON.parse(localStorage.getItem('user'));
//         if(!user || !user.role === 'admin'){
//         router.push('/');
//         return
// }
// fetchAdminData();
//     },[]);
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

  const user = JSON.parse(localStorage.getItem('user'));
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
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold text-blue-600">ORD-{o.id}</td>
                    <td className="p-4">{o.user_name}</td>
                    <td className="p-4 text-gray-500">₹{o.subtotal}</td>
                    <td className="p-4">
                      {o.coupon_applied ? <span className="text-orange-600 font-mono text-sm font-bold bg-orange-50 px-2 py-1 rounded">{o.coupon_applied}</span> : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="p-4 font-bold text-green-700">₹{o.final_payable}</td>
                    <td className="p-4 text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin