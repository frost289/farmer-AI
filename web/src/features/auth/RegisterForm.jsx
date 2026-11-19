import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import Input, { Select } from '../../components/common/Input.jsx';
import { useAuth, useLanguage } from '../../hooks/useAuth.js';
import { errorMessage } from '../../utils/formatters.js';
import { registerSchema } from '../../utils/validators.js';

export default function RegisterForm() {
  const { register: signUp } = useAuth();
  const { language, t, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { role: 'farmer', language } });

  const languageField = register('language');

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
      <Input label={t('auth.name')} autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input label={t('auth.phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="+265999000111" error={errors.phone?.message} {...register('phone')} />
      <Input label={t('auth.password')} type="password" autoComplete="new-password" hint={t('auth.password_hint')} error={errors.password?.message} {...register('password')} />
      <Select
        label={t('auth.role')}
        options={[
          { value: 'farmer', label: t('auth.farmer') },
          { value: 'field_agent', label: t('auth.field_agent') },
        ]}
        error={errors.role?.message}
        {...register('role')}
      />
      <Select
        label={t('auth.language')}
        options={[
          { value: 'en', label: 'English' },
          { value: 'ny', label: 'Chichewa' },
        ]}
        {...languageField}
        onChange={(event) => {
          languageField.onChange(event);
          setLanguage(event.target.value);
        }}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        {t('auth.create_account')}
      </Button>
      <p className="text-center text-sm">
        {t('auth.already_registered')}{' '}
        <Link to="/login" className="font-semibold text-brand-700">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  );
}
