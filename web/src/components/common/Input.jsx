import { forwardRef, useId } from 'react';

function Field({ label, error, hint, id, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, className = '', ...rest }, ref) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <input
        id={id}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={`field ${error ? 'border-red-500' : ''} ${className}`}
        {...rest}
      />
    </Field>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, options, placeholder, className = '', ...rest },
  ref,
) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <select id={id} ref={ref} aria-invalid={Boolean(error)} className={`field ${className}`} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, className = '', ...rest }, ref) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id}>
      <textarea id={id} ref={ref} rows={4} className={`field ${className}`} {...rest} />
    </Field>
  );
});

export default Input;
