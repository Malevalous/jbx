const BasePlatformAdapter = require('./BasePlatformAdapter')

class LinkedInAdapter extends BasePlatformAdapter {
  constructor() {
    super()
    this.baseUrl = 'https://www.linkedin.com'
  }

  async login() {
    try {
      await this.page.goto(`${this.baseUrl}/login`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      // Fill in credentials
      await this.page.fill('#username', this.credentials.email)
      await this.waitForRandomDelay()
      
      await this.page.fill('#password', this.credentials.password)
      await this.waitForRandomDelay()
      
      // Click login button
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
        this.page.click('button[type="submit"]')
      ])

      // Check if we need to handle 2FA or verification
      const currentUrl = this.page.url()
      if (currentUrl.includes('challenge') || currentUrl.includes('checkpoint')) {
        throw new Error('LinkedIn requires additional verification')
      }

      // Verify we're logged in
      await this.page.waitForSelector('[data-test-id="nav-primary-member-menu-trigger"]', { 
        timeout: 10000 
      })
      
      return { success: true, message: 'Successfully logged into LinkedIn' }
      
    } catch (error) {
      throw new Error(`LinkedIn login failed: ${error.message}`)
    }
  }

  async applyToJob(jobDetails) {
    try {
      // Navigate to job posting
      await this.page.goto(jobDetails.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      await this.waitForRandomDelay(2000, 4000)
      
      // Check if Easy Apply is available
      const easyApplyButton = await this.page.$('button[aria-label*="Easy Apply"]')
      if (!easyApplyButton) {
        throw new Error('Easy Apply not available for this job')
      }

      // Click Easy Apply
      await easyApplyButton.click()
      await this.waitForRandomDelay(2000, 4000)

      // Handle multi-step application process
      let currentStep = 1
      const maxSteps = 5

      while (currentStep <= maxSteps) {
        // Check if we're still in the application flow
        const modal = await this.page.$('[role="dialog"]')
        if (!modal) break

        // Fill form fields on current step
        await this.fillApplicationForm()
        
        // Look for Next or Submit button
        const nextButton = await this.page.$('button[aria-label="Continue"], button[aria-label="Submit application"], button:has-text("Submit")')
        if (!nextButton) break

        const buttonText = await nextButton.textContent()
        
        if (buttonText.toLowerCase().includes('submit')) {
          // Final submission
          await nextButton.click()
          await this.page.waitForSelector('[data-test-id="application-submitted"], .artdeco-inline-feedback--success', { 
            timeout: 10000 
          })
          break
        } else {
          // Continue to next step
          await nextButton.click()
          await this.waitForRandomDelay(1000, 2000)
          currentStep++
        }
      }

      return {
        success: true,
        appliedAt: new Date().toISOString(),
        method: 'Easy Apply',
        steps: currentStep
      }

    } catch (error) {
      throw new Error(`LinkedIn application failed: ${error.message}`)
    }
  }

  async fillApplicationForm() {
    // Fill common form fields if they exist
    const formFields = [
      { selector: 'input[name="phoneNumber"]', value: this.credentials.phone },
      { selector: 'input[name="firstName"]', value: this.credentials.firstName },
      { selector: 'input[name="lastName"]', value: this.credentials.lastName }
    ]

    for (const field of formFields) {
      try {
        const element = await this.page.$(field.selector)
        if (element && field.value) {
          await element.fill('')
          await this.humanTypeText(element, field.value)
        }
      } catch (error) {
        // Continue if field doesn't exist
        continue
      }
    }

    // Handle file uploads (resume)
    try {
      const resumeUpload = await this.page.$('input[type="file"]')
      if (resumeUpload && this.credentials.resumePath) {
        await resumeUpload.setInputFiles(this.credentials.resumePath)
        await this.waitForRandomDelay(2000, 4000)
      }
    } catch (error) {
      // Resume upload is optional
    }

    await this.waitForRandomDelay()
  }
}

module.exports = LinkedInAdapter
