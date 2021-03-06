import { Solr } from "../../utils/solr";

describe("Test new Solr instance", () => {
  test("it has base url", () => {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    expect(query.baseUrl).toBe(baseUrl);
  });
});

describe("Test query string", () => {
  test("it has valid query extends", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    console.log(query);
    query.q('authtemplate:news');

    expect(query.queryString).toBe('?q=authtemplate:news');
  });

  test("it has valid query extends adding and fq", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    query
      .q('authtemplate:news')
      .fq('authtemplate:news')

    expect(query.queryString).toBe('?q=authtemplate:news&fq=authtemplate:news');
  });

  test("it has valid query extends adding and sort", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    query
      .q('authtemplate:news')
      .sort('news');
    expect(query.queryString).toBe('?q=authtemplate:news&sort=news asc');
  });

  test("it has valid query extends adding and limit", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    query
      .q('authtemplate:news')
      .limit(100);
    expect(query.queryString).toBe('?q=authtemplate:news&rows=100');
  });

  test("it has valid query extends adding and mapper Object", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    const parseObj = {date: "dateP"};
    query
      .q('authtemplate:news')
      .addMapperObject(parseObj);
    expect(query.parseMap).toStrictEqual(parseObj);
  });


  test("it has valid query extends adding and mapper Object", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    const originalObj = {
      "topicstitle":["Tech Talk"],
      "contenttypetitle":["Videos"],
      "relatedHubstitle":["Skid Steer Loaders"],
      "publishdate":"2016-05-25T22:00:00Z",
      };

    const parseObj = {[Solr.FIELDS.TOPICS_TITLE]: "topics"};

    const expecteObj = {
      "topicstitle":["Tech Talk"],
      "topics":["Tech Talk"],
      "contenttypetitle":["Videos"],
      "relatedHubstitle":["Skid Steer Loaders"],
      "publishdate":"2016-05-25T22:00:00Z",
    };

    query
      .addMapperObject(parseObj);


    expect(query.__parseData({response: {docs: [originalObj]}})).toStrictEqual([expecteObj]);
  });

  test("it has valid query extends adding and map key value", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    query
      .q('authtemplate:news')
      .addMapperKeyValue("a", "b");
    expect(query.parseMap).toStrictEqual({a: "b"});
  });

  test("it has valid query extends adding start", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    query
      .q(Solr.FIELDS.AUTH_TEMPLATE + ':news')
      .start(0);
    expect(query.queryString).toBe('?q=authtemplate:news&start=0');
  });




  /*test("it has valid query restrict by roles GET", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    query
      .q(Solr.FIELDS.AUTH_TEMPLATE + ':news')
      .strictByRoles();

    expect(query.testRoles()).toBe('/myservices/search-service/doRequest/dp-content/select?q=authtemplate:news&forceRoles=true');
  });

  test("it has valid query restrict by roles POST", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);
    query
      .post()
      .q(Solr.FIELDS.AUTH_TEMPLATE + ':news')
      .strictByRoles();

    expect(query.testRoles()).toBe('/myservices/search-service/doRequest/dp-content/select?forceRoles=true');
  });*/

});

describe("Test Solr utils", () => {
  test("it has valid date format", ()=> {
    const date = Solr.date('2020/01/22 12:00:00', 'YYYY-MM-DD HH:mm:ss');
    expect(date).toBe('[2020-01-22T12:00:00Z TO *]');
  });

  test("it has valid from now date ", ()=> {
    const date = Solr.dateFromNow();
    expect(date).toBe('[NOW/DAY TO *]');
  });

  test("it has valid and clause", ()=> {
    const date = Solr.and("a", "b");
    expect(date).toBe('(a AND b)');
  });

  test("it has valid multiple and clause", ()=> {
    const date = Solr.and("a", ["b", "c"]);
    expect(date).toBe('(a:(b c))');
  });

  test("it has valid or clause", ()=> {
    const date = Solr.or("a", "b");
    expect(date).toBe('(a OR b)');
  });

  test("it has valid multiple or clause", ()=> {
    const date = Solr.or("a", ["b", "c"]);
    expect(date).toBe('(a:(b c))');
  });


  test("it has valid strict clause", ()=> {
    const string = Solr.strictString("a");
    expect(string).toBe('"a"');
  });
});

describe("Test query post", () => {
  test("it has valid query extends", ()=> {
    const baseUrl = "/myservices/search-service/doRequest/dp-content/select";
    const query = new Solr(baseUrl);

    query.post()
      .q('authtemplate:news');
    expect(query.postQuery).toStrictEqual({query: ["authtemplate:news"], filter:[]});
  });
});

