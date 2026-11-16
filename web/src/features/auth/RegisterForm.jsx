import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Input, { Select } from '../../components/common/Input.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { errorMessage } from '../../utils/formatters.js';
import { registerSchema } from '../../utils/validators.js';

export default function RegisterForm() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { role: 'farmer', language: 'en' } });

  const onSubmit = async (values) => {
    setError('');
    try {
      await signUp(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Alert type="error">{error}</Alert>
      <Input label="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+265999000111" error={errors.phone?.message} {...register('phone')} />
      <Input label="Password" type="password" autoComplete="new-password" hint="At least 8 characters" error={errors.password?.message} {...register('password')} />
      <Select
        label="I am a"
        options={[
          { value: 'farmer', label: 'Farmer' },
          { value: 'field_agent', label: 'Field agent' },
        ]}
        error={errors.role?.message}
        {...register('role')}
      />
      <Select
        label="Language"
        options={[
          { value: 'en', label: 'English' },
          { value: 'ny', label: 'Chichewa' },
        ]}
        {...register('language')}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
