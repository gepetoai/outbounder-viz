import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - 248.ai',
  description: 'Privacy Policy for 248 | Recruiter Connector Chrome extension and related services'
}

export default function PrivacyPolicyPage () {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-[#1C1B20] mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">1. Introduction</h2>
            <p className="text-foreground leading-relaxed">
              248.ai (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chrome extension &quot;248 | Recruiter Connector&quot; and related services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the extension.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-[#1C1B20] mt-6 mb-3">2.1 LinkedIn Authentication Cookies</h3>
            <p className="text-foreground leading-relaxed mb-4">
              To connect your LinkedIn account to our service, our extension accesses the following authentication cookies stored in your browser when you are logged into LinkedIn:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li><strong>li_at cookie:</strong> LinkedIn authentication token required for account connection</li>
              <li><strong>li_a cookie:</strong> LinkedIn Recruiter/Sales Navigator authentication token (if available and if you have a premium LinkedIn account)</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              These cookies are only accessed from LinkedIn domains (.linkedin.com) and are used solely for authentication purposes. We do not access, read, or modify any other cookies from your browser or any other websites.
            </p>

            <h3 className="text-xl font-semibold text-[#1C1B20] mt-6 mb-3">2.2 Browser Information</h3>
            <p className="text-foreground leading-relaxed mb-4">
              When you use our Chrome extension, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li><strong>User Agent:</strong> Your browser&apos;s user agent string, which is required for proper authentication with LinkedIn&apos;s systems</li>
              <li><strong>Extension Version:</strong> For support and troubleshooting purposes</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#1C1B20] mt-6 mb-3">2.3 Account Information</h3>
            <p className="text-foreground leading-relaxed mb-4">
              When you connect your LinkedIn account, we may receive and store:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>Profile picture URL</li>
              <li>First name and last name (if provided by LinkedIn)</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              This information is stored locally in your browser and is also transmitted to our backend servers to maintain your account connection.
            </p>

            <h3 className="text-xl font-semibold text-[#1C1B20] mt-6 mb-3">2.4 What We Do NOT Collect</h3>
            <p className="text-foreground leading-relaxed mb-4">
              Our extension does NOT collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Your browsing history</li>
              <li>Page content from websites you visit</li>
              <li>URLs of pages you visit (except for LinkedIn authentication)</li>
              <li>Contact information from web pages</li>
              <li>Any data from websites other than LinkedIn authentication cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Connect your LinkedIn account to the 248 | Recruiter service</li>
              <li>Maintain your account connection and enable automatic reconnection if needed</li>
              <li>Periodically sync authentication cookies (every 30 minutes) to ensure your account connection remains active</li>
              <li>Display your profile information (name, picture) in the extension interface</li>
              <li>Provide, operate, and maintain our extension and services</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect, prevent, and address technical issues and security vulnerabilities</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">4. Data Storage and Security</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h3 className="text-xl font-semibold text-[#1C1B20] mt-6 mb-3">4.1 Local Storage</h3>
            <p className="text-foreground leading-relaxed mb-4">
              The following information is stored locally in your browser using Chrome&apos;s local storage API:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>Your account ID</li>
              <li>Profile picture URL</li>
              <li>First name and last name</li>
              <li>Last sync timestamp</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              This data remains on your device and is not accessible to other extensions or websites.
            </p>

            <h3 className="text-xl font-semibold text-[#1C1B20] mt-6 mb-3">4.2 Backend Storage</h3>
            <p className="text-foreground leading-relaxed mb-4">
              Your authentication cookies and user agent are transmitted securely (HTTPS) to our backend servers hosted by DigitalOcean. This data is:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>Encrypted in transit using HTTPS</li>
              <li>Stored securely on our servers</li>
              <li>Used exclusively for maintaining your LinkedIn account connection</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>With your consent:</strong> When you explicitly agree to share your information</li>
              <li><strong>Service providers:</strong> With trusted third-party service providers who assist us in operating our extension and services (e.g., hosting providers like DigitalOcean)</li>
              <li><strong>Legal requirements:</strong> When required by law, court order, or governmental authority</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Protection of rights:</strong> To protect our rights, property, or safety, or that of our users or others</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              We do not share your LinkedIn authentication cookies with any third parties except as necessary to provide our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">6. Third-Party Services</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Our extension integrates with:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li><strong>LinkedIn:</strong> We access LinkedIn authentication cookies to connect your account. LinkedIn&apos;s privacy practices are governed by their own privacy policy.</li>
              <li><strong>Unipile:</strong> Our backend service may integrate with Unipile for LinkedIn account management. This integration is handled server-side and does not expose your data to additional third parties.</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before using our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">7. Data Retention</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We retain your information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Specifically:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>Authentication cookies are retained as long as your account is connected</li>
              <li>Account information is retained until you disconnect your account</li>
              <li>When you disconnect your account, we will delete your stored authentication data</li>
              <li>Local storage data can be cleared by disconnecting through the extension</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">8. Your Rights and Choices</h2>
            <p className="text-foreground leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li><strong>Disconnect:</strong> You can disconnect your LinkedIn account at any time through the extension, which will stop the collection and syncing of cookies</li>
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Data portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent by disconnecting your account</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              To exercise these rights, please contact us using the information provided below or disconnect your account through the extension interface.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-foreground leading-relaxed">
              Our extension is not intended for use by children under the age of 13 (or 16 in the European Economic Area). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">10. International Data Transfers</h2>
            <p className="text-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We take appropriate safeguards to ensure your information remains protected in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">11. California Privacy Rights (CCPA)</h2>
            <p className="text-foreground leading-relaxed mb-4">
              If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>The right to know what personal information we collect, use, and disclose</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>The right to non-discrimination for exercising your CCPA rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">12. European Privacy Rights (GDPR)</h2>
            <p className="text-foreground leading-relaxed mb-4">
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have certain rights under the General Data Protection Regulation (GDPR), including those outlined in Section 8 above. Our legal basis for processing your information includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li><strong>Consent:</strong> When you connect your LinkedIn account, you provide explicit consent for us to access and use your authentication cookies</li>
              <li><strong>Contract:</strong> When processing is necessary to perform the service you have requested</li>
              <li><strong>Legal obligation:</strong> When we must comply with legal requirements</li>
              <li><strong>Legitimate interests:</strong> When processing is in our legitimate business interests and does not override your rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes. Your continued use of our extension after changes are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">14. Cookie Policy</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Our extension accesses LinkedIn authentication cookies (li_at and li_a) stored in your browser when you are logged into LinkedIn. These cookies are:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>Read from your browser&apos;s cookie storage (only from .linkedin.com domains)</li>
              <li>Transmitted securely (HTTPS) to our backend servers</li>
              <li>Used exclusively for connecting your LinkedIn account to the 248 | Recruiter service</li>
              <li>Synced periodically (every 30 minutes) to maintain your account connection</li>
              <li>Not shared with any third parties except as necessary to provide our service</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              We do not access, read, or modify any other cookies from your browser. The extension only accesses cookies from LinkedIn domains (.linkedin.com).
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              You can disconnect your account at any time through the extension, which will stop the collection and syncing of these cookies. Disconnecting will also clear locally stored account information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1C1B20] mt-8 mb-4">15. Contact Us</h2>
            <p className="text-foreground leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-foreground font-semibold mb-2">248.ai</p>
              <p className="text-foreground mb-2">
                <strong>Email:</strong> <a href="mailto:uzair.qarni@248.ai" className="text-primary hover:underline">uzair.qarni@248.ai</a>
              </p>
              <p className="text-foreground">
                <strong>Address:</strong> 151 10th street, San Francisco, California, United States
              </p>
            </div>
            <p className="text-foreground leading-relaxed mt-4">
              We will respond to your inquiry within 30 days.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

