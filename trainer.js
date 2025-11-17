
let currentType = "";
function generate(){
  const patterns=[
    {type:"impulse",p:"↑↑↑"},
    {type:"imp_pull",p:"↑↑↑↓↑↑"},
    {type:"double",p:"↑↓↑"},
    {type:"break",p:"→→→↑↑↑"},
    {type:"stairs",p:"↑→↑→↑"},
    {type:"noise",p:"↑↓↑↓↑"},
    {type:"late",p:"↑↑↑↑↑"}
  ];
  let pick=patterns[Math.floor(Math.random()*patterns.length)];
  currentType=pick.type;
  document.getElementById("pattern").innerHTML=pick.p;
  document.getElementById("result").innerHTML="";
}
function check(ans){
  document.getElementById("result").innerHTML =
    ans===currentType ? "<span style='color:green'>Верно</span>" :
                        "<span style='color:red'>Неверно</span>";
}
