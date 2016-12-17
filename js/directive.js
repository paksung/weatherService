angular.module('starter.directives', [])
.directive('closePopupBackDrop', ['$ionicGesture',function($ionicGesture) {  
        return {  
            scope: false,//共享父scope  
            restrict: 'A',  
            replace: false,  
            link: function(scope, element, attrs, controller) {  
                var  $htmlEl= angular.element(document.querySelector('html'));
                $ionicGesture.on("touch", function(event) {
                    if (event.target.nodeName === "HTML" && scope.isPopup) {  
                        scope.showPopup.close();  
                        scope.isPopup = false;  
                    }  
                },$htmlEl);  
            }  
        };  
}])