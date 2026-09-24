import {
  AlarmClock, Annoyed, Ban, BatteryFull, Bed, Beef, Beer, BicepsFlexed, BookOpen, Bot, Brain,
  BrainCircuit, BriefcaseBusiness, Bug, Camera, Car, CarFront, Cat, ChartColumn, Check, Circle,
  CircleCheck, CircleHelp, CircleX, Clock, Cloud, CloudLightning, CloudRain, CloudSnow, CloudSun,
  CodeXml, Coffee, Database, Coins, CreditCard, CupSoda, Dice5, Earth, FlaskConical, Fish, Flag, Flame,
  Flower2, Folder, Footprints, Frown, Gem, Glasses, Globe, GraduationCap, Hand, HandHeart,
  Handshake, Heart, HeartHandshake, Keyboard, Laptop, Laugh, Leaf, Library, Lightbulb, Lock,
  LockKeyhole, Mail, Megaphone, Meh, MessageCircle, MessageCircleMore, Milk, Monitor, Moon, Music,
  Newspaper, NotebookPen, Orbit, Palette, PartyPopper, PawPrint, PersonStanding, Phone, Pill,
  Pizza, Rabbit, Rainbow, RefreshCw, Rocket, Siren, Skull, Smartphone, Smile, SmilePlus, Snail,
  Snowflake, Sparkle, Sparkles, Star, Sun, Target, Thermometer, ThumbsUp, TrainFront, Trash2,
  TrendingUp, TriangleAlert, Trophy, UtensilsCrossed, Video, Volume2, VolumeX, WandSparkles,
  Wrench, Zap,
} from '@lucide/vue'
import type { Component } from 'vue'

/**
 * Inline symbols. Copy in src/content writes `:rocket:` where it wants a
 * symbol; <IconText> turns that into the Lucide icon (standing in for SF
 * Symbols), tinted with an Apple system colour the way a multicolour symbol is.
 * Plain-text contexts (titles, inputs, aria-labels) use stripGlyphs().
 */
export type GlyphTint =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'mint'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'gray'

export interface GlyphDef {
  icon: Component
  tint?: GlyphTint
  /** Solid shape (dots, hearts, stars) rather than an outline. */
  filled?: boolean
}

const g = (icon: Component, tint?: GlyphTint, filled = false): GlyphDef => ({ icon, tint, filled })

