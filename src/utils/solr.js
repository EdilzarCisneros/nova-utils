import { HttpClient } from "../http-client/index";
import { DateUtils, INPUT_FORMATS } from "./date-utils";

const SORT = {
  ASC: "asc",
  DESC: "desc"
};

const LOGICAL_OPEATORS = {
  AND: "AND",
  OR: "OR",
  NOT: "!",
  PROHIBIT: "-",
  REQUIRED: "+"
};

const NOVA_SOLR_DEFAULTS = {
  get: "/myservices/search-service/doRequest/dp-content/dprender",
  post: ""
};

const SOLR_FORMAT_DATE = "YYYY-MM-DDThh:mm:ss";
const STRICT_ROLES_PARAM = "targetingRoles=true";

class Solr {

  /**
   * It receives the base url to Solr
   * @param baseUrl
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.queryString = "";
    this.parseMap = {};
    this.usePost = false;
    this.postQuery = {
      query: [],
      filter: []
    };
    this.isQueryIncluded = false;
    this.restrictRoles = false;
  };


  static get FIELDS() {
    return {
      ID: "id",
      LIBRARY_LOCALE: "documentlibrarylocale",
      TITLE: "title",
      SHORT_TITLE: "shorttitle",
      NAME: "name",
      DESCRIPTION: "description",
      SUMMARY: "summary",
      IMG_CAPTION: "imagecaption",
      THUMB_CAPTION: "thumbnailcaption",
      WCM_PATH: "wcmpath",
      WCM_TITLE_PATH: "wcmtitlepath",
      AUTH_TEMPLATE: "authtemplate",
      REFERENCE_URL_NAME: "referenceurlname",
      CONTENT_TYPE: "contenttype",
      CONTENT_TYPE_TITLE: "contenttypetitle",
      CONTENT_TYPE_PATH: "contenttypepath",
      CONTENT_TYPE_PATH_TITLE: "contenttypepathtitle",
      AUDIENCE_COUNTRY: "audiencecountry",
      AUDIENCE_COUNTRY_TITLE: "audiencecountrytitle",
      AUDIENCE_COUNTRY_PATH: "audiencecountrypath",
      AUDIENCE_COUNTRY_PATH_TITLE: "audiencecountrypathtitle",
      AUDIENCE_BRAND: "audiencebrand",
      AUDIENCE_BRAND_TITLE: "audiencebrandtitle",
      RELATED_HUBS: "relatedHubs",
      RELATED_HUBS_TITLE: "relatedHubstitle",
      RELATED_HUBS_PATH: "relatedHubspath",
      RELATED_HUBS_PATH_TITLE: "relatedHubspathtitle",
      TARGET_ROLE: "targetingRole",
      TARGET_ROLE_TITLE: "targetingRoletitle",
      TARGET_ROLE_PATH: "targetingRolepath",
      TARGET_ROLE_PATH_TITLE: "targetingRolepathtitle",
      PUBLISH_DATE: "publishdate",
      LIBRARY_NAME: "documentlibraryname",
      ICON: "icon",
      LINK: "link",
      MORE_INFO: "moreInformation",
      THUMBNAIL: "thumbnail",
      IMAGE: "image",
      PORTAL_LOCATION: "portallocation",
      PORTAL_LOCATION_TITLE: "portallocationtitle",
      PORTAL_LOCATION_PATH: "portallocationpath",
      PORTAL_LOCATION_PATH_TITLE: "portallocationpathtitle",
      CATEGORIES: "categories",
      CATEGORIES_TITLE: "categoriestitle",
      CATEGORIES_PATH: "categoriespath",
      CATEGORIES_PATH_TITLE: "categoriespathtitle",
      ANSWER: "answer",
      TOPICS: "topics",
      TOPICS_TITLE: "topicstitle",
      TOPICS_PATH: "topicspath",
      TOPICS_TITLE_PATH: "topicstitlepath",
      START_DATE: "startDateAndTime",
      END_DATE: "endDateAndTime",
      QUESTION_TYPE: "questionType",
      LOCATION: "location",
      NAME_SORT: "namesorting",
      TITLE_SORT: "titlesorting"
    };
  };

  /**
   * @method strictString: this function makes strict an string.
   * @param clause
   * @returns {string}
   */
  static strictString(clause) {
    return this.prototype.__validString(clause) ? `"${clause}"` : "";
  }

