GSSI Client
----------
Ionic powered front end for GSSI

Project Installation
----------
Clone the git repo:

```
git clone https://githost.arckcloud.com/arckdev/gssi-client.git .
```

Make sure Node 5.x is (npm 3) is installed.  Simplest way to do that is to use nvm: https://github.com/creationix/nvm/blob/master/README.markdown

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
```

Then use nvm to install the exact version of node you want.

```
nvm install 5.12.0

nvm ls  (list installed versions)

nvm use 5.12.0
```

Change to the root project directory

If ionic isn't installed, install that

```
npm install -g ionic
```

If cordova isn't installed, install that

```
npm install -g cordova
```

Change directory into this project root, then install the node modules

```
npm install
```

Then reset the project state

```
ionic state reset
```

Build for the browser

```
ionic build browser
```

The webroot for the project after building can be found at platforms/browser/www