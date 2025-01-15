/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/load-stories.js":
/*!****************************!*\
  !*** ./js/load-stories.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("(__webpack_require__(/*! dotenv */ \"./node_modules/dotenv/lib/main.js\").config)();\nconst fetch = __webpack_require__(/*! node-fetch */ \"./node_modules/node-fetch/browser.js\");\n\nasync function fetchStories() {\n    try {\n        const response = await fetch(\n            `https://api.webflow.com/v2/collections/${\"611592871745f68bef8306cf\"}/items`,\n            {\n                headers: {\n                    'Authorization': `Bearer ${\"522462c5cbcbd4ba1fd3e914162d541bc4b3a7b2fbcdc204d773a721a387ded1\"}`,\n                    'Accept': 'application/json'\n                }\n            }\n        );\n\n        if (!response.ok) {\n            throw new Error(`HTTP error! status: ${response.status}`);\n        }\n\n        const data = await response.json();\n        return data.items\n            .filter(item => !item.isDraft && !item.isArchived)\n            .slice(0, 20)\n            .map(item => ({\n                title: item.fieldData['main-title'],\n                image: item.fieldData['big-thumbnail']?.url || '',\n                summary: item.fieldData['content-summary'] || '',\n                slug: item.fieldData.slug\n            }));\n    } catch (error) {\n        console.error('Error fetching stories:', error);\n        return [];\n    }\n}\n\n// Function to create a card element\nfunction createCard(story) {\n    return `\n        <div class=\"card\">\n            <img src=\"${story.image}\" alt=\"${story.title}\" class=\"card-image\">\n            <div class=\"card-content\">\n                <h2 class=\"card-title\">${story.title}</h2>\n                <p class=\"card-text\">${story.summary}</p>\n                <a href=\"/stories/${story.slug}\" class=\"read-more\">Read More</a>\n            </div>\n        </div>\n    `;\n}\n\n// Function to update the page with stories\nasync function updateStoriesGrid() {\n    const stories = await fetchStories();\n    const gridContainer = document.querySelector('.cards-grid');\n    if (gridContainer) {\n        gridContainer.innerHTML = stories.map(story => createCard(story)).join('');\n    }\n}\n\n// Initialize when the DOM is loaded\ndocument.addEventListener('DOMContentLoaded', updateStoriesGrid);\n\n\n//# sourceURL=webpack://explorevisitplay/./js/load-stories.js?");

/***/ }),