  /**
   * @method and: The AND operator matches documents where both terms exist anywhere
   * in the text of a single document.
   * @param leftClause
   * @param rightClause
   * @param useParentheses
   * @returns {string}
   */
  static and(leftClause, rightClause, useParentheses = true) {
    return this.prototype.__addMultiClause(leftClause, rightClause, LOGICAL_OPEATORS.AND, useParentheses);
  }

  /**
   * @method or: The OR operator links two terms and finds a matching document if either
   * of the terms exist in a document.
   * @param {string} leftClause
   * @param {string | Array<string>} rightClause
   * @param {Boolean} useParentheses
   * @returns {string}
   */
  static or(leftClause, rightClause, useParentheses = true) {
    return this.prototype.__addMultiClause(leftClause, rightClause, LOGICAL_OPEATORS.OR, useParentheses);
  }

  /**
   * @method not: The NOT operator excludes documents that contain the term after NOT.
   * @param {string} clause
   * @param useParentheses
   * @returns {string}
   */
  static not(clause, useParentheses = true) {
    return this.prototype.__addSingleClause(clause, LOGICAL_OPEATORS.NOT, useParentheses);
  }

  /**
   * @method prohibit: Prohibits the following term (that is, matches on fields or documents
   * that do not include that term).
   * @param {string} clause
   * @param useParentheses
   * @returns {string}
   */
  static prohibit(clause, useParentheses = true) {
    return this.prototype.__addSingleClause(clause, LOGICAL_OPEATORS.PROHIBIT, useParentheses);
  }

  /**
   * @method required: requires that the term after required symbol exist somewhere in a field
   * in at least one document in order for the query to return a match.
   * @param {string} clause
   * @param useParentheses
   * @returns {string}
   */
  static required(clause, useParentheses = true) {
    return this.prototype.__addSingleClause(clause, LOGICAL_OPEATORS.REQUIRED, useParentheses);
  }

  /**
   * @method date: Add date value parsing the inputs to Solr valid format.
   * @param {string} startDate
   * @param {string} inputFormatDate | default: YYYY-MM-DD HH:mm:ss
   * @param {string} finishDate | default: *
   * @returns {string}
   */
  static date(startDate, inputFormatDate = INPUT_FORMATS.ISO, finishDate = "*") {
    if (!this.prototype.__validString(startDate) && !this.prototype.__validString(finishDate)) return "";
    startDate = DateUtils.formatCustomDate(startDate, SOLR_FORMAT_DATE, inputFormatDate);
    if (finishDate !== "*") {
      finishDate = DateUtils.formatCustomDate(finishDate, SOLR_FORMAT_DATE, inputFormatDate);
    }

    return `[${startDate}Z TO ${finishDate}]`;
  }

  /**
   * @method dateFromNow: Add value to filter from today to an specific date or to any date.
   * @param {string} finishDate | default: *
   * @param {string} inputFormatDate | default: YYYY-MM-DD HH:mm:ss
   * @returns {string}
   */
  static dateFromNow(finishDate = "*", inputFormatDate = INPUT_FORMATS.ISO) {
    if (!this.prototype.__validString(finishDate)) return "";

    if (finishDate !== "*") {
      finishDate = DateUtils.formatCustomDate(finishDate, SOLR_FORMAT_DATE, inputFormatDate);
    }
    return `[NOW/DAY TO ${finishDate}]`;
  }


  /**
   * @method post: this method allow the POST request.
   * @returns {Solr}
   */
  post() {
    this.usePost = true;
    return this;
  }

  /**
   * @method addMapperKeyValue: Add a pair (key, value) with the equivalences
   * that you expect to receive after the query.
   * @param key
   * @param value
   */
  addMapperKeyValue(key, value) {
    if (!this.__validString(key) && !this.__validString(value)) return this;
    this.parseMap[key] = value;
    return this;
  }

