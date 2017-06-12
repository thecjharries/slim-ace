# `@wizardsoftheweb/slim-ace`

Opinionated [Ace](https://ace.c9.io/) build and customization tools.

## Install

```
npm install --save-dev @wizardsoftheweb/slim-ace
```
Don't install it globally. How can anyone looking at your code retrace your steps if you've committed and pushed a blackbox build result?

## Usage
```
slim-ace -h
```

## Overview
### What?

[Ace](https://ace.c9.io/) is a pretty neat tool. Building with Ace isn't very neat. You're limited to either a minimal build or including the kitchen sink. Plus its customization tools haven't been updated in forever.

The goal of this project is to take a repo like [ace-builds](https://github.com/ajaxorg/ace-builds) (or your own fork!) as a source, apply some rules, and spit out a usable Ace instance. Eventually, I'd like to be able to include extra build steps, like including new `tmThemes` or adding `tmLanguage` files.

I'm not affliated with Ace. They provide a great tool and I'd like to make it better.

### Why?

I'm not adding this to the [main repo](https://github.com/ajaxorg/ace) for a few reasons. This whole project started because I discovered it's ridiculously difficult to create and edit language files and themes in Sublime or VS Code and wanted to find something that worked for me. While sending off some bugfix PRs, I kept getting frustrated because I couldn't reasonably create PRs with the changes I wanted to make. The main repo's [tools](https://github.com/ajaxorg/ace/tree/master/tool) are woefully outdated, mostly undocumented, unfortunately brittle (i.e. you can only use them exactly the way the authors intended), and impossible to test. The most important reason is code ownership. With my own package, I can do what I want, when I want, and how I want. That's the beautify of open source. I've scoped the package too, for similar, opinionated reasons. If you wouldn't pollute your global namespace, why would you pollute everyone else's?

Ideally, `slim-ace` will be useful in a few situations. Setting up a simple dev environment, quickly deploying streamlined prototypes, and easy reduced production builds aren't possible in the status quo without, at some point, committing a completed, blackbox build. Customization is daunting, if not overwhelming. I'd like to change that. Honestly, though, I'm writing this because I want this tool. I don't know if anyone else will.

All of that being said, Ace is an amazing project. It's a great editor and easily extensible. Even better, you can edit `tmLanguage` and `tmTheme` files in one window while verifying the changes with a simple page refresh in another window. I chose to build this around Ace because it's a fantastic tool. If I can send anything more upstream, I absolutely plan to.

### TextMate?

I care about TextMate [languages](http://manual.macromates.com/en/language_grammars#language_grammars) and [themes](http://manual.macromates.com/en/themes#themes) because they are, at the moment, fairly standard. They're not perfect, you have to run a build process on them for anything other than TextMate, and there are certainly more featureful options. However, they're ubiquitous and easy to use. Rather than try to adopt a some sort of common standard and extend individually from that, all of the editors I use regularly are working hard to outdo each other with complicated, proprietary files that bind users to the platform. I think that's really dumb. While I think it would be awesome to have access to have beefy, cutting-edge regex and extensible theme variables, I think platform-agnostic, repeatable results and distributable code are more important.

## Roadmap

* Main features
    - Convert this to a progress table
    - Include help in markdown somewhere
    - Define options and configuration
    - Copy source files
    - Build from source files (e.g. customize and minify)
    - Full Ace lib support (ace-builds doesn't include the necessary files to, say, [complete the highlighter tutorial](https://ace.c9.io/#nav=higlighter))
    - `tmLanguage` parsing (initially from the plist, then from the YAML, JSON, and all that) (probably going to break this out somehow)
    - `tmTheme` parsing (initially from the plist, then from the YAML, JSON, and all that) (probably going to break this out somehow)
* Eventual features
    - None for the moment, but I'm not immune to feature creep
