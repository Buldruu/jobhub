"use client"

import React from "react"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface MobileShellProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export function MobileShell({ children, title, showBack = false, leftAction, rightAction }: MobileShellProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {(showBack || leftAction || title || rightAction) && (
        <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          {leftAction && <div className="shrink-0 -ml-2">{leftAction}</div>}
          {showBack && !leftAction && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="shrink-0 -ml-2"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Буцах</span>
            </Button>
          )}
          {title && (
            <h1 className="font-semibold text-lg text-foreground flex-1 truncate">
              {title}
            </h1>
          )}
          {rightAction && <div className="shrink-0">{rightAction}</div>}
        </header>
      )}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
