$(document).foundation();

var MyApp = {};
MyApp.articles = [];


// Compile element using handlebars
MyApp.compileArticles = function (articleObject) {
  var source = $("#article-template").html();
  var template = Handlebars.compile(source);
  return template(articleObject);
}


// Construct and execute ajax request
MyApp.getArticles = function (query, filter, beginDate, endDate, highlight, page) {

	var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

	// Always append api key
	var params = new Object();
	params['api-key'] = "7d82bb2272964cb69a82487397c33b47";
	// Append 'fl' parameter to limit returned fields and improve speed?


	// Aappend params if they are present
	if (query) params.q = query
	if (filter) params.fq = filter
	if (beginDate) params.begin_date = beginDate
	if (endDate) params.end_date = endDate
	if (highlight) params.hl = highlight
	if (page) params.page = page

	// Construct url
	url += '?' + $.param(params);

	$.ajax({
	  url: url,
	  method: 'GET',
	}).done(function(result) {
    console.log("success");
    console.log(result);
	  MyApp.buildArticleObject(result); // call the buildArticleObject function here
	}).fail(function(err) {
	  throw err;
	});
}


// Build the article object from the response
MyApp.buildArticleObject = function (result) {
  
  var results = result.response.docs;

  for (i=0; i<results.length; i++){
    var category = results[i].news_desk;
    var section = results[i].section_name;
    var date = (results[i].pub_date).slice(0, -10);
    var headline = results[i].headline.main;
    var author = results[i].byline.original;
    var snippet = results[i].snippet;    
    var source = results[i].source;
    var url = results[i].web_url;
    var image = results[i].multimedia[1];
    var sectionUrl;

    var articleObject = MyApp.articles;

    articleObject.push({
      articleCategory: category,
      articleSection: section,
      articleSectionUrl: sectionUrl,
      articleDate: date,
      articleHeadline: headline,
      articleAuthor: author,
      articleSnippet: snippet,
      articleImages: image,
      articleSource: source,
      articleUrl: url
    })
  }

  MyApp.getImageUrl(articleObject);

  MyApp.getSectionUrl(articleObject);

  console.log("Article Object going to template")
  console.log(articleObject);

  var $articleFeed = $("#article-feed");
  MyApp.populateArticles($articleFeed);
}

//If there is no multimedia image, fill it with a placeholder
//Else add the href string neccessary to make image link whole
MyApp.getImageUrl = function (articleObject) {
  for (var i=0; i<articleObject.length; ++i) {
    if (typeof articleObject[i].articleImages === 'undefined' ) {
      articleObject[i].articleImages = Object.assign({url: "http://placehold.it/850x350"});
    } else {
      articleObject[i].articleImages = Object.assign({url: "https://static01.nyt.com/" + MyApp.articles[i].articleImages.url});
    }    
  }
}


//Get the appropriate lowercase string to fill in the section/pages href link
MyApp.getSectionUrl = function (articleObject) {
  for (var i=0; i<articleObject.length; ++i) {
    var sectionValue = articleObject[i].articleSection;

    if(sectionValue === null) {
     articleObject[i].articleSectionUrl = "undefined";
    }
    else if (sectionValue === "Food") {
      articleObject[i].articleSectionUrl = "pages/" + articleObject[i].articleCategory.toLowerCase();
    }
    else if(sectionValue === 'undefined') {
      articleObject[i].articleSectionUrl = "undefined";
    }
    else {
      articleObject[i].articleSectionUrl = "section/" + articleObject[i].articleSection.toLowerCase();
    }
  }
}


// Population of the article template from articles array
MyApp.populateArticles = function ($articleFeed) {
  $articleFeed.empty(); //empty the current article-feed
  for (var i=0; i<MyApp.articles.length; ++i) {      
    var newArticle = MyApp.compileArticles(MyApp.articles[i]); //complie all the articles in the array
    $articleFeed.append(newArticle); //append all the articles in the article-feed
  }
}


// Call the getArticles function on page load
$.ready(MyApp.getArticles());
