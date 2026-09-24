/**
 * Artwork palette for Finder's file icons and generated previews. Like real
 * macOS document icons they keep their colours in both appearances, so they
 * read from here instead of the live UI tokens.
 */
export const fileArt = {
  folderBackTop: '#63b3f2',
  folderBackBottom: '#3e97e6',
  folderFrontTop: '#a6d9fc',
  folderFrontBottom: '#6bbaf6',
  folderEdge: '#dcf0ff',
  folderEmblem: '#3e8ad3',
  smartBackTop: '#a597f3',
  smartBackBottom: '#7b69e0',
  smartFrontTop: '#d2cbfc',
  smartFrontBottom: '#a898f6',
  smartEmblem: '#6a58cf',

  paperTop: '#ffffff',
  paperBottom: '#eef0f4',
  paperEdge: '#c6c9d0',
  foldTop: '#f7f8fa',
  foldBottom: '#d6d9df',
  line: '#c9ccd3',
  lineDark: '#9a9ea8',

  word: '#2b6fd7',
  wordSoft: '#dce8fb',
  excel: '#1e8e4d',
  excelSoft: '#dcf2e5',
  powerpoint: '#d5542a',
  powerpointSoft: '#fbe3d8',
  pdf: '#e0342f',
  markdown: '#4f5560',
  text: '#6b7079',
  code: '#7b52d3',
  sketch: '#f2a31b',
  sketchSoft: '#fde7b8',
  unknown: '#8e8e93',

  photoFrame: '#ffffff',
  sky: '#8ecbff',
  skyDeep: '#4b9cf2',
  hill: '#4cc36a',
  hillDeep: '#2e9b4f',
  sun: '#ffd23f',

  film: '#1c1c1e',
  filmHole: '#48484a',
  play: '#ffffff',

  driveTop: '#f4f4f6',
  driveBottom: '#c9ccd2',
  driveStripe: '#aeb2ba',
  driveLed: '#34c759',

  packageTop: '#4fe08e',
  packageBottom: '#1fa55a',

  shadow: '#000000',
  white: '#ffffff',
} as const

/** Colours for the generated "photos" (memes, napkin, screenshot, video poster). */
export const photoArt = {
  napkin: '#fbf6ea',
  napkinEdge: '#e8dfc9',
  ink: '#2d3a8c',
  stain: '#b07a45',
  memeInk: '#ffffff',
  memeStroke: '#000000',
  memeBlue: '#1f3a6e',
  memeBlueDeep: '#0e1f42',
  memeWarm: '#6e2a1f',
  memeWarmDeep: '#2f0f0b',
  memeGray: '#3a3a3c',
  memeGrayDeep: '#1c1c1e',
  windowDark: '#1e1e1e',
  windowBar: '#2d2d2d',
  menubar: '#000000',
  termGreen: '#32d74b',
  termText: '#e6e6e6',
  close: '#ff5f57',
  minimize: '#febc2e',
  zoom: '#28c840',
  partyTop: '#3a1c71',
  partyBottom: '#d76d77',
  confetti: ['#ffd60a', '#32d74b', '#0a84ff', '#ff375f', '#bf5af2', '#ff9f0a'],
  scrim: '#000000',
} as const
