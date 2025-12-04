import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

/**
 * Dashboard layout component that wraps all dashboard pages.
 *
 * Layout structure:
 * - SidebarProvider: Manages sidebar state (open/closed)
 * - AppSidebar: Navigation sidebar with menu items
 * - SidebarInset: Main content area
 *   - Header: Top bar with sidebar trigger and theme toggle
 *   - Main content: Page-specific content
 *   - Footer: Bottom bar with links and copyright
 *
 * Features:
 * - Responsive sidebar (collapsible on mobile)
 * - Persistent layout across dashboard pages
 * - Proper layout structure with flex-1 for content
 * - Accessible navigation and landmarks
 *
 * @param children - Page content to render in the main area
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
