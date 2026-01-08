'use client'
import {React,useState} from 'react'
import api from '@/lib/app.js'
import { useRouter } from 'next/navigation';

const Login = () => {
    const [formData,setFormData] = useState({email:'',password:""});
    const [error,setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login',formData);
            localStorage.setItem('token',res.data.token);
            localStorage.setItem('user',JSON.stringify(res.data.user));
            // role based redirect
            if(res.data.user.role === 'admin'){
                router.push('/admin');
            }else{
                router.push("/shop");
            }
        } catch (error) {
           setError(error.respone?.data?.message || "Invalid credentials"); 
        }
    }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="space-y-4">
          <input
            type="email" placeholder="Email"
            className="w-full p-3 border rounded focus:outline-blue-500 text-black"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password" placeholder="Password"
            className="w-full p-3 border rounded focus:outline-blue-500 text-black"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 transition">
            Sign In
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don`t have an account? <a href="/register" className="text-blue-600">Register</a>
        </p>
      </form>
    </div>
  )
}

export default Login
