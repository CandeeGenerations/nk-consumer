/* eslint @typescript-eslint/no-var-requires: 0 */
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
        serif: ['Cormorant', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        secondary: {
          DEFAULT: colors.blue['500'],
          ...colors.blue,
        },
        primary: {
          DEFAULT: colors.amber['500'],
          ...colors.amber,
        },
        dark: {
          DEFAULT: '#3A415C',
        },
        success: {
          lightest: '#bceac1',
          light: '#90dd99',
          DEFAULT: '#22BB33',
          medium: '#1b9528',
          dark: '#14701e',
        },
        danger: {
          lightest: '#eabcbd',
          light: '#dd9091',
          DEFAULT: '#bb2124',
          medium: '#951a1c',
          dark: '#701315',
        },
        warning: {
          lightest: '#fae6c9',
          light: '#f7d6a6',
          DEFAULT: '#f0ad4e',
          medium: '#c08a3e',
          dark: '#90672e',
        },
        muted: {
          lightest: colors.slate['50'],
          'light-medium': colors.slate['100'],
          light: colors.slate['300'],
          DEFAULT: colors.slate['500'],
          medium: colors.slate['700'],
          dark: colors.slate['900'],
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
    backgroundOpacity: false,
    borderOpacity: false,
    boxShadow: false,
    divideOpacity: false,
    placeholderOpacity: false,
    textOpacity: false,
  },
}
