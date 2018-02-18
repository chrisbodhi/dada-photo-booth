#! /usr/bin/env node

import fs from 'fs';
import request from 'request';

class Image {
  constructor ({path = null, url = null, base64 = null}) {
    this.path = path;
    this.url = url;
    this.base64 = base64;
  }

  load () {
    return new Promise((resolve, reject) => {
      if (this.path) {
        resolve(Buffer.from(fs.readFileSync(this.path).toString('base64'), 'base64'));
      } else if (this.url) {
        this.loadRemote().then(resolve).catch(e => reject(e));
      } else if (this.base64) {
        // remove 'data:image/jpeg;base64,' if included
        this.base64 = this.base64.substring(this.base64.indexOf(',') + 1);
        resolve(Buffer.from(this.base64, 'base64'));
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({msg: 'Image : can\'t load from path, url, base64'});
      }
    });
  }

  loadRemote () {
    return new Promise((resolve, reject) => {
      request({
        url: this.url,
        encoding: null
      }, (err, response, body) => {
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({msg: `Image : can't be load from url ${err}`});
        } else if (response.statusCode === 200) {
          resolve(Buffer.from(body));
        }
      });
    });
  }

  build () {
    return new Promise((resolve, reject) => {
      this.load().then((content) => {
        resolve(content);
      }).catch(e => reject(e));
    });
  }
}

export default Image;
