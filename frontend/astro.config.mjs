// @ts-check
import { defineConfig } from 'astro/config';

export default {
    root: './frontend', // Add the root path to the frontend folder
    buildOptions: {
        site: 'http://example.com', // Adjust this to your project details
    },
};