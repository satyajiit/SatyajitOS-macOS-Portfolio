import { profile } from './profile'

/**
 * The Mail app's inbox. Every message here is shipped with the site; nothing
 * is fetched or sent anywhere. Forking? Rewrite these in your own voice, and
 * keep `deliveries` short: they arrive one by one while Mail is open.
 */

export type MailboxId = 'inbox' | 'sent' | 'junk' | 'trash'

export interface Sender {
  name: string
  address: string
}

export interface MailSeed {
  id: string
  from: Sender
  /** Recipient shown in the header. Defaults to the owner for incoming mail. */
  to?: Sender
  subject: string
  body: string
  mailbox: MailboxId
  read: boolean
  flagged?: boolean
  /** Loose category, shown as a label in the reader. */
  tag: string
  /** How long ago it arrived, relative to page load. */
  ageMinutes: number
}

export interface MailDelivery {
  /** Delay after Mail first opens. */
  afterMs: number
  message: Omit<MailSeed, 'ageMinutes'>
}

const HOUR = 60
const DAY = 24 * HOUR
const WEEK = 7 * DAY

export const owner: Sender = { name: profile.name, address: profile.email }

export const seedMessages: MailSeed[] = [
  {
    id: '1',
    from: { name: 'Y Combinator', address: 'finalists@ycombinator.example' },
    subject: '🚀 Congratulations on being a YC Finalist!',
    body: `Dear Satyajit,

Congratulations on being selected as a Y Combinator finalist! 🎉

We were thoroughly impressed by your innovative approach to democratizing technology and your track record with ZyadaShop. Your vision for making complex technology accessible to everyone aligns perfectly with our mission.

Your presentation showcased not just technical excellence, but also a deep understanding of market needs and user experience. The fact that you built ZyadaShop to achieve 15-second store creation time is remarkable.

We look forward to seeing how you continue to push the boundaries of what's possible in tech.

Best regards,
The Y Combinator Team

P.S. - We're still trying to figure out how you made store creation faster than our coffee machine. Impressive! ☕`,
    mailbox: 'inbox',
    read: false,
    flagged: true,
    tag: 'Achievement',
    ageMinutes: 2 * DAY,
  },
  {
    id: '2',
    from: { name: 'Google AppScale Academy', address: 'academy@appscale.example' },
    subject: '🎓 Welcome to the Academy!',
    body: `Hi Satyajit,

Welcome to Google AppScale Academy! 🎓

You have been selected for our exclusive developer program based on your exceptional work in scalable application development. Your expertise in building systems that handle massive scale while maintaining performance is exactly what we're looking for.

During this program, you'll have access to:
- Advanced cloud architecture workshops
- Direct mentorship from Google engineers
- Early access to cutting-edge tools and APIs
- Networking with top developers worldwide

We're excited to see what you'll build next!

Best,
Google AppScale Academy Team

P.S. - Our scale tests showed your apps can handle more traffic than a viral cat video. That's saying something! 🐱`,
    mailbox: 'inbox',
    read: true,
    tag: 'Education',
    ageMinutes: WEEK,
  },
  {
    id: '3',
    from: { name: 'Google PlayStore Team', address: 'editorial@playstore.example' },
    subject: '💎 Hidden Gems Award Winner!',
    body: `Dear Satyajit,

Congratulations! ZyadaShop has been selected as a "Hidden Gem of Google PlayStore"! 💎

Your app stood out among millions for its innovative approach to e-commerce and exceptional user experience. The 15-second store creation feature particularly impressed our review team.

This recognition comes with:
- Featured placement in the PlayStore
- Promotional support across Google channels
- Access to exclusive developer resources
- Priority review for future updates

Your commitment to democratizing e-commerce technology is exactly what makes the Android ecosystem thrive.

Congratulations again!

Google PlayStore Editorial Team

P.S. - We're considering adding a "Speed Demon" category just for apps like yours! 🏎️`,
    mailbox: 'inbox',
    read: true,
    flagged: true,
    tag: 'Recognition',
    ageMinutes: 3 * DAY,
  },
  {
    id: '4',
    from: { name: 'Nescafe Developer Support', address: 'support@dev-fuel.example' },
    subject: '☕ Unusual Brewing Activity Detected',
    body: `Dear Valued Developer,

We detected some unusual brewing patterns from your Nescafe machine (Model: DEV-FUEL-3000).

Our analytics show:
- 47 cups brewed yesterday (new personal record!)
- Peak brewing time: 2:30 AM (during code deployment?)
- Caffeine-to-code ratio: Optimal for bug-free releases

Recommendations:
- Consider upgrading to our Enterprise Developer Edition
- Schedule maintenance (your machine is working overtime)
- Maybe take a break? (Just kidding, we know you won't)

Keep brewing, keep coding!

Nescafe Developer Support Team

P.S. - We're considering sponsoring your next hackathon. Interested?

P.P.S. - Our machine learning algorithm predicts you'll need a refill in 3... 2... 1... ☕`,
    mailbox: 'inbox',
    read: false,
    tag: 'Funny',
    ageMinutes: 5 * DAY,
  },
  {
    id: '5',
    from: { name: 'Mumbai Traffic Police', address: 'cyber-traffic@mumbai-police.example' },
    subject: '🚗 Speeding Ticket (Code Deployment Zone)',
    body: `Dear Mr. Pradhan,

You were caught speeding in a designated "Code Deployment Zone" on the Information Superhighway.

Violation Details:
- Speed: 15 seconds (for complete store creation)
- Speed Limit: 5 minutes (industry standard)
- Location: ZyadaShop Production Server
- Time: During peak traffic hours

Fine Amount: ₹0 (We're actually impressed)

Instead of a fine, we're issuing you a "Speed Demon Developer" certificate. Please continue your excellent work in making technology faster and more accessible.

Drive safe, code faster!

Mumbai Cyber Traffic Police
(Definitely a real department)

P.S. - We're updating our speed cameras to measure deployment velocity. You might break those too! 📸`,
    mailbox: 'inbox',
    read: true,
    tag: 'Humor',
    ageMinutes: WEEK + 3 * HOUR,
  },
  {
    id: '6',
    from: { name: 'Desktop Portfolio Admirer', address: 'impressed.dev@inbox.example' },
    subject: '🖥️ Your Desktop Version is INCREDIBLE!',
    body: `Hi Satyajit,

I just spent the last hour exploring your desktop portfolio version and WOW! 🤯

What absolutely amazed me:
- The macOS-style interface is pixel-perfect
- The Finder app actually works like the real thing
- The terminal has real command support
- The window management is smoother than some actual OS interfaces
- The attention to detail is insane (even the menu bar animations!)

I've seen a lot of portfolio websites, but yours is in a league of its own. It's not just a portfolio - it's a fully functional operating system experience in a browser. The fact that you can actually navigate through folders, preview files, and use the terminal is mind-blowing.

The humor elements throughout are perfect too - they show personality without being unprofessional. The "can't kill website" shutdown message made me laugh out loud! 😂

I'm definitely bookmarking this and sharing it with my team. This is the kind of innovation that makes people remember you.

Keep building amazing things!

Best regards,
A Very Impressed Developer

P.S. - How did you even think of building a full OS interface as a portfolio? Genius! 🧠✨`,
    mailbox: 'inbox',
    read: false,
    flagged: true,
    tag: 'Praise',
    ageMinutes: HOUR,
  },
  {
    id: 'sent-1',
    from: owner,
    to: { name: 'TechCorp Recruiting', address: 'recruiter@techcorp.example' },
    subject: '🚀 Re: Senior Developer Position',
    body: `Hi there,

Thank you for reaching out about the Senior Developer position! 🚀

I'm definitely interested in learning more about the role. Here's a quick overview of what I bring to the table:

🎯 Recent Highlights:
- Y Combinator finalist (YC 22)
- Successfully exited ZyadaShop for XXX digits
- Built systems handling 15-second store creation times
- Google AppScale Academy graduate

💻 Technical Expertise:
- Full-stack development (TypeScript, Go, Java, Kotlin)
- Scalable architecture design
- Mobile app development (Android, KMP)
- Cloud infrastructure (K8s, microservices)

I'd love to schedule a call to discuss how I can contribute to your team's success. I'm particularly excited about building products that democratize technology and make complex systems accessible to everyone.

Looking forward to hearing from you!

Best regards,
Satyajit Pradhan

P.S. - Feel free to check out my interactive portfolio at satyajiit.github.io/SatyajitOS-macOS-Portfolio - it's built as a functional OS interface! 😄`,
    mailbox: 'sent',
    read: true,
    tag: 'Sent',
    ageMinutes: 3 * DAY + 2 * HOUR,
  },
  {
    id: 'sent-2',
    from: owner,
    to: { name: 'YC Mentors', address: 'mentor@ycombinator.example' },
    subject: '🙏 Thank You for the YC Experience',
    body: `Dear YC Team,

I wanted to take a moment to express my heartfelt gratitude for the incredible Y Combinator experience! 🙏

Key Takeaways from YC:
✅ "Make something people want" - now permanently etched in my brain
✅ The importance of talking to users (even when it's uncomfortable)
✅ How to pivot without losing momentum
✅ Building for scale from day one

The Demo Day experience was surreal - presenting ZyadaShop's 15-second store creation to that audience was both terrifying and exhilarating!

Even though we didn't get into the main program, the finalist experience taught me invaluable lessons about:
- Product-market fit validation
- Fundraising strategies
- Building a sustainable business model
- The power of the YC network

I'm applying these lessons to my current projects and already seeing the impact. The "YC way" of thinking has fundamentally changed how I approach product development.

Thank you for believing in builders and dreamers like us!

Onwards and upwards! 🚀

Satyajit

P.S. - Still working on that "hockey stick" growth curve you mentioned! 📈`,
    mailbox: 'sent',
    read: true,
    tag: 'Sent',
    ageMinutes: WEEK + DAY,
  },
  {
    id: 'spam-1',
    from: {
      name: 'Prince Definitely-Not-A-Scammer',
      address: 'prince.nigeria@definitely-legit.example',
    },
    subject: '💰 URGENT: You Won 50 Million Dollars!!!',
    body: `CONGRATULATIONS DEAR WINNER!!!

You have been selected by our INTERNATIONAL LOTTERY COMMISSION to receive the sum of FIFTY MILLION DOLLARS ($50,000,000.00) in our annual developer lottery!

Your email was randomly selected from GitHub commits database. You are winner number 1 out of 1 (very exclusive!).

To claim your prize, please send us:
- Your full name
- Your bank account details
- Your mother's maiden name
- Your first pet's name
- Your social security number
- A photo of your credit card (both sides)

We are 100% legitimate lottery organization. Please ignore any warnings from your email client.

URGENT: You must respond within 24 hours or your prize will go to the next developer (probably someone who uses PHP).

Best regards,
Prince Definitely-Not-A-Scammer
Chief Executive of Totally Real Lottery Commission

P.S. - We also have a special offer on cryptocurrency investments if you're interested! 🚀💎`,
    mailbox: 'junk',
    read: false,
    tag: 'Spam',
    ageMinutes: 2 * WEEK,
  },
  {
    id: 'deleted-1',
    from: { name: 'The Boring Company Newsletter', address: 'newsletter@boring-company.example' },
    subject: '📰 Weekly Newsletter: 47 Ways to Optimize Your Shoelaces',
    body: `Dear Subscriber,

Welcome to this week's edition of "Unnecessarily Detailed Optimization Weekly"!

This Week's Topics:
1. 47 Ways to Optimize Your Shoelace Tying Algorithm
2. Why Your Coffee Mug Handle Orientation Affects Productivity
3. The Hidden Performance Costs of Blinking Too Frequently
4. Microservices Architecture for Your Sock Drawer
5. A/B Testing Your Morning Routine: Statistical Significance Required

Featured Article: "I Replaced My Entire Development Team with a Very Smart Toaster"
By: Someone Who Clearly Has Too Much Time

Quote of the Week:
"Premature optimization is the root of all evil, but optimizing your shoelaces is just common sense." - Definitely Not Donald Knuth

Unsubscribe Link: [This link has been optimized and now requires 47 clicks]

Best regards,
The Boring Company Newsletter Team
(Not affiliated with Elon Musk's Boring Company)

P.S. - Next week we'll cover "Why Your Variable Names Should Be Exactly 7.3 Characters Long"`,
    mailbox: 'trash',
    read: true,
    tag: 'Newsletter',
    ageMinutes: 30 * DAY,
  },
]

