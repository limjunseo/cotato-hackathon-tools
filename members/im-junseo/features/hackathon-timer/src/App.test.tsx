import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const at = (value: string) => new Date(`${value}:00+09:00`)

afterEach(() => {
  vi.useRealTimers()
})

function renderAt(value: string) {
  vi.useFakeTimers()
  vi.setSystemTime(at(value))
  return render(<App />)
}

describe('fixed timetable workflow', () => {
  it('counts down to the opening ceremony before the event', () => {
    renderAt('2026-07-10T18:00')

    expect(screen.getByText('HACKATHON STARTS IN')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '개회식' })).toBeInTheDocument()
    expect(screen.getByLabelText('남은 시간 0일 1시간 0분 0초')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '일정 설정 열기' })).not.toBeInTheDocument()
  })

  it('shows the active planning session and its ending time', () => {
    renderAt('2026-07-10T22:00')

    expect(screen.getByText('CURRENT SESSION')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '팀별 기획' })).toBeInTheDocument()
    expect(screen.getByLabelText('남은 시간 0일 1시간 0분 0초')).toBeInTheDocument()
    expect(screen.getByText('ENDS')).toBeInTheDocument()
    expect(screen.getByText('OFFICIAL TIMETABLE')).toBeInTheDocument()
  })

  it('switches to the critical submission state ten minutes before 01:00', () => {
    const { container } = renderAt('2026-07-11T00:55')

    expect(container.querySelector('main')).toHaveClass('app--critical')
    expect(screen.getByText('SUBMISSION DEADLINE')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '기획안 제출' })).toBeInTheDocument()
    expect(screen.getByLabelText('10분 전! 제출 확인!')).toBeInTheDocument()
    expect(screen.getByLabelText('남은 시간 0일 0시간 5분 0초')).toBeInTheDocument()
  })

  it('shows completion after the final cleanup session', () => {
    renderAt('2026-07-11T14:30')

    expect(screen.getByText('ALL SESSIONS COMPLETE')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '코커톤 종료' })).toBeInTheDocument()
    expect(screen.getByText('11개 일정 완료')).toBeInTheDocument()
  })
})
