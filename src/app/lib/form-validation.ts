import type { FormEvent } from "react";

function validityMessage(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (el.validity.valueMissing) {
    if (el.type === "checkbox") return "Devam etmek için bu kutuyu işaretleyin.";
    if (el.tagName === "SELECT") return "Lütfen listeden bir seçim yapın.";
    return "Bu alan boş bırakılamaz.";
  }
  if (el.validity.typeMismatch) {
    if (el.type === "email") return "Geçerli bir e-posta adresi yazın. Örnek: ad@firma.com";
    if (el.type === "url") return "Geçerli bir web adresi yazın. Örnek: https://site.com";
    return "Bu bilgi biçimi hatalı.";
  }
  if (el.validity.tooShort) return `En az ${el.minLength} karakter yazın.`;
  if (el.validity.tooLong) return `En fazla ${el.maxLength} karakter yazabilirsiniz.`;
  if (el.validity.patternMismatch) return el.dataset.errorTr || "Bu bilgiyi doğru biçimde yazın.";
  if (el.validity.rangeUnderflow || el.validity.rangeOverflow) return "Sayıyı verilen aralıkta yazın.";
  return "Bu bilgi hatalı. Lütfen kontrol edin.";
}

function isField(el: EventTarget | null): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}

export function onTurkishInvalid(event: FormEvent<HTMLFormElement>) {
  if (!isField(event.target)) return;
  event.target.setCustomValidity(validityMessage(event.target));
}

export function onTurkishInput(event: FormEvent<HTMLFormElement>) {
  if (!isField(event.target)) return;
  event.target.setCustomValidity("");
}

export const turkishFormProps = {
  noValidate: false,
  onInvalidCapture: onTurkishInvalid,
  onInput: onTurkishInput,
};

export const inputClass =
  "w-full rounded-xl border border-[#dbe6ea] bg-white px-4 py-3 text-[14px] text-[#1a1a1a] outline-none transition focus:border-[#00a8c4] aria-[invalid=true]:border-2 aria-[invalid=true]:border-red-500 aria-[invalid=true]:bg-red-50";
