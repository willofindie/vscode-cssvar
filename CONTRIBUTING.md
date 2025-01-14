# Contributing to VSCode CSSVar extension
[Draft]

Thanks for your support and taking time to contribute! 🎉👍

## Prerequisites

## Release/Deployments

Currently Deployments are managed manually by @phoenisx. I might make this more public in future, for now
keeping it manual was the most easiest way for me.

### Releasing a new version

It's a two step process (and has a lot of room for improvement)

I maintain two custom scripts:

**`src/scripts/create-changelog.js`**
This is required to automate creating changelog once all the changes are merged to `main` and are about to be released.
This script assumes that we already have previous release version tag present in git history where the command is run.

We can run the following:
```sh
node src/scripts/create-changelog.js v2.6.4..HEAD | pbcopy
```
to generate changelog between previous release and latest commit.
If the generated content is copied to clipboard we can use that content to modify our `CHANGELOG.md`.

Once we are satisfied with the updated CHANGELOG, we can commit the changes and create a new release on Github

> Note we can either create a tag ourself manually or release the previous commit using github and create a tag
> remotely and then creating this changelog with the remote tag.

Follow up commands (not necessary)
```sh
yarn version patch
# Commit changes
git tag -a v2.6.5
git push origin main --follow-tags
```

**`src/scripts/publish.js`**

Publishing our release to VSCode/OVSX extension marketplaces.
We need the private tokens for both these marketplaces for this command to work.

Before running this script the following steps are necessary:
- [Learn how to publish extension on VSCode marketplace](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Publishing Extension on OVSX Marketplace](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- Install following CLI tools: `vsce` and `ovsx`

Running this script will than auto publish our changes to both these marketplaces.

```sh
vsce login {publisher} # Required
OVSX_KEY={token} ./src/scripts/publish.js
```

The above command requires everything to be packaged into a single script using `esbuild`, since I am using `yarn` v4 (berry) and `vsce` has issues with yarn v2+
Ref: https://github.com/microsoft/vscode-vsce/issues/517
