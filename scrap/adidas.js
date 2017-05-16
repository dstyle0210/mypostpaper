/**
 * Created by Administrator on 2017-04-26.
 */
var fs = require('fs');
var request = require("request");
var cheerio = require("cheerio");
var _ = require("lodash");

module.exports = {
    getScrap: function () {

        function getScrapPage(type){
            var S_CTGR_CD = "";
            if(type=="men"){
                S_CTGR_CD = "01001001";
            }else if(type=="women"){
                S_CTGR_CD = "01002001";
            }else if(type=="kids"){
                S_CTGR_CD = "01003001";
            };
            var url = "http://shop.adidas.co.kr/PF020201.action?command=LIST&ALL=ALL&S_CTGR_CD="+S_CTGR_CD+"&S_PAGECNT=1000&STEP_YN=N";
            http://m.adidas.co.kr/MO/Product/eachCatPrdListData.action?ctgr_cd=01001001&strPage=1&term=2&viewType=B&sMinPrice=&sMaxPrice=&sColor=&sSize1=&sSize2=&sSize3=&STEP_YN=N

            return (new Promise(function(resolve,reject){
                request({url:url},function(err,res,body){
                    console.log(type+" load");
                    if(err){
                        reject( err );
                    }
                    console.log(type+" end");
                    resolve( body );
                });
            }));
        };

        function bodyToJson(body){
            fs.writeFileSync("./adidas.html",body);
            var str = body.split('<div class="prodlist">')[1].split('<div class="paging_r">')[0];
            str = '<div class="prodlist">' + str;
            fs.writeFileSync("./adidas2.html",str);
            var $ = cheerio.load(str);
            var items = [];
            console.log( $(".prodlist>ul>li").length );
            var txt = "";
            $(".prodlist>ul>li").each(function(){
                var item = $(this);
                var data = {
                    name: (item.find(".tit").text()).trim(),
                    brand:(item.find(".logo").text()).trim(),
                    price:(item.find(".price em").text()).trim()
                };
                data.style = item.html().match(/[0-9A-Z]{6}/)[0];
                data.src = "http://image.adidas.co.kr/upload/prod/basic/170/"+data.style+"-1_170X170.jpg";
                // console.log( (/[0-9A-Z]{6}/).test(data.style) );
                items.push(data);
                // txt += data.name+"\n";
                // console.log( data.name );
                /*
                var data = {
                    name:item.find(".tit").text(),
                    // src:item.find("img").attr("src"),
                    brand:item.find(".logo").text(),
                    price:item.find(".price em").text()
                };
                console.log(data);
                */
                // data.style = data.src.match(/[A-Z0-9]{6}/)[0];
                // items.push(data);
            });
            // console.log(items);
            fs.writeFileSync("./adidas3.html",JSON.stringify(items));
            return items;
        };

        var scrapPromise = [];
        scrapPromise.push( getScrapPage("men") );
        scrapPromise.push( getScrapPage("women") );
        scrapPromise.push( getScrapPage("kids") );

        Promise.all(scrapPromise).then(function(values){
            var datas = [];
            _.each(values,function(items,idx){
                datas.push( bodyToJson(items) );
            });
            var sneakers = [];
            _.each(datas,function(data){
                _.each(data,function(sneaker){
                    sneakers.push(sneaker);
                });
            });
            console.log(sneakers.length);
            sneakers = _.unionBy(sneakers,"style");
            console.log(sneakers.length);
            fs.writeFileSync("./adidas.json",JSON.stringify(sneakers));
            // console.log(values[0]);
            // bodyToJson(values[0]);
        });
    }
}


// http://shop.adidas.co.kr/PF020201.action?command=LIST&ALL=NONE&S_CTGR_CD=01001001001010&CONR_CD=20&S_ORDER_BY=2&S_PAGECNT=100&PAGE_CUR=1&S_SIZE=&S_TECH=&S_COLOR=grey&CATG_CHK=&CATG_CLK=&STEP_YN=N

// 연결 주소
// http://meetup.toast.com/tcblog/v1.0/posts?pageNo=1&rowsPerPage=12

