import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('portal', () => {
  it('shows member lanes and the registered timer card', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '임준서' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '박현정' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '김기민' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '해커톤 타이머' })).toBeInTheDocument()
  })

  it('directs the timer card to its feature route', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '기능 실행' }))

    expect(window.location.pathname).toBe('/features/hackathon-timer')
    expect(await screen.findByRole('button', { name: '기능 목록으로 돌아가기' })).toBeInTheDocument()
  })
})
