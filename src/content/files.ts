/**
 * The virtual file system behind Finder (desktop) and Files (phone).
 *
 * Folders hold items; an item with `kind: 'folder'` opens the folder with the
 * same id (or shows an empty/locked state when there is none). Everything a
 * preview shows lives in `preview` blocks so both apps render the same file
 * the same way. File kind (icon, "Kind" column) is derived from the name.
 */

export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray'

/** Generated artwork for image and video files (drawn in apps/finder/components/ImageArt.vue). */
export type ArtName = 'napkin' | 'screenshot' | 'meme-first-try' | 'meme-meeting' | 'meme-startup' | 'exit-dance'

export type PreviewBlock =
  | { type: 'heading'; title: string; subtitle?: string }
  | { type: 'stats'; items: { value: string; label: string }[] }
  | {
      type: 'bars'
      title: string
      max: number
      unit: string
      rows: { label: string; value: number; note?: string }[]
    }
  | { type: 'compare'; columns: { title: string; rows: { label: string; value: string }[] }[] }
  | { type: 'section'; title: string; body: string }
  | { type: 'text'; body: string; mono?: boolean; language?: string }
  | { type: 'art'; art: ArtName; caption?: string }

export interface FileEntry {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: string
  modified?: string
  description?: string
  /** "Pro tip" shown on hover and in Get Info. */
  tooltip?: string
  tags?: string[]
  /** "Insider info" in Get Info. */
  insight?: string
  /** One-liner under the Quick Look preview. */
  quip?: string
  /** Short teaser used by the phone's list rows. */
  excerpt?: string
  /** What Quick Look and the phone preview render, top to bottom. */
  preview?: PreviewBlock[]
  /** Opening it fails with this error instead of opening (it is that kind of file). */
  opensWith?: 'notFound' | 'permission'
}

export interface FolderEntry {
  id: string
  name: string
  path: string
  description?: string
  items: FileEntry[]
  /** Opening this folder shows a permission error instead of its contents. */
  locked?: boolean
}

/** Saved-search folders: their contents are computed from every file on disk. */
export interface SmartFolder {
  id: string
  name: string
  description: string
  match: { names?: string[]; tags?: string[]; extensions?: string[] }
}

export const HOME = '/Users/satyajit'

