define([
    'js/views/baseview', 'underscore', 'underscore.string', 'jquery', 'gettext'
],
function(BaseView, _, str, $, gettext) {
    'use strict';
    _.str = str; // used in template
    var GroupEdit = BaseView.extend({
        tagName: 'li',
        events: {
            'change .group-name': 'changeName',
            'focus .group-name': 'onFocus',
            'blur .group-name': 'onBlur'
        },

        className: function() {
            return 'field-group group group' + this.model.collection.indexOf(
                this.model
            );
        },

        initialize: function() {
            this.template = this.loadTemplate('group-edit');
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            this.$el.html(this.template({
                name: this.model.escape('name'),
                allocation: this.getAllocation(),
                index: this.model.collection.indexOf(this.model),
                error: this.model.validationError
            }));
            return this;
        },

        changeName: function(event) {
            if(event && event.preventDefault) { event.preventDefault(); }
            this.model.set({
                name: this.$('.group-name').val()
            }, {silent: true});

            return this;
        },

        getAllocation: function() {
            return Math.floor(100 / this.model.collection.length);
        },

        onFocus: function () {
            this.$el.closest('.groups-fields').addClass('is-focused');
        },

        onBlur: function () {
            this.$el.closest('.groups-fields').removeClass('is-focused');
        }
    });

    return GroupEdit;
});
