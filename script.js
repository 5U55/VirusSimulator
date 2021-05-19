var population;
var peopleArray = [];
var infectedPopulation;
var initialInfections;
var days;
var r0;
var contStart;
var contEnd;
var deathRate;
var vaccinationRate;
var immunePopulation;
var immunityStart;
var dailyInfections;
var dailyActive;
var dailyDeaths;
var immunityLength;
var immuneArray;
var showImmune;
var showActive;

class person {
  constructor() {
    this.isInfected = false;
    this.IsDead = false;
    this.IsImmune = false;
  }
  get IsInfected() {
    return this.isInfected;
  }
  set IsInfected(x) {
    this.isInfected = x;
  }
  get IsDead() {
    return this.isDead;
  }
  set IsDead(x) {
    this.isDead = x;
  }
  get IsContagious() {
    return this.isContagious;
  }
  set IsContagious(x) {
    this.isContagious = x;
  }
  get InfecDate() {
    return this.infecDate;
  }
  set InfecDate(x) {
    this.infecDate = x;
  }
  get IsImmune() {
    return this.isImmune;
  }
  set IsImmune(x) {
    this.isImmune = x;
  }
}

function graph(day, cases, color, line, prevCases, text) {
  var canvas = document.getElementById("graph");
  var ctx = canvas.getContext("2d");
  var prevx = ((canvas.width-60) / days) * (day-1)+60;
  var x = ((canvas.width-60) / days) * day+60;
  var prevy = ((canvas.height-30)/ (population)) * prevCases+30;
  var y = ((canvas.height-30) / (population)) * cases+30;
  ctx.beginPath();
  ctx.strokeStyle = color;
  if(text == true) {
    if(screen.width>screen.height) {
      ctx.font = "12px"+" monospace";
    } else {
      ctx.font = "22px"+" monospace";
    }
    ctx.fillText(cases, canvas.width-(canvas.width/prevCases+20), (canvas.height-(canvas.height/day))+20)
    return
  }
  if(line == true){
    ctx.moveTo(x, canvas.height-y);
  ctx.lineTo(x, canvas.height);
    
  } else {
  ctx.moveTo(prevx, (canvas.height+3) - prevy);
  ctx.lineTo(x, (canvas.height+3) - y);
  }
  ctx.stroke();
}

function submit() {
  $("form[name='fields']").validate().destroy();
  validate("form[name='fields']");
  console.log($("form[name='fields']").valid());
  if($("form[name='fields']").valid()==false){return}
  document.getElementById("loading").style.display="inline-block";
  dailyInfections = [];
  dailyActive = [];
  showImmune = $("#showImmune").prop("checked");
  showActive = $("#showActive").prop("checked");
  dailyDeaths = [];
  immuneArray = [];
  immunePopulation = 0;
  document.getElementById("calculations").innerHTML = "";
  days = document.getElementById("days").value;
  if (document.getElementById("immuneLength").value == "") {
    immunityLength = days;
  } else {
    immunityLength = document.getElementById("immuneLength").value;
  }
  vaccinationRate = document.getElementById("vaccRate").value;
  peopleArray = [];
  immunityStart = $("#immuneStart").val();
  population = $("#population").val();
  r0 = $("#r0").val();
  initialInfections = $("#initialInfections").val();
  deathRate = $("#death").val();
  contStart = $("#contstart").val();
  contEnd = $("#contend").val();
  infectedPopulation = initialInfections;
  for (var i = 0; i < population; i++) {
    peopleArray.push(new person());
  }
  for (var i = 0; i < initialInfections; i++) {
    peopleArray[i].IsInfected = true;
    peopleArray[i].InfecDate = 0;
  }
  setTimeout(function(){infectPopulation();
  document.getElementById("loading").style.display="none";
                       }, 20);
}

