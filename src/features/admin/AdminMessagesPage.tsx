import { useEffect, useState } from 'react'
import { CheckCircle2, Mail, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminMessagesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const load = async () => {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message); else setRows(data || [])
  }
  useEffect(() => { void load() }, [])
  const markRead = async (id: string) => { await supabase.from('contact_messages').update({ read: true }).eq('id', id); await load() }
  const remove = async (id: string) => { if (!window.confirm('Delete this message?')) return; await supabase.from('contact_messages').delete().eq('id', id); await load() }

  return <div><div><div className="text-xs uppercase tracking-[.22em] text-pink-300">Contact inbox</div><h1 className="mt-2 font-display text-5xl font-semibold">Messages</h1>{message && <p className="mt-2 text-xs text-pink-200">{message}</p>}</div><div className="mt-7 space-y-3">{rows.map((row) => <div key={row.id} className={`glass-panel rounded-2xl p-5 ${row.read ? 'opacity-65' : ''}`}><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><div className="flex items-center gap-2"><Mail size={16} className="text-pink-300" /><h2 className="font-semibold">{row.subject}</h2></div><p className="mt-2 text-sm text-white/55">{row.name} · <a className="text-pink-200" href={`mailto:${row.email}`}>{row.email}</a></p><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/52">{row.message}</p></div><div className="flex shrink-0 gap-2">{!row.read && <button onClick={() => void markRead(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg" title="Mark read"><CheckCircle2 size={15} /></button>}<button onClick={() => void remove(row.id)} className="outline-button grid h-9 w-9 place-items-center rounded-lg text-pink-300"><Trash2 size={15} /></button></div></div></div>)}</div></div>
}
