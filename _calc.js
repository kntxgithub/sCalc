var getById= document.getElementById.bind(document);
var g_focusInput = "load1"; //フォーカスがあるインプット、計算方式
var g_calcType = "average"  //計算方式
var g_tpSize = "tS10";      //供試体サイズ
var g_weight = 1000;        //重りサイズ
var g_conv = 0;             //初期換算係数
var g_fg =0;                //フォーカス移動した直後は文字置換（全消しする）
var g_sound =1;


//  読込時の初期処理
//  2020/05/07
window.onload = function(){
    tpsizeChange();
    calcTypeChange(g_calcType);
    loadRangeChange( g_weight);
    fS( g_focusInput );
    g_fg = 1;
    g_sound =1;
    updateSoundIcon();
}

function sound( _v ){

var sfc ="soundfileClear1"; 
var sfk ="soundfileKey1";

    if( g_sound ){

/*         if( typeof( document.getElementById( sfc ).currentTime ) != 'undefined' ){
            document.getElementById( sfc ).currentTime = 0;
        } */
        if( typeof( document.getElementById( sfk ).currentTime ) != 'undefined' ){
            document.getElementById( sfk ).currentTime = 0;
        }
/* 
        if( _v == "btnClr"){
            document.getElementById( sfc ).play();    
        }else{ */
            document.getElementById( sfk ).play();            
/*         }   */  
    }

}

//  供試体サイズの切り替え
//  2020/05/09
function tpsizeChange(){

    var tpsize;
    var tpStyleName;

    tpStyle('t125',1);
    tpStyle('t100',1);
    tpStyle('t050',1);
    tpStyle('tS15',1);
    tpStyle('tS10',1);

    switch( g_tpSize ){
        case "tS10":
            g_conv="0.081487399692512";
            tpStyleName = 't125';
            tpsize ="φ12.5";
            break;
        case "t125":
            g_conv="0.127324062019551";
            tpStyleName = 't100';
            tpsize ="φ10";
            break;
        case "t100":
            g_conv="0.509296248078202";
            tpStyleName = 't050';
            tpsize ="φ5";
            break;
        case "t050":
            g_conv="0.13333333";
            tpStyleName = 'tS15';
            tpsize ="□15";
            break;
        case "tS15":
            g_conv="0.3";
            tpStyleName ='tS10';
            tpsize ="□10";
            break;
    }
    tpStyle( tpStyleName );
    getById( 'btnTpSize' ).innerText = tpsize;
    calc( '1' );
}

//  tpsizeChange()　の内部処理
function tpStyle( _v ,a){

    var tptmp = getById( _v );
    if( !a ){
        g_tpSize= _v;
        tptmp.style.borderWidth = 1;
        tptmp.style.color='#111111';
    }else{
        tptmp.style.color = '#A6BD9F';
        tptmp.style.borderWidth = 0;
    }
}

//  荷重レンジの切り替え
//  2020/05/09
function loadRangeChange( _v ){

    lRChangeChild( 'info1000' );
    lRChangeChild( 'info0500' );
    lRChangeChild( 'info0250' );
    lRChangeChild( 'info0100' );

    switch( g_weight ){
        case 1000:
            lRChangeChild( 'info0500' ,500);
            getById( 'btnRange' ).innerText = "500kN";
        break;
        case 500:
            lRChangeChild( 'info0250' ,250);
            getById( 'btnRange' ).innerText = "250kN";
        break;
        case 250:
            lRChangeChild( 'info0100' ,100);
            getById( 'btnRange' ).innerText = "100kN";
        break;
        case 100:
            lRChangeChild( 'info1000' ,1000);
            getById( 'btnRange' ).innerText = "1000kN";
        break;
    }
}

//  loadRangeChange()　の内部処理
function lRChangeChild( _v ,a){

    var tmp = getById( _v );
    if( a ){
        g_weight= a;
        tmp.style.borderWidth = '1px';
        tmp.style.color = '#111111';
    }else{
        tmp.style.color = '#A6BD9F';
        tmp.style.borderWidth = 0;
    }
}

