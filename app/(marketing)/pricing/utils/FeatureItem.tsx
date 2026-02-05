import { Check } from "lucide-react"

export const FeatureItem = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 shrink-0 rounded-full p-1">
        <Check size={14} className="text-primary" />
      </div>
      <span className="text-sm text-zinc-300 md:text-base">{text}</span>
    </div>
  )
}
export const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) => {
  return (
    <div className="bg-card/50 hover:bg-card flex flex-col items-center rounded-2xl border border-zinc-800/50 p-6 text-center transition-all hover:border-zinc-700 md:p-8">
      <div className="bg-primary/10 mb-4 rounded-full p-4 md:mb-6">{icon}</div>
      <h3 className="mb-3 text-lg font-bold text-white md:text-xl">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
        {description}
      </p>
    </div>
  )
}
