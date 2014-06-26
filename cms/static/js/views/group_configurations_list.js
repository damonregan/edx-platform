define([
    'js/views/baseview', 'jquery', 'js/views/group_configuration_details',
    'js/views/group_configuration_edit'
], function(
    BaseView, $, GroupConfigurationDetailsView, GroupConfigurationEditView
) {
    'use strict';
    var GroupConfigurationsList = BaseView.extend({
        tagName: 'div',
        className: 'group-configurations-list',
        events: {
            'click .new-button': 'addOne'
        },

        initialize: function() {
            this.emptyTemplate = this.loadTemplate('no-group-configurations');
            this.listenTo(this.collection, 'all', this.render);
        },

        render: function() {
            var configurations = this.collection;
            if(configurations.length === 0) {
                this.$el.html(this.emptyTemplate());
            } else {
                var frag = document.createDocumentFragment();

                configurations.each(function(configuration) {
                    var view;

                    if (configuration.get('editing')) {
                        view = new GroupConfigurationEditView({
                            model: configuration
                        });
                    } else {
                        view = new GroupConfigurationDetailsView({
                            model: configuration
                        });
                    }

                    frag.appendChild(view.render().el);
                });

                this.$el.html([frag]);
            }

            return this;
        },

        addOne: function(event) {
            if(event && event.preventDefault) { event.preventDefault(); }
            this.collection.add([{editing: true}]);
        }
    });

    return GroupConfigurationsList;
});
