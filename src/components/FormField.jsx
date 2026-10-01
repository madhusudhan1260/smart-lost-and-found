// File: src/components/FormField.jsx
// Used by: components/ClaimForm.jsx, components/ItemForm.jsx
// Label + input + helper text + error message, so every form field looks the same.
// The actual <input>/<select>/<textarea> is passed in as `children`.
export default function FormField({ id, label, required = false, hint, error, full = false, children }) {
  return (
    <div className={`form-field ${full ? 'form-field--full' : ''}`}>
      <label htmlFor={id}>
        {label} {required && (
          <>
            <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert" aria-live="polite">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>
      )}
    </div>
  );
}
