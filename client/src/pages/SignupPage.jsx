import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

/* --------------------
   Validation Schemas
-------------------- */
const step1Schema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),
});

const step2Schema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const step3Schema = yup.object({
  terms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const currentSchema = step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm({
    resolver: yupResolver(currentSchema),
    defaultValues: formData,
    mode: "onChange",
  });

  const watchedValues = watch();

  /* --------------------
     Step Handlers
  -------------------- */
  const handleNext = async () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = await trigger(["name", "email"]);
      if (isValid) {
        setFormData({
          ...formData,
          name: watchedValues.name,
          email: watchedValues.email,
        });
        setStep(2);
      }
    } else if (step === 2) {
      isValid = await trigger(["password", "confirmPassword"]);
      if (isValid) {
        setFormData({
          ...formData,
          password: watchedValues.password,
          confirmPassword: watchedValues.confirmPassword,
        });
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /* --------------------
     Submit Handler
  -------------------- */
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result?.success) {
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  /* --------------------
     Progress Indicator
  -------------------- */
  const renderProgress = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step >= stepNumber
                  ? "bg-cinema-600 text-white"
                  : "bg-dark-800 text-dark-400"
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                  step > stepNumber ? "bg-cinema-600" : "bg-dark-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* ---------------- LEFT: FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md glass p-8 rounded-2xl border border-dark-800">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-white">
              Create Account
            </h1>
            <p className="text-dark-300 mt-2">
              Join CineAI and start booking movies 🎬
            </p>
          </div>

          {/* Progress Indicator */}
          {renderProgress()}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* ---------------- STEP 1: Personal Info ---------------- */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input-field pl-10"
                      {...register("name")}
                      defaultValue={formData.name}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

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
                      defaultValue={formData.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* ---------------- STEP 2: Password ---------------- */}
            {step === 2 && (
              <>
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
                      defaultValue={formData.password}
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

                <div>
                  <label className="block text-sm text-dark-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="input-field pl-10 pr-10"
                      {...register("confirmPassword")}
                      defaultValue={formData.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-outline flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* ---------------- STEP 3: Terms ---------------- */}
            {step === 3 && (
              <>
                <div className="space-y-4">
                  <div className="p-4 bg-dark-800 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Terms of Service</h3>
                    <p className="text-sm text-dark-300 mb-3">
                      By creating an account, you agree to our terms and conditions. 
                      We'll use your information to provide personalized movie recommendations 
                      and a seamless booking experience.
                    </p>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="accent-cinema-500 mt-1"
                        {...register("terms")}
                      />
                      <label className="text-sm text-dark-300">
                        I agree to the{" "}
                        <Link to="/terms" className="text-cinema-500 hover:text-cinema-400">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-cinema-500 hover:text-cinema-400">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>

                  {/* Account Summary */}
                  <div className="p-4 bg-dark-800 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Account Summary</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-dark-300">
                        <span className="text-dark-400">Name:</span> {formData.name}
                      </p>
                      <p className="text-dark-300">
                        <span className="text-dark-400">Email:</span> {formData.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-outline flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-dark-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          {/* Social Signup */}
          <div className="space-y-3">
            <button className="btn-outline w-full">
              Sign up with Google
            </button>
            <button className="btn-outline w-full">
              Sign up with Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-dark-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cinema-500 hover:text-cinema-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ---------------- RIGHT: IMAGE ---------------- */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
          alt="Cinema"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-dark-950/90 via-dark-950/60 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-md">
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Your Journey to Great Movies Starts Here
          </h2>
          <p className="text-dark-300 mt-4">
            Get personalized recommendations and book tickets seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
