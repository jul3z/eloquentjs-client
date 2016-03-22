import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/index.es6.js',
    format: 'umd',
    moduleName: 'Eloquent',
    plugins: [
        babel({
            presets: ['es2015-rollup']
        })
    ]
};