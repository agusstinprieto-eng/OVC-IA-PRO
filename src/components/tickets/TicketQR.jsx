import { QRCodeSVG } from 'qrcode.react'

export function TicketQR({ ticket, eventTitle }) {
  const qrUrl = ticket.qr_url ?? `${import.meta.env.VITE_APP_URL}/validar/${ticket.qr_code}`

  return (
    <div className="rounded-xl border border-ocv-cyan/30 bg-surface-800 p-6 flex flex-col items-center gap-4 text-center shadow-glow-cyan">
      <div className="bg-white p-3 rounded-xl">
        <QRCodeSVG
          value={qrUrl}
          size={180}
          bgColor="#ffffff"
          fgColor="#171e23"
          level="H"
          includeMargin={false}
        />
      </div>

      <div>
        <p className="font-display text-3xl text-ocv-cyan tracking-widest text-glow-cyan">{ticket.folio}</p>
        <p className="text-sm text-ink-400 mt-1">{eventTitle}</p>
        {ticket.holder_name && (
          <p className="text-ink-300 font-medium mt-1">{ticket.holder_name}</p>
        )}
      </div>

      <div className="w-full border-t border-surface-600 pt-3">
        <p className="text-xs text-ink-400 uppercase tracking-widest">
          ESCANEA este código en la entrada
        </p>
      </div>
    </div>
  )
}
