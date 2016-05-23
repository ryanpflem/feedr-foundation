$(document).foundation();

var MyApp = {};
var $parametersButton = $("#findArticles");
var $moreArticlesButton = $("#moreArticles");
var currentPage;


//Compile element using handlebars
MyApp.compileArticles = function (articleObject) {
  var source = $("#article-template").html();
  var template = Handlebars.compile(source);
  return template(articleObject);
}


//Construct and execute ajax request
MyApp.getArticles = function ($query, $filter, $beginDate, $endDate, $highlight, $page) {

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0
  var yyyy = today.getFullYear();

  if(dd<10) {
    dd='0'+dd;
  } 

  if(mm<10) {
    mm='0'+mm;
  }

  today = yyyy + mm + dd;

  $('#article_popup').popup({
    transition: 'all 0.3s'
  });

  var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
	//Always append api key
	var params = new Object();
	params['api-key'] = "7d82bb2272964cb69a82487397c33b47";
	//Append 'fl' parameter to limit returned fields and improve speed?

	//Aappend params if they are present
	if ($query) params.q = $query;
  console.log($query)

	if ($filter) params.fq = $filter;
  console.log($filter)

	if ($beginDate) {
    params.begin_date = $beginDate;
  } else {
    params.begin_date = today;
  }
  console.log($beginDate)

	if ($endDate) {
    params.end_date = $endDate;
  } else {
    params.end_date = today;
  }
  console.log($endDate)

  if ($highlight) params.hl = $highlight;
    
	if ($page) {
    params.page = $page;
    currentPage = $page;
  } else {
    params.page = 0;
    currentPage = $page;
  }
  console.log('$page = ' + $page)
  console.log('currentPage = ' + currentPage)


	// Construct url
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
	  throw err;
	});

}


//Build the article object from the response
MyApp.buildArticleObject = function (result) {
  
  var results = result.response.docs;
  MyApp.articles = [];
  var articleObject = MyApp.articles;

  //Check json values for null or undefined, if so make them an empty string
  for (i=0; i<results.length; i++){
    var obj = results[i];
      for (var value in obj) {
        if (obj[value] === null || obj[value] === 'undefined') {
          obj[value] = "";
        }
      }

    //Pull out the values needed to populate the content
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

    //Push those values into the articleObject array
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

  MyApp.getImageUrl(articleObject); //Call the getImageUrl function here

  console.log("Article Object going to template")
  console.log(articleObject);

  var $articleFeed = $("#article-feed");
  MyApp.populateArticles($articleFeed); //Call the populateArticles function here

  $('.article_popup_open').on('click', MyApp.setPopupContent);
}

//If there is no multimedia image (value = undefined), make the value empty
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
  $articleFeed.empty(); //empty the current article-feed
  for (var i=0; i<MyApp.articles.length; ++i) {      
    var newArticle = MyApp.compileArticles(MyApp.articles[i]); //complie all the articles in the array
    $articleFeed.append(newArticle); //append all the articles in the article-feed
  }
}


//Pop-up function
MyApp.setPopupContent = function (){
  var url = this.attributes["popupurl"].value;
  $("#article_popup iframe").attr('src', url);
}


//Click on 'findArticles' button to send params to MyApp.getArticles
$parametersButton.on('click', function(event) {

  var $queryValue = $("#query"),
      $highlightValue = $("#highlight"),
      $filterValue = $("#filter"),
      $beginDateValue = $(".startDate"),
      $endDateValue = $(".endDate"),
      $pageValue = $("#page")

  var $params = new Parameters($queryValue, $filterValue, $beginDateValue, $endDateValue, $highlightValue, $pageValue);

  $query = $params.$query
  $filter = $params.filter
  $beginDate = $params.$beginDate
  $endDate = $params.$endDate
  $highlight = $params.$highlight
  $page = $params.$page

  //Call the getArticles function on click
  MyApp.getArticles($query, $filter, $beginDate, $endDate, $highlight, $page);
});


//Parameters constructor function
function Parameters($queryValue, $filterValue, $beginDateValue, $endDateValue, $highlightValue, $pageValue) {
  this.$query = $queryValue.val();
  this.$filter = $filterValue.val();
  this.$beginDate = $beginDateValue.val().replace(/-/g, "");
  this.$endDate = $endDateValue.val().replace(/-/g, "");
  this.$highlight = $highlightValue.is(':checked');
  this.$page = $pageValue.val();
}


//On click, gathers inputs from current parameters and +1 to page
// $moreArticlesButton.on('click', function(event) {
//   console.log('currentPage = ' + currentPage)

//   var $queryValue = $("#query"),
//       $highlightValue = $("#highlight"),
//       $filterValue = $("#filter"),
//       $beginDateValue = $(".startDate"),
//       $endDateValue = $(".endDate"),
//       $pageValue = $("#page")

//   var $params = new Parameters($queryValue, $filterValue, $beginDateValue, $endDateValue, $highlightValue, $pageValue);

//   $query = $params.$query
//   $filter = $params.filter
//   $beginDate = $params.$beginDate
//   $endDate = $params.$endDate
//   $highlight = $params.$highlight
//   $page = $params.$page

//   console.log('$page = ' + $page)

//   if (typeof currentPage === 'undefined') {
//     console.log('true')
//     currentPage = 0;
//     console.log(currentPage)
//   }
//   else {
//     currentPage = currentPage
//   }

//   currentPage++
//   console.log('page to request is ' + currentPage)

//   $page = currentPage

//   MyApp.getArticles($query, $filter, $beginDate, $endDate, $highlight, $page);

// });



//Call the getArticles function on page load
$.ready(MyApp.getArticles());