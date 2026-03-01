import './styles/main.css'
import { generatePassword } from './core/generator'
import { calculateStrength } from './core/strength'
import {
  initStorage,
  getAllPasswords,
  searchPasswords,
  createPassword,
  updatePassword,
  deletePassword,
  clearAllPasswords,
  exportPasswords,
  importPasswords,
  STORAGE_KEYS,
} from './storage/storage'
import type { AppSettings, GeneratorOptions, PasswordEntry, SearchOptions } from './types/index'

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  defaultGenerator: {
    length: 16,
    count: 1,
    includeLowercase: true,
    includeNumerals: true,
    includeCapitals: true,
    includeSymbols: true,
    pronounceable: false,
    avoidAmbiguous: false,
  },
  expirationReminders: false,
  defaultExpirationDays: 0,
  clipboardTimeout: 0,
}

// Settings management
function loadSettings(): AppSettings {
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (!raw) return { ...DEFAULT_SETTINGS }
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return { ...DEFAULT_SETTINGS, ...parsed, defaultGenerator: { ...DEFAULT_SETTINGS.defaultGenerator, ...parsed.defaultGenerator } }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Toast notification
function showToast(message: string) {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach((t) => t.remove())

  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2500)
}

// Theme management
function applyTheme(themeSetting: 'light' | 'dark' | 'auto') {
  const html = document.documentElement
  html.classList.remove('dark')

  if (themeSetting === 'dark') {
    html.classList.add('dark')
  } else if (themeSetting === 'auto') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark')
    }
  }
}

function initTheme() {
  const settings = loadSettings()
  // Migrate old 'theme' key to settings if needed
  const legacyTheme = localStorage.getItem('theme')
  if (legacyTheme && !localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    settings.theme = legacyTheme === 'dark' ? 'dark' : legacyTheme === 'light' ? 'light' : 'auto'
    saveSettings(settings)
  }
  applyTheme(settings.theme)
}

function toggleTheme() {
  // Cycle: current → next. Used by the header button as a quick toggle.
  const html = document.documentElement
  const settings = loadSettings()

  if (html.classList.contains('dark')) {
    html.classList.remove('dark')
    settings.theme = 'light'
  } else {
    html.classList.add('dark')
    settings.theme = 'dark'
  }

  saveSettings(settings)
  localStorage.setItem('theme', settings.theme) // keep legacy key in sync
  updateThemeSelector(settings.theme)
}

function updateThemeSelector(theme: string) {
  const buttons = document.querySelectorAll('#theme-selector .theme-option')
  buttons.forEach((btn) => {
    const el = btn as HTMLElement
    if (el.dataset.theme === theme) {
      el.classList.add('active')
    } else {
      el.classList.remove('active')
    }
  })
}

// Tab management
function switchTab(tabName: string) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content')
  tabContents.forEach((content) => {
    content.classList.add('hidden')
  })

  // Remove active class from all tabs
  const tabs = document.querySelectorAll('.tab')
  tabs.forEach((tab) => {
    tab.classList.remove('tab-active')
    tab.setAttribute('aria-selected', 'false')
  })

  // Show selected tab content
  const selectedContent = document.getElementById(`tab-${tabName}`)
  if (selectedContent) {
    selectedContent.classList.remove('hidden')
  }

  // Add active class to selected tab
  const selectedTab = document.querySelector(`[data-tab="${tabName}"]`)
  if (selectedTab) {
    selectedTab.classList.add('tab-active')
    selectedTab.setAttribute('aria-selected', 'true')
  }

  // Re-render saved tab when switching to it
  if (tabName === 'saved') {
    renderSavedPasswords()
  }
}

// --- Saved Passwords Tab ---

// --- Reusable modal system ---

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

