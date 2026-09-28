const { test, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('crypto')

const ENV = { MAILCHIMP_API_KEY: 'key-us21', MAILCHIMP_SERVER_PREFIX: 'us21', MAILCHIMP_AUDIENCE_ID: 'aud123' }
let calls, responses, savedEnv, savedFetch
function mockRes() {
  return {
    statusCode: 200, body: undefined,
    status(c) { this.statusCode = c; return this },
    json(b) { this.body = b; return this },
    end() { return this },
  }
}
function req(body, method = 'POST') { return { method, body, headers: {} } }
const good = (extra = {}) => ({ email: 'drake@wlu.edu', ref: null, utm: {}, company: '', t: 5000, ...extra })

beforeEach(() => {
  savedEnv = { ...process.env }; savedFetch = global.fetch
  Object.assign(process.env, ENV)
  calls = []; responses = []
  global.fetch = async (url, opts) => {
    calls.push({ url, opts, body: opts.body ? JSON.parse(opts.body) : undefined })
    const r = responses.shift() || { status: 200, data: { id: 'x' } }
    return { ok: r.status < 300, status: r.status, json: async () => r.data }
  }
  delete require.cache[require.resolve('../waitlist')]
  delete require.cache[require.resolve('../_lib/mailchimp')]
})
afterEach(() => { process.env = savedEnv; global.fetch = savedFetch })

const handler = () => require('../waitlist')

test('405 on GET', async () => {
  const res = mockRes(); await handler()(req({}, 'GET'), res)
  assert.equal(res.statusCode, 405)
})

test('honeypot filled → silent 200, no Mailchimp call', async () => {
  const res = mockRes(); await handler()(req(good({ company: 'Acme' })), res)
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
  assert.match(res.body.refCode, /^[a-z0-9]{8}$/); assert.equal(calls.length, 0)
})

test('submit faster than 1500ms → silent 200, no call', async () => {
  const res = mockRes(); await handler()(req(good({ t: 300 })), res)
  assert.equal(res.body.ok, true); assert.equal(calls.length, 0)
})

test('invalid email → 400', async () => {
  const res = mockRes(); await handler()(req(good({ email: 'not-an-email' })), res)
  assert.equal(res.statusCode, 400); assert.deepEqual(res.body, { ok: false, error: 'Enter a valid email.' })
})

test('happy path: PUT upsert with pending status, basic auth, tags call', async () => {
  const res = mockRes(); await handler()(req(good({ utm: { source: 'ig', medium: 'social', campaign: 'fall' } })), res)
  const hash = crypto.createHash('md5').update('drake@wlu.edu').digest('hex')
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
  assert.equal(calls[0].url, `https://us21.api.mailchimp.com/3.0/lists/aud123/members/${hash}`)
  assert.equal(calls[0].opts.method, 'PUT')
  assert.equal(calls[0].opts.headers.Authorization, 'Basic ' + Buffer.from('anystring:key-us21').toString('base64'))
  assert.equal(calls[0].body.email_address, 'drake@wlu.edu')
  assert.equal(calls[0].body.status_if_new, 'pending')
  assert.equal(calls[0].body.merge_fields.REFCODE, res.body.refCode)
  assert.equal(calls[0].body.merge_fields.USOURCE, 'ig')
  assert.equal(calls[0].body.merge_fields.REFBY, undefined)
  assert.equal(calls[1].url, `https://us21.api.mailchimp.com/3.0/lists/aud123/members/${hash}/tags`)
  assert.deepEqual(calls[1].body.tags.map(t => t.name), ['waitlist', 'landing-v1'])
})

test('email is trimmed + lowercased before hashing (Review Focus 1)', async () => {
  const a = mockRes(); await handler()(req(good({ email: '  Drake@WLU.edu ' })), a)
  const hash = crypto.createHash('md5').update('drake@wlu.edu').digest('hex')
  assert.ok(calls[0].url.endsWith(hash)); assert.equal(calls[0].body.email_address, 'drake@wlu.edu')
})

test('hostile ref is sanitized; referred tag added (Review Focus 4)', async () => {
  const res = mockRes(); await handler()(req(good({ ref: '<script>AbC123xyz!!' + 'z'.repeat(500) })), res)
  assert.match(calls[0].body.merge_fields.REFBY, /^[a-z0-9]{1,16}$/)
  assert.equal(calls[0].body.merge_fields.REFBY, 'scriptabc123xyzz')
  assert.ok(calls[1].body.tags.some(t => t.name === 'referred'))
})

test('string body is parsed (Review Focus 5)', async () => {
  const res = mockRes(); await handler()(req(JSON.stringify(good())), res)
  assert.equal(res.statusCode, 200); assert.equal(calls.length, 2)
})

test('profile merge fields validated and sent', async () => {
  const res = mockRes()
  await handler()(req(good({ profile: { school: 'Washington and Lee', gradYear: '2028', track: 'Private Equity' } })), res)
  const mf = calls[0].body.merge_fields
  assert.equal(mf.SCHOOL, 'Washington and Lee'); assert.equal(mf.GRADYR, '2028'); assert.equal(mf.TRACK, 'Private Equity')
})

test('invalid profile values are dropped', async () => {
  const res = mockRes()
  await handler()(req(good({ profile: { school: '', gradYear: '1999', track: 'Astronaut' } })), res)
  const mf = calls[0].body.merge_fields
  assert.equal(mf.SCHOOL, undefined); assert.equal(mf.GRADYR, undefined); assert.equal(mf.TRACK, undefined)
})

test('compliance state → 200 ok without leaking status', async () => {
  responses.push({ status: 400, data: { title: 'Member In Compliance State', detail: 'unsubscribed' } })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
})

test('Mailchimp fake/invalid email → 400 friendly', async () => {
  responses.push({ status: 400, data: { title: 'Invalid Resource', detail: 'drake@wlu.edu looks fake or invalid, please enter a real email address.' } })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 400); assert.equal(res.body.error, 'That email looks invalid.')
})

test('Mailchimp 500 → 502', async () => {
  responses.push({ status: 500, data: { title: 'Internal' } })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 502); assert.equal(res.body.ok, false)
})

test('missing env → 500 not configured, no call', async () => {
  delete process.env.MAILCHIMP_API_KEY
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 500); assert.equal(res.body.error, 'Waitlist is not configured yet.'); assert.equal(calls.length, 0)
})

test('tag failure is non-fatal', async () => {
  responses.push({ status: 200, data: {} }, { status: 500, data: {} })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
})

test('oversized body → 413', async () => {
  const res = mockRes(); await handler()(req(good({ utm: { source: 'x'.repeat(5000) } })), res)
  assert.equal(res.statusCode, 413)
})

test('refCode is deterministic per email', async () => {
  const a = mockRes(); await handler()(req(good()), a)
  const b = mockRes(); await handler()(req(good({ email: 'DRAKE@wlu.edu' })), b)
  assert.equal(a.body.refCode, b.body.refCode)
})