export const folders: FolderEntry[] = [
  {
    id: 'home',
    name: 'satyajit',
    path: HOME,
    description: 'Home, sweet (over-caffeinated) home',
    items: [],
  },
  {
    id: 'desktop',
    name: 'Desktop',
    path: `${HOME}/Desktop`,
    description: 'Where productivity goes to die',
    items: [
      {
        id: 'coffee-addiction-stats',
        name: 'Coffee_Addiction_Stats.csv',
        type: 'file',
        size: '2.3 MB',
        modified: '2 hours ago',
        description: 'Detailed analysis of my caffeine dependency',
        tooltip: 'Warning: May cause existential crisis about coffee consumption',
        tags: ['data', 'health', 'addiction', 'productivity'],
        insight:
          "This file contains detailed analysis of my caffeine dependency. Spoiler alert: It's worse than you think.",
        quip: 'Warning: May cause existential crisis about caffeine dependency',
        excerpt:
          'Daily coffee consumption analysis showing strong correlation between caffeine intake and code quality...',
        preview: [
          {
            type: 'heading',
            title: 'Coffee Addiction Analysis',
            subtitle: 'Scientific data on caffeine dependency patterns and productivity correlation',
          },
          {
            type: 'stats',
            items: [
              { value: '1,247', label: 'Total Cups This Year' },
              { value: '12', label: 'Max Cups in One Day' },
              { value: '847%', label: 'Productivity Increase' },
            ],
          },
          {
            type: 'bars',
            title: 'Daily Coffee Consumption',
            max: 15,
            unit: 'cups',
            rows: [
              { label: 'Mon', value: 8, note: '😴' },
              { label: 'Tue', value: 12, note: '🚀' },
              { label: 'Wed', value: 6, note: '😐' },
              { label: 'Thu', value: 10, note: '💪' },
              { label: 'Fri', value: 15, note: '🔥' },
              { label: 'Sat', value: 4, note: '😌' },
              { label: 'Sun', value: 7, note: '☕' },
            ],
          },
          {
            type: 'text',
            mono: true,
            language: 'CSV',
            body: `Date,Cups,Productivity,Sanity Level,Comments
2024-01-15,7,High,Questionable,"Feeling good"
2024-01-16,12,Godlike,Gone,"WHO NEEDS SLEEP?"
2024-01-17,3,None,Returning,"Withdrawal symptoms"`,
          },
          {
            type: 'stats',
            items: [
              { value: '6.2', label: 'Cups/Day' },
              { value: '94%', label: 'Productivity' },
              { value: '+67%', label: 'Code Quality' },
              { value: '142', label: 'Post-Coffee IQ' },
            ],
          },
          {
            type: 'text',
            body: `☕ COFFEE ADDICTION ANALYSIS ☕

📊 Daily Statistics:
• Average cups per day: 6.2
• Peak consumption: 11 AM & 3 PM
• Productivity correlation: 94%
• Code quality improvement: +67%

⏰ Brewing Preferences:
• Optimal brewing time: 4 minutes
• Favorite blend: Ethiopian single origin
• Backup blend: Whatever's available
• Emergency protocol: Instant coffee (dark times)

🧠 Cognitive Effects:
• Pre-coffee IQ: 85
• Post-coffee IQ: 142
• Debugging ability: +200%
• Meeting tolerance: +50%

⚠️ Warning: Withdrawal symptoms include existential crisis and inability to center divs.`,
          },
        ],
      },
      {
        id: 'how-i-sold-my-soul',
        name: 'How_I_Sold_My_Soul_To_Success.docx',
        type: 'file',
        size: '666 KB',
        modified: 'Yesterday',
        description: 'The entrepreneurial journey in all its glory',
        tooltip: 'Spoiler alert: It was worth it',
        tags: ['entrepreneurship', 'success', 'soul-selling', 'wisdom'],
        insight:
          'A comprehensive guide to entrepreneurship, including the exact moment I traded sleep for success.',
        preview: [
          {
            type: 'text',
            body: `Chapter 1: The Napkin Sketch

It all started with a simple idea and a coffee-stained napkin...

[Content continues for 247 pages of entrepreneurial wisdom]`,
          },
        ],
      },
      {
        id: 'work-life-balance',
        name: 'Work_Life_Balance.404',
        type: 'file',
        size: '0 bytes',
        modified: 'Never',
        description: 'File not found... just like my work-life balance',
        tooltip: 'This file has been missing since 2019',
        tags: ['missing', 'balance', 'life', 'work'],
        insight: 'This file has been corrupted since 2019. Attempts to restore have failed.',
        quip: 'Last seen: Never',
        opensWith: 'notFound',
        preview: [
          { type: 'heading', title: 'Error 404: Work-Life Balance Not Found' },
          {
            type: 'text',
            body: `Error 404: Work-Life Balance Not Found

This file has been missing since 2019.
Last seen: Somewhere between "just one more feature" and "quick bug fix"

If found, please return immediately.
Reward: A full night's sleep and a weekend without work emails.

Status: Still searching...
Hope Level: Cautiously optimistic
Coffee Dependency: Maximum`,
          },
        ],
      },
      {
        id: 'yc-application-v47',
        name: 'YC_Application_v47_Final_FINAL.docx',
        type: 'file',
        size: '4.2 MB',
        modified: '3 months ago',
        description: 'Y Combinator application - attempt #47',
        tooltip: 'This time it will definitely work! (Famous last words)',
        tags: ['yc', 'application', 'startup', 'hope'],
        preview: [
          {
            type: 'heading',
            title: 'Y Combinator Application v47',
            subtitle: 'The application that made it to YC 2022 Finals',
          },
          {
            type: 'section',
            title: 'Company Description',
            body: "ZyadaShop is a no-code e-commerce platform that enables anyone to create a fully functional online store in just 15 seconds. We've helped over 50,000 businesses go digital with zero commission fees, because merchants deserve to keep all their money.",
          },
          {
            type: 'stats',
            items: [
              { value: '38,000+', label: 'Stores Created' },
              { value: '49,000+', label: 'Orders Processed' },
              { value: '4.8/5 ⭐', label: 'App Rating' },
              { value: '0% 🎉', label: 'Commission' },
            ],
          },
          {
            type: 'section',
            title: 'The Vision',
            body: '"Democratize e-commerce. Make it so simple that anyone can start selling online in the time it takes to make coffee. No technical knowledge required, no hidden fees, just pure entrepreneurial freedom."',
          },
        ],
      },
      {
        id: 'zyada-shop-exit-story',
        name: 'ZyadaShop_8_Digit_Exit_Story.md',
        type: 'file',
        size: '1.8 MB',
        modified: '6 months ago',
        description: 'The epic tale of selling ZyadaShop',
        tooltip: '50,000+ businesses helped, 8-digit exit achieved, happiness level: maximum',
        tags: ['exit', 'success', 'zyada-shop', 'celebration'],
        preview: [
          {
            type: 'heading',
            title: 'ZyadaShop_8_Digit_Exit_Story.md',
            subtitle: 'The epic tale of an 8-digit exit',
          },
        ],
      },
      {
        id: 'mosambee-innovations',
        name: 'Mosambee_Product_Innovations.pptx',
        type: 'file',
        size: '12.4 MB',
        modified: '1 week ago',
        description: 'Latest fintech innovations at Mosambee',
        tooltip:
          'Leading fintech product strategy with a team as passionate as a hackathon squad on Red Bull',
        tags: ['fintech', 'innovation', 'mosambee', 'product'],
        preview: [
          { type: 'heading', title: 'Mosambee Product Innovation Pipeline', subtitle: 'Latest fintech product innovations' },
          {
            type: 'text',
            body: `Current Projects:
1. AI-Powered Payment Analytics
2. Merchant Dashboard 2.0
3. Real-time Fraud Detection
4. Cross-border Payment Solutions

Team Energy Level: Red Bull Hackathon Squad
Innovation Rate: Maximum Overdrive
Coffee Consumption: Industrial Scale

Next Sprint: Revolutionizing fintech, one feature at a time! 💳`,
          },
        ],
      },
      {
        id: 'f1-drs-watch-face',
        name: 'F1_DRS_Zone_Watch_Face.sketch',
        type: 'file',
        size: '8.9 MB',
        modified: '2 weeks ago',
        description: 'F1-inspired watch face design',
        tooltip: 'For when you need to know if DRS is available while checking the time',
        tags: ['f1', 'design', 'watch', 'drs'],
        preview: [
          { type: 'heading', title: 'F1 DRS Zone Watch Face Design' },
          {
            type: 'text',
            body: `Features:
- Real-time DRS availability indicator
- Lap time display with sector splits
- Tire compound indicator
- Weather conditions
- Next race countdown

Design Philosophy:
"Why just tell time when you can know if DRS is available?"

Current Status: Awaiting Series A funding for smartwatch startup 🏎️`,
          },
        ],
      },
      {
        id: 'biryani-code-correlation',
        name: 'Biryani_vs_Code_Commits_Analysis.xlsx',
        type: 'file',
        size: '3.1 MB',
        modified: '1 day ago',
        description: 'Scientific analysis of biryani impact on productivity',
        tooltip: 'Spoiler: Code commits spike after biryani consumption',
        tags: ['biryani', 'productivity', 'analysis', 'food'],
        preview: [
          {
            type: 'heading',
            title: 'Biryani vs Code Commits Analysis',
            subtitle: 'Scientific proof that biryani fuels innovation',
          },
          {
            type: 'compare',
            columns: [
              {
                title: 'Pre-Biryani Performance',
                rows: [
                  { label: 'Avg Commits/Day', value: '3.2' },
                  { label: 'Code Quality', value: 'Meh' },
                  { label: 'Motivation Level', value: 'Low' },
                ],
              },
              {
                title: 'Post-Biryani Performance',
                rows: [
                  { label: 'Avg Commits/Day', value: '12.7' },
                  { label: 'Code Quality', value: 'Godlike' },
                  { label: 'Motivation Level', value: 'Maximum' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'zyada-shop-folder',
        name: 'ZyadaShop Legacy',
        type: 'folder',
        description: 'The 8-digit exit that changed everything',
        tooltip: 'Contains memories, code, and a lot of pride',
      },
      {
        id: 'side-projects-folder',
        name: 'Side Projects That Actually Worked',
        type: 'folder',
        description: 'Plot twist: Some of them did!',
        tooltip: 'Rare species in the wild',
      },
    ],
  },
  {
    id: 'downloads',
    name: 'Downloads',
    path: `${HOME}/Downloads`,
    description: 'Digital hoarding at its finest',
    items: [
      {
        id: 'random-pdf-1',
        name: 'Definitely_Important_PDF_I_Will_Read_Someday.pdf',
        type: 'file',
        size: '15.7 MB',
        modified: '3 months ago',
        tooltip: 'Spoiler: You will never read this',
      },
      {
        id: 'screenshot-chaos',
        name: 'Screenshot_2024_01_15_at_3_47_23_AM.png',
        type: 'file',
        size: '2.1 MB',
        modified: '2 weeks ago',
        tooltip: 'One of 847 screenshots with cryptic names',
        preview: [{ type: 'art', art: 'screenshot', caption: 'Captured at 3:47 AM. Nobody knows why.' }],
      },
      {
        id: 'installer-graveyard',
        name: 'app_installer_final_v2_FINAL_USE_THIS_ONE.dmg',
        type: 'file',
        size: '127 MB',
        modified: '1 month ago',
        tooltip: 'The naming convention of desperation',
      },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    path: `${HOME}/Documents`,
    description: 'Where important stuff pretends to be organized',
    items: [
      {
        id: 'business-plan',
        name: 'Next_Unicorn_Business_Plan_v47.docx',
        type: 'file',
        size: '4.2 MB',
        modified: 'Last week',
        tooltip: 'Version 47 because perfection takes time',
        excerpt:
          'Revolutionary business plan to disrupt industries with innovative synergistic solutions...',
        preview: [
          {
            type: 'stats',
            items: [
              { value: '47', label: 'Versions' },
              { value: '$1T', label: 'Market Size' },
              { value: '∞', label: 'Optimism Level' },
            ],
          },
          {
            type: 'text',
            body: `🦄 NEXT UNICORN BUSINESS PLAN v47 🦄

Executive Summary:
We're going to disrupt [insert industry] with [buzzword] technology using [another buzzword] methodology.

Market Analysis:
- Total Addressable Market: $1 Trillion (source: trust me bro)
- Competition: None (we're first to think of this)
- Moat: Very deep, possibly infinite

Product:
It's like Uber but for [random thing]. Think Netflix meets Airbnb but for [another random thing].

Revenue Model:
1. Freemium (free forever, premium never)
2. Ads (but ethical ones)
3. Data (but we respect privacy)
4. Magic

Funding Required: $50M (for office snacks and ping pong tables)
Exit Strategy: IPO or acquisition by Google/Meta/Amazon

Version History:
v1-v46: Various levels of delusion
v47: Peak optimism achieved`,
          },
        ],
      },
      {
        id: 'meeting-notes',
        name: 'Meeting_Notes_That_Could_Have_Been_An_Email.txt',
        type: 'file',
        size: '847 bytes',
        modified: 'Today',
        tooltip: 'The eternal struggle of corporate life',
        quip: 'The eternal struggle of corporate life',
        excerpt:
          'Notes from meetings that could have been emails, featuring circular discussions and action items...',
        preview: [
          {
            type: 'text',
            mono: true,
            language: 'Plain Text',
            body: `# Meeting Notes - Could Have Been An Email

Attendees: Everyone who didn't need to be there
Duration: 2 hours (could have been 5 minutes)
Outcome: Another meeting scheduled`,
          },
          {
            type: 'text',
            body: `📝 MEETING NOTES 📝

Meeting: "Quick sync" (lasted 2 hours)
Attendees: Too many
Could have been an email: ✓

Agenda:
1. Discuss the discussion about discussing things
2. Circle back on circling back
3. Touch base about touching base
4. Synergize the synergy

Decisions made: 0
Action items: "We'll follow up"
Next meeting: Tomorrow (to discuss this meeting)

Key takeaways:
- We need more meetings
- Someone should do something
- It's complicated
- Let's table this for now

Status: Still confused but with more steps`,
          },
          {
            type: 'section',
            title: 'Meeting: Project Status Update',
            body: `Date: Today
Time: Too long

Key Points:
- Project is behind schedule (as usual)
- Need more resources (always)
- Deadline is unrealistic (obviously)
- Will schedule another meeting to discuss (inevitably)

Action Items:
- Schedule follow-up meeting
- Create more detailed timeline
- Pray to the demo gods`,
          },
        ],
      },
      {
        id: 'bug-report-template',
        name: 'Bug_Report_Template.md',
        type: 'file',
        size: '1.2 KB',
        modified: 'Last month',
        tooltip: 'Works on my machine™',
        excerpt:
          'Standard template for reporting bugs that mysteriously work in development but fail in production...',
        preview: [
          {
            type: 'text',
            body: `🐛 BUG REPORT TEMPLATE 🐛

Steps to reproduce:
1. Write perfect code
2. Test locally (works fine)
3. Deploy to production
4. Watch everything break
5. Blame the intern
6. Realize it was your fault
7. Fix in 2 minutes
8. Pretend it was a complex issue

Expected behavior: Code works
Actual behavior: Chaos and despair

Environment:
- Browser: The one that hates me
- OS: Probably Windows
- Time: Always 3 AM
- Coffee level: Dangerously low

Priority: URGENT (because everything is urgent)`,
          },
        ],
      },
      {
        id: 'resume-collection',
        name: 'Resume_Collection_For_When_Startup_Life_Gets_Too_Real',
        type: 'folder',
        tooltip: 'Emergency backup plan',
      },
    ],
  },
  {
    id: 'coffee-addiction',
    name: 'Coffee Stats',
    path: `${HOME}/Coffee_Analytics`,
    description: 'Scientific analysis of my fuel consumption',
    items: [
      {
        id: 'daily-intake',
        name: 'Daily_Caffeine_Intake_2024.xlsx',
        type: 'file',
        size: '8.9 MB',
        modified: '1 hour ago',
        tooltip: 'Updated every cup. Yes, really.',
      },
      {
        id: 'coffee-shop-reviews',
        name: 'Coffee_Shop_Reviews_By_WiFi_Quality.md',
        type: 'file',
        size: '12.3 KB',
        modified: 'Yesterday',
        tooltip: 'Priorities: WiFi > Coffee > Ambiance',
      },
      {
        id: 'productivity-correlation',
        name: 'Productivity_vs_Coffee_Correlation_Study.pdf',
        type: 'file',
        size: '3.7 MB',
        modified: '3 days ago',
        tooltip: 'Spoiler: Strong positive correlation',
      },
    ],
  },
  {
    id: 'memes',
    name: 'Work Memes',
    path: `${HOME}/Memes/Work`,
    description: 'Coping mechanisms in image format',
    items: [
      {
        id: 'debugging-meme',
        name: 'When_Code_Works_On_First_Try.jpg',
        type: 'file',
        size: '420 KB',
        modified: '2 days ago',
        tooltip: 'Rarest phenomenon in programming',
        preview: [{ type: 'art', art: 'meme-first-try' }],
      },
      {
        id: 'meeting-meme',
        name: 'This_Meeting_Could_Have_Been_A_Slack_Message.png',
        type: 'file',
        size: '1.2 MB',
        modified: 'Today',
        tooltip: 'Daily mood',
        preview: [{ type: 'art', art: 'meme-meeting' }],
      },
      {
        id: 'startup-life',
        name: 'Startup_Life_Expectations_vs_Reality.gif',
        type: 'file',
        size: '5.6 MB',
        modified: 'Last week',
        tooltip: 'The eternal startup struggle',
        preview: [{ type: 'art', art: 'meme-startup' }],
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    path: `${HOME}/Projects`,
    description: 'Everything I have ever started (and a few things I finished)',
    items: [],
  },
  {
    id: 'zyada-shop-folder',
    name: 'ZyadaShop Legacy',
    path: `${HOME}/Projects/ZyadaShop`,
    description: 'The 8-digit exit that changed everything',
    items: [
      {
        id: 'business-plan-v1',
        name: 'Original_Business_Plan_Napkin_Sketch.jpg',
        type: 'file',
        size: '2.1 MB',
        modified: '3 years ago',
        description: 'Where it all began',
        tooltip: 'Literally drawn on a napkin at a coffee shop',
        insight: 'The napkin that started it all. Still has coffee stains from that fateful day.',
        quip: 'Version 47 because perfection takes time',
        preview: [
          { type: 'art', art: 'napkin', caption: 'Revolutionary Business Plan v47 - This time it will work!' },
          {
            type: 'section',
            title: 'Executive Summary',
            body: 'We will revolutionize the coffee industry by creating a blockchain-based coffee tracking system that uses AI to predict optimal brewing times.',
          },
          {
            type: 'section',
            title: 'Market Analysis',
            body: 'The global coffee market is worth $100+ billion. Our target market is coffee enthusiasts who also happen to be crypto enthusiasts (estimated 12 people worldwide).',
          },
          {
            type: 'section',
            title: 'Financial Projections',
            body: `Year 1: $0 revenue (building MVP)
Year 2: $1M revenue (optimistic)
Year 3: $1B revenue (very optimistic)
Year 4: Acquired by Google for $10B (extremely optimistic)`,
          },
        ],
      },
      {
        id: 'first-prototype',
        name: 'First_Prototype_That_Actually_Worked.apk',
        type: 'file',
        size: '15.7 MB',
        modified: '2.5 years ago',
        description: 'The miracle app',
        tooltip: 'Held together with duct tape and prayers',
        excerpt: 'The prototype that launched a thousand businesses and somehow actually worked...',
        preview: [
          {
            type: 'stats',
            items: [
              { value: '50K+', label: 'Businesses' },
              { value: '8-digit', label: 'Exit' },
              { value: '100%', label: 'Miracle' },
            ],
          },
          {
            type: 'text',
            body: `📱 FIRST PROTOTYPE NOTES 📱

Status: IT ACTUALLY WORKS! 🎉

Technical Debt Level: Astronomical
Code Quality: Held together with duct tape and prayers
Documentation: "The code is self-documenting" (it's not)

Features:
✅ Basic functionality
✅ Crashes gracefully
✅ Confuses users effectively
❌ Scalability
❌ Security
❌ Common sense

Known Issues:
- Works only on developer's machine
- Requires specific moon phase
- May cause existential crisis
- Definitely violates several design principles

Next Steps:
1. Celebrate that it works
2. Never touch the code again
3. Build entire company around this prototype
4. Hope for the best

Note: This prototype launched 50,000+ businesses. Sometimes miracles happen.`,
          },
        ],
      },
      {
        id: 'yc-application',
        name: 'YC_Application_Draft_47_FINAL_FINAL.pdf',
        type: 'file',
        size: '3.2 MB',
        modified: '2 years ago',
        description: 'The golden ticket',
        tooltip: 'Version 47 because perfection takes iterations',
      },
      {
        id: 'exit-celebration',
        name: 'Exit_Celebration_Dance.mp4',
        type: 'file',
        size: '127 MB',
        modified: '1 year ago',
        description: 'Victory dance footage',
        tooltip: 'Warning: Contains excessive happiness',
        preview: [{ type: 'art', art: 'exit-dance', caption: 'Warning: Contains excessive happiness' }],
      },
      {
        id: 'lessons-learned',
        name: 'What_I_Learned_Building_ZyadaShop.md',
        type: 'file',
        size: '47 KB',
        modified: '6 months ago',
        description: 'Wisdom gained',
        tooltip: 'Mostly about coffee consumption and sleep deprivation',
      },
    ],
  },
  {
    id: 'side-projects-folder',
    name: 'Side Projects That Actually Worked',
    path: `${HOME}/Projects/SideProjects`,
    description: 'Plot twist: Some of them did!',
    items: [
      {
        id: 'gamex-wallpaper',
        name: 'GameX_Wallpaper_App',
        type: 'folder',
        description: 'Because everyone needs cool wallpapers',
        tooltip: 'Made during a gaming marathon',
      },
      {
        id: 'cardsx-app',
        name: 'CardsX_Secure_Storage',
        type: 'folder',
        description: 'Your wallet will thank you',
        tooltip: 'Built after losing my credit card for the 5th time',
      },
      {
        id: 'xenon-checker',
        name: 'XenonChecker_AI_Exam_Tool',
        type: 'folder',
        description: 'AI meets exam papers',
        tooltip: 'Because grading is for humans... or is it?',
      },
      {
        id: 'pwa-converter',
        name: 'PWA_to_Native_Converter',
        type: 'folder',
        description: 'Turn websites into apps like magic',
        tooltip: 'Not actual magic, just really good code',
      },
      {
        id: 'play-store-stats',
        name: 'Play_Store_Stats_Viewer',
        type: 'folder',
        description: 'Know your app stats without crying',
        tooltip: 'Emotional support for developers',
      },
    ],
  },
  {
    id: 'failed-experiments',
    name: 'Failed Experiments',
    path: `${HOME}/Projects/Failed`,
    description: 'The graveyard of good intentions',
    items: [
      {
        id: 'ai-girlfriend',
        name: 'AI_Girlfriend_For_Developers.py',
        type: 'file',
        size: '404 KB',
        modified: '1 year ago',
        description: 'She only talked about bugs',
        tooltip: "Relationship status: It's complicated with code",
        insight: 'She was supposed to understand me, but she only talked about syntax errors.',
      },
      {
        id: 'automatic-coffee',
        name: 'Automatic_Coffee_Maker_IoT.ino',
        type: 'file',
        size: '12 KB',
        modified: '8 months ago',
        description: 'Almost burned down the office',
        tooltip: 'Fire department was not amused',
        insight: 'Almost achieved the dream of automated caffeine delivery. Fire department disagrees.',
      },
      {
        id: 'mind-reading-app',
        name: 'Mind_Reading_App_For_Product_Managers.js',
        type: 'file',
        size: '1 KB',
        modified: '6 months ago',
        description: "Still can't read their minds",
        tooltip: 'Requirements still change daily',
      },
      {
        id: 'procrastination-blocker',
        name: 'Procrastination_Blocker_App',
        type: 'folder',
        description: 'Ironically never finished',
        tooltip: 'The irony is not lost on me',
      },
    ],
  },
  {
    id: 'future-unicorns',
    name: 'Future Unicorns',
    path: `${HOME}/Projects/FutureUnicorns`,
    description: 'These projects will definitely make me rich... someday',
    items: [
      {
        id: 'blockchain-coffee',
        name: 'Blockchain_Coffee_Tracking.sol',
        type: 'file',
        size: '8.5 KB',
        modified: '3 months ago',
        description: 'Track every coffee bean on the blockchain',
        tooltip: 'Because coffee needs decentralization',
        insight: 'Every coffee bean tracked on the blockchain. Because why not?',
        quip: 'Because coffee needs decentralization',
        preview: [
          {
            type: 'text',
            mono: true,
            language: 'Solidity',
            body: `pragma solidity ^0.8.0;

contract CoffeeTracker {
    mapping(address => uint256) public coffeeCups;

    function drinkCoffee() public {
        coffeeCups[msg.sender]++;
        // Because every cup matters on the blockchain
    }
}`,
          },
        ],
      },
      {
        id: 'ai-meme-generator',
        name: 'AI_Meme_Generator_For_Startups',
        type: 'folder',
        description: 'Disrupting the meme industry',
        tooltip: 'Series A funding pending',
        quip: 'Disrupting the meme industry, one joke at a time',
      },
      {
        id: 'quantum-todo',
        name: 'Quantum_Todo_List.qasm',
        type: 'file',
        size: '2.7 KB',
        modified: '1 month ago',
        description: 'Tasks exist in superposition until observed',
        tooltip: "Schrödinger's productivity",
      },
      {
        id: 'metaverse-office',
        name: 'Metaverse_Office_For_Remote_Work',
        type: 'folder',
        description: 'Virtual reality meets productivity',
        tooltip: 'Still figuring out virtual coffee breaks',
      },
    ],
  },
  {
    id: 'mosambee-magic',
    name: 'Mosambee Magic',
    path: `${HOME}/Work/Mosambee`,
    description: 'Current fintech adventures',
    items: [
      {
        id: 'product-strategy',
        name: 'Product_Strategy_2024_Confidential.pptx',
        type: 'file',
        size: '25.3 MB',
        modified: 'Yesterday',
        description: 'Top secret fintech plans',
        tooltip: 'If you can see this, you have clearance',
      },
      {
        id: 'innovation-lab',
        name: 'Innovation_Lab_Experiments',
        type: 'folder',
        description: 'Where fintech magic happens',
        tooltip: 'Results may vary, side effects include excitement',
      },
      {
        id: 'team-building',
        name: 'Team_Building_Ideas_That_Dont_Suck.md',
        type: 'file',
        size: '15 KB',
        modified: '1 week ago',
        description: 'Revolutionary team building concepts',
        tooltip: 'No trust falls included',
      },
    ],
  },
  // Folders that exist but will not let you in
  {
    id: 'resume-collection',
    name: 'Resume_Collection_For_When_Startup_Life_Gets_Too_Real',
    path: `${HOME}/Documents/Resume_Collection_For_When_Startup_Life_Gets_Too_Real`,
    description: 'Emergency backup plan',
    items: [],
    locked: true,
  },
  {
    id: 'innovation-lab',
    name: 'Innovation_Lab_Experiments',
    path: `${HOME}/Work/Mosambee/Innovation_Lab_Experiments`,
    description: 'Where fintech magic happens',
    items: [],
    locked: true,
  },
]

export const smartFolders: SmartFolder[] = [
  {
    id: 'screenshots',
    name: 'Screenshots',
    description: 'Screenshots of screenshots... the developer way 📸',
    match: { extensions: ['png', 'jpg', 'jpeg', 'gif'] },
  },
  {
    id: 'code-graveyard',
    name: 'Code Graveyard',
    description: 'Where good code goes to rest... and bad code goes to hide 💻',
    match: { extensions: ['py', 'js', 'ts', 'sol', 'ino', 'qasm', 'apk'] },
  },
  {
    id: 'yc-journey',
    name: 'YC Journey',
    description: 'YC 2022 Finalist memories - Top 1% of startups worldwide! 🏆',
    match: { names: ['yc_'], tags: ['yc'] },
  },
  {
    id: 'fintech-innovations',
    name: 'Fintech Innovations',
    description: 'Leading product strategy with passionate hackathon energy! 💳',
    match: { names: ['mosambee', 'fintech', 'product_strategy'], tags: ['fintech'] },
  },
]

/** Finder tags: a colour and the file tags it collects. */
export const tags: { color: TagColor; name: string; matches: string[] }[] = [
  { color: 'red', name: 'Hope', matches: ['hope'] },
  { color: 'orange', name: 'Productivity', matches: ['productivity'] },
  { color: 'yellow', name: 'Success', matches: ['success', 'celebration'] },
  { color: 'green', name: 'Fintech', matches: ['fintech', 'mosambee'] },
  { color: 'blue', name: 'Design', matches: ['design', 'f1'] },
  { color: 'purple', name: 'Startup', matches: ['startup', 'yc', 'entrepreneurship', 'exit'] },
  { color: 'gray', name: 'Missing', matches: ['missing'] },
]

/** Sidebar layout, shared by Finder's sidebar and Files' Browse screen. */
export const sidebar = {
  favorites: [
    { id: 'desktop', name: 'Desktop' },
    { id: 'downloads', name: 'Downloads' },
    { id: 'documents', name: 'Documents' },
    { id: 'coffee-addiction', name: 'Coffee Stats' },
    { id: 'memes', name: 'Work Memes' },
    { id: 'screenshots', name: 'Screenshots' },
    { id: 'code-graveyard', name: 'Code Graveyard' },
  ],
  projects: [
    { id: 'zyada-shop-folder', name: 'ZyadaShop Legacy' },
    { id: 'mosambee-magic', name: 'Mosambee Magic' },
    { id: 'side-projects-folder', name: 'Side Projects' },
    { id: 'failed-experiments', name: 'Failed Experiments' },
    { id: 'future-unicorns', name: 'Future Unicorns' },
    { id: 'yc-journey', name: 'YC Journey' },
    { id: 'fintech-innovations', name: 'Fintech Innovations' },
  ],
  locations: [{ id: 'home', name: 'Macintosh HD', mobileName: 'On My iPhone' }],
}

/** Copy used around the file browser. */
export const finderCopy = {
  welcome: [
    "Welcome to Satyajit's Digital Life! Where organized chaos meets entrepreneurial genius 📁",
    'Finder loaded! Now featuring 8-digit exit memories and caffeine-induced insights ☕',
    'Welcome to the digital realm of a YC Finalist! Proceed with caffeinated caution 🚀',
    'Finder ready! Home to 50,000+ business dreams and infinite coffee stats ⚡',
    'Digital workspace loaded! May contain traces of startup magic and biryani wisdom 🌟',
  ],
  /** Shown once per session the first time a folder is opened. */
  folderOpened: {
    'coffee-addiction': 'Warning: Extreme caffeine levels detected in this folder ☕',
    'failed-experiments': 'Entering the graveyard of good intentions... 💀',
    'future-unicorns': 'These projects will definitely make me rich... someday 🦄',
    memes: 'Productivity -50%, Happiness +100% 😂',
    'zyada-shop-folder': 'Ah, the 8-digit exit memories! 50,000+ businesses helped 🚀',
    'mosambee-magic': 'Current fintech innovations in progress... Red Bull not included ⚡',
    'yc-journey': 'YC 2022 Finalist memories - Top 1% of startups worldwide! 🏆',
    'code-graveyard': 'Where good code goes to rest... and bad code goes to hide 💻',
    screenshots: 'Screenshots of screenshots... the developer way 📸',
    'fintech-innovations': 'Leading product strategy with passionate hackathon energy! 💳',
  } as Record<string, string>,
  search: [
    'Searching for "{q}"... Found mostly regrets and old screenshots',
    'Looking for "{q}"... Checking coffee-stained folders',
    `Searching "{q}"... Hope it's not in the failed experiments folder`,
    'Finding "{q}"... Scanning through 8-digit exit memories',
    'Locating "{q}"... Probably buried under startup ideas',
    'Hunting for "{q}"... May contain traces of genius',
  ],
  loading: [
    {
      title: 'Organizing digital chaos...',
      subtitle: "Sorting files by level of importance (spoiler: they're all important)",
    },
    {
      title: 'Searching for that one file...',
      subtitle: 'You know, the one you saved somewhere "safe" and can never find again',
    },
    {
      title: 'Defragmenting life choices...',
      subtitle: 'Analyzing the correlation between file organization and life decisions',
    },
    {
      title: 'Loading procrastination files...',
      subtitle: `Found 847 items in "I'll organize this later" folder`,
    },
    {
      title: 'Calculating coffee-to-code ratio...',
      subtitle: 'Current ratio: 3.7 cups per meaningful commit',
    },
    { title: 'Syncing with the universe...', subtitle: 'Establishing connection to the cosmic file system' },
    { title: 'Buffering existential thoughts...', subtitle: 'Contemplating the meaning of digital hoarding' },
    {
      title: 'Compiling hopes and dreams...',
      subtitle: 'Warning: Some dreams may have deprecated dependencies',
    },
    {
      title: 'Downloading more RAM...',
      subtitle: "Just kidding, that's not how it works (but wouldn't it be nice?)",
    },
    { title: 'Optimizing work-life balance...', subtitle: 'Error 404: Work-life balance not found' },
    { title: 'Initializing genius mode...', subtitle: 'Calibrating caffeine levels for optimal performance' },
    { title: 'Scanning for productivity...', subtitle: 'Found traces of productivity between coffee breaks' },
  ],
  status: [
    'Organizing chaos...',
    'Files are judging you',
    'Digital hoarding level: Expert',
    'Productivity: Loading...',
    'Coffee required',
    'Procrastination detected',
    'Genius at work',
    'Files everywhere!',
    'System stable-ish',
    'Caffeine levels: Optimal',
  ],
  /** Status-bar free space. The About window says the storage is experience. */
  available: '1TB+ Experience available',
  empty: {
    title: 'Nothing to see here',
    body: 'This folder is emptier than my motivation on Monday mornings',
  },
  noResults: {
    title: 'No results found',
    body: 'No files found matching "{q}". Try a different search term or check your spelling.',
  },
  errors: {
    network: {
      title: 'Connection Lost',
      message:
        'Looks like the internet went for a coffee break. Even the WiFi needs caffeine sometimes!',
      technical: 'Network error: The tubes are clogged with cat videos',
    },
    permission: {
      title: 'Access Denied',
      message:
        'This folder is more exclusive than a VIP club. You need special clearance to enter!',
      technical:
        'Permission error: Your security clearance is insufficient for this level of digital chaos',
    },
    notFound: {
      title: 'File Not Found',
      message:
        'This file has gone on vacation to a tropical island. It left no forwarding address.',
      technical: 'Error 404: File is probably hiding with your work-life balance',
    },
    generic: {
      title: 'Something Went Wrong',
      message:
        "The digital universe experienced a hiccup. Don't worry, it happens to the best of us!",
      technical: 'Error: The hamsters powering this feature are on strike',
    },
  },
  blameTargets: [
    "the intern (they're not even here today)",
    'the previous developer (who left 2 years ago)',
    "the coffee machine (it's been acting suspicious)",
    'the rubber duck (it knows what it did)',
    'Mercury being in retrograde',
    "the AI overlords (they're probably listening)",
    'that one semicolon that went missing',
    'the user (just kidding, we love users... mostly)',
  ],
  actions: {
    procrastinate: 'Procrastination mode activated! ⏰ Nothing will get done today.',
    blameIntern: 'The intern has been successfully blamed for this issue. 🤷‍♂️',
    coffeeBreak: 'Coffee break initiated! ☕ Productivity will resume in 30 minutes.',
    panic: 'PANIC MODE ACTIVATED! 😱 Everything is on fire!',
    newFolder: 'Created "Untitled Folder" - Another place to lose files! 📁',
    refreshed: 'Files refreshed! Still the same chaos though... 🔄',
    shared: 'Shared the epic tale of "{name}" with the world! 🌍',
    hidden: 'Hidden files revealed: none. Everything embarrassing is already on display.',
  },
  /** Humorous "Kind" descriptions, by extension. */
  kindQuips: {
    csv: 'Comma Separated Values - Perfect for spreadsheet nerds',
    docx: 'Microsoft Word Document - Where dreams go to die in corporate formatting',
    pdf: `Portable Document Format - The "I'll read this later" format`,
    jpg: 'JPEG Image - Compressed memories',
    png: 'PNG Image - Screenshots of screenshots',
    mp4: 'MP4 Video - Probably a screen recording of a bug',
    md: "Markdown Document - For developers who think they're writers",
    py: 'Python Script - Snake charming code',
    js: 'JavaScript File - The language that runs the internet (somehow)',
    apk: 'Android Package - Your app in a neat little bundle',
  } as Record<string, string>,
  genericQuips: [
    'Probably important... or not',
    'Created during a caffeine-induced coding session',
    'May contain traces of genius',
    "Handle with care (or don't)",
    'This file has seen things...',
    'Backup recommended (but who has time for that?)',
    'Contains 47% more productivity than average',
  ],
  genericInsight:
    "This file contains the hopes, dreams, and occasional regrets of a developer's journey.",
  importance: ['Critical', 'High', 'Medium', 'Low', 'What is this?', 'Negative importance'],
  /** Fallback bodies when a file has no preview of its own. {name}/{about} are filled in. */
  fallbackText: `This is the content of {name}.

It contains important information about {about}.

File created with love, caffeine, and a touch of entrepreneurial madness.

Status: Probably important
Backup Status: What's a backup?
Last Modified: When inspiration struck`,
  fallbackCode: `// {name}
// This file contains {lines} lines of pure genius
// Or at least that's what I told myself when I wrote it

function doSomethingAmazing() {
    return "Hello, World!";
    // TODO: Actually do something amazing
}`,
}
