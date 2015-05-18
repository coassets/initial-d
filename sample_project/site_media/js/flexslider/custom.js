$(function(){
  //SyntaxHighlighter.all();
});

$(window).load(function(){
  jQuery('.flexslider').flexslider({
    animation: "slide",
    animationLoop: false,
    itemWidth: 1170,
    itemMargin: 5,
    pausePlay: true,
    start: function(slider){
      jQuery('body').removeClass('loading');
    }
  });
});