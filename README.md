# feedr - Foundation for Sites Template

This is the NY Times feedr app developed with [Foundation for Sites 6](http://foundation.zurb.com/sites).

## Dependencies

To use this template, your computer needs:

- [NodeJS](https://nodejs.org/en/) (0.12 or greater)
- [Git](https://git-scm.com/)

This template can be installed with the Foundation CLI, or downloaded and set up manually.

[Bower](http://bower.io/) (Only if you want to update the bower packages)
```bash
npm install -g bower
```

[Foundation-CLI](http://foundation.zurb.com/sites/docs/installation.html)
```bash
npm install foundation-cli --global
```

[gulp-webserver](https://www.npmjs.com/package/gulp-webserver)
```bash
npm install --save-dev gulp-webserver
```


### Installation Using the Foundation-CLI

Install the Foundation CLI with this command:

```bash
npm install foundation-cli --global
```

Use this command to set up a blank Foundation for Sites project with the basic template:

```bash
foundation new --framework sites --template basic
```

The CLI will prompt you to give your project a name. The template will be downloaded into a folder with this name.

I named mine: ```feedr-foundation``` for example.

Then open the folder in your command line, and install the ```gulp-webserver``` like so:

```bash
npm install --save-dev gulp-webserver
```

To copy the repo, you can run a ```git pull```.

Alternatively, you can also manually copy in the following files from the repo and place them in their appropriate folder.

Make sure you copy these into the project:

* gulpfile.js
* index.html
* app.scss
* _settings.scss
* _settings-custom.scss
* _feedr.scss
* app.js
* handlebars-v4.0.5.js

Once you have the folder structure ready to go and the dependencies installed, run

```bash
foundation watch
```

This will start the gulp file which contains a live-reload and sass compiler task. 

It will watch for changes and re-load every time you make a change.



### Foundation-CLI Manual Setup

To manually set up the foundation template, first download it with Git:

```bash
git clone https://github.com/zurb/foundation-sites-template projectname
```

Then open the folder in your command line, and install the needed dependencies:

```bash
cd projectname
npm install
bower install
```

Finally, run `npm start` to run the compiler. It will watch for changes and re-load every time you make a change.
