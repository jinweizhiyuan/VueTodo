const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var openInEditor = require('launch-editor-middleware');

const isDev = process.env.NODE_ENV == 'development';

var config = {
    target: 'web',
    mode: 'development',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        // filename: 'bundle.js',
        filename: 'bundle.[hash:8].js',
        path: path.join(__dirname, "dist")
    },
    // resolveLoader: {
    //     root: path.join(__dirname, 'node_modules')
    // },
    module: {
        rules: [{
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.jsx$/,
                loader: 'babel-loader'
            },
            // {
            //     test: /\.css$/,
            //     use: [
            //         'style-loader',
            //         'css-loader'
            //     ]
            // },
            // {
            //     test: /\.styl$/,
            //     use: [
            //         'style-loader',
            //         'css-loader',
            //         {
            //             loader: 'postcss-loader',
            //             options: {
            //                 sourceMap: true
            //             }
            //         },
            //         'stylus-loader'
            //     ]
            // },
            {
                test: /\.(jpg|jpeg|png|svg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: '[name].[ext]'
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        new HTMLPlugin()
    ]
};

if (isDev) {
    config.module.rules.push({
        test: /\.styl$/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true
                }
            },
            'stylus-loader'
        ]
    });
    config.devtool = '#cheap-eval-resource-map';
    config.devServer = {
        port: 8000,
        host: '0.0.0.0',
        overlay: {
            errors: true,
        },
        // historyFallback
        hot: true,
        before (app) {
            app.use('/__open-in-editor', openInEditor())
        }
        // open: true
    }

    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else {
    config.entry = {
        app: path.join(__dirname, 'src/index.js'),
        // vendor: ['vue']
    };
    config.output.filename = '[name].[chunkhash:8].js';
    config.optimization = {
        splitChunks: {
            cacheGroups: {
                default: false,
                vendor: {
                    test: /[\\/]node_modules[\\/]/, // you may add "vendor.js" here if you want to
                    name: 'vendor',
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
        runtimeChunk: {
            name: 'runtime',
        },
        // minimizer: [
        //     new MinifyPlugin(),
        //     new OptimizeJsPlugin({ sourceMap: false }),
        // ],
        occurrenceOrder: true,
    };
    config.module.rules.push({
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true
                    }
                },
                'stylus-loader'
            ]
        })
    });
    config.plugins.push(
        new ExtractTextPlugin('styles.[md5:contenthash:hex:8].css')
    )
}

module.exports = config;