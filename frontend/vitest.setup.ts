import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock do scrollIntoView (necessário para o Select do Radix)
Element.prototype.scrollIntoView = vi.fn()

// Mock do ResizeObserver (necessário para o Switch/Radix)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock