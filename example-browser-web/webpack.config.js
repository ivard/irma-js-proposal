const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */


const sharedModule = {
	rules: [
		{
			include: [path.resolve(__dirname)],
			loader: 'babel-loader',

			options: {
				plugins: ['syntax-dynamic-import'],

				presets: [
					[
						'@babel/preset-env',
						{
							modules: false
						}
					]
				]
			},

			test: /\.js$/
		}
	]
};

const sharedSplitChunks = {
	cacheGroups: {
		vendors: {
			priority: -10,
			test: /[\\/]node_modules[\\/]/
		}
	},

	chunks: 'async',
	minChunks: 1,
	minSize: 30000,
	name: true
};



module.exports = [
	{
		module: sharedModule,

		output: {
			chunkFilename: 'irma-development.js',
			filename: 'irma-development.js'
		},

		mode: 'development',

		optimization: {
			splitChunks: sharedSplitChunks
		},

		devServer: {
			contentBase: [path.join(__dirname, 'docs'), path.join(__dirname, 'dist')],
			disableHostCheck: true
		},

		externals: {
			'readline': 'readline'
		}
	},

	{
		entry: {
	    "irma": "./src/index.js",
	    "irma.min": "./src/index.js",
	    "../docs/irma.min": "./src/index.js"
	  },

		module: sharedModule,

		output: {
			chunkFilename: '[name].js',
			filename: '[name].js'
		},

		mode: 'production',

		optimization: {
			splitChunks: sharedSplitChunks,

			minimize: true,
	    minimizer: [new TerserPlugin()]
		},

		externals: {
			'readline': 'readline'
		}

	}
];
