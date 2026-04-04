"use client"

import { useEffect, useRef, useState } from "react"

/**
 * CustomDesigner — Fabric.js canvas stub for product customization.
 *
 * Renders an interactive canvas where customers can:
 *  • Upload images (logos, artwork)
 *  • Add / edit text (name, number, slogan)
 *  • Choose colors
 *  • Preview the design on a product silhouette
 *
 * Supported product types: T-shirts, hoodies, caps, jewelry, patches.
 *
 * Integration:
 *   Import this component into a product page template and pass the
 *   product handle so it can load the correct silhouette overlay.
 *
 * Dependencies:
 *   yarn add fabric
 *   # or
 *   npm install fabric
 */

type ProductType = "tshirt" | "hoodie" | "cap" | "jewelry" | "patch"

interface CustomDesignerProps {
  /** Product handle used to select the silhouette overlay */
  productType?: ProductType
  /** Canvas width in pixels (default 500) */
  width?: number
  /** Canvas height in pixels (default 500) */
  height?: number
  /** Callback fired when the design changes; receives a data-URL of the canvas */
  onDesignChange?: (dataUrl: string) => void
}

const PRODUCT_LABELS: Record<ProductType, string> = {
  tshirt: "T-Shirt",
  hoodie: "Hoodie",
  cap: "Cap",
  jewelry: "Jewelry",
  patch: "Patch",
}

export default function CustomDesigner({
  productType = "tshirt",
  width = 500,
  height = 500,
  onDesignChange,
}: CustomDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null) // fabric.Canvas instance
  const [designText, setDesignText] = useState("")
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [isFabricLoaded, setIsFabricLoaded] = useState(false)

  // ── Initialise Fabric.js canvas ──────────────────────────────────────────
  useEffect(() => {
    let canvas: any

    async function initCanvas() {
      try {
        // Dynamic import keeps Fabric out of the SSR bundle
        const fabric = await import("fabric")
        const FabricCanvas = fabric.Canvas ?? (fabric as any).default?.Canvas

        if (!canvasRef.current || !FabricCanvas) return

        canvas = new FabricCanvas(canvasRef.current, {
          width,
          height,
          backgroundColor: "#f3f4f6",
          selection: true,
        })

        fabricRef.current = canvas
        setIsFabricLoaded(true)

        // Draw a placeholder silhouette rectangle (replace with real SVG overlays)
        const FabricRect = fabric.Rect ?? (fabric as any).default?.Rect
        if (FabricRect) {
          const silhouette = new FabricRect({
            left: width * 0.2,
            top: height * 0.1,
            width: width * 0.6,
            height: height * 0.75,
            fill: "transparent",
            stroke: "#d1d5db",
            strokeWidth: 2,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
          })
          canvas.add(silhouette)
        }

        // Fire callback on every modification
        canvas.on("object:modified", () => {
          onDesignChange?.(canvas.toDataURL({ format: "png" }))
        })
      } catch (err) {
        console.warn("Fabric.js failed to load — running without canvas:", err)
      }
    }

    initCanvas()

    return () => {
      canvas?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  // ── Add text to canvas ───────────────────────────────────────────────────
  const addText = async () => {
    if (!fabricRef.current || !designText.trim()) return
    try {
      const fabric = await import("fabric")
      const FabricTextbox =
        fabric.Textbox ?? (fabric as any).default?.Textbox
      if (!FabricTextbox) return

      const text = new FabricTextbox(designText, {
        left: width * 0.25,
        top: height * 0.4,
        fontSize: 28,
        fill: selectedColor,
        fontFamily: "Inter, sans-serif",
        editable: true,
      })
      fabricRef.current.add(text)
      fabricRef.current.setActiveObject(text)
      fabricRef.current.renderAll()
      setDesignText("")
    } catch (err) {
      console.warn("Fabric.js: unable to add text to canvas", err)
    }
  }

  // ── Upload image to canvas ───────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !fabricRef.current) return

    try {
      const fabric = await import("fabric")
      const FabricImage = fabric.FabricImage ?? (fabric as any).default?.Image

      const reader = new FileReader()
      reader.onload = (evt) => {
        if (!evt.target?.result || !FabricImage) return
        const imgElement = new Image()
        imgElement.onload = () => {
          const img = new FabricImage(imgElement, {
            left: width * 0.15,
            top: height * 0.15,
            scaleX: 0.3,
            scaleY: 0.3,
          })
          fabricRef.current.add(img)
          fabricRef.current.renderAll()
        }
        imgElement.src = evt.target.result as string
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.warn("Fabric.js: unable to process image upload", err)
    }
  }

  // ── Export canvas as PNG data-URL ────────────────────────────────────────
  const exportDesign = () => {
    if (!fabricRef.current) return
    const dataUrl = fabricRef.current.toDataURL({ format: "png" })
    onDesignChange?.(dataUrl)
    return dataUrl
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="custom-designer w-full max-w-2xl mx-auto p-4">
      <h3 className="text-lg font-semibold mb-2">
        Customise Your {PRODUCT_LABELS[productType]}
      </h3>

      {/* Canvas */}
      <div className="border rounded-lg overflow-hidden mb-4 bg-gray-50">
        <canvas ref={canvasRef} />
        {!isFabricLoaded && (
          <p className="text-center text-sm text-gray-400 py-8">
            Loading designer canvas…
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        {/* Text input */}
        <div className="flex flex-col gap-1">
          <label htmlFor="design-text" className="text-xs font-medium">
            Add Text
          </label>
          <div className="flex gap-2">
            <input
              id="design-text"
              type="text"
              value={designText}
              onChange={(e) => setDesignText(e.target.value)}
              placeholder="Your text here"
              className="border rounded px-3 py-1.5 text-sm w-48"
              onKeyDown={(e) => e.key === "Enter" && addText()}
            />
            <button
              onClick={addText}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-1">
          <label htmlFor="design-color" className="text-xs font-medium">
            Text Color
          </label>
          <input
            id="design-color"
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-10 h-9 border rounded cursor-pointer"
          />
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-1">
          <label htmlFor="design-image" className="text-xs font-medium">
            Upload Image
          </label>
          <input
            id="design-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
          />
        </div>

        {/* Export */}
        <button
          onClick={exportDesign}
          className="ml-auto bg-gray-800 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-900"
        >
          Export PNG
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Drag objects to reposition. Double-click text to edit. This is a stub
        component — replace the dashed outline with a real product silhouette
        SVG.
      </p>
    </div>
  )
}
