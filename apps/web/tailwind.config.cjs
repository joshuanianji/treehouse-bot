const typography = require("@tailwindcss/typography");

const config = {
    content: ["./src/**/*.{html,svelte}"],

    theme: {
        extend: {},
    },

    plugins: [typography],
};

module.exports = config;
