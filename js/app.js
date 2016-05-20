var MyApp = {};
MyApp.articles = [];

$(document).foundation();

$.ready(nytimesApiCall())
function nytimesApiCall() {

var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
url += '?' + $.param({
  'api-key': "",
  'sort': "newest",
  'page': 0
});
$.ajax({
  url: url,
  method: 'GET',
  dataType: 'json'
}).done(function(result) {
  console.log(result);

  var results = result.response.docs;

  for (i=0; i<results.length; i++){
    var category = results[i].news_desk;
    var section = results[i].section_name;
    // var sectionUrl = section.toLowerCase();
    var date = (results[i].pub_date).slice(0, -10);
    var headline = results[i].headline.main;
    var author = results[i].byline.original;
    var snippet = results[i].snippet;    
    var source = results[i].source;
    var url = results[i].web_url;
    var image = results[i].multimedia[1];

    MyApp.articles.push({
      articleCategory: category,
      articleSection: section,
      articleDate: date,
      articleHeadline: headline,
      articleAuthor: author,
      articleSnippet: snippet,
      articleImages: image,
      articleSource: source,
      articleUrl: url
    })
  }

  console.log(MyApp.articles);

  var $articleFeed = $("#article-feed");
  MyApp.populateArticle($articleFeed);

}).fail(function(err) {
  throw err;
});

} //fn nytimesApiCall


// Compile element using handlebars
MyApp.compileArticle = function (article) {
  var source = $("#article-template").html();
  var template = Handlebars.compile(source);
  return template(article);
}

// Initial population of the article from articles array
MyApp.populateArticle = function (article) {
  article.empty(); //empty the current article
  for (var i=0; i<MyApp.articles.length; ++i) {
    var newArticle = MyApp.compileArticle(MyApp.articles[i]); //complie all the articles in the array
    article.append(newArticle); //append all the articles in the article-feed
  }
}

MyApp.getArticles = function(query, filter, beginDate, endDate, highlight, page) {

	var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

	//always append api key
	var params = new Object();
	params['api-key'] = "";
	//maybe append 'fl' parameter to limit returned fields and improve speed?


	//append params if they are present
	if (query) params.q = query
	if (filter) params.fq = filter
	if (beginDate) params.begin_date = beginDate
	if (endDate) params.end_date = endDate
	if (highlight) params.hl = highlight
	if (page) params.page = page

	//construct url
	url += '?' + $.param(params);

	$.ajax({
	  url: url,
	  method: 'GET',
	}).done(function(result) {
	  updatePage(result); // call the page update function here
	}).fail(function(err) {
	  throw err;
	});
} 

