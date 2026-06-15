import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base dimensions (designed for)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const useResponsive = () => {
  const wp = (percentage: number) => (width * percentage) / 100;
  const hp = (percentage: number) => (height * percentage) / 100;
  const scale = (size: number) => (width / BASE_WIDTH) * size;
  const verticalScale = (size: number) => (height / BASE_HEIGHT) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  return { wp, hp, scale, verticalScale, moderateScale, width, height };
};