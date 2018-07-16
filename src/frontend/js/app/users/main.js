'use strict';

const Mn         = require('backbone.marionette');
const UserModel  = require('../../models/user');
const Api        = require('../api');
const Controller = require('../controller');
const ListView   = require('./list/main');
const template   = require('./main.ejs');
const ErrorView  = require('../error/main');

module.exports = Mn.View.extend({
    id:       'users',
    template: template,

    ui: {
        list_region: '.list-region',
        add:         '.add-item',
        dimmer:      '.dimmer'
    },

    regions: {
        list_region: '@ui.list_region'
    },

    events: {
        'click @ui.add': function (e) {
            e.preventDefault();
            Controller.showUserForm(new UserModel.Model());
        }
    },

    onRender: function () {
        let view = this;

        Api.Users.getAll(['permissions'])
            .then(response => {
                if (!view.isDestroyed() && response && response.length) {
                    view.showChildView('list_region', new ListView({
                        collection: new UserModel.Collection(response)
                    }));
                }
            })
            .catch(err => {
                view.showChildView('list_region', new ErrorView({
                    code:      err.code,
                    message:   err.message,
                    retry:     function () { Controller.showUsers(); }
                }));

                console.error(err);
            })
            .then(() => {
                view.ui.dimmer.removeClass('active');
            });
    }
});