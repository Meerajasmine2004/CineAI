import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

/* --------------------
   Validation Schema
-------------------- */
const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  remember: yup.boolean(),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  /* --------------------
     Submit Handler
  -------------------- */
  const onSubmit = async (data) => {
    setLoading(true);

    const result = await login({
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (result?.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* ---------------- LEFT: FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md glass p-8 rounded-2xl border border-dark-800">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-white">
              Welcome Back
            </h1>
            <p className="text-dark-300 mt-2">
              Sign in to book your next movie 🍿
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-dark-300">
                <input
                  type="checkbox"
                  className="accent-cinema-500"
                  {...register("remember")}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-cinema-500 hover:text-cinema-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-dark-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="btn-outline w-full">
              Continue with Google
            </button>
            <button className="btn-outline w-full">
              Continue with Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-dark-300">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-cinema-500 hover:text-cinema-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* ---------------- RIGHT: IMAGE ---------------- */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1581905764498-f1b60bae941a"
          alt="Cinema"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-dark-950/90 via-dark-950/60 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-md">
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Experience Movies Like Never Before
          </h2>
          <p className="text-dark-300 mt-4">
            AI-powered recommendations. Seamless booking. Real-time seats.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
