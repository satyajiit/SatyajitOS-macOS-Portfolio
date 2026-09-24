import {
  SvglAmazonWebServicesLogo,
  SvglAndroidLogo,
  SvglDockerLogo,
  SvglExpressjsLogo,
  SvglFigmaLogo,
  SvglFirebaseLogo,
  SvglFlutterLogo,
  SvglGitHubCopilotLogo,
  SvglGitHubLogo,
  SvglGitLogo,
  SvglGmailLogo,
  SvglGoLogo,
  SvglGoogleCloudLogo,
  SvglGoogleLogo,
  SvglGooglePlayLogo,
  SvglGraphQLLogo,
  SvglJavaLogo,
  SvglJavaScriptLogo,
  SvglKotlinLogo,
  SvglKubernetesLogo,
  SvglLinkedInLogo,
  SvglMongoDBLogo,
  SvglMySQLLogo,
  SvglNextjsLogo,
  SvglNodejsLogo,
  SvglPiniaLogo,
  SvglPostgreSQLLogo,
  SvglPythonLogo,
  SvglReactLogo,
  SvglRedisLogo,
  SvglStackOverflowLogo,
  SvglTailwindCSSLogo,
  SvglTypeScriptLogo,
  SvglViteLogo,
  SvglVitestLogo,
  SvglVueLogo,
  SvglXformerlyTwitterLogo,
  SvglYouTubeLogo,
} from '@selemondev/svgl-vue'
import type { Component } from 'vue'

/**
 * Brand marks, from svgl (svgl.app) via @selemondev/svgl-vue. Logos keep their
 * real colours; `ink` marks are black (GitHub, X, Next.js…) or have near-black
 * parts, and those parts follow the text colour so they read in dark mode.
 */
export interface BrandDef {
  label: string
  component: Component
  /**
   * Near-black fills that should follow the text colour. `black` covers pure
   * black marks (including paths with no fill); hex values name a specific
   * dark part; `invert` flips a black-disc mark (Next.js) in dark mode.
   * Each value needs a matching rule in BrandIcon.vue.
   */
  ink?: 'black' | '1b1f23' | '001e2b' | '252f3e' | '00546b' | 'invert'
}

export const brands = {
  github: { label: 'GitHub', component: SvglGitHubLogo, ink: '1b1f23' },
  x: { label: 'X', component: SvglXformerlyTwitterLogo, ink: 'black' },
  linkedin: { label: 'LinkedIn', component: SvglLinkedInLogo },
  youtube: { label: 'YouTube', component: SvglYouTubeLogo },
  gmail: { label: 'Gmail', component: SvglGmailLogo },
  google: { label: 'Google', component: SvglGoogleLogo },
  'google-play': { label: 'Google Play', component: SvglGooglePlayLogo },
  'google-cloud': { label: 'Google Cloud', component: SvglGoogleCloudLogo },
  copilot: { label: 'GitHub Copilot', component: SvglGitHubCopilotLogo, ink: 'black' },
  'stack-overflow': { label: 'Stack Overflow', component: SvglStackOverflowLogo },
  typescript: { label: 'TypeScript', component: SvglTypeScriptLogo },
  javascript: { label: 'JavaScript', component: SvglJavaScriptLogo },
  go: { label: 'Go', component: SvglGoLogo, ink: 'black' },
  java: { label: 'Java', component: SvglJavaLogo },
  kotlin: { label: 'Kotlin', component: SvglKotlinLogo },
  python: { label: 'Python', component: SvglPythonLogo },
  vue: { label: 'Vue.js', component: SvglVueLogo },
  react: { label: 'React', component: SvglReactLogo },
  nextjs: { label: 'Next.js', component: SvglNextjsLogo, ink: 'invert' },
  nodejs: { label: 'Node.js', component: SvglNodejsLogo },
  express: { label: 'Express.js', component: SvglExpressjsLogo, ink: 'black' },
  flutter: { label: 'Flutter', component: SvglFlutterLogo },
  android: { label: 'Android', component: SvglAndroidLogo },
  mysql: { label: 'MySQL', component: SvglMySQLLogo, ink: '00546b' },
  mongodb: { label: 'MongoDB', component: SvglMongoDBLogo, ink: '001e2b' },
  postgresql: { label: 'PostgreSQL', component: SvglPostgreSQLLogo },
  redis: { label: 'Redis', component: SvglRedisLogo },
  docker: { label: 'Docker', component: SvglDockerLogo },
  kubernetes: { label: 'Kubernetes', component: SvglKubernetesLogo },
  firebase: { label: 'Firebase', component: SvglFirebaseLogo },
  graphql: { label: 'GraphQL', component: SvglGraphQLLogo },
  aws: { label: 'AWS', component: SvglAmazonWebServicesLogo, ink: '252f3e' },
  git: { label: 'Git', component: SvglGitLogo },
  figma: { label: 'Figma', component: SvglFigmaLogo },
  tailwind: { label: 'Tailwind CSS', component: SvglTailwindCSSLogo },
  vite: { label: 'Vite', component: SvglViteLogo },
  pinia: { label: 'Pinia', component: SvglPiniaLogo },
  vitest: { label: 'Vitest', component: SvglVitestLogo },
} satisfies Record<string, BrandDef>

export type BrandName = keyof typeof brands