/***/ "./node_modules/dotenv/lib/main.js":
/*!*****************************************!*\
  !*** ./node_modules/dotenv/lib/main.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const fs = __webpack_require__(/*! fs */ \"?a0c3\")\nconst path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'path'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))\nconst os = __webpack_require__(Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'os'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))\nconst crypto = __webpack_require__(Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'crypto'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))\nconst packageJson = __webpack_require__(/*! ../package.json */ \"./node_modules/dotenv/package.json\")\n\nconst version = packageJson.version\n\nconst LINE = /(?:^|^)\\s*(?:export\\s+)?([\\w.-]+)(?:\\s*=\\s*?|:\\s+?)(\\s*'(?:\\\\'|[^'])*'|\\s*\"(?:\\\\\"|[^\"])*\"|\\s*`(?:\\\\`|[^`])*`|[^#\\r\\n]+)?\\s*(?:#.*)?(?:$|$)/mg\n\n// Parse src into an Object\nfunction parse (src) {\n  const obj = {}\n\n  // Convert buffer to string\n  let lines = src.toString()\n\n  // Convert line breaks to same format\n  lines = lines.replace(/\\r\\n?/mg, '\\n')\n\n  let match\n  while ((match = LINE.exec(lines)) != null) {\n    const key = match[1]\n\n    // Default undefined or null to empty string\n    let value = (match[2] || '')\n\n    // Remove whitespace\n    value = value.trim()\n\n    // Check if double quoted\n    const maybeQuote = value[0]\n\n    // Remove surrounding quotes\n    value = value.replace(/^(['\"`])([\\s\\S]*)\\1$/mg, '$2')\n\n    // Expand newlines if double quoted\n    if (maybeQuote === '\"') {\n      value = value.replace(/\\\\n/g, '\\n')\n      value = value.replace(/\\\\r/g, '\\r')\n    }\n\n    // Add to object\n    obj[key] = value\n  }\n\n  return obj\n}\n\nfunction _parseVault (options) {\n  const vaultPath = _vaultPath(options)\n\n  // Parse .env.vault\n  const result = DotenvModule.configDotenv({ path: vaultPath })\n  if (!result.parsed) {\n    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`)\n    err.code = 'MISSING_DATA'\n    throw err\n  }\n\n  // handle scenario for comma separated keys - for use with key rotation\n  // example: DOTENV_KEY=\"dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenvx.com/vault/.env.vault?environment=prod\"\n  const keys = _dotenvKey(options).split(',')\n  const length = keys.length\n\n  let decrypted\n  for (let i = 0; i < length; i++) {\n    try {\n      // Get full key\n      const key = keys[i].trim()\n\n      // Get instructions for decrypt\n      const attrs = _instructions(result, key)\n\n      // Decrypt\n      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key)\n\n      break\n    } catch (error) {\n      // last key\n      if (i + 1 >= length) {\n        throw error\n      }\n      // try next key\n    }\n  }\n\n  // Parse decrypted .env string\n  return DotenvModule.parse(decrypted)\n}\n\nfunction _log (message) {\n  console.log(`[dotenv@${version}][INFO] ${message}`)\n}\n\nfunction _warn (message) {\n  console.log(`[dotenv@${version}][WARN] ${message}`)\n}\n\nfunction _debug (message) {\n  console.log(`[dotenv@${version}][DEBUG] ${message}`)\n}\n\nfunction _dotenvKey (options) {\n  // prioritize developer directly setting options.DOTENV_KEY\n  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {\n    return options.DOTENV_KEY\n  }\n\n  // secondary infra already contains a DOTENV_KEY environment variable\n  if (\"MISSING_ENV_VAR\".DOTENV_KEY && \"MISSING_ENV_VAR\".DOTENV_KEY.length > 0) {\n    return \"MISSING_ENV_VAR\".DOTENV_KEY\n  }\n\n  // fallback to empty string\n  return ''\n}\n\nfunction _instructions (result, dotenvKey) {\n  // Parse DOTENV_KEY. Format is a URI\n  let uri\n  try {\n    uri = new URL(dotenvKey)\n  } catch (error) {\n    if (error.code === 'ERR_INVALID_URL') {\n      const err = new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development')\n      err.code = 'INVALID_DOTENV_KEY'\n      throw err\n    }\n\n    throw error\n  }\n\n  // Get decrypt key\n  const key = uri.password\n  if (!key) {\n    const err = new Error('INVALID_DOTENV_KEY: Missing key part')\n    err.code = 'INVALID_DOTENV_KEY'\n    throw err\n  }\n\n  // Get environment\n  const environment = uri.searchParams.get('environment')\n  if (!environment) {\n    const err = new Error('INVALID_DOTENV_KEY: Missing environment part')\n    err.code = 'INVALID_DOTENV_KEY'\n    throw err\n  }\n\n  // Get ciphertext payload\n  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`\n  const ciphertext = result.parsed[environmentKey] // DOTENV_VAULT_PRODUCTION\n  if (!ciphertext) {\n    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`)\n    err.code = 'NOT_FOUND_DOTENV_ENVIRONMENT'\n    throw err\n  }\n\n  return { ciphertext, key }\n}\n\nfunction _vaultPath (options) {\n  let possibleVaultPath = null\n\n  if (options && options.path && options.path.length > 0) {\n    if (Array.isArray(options.path)) {\n      for (const filepath of options.path) {\n        if (fs.existsSync(filepath)) {\n          possibleVaultPath = filepath.endsWith('.vault') ? filepath : `${filepath}.vault`\n        }\n      }\n    } else {\n      possibleVaultPath = options.path.endsWith('.vault') ? options.path : `${options.path}.vault`\n    }\n  } else {\n    possibleVaultPath = path.resolve(process.cwd(), '.env.vault')\n  }\n\n  if (fs.existsSync(possibleVaultPath)) {\n    return possibleVaultPath\n  }\n\n  return null\n}\n\nfunction _resolveHome (envPath) {\n  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath\n}\n\nfunction _configVault (options) {\n  _log('Loading env from encrypted .env.vault')\n\n  const parsed = DotenvModule._parseVault(options)\n\n  let processEnv = \"MISSING_ENV_VAR\"\n  if (options && options.processEnv != null) {\n    processEnv = options.processEnv\n  }\n\n  DotenvModule.populate(processEnv, parsed, options)\n\n  return { parsed }\n}\n\nfunction configDotenv (options) {\n  const dotenvPath = path.resolve(process.cwd(), '.env')\n  let encoding = 'utf8'\n  const debug = Boolean(options && options.debug)\n\n  if (options && options.encoding) {\n    encoding = options.encoding\n  } else {\n    if (debug) {\n      _debug('No encoding is specified. UTF-8 is used by default')\n    }\n  }\n\n  let optionPaths = [dotenvPath] // default, look for .env\n  if (options && options.path) {\n    if (!Array.isArray(options.path)) {\n      optionPaths = [_resolveHome(options.path)]\n    } else {\n      optionPaths = [] // reset default\n      for (const filepath of options.path) {\n        optionPaths.push(_resolveHome(filepath))\n      }\n    }\n  }\n\n  // Build the parsed data in a temporary object (because we need to return it).  Once we have the final\n  // parsed data, we will combine it with process.env (or options.processEnv if provided).\n  let lastError\n  const parsedAll = {}\n  for (const path of optionPaths) {\n    try {\n      // Specifying an encoding returns a string instead of a buffer\n      const parsed = DotenvModule.parse(fs.readFileSync(path, { encoding }))\n\n      DotenvModule.populate(parsedAll, parsed, options)\n    } catch (e) {\n      if (debug) {\n        _debug(`Failed to load ${path} ${e.message}`)\n      }\n      lastError = e\n    }\n  }\n\n  let processEnv = \"MISSING_ENV_VAR\"\n  if (options && options.processEnv != null) {\n    processEnv = options.processEnv\n  }\n\n  DotenvModule.populate(processEnv, parsedAll, options)\n\n  if (lastError) {\n    return { parsed: parsedAll, error: lastError }\n  } else {\n    return { parsed: parsedAll }\n  }\n}\n\n// Populates process.env from .env file\nfunction config (options) {\n  // fallback to original dotenv if DOTENV_KEY is not set\n  if (_dotenvKey(options).length === 0) {\n    return DotenvModule.configDotenv(options)\n  }\n\n  const vaultPath = _vaultPath(options)\n\n  // dotenvKey exists but .env.vault file does not exist\n  if (!vaultPath) {\n    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`)\n\n    return DotenvModule.configDotenv(options)\n  }\n\n  return DotenvModule._configVault(options)\n}\n\nfunction decrypt (encrypted, keyStr) {\n  const key = Buffer.from(keyStr.slice(-64), 'hex')\n  let ciphertext = Buffer.from(encrypted, 'base64')\n\n  const nonce = ciphertext.subarray(0, 12)\n  const authTag = ciphertext.subarray(-16)\n  ciphertext = ciphertext.subarray(12, -16)\n\n  try {\n    const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce)\n    aesgcm.setAuthTag(authTag)\n    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`\n  } catch (error) {\n    const isRange = error instanceof RangeError\n    const invalidKeyLength = error.message === 'Invalid key length'\n    const decryptionFailed = error.message === 'Unsupported state or unable to authenticate data'\n\n    if (isRange || invalidKeyLength) {\n      const err = new Error('INVALID_DOTENV_KEY: It must be 64 characters long (or more)')\n      err.code = 'INVALID_DOTENV_KEY'\n      throw err\n    } else if (decryptionFailed) {\n      const err = new Error('DECRYPTION_FAILED: Please check your DOTENV_KEY')\n      err.code = 'DECRYPTION_FAILED'\n      throw err\n    } else {\n      throw error\n    }\n  }\n}\n\n// Populate process.env with parsed values\nfunction populate (processEnv, parsed, options = {}) {\n  const debug = Boolean(options && options.debug)\n  const override = Boolean(options && options.override)\n\n  if (typeof parsed !== 'object') {\n    const err = new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate')\n    err.code = 'OBJECT_REQUIRED'\n    throw err\n  }\n\n  // Set process.env\n  for (const key of Object.keys(parsed)) {\n    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {\n      if (override === true) {\n        processEnv[key] = parsed[key]\n      }\n\n      if (debug) {\n        if (override === true) {\n          _debug(`\"${key}\" is already defined and WAS overwritten`)\n        } else {\n          _debug(`\"${key}\" is already defined and was NOT overwritten`)\n        }\n      }\n    } else {\n      processEnv[key] = parsed[key]\n    }\n  }\n}\n\nconst DotenvModule = {\n  configDotenv,\n  _configVault,\n  _parseVault,\n  config,\n  decrypt,\n  parse,\n  populate\n}\n\nmodule.exports.configDotenv = DotenvModule.configDotenv\nmodule.exports._configVault = DotenvModule._configVault\nmodule.exports._parseVault = DotenvModule._parseVault\nmodule.exports.config = DotenvModule.config\nmodule.exports.decrypt = DotenvModule.decrypt\nmodule.exports.parse = DotenvModule.parse\nmodule.exports.populate = DotenvModule.populate\n\nmodule.exports = DotenvModule\n\n\n//# sourceURL=webpack://explorevisitplay/./node_modules/dotenv/lib/main.js?");

