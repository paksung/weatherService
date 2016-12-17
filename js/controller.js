angular.module('starter.controllers',[])

.controller('weatherController', ['$scope','$http','$timeout','$ionicPopup','$q','$cordovaVibration', '$ionicPlatform', function($scope, $http, $timeout, $ionicPopup, $q, $cordovaVibration, $ionicPlatform){

    $scope.cities = [];//搜索到的城市列表
    $scope.cityname = "";//输入框绑定的数据
    $scope.disabled = true;//添加按钮是否可按
    $scope.show_cities = [];//接收返回的天气信息对象
    $scope.toggleTips = false;//提示框显示与否
    var timer;//定时器
    $scope.isPopup = false;//记录showPopup是否开启
    $scope.color_class = ['item-calm', 'item-energized', 'item-assertive', 'item-balanced', 'item-royal', 'item-dark', 'item-positive', 'item-light'];

    // var promise = $q.defer().promise;
    // console.log(localStorage);
    for(var i=0;i<localStorage.length;i++){
        var obj = localStorage.getItem(localStorage.key(i));
        if (obj !== 'undefined'){
            $scope.show_cities.push(angular.fromJson(obj)); 
        }else{
            localStorage.removeItem(localStorage.key(i));
        }
    }
    //监听输入框，进行数据请求
    $scope.$watch('cityname',function(now, old){

        //数值变化过快时取消上一次变化的请求，防止频繁请求
        $timeout.cancel(timer);
        // console.log(now);
        timer = $timeout(()=>{
            $http.get("http://apis.baidu.com/apistore/weatherservice/citylist?cityname="+now,{
                headers:{
                    'apikey': 'e9b81bfbc20af78a3be510aacdaae8b6'
                }
            }).success(function(res){
                if(res.errMsg === "success"){
                    $scope.cities = res.retData;
                }
                // console.log($scope.cities);
            });
        }, 500);
        // console.log(isNaN($scope.cityname));
        if(/.+-.+-.+/.test($scope.cityname)){
            $scope.disabled = false;
        }else{
            $scope.disabled = true;
        }
    });

    //添加天气卡
    $scope.add = function(){
        var d = $scope.cityname.split('-')[2];
        if(!localStorage.getItem(d)){
            var id = "";
            for(var i in $scope.cities){
                if($scope.cities[i].name_cn === d){
                    id = $scope.cities[i].area_id;
                }
            }
            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '是否添加一个新的地区：'+d+'？'
            });
            confirmPopup.then(function(res){
                if(res){
                    $http.get('http://apis.baidu.com/apistore/weatherservice/recentweathers?cityname='+d+'&cityid='+id,{
                        headers: {
                            'apikey': 'e9b81bfbc20af78a3be510aacdaae8b6'
                        }
                    }).success(function(res){
                        if(res.errMsg === "success"){
                            localStorage.setItem(d, angular.toJson(res.retData,true));
                            $scope.show_cities.push(res.retData);
                        }else{
                            var alertPopup = $ionicPopup.alert({
                                title: '错误！',
                                template: '请求返回数据错误，请重试。'
                            });
                        }
                        
                    }).error(function(res){
                        var alertPopup = $ionicPopup.alert({
                                title: '错误！',
                                template: res
                            });
                    });
                }else{
                    console.log(0);
                }
            });
            
        }else{
            var alertPopup = $ionicPopup.alert({
                title: '该地区已添加！'
            });
        }
        $scope.cityname = "";
    }

    /*
    将选择好的地区数据显示至输入框
    p:省名    c:城市名   d:区县名
     */
    $scope.choose = function(p, c, d){
        $scope.cityname = p+'-'+c+'-'+d;
        $scope.toggleTips = false;
    }
    
    //设置提示框的显示值
    $scope.setTipsShow = function(){
        $scope.toggleTips = true;
    }
    $scope.setTipsHide = function(){
        $scope.toggleTips = false;
    }

    //长按天气卡出现的窗口    key:对应的区县名
    $scope.selectItem = function(key){
        if(ionic.Platform.isAndroid() || ionic .Platform.isIOS()){
            $ionicPlatform.ready(function(){
                $cordovaVibration.vibrate(100);
            });
        }
        $scope.showPopup = $ionicPopup.show({
            template: '<button class="button button-block button-positive" ng-click="deleteCard(\''+key+'\')">删除</button>',
            scope: $scope,
            title: '想要对此信息块进行的操作：'
        });
        $scope.isPopup = true;
    };

    //删除该天气卡
    $scope.deleteCard = function(key){
        localStorage.removeItem(key);
        for(var i=0;i<$scope.show_cities.length;i++){
            if($scope.show_cities[i].city === key){
                $scope.show_cities.splice(i, 1);
            }
        }
        // for(var i=0;i<localStorage.length;i++){
        //     $scope.show_cities.push(JSON.parse(localStorage.getItem(localStorage.key(i)))); 
        // }
        $scope.showPopup.close();
    };

    //刷新天气卡信息
    $scope.doRefresh = function(){
        if(localStorage.length > 0){

            var promiseArr = [];

            // localStorage.clear();

            for(var i=0;i<$scope.show_cities.length;i++){
                //将请求语句返回的promise对象添加至数组
                promiseArr.push($http.get('http://apis.baidu.com/apistore/weatherservice/recentweathers?cityname='+$scope.show_cities[i].city+'&cityid='+$scope.show_cities[i].cityid,{
                    headers: {
                        'apikey': 'e9b81bfbc20af78a3be510aacdaae8b6'
                    }
                }).success(function(res){
                    localStorage.setItem(res.retData.city, angular.toJson(res.retData,true));
                    // console.log(localStorage);
                }));
            }

            //所有请求完成后才执行的代码
            $q.all(promiseArr).then(function(){
                $scope.show_cities = [];
                for(var i=0;i<localStorage.length;i++){
                    $scope.show_cities.push(angular.fromJson(localStorage.getItem(localStorage.key(i)))); 
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        }
        
    };

    //获取一个0~7范围的数字
    $scope.getRandomNum = function(){
        return parseInt(Math.random()*8);
    }
}]).controller('mController',['$scope', function($scope){
    $scope.exit = function(){
        ionic.Platform.exitApp();
    };
}])