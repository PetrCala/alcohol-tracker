# Kiroku documentation
___

Welcome to the Kiroku documentation. [Jekyll](https://jekyllrb.com) is used to serve `.html` and `.md` files both locally and through GitHub pages.

### Table of Contents
- [Kiroku documentation](#kiroku-documentation)
    - [Table of Contents](#table-of-contents)
- [Building the Documentation](#building-the-documentation)
  - [Pre-requisites](#pre-requisites)
  - [Steps](#steps)
- [Documentation structure](#documentation-structure)

# Building the Documentation

## Pre-requisites

- First you should install Jekyll on your machine. This can be easily achieved by following the [Jekyll official website](https://jekyllrb.com). Ideally, the steps should be as follows

    ```
    gem install bundler jekyll
    cd docs
    bundle install
    ```

- If you encounter any problems during this phase, see the [Jekyll troubleshooting section](https://jekyllrb.com/docs/troubleshooting/#no-sudo). Feel free to let me know if you feel like there is any issue common enough that should be addressed here.

## Steps

1. In a terminal, navigate to the project root.
1. Run
    ```bash
    bun run docs
    ```
1. This will start local hosting on the default address of `http:127.0.0:4000/`. Open this address in your browser to view the documentation.
1. Modifying any `.html` or `.md` files should auto-refresh the page upon save.

# Documentation structure

TBA

<!-- How to link stuff without repeating yourself -->
<!-- [jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/ -->
