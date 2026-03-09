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
        <p className="text-sm text-stone-400 mb-10">Last updated: March 9, 2026</p>

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
              Dreamboard is a gamified personal habit tracking application that uses game-like elements
              (such as experience points, levels, ranks, and AI-generated evaluations) for entertainment
              and self-motivation purposes. The Service is not a health, fitness, medical, wellness,
              therapeutic, or professional advisory program. The Service is provided on an &quot;as is&quot;
              and &quot;as available&quot; basis. We may modify, suspend, or discontinue the Service (or any
              part of it) at any time, with or without notice, and without liability to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">3. Eligibility and Minimum Age</h2>
            <p>
              You must be at least 18 years of age to use the Service. If you are between 13 and 17 years
              of age, you may only use the Service with the consent and supervision of a parent or legal
              guardian who agrees to be bound by these Terms on your behalf. By using the Service, you
              represent and warrant that you meet these age requirements. We do not knowingly collect
              information from or direct the Service to children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">4. Accounts and Authentication</h2>
            <p>
              You may sign in using a third-party authentication provider (such as Google). You are responsible
              for maintaining the security of your account credentials. You are solely responsible for all
              activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">5. User Data and Local Storage</h2>
            <p>
              Your game data (stats, activities, habits, and other progress) is primarily stored locally in
              your browser. We are not responsible for any loss of locally stored data, including but not
              limited to data loss caused by clearing your browser data, switching devices, or browser updates.
              You are encouraged to use the export feature to back up your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">6. User Content</h2>
            <p>
              You retain ownership of any content you submit to the Service (such as activity descriptions,
              vision board entries, and custom settings). By submitting content, you grant us a worldwide,
              royalty-free, non-exclusive license to use, reproduce, modify, and display such content solely
              for the purpose of operating and improving the Service. You are solely responsible for the
              accuracy, legality, and appropriateness of all content you submit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">7. AI-Generated Content</h2>
            <p>
              The Service uses artificial intelligence to generate responses, evaluations, suggestions,
              and challenges (including the &quot;Judge&quot; and &quot;Oracle&quot; features). You acknowledge
              and agree that:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                All AI-generated content &mdash; including XP awards, verdicts, challenges, side quests,
                vision board enhancements, and board readings &mdash; is provided solely for <strong>entertainment
                and self-motivation purposes</strong> and does not constitute advice, instructions, directives,
                recommendations, or commands to take any action in the real world.
              </li>
              <li>
                AI-generated challenges and side quests are <strong>optional suggestions for entertainment
                only</strong>. They are not instructions, prescriptions, or directives. You are under no
                obligation to attempt, complete, or follow any challenge, and you assume all risk if you
                choose to do so.
              </li>
              <li>
                We make no guarantees regarding the accuracy, completeness, safety, suitability, or
                appropriateness of AI-generated content. AI systems may produce incorrect, misleading,
                or inappropriate outputs.
              </li>
              <li>
                You should not rely on AI-generated content for medical, health, fitness, nutritional,
                psychological, financial, legal, or any other professional advice. Always consult a
                qualified professional before making decisions about your health, safety, or wellbeing.
              </li>
              <li>
                The XP amounts, stat categories, and evaluations assigned by the AI are arbitrary
                game metrics with no real-world significance. They do not reflect objective measurements
                of your activities, abilities, health, or fitness.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">8. Assumption of Risk and Voluntary Participation</h2>
            <p>
              You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>All real-world activities you undertake are entirely your own voluntary choice.</strong> The
                Service does not direct, control, supervise, monitor, or instruct your real-world behavior.
                Any activities you perform &mdash; whether or not you describe them to the Service or receive
                XP, feedback, or challenges related to them &mdash; are undertaken at your sole discretion and risk.
              </li>
              <li>
                You are solely responsible for determining whether any activity is safe, appropriate, legal,
                and within your physical, mental, and emotional capabilities. You should consult appropriate
                professionals (including physicians, trainers, therapists, or other qualified advisors) before
                engaging in any physical, health-related, or potentially risky activities.
              </li>
              <li>
                The Service is not a substitute for professional medical advice, diagnosis, treatment,
                therapy, counseling, or any other professional service. The stat categories
                (such as &quot;Strength,&quot; &quot;Vitality,&quot; &quot;Wisdom,&quot; and &quot;Spirit&quot;)
                are fictional game constructs and do not correspond to actual health, fitness, or
                psychological metrics.
              </li>
              <li>
                <strong>You assume all risk of injury, harm, loss, or damage</strong> &mdash; including
                physical, emotional, psychological, financial, or property damage &mdash; that may result
                from activities you choose to undertake, regardless of whether those activities were described
                to the Service, awarded XP, suggested by AI-generated challenges, or motivated by any
                gamification element of the Service.
              </li>
              <li>
                The gamification elements of the Service (including XP, levels, ranks, challenges, streaks,
                Power Points, and rewards) are designed for entertainment. They do not create any duty,
                obligation, expectation, or pressure to perform any real-world activity. You are free to
                use or ignore any aspect of the Service at any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">9. Health and Safety Disclaimer</h2>
            <p>
              <strong>THE SERVICE IS NOT A HEALTH, FITNESS, MEDICAL, NUTRITIONAL, THERAPEUTIC, OR WELLNESS
              PROGRAM.</strong> The Service does not provide medical advice, diagnoses, treatment plans,
              exercise prescriptions, dietary guidance, or mental health services. Features that reference
              health-adjacent concepts (such as &quot;Vitality,&quot; &quot;Strength,&quot; healthy habits,
              or daily damage tracking) are game mechanics for entertainment purposes only and are not
              clinical tools, health assessments, or behavioral prescriptions.
            </p>
            <p className="mt-3">
              If you have any medical condition, physical limitation, mental health concern, eating disorder,
              addiction, or other health-related issue, you should consult with a qualified healthcare
              professional before using the Service and before engaging in any activities you may describe
              to the Service. If you experience any adverse physical or mental health effects, discontinue
              use of the Service and seek professional help immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">10. Gamification Elements</h2>
            <p>
              The Service employs gamification elements including, but not limited to, experience points (XP),
              character levels, rank titles, stat categories, healthy habit tracking, daily damage tracking,
              Power Points, challenges, side quests, challenge chains, streaks, prizes, leaderboards, a virtual
              character (&quot;Skipper&quot;), equippable items, and AI-generated evaluations. You acknowledge
              and agree that:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                These elements are entertainment features with no real-world value, meaning, or significance
                beyond the Service. They do not constitute rewards, compensation, incentives, or consideration
                for any real-world action.
              </li>
              <li>
                No gamification element creates any obligation, duty, recommendation, or expectation for
                you to perform any real-world activity, maintain any streak, complete any challenge, or
                achieve any level or rank.
              </li>
              <li>
                The loss of streaks, points, levels, or other game progress &mdash; whether due to inactivity,
                data loss, or any other cause &mdash; does not entitle you to any compensation, remedy, or
                claim against us.
              </li>
              <li>
                You will not rely on gamification elements as motivation to engage in any activity that is
                unsafe, illegal, beyond your capabilities, or contrary to professional advice you have received.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">11. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to interfere with the proper functioning of the Service</li>
              <li>Circumvent any security measures of the Service</li>
              <li>Use automated means to access the Service without our permission</li>
              <li>Submit false, misleading, or fraudulent activity descriptions to manipulate XP or game progress</li>
              <li>Use the Service in any manner that could result in harm to yourself or others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">12. Intellectual Property</h2>
            <p>
              The Service, including all content, features, and functionality (excluding user content), is
              owned by Dreamboard and is protected by copyright, trademark, and other intellectual property
              laws. You may not copy, modify, distribute, or create derivative works from any part of the
              Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">13. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR
              OTHER HARMFUL COMPONENTS. WE SPECIFICALLY DISCLAIM ANY WARRANTY THAT AI-GENERATED CONTENT
              WILL BE ACCURATE, APPROPRIATE, SAFE, OR SUITABLE FOR ANY PURPOSE. WE MAKE NO REPRESENTATIONS
              OR WARRANTIES REGARDING THE SAFETY OR APPROPRIATENESS OF ANY ACTIVITY THAT YOU MAY CHOOSE TO
              UNDERTAKE, WHETHER OR NOT SUCH ACTIVITY IS DESCRIBED TO, EVALUATED BY, OR SUGGESTED BY THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">14. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DREAMBOARD, ITS OWNERS,
              OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUCCESSORS, OR ASSIGNS BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
              DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 uppercase text-xs sm:text-sm">
              <li>YOUR USE OF OR INABILITY TO USE THE SERVICE;</li>
              <li>ANY REAL-WORLD ACTIVITIES YOU CHOOSE TO UNDERTAKE, WHETHER OR NOT SUCH ACTIVITIES WERE DESCRIBED TO, EVALUATED BY, SUGGESTED BY, OR MOTIVATED BY THE SERVICE OR ANY OF ITS FEATURES;</li>
              <li>ANY INJURY, HARM, LOSS, OR DAMAGE (INCLUDING PHYSICAL, EMOTIONAL, PSYCHOLOGICAL, FINANCIAL, OR PROPERTY DAMAGE) ARISING FROM YOUR REAL-WORLD ACTIVITIES;</li>
              <li>ANY AI-GENERATED CONTENT, INCLUDING VERDICTS, XP AWARDS, CHALLENGES, SIDE QUESTS, ORACLE READINGS, OR OTHER OUTPUTS;</li>
              <li>YOUR RELIANCE ON ANY GAMIFICATION ELEMENT, AI OUTPUT, OR OTHER CONTENT PROVIDED BY THE SERVICE;</li>
              <li>ANY LOSS OF GAME DATA, PROGRESS, STREAKS, OR VIRTUAL ITEMS;</li>
              <li>ANY THIRD-PARTY CONDUCT OR CONTENT;</li>
            </ul>
            <p className="mt-3">
              REGARDLESS OF THE THEORY OF LIABILITY (WHETHER CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY,
              OR OTHERWISE), EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL
              AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE
              SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING
              THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100), WHICHEVER IS LESS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">15. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Dreamboard and its owners, officers, directors,
              employees, agents, affiliates, successors, and assigns from and against any and all claims,
              damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees
              and court costs) arising out of or related to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your use of the Service</li>
              <li>Any real-world activities you undertake, whether or not related to your use of the Service</li>
              <li>Any claim that the Service caused, encouraged, directed, incentivized, or contributed to any action you took or failed to take</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of a third party</li>
              <li>Any content you submit to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">16. Waiver of Behavioral Claims</h2>
            <p>
              By using the Service, you expressly waive and release any and all claims, causes of action,
              and demands against Dreamboard and its owners, officers, directors, employees, agents, and
              affiliates arising from or related to any allegation that the Service (including its gamification
              elements, AI-generated content, challenges, XP awards, habit tracking, damage tracking, or
              any other feature) caused, encouraged, incentivized, directed, pressured, influenced, or
              contributed to any decision you made or action you took or failed to take in the real world.
            </p>
            <p className="mt-3">
              You acknowledge that you are a voluntary user of the Service, that you exercise independent
              judgment in all decisions about your real-world activities, and that the Service does not
              have any control over, responsibility for, or duty of care regarding your conduct outside
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">17. Dispute Resolution</h2>
            <p>
              Any dispute, controversy, or claim arising from or relating to these Terms, the Service, or
              your use of the Service &mdash; including but not limited to claims related to personal injury,
              property damage, emotional distress, or any other harm allegedly caused by or related to the
              Service &mdash; shall be resolved through binding individual arbitration administered by the
              American Arbitration Association under its Consumer Arbitration Rules, except where prohibited
              by applicable law. You and Dreamboard each waive the right to a jury trial. You waive any
              right to participate in a class action lawsuit, class-wide arbitration, or any other
              representative or consolidated proceeding. The arbitrator&apos;s decision shall be final and
              binding and may be entered as a judgment in any court of competent jurisdiction. Either party
              may seek injunctive or equitable relief in any court of competent jurisdiction to prevent
              the actual or threatened infringement of intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">18. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective upon posting
              to the Service. Your continued use of the Service after changes are posted constitutes your
              acceptance of the modified Terms. It is your responsibility to review these Terms periodically.
              If you do not agree to any modified Terms, your sole remedy is to discontinue use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">19. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service at any time, for any reason or no reason,
              with or without notice. Upon termination, your right to use the Service ceases immediately. Any
              locally stored data remains on your device and is not affected by account termination. Sections
              7 through 16 (AI-Generated Content, Assumption of Risk, Health and Safety Disclaimer, Gamification
              Elements, Disclaimer of Warranties, Limitation of Liability, Indemnification, and Waiver of
              Behavioral Claims) shall survive any termination of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">20. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of
              California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">21. Severability</h2>
            <p>
              If any provision of these Terms is held to be unenforceable, the remaining provisions shall
              continue in full force and effect. The unenforceable provision shall be modified to the minimum
              extent necessary to make it enforceable while preserving its original intent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-700 mb-3">22. Entire Agreement</h2>
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
