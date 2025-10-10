import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css"; // 👈 Import external styles

// ✅ Validation schema
const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await loginUser(data);
      navigate("/dashboard");
    } catch (err) {
      alert(err?.msg || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back 👋</h1>
        <p className="login-subtitle">Please log in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className={`input-field ${errors.email ? "error-border" : ""}`}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className={`input-field ${errors.password ? "error-border" : ""}`}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="login-button">Sign In</button>
        </form>

        <p className="register-text">
          Don’t have an account?{" "}
          <Link to="/register" className="register-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