interface PromptOptions {
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    const confirmBtnClass = options.danger ? 'btn-danger btn-sm' : 'btn btn-primary btn-sm'

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${escapeHTML(options.title)}</div>
        <div class="modal-body">${escapeHTML(options.message)}</div>
        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" data-action="cancel">${escapeHTML(options.cancelText ?? 'Cancel')}</button>
          <button class="${confirmBtnClass}" data-action="confirm">${escapeHTML(options.confirmText ?? 'Confirm')}</button>
        </div>
      </div>
    `

    function close(result: boolean) {
      overlay.remove()
      resolve(result)
    }

    overlay.querySelector('[data-action="cancel"]')!.addEventListener('click', () => close(false))
    overlay.querySelector('[data-action="confirm"]')!.addEventListener('click', () => close(true))
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false) })
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', handler); close(false) }
    })

    document.body.appendChild(overlay)
    ;(overlay.querySelector('[data-action="confirm"]') as HTMLElement).focus()
  })
}

function showPrompt(options: PromptOptions): Promise<string | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${escapeHTML(options.title)}</div>
        ${options.message ? `<div class="modal-body">${escapeHTML(options.message)}</div>` : ''}
        <input type="text" class="modal-input" placeholder="${escapeHTML(options.placeholder ?? '')}" value="${escapeHTML(options.defaultValue ?? '')}" />
        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" data-action="cancel">${escapeHTML(options.cancelText ?? 'Cancel')}</button>
          <button class="btn btn-primary btn-sm" data-action="confirm">${escapeHTML(options.confirmText ?? 'Save')}</button>
        </div>
      </div>
    `

    const input = overlay.querySelector('.modal-input') as HTMLInputElement

    function close(result: string | null) {
      overlay.remove()
      resolve(result)
    }

    function submit() {
      const val = input.value.trim()
      if (val) close(val)
    }

    overlay.querySelector('[data-action="cancel"]')!.addEventListener('click', () => close(null))
    overlay.querySelector('[data-action="confirm"]')!.addEventListener('click', submit)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit() }
      if (e.key === 'Escape') close(null)
    })
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null) })

    document.body.appendChild(overlay)
    input.focus()
    input.select()
  })
}

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as unknown as T
}

// Date formatting
function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatRelativeExpiration(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`
  }
  if (diffDays === 0) {
    return 'Expires today'
  }
  return `Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
}

function strengthLevel(score: number): 'weak' | 'fair' | 'good' | 'strong' {
  if (score < 30) return 'weak'
  if (score < 60) return 'fair'
  if (score < 80) return 'good'
  return 'strong'
}

// Get current search/filter/sort options from the UI
function getSavedSearchOptions(): SearchOptions {
  const searchInput = document.getElementById('saved-search') as HTMLInputElement
  const filterStrength = document.getElementById('saved-filter-strength') as HTMLSelectElement
  const sortSelect = document.getElementById('saved-sort') as HTMLSelectElement

  const query = searchInput?.value || ''
  const strengthFilter = filterStrength?.value || 'all'
  const sortValue = sortSelect?.value || 'createdAt-desc'
  const [sortBy, sortOrder] = sortValue.split('-') as [SearchOptions['sortBy'], SearchOptions['sortOrder']]

  const options: SearchOptions = { sortBy, sortOrder }

  if (query) {
    options.query = query
  }

  // Map strength filter to score ranges
  if (strengthFilter !== 'all') {
    switch (strengthFilter) {
      case 'weak':
        options.maxStrength = 29
        break
      case 'fair':
        options.minStrength = 30
        options.maxStrength = 59
        break
      case 'good':
        options.minStrength = 60
        options.maxStrength = 79
        break
      case 'strong':
        options.minStrength = 80
        break
    }
  }

  return options
}

