import { useEffect, useRef, type PointerEvent } from "react";

export function SignaturePad({
  value,
  onChange,
  disabled,
  className = "",
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const redraw = (src: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!src) return;
    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = src;
  };

  useEffect(() => {
    redraw(value);
  }, [value]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * canvas.width,
      y: ((event.clientY - box.top) / box.height) * canvas.height,
    };
  };

  const emit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/jpeg", 0.82));
  };

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={640}
        height={180}
        className="h-[140px] w-full cursor-crosshair touch-none rounded-xl border border-[#c5d6db] bg-white"
        onPointerDown={(event) => {
          if (disabled) return;
          drawing.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          const ctx = event.currentTarget.getContext("2d");
          const { x, y } = point(event);
          if (!ctx) return;
          ctx.strokeStyle = "#102b35";
          ctx.lineWidth = 2.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(event) => {
          if (!drawing.current || disabled) return;
          const ctx = event.currentTarget.getContext("2d");
          const { x, y } = point(event);
          if (!ctx) return;
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          if (!drawing.current) return;
          drawing.current = false;
          emit();
        }}
      />
      <div className="mt-2 flex gap-2">
        <button type="button" disabled={disabled} onClick={() => onChange("")} className="rounded-full border border-[#dbe5e8] px-3 py-1 text-[9px] font-black text-[#49616b]">
          Temizle / yeniden çiz
        </button>
        <button type="button" disabled={disabled || !value} onClick={() => redraw(value)} className="rounded-full border border-[#dbe5e8] px-3 py-1 text-[9px] font-black text-[#49616b]">
          İmzayı alana geri yükle
        </button>
      </div>
    </div>
  );
}
