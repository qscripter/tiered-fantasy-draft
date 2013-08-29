Handlebars.registerHelper('times', function(context, options) {
	var ret = "";
	for (var i=0; context > i; i++) {
		ret = ret + options.fn(this);
	}
	return ret;
});