function infectPopulation() {
  var totalInfections = initialInfections;
  document.getElementById("calculations").innerHTML = "<div class='tableBox'><div class='table tableDays' style='background-color:#C4C4C4'>Day</div>"
    +"<div class='table tableInfections' style='background-color:#40A0FF'>"+ "Infections" 
      +"</div><div class='table tableDeaths' style='background-color:tomato'>Deaths</div><div class='table tableActive' style='background-color:orange'>Active</div>"
    +"<div class='table tableImmune' style='background-color:springgreen'>Immune</div></div>";
  for (var dayNum = 0; dayNum < days; dayNum++) {
    var livingArray = [];
    var deadOnes = 0;
    var infectedOnes = 0;
    var contagiousArray = [];
    for (var j = 0; j < peopleArray.length; j++) {
      if (peopleArray[j].IsInfected == true) {
        infectedOnes++;
      }
      if (peopleArray[j].IsDead == false) {
        livingArray.push(peopleArray[j]);
      } else {
        deadOnes++;
      }
    }
    var immuneOnes = 0;
    if (dayNum == immunityStart) {
      var length = livingArray.length;
      if(vaccinationRate != 0) {
        immunePopulation++;
      }
      for (var j = 1; j < livingArray.length*(vaccinationRate/100); j++){
        livingArray[length - j].IsImmune = true;
        livingArray[length-j].InfecDate = dayNum;
        immunePopulation++;
        console.log(immunePopulation);
      }
      if (vaccinationRate != 0 && immunityStart != 0){
        graph(dayNum, infectedOnes, "springgreen", true);
      }
    }
    for (var j = 0; j < livingArray.length; j++) {
      var liveGuy = livingArray[j];
      if (liveGuy.DeathDay <= dayNum) {
        liveGuy.IsDead = true;
        liveGuy.IsContagious = false;
        continue;
      }

      if (
        dayNum - liveGuy.InfecDate >= contStart &&
        dayNum - liveGuy.InfecDate <= contEnd
      ) {
        liveGuy.IsContagious = true;
        contagiousArray.push(liveGuy);
      } else {
        liveGuy.IsContagious = false;
      }
      if (dayNum-(liveGuy.InfecDate) <= immunityLength){
        immuneOnes++
      }
    }
    immuneArray.push(immuneOnes);
    dailyInfections.push(infectedOnes);
    dailyDeaths.push(deadOnes);
    dailyActive.push(contagiousArray.length);
    for (var k = 0; k < contagiousArray.length; k++) {
      if (Math.floor((Math.random() * (contEnd - contStart)) / r0) < 1) {
        //this gets a random number and compares it with a the 1/x chance of getting and if x is 1 then it is true
        var rand = Math.floor(Math.random() * livingArray.length);
        var victim = livingArray[rand];
        if ((victim.IsInfected == false || dayNum-victim.InfecDate > immunityLength)) {
          if (Math.random() < deathRate / 100) {
            victim.DeathDay =
              dayNum + Math.floor(Math.random() * (contEnd - contStart));
          }
          victim.InfecDate = dayNum;
          victim.IsInfected = true;
          totalInfections++;
        }
      }
    }
  }
  for (var i=0; i<dayNum; i++){
    graph(i, dailyInfections[i], "#0000FF", false, Math.abs(dailyInfections[i-1]));
    graph(i, dailyDeaths[i], "#FF0000", false, Math.abs(dailyDeaths[i-1]));
    if (showActive){graph(i, dailyActive[i], "orange", false, Math.abs(dailyActive[i-1]))};
    if (showImmune){
    graph(i, immuneArray[i], "springgreen", false, Math.abs(immuneArray[i-1]))};
    $("#calculations").append("<div class='tableBox'><div class='table tableDays'>"+ (i+1) +
      "</div><div class='table tableInfections'>"+ dailyInfections[i] 
      +"</div><div class='table tableDeaths'>"+dailyDeaths[i]+"</div><div class='table tableActive'>"+dailyActive[i]+"</div><div class='table tableImmune'>"
    +immuneArray[i]+"</div></div>");
  }
  $("#calculations").show()
  graph(1, population, "black", false, 1.033, true);
  graph(1+(1/3), population*(3/4), "black", false, 1.033, true);
  graph(2, population*0.5, "black", false, 1.033, true);
  graph(4, population*0.25, "black", false, 1.033, true);
  graph(12, 0, "black", false, 1.05, true);
  graph(12, days*0.25, "black", false, 1+(1/3), true);
  graph(12, days*0.5, "black", false, 2, true);
  graph(12, days*0.75, "black", false, 4, true);
  graph(12, days, "black", false, 20, true);
  //graph(0, 200000, "black", true, 1, false);
  var neverInfected = 0;
  var sucepNeverInfected = 0;
  for(var i =0; i<livingArray.length; i++) {
    if(livingArray[i].isInfected == false){
      neverInfected++;
      if(livingArray[i].isImmune == false) {
        sucepNeverInfected++;
      }
    }
  }
  $("#summary").show()
  $("#immunePopulation").html(immunePopulation);
  $("#neverInfected").html(neverInfected);
  $("#sucepNeverInfected").html(sucepNeverInfected);
  $("#totalInfections").html(totalInfections);
  $("#totalPeopleInfections").html(infectedOnes);
  $("#initialInfectionsSummary").html(initialInfections);
  $("#netInfectionsSummary").html(totalInfections-initialInfections);
  $("#netPeopleInfectionsSummary").html(infectedOnes-initialInfections);
  $("#totalDeaths").html(dailyDeaths[dayNum-1]);
  }

