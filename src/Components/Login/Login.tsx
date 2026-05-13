import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../Services/AuthContext';
import './Login.css';

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    mode: 'onSubmit'
  });

  const onSubmit = async ({
    email,
    password
  }: LoginForm) => {
    setError(null);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Acceso</h2>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="auth-input"
              type="email"
              autoComplete="email"
              placeholder="admin@kaizer.tech"
              {...register('email', {
                required: true
              })}
            />
            {errors.email && (
              <p className="auth-error">
                Email requerido
              </p>
            )}
          </div>

          <div className="auth-field">
            <label
              className="auth-label"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              className="auth-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password', {
                required: true,
                minLength: 8
              })}
            />
            {errors.password && (
              <p className="auth-error">
                Password mínimo 8 caracteres
              </p>
            )}
          </div>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            className="hero-button auth-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
