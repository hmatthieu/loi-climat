/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const fs = require("fs");

exports.onPostBuild = () => {
  fs.copyFile(`./firebase.json`, `./public/firebase.json`, err => {
    if (err) {
      throw err;
    }
  });
};
