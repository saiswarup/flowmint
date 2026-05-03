import { Dimensions, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const BASE_W = 390;
const BASE_H = 844;
const wScale = W / BASE_W;
const hScale = H / BASE_H;

export const rs = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * wScale));
export const vs = (size: number) => Math.round(PixelRatio.roundToNearestPixel(size * hScale));
export const ms = (size: number, factor = 0.4) => Math.round(PixelRatio.roundToNearestPixel(size + (size * wScale - size) * factor));
export const sw = (pct: number) => W * (pct / 100);
export const sh = (pct: number) => H * (pct / 100);
export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
export const SCREEN = { width: W, height: H };

// FlowMint Brand Colors
export const COLORS = {
  bg:        '#050D12',
  card:      '#0D1F26',
  card2:     '#122530',
  primary:   '#00C896',
  secondary: '#00A3FF',
  accent:    '#00EDAA',
  pink:      '#FF6B8A',
  orange:    '#FF9F43',
  yellow:    '#FFD93D',
  purple:    '#7C5CBF',
  text:      '#FFFFFF',
  textSub:   '#7A9BAA',
  border:    '#1A3040',
};

export const SPACING = {
  xs: rs(4), sm: rs(8),
  md: clamp(rs(12), 10, 16),
  lg: clamp(rs(16), 14, 20),
  xl: clamp(rs(20), 16, 24),
  xxl: clamp(rs(24), 20, 30),
};

export const FONT = {
  xs:   clamp(ms(11), 10, 13),
  sm:   clamp(ms(12), 11, 14),
  md:   clamp(ms(13), 12, 15),
  lg:   clamp(ms(15), 13, 17),
  xl:   clamp(ms(17), 15, 20),
  xxl:  clamp(ms(20), 17, 24),
  xxxl: clamp(ms(26), 22, 32),
};

export const RADIUS = { sm: rs(8), md: rs(12), lg: rs(16), xl: rs(20), xxl: rs(24) };
export const ICON = {
  sm: clamp(rs(32), 28, 40),
  md: clamp(rs(40), 36, 48),
  lg: clamp(rs(48), 42, 56),
  xl: clamp(rs(56), 48, 68),
};