// Copy to clipboard with feedback on a button
async function copyToClipboard(text: string, btn: HTMLElement) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    const originalHTML = btn.innerHTML
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="rgb(22 163 74)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`
    setTimeout(() => { btn.innerHTML = originalHTML }, 1000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Render a single password card
function renderPasswordCard(entry: PasswordEntry): HTMLElement {
  const card = document.createElement('div')
  card.className = 'password-card fade-in'
  card.dataset.id = entry.id

  const level = strengthLevel(entry.strength)
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1)
  const isExpired = entry.expiresAt ? entry.expiresAt <= new Date() : false
  const maskedPassword = '•'.repeat(Math.min(entry.password.length, 24))

  let expirationHTML = ''
  if (entry.expiresAt) {
    const relText = formatRelativeExpiration(entry.expiresAt)
    const cls = isExpired ? 'expiration-expired' : 'expiration-warning'
    expirationHTML = `<span class="${cls}">${relText}</span>`
  }

  card.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <h4 class="card-label font-semibold text-sm truncate">${escapeHTML(entry.label)}</h4>
        <span class="badge badge-${level}">${levelLabel}</span>
      </div>
      <div class="flex items-center gap-1">
        <button class="btn-icon-sm btn-edit" title="Edit label">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button class="btn-icon-sm btn-regen" title="Regenerate password">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
        <button class="btn-icon-sm btn-delete" title="Delete" style="color: rgb(220 38 38);">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
    <div class="flex items-center gap-2 mb-2">
      <span class="password-masked password-text flex-1">${maskedPassword}</span>
      <button class="btn-icon-sm btn-toggle-pw" title="Show/hide password">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      </button>
      <button class="btn-icon-sm btn-copy-pw" title="Copy password">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>
    </div>
    <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
      <span>Created ${formatDate(entry.createdAt)}</span>
      ${expirationHTML}
    </div>
  `

  // Track visibility state
  let passwordVisible = false

  // Toggle password visibility
  const toggleBtn = card.querySelector('.btn-toggle-pw')!
  const passwordSpan = card.querySelector('.password-text')!
  toggleBtn.addEventListener('click', () => {
    passwordVisible = !passwordVisible
    passwordSpan.textContent = passwordVisible ? entry.password : maskedPassword
  })

  // Copy password
  const copyBtn = card.querySelector('.btn-copy-pw') as HTMLElement
  copyBtn.addEventListener('click', () => copyToClipboard(entry.password, copyBtn))

  // Edit label
  const editBtn = card.querySelector('.btn-edit')!
  editBtn.addEventListener('click', () => startInlineEdit(card, entry))

  // Regenerate using the same options the password was originally created with
  const regenBtn = card.querySelector('.btn-regen')!
  regenBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: 'Regenerate Password',
      message: `Regenerate password for "${entry.label}"? The current password will be permanently overwritten.`,
      confirmText: 'Regenerate',
      danger: true,
    })
    if (!confirmed) return
    const options = entry.generatorOptions ?? getGeneratorOptions()
    const generated = generatePassword(options)
    await updatePassword(entry.id, { password: generated.password })
    renderSavedPasswords()
  })

  // Delete
  const deleteBtn = card.querySelector('.btn-delete')!
  deleteBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: 'Delete Password',
      message: `Delete "${entry.label}"? This action cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    })
    if (!confirmed) return
    await deletePassword(entry.id)
    renderSavedPasswords()
  })

  return card
}

function escapeHTML(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Inline edit for label
function startInlineEdit(card: HTMLElement, entry: PasswordEntry) {
  const labelEl = card.querySelector('.card-label') as HTMLElement
  if (!labelEl) return

  const input = document.createElement('input')
  input.type = 'text'
  input.value = entry.label
  input.className = 'input text-sm'
  input.style.padding = '0.125rem 0.375rem'
  input.style.width = '100%'

  const parent = labelEl.parentElement!
  parent.replaceChild(input, labelEl)
  input.focus()
  input.select()

  const save = async () => {
    const newLabel = input.value.trim()
    if (newLabel && newLabel !== entry.label) {
      await updatePassword(entry.id, { label: newLabel })
    }
    renderSavedPasswords()
  }

  const cancel = () => {
    parent.replaceChild(labelEl, input)
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      cancel()
    }
  })

  input.addEventListener('blur', save)
}

// Main render function for saved passwords
async function renderSavedPasswords() {
  const list = document.getElementById('saved-passwords-list')!
  const emptyState = document.getElementById('saved-empty-state')!
  const countBadge = document.getElementById('saved-count')!

  const options = getSavedSearchOptions()
  const passwords = await searchPasswords(options)
  const allPasswords = await getAllPasswords()

  countBadge.textContent = String(allPasswords.length)

  list.innerHTML = ''

  if (passwords.length === 0) {
    list.classList.add('hidden')
    emptyState.classList.remove('hidden')
  } else {
    list.classList.remove('hidden')
    emptyState.classList.add('hidden')

    for (const entry of passwords) {
      list.appendChild(renderPasswordCard(entry))
    }
  }
}

