import React from "react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-transparent text-center">
        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-2">Đăng nhập</h2>
        <p className="text-gray-400 mb-8">
          Chào mừng bạn trở lại! Vui lòng nhập thông tin của bạn.
        </p>

        {/* Form */}
        <form className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />

          {/* Nút đăng nhập bằng email */}
          <button
            type="submit"
            className="w-full py-3 rounded-md border border-gray-500 text-white font-medium hover:bg-gray-800 transition"
          >
            Đăng nhập bằng Email và Mật khẩu
          </button>
        </form>

        {/* OR */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-2 text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Nút đăng nhập Google */}
        <button className="w-full py-3 rounded-md bg-white text-black font-medium hover:bg-gray-200 transition">
          Đăng nhập bằng Google
        </button>

        {/* Link đăng ký */}
        <p className="mt-6 text-gray-400 text-sm">
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="text-white hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
