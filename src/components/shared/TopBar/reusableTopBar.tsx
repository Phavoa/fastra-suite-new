"use client"

import React from "react"
import Link from "next/link"
import NotifySection from "../Notify"
import { usePathname } from "next/navigation"

interface NavItem {
 label : string;
 href: string;
}

interface TopNavProps {
    title : string;
    items: NavItem[];
    showNotify?: boolean; // this is optional because we set a default
}
export function NavBar({title, items, showNotify=true} : TopNavProps){
    const pathname = usePathname()

    const isActive = (href: string) => pathname === href;

    return (
    <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        
        <h1 className="text-2xl">{title}</h1>
        
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 text-sm text-gray-600 h-full"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`h-full flex items-center text-base transition-colors duration-200 ${
                isActive(item.href)
                  ? "text-[#3B7CED] border-b-2 border-[#3B7CED]"
                  : "hover:text-gray-900 hover:border-b-2 hover:border-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {showNotify && <NotifySection />}
      </div>
    </header>
  );
}


