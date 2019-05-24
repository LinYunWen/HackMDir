/* eslint-env browser */
const io = require('socket.io-client')
var dataUrl = ''

/**
 * Async version for forEach
 * @param Array array
 * @param Function callback
 */
async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index])
  }
}

/**
 * Create a websocket connection instance
 * @param String noteId
 * @returns Websocket instance(io)
 */
async function connect (noteId) {
  // Register realtime server
  var server = await fetch(`/realtime-reg/realtime?noteId=${noteId}`)
  server = await server.text()
  var url = JSON.parse(server)['url']
  url = url.replace('https://hackmd.io', '') + '/socket.io/'

  return io('https://hackmd.io', {
    path: url,
    query: {
      noteId: noteId
    },
    reconnectionAttempts: 30
  })
}

/**
 * Get the revision number of a note
 * @param noteId
 * @return Int Revision number
 */
async function getRevision (noteId) {
  var fetched = await fetch(`/realtime-reg/realtime?noteId=${noteId}`)
  var raw = await fetched.text()
  const server = JSON.parse(raw)['url'].replace('https://hackmd.io', '') + '/socket.io'

  fetched = await fetch(`${server}/?noteId=${noteId}&transport=polling`)
  raw = await fetched.text()
  const sid = JSON.parse(raw.substring(raw.indexOf('{'))).sid

  fetched = await fetch(`${server}/?noteId=${noteId}&transport=polling&sid=${sid}`)
  raw = await fetched.text()

  // may fail sometimes, make more attempts~
  try {
    return parseInt(raw.match('"revision":([0-9]*)')[1])
  } catch (TypeError) {
    return getRevision(noteId)
  }
}

/**
 * Get DOM of a page
 * @param String Url
 * @return DOMElement
 */
async function getDOM (url) {
  const res = await fetch(url)
  if (res.status === 404) return null

  const text = await res.text()
  return new DOMParser().parseFromString(text, 'text/html').firstElementChild
}

/**
 * Create new data note
 * @param String Initial content for config file
 * @return String Url of new note
 */
async function newData (content) {
  const newPage = (await fetch('/new')).url

  // FIXME: set timeout since the page may not be initialized soon
  // FIXME: Add exception if the note cannot be created
  setTimeout(function () {
    writeData(newPage.replace('https://hackmd.io/', ''),
      content)
  }, 10000)

  return newPage
}

/**
 * Write content to note
 * @param String noteId
 * @param String Content to overwrite the file
 */
async function writeData (noteId, content) {
  const socket = await connect(noteId)
  socket.on('connect', async () => {
    const doc = await getDOM(`https://hackmd.io/${noteId}/publish`)
    const length = doc.querySelector('#doc').innerText.length
    var revision = await getRevision(noteId)

    if (length > 2) {
      socket.emit('operation', revision, [1, -1, length - 2], null)
      socket.emit('operation', revision + 1, [-length + 1], null)
      revision += 2
    } else if (length > 0) {
      socket.emit('operation', revision, [-length], null)
      revision += 1
    }
    socket.emit('operation', revision, [content], null)

    socket.emit('permission', 'private')
  })
}

/**
 * Initialize data note if not exist
 * @returns String url of data note
 */
async function getDataUrl () {
  if (dataUrl) return dataUrl
  var doc = await getDOM('/profile?q=hkmdir-data')
  const page = doc.querySelector('.content a')

  if (page === null) {
    dataUrl = await newData('###### hkmdir-data\n')
  } else {
    dataUrl = page.href
  }

  return dataUrl
}

/**
 * Get History of a logged in user
 * @returns JSON History lists
 */
async function getHistory () {
  var history = await fetch('/history', { cache: 'no-store' })
  return JSON.parse(await history.text()).history.map(target => ({
    title: target.text,
    href: `https://hackmd.io/${target.id}`
  }))
}

/**
 * Get notes written by logged in user
 * @returns Array Information including href and title
 */
async function getPersonal () {
  const doc = await fetch('/api/overview')
  const text = await doc.text()
  const result = Array.from(JSON.parse(text)).map(function (e) {
    return { href: `https://hackmd.io/${e.id}`, title: e.title }
  })

  return result
}

async function getDirectory () {
  const doc = await fetch(`${dataUrl}/publish`)
  const text = await doc.text()
  var data = new DOMParser().parseFromString(text, 'text/html')
    .querySelector('#doc').innerText.replace('###### tags: hkmdir-data', '')

  return JSON.parse(data).dir
}

module.exports = {
  connect: connect,
  newData: newData,
  writeData: writeData,
  getDataUrl: getDataUrl,
  getHistory: getHistory,
  getPersonal: getPersonal,
  getDirectory: getDirectory,
  asyncForEach: asyncForEach
}
