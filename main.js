import { debounce } from 'lodash'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

const $ = document.querySelector.bind(document)

const elements = {
  pasteBox: $('#content #paste-box'),
  toolBox: {
    newButton: $('#tool-box #new-button button'),
    shareLinkInput: $('#tool-box input#share-link'),
    shareLinkCopyButton: $('#tool-box #share-link-copy-button button'),
  }
}

document.addEventListener('DOMContentLoaded', () => {
  onFirstLoad()
})

elements.pasteBox.addEventListener('input', debounce(event => {
  updateShareLink()
}, 100))

elements.toolBox.shareLinkCopyButton.addEventListener('click', () => {
  copyLinkToClipboard()
  flashClass(elements.toolBox.shareLinkInput, 'input-flash', 500)
})

elements.toolBox.newButton.addEventListener('click', () => {
  newPaste()
  updateShareLink()
})

function onFirstLoad() {
  const result = parseLink(location.href)
  if (!result.success) {
    setEditing(true)
    updateShareLink()
    return
  }

  const content = decompressFromEncodedURIComponent(result.value)
  elements.pasteBox.innerHTML = content
  elements.toolBox.shareLinkInput.value = location.href
  setEditing(false)
}

function copyLinkToClipboard() {
  const link = elements.toolBox.shareLinkInput.value
  navigator.clipboard.writeText(link).then(() => {
    console.log('text copied to clipboard')
  })
}

function newPaste() {
  elements.pasteBox.innerHTML = ''
  setEditing(true)
  setUrlQueryString('')
}

function setUrlQueryString(queryString) {
  const pattern = /(?:#)(.*)$/m
  location.href = location.href.replace(pattern, queryString)
}

function setEditing(state) {
  if (state) {
    const attr = document.createAttribute('contentEditable')
    elements.pasteBox.attributes.setNamedItem(attr)
  } else {
    elements.pasteBox.attributes.removeNamedItem('contentEditable')
  }
}

function updateShareLink() {
  const link = generateLink(elements.pasteBox.innerHTML)
  elements.toolBox.shareLinkInput.value = link
  flashClass(elements.toolBox.shareLinkInput, 'input-flash', 500)
}

function generateLink(content) {
  if (content.length === 0) { return '' }

  const b64 = compressToEncodedURIComponent(content)
  const base = location.href.replace(location.pathname, '')
  return `${base}#${b64}`
}

function parseLink(href) {
  const pattern = /(?:#)(.*)$/m
  const match = pattern.exec(href)
  if (!match || !match[1]) {
    console.log('failed to parse url')
    return {success: false}
  }

  return {success: true, value: match[1]}
}

function flashClass(element, className, duration) {
  element.classList.toggle(className)
  setTimeout(
    () => element.classList.toggle(className),
    duration
  )
}
