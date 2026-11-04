"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/commons/lib/utils"

interface ResponsiveCardsCarouselProps {
  children: React.ReactNode
  /**
   * Quantidade de colunas quando exibido em desktop (>= 1024px / lg).
   * Padrão: 4
   */
  desktopColumns?: 3 | 4
  /**
   * Quantidade de colunas visualizadas simultaneamente em tablet (640px a 1023px / sm/md).
   * Padrão: 2
   */
  tabletColumns?: 2 | 3
  /**
   * Classes extras para o container geral
   */
  className?: string
  /**
   * Classes extras para cada item individual do carrossel/grid
   */
  itemClassName?: string
}

export function ResponsiveCardsCarousel({
  children,
  desktopColumns = 4,
  tabletColumns = 2,
  className,
  itemClassName,
}: ResponsiveCardsCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  const items = React.useMemo(() => {
    return React.Children.toArray(children).filter(Boolean)
  }, [children])

  React.useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    const handleReInit = () => {
      setCount(api.scrollSnapList().length)
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)
    api.on("reInit", handleReInit)
    api.emit("reInit")

    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleReInit)
    }
  }, [api])

  const tabletBasisClass =
    tabletColumns === 3
      ? "sm:basis-1/2 md:basis-1/3"
      : "sm:basis-1/2"

  const desktopGridClass =
    desktopColumns === 3
      ? "lg:grid-cols-3"
      : "lg:grid-cols-4"

  return (
    <div className={cn("w-full min-w-0 overflow-hidden", className)}>
      {/* 1. Mobile & Tablet: Shadcn Carousel com Toque / Arraste */}
      <div className="block lg:hidden w-full overflow-hidden">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            containScroll: "trimSnaps",
          }}
          className="w-full overflow-hidden"
        >
          <CarouselContent className="-ml-3 sm:-ml-4">
            {items.map((child, index) => (
              <CarouselItem
                key={index}
                className={cn(
                  "pl-3 sm:pl-4 basis-[86%]",
                  tabletBasisClass,
                  itemClassName
                )}
              >
                <div className="h-full">{child}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Indicadores de Posição (Dots) visíveis apenas em Mobile/Tablet quando houver mais de 1 snap */}
        {count > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 pt-3"
            aria-label="Navegação dos cards"
          >
            {Array.from({ length: count }).map((_, index) => {
              const isActive = current === index
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "transition-all duration-300 rounded-full cursor-pointer touch-manipulation",
                    isActive
                      ? "w-5 h-1.5 bg-white shadow-xs"
                      : "w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500"
                  )}
                  aria-label={`Ir para grupo ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Desktop (>= 1024px): Grade Estática Pura de Alto Desempenho */}
      <div className={cn("hidden lg:grid gap-4 w-full", desktopGridClass)}>
        {items.map((child, index) => (
          <div key={index} className={cn("h-full", itemClassName)}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

