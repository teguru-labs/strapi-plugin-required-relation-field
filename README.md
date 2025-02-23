# Strapi Plugin Required Relation Field

Enforces required relation fields in Strapi to be non-empty on save or publish.

![Preview](./images/content.gif)

## Installation

```bash
yarn add strapi-plugin-required-relation-field
```

## Development

To test the plugin during development, build it with the `watch:link` command:

```bash
yarn watch:link
```

Next, link it to a local Strapi project. In a new terminal window, run:

```bash
cd /path/to/strapi/project
yarn dlx yalc add --link strapi-plugin-required-relation-field
yarn install
```

Since this plugin is installed via `node_modules`, you don't need to explicitly add it to your `plugins` configuration file. Running the `develop` command will automatically detect your plugin.

Start your Strapi project with:

```bash
yarn develop
```

You are now ready to develop your plugin! Note that server changes require a server restart to take effect.
