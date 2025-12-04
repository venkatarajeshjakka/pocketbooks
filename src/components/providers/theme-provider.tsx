"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * ThemeProvider component that wraps the application with next-themes functionality.
 * Enables theme switching between light, dark, and system modes.
 *
 * @param children - Child components to be wrapped with theme context
 * @param props - Additional props passed to NextThemesProvider
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
