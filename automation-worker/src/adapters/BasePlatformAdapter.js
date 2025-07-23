class BasePlatformAdapter {
  constructor() {
    this.page = null
    this.credentials = null
  }

  initialize(page, credentials) {
    this.page = page
    this.credentials = credentials
  }

  async login() {
    throw new Error('Login method must be implemented by platform adapter')
  }

  async applyToJob(jobDetails) {
    throw new Error('ApplyToJob method must be implemented by platform adapter')
  }

  async waitForRandomDelay(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min
    await this.page.waitForTimeout(delay)
  }

  async humanTypeText(element, text, delay = 100) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      await element.type(char)
      await this.page.waitForTimeout(delay + Math.random() * 50)
    }
  }

  async scrollRandomly() {
    const scrollAmount = Math.floor(Math.random() * 300) + 100
    await this.page.mouse.wheel(0, scrollAmount)
    await this.waitForRandomDelay(500, 1500)
  }
}

module.exports = BasePlatformAdapter
