import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WinnerCelebration } from './WinnerCelebration'

describe('WinnerCelebration', () => {
  it('shows the selected potatoes prominently in finish order', () => {
    const onClose = vi.fn()
    const participants = Array.from({ length: 41 }, (_, index) => index + 1)

    render(
      <WinnerCelebration
        participants={participants}
        winners={[8, 21, 3]}
        onClose={onClose}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '8번 감자' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '21번 감자' })).toBeInTheDocument()
    expect(screen.getByText('#8')).toBeInTheDocument()
    expect(screen.getByText('#21')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '결과 닫기' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
