/**
 * @typedef {Object} PluginPackageJsonNapCat
 * @property {string} host
 * @property {string} token
 */
/**
 * @typedef {Object} PluginPackageJson
 * @property {PluginPackageJsonNapCat} napcat
 */

const { host: napCatHost, token: napCatToken } = /** @type {PluginPackageJson} */ (
  __self.meta.packageJson
).napcat

/**
 * @param {HTMLElement} el
 * @param {number} duration
 * @param {number} intensity
 */
function shakeElement(el, duration = 300, intensity = 3) {
  const start = performance.now()
  /** @param {number} now */
  const animate = (now) => {
    const elapsed = now - start
    if (elapsed < duration) {
      const offset = Math.sin((elapsed / 50) * Math.PI) * intensity
      el.style.transform = `translateX(${offset}px)`
      requestAnimationFrame(animate)
    } else {
      el.style.transform = 'translateX(0)'
    }
  }
  requestAnimationFrame(animate)
}

/**
 * @typedef {Object} MsgRecord
 * @property {number} chatType
 * @property {number} peerUin
 * @property {number} senderUin
 */

/**
 * @param {HTMLElement} el
 * @returns {MsgRecord | undefined}
 */
function extractInfo(el) {
  return el.__VUE__?.[0]?.ctx.overriddenMsgRecord ?? undefined
}

/**
 * @typedef {Object} OBV11BaseReturn
 * @property {number} [retcode]
 */

/**
 * @param {HTMLElement | null | undefined} ctxEl
 * @param {(record: MsgRecord) => boolean} [infoCheck]
 */
async function doPoke(ctxEl, infoCheck) {
  if (!ctxEl) return

  const info = extractInfo(ctxEl)
  if (!info || (infoCheck && !infoCheck(info))) return

  const { chatType, peerUin, senderUin } = info
  const resp = await fetch(`${napCatHost}/send_poke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${napCatToken}`,
    },
    body: JSON.stringify({
      group_id: chatType === 1 ? undefined : peerUin,
      user_id: senderUin,
    }),
  })
  const data = /** @type {OBV11BaseReturn} */ (await resp.json())

  if (data.retcode !== 0) {
    console.error(data)
    return
  }

  shakeElement(/** @type {HTMLElement} */ (ctxEl.querySelector('.avatar-span')))
}

const baseSel = '.group-chat .chat-msg-area__vlist .message > .message-container'

document.addEventListener('dblclick', (e) => {
  const target = /** @type {HTMLElement} */ (e.target)
  if (target.matches(`${baseSel} > .user-name > span.text-ellipsis`)) {
    // group chat username
    doPoke(target.parentElement?.parentElement?.parentElement)
  } else if (target.matches(`${baseSel} > .avatar-span > .avatar`)) {
    // avatar
    doPoke(
      target.parentElement?.parentElement?.parentElement,
      (info) => info.chatType === 1, // only in private chat
    )
  }
})