// Get generator options from UI
function getGeneratorOptions(): GeneratorOptions {
  const lengthSlider = document.getElementById('password-length') as HTMLInputElement
  const lowercaseCheckbox = document.getElementById('opt-lowercase') as HTMLInputElement
  const numeralsCheckbox = document.getElementById('opt-numerals') as HTMLInputElement
  const capitalsCheckbox = document.getElementById('opt-capitals') as HTMLInputElement
  const symbolsCheckbox = document.getElementById('opt-symbols') as HTMLInputElement
  const pronounceableCheckbox = document.getElementById('opt-pronounceable') as HTMLInputElement
  const ambiguousCheckbox = document.getElementById('opt-ambiguous') as HTMLInputElement

  return {
    length: parseInt(lengthSlider?.value || '16'),
    count: 1, // Always 1 since we removed the count slider
    includeLowercase: lowercaseCheckbox?.checked ?? true,
    includeNumerals: numeralsCheckbox?.checked ?? true,
    includeCapitals: capitalsCheckbox?.checked ?? true,
    includeSymbols: symbolsCheckbox?.checked ?? true,
    pronounceable: pronounceableCheckbox?.checked ?? false,
    avoidAmbiguous: ambiguousCheckbox?.checked ?? false,
  }
}

// Save current generator options to localStorage
function saveGeneratorOptions(): void {
  const options = getGeneratorOptions()
  localStorage.setItem(STORAGE_KEYS.GENERATOR_OPTIONS, JSON.stringify(options))
}

// Restore generator options from localStorage into the UI controls
function restoreGeneratorOptions(): void {
  const raw = localStorage.getItem(STORAGE_KEYS.GENERATOR_OPTIONS)
  if (!raw) return
  try {
    const options = JSON.parse(raw) as Partial<GeneratorOptions>

    const lengthSlider = document.getElementById('password-length') as HTMLInputElement
    const lengthValue = document.getElementById('length-value')
    const lowercaseCheckbox = document.getElementById('opt-lowercase') as HTMLInputElement
    const numeralsCheckbox = document.getElementById('opt-numerals') as HTMLInputElement
    const capitalsCheckbox = document.getElementById('opt-capitals') as HTMLInputElement
    const symbolsCheckbox = document.getElementById('opt-symbols') as HTMLInputElement
    const pronounceableCheckbox = document.getElementById('opt-pronounceable') as HTMLInputElement
    const ambiguousCheckbox = document.getElementById('opt-ambiguous') as HTMLInputElement

    if (options.length != null && lengthSlider) {
      lengthSlider.value = String(options.length)
      if (lengthValue) lengthValue.textContent = String(options.length)
    }
    if (options.includeLowercase != null && lowercaseCheckbox) lowercaseCheckbox.checked = options.includeLowercase
    if (options.includeNumerals != null && numeralsCheckbox) numeralsCheckbox.checked = options.includeNumerals
    if (options.includeCapitals != null && capitalsCheckbox) capitalsCheckbox.checked = options.includeCapitals
    if (options.includeSymbols != null && symbolsCheckbox) symbolsCheckbox.checked = options.includeSymbols
    if (options.pronounceable != null && pronounceableCheckbox) pronounceableCheckbox.checked = options.pronounceable
    if (options.avoidAmbiguous != null && ambiguousCheckbox) ambiguousCheckbox.checked = options.avoidAmbiguous
  } catch {
    // Ignore corrupt data
  }
}

// Update strength indicator
function updateStrengthIndicator(password: string) {
  const strengthResult = calculateStrength(password)
  const strengthText = document.getElementById('strength-text')
  const strengthFill = document.getElementById('strength-fill')

  if (strengthText) {
    strengthText.textContent = `${strengthResult.level.charAt(0).toUpperCase() + strengthResult.level.slice(1)} (${strengthResult.score}%)`
  }

  if (strengthFill) {
    strengthFill.style.width = `${strengthResult.score}%`
    // Remove all strength classes
    strengthFill.classList.remove('strength-weak', 'strength-fair', 'strength-good', 'strength-strong')
    // Add appropriate class
    strengthFill.classList.add(`strength-${strengthResult.level}`)
  }
}

