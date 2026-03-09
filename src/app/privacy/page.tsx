import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Dreamboard",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-8"
        >
          &larr; Back to Dreamboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-stone-700 mb-2">Privacy Policy</h1>
        <p className="text-sm text-stone-400 mb-10">Last updated: March 9, 2026</p>

        <div className="prose-stone space-y-8 text-sm sm:text-base text-stone-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">1. Introduction</h2>
            <p>
              Dreamboard (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Dreamboard application
              at dreamboard.net (&quot;the Service&quot;). This Privacy Policy explains how we collect, use,
              and protect your information when you use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">2. Information We Collect</h2>

            <h3 className="text-base font-medium text-stone-700 mt-4 mb-2">Information you provide</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account information from your Google sign-in (name, email address, profile picture)</li>
              <li>Content you submit to the Service (activity descriptions, vision board entries, custom settings)</li>
            </ul>

            <h3 className="text-base font-medium text-stone-700 mt-4 mb-2">Information collected automatically</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Usage analytics (page views, feature interactions, session data)</li>
              <li>Device and browser information</li>
            </ul>

            <h3 className="text-base font-medium text-stone-700 mt-4 mb-2">Information stored locally</h3>
            <p>
              The majority of your game data (stats, XP, habits, activities, inventory, vision board, and
              other progress) is stored in your browser&apos;s local storage and is not transmitted to our
              servers unless you use features that require server processing (such as AI evaluations).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">3. Health and Activity Information Disclaimer</h2>
            <p>
              The Service allows you to describe real-world activities in free-text form for gamification
              purposes. These descriptions may incidentally include information about physical activities,
              exercise habits, dietary choices, mental health practices, or other health-adjacent topics.
              <strong> We are not a healthcare provider, covered entity under HIPAA, or health data
              processor.</strong> Activity descriptions you submit are treated as general user content,
              not as protected health information (PHI), medical records, or clinical data.
            </p>
            <p className="mt-2">
              Healthy habit tracking and daily damage tracking features record simple boolean data
              (completed/not completed per day) for gamification purposes. This data does not constitute
              health monitoring, medical tracking, or clinical assessment. You should not use the Service
              as a substitute for medical record-keeping or health monitoring tools recommended by a
              healthcare professional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">4. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Process AI-powered features (the Judge and Oracle use your submitted text to generate responses)</li>
              <li>Analyze usage patterns to improve the user experience</li>
              <li>Communicate with you about the Service</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-2">
              We do not use your activity descriptions, habit data, or other personal content for
              advertising, profiling, or sale to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">5. AI Processing and Third-Party Services</h2>
            <p>
              The Service uses third-party AI providers to power its evaluation and creative features.
              When you use these features, your submitted content is sent to external APIs for processing:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Anthropic (Claude)</strong> &mdash; Powers the AI Judge feature. Your activity
                descriptions and conversation messages are sent to Anthropic&apos;s API for evaluation.
                Anthropic may retain this data in accordance with their privacy policy and data
                retention practices.
              </li>
              <li>
                <strong>OpenAI</strong> &mdash; Powers AI image generation for the Vision Board and serves
                as a fallback for the Judge feature. Activity descriptions, vision board text, and image
                prompts may be sent to OpenAI&apos;s API. OpenAI may retain this data in accordance with
                their privacy policy.
              </li>
              <li>
                <strong>Google OAuth</strong> &mdash; Handles authentication. Governed by Google&apos;s
                Privacy Policy.
              </li>
              <li>
                <strong>Supabase</strong> &mdash; Stores account profile data (name, email, authentication
                identifiers).
              </li>
              <li>
                <strong>Vercel</strong> &mdash; Hosts the Service and its infrastructure.
              </li>
            </ul>
            <p className="mt-3">
              <strong>Important:</strong> When you submit text to AI-powered features, that text is
              transmitted to third-party servers outside our direct control. We cannot guarantee how
              these third parties store, process, or retain your data beyond their published policies.
              Do not submit sensitive personal information, protected health information, financial
              account details, or other confidential data to AI-powered features. These third parties
              have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">6. Data Retention</h2>
            <p>
              Account data is retained for as long as your account is active or as needed to provide the
              Service. Locally stored game data persists until you clear your browser data or manually delete
              it. Analytics data may be retained in aggregate form indefinitely for product improvement purposes.
              Data sent to third-party AI providers is subject to their respective retention policies.
              You may request deletion of your account data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">7. Data Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your information.
              However, no method of electronic transmission or storage is completely secure, and we cannot
              guarantee absolute security. You use the Service at your own risk. We are not responsible
              for unauthorized access to locally stored data on your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing of your data</li>
              <li>Data portability (export your data)</li>
            </ul>
            <p className="mt-2">
              The Service provides a built-in data export feature that allows you to download your game data
              at any time. To exercise other rights, contact us at the email below. Please note that we cannot
              delete data that has already been transmitted to third-party AI providers &mdash; you must contact
              those providers directly regarding data held in their systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              The Service is intended for users who are at least 18 years of age, or between 13 and 17 with
              parental consent. We do not knowingly collect personal information from children under 13. If
              you believe a child under 13 has provided us with personal information, please contact us
              and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">10. Cookies and Tracking</h2>
            <p>
              The Service uses essential cookies for authentication and session management. We use
              analytics tools to understand how the Service is used. We do not use advertising cookies
              or sell data to advertisers. You can control cookie settings through your browser preferences,
              though disabling essential cookies may prevent you from using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own,
              including the United States. By using the Service, you consent to the transfer of your
              information to the United States and other jurisdictions where our service providers operate.
              These jurisdictions may have data protection laws that differ from those in your country.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be effective upon posting
              to the Service. Your continued use of the Service after changes are posted constitutes your
              acceptance of the updated policy. We encourage you to review this policy periodically.
              If you do not agree to any changes, your sole remedy is to discontinue use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">13. California Privacy Rights</h2>
            <p>
              If you are a California resident, you may have additional rights under the California Consumer
              Privacy Act (CCPA), including the right to know what personal information we collect, the right
              to delete your personal information, and the right to opt out of the sale of personal information.
              We do not sell your personal information. To exercise your California privacy rights, contact
              us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your data rights,
              please contact us at{" "}
              <a href="mailto:hello@dreamboard.net" className="underline underline-offset-2 hover:text-stone-800 transition-colors">
                hello@dreamboard.net
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
