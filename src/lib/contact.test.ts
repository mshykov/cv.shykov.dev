import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cleanContactToken, contactTokens, digitCount, findEmailAddress, findPhoneNumber,
  findProfileUrls, hasEmailAddress, hasPhoneNumber, hasProfileUrl,
} from './contact.ts'

test('splits a contact line on every separator it uses', () => {
  assert.deepEqual(
    contactTokens('me@x.dev · +34 600 123 456 | linkedin.com/in/me'),
    ['me@x.dev', '+34', '600', '123', '456', 'linkedin.com/in/me'],
  )
})

test('cleanContactToken trims wrapping punctuation but keeps the value', () => {
  assert.equal(cleanContactToken('(me@x.dev),'), 'me@x.dev')
  assert.equal(cleanContactToken('me@x.dev'), 'me@x.dev')
})

test('digitCount counts only digits', () => {
  assert.equal(digitCount('+34 600-123.456'), 11)
  assert.equal(digitCount('none'), 0)
})

test('finds an email address in a contact line', () => {
  assert.equal(findEmailAddress('Maksym Shykov · me@shykov.dev · Madrid'), 'me@shykov.dev')
  assert.equal(hasEmailAddress('no address here'), false)
})

test('rejects things that only look like an email', () => {
  assert.equal(hasEmailAddress('@handle'), false)
  assert.equal(hasEmailAddress('a@b'), false)
  assert.equal(hasEmailAddress('two@at@signs.dev'), false)
})

test('finds phone numbers in the formats CVs actually use', () => {
  for (const input of [
    '+34 600 123 456',
    '+1 555 123 4567',
    '+380 44 123 4567',
    '555.123.4567',
    '(555) 123-4567',
    '07700 900123',
  ]) {
    assert.equal(hasPhoneNumber(input), true, `should detect ${input}`)
  }
})

// Regression: any run of 9-15 digits counted, and '.' and ' ' are both phone
// separators and decimal points. A CV following this tool's own advice to add
// metrics had those metrics reported back as its phone number.
test('a run of decimal metrics is not a phone number', () => {
  assert.equal(findPhoneNumber('Crash-free sessions 96.5 99.5 99.9'), '')
  assert.equal(findPhoneNumber('96.5 99.5 99.9'), '')
})

test('a run of years is not a phone number', () => {
  assert.equal(findPhoneNumber('2019 2020 2021'), '')
})

test('too few or too many digits is not a phone number', () => {
  assert.equal(findPhoneNumber('12 345'), '')
  assert.equal(findPhoneNumber('1234567890123456789'), '')
})

test('a bare host counts on a line that carries other contact details', () => {
  assert.equal(hasProfileUrl('jane@example.com · +1 555 123 4567 · jane.dev'), true)
  assert.deepEqual(findProfileUrls('jane@example.com · +1 555 123 4567 · jane.dev'), ['jane.dev'])
})

// Deliberate: a bare host on a line with no other contact signal is rejected,
// even when it really is the candidate's site. The two errors are not equal -
// crediting a link that does not exist tells the user to add nothing, while
// missing one tells them to write the URL out in full, which is better for ATS
// parsers anyway and is what the Builder emits.
test('a bare host with no contact signal on its line is not counted', () => {
  assert.equal(hasProfileUrl('Madrid, Spain · jane.dev'), false)
})

test('recognises a written-out profile URL', () => {
  for (const input of [
    'linkedin.com/in/mshykov',
    'github.com/mshykov',
    'https://shykov.dev',
    'www.shykov.dev',
    'shykov.dev/blog',
  ]) {
    assert.equal(hasProfileUrl(input), true, `should detect ${input}`)
  }
})

// Regression: a bare host is the same shape as a package name, so any CV that
// merely mentioned a .io or .dev library scored as having a profile link - and
// was then told it did not need to add one.
test('a library name mentioned in prose is not a profile link', () => {
  assert.equal(hasProfileUrl('Experience with socket.io and Redis'), false)
  assert.equal(hasProfileUrl('Built with vite.dev and React'), false)
  assert.deepEqual(findProfileUrls('Shipped with socket.io on next.js'), [])
})

test('findProfileUrls dedupes and respects the limit', () => {
  const text = 'linkedin.com/in/me github.com/me LinkedIn.com/in/me shykov.dev/blog'
  assert.deepEqual(findProfileUrls(text, 2), ['linkedin.com/in/me', 'github.com/me'])
  assert.equal(findProfileUrls(text).length, 3)
})

test('an email is never mistaken for a profile URL', () => {
  assert.equal(hasProfileUrl('me@shykov.dev'), false)
})