// Initialize app
async function init() {
  initTheme()

  // Initialize storage
  await initStorage()

  // Theme toggle button
  const themeToggle = document.getElementById('theme-toggle')
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme)
  }

  // Tab navigation
  const tabButtons = document.querySelectorAll('[data-tab]')
  tabButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      const tabName = target.dataset.tab
      if (tabName) {
        switchTab(tabName)
      }
    })
  })

  // Restore last-used generator options before wiring UI events
  restoreGeneratorOptions()

  // Password length slider
  const lengthSlider = document.getElementById('password-length') as HTMLInputElement
  const lengthValue = document.getElementById('length-value')
  if (lengthSlider && lengthValue) {
    lengthSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      lengthValue.textContent = target.value
    })
  }

  // Generate password button
  const generateBtn = document.getElementById('btn-generate')
  const passwordInput = document.getElementById('generated-password') as HTMLInputElement
  if (generateBtn && passwordInput) {
    generateBtn.addEventListener('click', () => {
      const options = getGeneratorOptions()
      saveGeneratorOptions()
      const generated = generatePassword(options)
      passwordInput.value = generated.password
      updateStrengthIndicator(generated.password)
    })

    // Generate initial password using restored (or default) options
    const initialGenerated = generatePassword(getGeneratorOptions())
    passwordInput.value = initialGenerated.password
    updateStrengthIndicator(initialGenerated.password)
  }

  // Toggle password visibility
  const toggleVisibilityBtn = document.getElementById('btn-toggle-visibility')
  if (toggleVisibilityBtn && passwordInput) {
    toggleVisibilityBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
      } else {
        passwordInput.type = 'password'
      }
    })
  }

  // Copy to clipboard
  const copyBtn = document.getElementById('btn-copy')
  if (copyBtn && passwordInput) {
    copyBtn.addEventListener('click', async () => {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(passwordInput.value)
        } else {
          // Fallback for non-secure contexts (HTTP)
          passwordInput.select()
          passwordInput.setSelectionRange(0, 99999) // For mobile devices
          document.execCommand('copy')
          window.getSelection()?.removeAllRanges()
        }

        // Show success feedback
        const originalHTML = copyBtn.innerHTML
        copyBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="rgb(22 163 74)" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        `
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML
        }, 1000)
      } catch (err) {
        console.error('Failed to copy:', err)
        // Show error feedback
        showToast('Failed to copy to clipboard')
      }
    })
  }

  // --- Save button on Generate tab ---
  const saveBtn = document.getElementById('btn-save')
  if (saveBtn && passwordInput) {
    saveBtn.addEventListener('click', async () => {
      const password = passwordInput.value
      if (!password || password === '••••••••••••••••') {
        showToast('Generate a password first')
        return
      }

      const label = await showPrompt({
        title: 'Save Password',
        message: 'Enter a label to identify this password.',
        placeholder: 'e.g. Gmail, GitHub, Netflix...',
        confirmText: 'Save',
      })
      if (!label) return

      try {
        const settings = loadSettings()
        const expiresAt = settings.defaultExpirationDays > 0
          ? new Date(Date.now() + settings.defaultExpirationDays * 24 * 60 * 60 * 1000)
          : undefined
        const generatorOpts = getGeneratorOptions()
        await createPassword(password, label, expiresAt, generatorOpts)
        // Show success feedback on the save button
        const originalText = saveBtn.textContent
        saveBtn.textContent = 'Saved!'
        saveBtn.classList.remove('btn-secondary')
        saveBtn.classList.add('btn-primary')
        setTimeout(() => {
          saveBtn.textContent = originalText
          saveBtn.classList.remove('btn-primary')
          saveBtn.classList.add('btn-secondary')
        }, 1500)
      } catch (err) {
        console.error('Failed to save:', err)
        showToast('Failed to save password')
      }
    })
  }

  // --- Saved tab event listeners ---

  // Search with debounce
  const savedSearch = document.getElementById('saved-search') as HTMLInputElement
  if (savedSearch) {
    savedSearch.addEventListener('input', debounce(() => renderSavedPasswords(), 300))
  }

  // Filter & sort dropdowns
  const filterStrength = document.getElementById('saved-filter-strength')
  const sortSelect = document.getElementById('saved-sort')
  if (filterStrength) {
    filterStrength.addEventListener('change', () => renderSavedPasswords())
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => renderSavedPasswords())
  }

  // "Go to Generate" link in empty state
  const goGenerateBtn = document.getElementById('btn-go-generate')
  if (goGenerateBtn) {
    goGenerateBtn.addEventListener('click', () => switchTab('generate'))
  }

  // --- Settings Tab ---
  initSettingsTab()

  // Register service worker for PWA offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              showToast('App updated — refresh for the latest version')
            }
          })
        }
      })
    }).catch((err) => {
      console.error('Service worker registration failed:', err)
    })
  }

  // Hide loading screen and show app
  const loadingScreen = document.getElementById('loading-screen')
  const appContainer = document.getElementById('app')
  if (loadingScreen && appContainer) {
    appContainer.classList.remove('hidden')
    loadingScreen.classList.add('fade-out')
    loadingScreen.addEventListener('transitionend', () => loadingScreen.remove())
  }

  console.log('Password Generator initialized')
}

// Settings tab initialization
function initSettingsTab() {
  const settings = loadSettings()

  // --- Theme selector ---
  const themeSelector = document.getElementById('theme-selector')
  if (themeSelector) {
    updateThemeSelector(settings.theme)
    themeSelector.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.theme-option') as HTMLElement | null
      if (!btn?.dataset.theme) return

      const theme = btn.dataset.theme as AppSettings['theme']
      const s = loadSettings()
      s.theme = theme
      saveSettings(s)
      localStorage.setItem('theme', theme) // keep legacy key in sync
      applyTheme(theme)
      updateThemeSelector(theme)
    })
  }

  // --- Default generator preferences ---
  const defaultLength = document.getElementById('settings-default-length') as HTMLInputElement
  const lengthDisplay = document.getElementById('settings-length-display')
  const settingsLowercase = document.getElementById('settings-lowercase') as HTMLInputElement
  const settingsCapitals = document.getElementById('settings-capitals') as HTMLInputElement
  const settingsNumerals = document.getElementById('settings-numerals') as HTMLInputElement
  const settingsSymbols = document.getElementById('settings-symbols') as HTMLInputElement
  const settingsPronounceable = document.getElementById('settings-pronounceable') as HTMLInputElement
  const settingsAmbiguous = document.getElementById('settings-ambiguous') as HTMLInputElement

  // Populate from saved settings
  if (defaultLength) {
    defaultLength.value = String(settings.defaultGenerator.length)
    if (lengthDisplay) lengthDisplay.textContent = String(settings.defaultGenerator.length)
  }
  if (settingsLowercase) settingsLowercase.checked = settings.defaultGenerator.includeLowercase
  if (settingsCapitals) settingsCapitals.checked = settings.defaultGenerator.includeCapitals
  if (settingsNumerals) settingsNumerals.checked = settings.defaultGenerator.includeNumerals
  if (settingsSymbols) settingsSymbols.checked = settings.defaultGenerator.includeSymbols
  if (settingsPronounceable) settingsPronounceable.checked = settings.defaultGenerator.pronounceable
  if (settingsAmbiguous) settingsAmbiguous.checked = settings.defaultGenerator.avoidAmbiguous

  // Also sync the Generate tab controls from settings
  syncGenerateTabFromSettings(settings)

  // Save on change
  const generatorControls = [defaultLength, settingsLowercase, settingsCapitals, settingsNumerals, settingsSymbols, settingsPronounceable, settingsAmbiguous]

  function saveGeneratorDefaults() {
    const s = loadSettings()
    s.defaultGenerator = {
      length: parseInt(defaultLength?.value || '16'),
      count: 1,
      includeLowercase: settingsLowercase?.checked ?? true,
      includeNumerals: settingsNumerals?.checked ?? true,
      includeCapitals: settingsCapitals?.checked ?? true,
      includeSymbols: settingsSymbols?.checked ?? true,
      pronounceable: settingsPronounceable?.checked ?? false,
      avoidAmbiguous: settingsAmbiguous?.checked ?? false,
    }
    saveSettings(s)
    syncGenerateTabFromSettings(s)
  }

  generatorControls.forEach((ctrl) => {
    if (ctrl) ctrl.addEventListener('change', saveGeneratorDefaults)
  })

  if (defaultLength && lengthDisplay) {
    defaultLength.addEventListener('input', () => {
      lengthDisplay.textContent = defaultLength.value
    })
  }

  // --- Expiration settings ---
  const expirationReminders = document.getElementById('settings-expiration-reminders') as HTMLInputElement
  const expirationDays = document.getElementById('settings-expiration-days') as HTMLInputElement

  if (expirationReminders) expirationReminders.checked = settings.expirationReminders
  if (expirationDays) expirationDays.value = String(settings.defaultExpirationDays)

  if (expirationReminders) {
    expirationReminders.addEventListener('change', () => {
      const s = loadSettings()
      s.expirationReminders = expirationReminders.checked
      saveSettings(s)
    })
  }

  if (expirationDays) {
    expirationDays.addEventListener('change', () => {
      const s = loadSettings()
      s.defaultExpirationDays = Math.max(0, parseInt(expirationDays.value) || 0)
      expirationDays.value = String(s.defaultExpirationDays)
      saveSettings(s)
    })
  }

  // --- Export ---
  const exportBtn = document.getElementById('btn-export')
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const json = await exportPasswords()
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pwgen-export-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showToast('Passwords exported successfully')
      } catch (err) {
        console.error('Export failed:', err)
        showToast('Export failed')
      }
    })
  }

  // --- Import ---
  const importInput = document.getElementById('btn-import') as HTMLInputElement
  if (importInput) {
    importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const result = await importPasswords(text, true) // merge mode
        showToast(`Imported ${result.imported} password${result.imported !== 1 ? 's' : ''}${result.skipped ? `, ${result.skipped} skipped` : ''}`)
      } catch (err) {
        console.error('Import failed:', err)
        showToast(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Reset file input so same file can be re-imported
      importInput.value = ''
    })
  }

  // --- Clear all ---
  const clearAllBtn = document.getElementById('btn-clear-all')
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', async () => {
      const confirmed = await showConfirm({
        title: 'Delete All Passwords',
        message: 'This will permanently remove all saved passwords. This action cannot be undone.',
        confirmText: 'Delete All',
        danger: true,
      })
      if (!confirmed) return

      await clearAllPasswords()
      showToast('All passwords deleted')
    })
  }
}

// Sync Generate tab controls from settings defaults
function syncGenerateTabFromSettings(settings: AppSettings) {
  const lengthSlider = document.getElementById('password-length') as HTMLInputElement
  const lengthValue = document.getElementById('length-value')
  const optLowercase = document.getElementById('opt-lowercase') as HTMLInputElement
  const optCapitals = document.getElementById('opt-capitals') as HTMLInputElement
  const optNumerals = document.getElementById('opt-numerals') as HTMLInputElement
  const optSymbols = document.getElementById('opt-symbols') as HTMLInputElement
  const optPronounceable = document.getElementById('opt-pronounceable') as HTMLInputElement
  const optAmbiguous = document.getElementById('opt-ambiguous') as HTMLInputElement

  const gen = settings.defaultGenerator
  if (lengthSlider) {
    lengthSlider.value = String(gen.length)
    if (lengthValue) lengthValue.textContent = String(gen.length)
  }
  if (optLowercase) optLowercase.checked = gen.includeLowercase
  if (optCapitals) optCapitals.checked = gen.includeCapitals
  if (optNumerals) optNumerals.checked = gen.includeNumerals
  if (optSymbols) optSymbols.checked = gen.includeSymbols
  if (optPronounceable) optPronounceable.checked = gen.pronounceable
  if (optAmbiguous) optAmbiguous.checked = gen.avoidAmbiguous
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
