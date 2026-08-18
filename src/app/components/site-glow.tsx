export function SiteGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#00a8c4]/18 blur-3xl" />
      <div className="absolute -right-24 top-32 h-[24rem] w-[24rem] rounded-full bg-[#3ec8dc]/16 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-[#00a8c4]/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,168,196,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  );
}
