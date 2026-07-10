import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('hackathon awards', () => {
  afterEach(() => vi.useRealTimers())

  it('reveals third, second, first, then the final top three in order', () => {
    const { container } = render(<App />)

    expect(screen.getByRole('heading', { name: /FINAL AWARDS/ })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: ' ' })
    expect(screen.getByText('THIRD PLACE')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '3등 팀' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('SECOND PLACE')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.getByText('FIRST PLACE')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '1등 팀' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByRole('heading', { name: /OUR TOP 3/ })).toBeInTheDocument()
    expect(screen.getByText('₩ 150,000')).toBeInTheDocument()
    expect(container.querySelectorAll('.potato-mascot__neck-medal')).toHaveLength(3)
  })

  it('saves team names and prizes before revealing the awards', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '수상 정보 설정' }))

    expect(screen.getByRole('dialog', { name: '수상 정보 설정' })).toBeInTheDocument()
    expect(screen.getByLabelText('1등 상금')).toHaveValue(150_000)
    expect(screen.getByLabelText('2등 상금')).toHaveValue(100_000)
    expect(screen.getByLabelText('3등 상금')).toHaveValue(50_000)

    fireEvent.change(screen.getByLabelText('1등 팀 이름'), { target: { value: '금빛 감자팀' } })
    fireEvent.change(screen.getByLabelText('2등 팀 이름'), { target: { value: '은빛 감자팀' } })
    fireEvent.change(screen.getByLabelText('3등 팀 이름'), { target: { value: '구운 감자팀' } })
    fireEvent.click(screen.getByRole('button', { name: '설정 저장' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.keyDown(window, { key: ' ' })
    expect(screen.getByRole('heading', { name: '구운 감자팀' })).toBeInTheDocument()
    expect(window.localStorage.getItem('cotato.hackathonAwards.settings')).toContain('금빛 감자팀')
  })

  it('supports previous-stage navigation and keeps the sequence within its bounds', () => {
    render(<App />)

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByRole('heading', { name: /FINAL AWARDS/ })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByRole('heading', { name: /FINAL AWARDS/ })).toBeInTheDocument()
  })

  it('resets only after R is held long enough', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'r' })
    expect(screen.getByRole('status')).toHaveTextContent('R을 계속 누르면')

    act(() => vi.advanceTimersByTime(900))
    expect(screen.getByRole('heading', { name: /FINAL AWARDS/ })).toBeInTheDocument()
  })

  it('requests browser fullscreen mode', () => {
    const requestFullscreen = vi.fn(() => Promise.resolve())
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '전체화면으로 보기' }))
    expect(requestFullscreen).toHaveBeenCalledOnce()

    delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen
  })
})
