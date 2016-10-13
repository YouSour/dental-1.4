import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Register} from '../../common/collections/register.js';

Meteor.publish('dental.registerById', function dentalRegister(registerId) {
    this.unblock();

    new SimpleSchema({
        registerId: {type: String}
    }).validate({registerId});

    if (!this.userId) {
        return this.ready();
    }

    return Register.find({_id: registerId});
});
