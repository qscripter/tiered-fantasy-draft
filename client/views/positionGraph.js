function buildChartData (team, league) {
	if (team && league) {
		var positions = _.map(league.positions, function(item){
			return item.position;
		});
		console.log(positions);
		data = []
		for (var j=0; j < positions.length; j++) {
			var positionContracts = _.filter(team.roster, function (item) {
				var player = Players.findOne(item.player_id);
				return player.position == positions[j];
			});
			var contractsTotal = _.reduce(positionContracts, function (memo, contract) {
				var currentSalary = _.find(contract.salaryAllocation, function (item) {
					return contract.currentYear == item.year;
				})
				return memo + currentSalary.salary + currentSalary.bonus;
			}, 0);
			data.push(contractsTotal);
		}
		console.log(data);

		var graphData = {
		    labels: positions,
		    datasets: [
		        {
		            label: "Position Spending",
		            fillColor: "rgba(151,187,205,0.5)",
		            strokeColor: "rgba(151,187,205,0.8)",
		            highlightFill: "rgba(151,187,205,0.75)",
		            highlightStroke: "rgba(151,187,205,1)",
		            data: data
		        }
		    ]
		}
		return graphData;
	}
}

function drawChart(team, league) {
	var ctx = document.getElementById("myChart").getContext("2d");
	var options = {
	    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
	    scaleBeginAtZero : true,

	    //Boolean - Whether grid lines are shown across the chart
	    scaleShowGridLines : true,

	    //String - Colour of the grid lines
	    scaleGridLineColor : "rgba(0,0,0,.05)",

	    //Number - Width of the grid lines
	    scaleGridLineWidth : 1,

	    //Boolean - If there is a stroke on each bar
	    barShowStroke : true,

	    //Number - Pixel width of the bar stroke
	    barStrokeWidth : 2,

	    //Number - Spacing between each of the X value sets
	    barValueSpacing : 5,

	    //Number - Spacing between data sets within X values
	    barDatasetSpacing : 1,

	    responsive: true,

	    //String - A legend template
	    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	}

	data = buildChartData(team, league);
	var myBarChart = new Chart(ctx).Bar(data, options);
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