"use client";

import { useState } from "react";
import { AuthButtonClient } from "@/components/auth-button-client";
import Link from "next/link";
import { Code2, Menu, X } from "lucide-react";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/60 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SWEBUK</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#blog" className="text-gray-300 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="#stats" className="text-gray-300 hover:text-white transition-colors">
              Impact
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <AuthButtonClient />

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors py-2">
                Features
              </Link>
              <Link href="#blog" className="text-gray-300 hover:text-white transition-colors py-2">
                Blog
              </Link>
              <Link href="#stats" className="text-gray-300 hover:text-white transition-colors py-2">
                Impact
              </Link>
              <Link href="#about" className="text-gray-300 hover:text-white transition-colors py-2">
                About
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}