//  計算方式の切り替え      荷重 <--> 強度 <--> 平均
//  2020/05/06
function calcTypeChange( _v ){

    var iL = getById( 'infoL' );
    var iS = getById( 'infoS' );
    var iA = getById( 'infoA' );

    iL.style.backgroundColor = 'transparent';
    iS.style.backgroundColor = 'transparent';
    iA.style.backgroundColor = 'transparent';

    switch( g_calcType ){
        case "load":
            g_calcType="strength";
            getById( 'btnCalcType' ).innerText = "強度";
            if( !_v ){ g_focusInput = "strg1"; }
            iS.style.backgroundColor = '#111111';
        break;
        case "strength":
            g_calcType="average";
            getById( 'btnCalcType' ).innerText = "平均";
            if( !_v ){ g_focusInput = "average"; }
            iA.style.backgroundColor = '#111111';
        break;
        case "average":
            g_calcType="load";
            getById( 'btnCalcType' ).innerText = "荷重";
            if( !_v ){ g_focusInput = "load1"; }
            iL.style.backgroundColor = '#111111';
        break;
    }

    if( !_v ){
        fS( g_focusInput );
    }
}
//  クリア処理
//  2020/05/06
function update( _v ){

    getById( 'load1' ).value = _v;
    getById( 'load2' ).value = _v;
    getById( 'load3' ).value = _v;
    getById( 'strg1' ).value = _v;
    getById( 'strg2' ).value = _v;
    getById( 'strg3' ).value = _v;
    getById( 'average' ).value = _v;

    setWarn('load1', false);
    setWarn('load2', false);
    setWarn('load3', false);
    if(g_focusInput != 'average'){
        var le = g_focusInput.length - 1;
        var tmp = g_focusInput.slice( 0 , le ) + 1;
        g_focusInput = tmp;
    }
    fS( g_focusInput );
}
//  計算ここからスタート
//  2020/05/06
function calc( _v ){

    switch( g_focusInput ){
        case "load1":
        case "load2":
        case "load3":
            ltos();
            break;
        case "strg1":
        case "strg2":
        case "strg3":
            stol();
            break;
        case "average":
            sRandom();
            break;
    }
    if( g_focusInput != 'average' ){
        getById( 'average' ).value =  ave();
    }
}
//  荷重　->　強度
function ltos(){

    var l1 = getById( 'load1' ).value;
    var l2 = getById( 'load2' ).value;
    var l3 = getById( 'load3' ).value;
    getById( 'strg1' ).value = calcF( l1 );
    getById( 'strg2' ).value = calcF( l2 );
    getById( 'strg3' ).value = calcF( l3 );
    var th = g_weight * 0.2;
    setWarn('load1', l1 !== '' && parseFloat(l1) < th);
    setWarn('load2', l2 !== '' && parseFloat(l2) < th);
    setWarn('load3', l3 !== '' && parseFloat(l3) < th);
}
//  強度　->　荷重
function stol(){

    var s1 = getById( 'strg1' ).value;
    var s2 = getById( 'strg2' ).value;
    var s3 = getById( 'strg3' ).value;
    var r1 = calcR(s1), r2 = calcR(s2), r3 = calcR(s3);
    getById( 'load1' ).value = r1;
    getById( 'load2' ).value = r2;
    getById( 'load3' ).value = r3;
    var th = g_weight * 0.2;
    setWarn('load1', r1 !== '' && parseFloat(r1) < th);
    setWarn('load2', r2 !== '' && parseFloat(r2) < th);
    setWarn('load3', r3 !== '' && parseFloat(r3) < th);
}


