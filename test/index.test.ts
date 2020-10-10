import { fabric } from 'fabric'

describe('object export events', () => {
  it('should not have installed any extensions yet', () => {
    expect(fabric.util.installedExtensions).toBe(undefined)
  })
})
