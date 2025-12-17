import { cn } from "@/lib/utils";

export type TagType = 
  | "milonga" 
  | "practica" 
  | "performance" 
  | "workshop" 
  | "festival" 
  | "travel" 
  | "music" 
  | "fashion";

interface TagPillProps {
  type: TagType;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const tagStyles: Record<TagType, string> = {
  milonga: "bg-[hsl(var(--tag-milonga)_/_0.15)] text-[hsl(var(--tag-milonga))] border-[hsl(var(--tag-milonga)_/_0.3)] hover:bg-[hsl(var(--tag-milonga)_/_0.25)]",
  practica: "bg-[hsl(var(--tag-practica)_/_0.15)] text-[hsl(var(--tag-practica))] border-[hsl(var(--tag-practica)_/_0.3)] hover:bg-[hsl(var(--tag-practica)_/_0.25)]",
  performance: "bg-[hsl(var(--tag-performance)_/_0.15)] text-[hsl(var(--tag-performance))] border-[hsl(var(--tag-performance)_/_0.3)] hover:bg-[hsl(var(--tag-performance)_/_0.25)]",
  workshop: "bg-[hsl(var(--tag-workshop)_/_0.15)] text-[hsl(var(--tag-workshop))] border-[hsl(var(--tag-workshop)_/_0.3)] hover:bg-[hsl(var(--tag-workshop)_/_0.25)]",
  festival: "bg-[hsl(var(--tag-festival)_/_0.15)] text-[hsl(var(--tag-festival))] border-[hsl(var(--tag-festival)_/_0.3)] hover:bg-[hsl(var(--tag-festival)_/_0.25)]",
  travel: "bg-[hsl(var(--tag-travel)_/_0.15)] text-[hsl(var(--tag-travel))] border-[hsl(var(--tag-travel)_/_0.3)] hover:bg-[hsl(var(--tag-travel)_/_0.25)]",
  music: "bg-[hsl(var(--tag-music)_/_0.15)] text-[hsl(var(--tag-music))] border-[hsl(var(--tag-music)_/_0.3)] hover:bg-[hsl(var(--tag-music)_/_0.25)]",
  fashion: "bg-[hsl(var(--tag-fashion)_/_0.15)] text-[hsl(var(--tag-fashion))] border-[hsl(var(--tag-fashion)_/_0.3)] hover:bg-[hsl(var(--tag-fashion)_/_0.25)]",
};

export function TagPill({ type, children, className, icon }: TagPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors",
        tagStyles[type],
        className
      )}
      data-testid={`tag-${type}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
