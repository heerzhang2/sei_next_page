module.exports = {
    theme: {
        extend: {
            screens: {
                'lg-portrait': {'raw': '(min-height: 1024px) and (orientation: portrait)'},
                'sm-portrait': {'raw': '(max-height: 1023px) and (orientation: portrait)'},
                'lg-landscape': {'raw': '(min-width: 1024px) and (orientation: landscape)'},
                'sm-landscape': {'raw': '(max-width: 1023px) and (orientation: landscape)'},
            },
        },
    },
}