/***/ }),

/***/ "./node_modules/node-fetch/browser.js":
/*!********************************************!*\
  !*** ./node_modules/node-fetch/browser.js ***!
  \********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
eval("\n\n// ref: https://github.com/tc39/proposal-global\nvar getGlobal = function () {\n\t// the only reliable means to get the global object is\n\t// `Function('return this')()`\n\t// However, this causes CSP violations in Chrome apps.\n\tif (typeof self !== 'undefined') { return self; }\n\tif (typeof window !== 'undefined') { return window; }\n\tif (typeof __webpack_require__.g !== 'undefined') { return __webpack_require__.g; }\n\tthrow new Error('unable to locate global object');\n}\n\nvar globalObject = getGlobal();\n\nmodule.exports = exports = globalObject.fetch;\n\n// Needed for TypeScript and Webpack.\nif (globalObject.fetch) {\n\texports[\"default\"] = globalObject.fetch.bind(globalObject);\n}\n\nexports.Headers = globalObject.Headers;\nexports.Request = globalObject.Request;\nexports.Response = globalObject.Response;\n\n\n//# sourceURL=webpack://explorevisitplay/./node_modules/node-fetch/browser.js?");

/***/ }),

/***/ "?a0c3":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://explorevisitplay/fs_(ignored)?");

