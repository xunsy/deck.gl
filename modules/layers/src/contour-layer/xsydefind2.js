export  function edgeJoint({contourSegments,
    gridSize
    }){
        let contourData=contourSegments;

    let _Data=[];//最终的目标数组
    let _countsdata=contourData//.slice(0,data.length);//缓冲的元数据数组
    let griddata=[];//最终这个数据是一个栈 栈中每一个元素指向一个数组
    let threshold;
    for(let i=0;i<=gridSize[1];i++){
        let aa=[];
        griddata.push(aa);
    }

    let _counter=[];
    let datalengh=_countsdata.length;//数组的长度
    /*console.log("datalengh"+datalengh);
    console.log(data);*/
    let startX=0.0,startY=0.0,endX=0.0,endY=0.0;//坐标点值
    //遍历所有的边  根据格子的y值将所有边划分到
   for(let i=0;i<datalengh;i++){
       griddata[_countsdata[i].ordery+1].push(_countsdata[i]);
    }

   

    let aa,bb;
    /** _countsdata[j].falge  为1 表示该条边没有被收录到某一个多边形中
     * 
     */
    /*console.log("griddata: ",griddata);
    console.log("datalengh : "+datalengh);*/
    //debugger;
   
    for(let xsyi=0;xsyi<datalengh;xsyi++){
        
        if(_countsdata[xsyi].falge==1){
            let XMAX=-2,YMAX=-2,XMIN=Number.POSITIVE_INFINITY,YMIN=Number.POSITIVE_INFINITY;
            //取第一条边  将两个端点放入 _counter中
            startX=_countsdata[xsyi].start[0];
            startY=_countsdata[xsyi].start[1];
            endX=_countsdata[xsyi].end[0];
            endY=_countsdata[xsyi].end[1];
            //XMIN=endX<startX?endX:startX;
            _countsdata[xsyi].falge=0;//这条边的标志位置设置为0
            threshold=_countsdata[xsyi].threshold;
            _counter.push([startX,startY]);
            _counter.push([endX,endY]);
           
          //取得第一条边 所在的网格栈中的索引
            let buffer_i=_countsdata[xsyi].ordery+1;
            for(let k=-2;k<3;k++){//线段所在的行和上 下 一共三行都找一下

               if(buffer_i==0&&k==-2){ // 网格栈 比0小的不能越界  比上界大的不能越界
                continue;
               }
               else if(buffer_i==0&&k==-1){
                continue;
               }
               else if(buffer_i==1&&k==-2){
                continue;
               }
               if( (buffer_i==(gridSize[1]))&&k==1 ){
                 continue;
                }
                else if( (buffer_i==(gridSize[1]))&&k==2 ){
                    continue;;
                 }
                 else if( (buffer_i==(gridSize[1]-1))&&k==2 ){
                    continue;
                 }
                
              //获取起始边数据
               let yuanshuju;//=_countsdata[buffer_i];
               
                for(let j=0;j<griddata[buffer_i+k].length;j++){// j 小于为网格[索引] 数组的长度
                    //debugger;//刚进来的时候 i 的值不对
                    yuanshuju=griddata[buffer_i+k][j];
                    //console.log("griddata[_countsdata[buffer_i+k].ordery+1+k]: ",griddata[yuanshuju.ordery+1+k]);
                   if(yuanshuju.falge==1&&threshold===yuanshuju.threshold){
                      // console.log("xsy  zai j zhongjian ",griddata[_countsdata[i+k].ordery+1+k][j]);
                        aa=endX- yuanshuju.start[0];
                        aa=aa>0?aa:-aa;
                        bb=endY- yuanshuju.start[1];
                        bb=bb>0?bb:-bb;
                        if(aa<0.0000000000000005&&bb<0.0000000000000005){//0000 0000 0000 0001
                            yuanshuju.falge=0;
                          
                            YMIN=yuanshuju.endX<startX?endX:startX;


                            _counter.push([yuanshuju.end[0],yuanshuju.end[1]]);
                            endX=yuanshuju.end[0];
                            endY=yuanshuju.end[1];
                            buffer_i=yuanshuju.ordery+1;
                            j=0;
                            k=-2;
                            break ;
                           
                            
                        }
                    }
                }
                continue;
            }
           
            _counter.push([startX,startY]);
            _Data.push({WEIGHT:threshold,counter:_counter});
            _counter=[];
            
        }
       
        
    }
    //console.log("xsy definde2 ----",_Data.length);
    //let a_Data=JSON.stringify(_Data);
    //console.log("end data a_Data: ",a_Data);
    return _Data;
    
}
