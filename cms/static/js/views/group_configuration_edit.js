define([
    'js/views/baseview', 'underscore', 'jquery', 'js/views/group_edit',
    'js/views/feedback_notification'
],
function(BaseView, _, $, GroupEditView, NotificationView) {
    'use strict';
    var GroupConfigurationEdit = BaseView.extend({
        tagName: 'section',
        className: 'group-configuration',
        events: {
            'change .group-configuration-name-input': 'setName',
            'change .group-configuration-description-input': 'setDescription',
            'focus .input-text': 'onFocus',
            'blur .input-text': 'onBlur',
            'submit': 'setAndClose',
            'click .action-cancel': 'cancel'
        },

        initialize: function() {
            var groups;

            this.template = this.loadTemplate('group-configuration-edit');
            this.listenTo(this.model, 'invalid', this.render);
            groups = this.model.get('groups');
            this.listenTo(groups, 'add', this.addOne);
            this.listenTo(groups, 'reset', this.addAll);
            this.listenTo(groups, 'all', this.render);
        },

        render: function() {
            this.$el.html(this.template({
                id: this.model.get('id'),
                uniqueId: _.uniqueId(),
                name: this.model.escape('name'),
                description: this.model.escape('description'),
                error: this.model.validationError
            }));
            this.addAll();

            return this;
        },

        addOne: function(group) {
            var view = new GroupEditView({ model: group });
            this.$('ol.groups').append(view.render().el);

            return this;
        },

        addAll: function() {
            this.model.get('groups').each(this.addOne, this);
        },

        setName: function(event) {
            if(event && event.preventDefault) { event.preventDefault(); }
            this.model.set(
                'name', this.$('.group-configuration-name-input').val(),
                { silent: true }
            );
        },

        setDescription: function(event) {
            if(event && event.preventDefault) { event.preventDefault(); }
            this.model.set(
                'description',
                this.$('.group-configuration-description-input').val(),
                { silent: true }
            );
        },

        setValues: function() {
            this.setName();
            this.setDescription();
            _.each(this.$('li'), function(li, i) {
                var group = this.model.get('groups').at(i);

                if(group) {
                    group.set({
                        'name': $('.group-name', li).val()
                    });
                }
            }.bind(this));

            return this;
        },

        setAndClose: function(event) {
            if(event && event.preventDefault) { event.preventDefault(); }

            this.setValues();
            if(!this.model.isValid()) {
                return false;
            }

            var saving = new NotificationView.Mini({
                title: gettext('Saving') + '&hellip;'
            }).show();

            this.model.save({}, {
                success: function() {
                    this.model.setOriginalAttributes();
                    this.close();
                }.bind(this),
                complete: function() {
                    saving.hide();
                }
            });
        },

        cancel: function(event) {
            if(event && event.preventDefault) { event.preventDefault(); }

            this.model.reset();
            return this.close();
        },

        close: function() {
            var groupConfigurations = this.model.collection;

            this.remove();
            if(this.model.isNew()) {
                // if the group configuration has never been saved, remove it
                groupConfigurations.remove(this.model);
            }

            // don't forget to tell the model that it's no longer being edited
            this.model.set('editing', false);
            return this;
        },

        onFocus: function (event) {
            $(event.target).parent().addClass('is-focused');
        },

        onBlur: function (event) {
            $(event.target).parent().removeClass('is-focused');
        }
    });

    return GroupConfigurationEdit;
});