  /**
   * @method addMapperObject: Add a object with the equivalences that you expect
   * to receive after the query.
   * @param {Object} obj
   */
  addMapperObject(obj) {
    if (!this.__validObj(obj)) return this;
    this.parseMap = Object.assign(this.parseMap, obj);
    return this;
  }

  /**
   * @method fq: fq is used to reduce the superset of documents that can be returned.
   * @param params
   * @returns {Solr}
   */
  fq(params) {
    if (!this.__validString(params)) return this;
    if (this.usePost) {
      this.postQuery.filter.push(params);
    } else {
      this.queryString += this.__addQueryParam(params ? `fq=${params}` : "");
    }
    return this;
  }

  /**
   * @method q: q is used to restrict Solr query.
   * @param params
   * @returns {Solr}
   */
  q(params) {
    console.log(params);
    if (!this.__validString(params)) return this;
    if (this.usePost) {
      this.postQuery.query.push(params);
    } else {
      this.queryString += this.__addQueryParam(params ? `q=${params}` : "");
    }
    this.isQueryIncluded = true;
    return this;
  }


  /**
   * @method fl: fields list is used to limit the fields that you are expecting from Solr.
   * @param elements
   * @returns {Solr}
   */
  fl(elements) {
    if (this.usePost) {
      this.postQuery.fields = elements;
    } else {
      if (Array.isArray(elements) && elements.length) {
        this.queryString += this.__addQueryParam(`fl=${elements.join(",")}`);
      }
    }
    return this;
  }

  /**
   * @method sort: Add sort parameter to query.
   * @param paramName
   * @param asc
   * @returns {Solr}
   */
  sort(paramName, asc = true) {

    if (!Array.isArray(paramName) && !Array.isArray(asc)) {
      paramName = [paramName];
      asc = [asc];
    }

    if (this.usePost) {
      this.postQuery.sort = this.__addMultipleSort(paramName, asc);
    } else {
      this.queryString += this.__addQueryParam(`sort=${this.__addMultipleSort(paramName, asc)}`);
    }


    return this;
  }

  /**
   * @method: start: Add start number to return documents from that index.
   * @param {number} start
   * @returns {Solr}
   */
  start(start = 0) {
    if (!this.__validNumber(start)) return this;
    if (this.usePost) {
      this.postQuery.start = start;
    } else {
      this.queryString += this.__addQueryParam(`start=${start}`);
    }
    return this;
  }

  /**
   * @method: limit: Add end number to return documents until that index.
   * @param {number} limit
   * @returns {Solr}
   */
  limit(limit) {
    if (!this.__validNumber(limit)) return this;
    if (this.usePost) {
      this.postQuery.limit = limit;
    } else {
      this.queryString += this.__addQueryParam(`rows=${limit}`);
    }
    return this;
  }

  /**
   * @method strictByRoles
   * @returns {Solr}
   */

  restrictByRoles() {
    this.restrictRoles = true;

    return this;
  }

