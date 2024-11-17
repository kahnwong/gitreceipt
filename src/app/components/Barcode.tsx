'use client'
import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

export function Barcode({ value }: { value: string }) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        width: 1,
        height: 40,
        displayValue: false,
      })
    }
  }, [value])

  return <svg ref={barcodeRef} className="w-full" />
} 