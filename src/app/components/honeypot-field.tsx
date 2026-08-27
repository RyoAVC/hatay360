export function HoneypotField() {
  return (
    <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden opacity-0" aria-hidden="true">
      Şirket faks
      <input name="company_fax" tabIndex={-1} autoComplete="off" />
    </label>
  );
}
