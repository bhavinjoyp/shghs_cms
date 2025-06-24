import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  type = 'text',
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = error ? 'input input-error' : 'input';
  const classes = `${inputClasses} ${className}`.trim();

  if (type === 'textarea') {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className="textarea"
          {...(props as any)}
        />
        {error && (
          <p className="form-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="form-help">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={classes}
        {...props}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="form-help">{helperText}</p>
      )}
    </div>
  );
};

export default Input;