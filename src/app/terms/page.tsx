import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Dreamboard",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-8"
        >
          &larr; Back to Dreamboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-stone-700 mb-2">Terms of Service</h1>
        <p className="text-sm text-stone-400 mb-10">Last updated: March 8, 2026</p>

        <div className="prose-stone space-y-8 text-sm sm:text-base text-stone-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Dreamboard (&quot;the Service&quot;), operated by Dreamboard (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
              you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">2. Description of Service</h2>
            <p>
              Dreamboard is a gamified personal habit tracking application. The Service is provided on an
              &quot;as is&quot; and &quot;as available&quot; basis. We may modify, suspend, or discontinue the Service
              (or any part of it) at any time, with or without notice, and without liability to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">3. Accounts and Authentication</h2>
            <p>
              You may sign in using a third-party authentication provider (such as Google). You are responsible
              for maintaining the security of your account credentials. You are solely responsible for all
              activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">4. User Data and Local Storage</h2>
            <p>
              Your game data (stats, activities, habits, and other progress) is primarily stored locally in
              your browser. We are not responsible for any loss of locally stored data, including but not
              limited to data loss caused by clearing your browser data, switching devices, or browser updates.
              You are encouraged to use the export feature to back up your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">5. User Content</h2>
            <p>
              You retain ownership of any content you submit to the Service (such as activity descriptions,
              vision board entries, and custom settings). By submitting content, you grant us a worldwide,
              royalty-free, non-exclusive license to use, reproduce, modify, and display such content solely
              for the purpose of operating and improving the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">6. AI-Generated Content</h2>
            <p>
              The Service uses artificial intelligence to generate responses, evaluations, and suggestions
              (including the &quot;Judge&quot; and &quot;Oracle&quot; features). AI-generated content is provided for
              entertainment and motivational purposes only. We make no guarantees regarding the accuracy,
              completeness, or appropriateness of AI-generated content, and you should not rely on it for
              medical, financial, legal, or other professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to interfere with the proper functioning of the Service</li>
              <li>Circumvent any security measures of the Service</li>
              <li>Use automated means to access the Service without our permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">8. Intellectual Property</h2>
            <p>
              The Service, including all content, features, and functionality (excluding user content), is
              owned by Dreamboard and is protected by copyright, trademark, and other intellectual property
              laws. You may not copy, modify, distribute, or create derivative works from any part of the
              Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR
              OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DREAMBOARD, ITS OFFICERS,
              DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE
              SERVICE, REGARDLESS OF THE THEORY OF LIABILITY. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED
              THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS
              ($100), WHICHEVER IS LESS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Dreamboard and its officers, directors,
              employees, and agents from any claims, damages, losses, liabilities, costs, or expenses
              (including reasonable attorneys&apos; fees) arising out of or related to your use of the Service,
              your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">12. Dispute Resolution</h2>
            <p>
              Any dispute arising from these Terms or your use of the Service shall be resolved through
              binding individual arbitration, except where prohibited by law. You waive any right to
              participate in a class action lawsuit or class-wide arbitration. The arbitration shall be
              conducted under the rules of the American Arbitration Association. Either party may seek
              injunctive relief in any court of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">13. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective upon posting
              to the Service. Your continued use of the Service after changes are posted constitutes your
              acceptance of the modified Terms. It is your responsibility to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">14. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service at any time, for any reason or no reason,
              with or without notice. Upon termination, your right to use the Service ceases immediately. Any
              locally stored data remains on your device and is not affected by account termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">15. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of
              California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">16. Severability</h2>
            <p>
              If any provision of these Terms is held to be unenforceable, the remaining provisions shall
              continue in full force and effect. The unenforceable provision shall be modified to the minimum
              extent necessary to make it enforceable while preserving its original intent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">17. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and
              Dreamboard regarding your use of the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
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
