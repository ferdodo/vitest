import { describe, expect, test } from 'vitest'
import { runVitest } from '../../test-utils'

describe('default reporter', async () => {
  test('normal', async () => {
    const { stdout } = await runVitest({
      include: ['b1.test.ts', 'b2.test.ts'],
      root: 'fixtures/default',
      reporters: 'none',
    })

    expect(stdout).contain('✓ b2 passed > b2 test')
    expect(stdout).not.contain('✓ nested b1 test')
    expect(stdout).contain('× b1 failed > b failed test')
  })

  test('show full test suite when only one file', async () => {
    const { stdout } = await runVitest({
      include: ['a.test.ts'],
      root: 'fixtures/default',
      reporters: 'none',
    })

    expect(stdout).contain('✓ a passed > a1 test')
    expect(stdout).contain('✓ a passed > nested a > nested a3 test')
    expect(stdout).contain('× a failed > a failed test')
    expect(stdout).contain('nested a failed 1 test')
  })

  test('rerun should undo', async () => {
    const { vitest } = await runVitest({
      root: 'fixtures/default',
      watch: true,
      testNamePattern: 'passed',
      reporters: 'none',
    })

    // one file
    vitest.write('p')
    await vitest.waitForStdout('Input filename pattern')
    vitest.write('a')
    await vitest.waitForStdout('a.test.ts')
    vitest.write('\n')
    await vitest.waitForStdout('Filename pattern: a')
    await vitest.waitForStdout('Waiting for file changes...')

    expect(vitest.stdout).contain('✓ a passed > a1 test')
    expect(vitest.stdout).contain('✓ a passed > nested a > nested a3 test')

    // rerun and two files
    vitest.write('p')
    await vitest.waitForStdout('Input filename pattern')
    vitest.write('b\n')
    await vitest.waitForStdout('Waiting for file changes...')
    expect(vitest.stdout).toContain('✓ b1.test.ts')
    expect(vitest.stdout).toContain('✓ b2.test.ts')
    expect(vitest.stdout).not.toContain('✓ nested b1 test')
    expect(vitest.stdout).not.toContain('✓ b1 test')
    expect(vitest.stdout).not.toContain('✓ b2 test')
  })

  test('doesn\'t print error properties', async () => {
    const result = await runVitest({
      root: 'fixtures/error-props',
      reporters: 'default',
      env: { CI: '1' },
    })

    expect(result.stderr).not.toContain(`Serialized Error`)
    expect(result.stderr).not.toContain(`status: 'not found'`)
  })
}, 120000)
