const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const PORT = 8100;
const HOST = '0.0.0.0';

const config = {
	entry: ['./src/index'],
	output: {
		filename: 'bundle.js',
		path: path.join(__dirname, '/build')
	},
	optimization: {
		usedExports: true
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.(ts|js)x?$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader'
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.svg$/,
				use: [
				  {
					loader: '@svgr/webpack',
					options: {
					  icon: true,
					},
				  },
				  'url-loader',
				],
			  },
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader'
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.ejs'
		}),
		new Dotenv({
			systemvars: true,
		})
	],
	devServer: {
		host: HOST,
		port: PORT,
		static: true,
		open: true,
		hot: true,
		historyApiFallback: true,
		client: {
			overlay: {
				errors: true,
				warnings: false
			}
		}
	}
};

module.exports = config;
