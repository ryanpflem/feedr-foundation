$(document).foundation();

//Global variables
var $notificationCallout = $('#notificationCallout'),
    $notification = $('#notification'),
    $content = $('#content'),
    $loader = $('#loader'),
    $parametersButton = $("#findArticlesButton"),
    $moreArticles = $("#moreArticles"),
    $moreArticlesButton = $("#moreArticlesButton"),
    $articlePopup = $('#article_popup'),
    currentPage,
    MyApp = {};

//Compile element using handlebars
MyApp.compileArticles = function (articleObject) {
  var source = $("#article-template").html();
  var template = Handlebars.compile(source);
  return template(articleObject);
}


//Construct and execute ajax request
MyApp.getArticles = function ($query, $filter, $source, $section, $beginDate, $endDate, $highlight, $page) {
  
  $articlePopup.popup({
    transition: 'all 0.3s'
  });

  var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
	//Always append api key
	var params = new Object();
	params['api-key'] = "YOUR API KEY HERE!!";

  console.log("$query = " + $query)
  console.log("$filter = " + $filter)
  console.log("$source = " + $source)
  console.log("$section = " + $section)
  console.log("$beginDate = " + $beginDate)
  console.log("$endDate = " + $endDate)
  console.log("$page = " + $page)

	//Aappend params if they are present
	if ($query) params.q = $query;
  console.log("params.q = " + $query)

  if ($source !== '"undefined"' && $section !== '"undefined"') {
    params.fq = "source:(" + $source + ") AND section_name:(" + $section + ")," + $filter
  } else if ($source !== '"undefined"' && $section === '"undefined"') {
    params.fq = "source:(" + $source + ")," + $filter
  } else if ($source === '"undefined"' && $section !== '"undefined"') {
    params.fq = "section_name:(" + $section + ")," + $filter
  } else {
    params.fq = $filter;
  }
  console.log("params.fq = " + params.fq)

	if ($beginDate) params.begin_date = $beginDate;
  console.log("params.begin_date = " + $beginDate)

	if ($endDate) params.end_date = $endDate;
  console.log("params.end_date = " + $endDate)

  if ($highlight) params.hl = $highlight;
  console.log("params.hl = " + $highlight)
    
	if ($page) {
    params.page = $page;
    currentPage = $page;
  }
  console.log('params.page = ' + $page)
  console.log('currentPage = ' + currentPage)


	//Construct url
	url += '?' + $.param(params);
  console.log(url)

	$.ajax({
	  url: url,
	  method: 'GET',
	}).done(function(result) {
    console.log("success");
    console.log(result);
	  MyApp.buildArticleObject(result); //Call the buildArticleObject function here
	}).fail(function(err) {
    MyApp.errorNotify(err);
    throw err;
	});

}


//Error callout function
MyApp.errorNotify = function (err) {
  $moreArticles.hide();
  $notificationCallout.show();
  $notification.html('<p>' + err + '</p>');
}


//Build the article object from the response
MyApp.buildArticleObject = function (result) {
  
  MyApp.articles = [];
  var articleObject = MyApp.articles;
  var results = result.response.docs;

  //If result is empty, notify the user
  if (results.length < 1) {
    var err = "No Articles Match Your Search"
    MyApp.errorNotify(err);
  }

  //Check json values for null or undefined, if so make them an empty string
  for (i=0; i<results.length; i++){
    var obj = results[i];
      for (var value in obj) {
        if (obj[value] === null || obj[value] === 'undefined') {
          obj[value] = "";
        }
      }

    //Pull out the values needed to populate the content
    var newsDesk = results[i].news_desk;
    var section = results[i].section_name;
    var date = (results[i].pub_date).slice(0, -10);
    var headline = results[i].headline.main;
    var author = results[i].byline.original;
    var snippet = results[i].snippet;    
    var source = results[i].source;
    var url = results[i].web_url;
    var image = results[i].multimedia[1];
    var sectionUrl;

    //Push those values into the articleObject array
    articleObject.push({
      articlenewsDesk: newsDesk,
      articleSection: section,      
      articleDate: date,
      articleHeadline: headline,
      articleAuthor: author,
      articleSnippet: snippet,
      articleImages: image,
      articleSource: source,
      articleUrl: url
    });
  }

  MyApp.getImageUrl(articleObject); //Call the getImageUrl function here

  console.log("Article Object going to template")
  console.log(articleObject)

  var $articleFeed = $("#article-feed");
  MyApp.populateArticles($articleFeed); //Call the populateArticles function here

  $('.article_popup_open').on('click', MyApp.setPopupContent); //Call the setPopupContent function
}


