﻿# Piiquante

---
## Requirements

For development, you will only need Node.js and a node global package, npm, installed in your environement.

### Node
- #### Node installation on Windows (+npm)

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.

## Install

    $ git clone https://github.com/Kent-33/piiquante
    $ cd .\frontend\
    $ npm install  
    $ cd ..  
    $ cd .\back\
    $ npm install
    
    # Ajouter un dossier image dans le dossier back

## Configure app

Dupplicate `back/.example-env`, rename it to '.env' then edit it with your settings. You will need:

- DB_URL;
- DB_USER;
- DB_PWD;

## Running the project

    $ cd .\frontend\
    $ npm run start    
    $ cd .\back\
    $ nodemon server