/***/ }),

/***/ "./node_modules/dotenv/package.json":
/*!******************************************!*\
  !*** ./node_modules/dotenv/package.json ***!
  \******************************************/
/***/ ((module) => {

"use strict";
eval("module.exports = /*#__PURE__*/JSON.parse('{\"name\":\"dotenv\",\"version\":\"16.4.7\",\"description\":\"Loads environment variables from .env file\",\"main\":\"lib/main.js\",\"types\":\"lib/main.d.ts\",\"exports\":{\".\":{\"types\":\"./lib/main.d.ts\",\"require\":\"./lib/main.js\",\"default\":\"./lib/main.js\"},\"./config\":\"./config.js\",\"./config.js\":\"./config.js\",\"./lib/env-options\":\"./lib/env-options.js\",\"./lib/env-options.js\":\"./lib/env-options.js\",\"./lib/cli-options\":\"./lib/cli-options.js\",\"./lib/cli-options.js\":\"./lib/cli-options.js\",\"./package.json\":\"./package.json\"},\"scripts\":{\"dts-check\":\"tsc --project tests/types/tsconfig.json\",\"lint\":\"standard\",\"pretest\":\"npm run lint && npm run dts-check\",\"test\":\"tap run --allow-empty-coverage --disable-coverage --timeout=60000\",\"test:coverage\":\"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov\",\"prerelease\":\"npm test\",\"release\":\"standard-version\"},\"repository\":{\"type\":\"git\",\"url\":\"git://github.com/motdotla/dotenv.git\"},\"funding\":\"https://dotenvx.com\",\"keywords\":[\"dotenv\",\"env\",\".env\",\"environment\",\"variables\",\"config\",\"settings\"],\"readmeFilename\":\"README.md\",\"license\":\"BSD-2-Clause\",\"devDependencies\":{\"@types/node\":\"^18.11.3\",\"decache\":\"^4.6.2\",\"sinon\":\"^14.0.1\",\"standard\":\"^17.0.0\",\"standard-version\":\"^9.5.0\",\"tap\":\"^19.2.0\",\"typescript\":\"^4.8.4\"},\"engines\":{\"node\":\">=12\"},\"browser\":{\"fs\":false}}');\n\n//# sourceURL=webpack://explorevisitplay/./node_modules/dotenv/package.json?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./js/load-stories.js");
/******/ 	
/******/ })()
;