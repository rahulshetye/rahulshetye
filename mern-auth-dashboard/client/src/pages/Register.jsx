import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/register.css'; // 👈 new separate CSS file

// Validation schema
const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function Register() {
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      alert(err?.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <h1>Register</h1>
        <p>Create your account</p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div>
            <label>Name</label>
            <input {...register('name')} placeholder="Your Name" />
            {errors.name && <p className="error">{errors.name.message}</p>}
          </div>

          <div>
            <label>Email</label>
            <input {...register('email')} placeholder="you@example.com" />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div>
            <label>Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
            />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <button type="submit">Register</button>
        </form>

        {/* Footer */}
        <p className="register-footer">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
