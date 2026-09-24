import Link from "next/link";
import React from "react";

interface LogoProps {
  href?: string;
  className?: string;
  imageClassName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: "dark" | "white" | "orange";
}

export default function Logo({
  href,
  className = "",
  imageClassName = "",
  size = "md",
  showText = false,
  textColor = "dark",
}: LogoProps) {
  const sizeMap = {
    xs: "h-6 sm:h-7",
    sm: "h-7 sm:h-8",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-12",
    xl: "h-14 sm:h-16",
  };

  const textColors = {
    dark: "text-slate-900",
    white: "text-white",
    orange: "text-orange-600",
  };

  const imageElement = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Deliveries Hub Logo"
      className={`${sizeMap[size]} w-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-105 ${imageClassName}`}
      loading="eager"
    />
  );

  const content = (
    <div className={`inline-flex items-center gap-2 group select-none ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-orange-100/60 overflow-hidden">
        {imageElement}
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight leading-none ${textColors[textColor]}`}>
            Deliveries Hub
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500 mt-0.5">
            Fast Delivery
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}
