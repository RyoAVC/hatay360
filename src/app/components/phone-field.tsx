import { isValidTrPhone, PHONE_ERROR, sanitizePhoneInput } from "../lib/contact";
import { FieldHint } from "./form-error";

type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  id?: string;
  className?: string;
};

export function PhoneField({ value, onChange, name = "phone", required = true, id, className }: PhoneFieldProps) {
  const digits = value.replace(/\D/g, "");
  const started = digits.length > 0;
  const valid = isValidTrPhone(value);
  const showError = started && !valid;

  return (
    <div>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        required={required}
        maxLength={14}
        pattern="0[0-9]{3} [0-9]{3} [0-9]{2} [0-9]{2}"
        data-error-tr={PHONE_ERROR}
        aria-invalid={showError}
        value={value}
        onChange={(event) => onChange(sanitizePhoneInput(event.target.value))}
        placeholder="05xx xxx xx xx"
        className={className || "w-full rounded-xl border border-[#dbe6ea] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-[#00a8c4] aria-[invalid=true]:border-2 aria-[invalid=true]:border-red-500 aria-[invalid=true]:bg-red-50"}
      />
      <FieldHint error={showError}>
                  {showError ? PHONE_ERROR : valid ? "Numara uygun." : "Sadece rakam. Harf yazılmaz. Örnek: 0544 123 45 67"}
      </FieldHint>
    </div>
  );
}
