angular.module('starter.animates', [])
.animation('.repeat-animate', function(){
    return {
        enter : function(element, done) {
            element.css({
                position: 'relative',
                left: -10,
                opacity: 0
            });
            element.animate({
                left: 0,
                opacity: 1
            }, done);
        },
        leave : function(element, done) {
            element.css('height', '274px');
            element.animate({
                left: -10,
                opacity: 0
            }, done);
        }
    };
}) 