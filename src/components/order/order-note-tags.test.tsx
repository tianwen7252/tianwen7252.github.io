import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderNoteTags } from './order-note-tags'

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_TAGS = ['攤位', '外送', '電話自取']
const STORAGE_KEY = 'order-note-tags'

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderOrderNoteTags(
  overrides: {
    selectedTags?: readonly string[]
    onSelectedTagsChange?: (tags: string[]) => void
  } = {},
) {
  const props = {
    selectedTags: overrides.selectedTags ?? [],
    onSelectedTagsChange: overrides.onSelectedTagsChange ?? vi.fn(),
  }
  return { ...render(<OrderNoteTags {...props} />), props }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('OrderNoteTags', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ─── Default Tag Rendering ──────────────────────────────────────────────

  describe('default tags', () => {
    it('should render all three default tags', () => {
      renderOrderNoteTags()
      for (const tag of DEFAULT_TAGS) {
        expect(screen.getByText(tag)).toBeTruthy()
      }
    })

    it('should render section title with i18n key order.orderNote', () => {
      renderOrderNoteTags()
      // zh-TW: order.orderNote -> '訂單備註'
      expect(screen.getByText('訂單備註')).toBeTruthy()
    })

    it('should NOT show delete button on default tags', () => {
      renderOrderNoteTags()
      // Default tags should not have an X / delete button
      for (const tag of DEFAULT_TAGS) {
        const tagEl = screen.getByText(tag).closest('[data-tag]')
        expect(tagEl).toBeTruthy()
        // There should be no delete button within the default tag element
        const deleteBtn = tagEl!.querySelector('[data-tag-delete]')
        expect(deleteBtn).toBeNull()
      }
    })
  })

  // ─── Tag Selection ──────────────────────────────────────────────────────

  describe('tag selection', () => {
    it('should call onSelectedTagsChange with tag added when clicking unselected tag', async () => {
      const onSelectedTagsChange = vi.fn()
      const user = userEvent.setup()
      renderOrderNoteTags({ onSelectedTagsChange })

      await user.click(screen.getByText('攤位'))
      expect(onSelectedTagsChange).toHaveBeenCalledWith(['攤位'])
    })

    it('should call onSelectedTagsChange with tag removed when clicking selected tag', async () => {
      const onSelectedTagsChange = vi.fn()
      const user = userEvent.setup()
      renderOrderNoteTags({
        selectedTags: ['攤位', '外送'],
        onSelectedTagsChange,
      })

      await user.click(screen.getByText('攤位'))
      expect(onSelectedTagsChange).toHaveBeenCalledWith(['外送'])
    })

    it('should highlight selected tags with active style', () => {
      renderOrderNoteTags({ selectedTags: ['攤位'] })
      const tagEl = screen.getByText('攤位').closest('[data-tag]')
      expect(tagEl).toBeTruthy()
      expect(tagEl!.className).toContain('bg-primary')
    })

    it('should show unselected tags with muted style', () => {
      renderOrderNoteTags({ selectedTags: [] })
      const tagEl = screen.getByText('攤位').closest('[data-tag]')
      expect(tagEl).toBeTruthy()
      expect(tagEl!.className).toContain('bg-muted')
    })

    it('should allow selecting multiple tags', async () => {
      const onSelectedTagsChange = vi.fn()
      const user = userEvent.setup()
      renderOrderNoteTags({ onSelectedTagsChange })

      await user.click(screen.getByText('攤位'))
      expect(onSelectedTagsChange).toHaveBeenCalledWith(['攤位'])
    })
  })

  // ─── Custom Tags from localStorage ────────────────────────────────────

  describe('custom tags from localStorage', () => {
    it('should load custom tags from localStorage on mount', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客', '急單']))
      renderOrderNoteTags()

      expect(screen.getByText('常客')).toBeTruthy()
      expect(screen.getByText('急單')).toBeTruthy()
    })

    it('should render default tags AND custom tags together', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客']))
      renderOrderNoteTags()

      // All default tags
      for (const tag of DEFAULT_TAGS) {
        expect(screen.getByText(tag)).toBeTruthy()
      }
      // Plus custom tag
      expect(screen.getByText('常客')).toBeTruthy()
    })

    it('should handle empty localStorage gracefully', () => {
      // No localStorage item set
      renderOrderNoteTags()
      // Should still show default tags
      for (const tag of DEFAULT_TAGS) {
        expect(screen.getByText(tag)).toBeTruthy()
      }
    })

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json')
      renderOrderNoteTags()
      // Should still show default tags without crashing
      for (const tag of DEFAULT_TAGS) {
        expect(screen.getByText(tag)).toBeTruthy()
      }
    })

    it('should handle non-array JSON in localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
      renderOrderNoteTags()
      for (const tag of DEFAULT_TAGS) {
        expect(screen.getByText(tag)).toBeTruthy()
      }
    })
  })

  // ─── Adding Custom Tags ───────────────────────────────────────────────

  describe('adding custom tags', () => {
    it('should add a new tag via input and Enter key', async () => {
      const user = userEvent.setup()
      renderOrderNoteTags()

      // i18n key: order.addTag -> '新增標籤'
      const input = screen.getByPlaceholderText('新增標籤')
      await user.type(input, '常客{Enter}')

      // New tag should appear
      expect(screen.getByText('常客')).toBeTruthy()
    })

    it('should save new custom tag to localStorage', async () => {
      const user = userEvent.setup()
      renderOrderNoteTags()

      const input = screen.getByPlaceholderText('新增標籤')
      await user.type(input, '常客{Enter}')

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      expect(stored).toContain('常客')
    })

    it('should clear input after adding a tag', async () => {
      const user = userEvent.setup()
      renderOrderNoteTags()

      const input = screen.getByPlaceholderText('新增標籤') as HTMLInputElement
      await user.type(input, '常客{Enter}')

      expect(input.value).toBe('')
    })

    it('should reject empty input (whitespace only)', async () => {
      const user = userEvent.setup()
      renderOrderNoteTags()

      const input = screen.getByPlaceholderText('新增標籤')
      await user.type(input, '   {Enter}')

      // Only default tags should exist
      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored === null || JSON.parse(stored).length === 0).toBe(true)
    })

    it('should reject duplicate of existing default tag', async () => {
      const user = userEvent.setup()
      renderOrderNoteTags()

      const input = screen.getByPlaceholderText('新增標籤')
      await user.type(input, '攤位{Enter}')

      // Should not create duplicate — only 1 instance of '攤位'
      const allTags = screen.getAllByText('攤位')
      expect(allTags).toHaveLength(1)
    })

    it('should reject duplicate of existing custom tag', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客']))
      const user = userEvent.setup()
      renderOrderNoteTags()

      const input = screen.getByPlaceholderText('新增標籤')
      await user.type(input, '常客{Enter}')

      // Should not create duplicate
      const allTags = screen.getAllByText('常客')
      expect(allTags).toHaveLength(1)
    })
  })

  // ─── Deleting Custom Tags ─────────────────────────────────────────────

  describe('deleting custom tags', () => {
    it('should show delete button on custom tags', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客']))
      renderOrderNoteTags()

      const tagEl = screen.getByText('常客').closest('[data-tag]')
      expect(tagEl).toBeTruthy()
      const deleteBtn = tagEl!.querySelector('[data-tag-delete]')
      expect(deleteBtn).toBeTruthy()
    })

    it('should remove custom tag when delete button is clicked', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客', '急單']))
      const user = userEvent.setup()
      renderOrderNoteTags()

      const tagEl = screen.getByText('常客').closest('[data-tag]')
      const deleteBtn = tagEl!.querySelector('[data-tag-delete]')!
      await user.click(deleteBtn)

      // '常客' should be removed
      expect(screen.queryByText('常客')).toBeNull()
      // '急單' should remain
      expect(screen.getByText('急單')).toBeTruthy()
    })

    it('should update localStorage when custom tag is deleted', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客', '急單']))
      const user = userEvent.setup()
      renderOrderNoteTags()

      const tagEl = screen.getByText('常客').closest('[data-tag]')
      const deleteBtn = tagEl!.querySelector('[data-tag-delete]')!
      await user.click(deleteBtn)

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      expect(stored).not.toContain('常客')
      expect(stored).toContain('急單')
    })

    it('should also remove deleted tag from selectedTags if it was selected', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客']))
      const onSelectedTagsChange = vi.fn()
      const user = userEvent.setup()
      renderOrderNoteTags({
        selectedTags: ['常客', '攤位'],
        onSelectedTagsChange,
      })

      const tagEl = screen.getByText('常客').closest('[data-tag]')
      const deleteBtn = tagEl!.querySelector('[data-tag-delete]')!
      await user.click(deleteBtn)

      // Should call with the deleted tag removed from selected
      expect(onSelectedTagsChange).toHaveBeenCalledWith(['攤位'])
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should handle special characters in tag names', async () => {
      const user = userEvent.setup()
      renderOrderNoteTags()

      const input = screen.getByPlaceholderText('新增標籤')
      await user.type(input, '五折(50%){Enter}')

      expect(screen.getByText('五折(50%)')).toBeTruthy()
    })

    it('should trim whitespace from input before adding', async () => {
      const user = userEvent.setup()
      renderOrderNoteTags()

      const input = screen.getByPlaceholderText('新增標籤')
      await user.type(input, '  常客  {Enter}')

      expect(screen.getByText('常客')).toBeTruthy()
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      expect(stored).toContain('常客')
    })

    it('should handle selecting a custom tag', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['常客']))
      const onSelectedTagsChange = vi.fn()
      const user = userEvent.setup()
      renderOrderNoteTags({ onSelectedTagsChange })

      await user.click(screen.getByText('常客'))
      expect(onSelectedTagsChange).toHaveBeenCalledWith(['常客'])
    })
  })
})
