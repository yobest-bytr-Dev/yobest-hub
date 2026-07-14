export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-blue/[0.04] rounded-full blur-[140px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-purple/[0.03] rounded-full blur-[140px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-pink/[0.02] rounded-full blur-[160px]" />
    </div>
  )
}
