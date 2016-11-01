import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Payment} from '../../common/collections/payment.js';

Meteor.publish('dental.payment', function dentalPayment() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return Payment.find();
});