//  数字ボタン押したときの処理
//  2020/05/06
function append( _v ){

    switch( _v ){
    case 'CE':  //Clear Entry
        getById( g_focusInput ).value =  "";
        break;
    case 'BS':  //Back Space
        var tmp = getById( g_focusInput ).value.slice( 0, -1 ) ;
        getById( g_focusInput ).value = tmp;
        break;
    default:    //other numbers
        var tmp = getById( g_focusInput ).value;
        if( g_fg ) {

            getById( g_focusInput ).value = _v;    
            g_fg =0;

        }else{
            switch(g_focusInput){
                case 'load1':
                case 'load2':
                case 'load3':
                    if( (tmp + _v) <= g_weight ){   //足した後の値が荷重レンジをオーバーするようならば加算しない
                        getById( g_focusInput ).value = tmp + _v;
                    }     

                    break;
                case 'strg1':
                case 'strg2':
                case 'strg3':
                    if( calcR(tmp + _v) <= g_weight ){   //足した後の値が荷重レンジをオーバーするようならば加算しない
                        getById( g_focusInput ).value = tmp + _v;
                    }
                    break;
                case 'average':
                    if( calcR(tmp + _v) <= g_weight){   //足した後の値が荷重レンジをオーバーするようならば加算しない
                        getById( g_focusInput ).value = tmp + _v;
                    }

            }
        }
        break;
    }
    
    if( g_focusInput != 'average' ){
        calc();
    }

}
//  上下ポタンを押したときのフォーカス移動
//  2020/05/06
function focusMove( _v ){

    loadCheck();
    g_fg =1;

    var fiR = parseInt(g_focusInput.slice( -1 ));

    switch( _v ){
        case "fwd":
            if( fiR > 1){
                fiR = fiR - 1;
            }else{
                fiR = 3;
            };
        break;

        case "nxt":
            if( fiR < 3){
                fiR = fiR + 1;
            }else{
                fiR = 1;
            };
        break;
    }
    if( g_focusInput != 'average' ){
        g_focusInput = g_focusInput.slice( 0 , g_focusInput.length -1 ) +  fiR;
        fS( g_focusInput );
        calc();
    }else{
        calc();
    }
}
//  フォーカスを合わせる処理
//  2020/05/06
function fS( _v ){
    setBBW( _v );
    getById( _v ).focus();      //フォーカスを外すのは .blur();
    g_focusInput= _v;

    switch( _v ){
        case "load1":
        case "load2":
        case "load3":
        g_calcType = "average";
        break;
        case "strg1":
        case "strg2":
        case "strg3":
        g_calcType = "load";
        break;
        case "average":
        g_calcType = "strength";
        break;
    }
    calcTypeChange(1);
}

function setBBW( _v ){
    ['load1','load2','load3','strg1','strg2','strg3','average'].forEach(function(id){
        getById(id).style.borderBottomColor="#555555";
    });
    getById( _v ).style.borderBottomColor="#ffffff";
}


//  荷重から強度換算
//  2020/05/06
function calcF( _v ){
    if( _v ){
        var tmp = g_conv * _v ;
        return tmp.toPrecision(3);
    }else{
        return "";
    }
}
//  強度から荷重逆算
//  2020/05/06
function calcR( _v ){
    if( _v ){
        var tmp = _v / g_conv ;
        return tmp.toPrecision(3);
    }else{
        return "" ;
    }
}
//  強度ランダム
//  2020/05/08
function sRandom(){
    var tmp = 0;
    var av = parseFloat( getById( 'average' ).value );
    av = av.toPrecision(3);
    tmp = av * 10 / 100 ;

    var s1 = parseFloat( av ) + parseFloat(( Math.random() * tmp -( tmp / 2 )));
    var s2 = parseFloat( av ) + parseFloat(( Math.random() * tmp -( tmp / 2 )));
    var s3 = ( parseFloat( av ) * 3 ) - s1 - s2;

    getById( 'load1' ).value =  calcR( s1 );
    getById( 'load2' ).value =  calcR( s2 );
    getById( 'load3' ).value =  calcR( s3 );

    loadCheck();
    ltos();
    getById( 'average' ).value = ave();
    fS( g_focusInput )
}
//  強度平均値の算出 完成
//  2020/05/07
function ave() {
    var count =0;
    var s1 = parseFloat( getById( 'strg1' ).value );
    var s2 = parseFloat( getById( 'strg2' ).value );
    var s3 = parseFloat( getById( 'strg3' ).value );
    if( s1 ){ count += 1 ;}else{ s1 = 0 ;}
    if( s2 ){ count += 1 ;}else{ s2 = 0 ;}
    if( s3 ){ count += 1 ;}else{ s3 = 0 ;}

    var tmp = ( s1 + s2 + s3 ) / count;

    if( isNaN( tmp ) ){
        return "";
    }else{
        return  tmp.toPrecision(3);     //toPrecision(3)で有効数字三桁丸め
    }
}

