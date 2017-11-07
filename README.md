# react-conductor

[![Build Status](https://travis-ci.org/Vlemert/react-conductor.svg?branch=master)](https://travis-ci.org/Vlemert/react-conductor)

Creating Electron applications using React.

Inspired by [react-ionize](https://github.com/mhink/react-ionize).

`react-conductor` is a library that aims to narrow the divide between an Electron application's `main` and `renderer` processes when working with React. It allows you to apply the concepts you're already used to in your `renderer` processes, to the `main` process of your application. 

## Example
Code is worth a thousand words, so here's an example:
```
import React from 'react';
import { render, App, Window } from '@react-conductor/core';

const Application = () => (
  <App>
    <Window show path={path.resolve(__dirname, 'index.html')} />
  </App>
);

render(<Application />);

```

## Here be dragons
Please keep in mind this project is still very much in development. There is more missing than there is already implemented.

## Want to help out?
Help is of course very much welcome. As this project runs on React's Fiber, the code can be quite overwhelming when reading it the first time (or the first several times).

I tried to document what's going on inside, but that's probably not sufficient in places.

If you know nothing about Fiber / custom React renderers, I recommend you start here:
[https://github.com/nitin42/Making-a-custom-React-renderer](https://github.com/nitin42/Making-a-custom-React-renderer)

## API
TODO