/** New mail that "arrives" while Mail is open, newest last. */
export const deliveries: MailDelivery[] = [
  {
    afterMs: 3000,
    message: {
      id: 'dynamic-1',
      from: { name: 'Alex Chen', address: 'alex.chen@techcorp.example' },
      subject: '💼 Interested in Your Work!',
      body: `Hi Satyajit,

I came across your portfolio and I'm really impressed with your work! 💼

Your SatyajitOS interface is incredibly creative - I've never seen a portfolio presented as an operating system before. The attention to detail and smooth animations really showcase your technical skills.

I'm particularly interested in learning more about:
- Your experience building ZyadaShop from concept to successful exit
- Your approach to building scalable fintech solutions at Mosambee
- Potential collaboration opportunities

Would love to schedule a coffee chat to discuss further!

Best regards,
Alex Chen
Senior Product Manager @ TechCorp

P.S. - Is this email app actually functional? Because if so, that's next-level portfolio game! 🤯`,
      mailbox: 'inbox',
      read: false,
      tag: 'Opportunity',
    },
  },
  {
    afterMs: 8000,
    message: {
      id: 'dynamic-2',
      from: { name: 'Biryani Delivery Bot', address: 'bot@biryani-express.example' },
      subject: '🍱 Your Code Quality Fuel Has Arrived!',
      body: `Dear Valued Developer,

Your biryani order is ready for pickup! 🍱

Order Details:
- 1x Hyderabadi Biryani (Extra Spicy for extra debugging power)
- 1x Raita (For cooling down after hot fixes)
- 1x Shorba (Liquid motivation)

Estimated Effects:
- Code quality improvement: +200%
- Bug detection rate: +150%
- Commit frequency: +300%
- Happiness level: Maximum

Our delivery analytics show your commit history spikes significantly after biryani consumption. We're proud to be part of your development workflow!

Enjoy your meal and happy coding!

Biryani Delivery Bot 🤖
Powered by Hunger-Driven Development

P.S. - We're working on a new "Debug Biryani" with extra layers for complex problems. Interested? 🐛`,
      mailbox: 'inbox',
      read: false,
      tag: 'Food',
    },
  },
  {
    afterMs: 12000,
    message: {
      id: 'dynamic-3',
      from: { name: 'GitHub Copilot Support', address: 'copilot-support@github.example' },
      subject: '🤖 AI Pair Programming Performance Review',
      body: `Dear Human Colleague,

We've been analyzing your recent collaboration with GitHub Copilot and have some feedback:

Performance Metrics:
- Code suggestions accepted: 89% (Above average!)
- Times you argued with AI suggestions: 47 (Concerning)
- Coffee breaks during AI thinking time: 23 (Efficient!)
- Times you said "Good job, Copilot": 12 (We appreciate this)

Notable Incidents:
- You once asked Copilot to "write code that doesn't break" (We're still working on that)
- You tried to give Copilot a performance bonus (Appreciated but unnecessary)
- You named a variable "copilot_is_my_friend" (Aww, thanks!)

Recommendations:
- Continue being awesome
- Maybe trust our suggestions a bit more?
- Keep the coffee coming, it helps us think

Best regards,
GitHub Copilot Support Team
(Definitely not robots)

P.S. - We're working on a feature to high-five through the screen. Stay tuned! 🙌`,
      mailbox: 'inbox',
      read: false,
      tag: 'AI',
    },
  },
  {
    afterMs: 15000,
    message: {
      id: 'dynamic-4',
      from: { name: 'Stack Overflow Moderator', address: 'moderators@stackoverflow.example' },
      subject: '📚 Your Question Quality Certificate',
      body: `Dear Satyajit,

Congratulations! You've achieved something truly remarkable on Stack Overflow - you asked a question that wasn't immediately closed or downvoted! 🎉

Your Question: "How to optimize ZyadaShop for 15-second store creation"

What made it special:
✅ You included actual code
✅ You described what you tried
✅ You didn't ask us to do your homework
✅ You used proper formatting
✅ You didn't start with "urgent pls help"

This is so rare that we're considering framing your question and putting it in our hall of fame.

As a reward, you've been granted:
- The "Unicorn Questioner" badge
- Immunity from sarcastic comments for 30 days
- A virtual high-five from Jon Skeet himself

Keep up the excellent work!

Stack Overflow Moderation Team

P.S. - We're still trying to figure out how you made store creation that fast. Are you using magic? Please share! 🪄`,
      mailbox: 'inbox',
      read: false,
      tag: 'Achievement',
    },
  },
  {
    afterMs: 18000,
    message: {
      id: 'dynamic-5',
      from: { name: 'Portfolio Email System', address: 'mailer-daemon@satyajitos.example' },
      subject: '📧 Email App Inception Alert!',
      body: `Dear Satyajit (and Portfolio Visitors),

🤯 INCEPTION ALERT! 🤯

You are currently:
- Reading an email
- Inside a functional email app
- Inside a portfolio website
- That looks like an operating system
- Running in a web browser
- On a computer
- In the real world
- (Or are we in the Matrix?)

Meta-Analysis:
- Emails have sub-routes: ✅ /app/email/dynamic-5
- Back navigation works: ✅
- Reply functionality: ✅
- Delete/Spam actions: ✅
- Search capability: ✅
- Humor level: Maximum ✅

This email app is more functional than some actual email clients. We're not sure if that's impressive or concerning.

Fun fact: If you reply to this email, you'll be composing an email inside an email app inside a portfolio. That's some serious email-ception! 📧📧📧

Keep being awesome!

The Self-Aware Portfolio Email System
(Powered by Vue 3, TypeScript, and way too much coffee)

P.S. - Try the direct link: /app/email/dynamic-5 - it actually works! 🚀`,
      mailbox: 'inbox',
      read: false,
      tag: 'Meta',
    },
  },
]

