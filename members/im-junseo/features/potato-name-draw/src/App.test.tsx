import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('potato name draw', () => {
  it('validates the participant count before entering READY', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /추첨 준비/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('참가자 이름을 입력해주세요.')

    await user.type(screen.getByLabelText(/이름을 쉼표/), '혼자')
    await user.click(screen.getByRole('button', { name: /추첨 준비/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('최소 2명이 필요합니다.')
  })

  it('allows editing names from the READY screen', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText(/이름을 쉼표/), '감자A, 감자B, 감자C')
    await user.click(screen.getByRole('button', { name: /추첨 준비/ }))

    expect(screen.getByText('3 POTATOES ARE READY!')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '이름 수정' }))
    expect(screen.getByLabelText(/이름을 쉼표/)).toHaveValue('감자A, 감자B, 감자C')
  })

  it('locks two winners and keeps the completed result visible', async () => {
    vi.useFakeTimers()
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      const values = array as Uint32Array
      values[0] = 0
      return array
    })

    render(<App />)
    fireEvent.change(screen.getByLabelText(/이름을 쉼표/), { target: { value: '감자A, 감자B, 감자C' } })
    fireEvent.click(screen.getByRole('button', { name: /추첨 준비/ }))
    fireEvent.click(screen.getByRole('button', { name: /추첨 시작/ }))
    fireEvent.click(screen.getByRole('button', { name: /뽑기!/ }))

    expect(screen.getByText('행운의 감자를 찾는 중...')).toBeInTheDocument()
    await act(async () => { vi.advanceTimersByTime(1700) })
    await act(async () => { vi.advanceTimersByTime(1700) })
    await act(async () => { vi.advanceTimersByTime(1700) })
    expect(screen.getByText('LUCKY POTATOES')).toBeInTheDocument()
    expect(screen.getByText('오늘의 행운의 감자 2명!')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /다시|재추첨|다음 추첨/ })).not.toBeInTheDocument()
  })
})
