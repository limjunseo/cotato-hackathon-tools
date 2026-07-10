import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('lucky potato draw', () => {
  it('shows the supported range and the default draw count', () => {
    const { container } = render(<App />)

    expect(screen.getByRole('heading', { name: /행운의 감자/ })).toBeInTheDocument()
    expect(screen.getByLabelText('추첨 개수 직접 입력')).toHaveValue(5)
    expect(screen.getByText('01—41')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '41명 출발시키기' })).toBeEnabled()
    expect(container.querySelectorAll('.potato-ball')).toHaveLength(41)
  })

  it('updates the count from a preset', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '7' }))

    expect(screen.getByLabelText('추첨 개수 직접 입력')).toHaveValue(7)
    expect(screen.getByRole('button', { name: '7' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clamps direct count input to the 1 through 41 range', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('추첨 개수 직접 입력'), { target: { value: '99' } })

    expect(screen.getByLabelText('추첨 개수 직접 입력')).toHaveValue(41)
  })

  it('locks the controls and shows the race countdown after starting', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '41명 출발시키기' }))

    expect(screen.getByRole('status', { name: '3, 2, 1, 땅!' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '출발 준비 중...' })).toBeDisabled()
    expect(screen.getByLabelText('추첨 개수 직접 입력')).toBeDisabled()
  })

  it('removes specific numbers from the next race and restores them individually', () => {
    const { container } = render(<App />)

    fireEvent.change(screen.getByLabelText('제외할 번호 입력'), {
      target: { value: '3, 8 21' },
    })
    fireEvent.click(screen.getByRole('button', { name: '제외 추가' }))

    expect(screen.getByRole('button', { name: '3번 제외 취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '8번 제외 취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '21번 제외 취소' })).toBeInTheDocument()
    expect(screen.getByText('3명 제외 · 38명 참가')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '38명 출발시키기' })).toBeInTheDocument()
    expect(container.querySelectorAll('.potato-ball')).toHaveLength(38)

    fireEvent.click(screen.getByRole('button', { name: '8번 제외 취소' }))

    expect(screen.queryByRole('button', { name: '8번 제외 취소' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('.potato-ball')).toHaveLength(39)
  })

  it('provides music and browser fullscreen controls', () => {
    const requestFullscreen = vi.fn(() => Promise.resolve())
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    })
    render(<App />)

    const musicButton = screen.getByRole('button', { name: 'BGM 끄기' })
    expect(musicButton).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(musicButton)
    expect(screen.getByRole('button', { name: 'BGM 켜기' })).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByRole('button', { name: '전체화면으로 보기' }))
    expect(requestFullscreen).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: '전체화면 종료' })).toBeInTheDocument()

    delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen
  })
})
