import { AlertCircle } from 'lucide-react';
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
      {hint && !error && <p className="muted mt-2 text-base">{hint}</p>}
      {error && (
        <p className="mt-2 flex items-start gap-2 text-base font-medium text-red-700 dark:text-red-400" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
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
        className={`field ${error ? 'border-red-600 dark:border-red-500' : ''} ${className}`}
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
