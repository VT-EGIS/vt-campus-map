The Interactive VT Campus Map
=============================

[![Build Status](https://travis-ci.org/VT-EGIS/vt-campus-map.svg?branch=master)](https://travis-ci.org/VT-EGIS/vt-campus-map)

View the live map [here](http://maps.vt.edu/interactive).

Setup Instructions
------------------
1. Clone this repository (along with the submodules)
   into the place where your webserver can pick it up and serve it.   
   For example, put it in `/var/www` for apache to detect it.    
   `git clone --recursive git@github.com:VT-EGIS/vt-campus-map` 
2. Open http://your-domain-name/vt-campus-map in your web browser.

**Note** : If you can not clone into your web server directly, and you have to
manually copy the files, then it is sufficient to copy the following files/folders
to a folder on the webserver.

* `js`
* `css`
* `vendor`
* `imgs`
* `index.html`

Getting Started
---------------
VT Campus Maps is a JavaScript-based project and uses the
[Dojo Toolkit](http://dojotoolkit.org/) along with the
[ArcGIS JS API](https://developers.arcgis.com/javascript/).

The JavaScript source of the project lies in the `js` folder.

A good starting point would be reading the `js/main.js` file
along with the `index.html` file.

The `js/config.js` file contains configuration details only and
no business logic.

All the widgets are arranged in a hierarchical directory structure,
within the `js/widgets` directory,
with a one-to-one correspondence with how they appear in the map.
For example, the navigation bar contains the two search widgets and
so their source code can be found in `js/widgets/navbar/widgets/search_by_name/main.js`
and `js/widgets/navbar/widgets/search_by_category/main.js`

Contributing
------------
We follow the [Feature Branch Workflow](https://www.atlassian.com/git/workflows#!workflow-feature-branch).
A common routine would go like this.

1. You are going to start working on feature "add widget X to the map".
  First, you update your master branch by pulling in all the latest changes.    
  `git checkout master`    
  `git pull`
2. Next, you create a new branch for your feature.    
  `git checkout -b add_widget_X`
3. You make the code changes necessary for widget X to work along with the corresponding test cases
   written using the [Intern](https://theintern.github.io/) framework.    
  `change some files ...`     
  `...`     
  `git commit`     
  `change some more files`     
  `...`     
  `...`     
  `git commit`     
  `...`     
  `and so on ...`     
4. Once you're done with your changes. Run all the tests [locally](#testing-locally) to see if you broke anything.    
5. Fix all the broken tests.
6. Push your branch upstream to Github.     
  `git push origin add_widget_X`     
7. On Github, [create a new pull request](https://help.github.com/articles/creating-a-pull-request)
  for your branch.
  **Do not click on the merge button**.
8. After the PR has been created, a request will be sent to Travis CI to test your code. Wait until
  you see the green check mark with a success message that says all the tests have passed. If it fails,
  fix the broken tests (it shouldn't if you've already tested locally).
  **Still do not merge**
9. Send a request for review message to all the members of the team. This helps with two things -
    * Everyone knows what you're working on and gets to read parts of the code they wouldn't have otherwise.
    * It helps maintain the quality of the code through code review comments.
10. Fix your code based on the code review comments.
11. After at least 1 team member has approved your code, you can finally merge your changes
  to master by clicking on the merge button.

Testing Locally
---------------
Before running the tests, all the dependencies need to be installed on your machine.

1. Run `npm install` to install the node.js modules.
2. Run `bower install` to install the dojo libraries.
3. Run `grunt slurp` to download the arcgis javascript library.
4. Install [grunt-cli](http://gruntjs.com/getting-started#installing-the-cli).

In order to be able to run the tests, you will need

1. A web server.
2. A Sauce Labs sub-account.
3. A Travis CI account linked to your Github account.

There are 2 steps to testing locally before pushing your changes to Github.

1. Run the intern tests in the browser by visiting the url
   http://your-domain-name/vt-campus-map/node\_modules/intern/client.html?config=tests/intern. 
2. If all tests pass in the browser, lint the JS and run the tests in the
   SauceLabs cloud environment using the command `grunt test`.

Features
--------

**Map**

1. Map Info Manager - Clicking on the map provides information about the place(s) at that point.
2. Panning the map using click and drag.
3. Zooming in/out using scrollwheel and zoom buttons on top left.
4. Centering on the original map position using the home button on the top left.
5. Finding your location using the locator button on the top left below the home button.

**Navigation Bar**

1. Changing background map type.
2. Finding places by name (supports searching by speech and text).
3. Finding places by category.
4. Set of featured places or bookmarks.
5. Toggling layer visibility.
6. Map legend. 
