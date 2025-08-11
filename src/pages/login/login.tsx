/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import path from "../../constants/path";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);

  // Validate Emailx
  const validateEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.com$/;
    if (!value) return "Bạn chưa nhập email";
    if (!emailRegex.test(value)) return "Email không hợp lệ";
    return "";
  };

  // Validate Password
  const validatePassword = (value: string) => {
    if (!value) return "Bạn chưa nhập mật khẩu";
    if (value.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (value !== value.trim()) return "Mật khẩu không được chứa khoảng trắng";
    return "";
  };

  // Load email nếu đã lưu "Stay signed in"
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setStaySignedIn(true);
    }
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleStaySignedInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStaySignedIn(e.target.checked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passErr);

    if (!emailErr && !passErr) {
      console.log("Login success:", { email, password, staySignedIn });

      if (staySignedIn) {
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("savedEmail");
        sessionStorage.setItem("tempEmail", email);
      }

      alert("Login success!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-gray-50 to-white flex flex-col justify-center items-center p-4">
      {/* Form Box */}
      <div className="bg-white p-10 rounded-xl w-full max-w-md shadow-md flex flex-col justify-between min-h-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-4">{/* Logo nếu cần */}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-10">Login</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between">
          <div className="space-y-6 ">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  emailError ? "border-red-500" : "focus:border-blue-400"
                }`}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>

              <input
                type={showPassword ? "text" : "password"} // Toggle type
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring pr-10 ${
                  passwordError ? "border-red-500" : "focus:border-blue-400"
                }`}
              />

              {/* Nút toggle password */}
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Stay signed in + Forgot password */}
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={handleStaySignedInChange}
                  className="mr-2 rounded border-gray-300 focus:ring-blue-400"
                />
                Stay signed in
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 mt-2"
          >
            Login
          </button>
        </form>
      </div>

      {/* Outside Links */}
      <div className="mt-6 text-center space-y-3">
        <a
          href="#"
          className="block text-sm text-blue-600 hover:underline"
        >
          Login with SSO
        </a>
        <p className="text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to={path.register} className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