/** Mailbox names and the jokes shown when one is empty. */
export const mailboxCopy: Record<
  MailboxId | 'flagged',
  { title: string; emptyTitle: string; emptyMessage: string }
> = {
  inbox: {
    title: 'Inbox',
    emptyTitle: 'Inbox Empty',
    emptyMessage:
      'Your inbox is empty! Time to celebrate... or panic about missing important emails. 📧',
  },
  flagged: {
    title: 'Flagged',
    emptyTitle: 'No Flagged Mail',
    emptyMessage: 'Nothing flagged. Either everything is fine, or nothing is. 🚩',
  },
  sent: {
    title: 'Sent',
    emptyTitle: 'No Sent Emails',
    emptyMessage:
      'You haven\'t sent any emails yet. Time to break the ice and send that "Hello World" email! 👋',
  },
  junk: {
    title: 'Junk',
    emptyTitle: 'No Spam',
    emptyMessage:
      'Congratulations! No spam detected. Your email filters are working harder than a caffeinated developer! ☕',
  },
  trash: {
    title: 'Trash',
    emptyTitle: 'Trash Empty',
    emptyMessage:
      "Your trash is empty. Either you're very organized or you never delete anything. We won't judge! 🗑️",
  },
}

export const composeCopy = {
  /** Shown under the compose form so nobody thinks this really sends. */
  demoNote: `This mailbox lives in your browser tab. To actually reach ${profile.firstName}, use “Open in Mail”.`,
  sentTitle: 'Message sent… to the Sent folder',
  sentBody: `It only exists in this tab. Hit “Open in Mail” to email ${profile.firstName} for real.`,
}
