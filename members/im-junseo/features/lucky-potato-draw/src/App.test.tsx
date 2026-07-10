import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
})
