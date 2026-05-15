import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId } = req.body ?? {}
  if (!orderId) return res.status(400).json({ message: 'orderId requerido' })

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, total, currency, buyer_email, buyer_name, status,
      order_items ( quantity, unit_price, ticket_types ( name, event_id, events(title) ) )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order)            return res.status(404).json({ message: 'Orden no encontrada' })
  if (order.status === 'paid')    return res.status(400).json({ message: 'Orden ya pagada' })

  const appUrl = process.env.VITE_APP_URL ?? 'https://ecosistema.torreonconquista.com'

  const items = (order.order_items ?? []).map(i => ({
    id:          i.ticket_types?.event_id ?? 'ticket',
    title:       `${i.ticket_types?.name ?? 'Boleto'} — ${i.ticket_types?.events?.title ?? 'Evento'}`,
    quantity:    i.quantity,
    unit_price:  Number(i.unit_price),
    currency_id: 'MXN',
  }))

  const prefBody = {
    items,
    payer: { email: order.buyer_email, name: order.buyer_name },
    back_urls: {
      success: `${appUrl}/checkout/confirmacion/${orderId}?mp=success`,
      failure: `${appUrl}/checkout?mp=failure&order=${orderId}`,
      pending: `${appUrl}/checkout/confirmacion/${orderId}?mp=pending`,
    },
    auto_return:          'approved',
    external_reference:   orderId,
    notification_url:     `${appUrl}/api/webhook-mercadopago`,
    statement_descriptor: 'OCV TORREON',
  }

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(prefBody),
  })

  if (!mpRes.ok) {
    const mpErr = await mpRes.json()
    return res.status(500).json({ message: mpErr.message ?? 'Error MercadoPago' })
  }

  const preference = await mpRes.json()

  // Guardar referencia
  await supabase.from('payments').insert({
    order_id:    orderId,
    provider:    'mercadopago',
    provider_id: preference.id,
    amount:      order.total,
    currency:    'MXN',
    status:      'pending',
    raw_payload: preference,
  })

  return res.status(200).json({ preferenceId: preference.id, initPoint: preference.init_point })
}
