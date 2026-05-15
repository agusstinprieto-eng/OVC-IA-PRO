import { supabase } from '@/lib/supabase'

// ── Stripe ────────────────────────────────────────────────────

export async function createStripePaymentIntent(orderId) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/stripe-create-intent', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': session ? `Bearer ${session.access_token}` : '',
    },
    body: JSON.stringify({ orderId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'Error creando intención de pago')
  }
  return res.json()   // { clientSecret }
}

// ── MercadoPago ────────────────────────────────────────────────

export async function createMercadoPagoPreference(orderId) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/mp-create-preference', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': session ? `Bearer ${session.access_token}` : '',
    },
    body: JSON.stringify({ orderId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'Error creando preferencia de pago')
  }
  return res.json()   // { preferenceId, initPoint }
}

// ── Helpers ───────────────────────────────────────────────────

export async function getOrderWithItems(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity, unit_price, subtotal,
        ticket_types ( name, event_id, events ( id, title, starts_at, cover_image_url, venues(name) ) )
      )
    `)
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data
}

export async function getOrderTickets(orderId) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, events(title, starts_at)')
    .eq('order_id', orderId)
    .eq('status', 'active')
  if (error) throw error
  return data
}
