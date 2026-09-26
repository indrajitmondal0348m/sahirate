import { cn } from "@/utils";
import logoImg from "@/assets/sahirate_logo.png";

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
}

export default function Logo({ className, imgClassName, showText = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src={logoImg}
        alt="SahiRate"
        className={cn("h-7 w-7 object-contain rounded-md shrink-0", imgClassName)}
      />
      {showText && (
        <span className="font-bold tracking-tight inline-block leading-none">
          <span className="text-primary">Sahi</span>
          <span className="text-copper">Rate</span>
        </span>
      )}
    </span>
  );
}
