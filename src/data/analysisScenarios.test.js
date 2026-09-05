import { describe, expect, it } from 'vitest'
import { getAnalysisScenario, selectScenarioForInput } from './analysisScenarios.js'

describe('selectScenarioForInput', () => {
  it('uses a medium-confidence scenario for a plate with partial identity data', () => {
    expect(selectScenarioForInput({ method: 'plate', plate: 'ABCD12' })).toBe('medium')
  })

  it('uses a high-confidence scenario when the vehicle description is complete', () => {
    expect(selectScenarioForInput({ method: 'filters', version: 'Configuración', year: '2022', mileage: '35000' })).toBe('high')
  })

  it('uses a low-confidence scenario when important filter details are missing', () => {
    expect(selectScenarioForInput({ method: 'filters', version: '', year: '', mileage: '' })).toBe('low')
  })

  it('routes known demo failure fixtures to explainable states', () => {
    expect(selectScenarioForInput({ method: 'link', publicationUrl: 'https://example.test/retirada' })).toBe('unavailable')
    expect(selectScenarioForInput({ method: 'plate', plate: 'ABCD10' })).toBe('insufficient')
  })
})

describe('getAnalysisScenario', () => {
  it('falls back safely when an unknown scenario is requested', () => {
    expect(getAnalysisScenario('unknown').id).toBe('medium')
  })
})