function loadCheck(){
    try{
        for(var i =1 ; i<=3 ; i++){
            var lnum = "load" + i;
            var snum = "strg" + i;
            
            if( getById( lnum ).value != "" ){
                var lval = getById( lnum ).value;
                getById( lnum ).value = loadCheckChild( lval );
                lval = getById( lnum ).value;
                getById( snum ).value = calcF( lval );    
            }
        }
    }catch{
        alert("error in loadCheck. : " + lval);
    }
}

//  レンジと荷重、強度の関係をチェック
function loadCheckChild( _v ){//_v:荷重
    try{
        var tmp = _v;
        
        while( parseFloat(tmp) > parseFloat(g_weight) ){//不適切。要訂正
            
            switch( g_weight){
                case 100:
                    g_weight = 250;
                    loadRangeChange( g_weight );
                    break;
                case 250:
                    g_weight = 500;
                    loadRangeChange( g_weight );
                    break;
                case 500:
                    g_weight = 1000;
                    loadRangeChange( g_weight );
                    break;
                case 1000:
                    g_weight = 100;
                    loadRangeChange( g_weight );
                    break;
            }
        }

        if( tmp < g_weight * 0.2 ){  //准不適切。警告
            //警告文字色を赤にするか。

        }
        switch( g_weight ){
            case 100:
                tmp = roundLoad100( tmp );
                break;
            case 250:
                tmp = roundLoad250( tmp );
                break;
            case 500:
                tmp = roundLoad500( tmp );
                break;
            default:
                tmp = roundLoad1000( tmp );
        }
        return tmp;

    }catch{
        alert("error in loadCheckChild.---" + tmp);
        return tmp;
    }
}

//100の重りのときの荷重作成
function roundLoad1000( _v ){
    if( _v <= 1000 ){
        return Math.round( _v );
    }else{
        return _v;
    }
}

// g_weight:500 // round:0.5
//500の重りのときの荷重作成
function roundLoad500( _v ){
    if( _v < 10 ){
        return  (_v * 2).toPrecision(1) / 2;
    }else if( _v < 100 ){
        return  (_v * 2).toPrecision(3) / 2;//return  (_v *10 * 2).toPrecision(2) / 2 / 10;
    }else{
        return parseFloat(_v).toPrecision(3);
    }
}

// g_weight:250 // round:0.25
//250の重りのときの荷重作成
function roundLoad250( _v ){
    var dp = decimalPart( _v , 3 ) ;
    var int = _v - dp;
    tmp = Math.round(dp * 100 / 25) * 25 / 100;
    tmp = (tmp + int).toPrecision(3);
    return tmp;
}

//100の重りのときの荷重作成
function roundLoad100( _v ){
    var tmp = parseFloat( _v );
    if( tmp < 1 ){
        tmp = tmp.toPrecision(1);
    }else if( tmp < 10 ){
        tmp = tmp.toPrecision(2);
    }else {
        tmp = tmp.toPrecision(3);
    }
    return tmp;
}

//小数点以下だけ返す
function decimalPart(num, decDigits){
    var decPart = num - ((num >= 0) ? Math.floor(num) : Math.ceil(num));
    return decPart.toFixed(decDigits);
}

//Debug用時間計測
function timeNow(){
    DD = new Date();
    Hours = DD.getHours();
    Minutes = DD.getMinutes();
    Seconds = DD.getSeconds();
    return  Hours + "時" + Minutes + "分" + Seconds + "秒";
}
//Func1ボタン
function copyToClipboard() {
        // コピー対象をJavaScript上で変数として定義する
        var body = "荷重　強度\n"
        body += getById('load1').value + '　' + getById('strg1').value + '\n';
        body += getById('load2').value + '　' + getById('strg2').value + '\n' ;
        body += getById('load3').value + '　' + getById('strg3').value + '\n\n' + "平均値:" ;
        body += getById('average').value + 'N/㎟\n' ;
        // コピー対象のテキストを選択する
        navigator.clipboard.writeText(body).then(() => alert("コピーしました"));
}

