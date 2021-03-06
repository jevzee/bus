var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),

    Schedule = require("./collection.schedule.js"),
    Time = require("./model.time.js");
    TimeView = require("./view.time.js");

module.exports = Backbone.View.extend({
  el: $("#schedule"),

  initialize: function(times) {
    var _this = this;

    this.times = times;
    this.collection = new Schedule();
    this.syncCollection();

    this.render();

    this.on("change:filterType", this.filterByType, this);
    this.collection.on("reset", this.render, this);
  },

  syncCollection: function () {
    var _this = this;
    this.collection.fetch({reset: true, silent: true});

    _.each(this.times, function (attrs) {
      var existing = _this.collection.get(attrs.id);
      if (!existing) {
        // only add/update non-existing items
        _this.collection.create(attrs);
      }
    });
  },

  render: function() {
    var _this = this,
        currentTime,
        laterTrips;

    this.$el.empty();

    currentTime = this.zeroPadded( (new Date()).getHours()) +
                  this.zeroPadded( (new Date()).getMinutes() );

    laterTrips = _.chain(this.collection.models)
      .filter(function (item) {
        return item.attributes.dep.replace(":", "") > currentTime;
      })
      .take(3)
      .pluck("id")
      .value();

    _.each(this.collection.models, function(item) {
      if(_.contains(laterTrips, item.id)) {
        item.set("active", true);
      }
      _this.renderTime(item);
    }, this);
  },

  renderTime: function(item) {
    var timeView = new TimeView({
      model: item
    });
    this.$el.append(timeView.render().el);
  },

  filterByType: function() {
    this.collection.fetch({reset: true, silent: true});

    if (this.filterType !== "all") {
        var filterType = this.filterType,
            filtered = _.filter(this.collection.models, function (item) {
              return item.get("type").toLowerCase() === filterType;
        });
        this.collection.reset(filtered);
    }
  },

  zeroPadded: function (number) {
    return ("0" + number).slice(-2);
  }
});
