export function FieldGroup({ label, required, hint, children }) {
  return (
    <label className="field-group">
      <span className="field-label">
        {label}
        {required && <span className="field-required">必須</span>}
      </span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function TextField({ value, onChange, placeholder, type = "text", list, mono, ...rest }) {
  return (
    <input
      className={`field-input${mono ? " mono" : ""}`}
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      list={list}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export function TextAreaField({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      className="field-textarea"
      value={value ?? ""}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SelectField({ value, onChange, options, placeholder }) {
  return (
    <div className="field-select-wrap">
      <select
        className="field-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`segmented-btn${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ComboField({ value, onChange, options, placeholder, listId }) {
  return (
    <>
      <input
        className="field-input"
        value={value ?? ""}
        placeholder={placeholder}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
}