//Func2ボタン
function copyToEmail(){
    // コピー対象をJavaScript上で変数として定義する
    var address, subject, body, hiddenData;
    var sendmail = getById('copybtn2')
    var txtData = "荷重　強度<br>"
    txtData += getById('load1').value + '　' + getById('strg1').value + '<br>';
    txtData += getById('load2').value + '　' + getById('strg2').value + '<br>' ;
    txtData += getById('load3').value + '　' + getById('strg3').value + '<br><br>' + "平均値:" ;
    txtData += getById('average').value + 'N/㎟<br>' ;

    address1 = '';
    address2 = '';
    address = address1+address2;
    subject = '強度試験結果:'+getDateAndTime();

    location.href = 'mailto:' + address + '?subject=' + subject + '&body=' + txtData;

};
//func3ボタン
function SoundOnOff(){
    if( g_sound == 1 ){
        g_sound = 0;
    }else{
        g_sound = 1;
    }
    updateSoundIcon();
}

function updateSoundIcon(){
    document.getElementById('spkOn').setAttribute('display',  g_sound ? '' : 'none');
    document.getElementById('spkOff').setAttribute('display', g_sound ? 'none' : '');
}

//func4ボタン: CSV出力
function csvExport(){
    var entry = {
        date:    getDateAndTime(),
        load1:   getById('load1').value,
        strg1:   getById('strg1').value,
        load2:   getById('load2').value,
        strg2:   getById('strg2').value,
        load3:   getById('load3').value,
        strg3:   getById('strg3').value,
        average: getById('average').value
    };
    var history = JSON.parse(localStorage.getItem('sCalcHistory') || '[]');
    history.push(entry);
    localStorage.setItem('sCalcHistory', JSON.stringify(history));

    var csv = '﻿日時,荷重1(kN),強度1(N/㎟),荷重2(kN),強度2(N/㎟),荷重3(kN),強度3(N/㎟),平均(N/㎟)\n';
    history.forEach(function(e){
        csv += e.date+','+e.load1+','+e.strg1+','+e.load2+','+e.strg2+','+e.load3+','+e.strg3+','+e.average+'\n';
    });
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'sCalc_'+entry.date.replace(/[/:]/g,'-')+'.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function setWarn(id, isWarn){
    var el = getById(id);
    el.style.backgroundColor = isWarn ? '#1a1a1a' : '';
    el.style.color           = isWarn ? '#A6BD9F' : '';
}

//日付と時間を yyyy/mm/dd_HH:MM 書式で返す
function getDateAndTime(){

    var hiduke=new Date(); 
    var jikan= new Date();
    
    var year = hiduke.getFullYear();
    var month = ('0'+(hiduke.getMonth()+1)).slice(-2);
    var day = ('0'+(hiduke.getDate())).slice(-2);
    var hour = ('0'+(jikan.getHours())).slice(-2);
    var minute = ('0'+(jikan.getMinutes())).slice(-2);

    var res = year+"/"+month+"/"+day+"_"+hour+":"+minute;
    return res;
}

/*     function orangeLCD( _v ){
        var aColor ='#CE7D24';
        var bColor ='#A6BD9F';
        if( _v ){
            
            getById( 'lcd' ).style.backgroundColor = aColor;
            getById( 'info1000' ).style.color =aColor;
            getById( 'info0500' ).style.color =aColor;
            getById( 'info0250' ).style.color =aColor;
            getById( 'info0100' ).style.color =aColor;
            getById( 'infoL' ).style.color =aColor;
            getById( 'infoS' ).style.color =aColor;
            getById( 'infoA' ).style.color =aColor;
        }else{
            getById( 'lcd' ).style.backgroundColor =bColor;
            getById( 'info1000' ).style.color =bColor;
            getById( 'info0500' ).style.color =bColor;
            getById( 'info0250' ).style.color =bColor;
            getById( 'info0100' ).style.color =bColor;
            getById( 'infoL' ).style.color =bColor;
            getById( 'infoS' ).style.color =bColor;
            getById( 'infoA' ).style.color =bColor;
        } 


    }*/
