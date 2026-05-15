import { useState, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { QRScanner } from '@/components/scanner/QRScanner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { validateTicketQR } from '@/services/ticketsService'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const RESULT_CONFIG = {
  ok:           { color: 'ocv-green',   bg: 'bg-ocv-green/10',   border: 'border-ocv-green/40',   icon: '✓', label: 'ACCESO PERMITIDO'  },
  already_used: { color: 'ocv-yellow',  bg: 'bg-ocv-yellow/10',  border: 'border-ocv-yellow/40',  icon: '⚠', label: 'YA UTILIZADO'       },
  invalid:      { color: 'red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/40',     icon: '✗', label: 'BOLETO INVÁLIDO'    },
  cancelled:    { color: 'red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/40',     icon: '✗', label: 'BOLETO CANCELADO'   },
}

export default function TicketScanner() {
  const { profile }    = useAuth()
  const [cameraOn,     setCameraOn]     = useState(false)
  const [manualCode,   setManualCode]   = useState('')
  const [lastResult,   setLastResult]   = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [scanHistory,  setScanHistory]  = useState([])

  const handleScan = useCallback(async (qrCode) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await validateTicketQR(qrCode, profile?.id)
      const entry = {
        id:        Date.now(),
        qrCode,
        result:    res.result,
        ticket:    res.ticket,
        timestamp: new Date().toISOString(),
      }
      setLastResult(entry)
      setScanHistory(prev => [entry, ...prev.slice(0, 19)])
    } finally {
      setLoading(false)
    }
  }, [loading, profile?.id])

  async function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualCode.trim()) return
    await handleScan(manualCode.trim())
    setManualCode('')
  }

  const rc = lastResult ? RESULT_CONFIG[lastResult.result] : null

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Administración</p>
          <h1 className="font-display text-4xl text-ink-100 tracking-wide">Escáner QR</h1>
          <p className="text-sm text-ink-400 mt-1">Valida boletos en la entrada del evento.</p>
        </div>

        {/* Camera toggle */}
        <div className="flex gap-3">
          <Button
            variant={cameraOn ? 'danger' : 'primary'}
            onClick={() => setCameraOn(v => !v)}
            size="lg"
            className="flex-1"
          >
            {cameraOn ? '⏹ Detener cámara' : '📷 Activar cámara'}
          </Button>
        </div>

        {/* Camera */}
        {cameraOn && (
          <QRScanner active={cameraOn} onScan={handleScan} />
        )}

        {/* Manual entry */}
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <Input
            className="flex-1"
            placeholder="Ingresar código QR / folio manualmente"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
          />
          <Button type="submit" variant="secondary" disabled={!manualCode.trim() || loading}>
            {loading ? '...' : 'Validar'}
          </Button>
        </form>

        {/* Last result */}
        {lastResult && rc && (
          <div className={cn('rounded-2xl border p-6 text-center transition-all', rc.bg, rc.border)}>
            <p className={cn('font-display text-6xl mb-3', `text-${rc.color}`)}>{rc.icon}</p>
            <p className={cn('font-display text-3xl tracking-widest mb-2', `text-${rc.color}`)}>
              {rc.label}
            </p>
            {lastResult.ticket && (
              <div className="mt-4 space-y-1 text-sm text-ink-300">
                {lastResult.ticket.holder_name  && <p className="font-medium text-ink-100">{lastResult.ticket.holder_name}</p>}
                {lastResult.ticket.events?.title && <p>{lastResult.ticket.events.title}</p>}
                {lastResult.ticket.events?.starts_at && (
                  <p className="text-ink-400">{formatDate(lastResult.ticket.events.starts_at)}</p>
                )}
              </div>
            )}
            <p className="text-xs text-ink-400 mt-3 font-mono">{lastResult.qrCode.slice(0, 32)}...</p>
          </div>
        )}

        {/* Scan history */}
        {scanHistory.length > 0 && (
          <div className="rounded-2xl border border-surface-600 bg-surface-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-600 flex items-center justify-between">
              <p className="text-sm font-medium text-ink-300">Historial de escaneos</p>
              <span className="text-xs text-ink-400">{scanHistory.length} registros</span>
            </div>
            <div className="divide-y divide-surface-700 max-h-72 overflow-y-auto">
              {scanHistory.map((entry) => {
                const cfg = RESULT_CONFIG[entry.result]
                return (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={cn('text-xl w-6 text-center shrink-0', `text-${cfg.color}`)}>{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-bold uppercase tracking-wider', `text-${cfg.color}`)}>{cfg.label}</p>
                      {entry.ticket?.holder_name && (
                        <p className="text-xs text-ink-300 truncate">{entry.ticket.holder_name}</p>
                      )}
                      <p className="text-xs text-ink-400 font-mono truncate">{entry.qrCode.slice(0, 24)}…</p>
                    </div>
                    <span className="text-xs text-ink-400 shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString('es-MX')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
