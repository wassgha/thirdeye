/*
Name:         cloudsight
Description:  Node.js module to access CloudSight API methods
Author:       Franklin van de Meent (https://frankl.in)
Source code:  https://github.con/fvdm/nodejs-cloudsight
Feedback:     https://github.con/fvdm/nodejs-cloudsight/issues
License:      Unlicense (Public Domain, see LICENSE file)
*/

var config = {
  apikey: null,
  endpoint: 'https://api.cloudsight.ai',
  timeout: 5000
};


/**
 * GUID generator
 *
 * @return  {string}
 */

function guidGenerator () {
  function s4 () {
    return Math.floor ((1 + Math.random ()) * 0x10000)
      .toString (16)
      .substring (1);
  }

  return s4 () + s4 () + '-' + s4 () + '-' + s4 () + '-'
    + s4 () + '-' + s4 () + s4 () + s4 ();
}


/**
 * Process API response
 *
 * @callback callback
 * @param  {Error|null}  err       Error
 * @param  {object}      res       Response data
 * @param  {function}    callback  `(err, data)`
 */

function processResponse (err, res, callback) {
  var error = null;

  // request error
  if (err) {
    error = new Error ('request failed');
    console.log(err);
    error.error = err;
    callback (error);
    return;
  }

  // API error
  if (res.error) {
    error = new Error ('API error');
    error.error = res.error;
    callback (error);
    return;
  }

  // all good
  callback (null, res);
}


/**
 * Communication
 *
 * @param   {object}    props
 * @param   {string}    props.path            i.e. /image_requests/token
 * @param   {string}    [props.method=GET]    GET or POST
 * @param   {object}    [props.data]          Data fields to send
 * @param   {string}    [props.endpoint]      API endpoint override
 * @param   {number}    [props.timeout=5000]  Request timeout override
 * @param   {function}  callback              Process response
 * @return  {void}
 */

function talk (props, callback) {
  var options = {
      method: props.method || 'GET',
      headers: {
        'content-type': 'application/json',
        'authorization': 'CloudSight ' + config.apikey
      },
      ... props.base64 ?
        {
          body: JSON.stringify({
            'image': props.base64,
            'locale': 'en_US'
          })
        } : {}
  };
  fetch(config.endpoint + props.path, options)
  .then(res => res.json())
  .then(data => processResponse (null, data, callback))
  .catch(err => processResponse (err, null, callback));
}


/**
 * Get result data for image
 *
 * @param   {string}    token     Image token
 * @param   {function}  callback
 * @return  {void}
 */

function imageResponses (token, callback) {
  var options = {
    method: 'GET',
    path: '/image_responses/' + token
  };

  talk (options, callback);
}


/**
 * Check status at preferred interval
 *
 * @param   {string}    token     Image token
 * @param   {function}  callback
 * @return  {void}
 */

function pollStatus (token, callback) {
  imageResponses (token, function (err, data) {
    if (err) {
      err.token = token;
      callback (err);
      return;
    }

    if (data.status === 'not completed') {
      setTimeout (function () {
        pollStatus (token, callback);
      }, 1000);
    } else {
      callback (null, data);
    }
  });
}


/**
 * Send an image for processing
 *
 * @param   {object}    props            See README.md
 * @param   {boolean}   [polling=false]  Callback only when ready
 * @param   {function}  callback         Callback response
 * @return  {void}
 */

function imageRequests (props, polling, callback) {
  var options = {
    method: 'POST',
    path: '/image_requests',
  };

  var keys;
  var i;

  if (typeof polling === 'function') {
    callback = polling;
    polling = false;
  }

  // default values
  props.locale = props.locale || 'en-US';
  props.language = props.language || 'en';
  props.device_id = props.device_id || guidGenerator ();

  // image is a file, overrides URL
  if (props.image) {
    options.base64 = 'data:image/png;base64,' + props.image;
    delete props.image;
    delete props.remote_image_url;
  }

  // wrap fieldnames
  if (props.focus_x) {
    options.data ['focus[x]'] = props.focus_x;
    delete props.focus_x;
  }

  if (props.focus_y) {
    options.data ['focus[y]'] = props.focus_y;
    delete props.focus_y;
  }

  // send it
  talk (options, function (err, data) {
    if (err) {
      callback (err);
      return;
    }

    if (polling && data.token) {
      setTimeout (function () {
        pollStatus (data.token, callback);
      }, 4000);

      return;
    }

    callback (null, data);
  });
}


/**
 * Module config and defaults
 *
 * @param   {object}  conf
 * @param   {string}  conf.apikey          Account API key
 * @param   {string}  [conf.endpoint]      Override API endpoint
 * @param   {number}  [conf.timeout=5000]  Override request timeout
 * @return  {object}                       Module methods
 */

module.exports = function (set) {
  config.apikey = set.apikey || null;
  config.endpoint = set.endpoint || config.endpoint;
  config.timeout = set.timeout || config.timeout;

  return {
    request: imageRequests,
    response: imageResponses
  };
};
