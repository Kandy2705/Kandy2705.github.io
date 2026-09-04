const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const to = Deno.env.get('CONTACT_TO_EMAIL') || 'man.ngoman2705@gmail.com'
    const from = Deno.env.get('CONTACT_FROM_EMAIL') || 'Portfolio <onboarding@resend.dev>'
    if (!resendApiKey) throw new Error('RESEND_API_KEY is not configured')

    const { name, email, subject, message } = await req.json()
    if (!name || !email || !subject || !message) throw new Error('Missing required fields')

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#21151c">
        <h2>New portfolio message</h2>
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p>${escapeHtml(message).replaceAll('\n', '<br/>')}</p>
      </div>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        html,
      }),
    })

    const body = await response.text()
    if (!response.ok) throw new Error(`Resend error: ${body}`)

    return new Response(body, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function escapeHtml(value: string) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
