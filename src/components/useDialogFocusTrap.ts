import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible)
}

type UseDialogFocusTrapOptions = {
  isOpen: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
}

export function useDialogFocusTrap({
  isOpen,
  initialFocusRef,
}: UseDialogFocusTrapOptions): RefObject<HTMLElement | null> {
  const dialogRef = useRef<HTMLElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return
    }

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const currentDialog = dialogRef.current

    if (!currentDialog) {
      return
    }

    const dialog: HTMLElement = currentDialog

    const moveFocusInside = () => {
      const fallbackTarget = getFocusableElements(dialog)[0] ?? dialog
      const target = initialFocusRef?.current ?? fallbackTarget
      target.focus()
    }

    queueMicrotask(moveFocusInside)

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = getFocusableElements(dialog)

      if (!focusableElements.length) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null

      if (event.shiftKey && (activeElement === firstElement || activeElement === dialog)) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    function onFocusIn(event: FocusEvent) {
      const target = event.target

      if (!(target instanceof Node) || dialog.contains(target)) {
        return
      }

      moveFocusInside()
    }

    dialog.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)

    return () => {
      dialog.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)

      if (returnFocusRef.current?.isConnected) {
        returnFocusRef.current.focus()
      }
    }
  }, [initialFocusRef, isOpen])

  return dialogRef
}