  /**
   * @method execute: this function make an ajax call to Solr and retrieve the response.
   * @returns {Promise|*|Promise<T | Array>|*}
   */
  execute() {

    const baseUrl = this.baseUrl ? this.baseUrl : this.usePost ? NOVA_SOLR_DEFAULTS.post : NOVA_SOLR_DEFAULTS.get;

    let query = this.usePost ?
      HttpClient.post(baseUrl + `${this.restrictRoles ? "?" + STRICT_ROLES_PARAM : ""}`, this.postQuery) :
      HttpClient.get(baseUrl + this.queryString + `${this.restrictRoles ? this.__addQueryParam(STRICT_ROLES_PARAM) : ""}`);

    return query
      .then((response) => response.json())
      .then(jsonResponse => {
        return this.__parseData(jsonResponse);
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  }

  /*testRoles(){
    const baseUrl = this.baseUrl ? this.baseUrl : this.usePost ? NOVA_SOLR_DEFAULTS.post : NOVA_SOLR_DEFAULTS.get;

    let query = this.usePost ?
      baseUrl + `${this.strictRoles ? '?' + STRICT_ROLES_PARAM : ''}`:
      baseUrl + this.queryString + `${this.strictRoles ? this.__addQueryParam(STRICT_ROLES_PARAM) : '' }`

    return query;
  }*/


  /**
   * @method __addMultipleSort: this method allows add multiple instance of sort to Solr query
   * @param {Array} params
   * @returns {string} sorting
   * @private
   */
  __addMultipleSort(params, sorting) {
      return params.map((param, i) => `${param} ${sorting[i] ? SORT["ASC"] : SORT["DESC"]}`).join(", ");
  }

  /**
   * @method __parseData: this method allows the parse of the information retrieving for Solr,
   * if a parse map was added it will be use to return this data.
   * @param {Array} data
   * @returns {Array} response
   * @private
   */
  __parseData(data) {

    if (
      data &&
      data.response &&
      data.response.docs
    ) {

      let response = data.response.docs;
      const keys = Object.keys(this.parseMap);

      if (keys.length) {
        response = response.reduce((acc, curr) => {
          keys.forEach(key => {
            if (Array.isArray(keys[key])) {
              for (let item of keys[key]) {
                curr[item] = curr[key];
              }
            } else {
              curr[this.parseMap[key]] = curr[key];
            }
          });
          acc.push(curr);
          return acc;
        }, []);
      }

      return response;
    }
    return [];
  }

  /**
   * @method __addQueryParam: use this method to determine if the query string should use & or ?.
   * @param {string} param
   * @returns {string}
   * @private
   */
  __addQueryParam(param) {
    if (param) {
      return this.queryString ? `&${param}` : `?${param}`;
    }
    return "";
  }

  /**
   * @method __addMultiClause: Allows add logical operations that depends of 2 or more elements
   * @param {string} leftClause
   * @param {string | Array<string>}rightClause
   * @param {string} type
   * @param {Boolean} useParentheses
   * @returns {string}
   * @private
   */
  __addMultiClause(leftClause, rightClause, type, useParentheses) {
    if (this.__validArray(rightClause)) {
      return this.__addParentheses(`${leftClause}:${this.__addParentheses(rightClause.join(" "), true)}`, useParentheses);
    } else if (!this.__validString(leftClause) && !this.__validString(rightClause)) return "";

    return this.__addParentheses(`${leftClause} ${type} ${rightClause}`, useParentheses);
  }

  /**
   * @method __addSingleClause: Allows add logical operations that depends of 1 element
   * @param {string} clause
   * @param {string} type
   * @param {Boolean} useParentheses
   * @returns {string}
   * @private
   */
  __addSingleClause(clause, type, useParentheses) {
    if (!this.__validString(clause)) return "";

    return this.__addParentheses(`${type} ${clause}`, useParentheses);
  }

  /**
   * @method __addParentheses: Add parentheses to a string
   * @param {string} clause
   * @param {Boolean} shouldInclude
   * @return {string}
   * @private
   */

  __addParentheses(clause, shouldInclude) {
    return `${shouldInclude ? "(" : ""}${clause}${shouldInclude ? ")" : ""}`;
  }

  /**
   * @method __validString: validation to avoid add empty strings
   * @param input
   * @returns {boolean}
   * @private
   */
  __validString(input) {
    return typeof input === "string" && input.trim() !== "";
  }

  /**
   * @method __validObj: validation to avoid empty objects.
   * @param obj
   * @returns {Boolean}
   * @private
   */
  __validObj(obj) {
    const keys = Object.keys(obj);
    return typeof obj === "object" && keys.length && !keys.some(k => !this.__validString(obj[k]));
  }


  /**
   * @method __validNumber: validation to avoid no numbers.
   * @param {Number} number
   * @returns {Boolean}
   * @private
   *
   */
  __validNumber(number) {
    return !Number.isNaN(number) || !Number.isNaN(+number);
  }

  /**
   * @method __validArray: validation to avoid no Arrays or empty Arrays.
   * @param {Array} array
   * @returns {Boolean}
   * @private
   */
  __validArray(array) {
    return Array.isArray(array) && array.length;
  }
}

export { Solr };
