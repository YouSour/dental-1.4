import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Register} from '../../common/collections/register.js';

Meteor.publish('dental.register', function dentalRegister() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return Register.find();
});
