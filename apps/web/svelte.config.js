import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [preprocess()],

    kit: {
        adapter: netlify(),

        // hydrate the <div id="svelte"> element in src/app.html
        target: "#svelte",

        vite: {
            resolve: {
                alias: {
                    '$lib': path.resolve('./src/lib'),
                    '$components': path.resolve('./src/components')
                }
            }
        }
    },
};

export default config;
