import { useEffect, useState } from "react";

const BALLOON_COLORS = ["#00a8c4", "#f5b301", "#22c55e", "#a855f7", "#f472b6", "#38bdf8"];

type Balloon = { id: number; left: number; delay: number; duration: number; size: number; color: string };

function makeBalloons(count = 18): Balloon[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 4 + Math.random() * 92,
    delay: Math.random() * 2.5,
    duration: 5 + Math.random() * 4,
    size: 28 + Math.random() * 22,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
  }));
}

/** Yayınlanıyor / Yayında aşamasında tek seferlik kutlama balonları. */
export function PublishCelebration({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    setBalloons(makeBalloons(20));
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDone();
    }, 7200);
    return () => window.clearTimeout(timer);
  }, [active, onDone]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-8 text-center">
        <p className="text-[22px] font-black tracking-tight text-[#007f98] drop-shadow-sm sm:text-[28px]">🎉 Siteniz yayında!</p>
        <p className="mt-1 text-[12px] font-bold text-[#49616b]">Hatay360 ekibi yayına aldı — tebrikler!</p>
      </div>
      {balloons.map((balloon) => (
        <span
          key={balloon.id}
          className="publish-balloon absolute bottom-[-10%] rounded-full opacity-45 shadow-sm"
          style={{
            left: `${balloon.left}%`,
            width: balloon.size,
            height: balloon.size * 1.15,
            background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55), ${balloon.color})`,
            animationDelay: `${balloon.delay}s`,
            animationDuration: `${balloon.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes publish-float {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          8% { opacity: 0.5; }
          100% { transform: translateY(-115vh) translateX(12px) rotate(8deg); opacity: 0; }
        }
        .publish-balloon {
          animation-name: publish-float;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
