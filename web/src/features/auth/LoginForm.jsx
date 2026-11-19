import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useAuth, useLanguage } from '../../hooks/useAuth.js';
import { errorMessage } from '../../utils/formatters.js';
import { loginSchema } from '../../utils/validators.js';

export default function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setError('');
    try {
      await login(values);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.code === 'UNAUTHORIZED' ? 'Wrong phone number or password.' : errorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Alert type="error">{error}</Alert>
      <Input label={t('auth.phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+265999000111" error={errors.phone?.message} {...register('phone')} />
      <Input label={t('auth.password')} type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
      <Button type="submit" loading={isSubmitting} className="w-full">
        {t('auth.login')}
      </Button>
      <p className="text-center text-sm">
        {t('auth.new_to_farmai')}{' '}
        <Link to="/register" className="font-semibold text-brand-700">
          {t('auth.create_an_account')}
        </Link>
      </p>
    </form>
  );
}