//If there is no multimedia image (value = undefined), make the value empty so an <img> in not loaded
//Else add the href string neccessary to make image link complete
MyApp.getImageUrl = function (articleObject) {
  for (var i=0; i<articleObject.length; ++i) {    
    if (typeof articleObject[i].articleImages === 'undefined' ) {
      articleObject[i].articleImages = Object.assign({url: ""});
    } else {
      articleObject[i].articleImages = Object.assign({url: "https://static01.nyt.com/" + MyApp.articles[i].articleImages.url});
    }    
  }
}


//Population of the article template from articles array
MyApp.populateArticles = function ($articleFeed) {
  $articleFeed.empty(); //Empty the current article-feed
  MyApp.showContent();

  for (var i=0; i<MyApp.articles.length; ++i) {      
    var newArticle = MyApp.compileArticles(MyApp.articles[i]); //Complie all the articles in the array    
    $articleFeed.append(newArticle); //Append all the articles in the article-feed
  }
}


//Article pop-up function
MyApp.setPopupContent = function (){
  var url = this.attributes["popupurl"].value;
  $("#article_popup iframe").attr('src', url);
}


//Click handler on 'findArticles' button to send params to MyApp.getArticles
$parametersButton.on('click', function(event) {
  event.preventDefault(event);

  $notificationCallout.hide(); ////Hide the error notification on the page
  $content.hide(); //Hide the main content on the page
  $loader.show(); //Show the loader on the the page

  var $sourceValue = $('#source'),
      $sectionValue = $('#section'),
      $queryValue = $("#query"),
      $highlightValue = $("#highlight"),
      $filterValue = $("#filter"),
      $beginDateValue = $(".startDate"),
      $endDateValue = $(".endDate"),
      $pageValue = $("#page");

  var params = new Parameters($queryValue, $filterValue, $sourceValue, $sectionValue, $beginDateValue, $endDateValue, $highlightValue, $pageValue);

  $source = params.$source;
  console.log('$source = ' + $source)
  $section = params.$section;
  console.log('$section = ' + $section)
  $query = params.$query;
  console.log('$query = ' + $query)
  $filter = params.$filter;
  console.log('$filter = ' + $filter)
  $beginDate = params.$beginDate;
  $endDate = params.$endDate;
  $highlight = params.$highlight;
  $page = params.$page;

  //Call the getArticles function
  MyApp.getArticles($query, $filter, $source, $section, $beginDate, $endDate, $highlight, $page);
});


//Submit handler on 'findArticles' button
$parametersButton.on('submit', function(event) {
  event.preventDefault(event);
  console.log('Handler for .submit() called')
  $parametersButton.trigger('click'); //Trigger the click function on submit
});


//Parameters constructor function
function Parameters($queryValue, $filterValue, $sourceValue, $sectionValue, $beginDateValue, $endDateValue, $highlightValue, $pageValue) {
  this.$query = $queryValue.val();
  this.$filter = $filterValue.val();
  this.$source = '"' + $sourceValue.val() + '"';
  this.$section = '"' + $sectionValue.val() + '"';
  this.$beginDate = $beginDateValue.val().replace(/-/g, "");
  this.$endDate = $endDateValue.val().replace(/-/g, "");
  this.$highlight = $highlightValue.is(':checked');
  this.$page = $pageValue.val();
}


//Sets intial url parameters on page load
MyApp.getInitialParams = function () {  

  var $query = "",
      $filter = "",
      $source = '"undefined"',
      $section = '"undefined"',
      $beginDate,
      $endDate,
      $highlight = false,
      $page;

   MyApp.getArticles($query, $filter, $source, $section, $beginDate, $endDate, $highlight, $page);
}


//Hide the content
MyApp.hideContent = function () {
  $notificationCallout.hide(); //Hide the Error notification callout on page load
  $content.hide(); //Hide the main content on page load
}


//Show the content
MyApp.showContent = function () {
  $loader.hide(); //Hide the loader
  $content.show(); //Show the main content
}


//Hide content, get initial parameters when page ready
$(document).ready(function() {
  MyApp.hideContent();
  MyApp.getInitialParams();
});