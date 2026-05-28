"use client"

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cva } from "class-variance-authority"

import { Button } from "@/components/ui/button"
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

const MOBILE_PANEL_ID = "navigation-menu-mobile-panel"

type NavigationMenuMobileContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  panelId: string
}

const NavigationMenuMobileContext =
  React.createContext<NavigationMenuMobileContextValue | null>(null)

function useNavigationMenuMobile() {
  const context = React.useContext(NavigationMenuMobileContext)
  if (!context) {
    throw new Error(
      "NavigationMenuHamburger and NavigationMenuMobilePanel must be used within NavigationMenuMobile"
    )
  }
  return context
}

function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align">) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger text-foreground inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon className="relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180" aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-ending-style:data-activation-direction=left:translate-x-[50%] data-ending-style:data-activation-direction=right:translate-x-[-50%] data-starting-style:data-activation-direction=left:translate-x-[-50%] data-starting-style:data-activation-direction=right:translate-x-[50%] h-full w-auto p-1 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:ring-foreground/10 group-data-[viewport=false]/navigation-menu:duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0",
          className
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup className="data-[ending-style]:easing-[ease] xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0">
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-center gap-2 rounded-lg p-2 text-sm transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-active:bg-muted/50 data-active:hover:bg-muted data-active:focus:bg-muted [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Icon>) {
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Icon>
  )
}

type NavigationMenuMobileProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  panelId?: string
  children: React.ReactNode
}

function NavigationMenuMobile({
  open,
  onOpenChange,
  panelId = MOBILE_PANEL_ID,
  children,
}: NavigationMenuMobileProps) {
  const value = React.useMemo(
    () => ({ open, onOpenChange, panelId }),
    [open, onOpenChange, panelId]
  )

  React.useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  return (
    <NavigationMenuMobileContext.Provider value={value}>
      {children}
    </NavigationMenuMobileContext.Provider>
  )
}

type NavigationMenuHamburgerProps = {
  className?: string
  "aria-label"?: string
}

function NavigationMenuHamburger({
  className,
  "aria-label": ariaLabel = "Åpne meny",
}: NavigationMenuHamburgerProps) {
  const { open, onOpenChange, panelId } = useNavigationMenuMobile()

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Lukk meny" : ariaLabel}
      onClick={() => onOpenChange(!open)}
    >
      <MenuToggleIcon open={open} />
    </Button>
  )
}

type NavigationMenuMobilePanelProps = {
  className?: string
  onNavigate?: () => void
  children: React.ReactNode
}

function NavigationMenuMobilePanel({
  className,
  onNavigate,
  children,
}: NavigationMenuMobilePanelProps) {
  const { open, onOpenChange, panelId } = useNavigationMenuMobile()

  if (!open) return null

  const handleNavigate = () => {
    onNavigate?.()
    onOpenChange(false)
  }

  return (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="fixed inset-0 z-40 bg-black/40 animate-in fade-in-0 duration-200 md:hidden"
        onClick={() => onOpenChange(false)}
      />
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasjonsmeny"
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t bg-background p-4 shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200 md:hidden",
          className
        )}
        onClick={handleNavigate}
      >
        {children}
      </div>
    </>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuHamburger,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuMobile,
  NavigationMenuMobilePanel,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}
