var positions = [
	{
		position: 'QB',
		background: '#428bca',
		border: '#357ebd'
	},
	{
		position: 'WR',
		background: '#5cb85c',
		border: '#4cae4c'
	},
	{
		position: 'RB',
		background: '#d9534f',
		border: '#d43f3a'
	},
	{
		position: 'TE',
		background: '#5bc0de',
		border: '#46b8da'
	},
	{
		position: 'KK',
		background: '#f0ad4e',
		border: '#eea236'
	},
	{
		position: 'ST',
		background: '#c32e9b',
		border: '#a32080'
	}
]

function buildChartData (team, league) {
	if (team && league) {
		salaryTotal = 100;
		data = []
		for (var j=0; j < positions.length; j++) {
			var positionContracts = _.filter(team.roster, function (item) {
				var player = Players.findOne(item.player_id);
				return player.position == positions[j].position;
			});
			var contractsTotal = _.reduce(positionContracts, function (memo, contract) {
				var currentSalary = _.find(contract.salaryAllocation, function (item) {
					return contract.currentYear == item.year;
				})
				return memo + currentSalary.salary + currentSalary.bonus;
			}, 0);
			salaryTotal -= contractsTotal;
			data.push({
				value: contractsTotal,
				color: positions[j].background,
				highlight: positions[j].border,
				label: positions[j].position
			});
		}
		data.push({
				value: salaryTotal,
				color: "#7B13B5",
				highlight: "#5D078D",
				label: "Available"
			});
		return data;
	}
}

function drawChart(team, league) {
	var ctx = document.getElementById("myChart").getContext("2d");
	var options = {
		responsive: true,
	    //Boolean - Whether we should show a stroke on each segment
	    segmentShowStroke : true,

	    //String - The colour of each segment stroke
	    segmentStrokeColor : "#fff",

	    //Number - The width of each segment stroke
	    segmentStrokeWidth : 2,

	    //Number - The percentage of the chart that we cut out of the middle
	    percentageInnerCutout : 0, // This is 0 for Pie charts

	    //Number - Amount of animation steps
	    animationSteps : 100,

	    //String - Animation easing effect
	    animationEasing : "easeOutBounce",

	    //Boolean - Whether we animate the rotation of the Doughnut
	    animateRotate : true,

	    //Boolean - Whether we animate scaling the Doughnut from the centre
	    animateScale : false,

	    //String - A legend template
	    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

	}

	data = buildChartData(team, league);
	var myPieChart = new Chart(ctx).Pie(data,options);
}





Template.positionGraph.rendered = function () {
	Deps.autorun(function () {
		var team = Teams.findOne(Session.get("selectedTeam"));
		var league =  Leagues.findOne();
		if (team && league) {
			drawChart(team, league);
		}
	});
	
}