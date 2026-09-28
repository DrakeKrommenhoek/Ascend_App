const {
  normalizeEmail, subscriberHash, refCodeFor, buildMergeFields, getConfig, mailchimpRequest,
} = require('./_lib/mailchimp')

const MAX_BODY = 4096
const MIN_FILL_MS = 1500

function parseBody(raw) {
  if (raw && typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()

  const body = parseBody(req.body)
  if (!body) return res.status(400).json({ ok: false, error: 'Enter a valid email.' })
  if (JSON.stringify(body).length > MAX_BODY) return res.status(413).json({ ok: false, error: 'Request too large.' })

  // Bots: fill the honeypot or submit instantly. Pretend success, do nothing.
  if ((typeof body.company === 'string' && body.company.length > 0) || Number(body.t) < MIN_FILL_MS) {
    return res.status(200).json({ ok: true, refCode: refCodeFor(String(body.email || ''), 'honeypot') })
  }

  const email = normalizeEmail(body.email)
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a valid email.' })

  const config = getConfig()
  if (config.missing.length) {
    console.error('[waitlist] missing env vars:', config.missing.join(', '))
    return res.status(500).json({ ok: false, error: 'Waitlist is not configured yet.' })
  }

  const hash = subscriberHash(email)
  const refCode = refCodeFor(email, config.audienceId)
  const merge_fields = buildMergeFields({ refCode, ref: body.ref, utm: body.utm, profile: body.profile })
  const memberPath = `/lists/${config.audienceId}/members/${hash}`

  try {
    const put = await mailchimpRequest(config, 'PUT', memberPath, {
      email_address: email,
      status_if_new: 'pending',
      merge_fields,
    })

    if (put.status >= 400) {
      const title = put.data && put.data.title
      const detail = (put.data && put.data.detail) || ''
      if (title === 'Member In Compliance State' || title === 'Forgotten Email Not Subscribed') {
        return res.status(200).json({ ok: true, refCode })
      }
      if (put.status === 400 && /fake|invalid/i.test(detail)) {
        return res.status(400).json({ ok: false, error: 'That email looks invalid.' })
      }
      console.error('[waitlist] mailchimp error', put.status, title)
      return res.status(502).json({ ok: false, error: "Couldn't reach our list. Try again in a minute." })
    }

    const tags = [{ name: 'waitlist', status: 'active' }, { name: 'landing-v1', status: 'active' }]
    if (merge_fields.REFBY) tags.push({ name: 'referred', status: 'active' })
    try {
      const tagRes = await mailchimpRequest(config, 'POST', `${memberPath}/tags`, { tags })
      if (tagRes.status >= 400) console.error('[waitlist] tag error', tagRes.status)
    } catch (err) {
      console.error('[waitlist] tag request failed', err.message)
    }

    return res.status(200).json({ ok: true, refCode })
  } catch (err) {
    console.error('[waitlist] request failed', err.message)
    return res.status(502).json({ ok: false, error: "Couldn't reach our list. Try again in a minute." })
  }
}
