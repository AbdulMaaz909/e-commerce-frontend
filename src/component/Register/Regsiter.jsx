"use client";
import { useState } from 'react';
import api from '@/lib/app.js';
import { useRouter } from 'next/navigation';

const Regsiter = () => {
    const [formData, setFormData] = useState({name:'',email:'',password:''});
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post("/register",formData);
            alert("Registeration successful! Please login.")
            router.push('/')
        } catch (error) {
            alert(error.response?.data?.message || "Error registering");
        }
    }
    
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        <div className="space-y-4">
          <input
            type="text" placeholder="Full Name"
            className="w-full p-3 border rounded text-black"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input
            type="email" placeholder="Email"
            className="w-full p-3 border rounded text-black"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password" placeholder="Password"
            className="w-full p-3 border rounded text-black"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button className="w-full bg-green-600 text-white p-3 rounded font-semibold hover:bg-green-700">
            Register
          </button>
        </div>
      </form>
    </div>
  )
}

export default Regsiter
