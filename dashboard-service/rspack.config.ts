import * as path from "node:path";
import { defineConfig } from "@rspack/cli";
import {DefinePlugin, rspack} from "@rspack/core";
import * as RefreshPlugin from "@rspack/plugin-react-refresh";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import * as dotenv from "dotenv";
dotenv.config();

import { mfConfig } from "./module-federation.config";

const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
  context: __dirname,
  entry: {
    main: "./src/index.tsx",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },

  devServer: {
    port: 3009,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, "src")],
  },
  output: {
    uniqueName: "dashboard_service",
    publicPath: "http://localhost:3009/",
  },

  experiments: {
    css: true,
  },

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name].[contenthash:8][ext]", // 출력 경로
        },
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // '...svg?url'은 파일 URL, 나머지는 SVGR
        use: [{
          loader: "@svgr/webpack",
          options: {
            // exportType: "default",
            // CRA 스타일 쓰려면:
            // exportType: "named",
            // namedExport: "ReactComponent",
            icon: true,
            svgo: true,
            svgoConfig: {
              plugins: [
                { name: "removeDimensions" },
                { name: "convertColors", params: { currentColor: true } }
              ]
            }
          }
        }]
      },
      { test: /\.(woff2?|ttf|otf|eot)$/i, type: "asset/resource",
        generator: { filename: "fonts/[name][ext]" }
      },
      {
        test: /\.svg$/i,
        resourceQuery: /url/,       // ?url 로 가져올 때만 파일 URL 처리
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css",
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: { targets },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: "./index.html",
    }),
    new ModuleFederationPlugin(mfConfig),
    new DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.VITE_USER_API_BASE_URL": JSON.stringify(process.env.VITE_USER_API_BASE_URL),
      "process.env.VITE_ATT_API_BASE_URL": JSON.stringify(process.env.VITE_ATT_API_BASE_URL),
      "process.env.VITE_LEAVE_API_BASE_URL": JSON.stringify(process.env.VITE_LEAVE_API_BASE_URL),
      "process.env.VITE_AUTH_TOKEN_KEY": JSON.stringify(process.env.VITE_AUTH_TOKEN_KEY),
    }),
    isDev ? new RefreshPlugin() : null,
  ].filter(Boolean),
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
});
