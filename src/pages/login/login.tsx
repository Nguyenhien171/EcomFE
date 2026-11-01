/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../../schemas/authSchema";
import path from "../../constants/path";
import { useAuth } from "../../contexts/AuthContext";
import http from "../../utils/axios.http";



const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      staySignedIn: false,
    },
  });

  // Load email nếu đã lưu "Stay signed in"
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("staySignedIn", true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Call backend login API
      const response = await http.post( "/v1/auth/login", {
        email: data.email,
        password: data.password
      });
      console.log(response)
      console.log("Login response:", response.data);

      // Handle different response shapes from BE
      // const raw = response?.data ?? {};
      // const result = (raw as any).result ?? raw;
      const tokens = (response as any).data ?? {};
      const accessToken = (tokens as any).accessToken as string | undefined;
      const refreshToken = (tokens as any).refreshToken as string | undefined;
      // const user_profile = (result as any).user_profile ?? (result as any).user ?? (result as any).profile ?? null;

      if (!accessToken) {
        throw new Error('Không nhận được accessToken từ server');
      }

      // Store user data and tokens in context/localStorage
      login(accessToken, refreshToken || '', {} as any);

      // Save email if "Stay signed in" is checked
      if (data.staySignedIn) {
        localStorage.setItem("savedEmail", data.email);
      } else {
        localStorage.removeItem("savedEmail");
        sessionStorage.setItem("tempEmail", data.email);
      }

      // Redirect to intended page or dashboard
      // const from = (location.state as any)?.from?.pathname || path.dashboard;
      navigate("/products", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      const msg = error?.response?.data?.message
        || error?.message
        || "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-gray-50 to-white flex flex-col justify-center items-center p-4">
      <div className="bg-white p-10 rounded-xl w-full max-w-md shadow-md flex flex-col justify-between min-h-[400px]">
        <h2 className="text-2xl font-bold mb-10">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 justify-between">
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email Address"
                {...register("email")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errors.email ? "border-red-500" : "focus:border-blue-400"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring pr-10 ${
                  errors.password ? "border-red-500" : "focus:border-blue-400"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Stay signed in */}
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  {...register("staySignedIn")}
                  className="mr-2 rounded border-gray-300 focus:ring-blue-400"
                />
                Stay signed in
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mb-2">{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-lg mt-2 ${
              isLoading 
                ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Đang đăng nhập..." : "Login"}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center space-y-3">
        <a href="#" className="block text-sm text-blue-600 hover:underline">
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