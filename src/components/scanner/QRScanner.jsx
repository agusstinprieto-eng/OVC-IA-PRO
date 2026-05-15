import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const SCANNER_ID = 'ocv-qr-scanner'

export function QRScanner({ onScan, active }) {
  const scannerRef = useRef(null)
  const [cameraError, setCameraError] = useState(null)
  const [scanning,    setScanning]    = useState(false)

  useEffect(() => {
    if (!active) {
      stopScanner()
      return
    }
    startScanner()
    return () => { stopScanner() }
  }, [active])

  async function startScanner() {
    try {
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner

      const cameras = await Html5Qrcode.getCameras()
      if (!cameras?.length) {
        setCameraError('No se encontró ninguna cámara.')
        return
      }

      // Preferir cámara trasera
      const cam = cameras.find(c => /back|rear|trasera/i.test(c.label)) ?? cameras[0]

      await scanner.start(
        cam.id,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Vibración táctil si disponible
          if (navigator.vibrate) navigator.vibrate(60)
          onScan(decodedText)
        },
        () => {}   // silenciar errores de frame
      )
      setScanning(true)
    } catch (err) {
      setCameraError(`Error al iniciar la cámara: ${err?.message ?? err}`)
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      }
    } catch (_) {}
    setScanning(false)
  }

  return (
    <div className="relative">
      {cameraError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm text-center">
          {cameraError}
        </div>
      )}

      <div
        id={SCANNER_ID}
        className="rounded-2xl overflow-hidden border-2 border-ocv-cyan/40 bg-surface-900 min-h-[280px]"
        style={{ display: cameraError ? 'none' : 'block' }}
      />

      {/* Corner decorations */}
      {scanning && !cameraError && (
        <div className="absolute inset-0 pointer-events-none">
          {['top-4 left-4 border-t-2 border-l-2','top-4 right-4 border-t-2 border-r-2',
            'bottom-4 left-4 border-b-2 border-l-2','bottom-4 right-4 border-b-2 border-r-2'].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 border-ocv-cyan rounded-sm ${cls}`} />
          ))}
          {/* Scan line animation */}
          <div className="absolute left-[calc(50%-125px)] right-[calc(50%-125px)] top-1/2 -translate-y-1/2 h-px bg-ocv-cyan/60 animate-pulse" />
        </div>
      )}
    </div>
  )
}