function clearGraph() {
  var canvas = document.getElementById("graph");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  $("#calculations").hide();
  $("#summary").hide();
}

var diseasesInfo = [["COVID-19", 3, 3, 20, 1, days], ["Measles", 15, 7, 14, 15, days], ["Chicken Pox", 11, 10, 21, 0.3, days], 
                    ["SARS", 1, 5, 20, 14, days], ["MERS", 0.5, 5, 20, 45, days], 
                    ["Black Death", 3, 4, 20, 20], ["Seasonal Flu", 1.3, 2, 20, 0.1, 120]];

function CreateDiseaseSelect() {
  var x = document.getElementById("diseaseSelect");
  var firstOption = document.createElement("option");
  firstOption.text = "- - Diseases - -";
  x.add(firstOption);
  for (var i = 0; i < diseasesInfo.length; i++) {
    var option = document.createElement("option");
    option.text = diseasesInfo[i][0];
    option.value =i;
    x.add(option);
  }
}

CreateDiseaseSelect();

function valueChange(x) {
  if(isFinite(x) == true) {
    $("#r0").val(diseasesInfo[x][1]); 
    $("#contstart").val(diseasesInfo[x][2]);
    $("#contend").val(diseasesInfo[x][3]);
    $("#death").val(diseasesInfo[x][4]);
    $("#immuneLength").val(diseasesInfo[x][5]);
  }
}

function validate(form) {
 $(form).validate({
   rules:{
     population: {
       required: true,
       min: JSON.parse($("#initialInfections").val())
     },
     initialInfections:{
       required: true, 
       max: JSON.parse($("#population").val())
     },
     days: {
       required: true, 
       min: 0
     }, 
     r0: {
       required: true, 
       min: 0,
       max: JSON.parse($("#population").val())
     },
     contStart: {
       required: true, 
       min: 0,
       max: JSON.parse($("#contend").val())
     },
     contEnd: {
       required: true, 
       min: JSON.parse($("#contstart").val()),
       max: JSON.parse($("#days").val())
     },
     vaccRate: {
       required: true, 
       min: 0, 
       max: 100
     },
     immuneStart: {
       required: true,
       min: 0,
       max: JSON.parse($("#days").val())
     }, 
     immuneLength: {
       required: false,
       min: 0,
    },
     deathRate: {
     required: true,
     min: 0
   }
 },
   messages: {
     population: {
       required: "Please enter a value for the population",
       min: "Population must be greater than (or equal to) initial infections"
     },
     initialInfections:{
       required: "Please enter a value for initial infections", 
       max: "Initial infections must be less than (or equal to) population"
     },
     days: {
       required: "Please enter a value for the days", 
       min: "Days must be a non-negative number"
     },
     r0:{
       required: "Please enter a value for the R<sub>0</sub>",
       min: "R<sub>0</sub> must be a non-negative number",
       max: "R<sub>0</sub> must be less than the population"
     },
     contStart: {
       required: "Please enter a value for the start of the contagious period", 
       min: "Contagious start must be a non-negative number",
       max: "Contagious start must be less than (or equal to) the contagious end"
     },
     contEnd: {
       required: "Please enter a value for the end of the contagious period", 
       min: "Contagious end must be greater than (or equal to) the contagious start",
       max: "Contagious end must be less than (or equal to) the number of days"
     },
     vaccRate: {
       required: "Please enter a value for the end of the vaccination rate", 
       min: "Vaccination rate must be a non-negative number", 
       max: "Vaccination rate must be less than (or equal to) 100"
     },
     immuneStart: {
       required: "Please enter a value for the end of the vaccination day",
       min: "Vaccination day must be a non-negative number",
       max: "Vaccination rate must be less than (or equal to) the number of days"
     },
     immuneLength: {
       min: "Immunity length must be a non-negative number",
    },
     deathRate: {
     required: "Please enter a value for the end of the fatality rate",
     min: "Fatality rate must be a non-negative number"
   }
   }, 
   errorElement:"div",
   errorLabelContainer: ".errorTxt"
 })
}


$(".input").change(function() {$("form[name='fields']").validate().destroy();
                               validate("form[name='fields']");});
