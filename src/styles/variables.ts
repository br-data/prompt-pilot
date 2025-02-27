export const landscapeMobile = `only screen and (min-height: 319px) and (max-height: 480px) and (orientation: landscape)`;
export const big = `only screen and (min-width: 1536px)`;
export const mobile = `only screen and (max-width: 1020px)`;
export const smartphone = `only screen and (max-width: 768px)`;
export const firefox = '@-moz-document url-prefix()';
export const ie = 'all and (-ms-high-contrast: none), (-ms-high-contrast: active)';
export const safari = 'not all and (min-resolution:.001dpcm)';

const BR24COLORS = {
    white: '#ffffff',
    veryLightGrey: '#f4f4f4',
    lightGrey: '#d7d7d7',
    mediumGrey: '#8e949a',
    darkGrey: '#434343',
    veryDarkGrey: '#3c3c3c',
    black: '#323232',
    blueGrey: '#373B47',
    darkBlueGrey: '#292d3b',
    lightBlueGrey: '#484B5A',
    blue: '#0b9fd8',
    orange: '#e4743a',
    green: '#3ad29f',
    red: '#e64242',
    yellow: '#fbb800'
};

export const COLOR = {
    br24: BR24COLORS,
    pageBackground: BR24COLORS.veryLightGrey,
    contentBackground: BR24COLORS.white,
    contentFont: BR24COLORS.black,
    contentBox: BR24COLORS.veryLightGrey,
    error: BR24COLORS.red,
    warning: BR24COLORS.orange,
    info: BR24COLORS.green,
    overlay: BR24COLORS.darkBlueGrey,
    overlayGradient: `radial-gradient(${BR24COLORS.lightBlueGrey}, ${BR24COLORS.darkBlueGrey})`,
    overlayFont: BR24COLORS.white,
    primary: BR24COLORS.blue,
    secondary: BR24COLORS.darkBlueGrey,
    tertiary: BR24COLORS.mediumGrey
};
