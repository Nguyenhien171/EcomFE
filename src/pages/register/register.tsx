import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import path from "../../constants/path";
import { registerSchema, type RegisterFormData } from "../../schemas/authSchema";
import http from "../../utils/axios.http";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
    console.log("Form data:", data);

    const response = await http.post("/v1/auth/register", data);
    console.log("Register response:", response.data);

    alert("Đăng ký thành công!");

    // Optional: auto-login hoặc redirect sang /login
    // navigate("/login");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    alert(err?.response?.data?.message || "Đăng ký thất bại!");
  }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-gray-50 to-white flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-xl w-96 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Email Address"
              {...register("email")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                errors.email ? "border-red-500" : "focus:border-blue-400"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              placeholder="Username"
              {...register("username")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                errors.username ? "border-red-500" : "focus:border-blue-400"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.password ? "border-red-500" : "focus:border-blue-400"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.confirmPassword ? "border-red-500" : "focus:border-blue-400"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 mt-4"
          >
            Register
          </button>
        </form>
      </div>

      {/* Link to Login */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Bạn đã có tài khoản?{" "}
          <Link to={path.login} className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
