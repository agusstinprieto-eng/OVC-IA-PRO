import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr, opts = {}) {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    ...opts,
  }).format(d)
}

export function formatShortDate(dateStr) {
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(new Date(dateStr))
}

export function formatTime(dateStr) {
  return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(dateStr))
}

export function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
