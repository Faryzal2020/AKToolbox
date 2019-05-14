    $.holdReady(true);
    var db = {};
    var d0 = $.getJSON("json/excel/building_data.json",function(data){
            db["manufactformulas"] = data.manufactFormulas;
        });
    var d1 = $.getJSON("json/excel/building_data.json",function(data){
            db["workshopformulas"] = data.workshopFormulas;
        });
    var d2 = $.getJSON("json/excel/character_table.json",function(data){
            db["chars"] = data;
        });
    var d3 = $.getJSON("json/excel/item_table.json",function(data){
            db["items"] = data.items;
        });
    var d4 = $.getJSON("json/tl-akhr.json",function(data){
            db["chars2"] = data;
        });
    var d5 = $.getJSON("json/tl-type.json",function(data){
            db["classes"] = data;
        });
    var d6 = $.getJSON("json/tl-tags.json",function(data){
            db["tags"] = data;
        });
    var d7 = $.getJSON("akmaterial.json",function(data){
            db["itemstl"] = data;
        });
    $.when(d0,d1,d2,d3,d4,d5,d6,d7).then(function(){
        $.holdReady(false);
    });

    var lang;
    var reg;
    var reqmats = [];
    var selectedOP;

    $(document).ready(function(){
        $('#to-tag').click(function() {      // When arrow is clicked
            $('body,html').animate({
                scrollTop : 0                       // Scroll to top of body
            }, 500);
        });

        $(window).click(function() {
            $('#operatorsResult').html("");
            $('#operatorsResult').hide();
        });
        $('#operatorsResult').click(function(event){
            event.stopPropagation();
        });
        $('#opname').click(function(event){
            event.stopPropagation();
        });

        $('.dropdown-trigger').dropdown();
        $('[data-toggle="tooltip"]').tooltip();


        if(typeof localStorage.gameRegion === "undefined" || localStorage.gameRegion == ""|| localStorage.webLang == ""){
            console.log("game region undefined");
            localStorage.setItem("gameRegion", 'cn');
            localStorage.setItem("webLang", 'en');
            reg = "cn";
            lang = "en";
        } else {
            console.log(localStorage.webLang);
            reg = localStorage.gameRegion;
            lang = localStorage.webLang;
        }

        if(typeof localStorage.selectedOP === "undefined" || localStorage.selectedOP == ""){
            localStorage.setItem("selectedOP","");
        } else {
            selectedOP = localStorage.selectedOP;
            var opname = db.chars[selectedOP].name;
            selectOperator(opname);
        }
        $('.reg[value='+reg+']').addClass('selected');
        $('.lang[value='+lang+']').addClass('selected');
        changeUILanguage();
    });

    function regDropdown(el){
        localStorage.gameRegion = el.attr("value");
        $(".dropdown-item.reg").removeClass("selected");
        el.addClass("selected");   
        changeUILanguage();
    }
                
    function langDropdown(el){
        localStorage.webLang = el.attr("value");
        console.log(localStorage.webLang)
        $(".dropdown-item.lang").removeClass("selected");
        el.addClass("selected");
        changeUILanguage();
    }

    
    function clickBtnClear(){
        $("#opname").val("");
        $('#operatorsResult').html("");
        $('#operatorsResult').hide();
        localStorage.selectedOP = "";
        selectedOP = localStorage.selectedOP;
        $("#reqmats-container").html("");
        $("#tbody-materials").html("");
        $("#eliteReqMats").hide();
        $("#opClassImage").attr('src','');
            console.log(lang);
        $("#op-nametl").html("");
        $("#op-name").html("");
        $("#op-rarity").html("");
        $("#op-tags").html("");
        $("#opImage").attr('src','img/chara/empty.png');
        $("#opID").val("");
    }


    function populateOperators(el){
        if(el.value != ""){
            var result = [];
            $.each(db.chars2,function(_,char){
                var languages = ['cn','en','jp','kr'];
                var found = false;
                for (var i = 0; i < languages.length; i++) {
                    var charname = eval('char.name_'+languages[i]).toUpperCase();
                    var input = el.value.toUpperCase();
                    var search = charname.search(input);
                    if(search != -1){
                        found = true;
                        break;
                    };
                }
                if(found){
                    var name_cn = char.name_cn;
                    var name = eval('char.name_'+reg);
                    var nameTL = eval('char.name_'+lang);
                    result.push({'name':name,'name_cn':name_cn,'nameTL':nameTL});
                }
            });
            if(result.length > 0){
                $('#operatorsResult').html("");
                $('#operatorsResult').show();
                for (var i = 0; i < result.length; i++) {
                    $("#operatorsResult").append("<li style=\"cursor: pointer\" onclick=\"selectOperator('"+result[i].name_cn+"')\">"+result[i].nameTL+" ("+result[i].name+")"+"</li>");
                }
            }
        } else {
            $('#operatorsResult').html("");
            $('#operatorsResult').hide();
        }
    }

    function selectOperator(opname){
        if(opname != ""){
            console.log("SELECT OPERATOR");
            console.log(opname);
            $("#opname").val("");
            $('#operatorsResult').html("");
            $('#operatorsResult').hide();
            var opdata = query(db.chars2,"name_cn",opname);
            var opclass = query(db.classes,"type_cn",opdata.type);
            console.log(opdata);
            var opdata2 = query(db.chars,"name",opdata.name_cn,true,true);
            console.log(opdata2);
            $.each(opdata2,function(key,v){
                $("#opImage").attr('src','img/portraits/'+key+'_1.png');
                $("#opID").val(key);
                localStorage.selectedOP = key;
                return false
            });
            $("#opClassImage").attr('src','img/classes/black/icon_profession_'+opclass.type_en.toLowerCase()+'_large.png');
            console.log(lang);
            $("#op-nametl").html(eval('opdata.name_'+lang));
            $("#op-name").html(eval('opdata.name_'+reg));
            var rarity = "";
            for (var i = 0; i < opdata.level; i++) {
                rarity = rarity + " ★";
            }
            $("#op-rarity").html(rarity);
            var tags_html = [];
            $.each(opdata.tags,function(_,v){
                var tag = query(db.tags,"tag_cn",v);
                if(tag){
                    var tagReg = eval('tag.tag_'+reg);
                    var tagTL = eval('tag.tag_'+lang);
                    tags_html.push("<li style=\"list-style-type:none; padding-bottom: 10px;\"><button readonly type=\"button\" class=\"btn btn-sm ak-shadow-small ak-btn btn-secondary btn-char my-1\" data-toggle=\"tooltip\" data-placement=\"top\" title=\""+ tagReg +"\">" +
                            (tagReg == tagTL ? "" : '<a class="ak-subtitle2" style="font-size:11px;margin-left:-9px;margin-bottom:-15px">'+tagReg+'</a>') +tagTL + "</button></li>");
                }
            });
            $("#op-tags").html(tags_html.join(""));

            $("#eliteReqMats").show();
            selectElite(1);
        }
    }

    function selectElite(num){
        console.log("SELECT ELITE");
        $("#tbody-materials").html("");
        $("#eliteDropBtn").html("Elite "+num);
        reqmats = db.chars[$("#opID").val()].phases[num].evolveCost;
        var html = [];
        $.each(reqmats,function(_,v){
            var itemdata = db.items[v.id];
            var itemdataTL = query(db.itemstl,"name_cn",itemdata.name);
            html.push("<li>"
                    +       "<div class=\"internal-container\" style=\"position: relative;\">"
                    +           "<div class=\"item-name\">"+itemdataTL.name_en+"</div>"
                    +           "<div class=\"item-image\">"
                    +               "<span></span>"
                    +               "<img id=\"item-image\" src=\"img/items/"+itemdata.iconId+".png\">"
                    +           "</div>"
                    +           "<img class=\"item-rarity\" src=\"img/material/bg/item-"+(itemdata.rarity+1)+".png\">"
                    +           "<div class=\"item-amount\">"+v.count+"x</div>"
                    +       "</div>"
                    +   "</li>");

            var tr = $("<tr></tr>");
            var td = $("<td style=\"vertical-align:middle; text-align: center; width: 180px; padding-left: 30px;\"></td>");
            var L1 = $("<div class=\"reqmats-container smallcontainer\"><li>"
                    +       "<div class=\"internal-container\" style=\"position: relative;\">"
                    +           "<div class=\"item-name\">"+itemdataTL.name_en+"</div>"
                    +           "<div class=\"item-image\">"
                    +               "<span></span>"
                    +               "<img id=\"item-image\" src=\"img/items/"+itemdata.iconId+".png\">"
                    +           "</div>"
                    +           "<img class=\"item-rarity\" src=\"img/material/bg/item-"+(itemdata.rarity+1)+".png\">"
                    +           "<div class=\"item-amount\">"+v.count+"x</div>"
                    +       "</div>"
                    +   "</li></div>");
            td.append(L1);
            tr.append(td);

            if(itemdata.buildingProductList.length>0){
                var parentcount = v.count;
                var formulaId = itemdata.buildingProductList[0].formulaId;
                var skip = false;
                if(itemdata.buildingProductList[0].roomType == "MANUFACTURE"){
                    var formula = db.manufactformulas[formulaId];
                } else {
                    var formula = db.workshopformulas[formulaId];
                    var check = db.items[formula.costs[0].id];
                    console.log(itemdata.rarity);
                    console.log(check.rarity);
                    if(itemdata.rarity == check.rarity){
                        if(itemdata.iconId.search("MTL_ASC") != -1 && check.iconId.search("MTL_ASC") != -1){
                            skip = true;
                        }
                    }
                }
                if(!skip){
                    var td = $("<td style=\"vertical-align:middle; text-align: center; padding-bottom: 30px; border-right: 5px solid darkgrey; margin-bottom: 20px;\"></td>");
                    td.append("<div style=\"font-size:2em; font-weight: bold;\"><span><---</span></div>");
                    tr.append(td);
                    var td2 = $("<td></td>");
                    $.each(formula.costs,function(_,v){
                        console.log(td2);

                        var row1 = $("<div class=\"row\"></div>");
                        var col1 = $("<div class=\"col-md-3\"></div>");
                        let itemdata = db.items[v.id];
                        let itemdataTL = query(db.itemstl,"name_cn",itemdata.name);
                        let li = $("<div class=\"reqmats-container smallcontainer\"><li>"
                        +       "<div class=\"internal-container\" style=\"position: relative;\">"
                        +           "<div class=\"item-name\">"+itemdataTL.name_en+"</div>"
                        +           "<div class=\"item-image\">"
                        +               "<span></span>"
                        +               "<img id=\"item-image\" src=\"img/items/"+itemdata.iconId+".png\">"
                        +           "</div>"
                        +           "<img class=\"item-rarity\" src=\"img/material/bg/item-"+(itemdata.rarity+1)+".png\">"
                        +           "<div class=\"item-amount\">"+(v.count*parentcount)+"x</div>"
                        +       "</div>"
                        +   "</li></div>");
                        col1.append(li);
                        row1.append(col1);


                        if(itemdata.buildingProductList.length>0){
                            var parentcount2 = v.count*parentcount;
                            var formulaId = itemdata.buildingProductList[0].formulaId;
                            var skip = false;
                            console.log(itemdata.iconId);
                            console.log(itemdata.buildingProductList[0].roomType)
                            if(itemdata.buildingProductList[0].roomType == "MANUFACTURE"){
                                var formula = db.manufactformulas[formulaId];
                            } else {
                                var formula = db.workshopformulas[formulaId];
                                var check = db.items[formula.costs[0].id];
                                console.log(itemdata.rarity);
                                console.log(check.rarity);
                                if(itemdata.rarity == check.rarity){
                                    if(itemdata.iconId.search("MTL_ASC") != -1 && check.iconId.search("MTL_ASC") != -1){
                                        skip = true;
                                    }
                                }
                            }
                            if(!skip){
                                var col2 = $("<div class=\"col-md-2\" style=\"border-right: 5px solid darkgrey; margin-bottom: 20px;\"></div>");
                                col2.append("<div style=\"margin-top: 50%; font-size:2em; font-weight: bold; min-width: 80px; max-width: 80px;\"><span><---</span></div>");
                                row1.append(col2)
                                var col3 = $("<div class=\"col-md-3\"></div>");
                                $.each(formula.costs,function(_,v2){
                                    let itemdata = db.items[v2.id];
                                    let itemdataTL = query(db.itemstl,"name_cn",itemdata.name);
                                    let li = $("<div class=\"reqmats-container smallcontainer\"><li>"
                                    +       "<div class=\"internal-container\" style=\"position: relative;\">"
                                    +           "<div class=\"item-name\">"+itemdataTL.name_en+"</div>"
                                    +           "<div class=\"item-image\">"
                                    +               "<span></span>"
                                    +               "<img id=\"item-image\" src=\"img/items/"+itemdata.iconId+".png\">"
                                    +           "</div>"
                                    +           "<img class=\"item-rarity\" src=\"img/material/bg/item-"+(itemdata.rarity+1)+".png\">"
                                    +           "<div class=\"item-amount\">"+(v2.count*parentcount2)+"x</div>"
                                    +       "</div>"
                                    +   "</li></div>");
                                    col3.append(li);
                                });
                            }
                            row1.append(col3);
                        }
                        td2.append(row1);
                    });
                    tr.append(td2);
                }
                $("#tbody-materials").append(tr);
            }
        });
        $("#reqmats-container").html(html.join(""));
    }

    function query(db,key,val,single=true,returnKey=false){
        if(single){
            var result = {};
        } else {
            var result = [];
        }
        var found = false;
        $.each(db,function(key2,v){
            if(eval('v.'+key).toLowerCase() == val.toLowerCase()){
                found = true;
                if(single){
                    if(returnKey){
                        result[key2] = v;
                    } else {
                        result = v;
                    }
                    return false;
                } else {
                    if(returnKey){
                        var obj = {};
                        obj[key2] = v; 
                        result.push(obj);
                    } else {
                        result.push(v);
                    }
                }
            }
        });
        if(found){
            return result;
        } else {
            return false;
        }
    }

    function changeUILanguage(){
        reg = localStorage.gameRegion;
        lang = localStorage.webLang;

        $('#display-reg').text(reg.toUpperCase())
        
        switch (lang) {
            case "en":$('#display-lang').text("English");break;
            case "cn":$('#display-lang').text("Chinese");break;
            case "jp":$('#display-lang').text("Japanese");break;
        }
        
        localStorage.setItem("gameRegion", reg);
        localStorage.setItem("webLang", lang);
        getJSONdata("ui",function(data){
            if(data.length != 0){
                $.each(data, function(i,text){
                    $("[translate-id="+text.id).html(eval('text.ui_'+lang));
                });
            }
        });
    }

    function getJSONdata(type, callback){
        var x = 0;
        var req = $.getJSON("json/tl-"+type+".json");
        req.done(function(response){
            callback(response);
        });
        req.fail(function(response){
            console.log("type: "+type+" fail: ");
            console.log(response);
        });
    }