export const glyphs = {
  // Work and tech
  rocket: g(Rocket, 'orange'),
  laptop: g(Laptop, 'blue'),
  desktop: g(Monitor, 'blue'),
  phone: g(Smartphone, 'blue'),
  keyboard: g(Keyboard, 'gray'),
  technologist: g(CodeXml, 'blue'),
  robot: g(Bot, 'blue'),
  bug: g(Bug, 'green'),
  wrench: g(Wrench, 'gray'),
  chart: g(ChartColumn, 'blue'),
  trending: g(TrendingUp, 'green'),
  folder: g(Folder, 'blue'),
  database: g(Database, 'gray'),
  mail: g(Mail, 'blue'),
  notes: g(NotebookPen, 'yellow'),
  book: g(BookOpen, 'brown'),
  books: g(Library, 'brown'),
  news: g(Newspaper, 'gray'),
  briefcase: g(BriefcaseBusiness, 'brown'),
  card: g(CreditCard, 'indigo'),
  money: g(Coins, 'yellow'),
  gem: g(Gem, 'cyan'),
  target: g(Target, 'red'),
  idea: g(Lightbulb, 'yellow'),
  brain: g(Brain, 'pink'),
  'mind-blown': g(BrainCircuit, 'purple'),
  zap: g(Zap, 'yellow', true),
  palette: g(Palette, 'purple'),
  camera: g(Camera, 'gray'),
  video: g(Video, 'green'),
  call: g(Phone, 'green'),
  chat: g(MessageCircle, 'blue'),
  thought: g(MessageCircleMore, 'gray'),
  megaphone: g(Megaphone, 'orange'),
  graduate: g(GraduationCap, 'indigo'),
  handshake: g(Handshake, 'orange'),
  lock: g(Lock, 'gray'),
  'lock-key': g(LockKeyhole, 'gray'),
  refresh: g(RefreshCw, 'blue'),
  trash: g(Trash2, 'gray'),
  no: g(Ban, 'red'),
  globe: g(Globe, 'blue'),
  earth: g(Earth, 'green'),
  galaxy: g(Orbit, 'indigo'),
  alchemy: g(FlaskConical, 'purple'),
  magic: g(WandSparkles, 'purple'),
  'crystal-ball': g(WandSparkles, 'indigo'),
  unicorn: g(WandSparkles, 'pink'),

  // Status
  done: g(CircleCheck, 'green'),
  check: g(Check, 'green'),
  cross: g(CircleX, 'red'),
  warning: g(TriangleAlert, 'yellow'),
  siren: g(Siren, 'red'),
  'red-flag': g(Flag, 'red'),
  flag: g(Flag, 'blue'),
  hundred: g(Trophy, 'red'),
  trophy: g(Trophy, 'yellow'),
  star: g(Star, 'yellow', true),
  shine: g(Sparkle, 'yellow'),
  sparkle: g(Sparkle, 'yellow'),
  sparkles: g(Sparkles, 'yellow'),
  party: g(PartyPopper, 'pink'),
  celebrate: g(Hand, 'orange'),
  'thumbs-up': g(ThumbsUp, 'blue'),
  strong: g(BicepsFlexed, 'orange'),
  fire: g(Flame, 'orange'),
  spicy: g(Flame, 'red'),
  heart: g(Heart, 'red', true),
  hearts: g(HeartHandshake, 'pink'),
  thanks: g(HandHeart, 'orange'),
  wave: g(Hand, 'yellow'),
  dot: g(Circle, undefined, true),

  // Faces
  smile: g(Smile, 'yellow'),
  grin: g(Laugh, 'yellow'),
  laugh: g(Laugh, 'yellow'),
  wink: g(SmilePlus, 'yellow'),
  meh: g(Meh, 'yellow'),
  thinking: g(CircleHelp, 'purple'),
  skeptical: g(Annoyed, 'yellow'),
  anxious: g(Frown, 'blue'),
  scream: g(Frown, 'orange'),
  'dizzy-face': g(Annoyed, 'purple'),
  cool: g(Glasses, 'gray'),
  sunglasses: g(Glasses, 'gray'),
  glasses: g(Glasses, 'gray'),
  shrug: g(CircleHelp, 'gray'),
  secret: g(VolumeX, 'gray'),
  sleepy: g(Bed, 'indigo'),
  zzz: g(Moon, 'indigo'),
  skull: g(Skull, 'gray'),
  poop: g(Trash2, 'brown'),

  // People and motion
  zen: g(Flower2, 'mint'),
  dance: g(PersonStanding, 'purple'),
  walk: g(Footprints, 'gray'),
  run: g(Rabbit, 'orange'),
  snail: g(Snail, 'brown'),

  // Food and drink
  coffee: g(Coffee, 'brown'),
  frappe: g(CupSoda, 'brown'),
  milk: g(Milk, 'gray'),
  ice: g(Snowflake, 'cyan'),
  beer: g(Beer, 'yellow'),
  pizza: g(Pizza, 'orange'),
  bento: g(UtensilsCrossed, 'orange'),
  pill: g(Pill, 'red'),

  // Weather and nature
  sun: g(Sun, 'yellow'),
  moon: g(Moon, 'indigo'),
  cloud: g(Cloud, 'gray'),
  'cloud-sun': g(CloudSun, 'yellow'),
  rain: g(CloudRain, 'blue'),
  storm: g(CloudLightning, 'purple'),
  snow: g(CloudSnow, 'cyan'),
  snowflake: g(Snowflake, 'cyan'),
  rainbow: g(Rainbow, 'pink'),
  thermometer: g(Thermometer, 'red'),
  leaf: g(Leaf, 'green'),
  fish: g(Fish, 'blue'),
  cat: g(Cat, 'orange'),
  cow: g(Beef, 'brown'),
  bear: g(PawPrint, 'brown'),

  // Transport and time
  'race-car': g(CarFront, 'red'),
  car: g(Car, 'red'),
  train: g(TrainFront, 'gray'),
  clock: g(Clock, 'gray'),
  alarm: g(AlarmClock, 'orange'),
  battery: g(BatteryFull, 'green'),
  speaker: g(Volume2, 'gray'),
  mute: g(VolumeX, 'gray'),
  music: g(Music, 'pink'),
  dice: g(Dice5, 'gray'),
} satisfies Record<string, GlyphDef>

export type GlyphName = keyof typeof glyphs

export function isGlyphName(name: string): name is GlyphName {
  return Object.hasOwn(glyphs, name)
}
