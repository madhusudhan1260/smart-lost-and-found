import { useRef, useState } from 'react';

/**
 * Shared logic for the report form and the claim form:
 * controlled values, touched fields, errors, live validation and focusing
 * the first invalid field. `validateOne(name, value)` returns an error message or ''.
 *
 * `values` / `setValues` are passed in so the caller decides where they live
 * (plain useState, or useLocalStorage for an auto-saved draft).
 */
export default function useFormState({ values, setValues, validateOne }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fieldRefs = useRef({}); // DOM elements, used to focus the first invalid field

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    // Re-validate live only after the user has visited the field once
    if (touched[name]) setErrors((previous) => ({ ...previous, [name]: validateOne(name, value) }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    setErrors((previous) => ({ ...previous, [name]: validateOne(name, value) }));
  };

  // Show all errors at once (on submit) and move the cursor to the first problem
  const showAllErrors = (formErrors) => {
    setErrors(formErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((key) => [key, true])));
    const firstInvalid = Object.keys(values).find((key) => formErrors[key]);
    fieldRefs.current[firstInvalid]?.focus();
  };

  const resetValidation = () => {
    setErrors({});
    setTouched({});
  };

  // Common props for every input – avoids repeating the same attributes
  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    ref: (element) => { fieldRefs.current[name] = element; },
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    className: errors[name] ? 'has-error' : undefined,
  });

  return { errors, fieldProps, showAllErrors, resetValidation };
}
