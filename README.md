The Interactive VT Campus Map
=============================

[![Build Status](https://travis-ci.org/VT-EGIS/vt-campus-map.svg?branch=master)](https://travis-ci.org/VT-EGIS/vt-campus-map)

View the live map [here](http://maps.vt.edu/interactive).

Setup Instructions
------------------
1. Clone this repository into the place where your webserver can pick it up and serve it.
   I usually put it in /var/www for apache to detect it.
   `git clone git@github.com:VT-EGIS/vt-campus-map` 
2. Open http://your-domain-name/vt-campus-map in your web browser.

**Note** : If you can not clone into your web server directly, and you have to
manually copy the files, then it is sufficient to copy the following files/folders
to a folder on the webserver.

* `js`
* `css`
* `components`
* `imgs`
* `index.html`

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
3. You make the code changes necessary for widget X to work along with the corresponding test cases.    
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

![](https://i.imgflip.com/8jkzg.jpg)

Testing Locally
---------------
`grunt test` or simply `grunt` will lint all the JavaScript and run all the tests.     
The tests when run using grunt, execute in a headless browser called [PhantomJS](http://phantomjs.org/).
To know more about a failure, it is better to run the tests in a normal browser like Chrome or
Firefox. This can be done by opening http://your-domain-name/vt-campus-map/SpecRunner.html
through your browser.
