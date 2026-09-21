/**
 * Unified SVG Icon System powered by Lucide
 * Replaces all emojis with crisp, accessible, scalable vector icons.
 */

import {
  PenTool,
  Sliders,
  Wand2,
  Palette,
  LayoutTemplate,
  Sparkles,
  Layers,
  History,
  Clock,
  Users,
  Globe,
  Heart,
  User,
  Settings,
  AtSign,
  Tag,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Columns,
  Shuffle,
  Dices,
  Copy,
  Check,
  Download,
  Share2,
  Scissors,
  Image,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  HardDrive,
  Trash2,
  RotateCcw,
  Search,
  X,
  MoreVertical,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Moon,
  Zap,
  Crown,
  Gem,
  Leaf,
  Feather,
  FolderUp,
  FolderDown,
  Upload,
  Newspaper,
  Shapes,
  Disc,
  Tv,
  Calendar,
  Droplets,
  HelpCircle,
  Camera,
  MessageSquare,
  Box,
  Compass,
  FileText,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkle,
  Paintbrush
} from 'lucide';

const ICON_MAP = {
  penTool: PenTool,
  sliders: Sliders,
  wand: Wand2,
  palette: Palette,
  layout: LayoutTemplate,
  sparkles: Sparkles,
  sparkle: Sparkle,
  layers: Layers,
  history: History,
  clock: Clock,
  users: Users,
  globe: Globe,
  heart: Heart,
  user: User,
  settings: Settings,
  atSign: AtSign,
  tag: Tag,
  eye: Eye,
  eyeOff: EyeOff,
  smartphone: Smartphone,
  monitor: Monitor,
  columns: Columns,
  shuffle: Shuffle,
  dices: Dices,
  copy: Copy,
  check: Check,
  download: Download,
  share: Share2,
  scissors: Scissors,
  image: Image,
  square: Square,
  rectH: RectangleHorizontal,
  rectV: RectangleVertical,
  hardDrive: HardDrive,
  trash: Trash2,
  rotateCcw: RotateCcw,
  undo: RotateCcw,
  search: Search,
  x: X,
  close: X,
  moreVertical: MoreVertical,
  info: Info,
  alert: AlertTriangle,
  checkCircle: CheckCircle2,
  xCircle: XCircle,
  type: Type,
  alignLeft: AlignLeft,
  alignCenter: AlignCenter,
  alignRight: AlignRight,
  moon: Moon,
  zap: Zap,
  crown: Crown,
  gem: Gem,
  leaf: Leaf,
  feather: Feather,
  folderUp: FolderUp,
  folderDown: FolderDown,
  upload: Upload,
  newspaper: Newspaper,
  shapes: Shapes,
  disc: Disc,
  tv: Tv,
  calendar: Calendar,
  droplets: Droplets,
  watermark: Droplets,
  help: HelpCircle,
  camera: Camera,
  message: MessageSquare,
  quote: MessageSquare,
  box: Box,
  compass: Compass,
  fileText: FileText,
  radio: Radio,
  externalLink: ExternalLink,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  paintbrush: Paintbrush
};

/**
 * Renders an SVG icon string from Lucide
 * @param {string} name - The key in ICON_MAP or PascalCase name
 * @param {object} attrs - Options including size, strokeWidth, class, style, etc.
 * @returns {string} SVG HTML string
 */
export function icon(name, attrs = {}) {
  const key = name.toLowerCase().replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
  const iconDef = ICON_MAP[name] || ICON_MAP[key] || ICON_MAP.sparkles;

  if (!iconDef || !Array.isArray(iconDef)) {
    return '';
  }

  const size = attrs.size || 16;
  const strokeWidth = attrs.strokeWidth || 2;
  const className = attrs.class ? `lucide-icon ${attrs.class}` : 'lucide-icon';
  const customAttrs = Object.entries(attrs)
    .filter(([k]) => !['size', 'strokeWidth', 'class'].includes(k))
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');

  const children = iconDef.map(([tag, tagAttrs]) => {
    const attrStr = Object.entries(tagAttrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<${tag} ${attrStr} />`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${className}" ${customAttrs}>${children}</svg>`;
}
